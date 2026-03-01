"use client";

import { useTheme } from "@/app/providers/ThemeProvider";
import { IconSun, IconMoon, IconHeadphones, IconPlus } from "../icons/Icons";
import type { ChatStyle } from "../chatbot/ChatStyleSelector";

interface HeaderProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
  onNewChat: () => void;
  chatStyle: ChatStyle;
}

export default function Header({
  onToggleLeft,
  onToggleRight,
  leftOpen,
  rightOpen,
  onNewChat,
  chatStyle,
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

      {/* Center status indicator */}
      <div
        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
        style={{
          background: "var(--accent-primary-muted)",
          border: "1px solid rgba(16, 185, 129, 0.08)",
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: "var(--accent-success)" }}
        />
        <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
          Akıllı Öğrenme Aktif
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 transition-all active:scale-95"
          style={{
            background: chatStyle === "mindmap" ? "var(--accent-purple-light)" : "var(--accent-primary-light)",
            color: chatStyle === "mindmap" ? "var(--accent-purple)" : "var(--accent-primary)",
            border: `1px solid ${chatStyle === "mindmap" ? "rgba(139, 92, 246, 0.2)" : "rgba(16, 185, 129, 0.2)"}`,
          }}
        >
          <IconPlus size={14} />
          <span className="hidden sm:inline text-[11px] font-semibold">Yeni Sohbet</span>
        </button>

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
