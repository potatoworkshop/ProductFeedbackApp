"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";

import { createVote, removeVote } from "@/lib/api";

type LikeButtonProps = {
  feedbackId: string;
  initialVotes: number;
  initialLiked: boolean;
};

export default function LikeButton({
  feedbackId,
  initialVotes,
  initialLiked,
}: LikeButtonProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (liked) {
        await removeVote(feedbackId);
        setVotes((prev) => Math.max(0, prev - 1));
        setLiked(false);
      } else {
        await createVote(feedbackId);
        setVotes((prev) => prev + 1);
        setLiked(true);
      }
    } catch {
      // Keep UI state unchanged on failure.
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        liked
          ? "border-amber-300 bg-amber-100 text-amber-900"
          : "border-border/70 bg-white/80 text-foreground hover:bg-amber-50"
      } ${loading ? "opacity-70" : ""}`}
      aria-pressed={liked}
      disabled={loading}
    >
      <ThumbsUp className="h-4 w-4" />
      {votes} likes
    </button>
  );
}
