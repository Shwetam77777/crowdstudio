import axios, { AxiosInstance } from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: number;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Song {
  id: number;
  title: string;
  description?: string;
  audioUrl?: string;
  ownerEmail: string;
  ownerId: number;
  likeCount: number;
  createdAt: string;
}

export interface TopSongsResponse {
  songs: Song[];
}

export const authAPI = {
  register: async (
    email: string,
    password: string,
    role: string = "audience"
  ): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/register", {
      email,
      password,
      role,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  },
};

export const songsAPI = {
  getTopSongs: async (): Promise<Song[]> => {
    const response = await apiClient.get<TopSongsResponse>("/songs/top");
    return response.data.songs;
  },

  getSongById: async (id: number): Promise<Song> => {
    const response = await apiClient.get<Song>(`/songs/${id}`);
    return response.data;
  },

  createSong: async (
    title: string,
    description?: string,
    audioUrl?: string
  ): Promise<Song> => {
    const response = await apiClient.post<Song>("/songs", {
      title,
      description,
      audioUrl,
    });
    return response.data;
  },

  likeSong: async (songId: number): Promise<void> => {
    await apiClient.post(`/songs/${songId}/like`);
  },
};

export default apiClient;
