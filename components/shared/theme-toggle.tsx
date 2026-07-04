"use client";

import { Moon, Sun } from "lucide-react";

type ThemeToggleProps = {
  theme: "light" | "dark";
  onToggle: () => void;
  collapsed: boolean;
};

export function ThemeToggle({ theme, onToggle, collapsed }: ThemeToggleProps) {
  if (collapsed) {
    return (
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-text-muted transition-colors hover:bg-neutral-bg hover:text-text-primary"
        title={theme === "light" ? "Mode gelap" : "Mode terang"}
      >
        {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
      </button>
    );
  }

  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors hover:bg-neutral-bg hover:text-text-primary"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
      <span>{theme === "light" ? "Mode gelap" : "Mode terang"}</span>
    </button>
  );
}
