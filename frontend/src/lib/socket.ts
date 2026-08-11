import { io, Socket } from "socket.io-client";
import { API_BASE } from "./api";
import { useAuthStore } from "../stores/authStore";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_BASE, {
      auth: { token: useAuthStore.getState().token ?? undefined },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 8000,
    });

    // Prevents silent, invisible connection failures — without a listener,
    // a failed handshake (bad CORS, server down, etc.) just fails quietly
    // and every "X people jamming" stat stays at 0 with no explanation.
    socket.on("connect_error", (err) => {
      console.warn("CrowdJam socket connection error:", err.message);
    });

    // Re-authenticate with the latest token on every reconnect — the token
    // captured at socket creation goes stale after a login/logout.
    socket.io.on("reconnect_attempt", () => {
      socket!.auth = { token: useAuthStore.getState().token ?? undefined };
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
