import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthStore();

  // Wait for the localStorage hydration check to finish before deciding
  // to redirect. This is the fix for the old crowdstudio bug where a
  // logged-in user got bounced to /login on refresh because the redirect
  // fired on the very first render, before AuthProvider had a chance to
  // restore the session.
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center text-muted">Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
