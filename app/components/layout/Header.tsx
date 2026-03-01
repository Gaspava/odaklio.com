"use client";

import { useTheme } from "@/app/providers/ThemeProvider";
import { IconHeadphones } from "../icons/Icons";

interface HeaderProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
}

function ThemeToggleIcon({ theme }: { theme: string }) {
  if (theme === "dark") {
    return (
      <svg
        key="sun"
        width={15}
        height={15}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="theme-toggle-icon"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  }
  return (
    <svg
      key="moon"
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="theme-toggle-icon"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Header({
  onToggleLeft,
  onToggleRight,
  leftOpen,
  rightOpen,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  const handleThemeToggle = () => {
    // Add transition class for smooth theme change
    document.documentElement.classList.add("theme-transition");
    toggleTheme();
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transition");
    }, 500);
  };

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-4 h-12 flex-shrink-0"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-primary)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleLeft}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg transition-all"
          style={{
            background: leftOpen ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
            color: leftOpen ? "var(--accent-primary)" : "var(--text-tertiary)",
          }}
          title="Araclar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white text-xs font-bold"
            style={{ background: "var(--gradient-primary)" }}
          >
            O
          </div>
          <span
            className="text-sm font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Odaklio
          </span>
        </div>
      </div>

      {/* Center - hidden on mobile */}
      <div
        className="hidden sm:block text-xs font-medium"
        style={{ color: "var(--text-tertiary)" }}
      >
        Akilli Ogrenme Platformu
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg px-2.5 transition-all"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-tertiary)",
          }}
        >
          <IconHeadphones size={14} />
          <span className="text-[11px] font-medium">Ses</span>
        </button>

        <button
          onClick={handleThemeToggle}
          className="theme-toggle"
          title={theme === "dark" ? "Acik tema" : "Koyu tema"}
        >
          <ThemeToggleIcon theme={theme} />
        </button>

        <button
          onClick={onToggleRight}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg transition-all"
          style={{
            background: rightOpen ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
            color: rightOpen ? "var(--accent-primary)" : "var(--text-tertiary)",
          }}
          title="Mentor & Araclar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
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
