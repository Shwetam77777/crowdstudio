import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";

const JAM_ROOM = "jam-room";
const CHAT_HISTORY_LIMIT = 50;
const CHAT_MIN_INTERVAL_MS = 500; // per-socket flood guard
const CHAT_MAX_LEN = 300;
const REACT_MIN_INTERVAL_MS = 300; // per-socket flood guard for reactions
const REACTION_TYPES = ["fire", "music"] as const;
type ReactionType = (typeof REACTION_TYPES)[number];

interface PresenceUser {
  socketId: string;
  username: string;
  inJamRoom: boolean;
  lastMessageAt: number;
  lastReactionAt: number;
}

interface ChatMessage {
  id: string;
  username: string;
  body: string;
  at: string;
}

// In-memory presence + chat history. Good enough for a single-instance
// deploy; swap for a Redis adapter (both for Socket.io's adapter and for
// this state) if scaling to multiple server instances.
const online = new Map<string, PresenceUser>();
const chatHistory: ChatMessage[] = [];
// Live, ephemeral reaction counts per track — this is intentionally NOT
// persisted to the database. It's a "how is the room feeling right now"
// signal (resets when the server restarts / nobody's viewing), distinct
// from the permanent, DB-backed Like count that drives the leaderboard.
const trackReactions = new Map<string, Record<ReactionType, number>>();

function trackRoom(trackId: string) {
  return `track:${trackId}`;
}

function getReactionCounts(trackId: string): Record<ReactionType, number> {
  return trackReactions.get(trackId) ?? { fire: 0, music: 0 };
}

function cleanupTrackReactionsIfEmpty(io: Server, trackId: string) {
  const room = io.sockets.adapter.rooms.get(trackRoom(trackId));
  if (!room || room.size === 0) {
    trackReactions.delete(trackId);
  }
}

