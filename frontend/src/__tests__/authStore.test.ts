import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "../stores/authStore";

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({ user: null, token: null, isLoading: true });
});

describe("authStore", () => {
  it("starts in a loading state before hydration", () => {
    expect(useAuthStore.getState().isLoading).toBe(true);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("hydrate() restores a session from localStorage and clears isLoading", () => {
    const user = { id: "1", email: "a@b.com", username: "alice", displayName: "Alice" };
    localStorage.setItem("crowdjam_token", "tok123");
    localStorage.setItem("crowdjam_user", JSON.stringify(user));

    useAuthStore.getState().hydrate();

    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.token).toBe("tok123");
    expect(state.user).toEqual(user);
  });

  it("hydrate() with no stored session sets isLoading false and user null", () => {
    // This is the critical case for the old dashboard-redirect bug: a
    // logged-out visitor must reach isLoading=false, user=null (not stay
    // stuck loading forever, and not redirect before this resolves).
    useAuthStore.getState().hydrate();
    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.user).toBeNull();
  });

  it("hydrate() clears corrupted localStorage instead of crashing", () => {
    localStorage.setItem("crowdjam_token", "tok123");
    localStorage.setItem("crowdjam_user", "{not valid json");

    expect(() => useAuthStore.getState().hydrate()).not.toThrow();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(localStorage.getItem("crowdjam_token")).toBeNull();
  });

  it("logout() clears both state and localStorage", () => {
    useAuthStore.getState().setAuth(
      { id: "1", email: "a@b.com", username: "alice", displayName: null },
      "tok123"
    );
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(localStorage.getItem("crowdjam_token")).toBeNull();
  });
});
