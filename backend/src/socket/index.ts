import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config";

interface PresenceUser {
  socketId: string;
  username: string;
  room: "lobby" | "jam-room";
}

// In-memory presence map. Good enough for a single-instance deploy;
// swap for Redis adapter if scaling to multiple server instances.
const online = new Map<string, PresenceUser>();

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

    online.set(socket.id, { socketId: socket.id, username, room: "lobby" });
    broadcastPresence(io);

    socket.on("join-jam-room", () => {
      const user = online.get(socket.id);
      if (user) user.room = "jam-room";
      broadcastPresence(io);
    });

    socket.on("leave-jam-room", () => {
      const user = online.get(socket.id);
      if (user) user.room = "lobby";
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
      socket.broadcast.emit("jam-param-change", { param, value, from: username });
    });

    socket.on("error", (err) => {
      console.error(`Socket error (${socket.id}):`, err);
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
    inJamRoom: users.filter((u) => u.room === "jam-room").length,
    usernames: users.slice(0, 20).map((u) => u.username),
  });
}
