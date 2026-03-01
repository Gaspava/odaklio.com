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
  onToggleRight: () => void;
  rightOpen: boolean;
}

export default function Header({
  activeTab,
  onTabChange,
  onToggleRight,
  rightOpen,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  const navTabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "sohbetlerim", label: "Sohbetlerim", icon: <IconChat size={18} /> },
    { id: "araclar", label: "Araçlar", icon: <IconPomodoro size={18} /> },
    { id: "odaklan", label: "Odaklan", icon: <IconFocus size={16} /> },
    { id: "mentor", label: "Mentor", icon: <IconMentor size={18} /> },
    { id: "analiz", label: "Analiz", icon: <IconBarChart size={18} /> },
  ];

  return (
    <header
      className="flex items-center justify-between px-3 sm:px-5 h-14 flex-shrink-0 relative z-10"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-primary)",
      }}
    >
      {/* Left - Logo */}
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

      {/* Center Navigation */}
      <nav className="hidden sm:flex items-stretch h-full">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isOdaklan = tab.id === "odaklan";

          if (isOdaklan) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center justify-center px-5 relative transition-all"
              >
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full transition-all"
                  style={{
                    background: isActive ? "var(--gradient-primary)" : "var(--bg-tertiary)",
                    boxShadow: isActive ? "0 0 16px rgba(16, 185, 129, 0.35)" : "none",
                    border: isActive ? "none" : "1px solid var(--border-secondary)",
                  }}
                >
                  <IconFocus
                    size={16}
                    className={isActive ? "text-white" : ""}
                    style={isActive ? undefined : { color: "var(--text-tertiary)" }}
                  />
                </div>
                <span
                  className="text-[9px] font-bold mt-0.5"
                  style={{ color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)" }}
                >
                  {tab.label}
                </span>
                {/* Bottom indicator */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300"
                  style={{
                    width: isActive ? 24 : 0,
                    background: "var(--gradient-primary)",
                    opacity: isActive ? 1 : 0,
                  }}
                />
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center px-4 relative transition-all"
              style={{
                color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)",
              }}
            >
              {tab.icon}
              <span className="text-[9px] font-semibold mt-0.5">{tab.label}</span>
              {/* Bottom indicator */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 20 : 0,
                  background: "var(--accent-primary)",
                  opacity: isActive ? 1 : 0,
                }}
              />
            </button>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {activeTab === "odaklan" && (
          <>
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
          </>
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
