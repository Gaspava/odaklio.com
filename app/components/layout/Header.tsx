"use client";

import { useTheme } from "@/app/providers/ThemeProvider";
import { IconSun, IconMoon } from "../icons/Icons";

export type PageType = "history" | "tools" | "focus" | "mentor" | "analysis";

interface HeaderProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
}

const pages: { id: PageType; label: string; icon: React.ReactNode }[] = [
  {
    id: "history",
    label: "Geçmiş",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "tools",
    label: "Araçlar",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "focus",
    label: "Odak",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "mentor",
    label: "Mentor",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "analysis",
    label: "Analiz",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
];

export default function Header({
  activePage,
  onPageChange,
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
      {/* Left - Logo */}
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
        <div className="hidden sm:flex flex-col">
          <span
            className="text-sm font-bold tracking-tight leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Odaklio
          </span>
          <span
            className="text-[9px] font-medium leading-tight"
            style={{ color: "var(--accent-primary)", opacity: 0.8 }}
          >
            AI Learning
          </span>
        </div>
      </div>

      {/* Center - Page Navigation Switch */}
      <div
        className="flex items-center rounded-full p-0.5 gap-0.5"
        style={{
          background: "var(--bg-tertiary)",
          border: "1px solid var(--border-primary)",
        }}
      >
        {pages.map((page) => {
          const isActive = activePage === page.id;
          return (
            <button
              key={page.id}
              onClick={() => onPageChange(page.id)}
              className="flex items-center gap-1.5 rounded-full px-2 sm:px-3 py-1.5 transition-all active:scale-95 relative"
              style={{
                background: isActive ? "var(--bg-card)" : "transparent",
                color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)",
                boxShadow: isActive ? "var(--shadow-sm)" : "none",
              }}
              title={page.label}
            >
              <span className="flex-shrink-0" style={{ opacity: isActive ? 1 : 0.7 }}>
                {page.icon}
              </span>
              <span
                className="hidden sm:inline text-[11px] font-semibold whitespace-nowrap"
              >
                {page.label}
              </span>
              {isActive && page.id === "focus" && (
                <span
                  className="hidden sm:block w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "var(--accent-success)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Right - Theme + Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2">
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
