import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RequireAuth } from "../components/RequireAuth";
import { useAuthStore } from "../stores/authStore";

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/studio"]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/studio"
          element={
            <RequireAuth>
              <div>Studio page</div>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isLoading: true });
});

describe("RequireAuth", () => {
  it("shows a loading state instead of redirecting while auth is still hydrating", () => {
    // This is the regression test for the old crowdstudio bug: a logged-in
    // user refreshing the page got bounced to /login because the redirect
    // fired before localStorage hydration completed.
    useAuthStore.setState({ user: null, token: null, isLoading: true });
    renderProtected();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText("Login page")).not.toBeInTheDocument();
    expect(screen.queryByText("Studio page")).not.toBeInTheDocument();
  });

  it("redirects to /login once hydration finishes and there's no user", () => {
    useAuthStore.setState({ user: null, token: null, isLoading: false });
    renderProtected();
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders the protected content once hydration finishes with a valid user", () => {
    useAuthStore.setState({
      user: { id: "1", email: "a@b.com", username: "alice", displayName: "Alice" },
      token: "tok123",
      isLoading: false,
    });
    renderProtected();
    expect(screen.getByText("Studio page")).toBeInTheDocument();
  });
});
