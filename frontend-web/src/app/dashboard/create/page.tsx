"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";

export default function CreateSongPage() {
    const { user, token } = useAuth();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [audioUrl, setAudioUrl] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user || user.role !== "producer") {
            router.push("/login");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
            const res = await fetch(`${API_BASE}/songs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description: description || null,
                    audioUrl: audioUrl || null,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to create song");
            }

            router.push("/dashboard");
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
            <div className="max-w-2xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">Create New Song</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Add a new song to your collection
                    </p>

                    {error && (
                        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium mb-2">
                                Song Title *
                            </label>
                            <input
                                id="title"
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter song title"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Tell people about your song..."
                            />
                        </div>

                        <div>
                            <label htmlFor="audioUrl" className="block text-sm font-medium mb-2">
                                Audio URL
                            </label>
                            <input
                                id="audioUrl"
                                type="url"
                                value={audioUrl}
                                onChange={(e) => setAudioUrl(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://example.com/your-song.mp3"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                For now, provide a direct link to your audio file (MP3, WAV, etc.)
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? "Creating..." : "Create Song"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
