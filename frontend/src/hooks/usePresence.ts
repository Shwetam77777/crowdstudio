import { useEffect, useState } from "react";
import { getSocket } from "../lib/socket";

interface PresenceState {
  totalOnline: number;
  inJamRoom: number;
  usernames: string[];
}

/**
 * Real global presence over WebSocket — this replaces the old
 * present-mind-sound "Telepathy" panel, which just showed a hardcoded
 * `connectedUsers: 1240` that incremented with Math.random() and never
 * reflected anyone actually connected.
 */
export function usePresence() {
  const [presence, setPresence] = useState<PresenceState>({
    totalOnline: 0,
    inJamRoom: 0,
    usernames: [],
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    const onUpdate = (data: PresenceState) => setPresence(data);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("presence-update", onUpdate);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    setConnected(socket.connected);

    return () => {
      socket.off("presence-update", onUpdate);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return { ...presence, connected };
}
