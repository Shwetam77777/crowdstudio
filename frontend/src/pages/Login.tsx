import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Radio } from "lucide-react";
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
      // Real backend error message ("Incorrect email/username or password"),
      // not a generic "Login failed" swallowing what actually happened.
      setError(apiErrorMessage(err, "Login failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="glass w-full max-w-sm rounded-xl p-8">
        <h1 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold text-primary">
          <Radio size={22} /> Log in
        </h1>
        {error && <p className="mb-4 rounded bg-alert/15 px-3 py-2 text-sm text-alert" role="alert">{error}</p>}
        <label htmlFor="login-id" className="mb-1 block text-sm text-muted">Email or username</label>
        <input
          id="login-id"
          name="identifier"
          autoComplete="username"
          className="mb-4 w-full rounded border border-paper/15 bg-bg/60 px-3 py-2 transition-colors focus:border-primary"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
        />
        <label htmlFor="login-password" className="mb-1 block text-sm text-muted">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="mb-6 w-full rounded border border-paper/15 bg-bg/60 px-3 py-2 transition-colors focus:border-primary"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-primary py-2 font-semibold text-bg disabled:opacity-50"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
        <p className="mt-4 text-center text-sm text-muted">
          No account? <Link to="/register" className="text-primary">Register</Link>
        </p>
      </form>
    </div>
  );
}
