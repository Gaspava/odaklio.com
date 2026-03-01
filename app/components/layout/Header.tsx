"use client";

import { useTheme } from "@/app/providers/ThemeProvider";
import { IconSun, IconMoon, IconHeadphones, IconPencil, IconClipboard, IconBook, IconCompass } from "../icons/Icons";

export type PageMode = "study" | "exam" | "reading" | "explore";

interface HeaderProps {
  onToggleLeft: () => void;
  onToggleRight: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
  activeMode: PageMode;
  onModeChange: (mode: PageMode) => void;
}

const modes: { id: PageMode; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "study", label: "Çalışma", icon: <IconPencil size={13} />, color: "#8B5CF6" },
  { id: "exam", label: "Sınav", icon: <IconClipboard size={13} />, color: "#EF4444" },
  { id: "reading", label: "Okuma", icon: <IconBook size={13} />, color: "#3B82F6" },
  { id: "explore", label: "Keşif", icon: <IconCompass size={13} />, color: "#10B981" },
];

export default function Header({
  onToggleLeft,
  onToggleRight,
  leftOpen,
  rightOpen,
  activeMode,
  onModeChange,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="flex items-center justify-between px-4 h-12 flex-shrink-0"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-primary)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLeft}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{
            background: leftOpen ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
            color: leftOpen ? "var(--accent-primary)" : "var(--text-tertiary)",
          }}
          title="Araçlar"
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

      {/* Center - Mode Switcher */}
      <div
        className="flex items-center gap-1 rounded-xl p-1"
        style={{ background: "var(--bg-tertiary)" }}
      >
        {modes.map((mode) => {
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all"
              style={{
                background: isActive ? "var(--bg-card)" : "transparent",
                color: isActive ? mode.color : "var(--text-tertiary)",
                boxShadow: isActive ? "var(--shadow-sm)" : "none",
              }}
            >
              <span style={{ color: isActive ? mode.color : "var(--text-tertiary)" }}>
                {mode.icon}
              </span>
              {mode.label}
              {isActive && (
                <span
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                  style={{ background: mode.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 transition-colors"
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
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          {theme === "dark" ? <IconSun size={15} /> : <IconMoon size={15} />}
        </button>

        <button
          onClick={onToggleRight}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          style={{
            background: rightOpen ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
            color: rightOpen ? "var(--accent-primary)" : "var(--text-tertiary)",
          }}
          title="Mentor & Araçlar"
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
