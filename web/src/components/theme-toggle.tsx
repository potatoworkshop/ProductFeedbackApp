"use client";

import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ThemeMode = "system" | "light" | "dark";

const THEME_KEY = "theme";

const icons: Record<ThemeMode, JSX.Element> = {
  system: <Monitor className="h-4 w-4" />,
  light: <Sun className="h-4 w-4" />,
  dark: <Moon className="h-4 w-4" />,
};

const labels: Record<ThemeMode, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

function applyTheme(mode: ThemeMode) {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  root.classList.remove("dark");

  if (mode === "dark") {
    root.classList.add("dark");
    return;
  }

  if (mode === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (prefersDark) {
      root.classList.add("dark");
    }
  }
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    const stored = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
    return stored ?? "system";
  });
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    applyTheme(mode);
    window.localStorage.setItem(THEME_KEY, mode);

    if (mode !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [mode]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {icons[mode]}
      </Button>
      {open ? (
        <Card className="absolute right-0 top-12 z-20 w-40 border-border/70 bg-popover p-2 shadow-xl">
          <div className="flex flex-col gap-1">
            {(["system", "light", "dark"] as ThemeMode[]).map((value) => (
              <Button
                key={value}
                type="button"
                variant={mode === value ? "secondary" : "ghost"}
                className="justify-start gap-2"
                onClick={() => {
                  setMode(value);
                  setOpen(false);
                }}
              >
                {icons[value]}
                {labels[value]}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