export function attachSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: config.corsOrigin },
  });

  io.on("connection", (socket: Socket) => {
    const token = socket.handshake.auth?.token as string | undefined;
    let username = `guest-${socket.id.slice(0, 5)}`;

    if (token) {
      try {
        const payload = jwt.verify(token, config.jwtSecret) as { userId: string; username?: string };
        username = payload.username ?? username;
      } catch {
        // Invalid token -> treat as guest, don't disconnect. Real-time
        // presence doesn't need to gate on auth the way write routes do.
      }
    }

    online.set(socket.id, { socketId: socket.id, username, inJamRoom: false, lastMessageAt: 0, lastReactionAt: 0 });
    broadcastPresence(io);

    socket.on("join-jam-room", () => {
      socket.join(JAM_ROOM);
      const user = online.get(socket.id);
      if (user) user.inJamRoom = true;
      broadcastPresence(io);
      // Send recent chat history to just this socket, not the whole room —
      // it's a private catch-up, not a new message to broadcast.
      socket.emit("chat-history", chatHistory);
    });

    socket.on("leave-jam-room", () => {
      socket.leave(JAM_ROOM);
      const user = online.get(socket.id);
      if (user) user.inJamRoom = false;
      broadcastPresence(io);
    });

    // Guard against malformed/oversized payloads from a misbehaving or
    // malicious client crashing the broadcast loop.
    socket.on("jam-param-change", (payload: unknown) => {
      if (
        !payload ||
        typeof payload !== "object" ||
        typeof (payload as { param?: unknown }).param !== "string" ||
        typeof (payload as { value?: unknown }).value !== "number"
      ) {
        return; // silently drop invalid payloads instead of throwing
      }
      const { param, value } = payload as { param: string; value: number };
      // Scoped to the jam room only — previously this used
      // `socket.broadcast.emit`, which sent param changes to *every*
      // connected socket including ones sitting in the lobby, not just
      // people actually in the jam room.
      socket.to(JAM_ROOM).emit("jam-param-change", { param, value, from: username });
    });

    socket.on("chat-message", (payload: unknown) => {
      const user = online.get(socket.id);
      if (!user || !user.inJamRoom) return; // chat is jam-room-only

      if (typeof payload !== "object" || payload === null || typeof (payload as { body?: unknown }).body !== "string") {
        return;
      }
      const body = (payload as { body: string }).body.trim();
      if (body.length === 0 || body.length > CHAT_MAX_LEN) return;

      const now = Date.now();
      if (now - user.lastMessageAt < CHAT_MIN_INTERVAL_MS) {
        // Flood guard — tell the sender why their message was dropped
        // instead of silently eating it, so the UI can show real feedback.
        socket.emit("chat-error", { error: "You're sending messages too fast." });
        return;
      }
      user.lastMessageAt = now;

      const message: ChatMessage = {
        id: `${socket.id}-${now}`,
        username: user.username,
        body,
        at: new Date(now).toISOString(),
      };
      chatHistory.push(message);
      if (chatHistory.length > CHAT_HISTORY_LIMIT) chatHistory.shift();

      io.to(JAM_ROOM).emit("chat-message", message);
    });

    socket.on("error", (err) => {
      console.error(`Socket error (${socket.id}):`, err);
    });

    // Live audience reactions (🔥 / 🎶) scoped to whoever is currently
    // viewing a specific track — separate concept from the permanent,
    // DB-backed Like used in leaderboard ranking.
    socket.on("join-track", (payload: unknown) => {
      if (typeof payload !== "object" || payload === null || typeof (payload as { trackId?: unknown }).trackId !== "string") {
        return;
      }
      const { trackId } = payload as { trackId: string };
      socket.join(trackRoom(trackId));
      socket.emit("track-reactions", { trackId, counts: getReactionCounts(trackId) });
    });

    socket.on("leave-track", (payload: unknown) => {
      if (typeof payload !== "object" || payload === null || typeof (payload as { trackId?: unknown }).trackId !== "string") {
        return;
      }
      const { trackId } = payload as { trackId: string };
      socket.leave(trackRoom(trackId));
      cleanupTrackReactionsIfEmpty(io, trackId);
    });

    socket.on("track-react", (payload: unknown) => {
      const user = online.get(socket.id);
      if (!user) return;
      if (
        typeof payload !== "object" ||
        payload === null ||
        typeof (payload as { trackId?: unknown }).trackId !== "string" ||
        !REACTION_TYPES.includes((payload as { type?: unknown }).type as ReactionType)
      ) {
        return;
      }
      const { trackId, type } = payload as { trackId: string; type: ReactionType };

      const now = Date.now();
      if (now - user.lastReactionAt < REACT_MIN_INTERVAL_MS) {
        return; // silent drop — reactions are high-frequency by design, no need to warn the user for every throttle
      }
      user.lastReactionAt = now;

      const counts = getReactionCounts(trackId);
      counts[type] += 1;
      trackReactions.set(trackId, counts);

      // Broadcast both the updated totals (for the "who's winning" bar)
      // and a one-off burst event (for a fire-and-forget animation on
      // every client, including the sender) — kept separate so the UI
      // doesn't have to infer "did a new reaction just happen" from a
      // total that could also change for other reasons.
      io.to(trackRoom(trackId)).emit("track-reactions", { trackId, counts });
      io.to(trackRoom(trackId)).emit("track-react-burst", { trackId, type, from: user.username });
    });

    socket.on("disconnecting", () => {
      // Runs before Socket.io actually removes the socket from its rooms
      // (unlike "disconnect"), so `socket.rooms` here still reflects every
      // track room this socket was viewing — used to clean up
      // `trackReactions` entries nobody is left to see, instead of leaking
      // one Map entry per track ever viewed for the life of the process.
      for (const room of socket.rooms) {
        if (room.startsWith("track:")) {
          const trackId = room.slice("track:".length);
          setImmediate(() => cleanupTrackReactionsIfEmpty(io, trackId));
        }
      }
    });

    socket.on("disconnect", () => {
      online.delete(socket.id);
      broadcastPresence(io);
    });
  });

  return io;
}

function broadcastPresence(io: Server) {
  const users = Array.from(online.values());
  io.emit("presence-update", {
    totalOnline: users.length,
    inJamRoom: users.filter((u) => u.inJamRoom).length,
    usernames: users.slice(0, 20).map((u) => u.username),
  });
}
