import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Comment,
  CURRENT_USER_ID,
  fetchComments,
  fetchFeedback,
  fetchVotes,
} from "@/lib/api";
import CommentsSection from "./comments-section";
import LikeButton from "./like-button";

export default async function FeedbackDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let feedback;
  let comments: Comment[] = [];
  let initialLiked = false;
  try {
    feedback = await fetchFeedback(id);
    comments = await fetchComments(id);
  } catch {
    notFound();
  }

  try {
    const votes = await fetchVotes(id);
    initialLiked = votes.some((vote) => vote.userId === CURRENT_USER_ID);
  } catch {
    initialLiked = false;
  }

  const votes = feedback._count?.votes ?? 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#fff1f0,_#eff6ff_55%,_#ecfeff_100%)] dark:bg-[radial-gradient(circle_at_top,_#1d1a2b,_#0f172a_55%,_#0b1020_100%)]">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-rose-200/60 blur-3xl dark:bg-rose-500/20" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-72 w-72 rounded-full bg-sky-200/70 blur-3xl dark:bg-sky-500/20" />
      <main className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 pb-24 pt-14 sm:px-10">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all feedback
            </Link>
            <ThemeToggle />
          </div>
          <Card className="border-transparent bg-white/80 shadow-xl shadow-rose-100/60 backdrop-blur dark:bg-slate-900/70 dark:shadow-none">
            <CardHeader>
              <CardTitle className="text-3xl">{feedback.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <p className="text-base leading-7 text-muted-foreground">
                {feedback.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{feedback.category}</Badge>
                <Badge variant="outline">{feedback.status}</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <LikeButton
                feedbackId={id}
                initialVotes={votes}
                initialLiked={initialLiked}
              />
            </CardFooter>
          </Card>
        </header>
        <CommentsSection feedbackId={id} initialComments={comments} />
      </main>
    </div>
  );
}
