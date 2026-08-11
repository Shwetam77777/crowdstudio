import axios, { AxiosError } from "axios";
import { useAuthStore } from "../stores/authStore";

export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

export const api = axios.create({ baseURL: API_BASE, timeout: 10000 });

api.interceptors.request.use((cfg) => {
  const token = useAuthStore.getState().token;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Extracts the backend's actual error message instead of the old
// crowdstudio bug where the frontend read `err.message` (always undefined)
// and always showed a generic "Login failed" no matter what went wrong.
export function apiErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof AxiosError) {
    const backendMessage = err.response?.data?.error;
    if (typeof backendMessage === "string") return backendMessage;
    if (err.code === "ERR_NETWORK") return "Can't reach the server. Check your connection.";
    if (err.code === "ECONNABORTED") return "The request timed out. Please try again.";
    if (err.response?.status === 429) return "Too many requests — please slow down and try again shortly.";
    if (err.response && err.response.status >= 500) return "Server error. Please try again in a moment.";
  }
  return fallback;
}
