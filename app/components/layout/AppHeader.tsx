"use client";

import { useTheme } from "@/app/providers/ThemeProvider";
import { IconSun, IconMoon } from "../icons/Icons";

export default function AppHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="flex items-center justify-between px-4 sm:px-5 h-12 flex-shrink-0"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-primary)",
      }}
    >
      {/* Left - Logo (mobile only, desktop has it in sidebar) */}
      <div className="flex items-center gap-2">
        <div className="flex md:hidden items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-xs font-bold"
            style={{ background: "var(--gradient-primary)" }}
          >
            O
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Odaklio
          </span>
        </div>
        <span
          className="hidden md:block text-xs font-medium"
          style={{ color: "var(--text-tertiary)" }}
        >
          Akıllı Öğrenme Platformu
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          {theme === "dark" ? <IconSun size={15} /> : <IconMoon size={15} />}
        </button>

        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          U
        </div>
      </div>
    </header>
  );
}
