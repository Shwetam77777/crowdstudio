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
  lyrics?: string;
  genre?: string;
  aiGenerated?: boolean;
  ownerEmail: string;
  ownerId: number;
  likeCount: number;
  commentCount?: number;
  createdAt: string;
}

export interface Comment {
  id: number;
  content: string;
  rating?: number;
  userId: number;
  songId: number;
  createdAt: string;
  user: {
    id: number;
    email: string;
  };
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
    audioUrl?: string,
    lyrics?: string,
    genre?: string
  ): Promise<Song> => {
    const response = await apiClient.post<Song>("/songs", {
      title,
      description,
      audioUrl,
      lyrics,
      genre,
    });
    return response.data;
  },

  likeSong: async (songId: number): Promise<void> => {
    await apiClient.post(`/songs/${songId}/like`);
  },
};

export const aiAPI = {
  generateSong: async (
    lyrics: string,
    genre?: string,
    title?: string
  ): Promise<Song> => {
    const response = await apiClient.post<Song>("/ai/generate", {
      lyrics,
      genre,
      title,
    });
    return response.data;
  },
};

export const commentsAPI = {
  getComments: async (songId: number): Promise<Comment[]> => {
    const response = await apiClient.get<{ comments: Comment[] }>(
      `/songs/${songId}/comments`
    );
    return response.data.comments;
  },

  createComment: async (
    songId: number,
    content: string,
    rating?: number
  ): Promise<Comment> => {
    const response = await apiClient.post<Comment>(
      `/songs/${songId}/comments`,
      {
        content,
        rating,
      }
    );
    return response.data;
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
  },
};

export default apiClient;
