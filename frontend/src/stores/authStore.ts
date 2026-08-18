import { create } from "zustand";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  // Tracks whether we've finished checking localStorage for an existing
  // session. Pages must wait for this before redirecting to /login — the
  // old crowdstudio dashboard redirected logged-in users because it only
  // checked `user` (null on first render) and never checked loading state.
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setAuth: (user, token) => {
    localStorage.setItem("crowdstudio_token", token);
    localStorage.setItem("crowdstudio_user", JSON.stringify(user));
    set({ user, token, isLoading: false });
  },
  logout: () => {
    localStorage.removeItem("crowdstudio_token");
    localStorage.removeItem("crowdstudio_user");
    localStorage.removeItem("crowdjam_token");
    localStorage.removeItem("crowdjam_user");
    set({ user: null, token: null, isLoading: false });
  },
  hydrate: () => {
    const token = localStorage.getItem("crowdstudio_token") || localStorage.getItem("crowdjam_token");
    const userRaw = localStorage.getItem("crowdstudio_user") || localStorage.getItem("crowdjam_user");
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw) as User;
        set({ user, token, isLoading: false });
        return;
      } catch {
        // corrupted storage, fall through to clear
      }
    }
    localStorage.removeItem("crowdstudio_token");
    localStorage.removeItem("crowdstudio_user");
    localStorage.removeItem("crowdjam_token");
    localStorage.removeItem("crowdjam_user");
    set({ user: null, token: null, isLoading: false });
  },
}));
