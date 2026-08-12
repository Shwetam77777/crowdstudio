import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, apiErrorMessage } from "../lib/api";
import { useAuthStore } from "../stores/authStore";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
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
      const { data } = await api.post("/auth/register", { email, username, password });
      setAuth(data.user, data.token);
      navigate("/studio");
    } catch (err) {
      // Specific errors like "Username is already taken" now actually reach the user.
      setError(apiErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="glass w-full max-w-sm rounded-xl p-8">
        <h1 className="mb-6 font-display text-2xl font-semibold text-primary">Create account</h1>
        {error && <p className="mb-4 rounded bg-alert/15 px-3 py-2 text-sm text-alert">{error}</p>}
        <label className="mb-1 block text-sm text-muted">Email</label>
        <input
          type="email"
          className="mb-4 w-full rounded border border-paper/15 bg-bg/60 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="mb-1 block text-sm text-muted">Username</label>
        <input
          className="mb-4 w-full rounded border border-paper/15 bg-bg/60 px-3 py-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label className="mb-1 block text-sm text-muted">Password (min 8 chars)</label>
        <input
          type="password"
          className="mb-6 w-full rounded border border-paper/15 bg-bg/60 px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-primary py-2 font-semibold text-bg disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create account"}
        </button>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account? <Link to="/login" className="text-primary">Log in</Link>
        </p>
      </form>
    </div>
  );
}
