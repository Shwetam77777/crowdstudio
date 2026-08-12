import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { usePresence } from "../hooks/usePresence";
import { VUMeter } from "./VUMeter";

export function Navbar() {
  const { user, logout } = useAuthStore();
  const presence = usePresence();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10">
      <nav className="glass flex items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="font-display text-lg font-semibold tracking-tight text-primary sm:text-xl">
          CrowdJam
        </Link>

        <div className="flex items-center gap-4 text-sm sm:gap-6">
          <span className="flex items-center gap-2 text-muted" title="Live listeners connected right now">
            <VUMeter active={presence.connected} bars={3} />
            <span className="hidden font-mono text-xs sm:inline">
              {presence.connected ? `${presence.totalOnline} live` : "reconnecting…"}
            </span>
          </span>

          <Link to="/leaderboard" className="hidden hover:text-primary sm:inline">
            Leaderboard
          </Link>

          {user ? (
            <>
              <Link to="/studio" className="hover:text-primary">
                Studio
              </Link>
              <Link to={`/profile/${user.username}`} className="hidden hover:text-primary sm:inline">
                {user.displayName ?? user.username}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="rounded border border-paper/15 px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary sm:text-sm"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded border border-paper/15 px-3 py-1.5 text-xs transition-colors hover:border-primary hover:text-primary sm:text-sm"
            >
              Log in
            </Link>
          )}
        </div>
      </nav>
      <div className="signal-line" />
    </header>
  );
}
