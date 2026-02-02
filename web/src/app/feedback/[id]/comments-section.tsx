"use client";

import { useState, type FormEvent } from "react";

import { Comment, createComment, fetchComments } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CommentsSectionProps = {
  feedbackId: string;
  initialComments: Comment[];
};

type CommentNodeProps = {
  comment: Comment;
  depth?: number;
};

function getDisplayName(authorId: string) {
  const cleaned = authorId.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  if (!cleaned) return "User";
  const words = cleaned.split(/\s+/).slice(0, 2);
  return words.join(" ");
}

function getInitials(authorId: string) {
  const cleaned = authorId.replace(/[^a-zA-Z0-9]+/g, " ").trim();
  if (!cleaned) return "U";
  const words = cleaned.split(/\s+/);
  const first = words[0]?.[0] ?? "U";
  const second = words[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function CommentNode({ comment, depth = 0 }: CommentNodeProps) {
  const padding = Math.min(depth * 20, 60);
  const displayName = getDisplayName(comment.authorId);
  const initials = getInitials(comment.authorId);
  return (
    <div className="flex flex-col gap-3" style={{ paddingLeft: padding }}>
      <div className="rounded-xl border border-border/60 bg-white/90 p-4 text-sm text-foreground shadow-sm dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-200 text-xs font-semibold text-amber-900">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{displayName}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        <p className="mt-3 leading-6">{comment.body}</p>
      </div>
      {comment.replies?.length ? (
        <div className="flex flex-col gap-3">
          {comment.replies.map((reply) => (
            <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function countComments(comments: Comment[]) {
  let total = 0;
  const stack = [...comments];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;
    total += 1;
    if (current.replies?.length) {
      stack.push(...current.replies);
    }
  }
  return total;
}

export default function CommentsSection({
  feedbackId,
  initialComments,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await createComment(feedbackId, { body: body.trim() });
      const updated = await fetchComments(feedbackId);
      setComments(updated);
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const commentsCount = countComments(comments);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Comments</h2>
          <p className="text-sm text-muted-foreground">
            Stay aligned with the full conversation thread.
          </p>
        </div>
        <Badge variant="outline">{commentsCount} comments</Badge>
      </div>

      <form
        className="rounded-2xl border border-border/60 bg-white/80 p-5 shadow-sm dark:bg-slate-900/70"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-foreground">
            Add a comment
          </label>
          <textarea
            className="min-h-[120px] rounded-xl border border-border/60 bg-white/90 p-3 text-sm text-foreground shadow-inner outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 dark:bg-slate-950/70"
            placeholder="Share your thoughts..."
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : null}
          <div className="flex items-center justify-end">
            <Button type="submit" size="sm" disabled={loading || !body.trim()}>
              {loading ? "Posting..." : "Post comment"}
            </Button>
          </div>
        </div>
      </form>

      {comments.length === 0 ? (
        <Card className="bg-white/80 dark:bg-slate-900/70">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No comments yet.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {comments.map((comment) => (
            <CommentNode key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </section>
  );
}
