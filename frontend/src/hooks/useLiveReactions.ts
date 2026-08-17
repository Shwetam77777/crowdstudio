import { useEffect, useRef, useState } from "react";
import { getSocket } from "../lib/socket";

export type ReactionType = "fire" | "music";
export type ReactionCounts = Record<ReactionType, number>;

interface BurstEvent {
  id: number;
  type: ReactionType;
}

/**
 * Joins the live reaction room for a specific track and exposes real-time
 * counts plus a short-lived queue of "burst" events for animating incoming
 * reactions. This is intentionally ephemeral (server-side, in-memory) —
 * a "how is the room feeling right now" signal, separate from the
 * permanent DB-backed Like that drives leaderboard ranking.
 */
export function useLiveReactions(trackId: string | undefined) {
  const [counts, setCounts] = useState<ReactionCounts>({ fire: 0, music: 0 });
  const [bursts, setBursts] = useState<BurstEvent[]>([]);
  const burstIdRef = useRef(0);

  useEffect(() => {
    if (!trackId) return;
    const socket = getSocket();
    socket.emit("join-track", { trackId });

    const onCounts = (payload: { trackId: string; counts: ReactionCounts }) => {
      if (payload.trackId === trackId) setCounts(payload.counts);
    };
    const onBurst = (payload: { trackId: string; type: ReactionType }) => {
      if (payload.trackId !== trackId) return;
      const id = burstIdRef.current++;
      setBursts((prev) => [...prev, { id, type: payload.type }]);
      // Auto-expire the burst after its animation would have finished, so
      // this array doesn't grow forever during a busy session.
      setTimeout(() => setBursts((prev) => prev.filter((b) => b.id !== id)), 1200);
    };

    socket.on("track-reactions", onCounts);
    socket.on("track-react-burst", onBurst);

    return () => {
      socket.emit("leave-track", { trackId });
      socket.off("track-reactions", onCounts);
      socket.off("track-react-burst", onBurst);
    };
  }, [trackId]);

  function react(type: ReactionType) {
    if (!trackId) return;
    getSocket().emit("track-react", { trackId, type });
  }

  return { counts, bursts, react };
}
