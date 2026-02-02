"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFeedback } from "@/lib/api";

const CATEGORY_OPTIONS = [
  { value: "UI", label: "UI" },
  { value: "UX", label: "UX" },
  { value: "ENHANCEMENT", label: "Enhancement" },
  { value: "FEATURE", label: "Feature" },
  { value: "BUG", label: "Bug" },
  { value: "OTHER", label: "Other" },
];

export default function NewFeedbackPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]?.value ?? "UI");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const feedback = await createFeedback({
        title: title.trim(),
        description: description.trim(),
        category,
      });
      router.push(`/feedback/${feedback.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#f8fafc,_#fef3c7_60%,_#e0f2fe_100%)] dark:bg-[radial-gradient(circle_at_top,_#1d1a2b,_#0f172a_55%,_#0b1020_100%)]">
      <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-amber-200/60 blur-3xl dark:bg-amber-500/20" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-200/70 blur-3xl dark:bg-sky-500/20" />
      <main className="relative mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pb-24 pt-14 sm:px-10">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Badge variant="outline">New Feedback</Badge>
            <ThemeToggle />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold text-foreground">
              Submit a new product idea
            </h1>
            <p className="text-sm text-muted-foreground">
              Tell the team what would make the experience better.
            </p>
          </div>
        </header>

        <Card className="border-transparent bg-white/80 shadow-xl shadow-amber-100/60 backdrop-blur dark:bg-slate-900/70 dark:shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Feedback details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                Title
                <input
                  className="h-11 rounded-xl border border-border/60 bg-white/90 px-4 text-sm text-foreground shadow-inner outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                  placeholder="Short, descriptive headline"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                Category
                <select
                  className="h-11 rounded-xl border border-border/60 bg-white/90 px-4 text-sm text-foreground shadow-inner outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                Description
                <textarea
                  className="min-h-[140px] rounded-xl border border-border/60 bg-white/90 p-4 text-sm text-foreground shadow-inner outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-100 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/30"
                  placeholder="Explain the problem and why it matters."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
              {error ? (
                <p className="text-xs text-destructive">{error}</p>
              ) : null}
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !title.trim()}>
                  {loading ? "Submitting..." : "Submit feedback"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
