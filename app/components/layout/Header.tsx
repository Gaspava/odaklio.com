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

export type TabId = "sohbetlerim" | "araclar" | "odaklan" | "mentor" | "analiz";

interface HeaderProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onToggleLeft: () => void;
  onToggleRight: () => void;
  leftOpen: boolean;
  rightOpen: boolean;
}

const tabs: { id: TabId; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  { id: "sohbetlerim", label: "Sohbetlerim", icon: (a) => <IconChat size={17} /> },
  { id: "araclar", label: "Araçlar", icon: (a) => <IconPomodoro size={17} /> },
  { id: "odaklan", label: "Odaklan", icon: () => <IconFocus size={17} className="text-white" /> },
  { id: "mentor", label: "Mentor", icon: (a) => <IconMentor size={17} /> },
  { id: "analiz", label: "Analiz", icon: (a) => <IconBarChart size={17} /> },
];

export default function Header({
  activeTab,
  onTabChange,
  onToggleLeft,
  onToggleRight,
  leftOpen,
  rightOpen,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-5 h-14 flex-shrink-0 relative z-10"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-primary)",
      }}
    >
      {/* Left - Logo */}
      <div className="flex items-center gap-2.5">
        {activeTab === "odaklan" && (
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
        )}

        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white text-xs font-bold"
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
      <nav
        className="hidden sm:flex items-center gap-0.5 rounded-2xl p-1"
        style={{
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border-primary)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isOdaklan = tab.id === "odaklan";

          if (isOdaklan) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center gap-0.5 px-4 py-0.5 mx-0.5 transition-all relative"
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
                  style={{
                    background: isActive ? "var(--gradient-primary)" : "var(--bg-tertiary)",
                    boxShadow: isActive ? "0 0 14px rgba(16, 185, 129, 0.4)" : "none",
                    border: isActive ? "none" : "1px solid var(--border-secondary)",
                  }}
                >
                  <IconFocus
                    size={15}
                    className={isActive ? "text-white" : ""}
                    style={isActive ? undefined : { color: "var(--text-tertiary)" }}
                  />
                </div>
                <span
                  className="text-[9px] font-bold tracking-wide"
                  style={{ color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)" }}
                >
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center gap-0.5 px-3.5 py-1.5 rounded-xl transition-all"
              style={{
                color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)",
                background: isActive ? "var(--accent-primary-muted)" : "transparent",
              }}
            >
              {tab.icon(isActive)}
              <span className="text-[9px] font-semibold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {activeTab === "odaklan" && (
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
        )}

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

        {activeTab === "odaklan" && (
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
        )}

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
