"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ThumbsUp } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Feedback, fetchFeedbacks } from "@/lib/api";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchFeedbacks({ pageSize: 100 })
      .then((data) => {
        if (cancelled) return;
        setFeedbackList(data.items);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const tagStats = useMemo(() => {
    const counts = new Map<string, number>();
    feedbackList.forEach((item) => {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [feedbackList]);

  const filteredFeedbacks =
    activeCategory === "all"
      ? feedbackList
      : feedbackList.filter((item) => item.category === activeCategory);

  const totalLikes = feedbackList.reduce(
    (sum, item) => sum + (item._count?.votes ?? 0),
    0,
  );

  const topCategory = tagStats[0]?.[0] ?? "n/a";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#f5f3ff,_#fef6e6_55%,_#f3f6ff_100%)] dark:bg-[radial-gradient(circle_at_top,_#1f1b2e,_#0f172a_55%,_#0b1020_100%)]">
      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-amber-200/60 blur-3xl dark:bg-amber-500/20" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-200/70 blur-3xl dark:bg-sky-500/20" />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24 pt-16 sm:px-10">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default">Feedback Hub</Badge>
            <Badge variant="outline">Live Data</Badge>
            <div className="ml-auto">
              <Link
                href="/feedback/new"
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                Submit feedback
              </Link>
            </div>
            <div>
              <ThemeToggle />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                Make team voices visible and product direction clearer.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                This is a curated view of user needs, feature wishes, and experience
                pain points. Open any feedback item to see its live comments.
              </p>
            </div>
            <Card className="border-transparent bg-white/70 shadow-xl shadow-amber-100/60 backdrop-blur dark:bg-slate-900/70 dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Total feedback</span>
                  <span className="text-lg font-semibold text-foreground">
                    {feedbackList.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total likes</span>
                  <span className="text-lg font-semibold text-foreground">
                    {totalLikes}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Top tag</span>
                  <span className="text-foreground">{topCategory}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="flex flex-col gap-4">
            <Card className="border-transparent bg-white/80 shadow-lg shadow-amber-100/60 dark:bg-slate-900/70 dark:shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Tag Filter</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={activeCategory === "all" ? "default" : "outline"}
                  className="h-8 px-3"
                  onClick={() => setActiveCategory("all")}
                >
                  All
                  <span className="text-xs text-muted-foreground">
                    {feedbackList.length}
                  </span>
                </Button>
                {tagStats.map(([tag, count]) => (
                  <Button
                    key={tag}
                    type="button"
                    size="sm"
                    variant={activeCategory === tag ? "default" : "outline"}
                    className="h-8 px-3"
                    onClick={() => setActiveCategory(tag)}
                  >
                    {tag}
                    <span className="text-xs text-muted-foreground">
                      {count}
                    </span>
                  </Button>
                ))}
              </CardContent>
            </Card>
              <div className="flex flex-wrap gap-2">
              {activeCategory === "all" ? (
                <Badge variant="outline">Current: all tags</Badge>
              ) : (
                <Badge variant="outline">Current: {activeCategory}</Badge>
              )}
            </div>
          </aside>

          <div className="flex flex-col gap-6">
            {loading && (
              <Card className="border-dashed bg-white/60 text-center text-sm text-muted-foreground dark:bg-slate-900/40">
                <CardContent className="py-10">Loading feedback...</CardContent>
              </Card>
            )}
            {error && !loading && (
              <Card className="border-destructive/50 bg-white/60 text-center text-sm text-destructive dark:bg-slate-900/40">
                <CardContent className="py-10">
                  Failed to load feedback: {error}
                </CardContent>
              </Card>
            )}
            {filteredFeedbacks.map((item) => (
              <Card
                key={item.id}
                className="group relative border-border/70 bg-white/80 transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900/70 dark:hover:shadow-none"
              >
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <ThumbsUp className="h-4 w-4 text-amber-500" />
                      {item._count?.votes ?? 0} likes
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-end">
                  <Link
                    href={`/feedback/${item.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    View details
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
