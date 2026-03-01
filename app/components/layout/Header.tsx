"use client";

import { useTheme } from "@/app/providers/ThemeProvider";
import {
  IconSun,
  IconMoon,
  IconHeadphones,
  IconChat,
  IconPomodoro,
  IconFocus,
  IconMentor,
  IconBarChart,
} from "../icons/Icons";

interface HeaderProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  onChat: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
}

export default function Header({
  onToggleLeft,
  onToggleRight,
  onChat,
  leftOpen,
  rightOpen,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-5 h-13 flex-shrink-0 relative z-10"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-primary)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onToggleLeft}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg transition-all"
          style={{
            background: leftOpen ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
            color: leftOpen ? "var(--accent-primary)" : "var(--text-tertiary)",
          }}
          title="Araçlar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white text-xs font-bold relative"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-glow-sm)",
            }}
          >
            O
          </div>
          <div className="flex flex-col">
            <span
              className="text-sm font-bold tracking-tight leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Odaklio
            </span>
            <span
              className="hidden sm:block text-[9px] font-medium leading-tight"
              style={{ color: "var(--accent-primary)", opacity: 0.8 }}
            >
              AI Learning
            </span>
          </div>
        </div>
      </div>

      {/* Center Navigation */}
      <nav className="hidden sm:flex items-end gap-0.5">
        <button
          onClick={onChat}
          className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all"
          style={{
            color: !leftOpen && !rightOpen ? "var(--accent-primary)" : "var(--text-tertiary)",
            background: !leftOpen && !rightOpen ? "var(--accent-primary-muted)" : "transparent",
          }}
        >
          <IconChat size={16} />
          <span className="text-[9px] font-semibold tracking-wide" style={{ color: "inherit" }}>Sohbetlerim</span>
        </button>

        <button
          onClick={onToggleLeft}
          className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all"
          style={{
            color: leftOpen ? "var(--accent-primary)" : "var(--text-tertiary)",
            background: leftOpen ? "var(--accent-primary-muted)" : "transparent",
          }}
        >
          <IconPomodoro size={16} />
          <span className="text-[9px] font-semibold tracking-wide" style={{ color: "inherit" }}>Araçlar</span>
        </button>

        <button
          onClick={onChat}
          className="flex flex-col items-center justify-center gap-0.5 px-2 mx-1 transition-all"
        >
          <div
            className="flex items-center justify-center w-9 h-9 rounded-full"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "0 0 16px rgba(16, 185, 129, 0.35)",
            }}
          >
            <IconFocus size={16} className="text-white" />
          </div>
          <span className="text-[9px] font-semibold tracking-wide" style={{ color: "var(--accent-primary)" }}>Odaklan</span>
        </button>

        <button
          onClick={onToggleRight}
          className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all"
          style={{
            color: rightOpen ? "var(--accent-primary)" : "var(--text-tertiary)",
            background: rightOpen ? "var(--accent-primary-muted)" : "transparent",
          }}
        >
          <IconMentor size={16} />
          <span className="text-[9px] font-semibold tracking-wide" style={{ color: "inherit" }}>Mentor</span>
        </button>

        <button
          className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl transition-all"
          style={{
            color: "var(--text-tertiary)",
          }}
        >
          <IconBarChart size={16} />
          <span className="text-[9px] font-semibold tracking-wide" style={{ color: "inherit" }}>Analiz</span>
        </button>
      </nav>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg px-2.5 transition-all hover:bg-[var(--bg-card-hover)]"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-tertiary)",
          }}
        >
          <IconHeadphones size={14} />
          <span className="text-[11px] font-medium">Ses</span>
        </button>

        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-95"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          {theme === "dark" ? <IconSun size={15} /> : <IconMoon size={15} />}
        </button>

        <button
          onClick={onToggleRight}
          className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg transition-all"
          style={{
            background: rightOpen ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
            color: rightOpen ? "var(--accent-primary)" : "var(--text-tertiary)",
          }}
          title="Mentor & Araçlar"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </button>

        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white cursor-pointer transition-all hover:scale-105"
          style={{
            background: "var(--gradient-primary)",
            boxShadow: "var(--shadow-glow-sm)",
          }}
        >
          U
        </div>
      </div>
    </header>
  );
}
