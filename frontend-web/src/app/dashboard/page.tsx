"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Song {
    id: number;
    title: string;
    description: string | null;
    audioUrl: string | null;
    likes: number;
    createdAt: string;
}

export default function DashboardPage() {
    const { user, token } = useAuth();
    const router = useRouter();
    const [songs, setSongs] = useState<Song[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            router.push("/login");
            return;
        }

        if (user.role !== "producer") {
            router.push("/");
            return;
        }

        fetchMySongs();
    }, [user, router]);

    const fetchMySongs = async () => {
        if (!token) return;

        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
            const res = await fetch(`${API_BASE}/songs/my`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch songs");

            const data = await res.json();
            setSongs(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || user.role !== "producer") {
        return null;
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Producer Dashboard</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your music and see how it's performing
                        </p>
                    </div>
                    <Link
                        href="/dashboard/create"
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                    >
                        + Create New Song
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse" />
                        ))}
                    </div>
                ) : songs.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl">
                        <div className="text-6xl mb-4">🎵</div>
                        <h3 className="text-2xl font-bold mb-2">No songs yet</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Upload your first song to get started
                        </p>
                        <Link
                            href="/dashboard/create"
                            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                        >
                            Create Your First Song
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {songs.map((song) => (
                            <div
                                key={song.id}
                                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <h3 className="text-xl font-bold mb-2">{song.title}</h3>
                                {song.description && (
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {song.description}
                                    </p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>{song.likes} likes</span>
                                    </div>
                                    <div>
                                        {new Date(song.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Link
                                        href={`/songs/${song.id}`}
                                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-center hover:bg-blue-600 transition-colors"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
