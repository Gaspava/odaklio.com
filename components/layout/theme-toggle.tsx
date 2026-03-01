"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
      title={resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
      suppressHydrationWarning
    >
      <Sun size={18} className="hidden dark:block" />
      <Moon size={18} className="block dark:hidden" />
    </button>
  );
}
