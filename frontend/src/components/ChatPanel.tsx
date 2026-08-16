import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, Send } from "lucide-react";
import { getSocket } from "../lib/socket";
import { useAuthStore } from "../stores/authStore";

interface ChatMessage {
  id: string;
  username: string;
  body: string;
  at: string;
}

/**
 * Jam-room-scoped live text chat. Only receives history/messages while the
 * Studio page has joined the jam room (see Studio.tsx's join-jam-room
 * emit) — the server enforces this server-side too, so a client can't get
 * chat access just by listening without actually joining.
 */
export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const username = useAuthStore((s) => s.user?.username);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = getSocket();

    const onHistory = (history: ChatMessage[]) => setMessages(history);
    const onMessage = (msg: ChatMessage) => setMessages((prev) => [...prev, msg]);
    const onError = (payload: { error: string }) => {
      setError(payload.error);
      // Auto-clear so the warning doesn't linger forever after the flood
      // guard resets.
      setTimeout(() => setError(null), 3000);
    };

    socket.on("chat-history", onHistory);
    socket.on("chat-message", onMessage);
    socket.on("chat-error", onError);

    return () => {
      socket.off("chat-history", onHistory);
      socket.off("chat-message", onMessage);
      socket.off("chat-error", onError);
    };
  }, []);

  useEffect(() => {
    // Guarded with typeof check — not every environment implements
    // Element.scrollTo (e.g. jsdom in tests), so this degrades gracefully
    // instead of throwing and taking down the whole chat panel.
    if (typeof listRef.current?.scrollTo === "function") {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight });
    }
  }, [messages]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body || !username) return;
    getSocket().emit("chat-message", { body });
    setDraft("");
  }

  return (
    <div className="channel-strip flex h-80 flex-col p-4">
      <h2 className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted">
        <MessageCircle size={14} /> Jam Room Chat
      </h2>

      <div ref={listRef} className="mb-2 flex-1 space-y-1.5 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <p className="text-sm text-muted">No messages yet — say hi to whoever's jamming.</p>
        )}
        {messages.map((m) => (
          <p key={m.id} className="text-sm leading-snug">
            <span className={m.username === username ? "text-primary" : "text-accent"}>
              {m.username}
            </span>
            <span className="text-muted"> · </span>
            <span className="text-paper">{m.body}</span>
          </p>
        ))}
      </div>

      {error && (
        <p className="mb-1 text-xs text-alert" role="alert">
          {error}
        </p>
      )}

      {username ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <label htmlFor="chat-input" className="sr-only">Chat message</label>
          <input
            id="chat-input"
            name="chat"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={300}
            placeholder="Say something…"
            className="flex-1 rounded border border-paper/15 bg-bg/60 px-3 py-1.5 text-sm transition-colors focus:border-primary"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex items-center gap-1 rounded bg-primary px-3 py-1.5 text-sm font-semibold text-bg disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </form>
      ) : (
        <p className="text-xs text-muted">Log in to chat with the room.</p>
      )}
    </div>
  );
}
