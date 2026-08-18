import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Disc3, ArrowRight, Mic2 } from "lucide-react";
import { api, apiErrorMessage } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await api.post("/auth/login", { emailOrUsername, password });
      setAuth(data.user, data.token);
      navigate("/studio");
    } catch (err) {
      setError(apiErrorMessage(err, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="glass-card w-full max-w-md rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-accent/20 blur-2xl pointer-events-none" />

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/30 shadow-glow">
            <Disc3 size={22} className="animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-paper">Log In</h1>
            <p className="text-xs text-muted">Welcome back to CrowdStudio</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-alert/20 border border-alert/40 p-3.5 text-sm text-alert" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-id" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Email or Username</label>
            <input
              id="login-id"
              name="identifier"
              autoComplete="username"
              className="w-full rounded-xl border border-white/15 bg-bg/80 px-4 py-3 text-sm text-paper transition-all focus:border-accent focus:shadow-glow focus:outline-none"
              placeholder="e.g. musician@example.com or synth_master"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/15 bg-bg/80 px-4 py-3 text-sm text-paper transition-all focus:border-accent focus:shadow-glow focus:outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent via-primary to-neon py-3 text-sm font-bold text-bg shadow-glow hover:brightness-110 transition-all disabled:opacity-50"
          >
            {submitting ? "Logging in…" : "Log In"} <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4 text-center space-y-3">
          <p className="text-sm text-muted">
            Don't have an account? <Link to="/register" className="text-accent font-semibold hover:underline">Register here</Link>
          </p>

          <Link
            to="/studio"
            className="inline-flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs font-semibold text-paper hover:bg-white/10 hover:text-accent transition-colors"
          >
            <Mic2 size={14} /> Continue to Studio as Guest (No Login Required)
          </Link>
        </div>
      </div>
    </div>
  );
}
