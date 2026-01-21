"use client";

import React, { useState, useEffect } from "react";
import { Comment, commentsAPI } from "@/lib/api";
import { useAuth } from "./AuthProvider";

interface CommentsSectionProps {
  songId: number;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ songId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadComments();
  }, [songId]);

  const loadComments = async () => {
    try {
      const data = await commentsAPI.getComments(songId);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("Please login to comment");
      return;
    }

    if (!newComment.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const comment = await commentsAPI.createComment(
        songId,
        newComment,
        rating > 0 ? rating : undefined
      );
      setComments([comment, ...comments]);
      setNewComment("");
      setRating(0);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to post comment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await commentsAPI.deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments & Reviews</h2>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-100 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Rating (Optional)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star === rating ? 0 : star)}
                  className={`text-3xl transition-all transform hover:scale-110 ${
                    star <= rating
                      ? "text-yellow-500"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                >
                  ★
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 self-center">
                  {rating} {rating === 1 ? "star" : "stars"}
                </span>
              )}
            </div>
          </div>

          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Share your thoughts about this song..."
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">
            Please login to leave a comment
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {comment.user.email}
                    </span>
                    {comment.rating && (
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={
                              i < comment.rating!
                                ? "text-yellow-500 text-sm"
                                : "text-gray-300 dark:text-gray-600 text-sm"
                            }
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>

                {user && user.id === comment.userId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-500 hover:text-red-700 text-sm ml-4"
                  >
                    Delete
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
