"use client";

import { useTheme } from "@/app/providers/ThemeProvider";
import { IconSun, IconMoon, IconHeadphones } from "../icons/Icons";
import type { LearningTab } from "./LearningMenu";

interface HeaderProps {
  activeTab: LearningTab;
}

const tabLabels: Record<LearningTab, string> = {
  gecmis: "Gecmis Sohbetlerim",
  araclar: "Araclar",
  odaklan: "Odaklan",
  mentor: "Mentor",
  analiz: "Kendini Analiz Et",
};

export default function Header({ activeTab }: HeaderProps) {
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
          Akilli Ogrenme Aktif
        </span>
      </div>

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
