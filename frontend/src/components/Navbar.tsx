import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { usePresence } from "../hooks/usePresence";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const presence = usePresence();
  const navigate = useNavigate();

  return (
    <nav className="glass sticky top-0 z-10 flex items-center justify-between px-6 py-3">
      <Link to="/" className="font-display text-xl tracking-wider text-primary">
        CROWDJAM
      </Link>
      <div className="flex items-center gap-6 text-sm">
        <span className="flex items-center gap-2 text-muted">
          <span className={`h-2 w-2 rounded-full ${presence.connected ? "animate-pulse bg-primary" : "bg-red-500"}`} />
          {presence.connected ? `${presence.totalOnline} online` : "reconnecting…"}
        </span>
        <Link to="/leaderboard" className="hover:text-primary">Leaderboard</Link>
        {user ? (
          <>
            <Link to="/studio" className="hover:text-primary">Jam Studio</Link>
            <Link to={`/profile/${user.username}`} className="hover:text-primary">
              {user.displayName ?? user.username}
            </Link>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="rounded border border-white/20 px-3 py-1 hover:border-primary"
            >
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="rounded border border-white/20 px-3 py-1 hover:border-primary">
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
