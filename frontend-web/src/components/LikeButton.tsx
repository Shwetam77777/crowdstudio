"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

interface LikeButtonProps {
    songId: number;
    initialLikes: number;
    initialIsLiked?: boolean;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
    songId,
    initialLikes,
    initialIsLiked = false,
}) => {
    const { user, token } = useAuth();
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLoading, setIsLoading] = useState(false);

    const handleLike = async () => {
        if (!user || !token) {
            alert("Please log in to like songs");
            return;
        }

        if (isLoading) return;

        setIsLoading(true);
        const wasLiked = isLiked;

        // Optimistic UI update
        setIsLiked(!wasLiked);
        setLikes(wasLiked ? likes - 1 : likes + 1);

        try {
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
            const res = await fetch(`${API_BASE}/songs/${songId}/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to like song");
            }
        } catch (error) {
            // Revert on error
            setIsLiked(wasLiked);
            setLikes(wasLiked ? likes + 1 : likes - 1);
            console.error("Error liking song:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
            <svg
                className={`w-6 h-6 transition-colors ${isLiked
                        ? "fill-red-500 text-red-500"
                        : "fill-none text-gray-600 dark:text-gray-400"
                    }`}
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
            </svg>
            <span className="font-medium">{likes}</span>
        </button>
    );
};
