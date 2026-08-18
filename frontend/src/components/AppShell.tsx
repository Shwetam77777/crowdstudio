import { NavLink, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Home, Trophy, Mic2, User, LogOut, LogIn, Disc3 } from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { usePresence } from "../hooks/usePresence";
import { VUMeter } from "./VUMeter";

const navItems = [
  { to: "/", label: "Feed", icon: Home, end: true },
  { to: "/studio", label: "Jam Studio", icon: Mic2, end: true },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy, end: true },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuthStore();
  const presence = usePresence();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
      isActive
        ? "bg-gradient-to-r from-accent/20 to-neon/20 text-accent border border-accent/40 shadow-glow"
        : "text-muted hover:bg-white/5 hover:text-paper"
    }`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Navigation */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-surface/80 backdrop-blur-xl px-5 py-6 sm:flex">
        {/* Brand Logo Header */}
        <NavLink to="/" className="mb-8 flex items-center gap-3 px-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent via-primary to-neon shadow-glow group-hover:scale-105 transition-transform">
            <Disc3 className="text-bg animate-spin-slow" size={22} />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-tight text-paper">
              Crowd<span className="neon-text-cyan">Studio</span>
            </span>
            <span className="block text-[10px] font-mono text-muted tracking-widest uppercase">AUDIO ENGINE</span>
          </div>
        </NavLink>

        {/* Primary Navigation */}
        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
          {user && (
            <NavLink to={`/profile/${user.username}`} className={linkClass}>
              <User size={20} />
              Profile
            </NavLink>
          )}
        </nav>

        {/* Footer & Presence Monitor */}
        <div className="mt-auto space-y-4 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between rounded-xl bg-bg/60 border border-white/5 px-3 py-2.5 font-mono text-xs text-muted">
            <div className="flex items-center gap-2">
              <VUMeter active={presence.connected} bars={3} />
              <span>{presence.connected ? `${presence.totalOnline} online` : "reconnecting…"}</span>
            </div>
            {presence.connected && (
              <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
            )}
          </div>

          {user ? (
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-alert hover:bg-alert/15 transition-colors"
            >
              <LogOut size={18} />
              Log out ({user.username})
            </button>
          ) : (
            <NavLink
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent/20 border border-accent/40 py-2.5 text-sm font-bold text-accent hover:bg-accent/30 transition-colors"
            >
              <LogIn size={18} />
              Log In
            </NavLink>
          )}
        </div>
      </aside>

      {/* Mobile Top Navigation */}
      <div className="flex flex-1 flex-col">
        <header className="glass flex items-center justify-between px-4 py-3.5 sm:hidden">
          <NavLink to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <Disc3 className="text-accent" size={22} />
            <span className="text-paper">Crowd<span className="neon-text-cyan">Studio</span></span>
          </NavLink>
          <div className="flex items-center gap-4 text-sm">
            <NavLink to="/studio" className="text-muted hover:text-accent">
              <Mic2 size={20} />
            </NavLink>
            <NavLink to="/leaderboard" className="text-muted hover:text-primary">
              <Trophy size={20} />
            </NavLink>
            {user ? (
              <>
                <NavLink to={`/profile/${user.username}`} className="text-muted hover:text-accent">
                  <User size={20} />
                </NavLink>
                <button onClick={() => { logout(); navigate("/login"); }} className="text-alert">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <NavLink to="/login" className="text-accent font-semibold">
                <LogIn size={20} />
              </NavLink>
            )}
          </div>
        </header>
        <div className="signal-line sm:hidden" />

        <main className="flex flex-1 flex-col p-2 sm:p-4">{children}</main>
      </div>
    </div>
  );
}
