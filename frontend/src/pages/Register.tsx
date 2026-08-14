import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Radio } from "lucide-react";
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
    <div className="flex flex-1 items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="glass w-full max-w-sm rounded-xl p-8">
        <h1 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold text-primary">
          <Radio size={22} /> Create account
        </h1>
        {error && <p className="mb-4 rounded bg-alert/15 px-3 py-2 text-sm text-alert" role="alert">{error}</p>}
        <label htmlFor="reg-email" className="mb-1 block text-sm text-muted">Email</label>
        <input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          className="mb-4 w-full rounded border border-paper/15 bg-bg/60 px-3 py-2 transition-colors focus:border-primary"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="reg-username" className="mb-1 block text-sm text-muted">Username</label>
        <input
          id="reg-username"
          name="username"
          autoComplete="username"
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_]+"
          title="Letters, numbers, and underscores only"
          className="mb-4 w-full rounded border border-paper/15 bg-bg/60 px-3 py-2 transition-colors focus:border-primary"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="reg-password" className="mb-1 block text-sm text-muted">Password (min 8 chars)</label>
        <input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
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
          {submitting ? "Creating…" : "Create account"}
        </button>
        <p className="mt-4 text-center text-sm text-muted">
          Already have an account? <Link to="/login" className="text-primary">Log in</Link>
        </p>
      </form>
    </div>
  );
}
