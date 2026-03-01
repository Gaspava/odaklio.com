"use client";

import { useTheme } from "./ThemeProvider";

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}

function MentorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

interface HeaderProps {
  mentorOpen: boolean;
  setMentorOpen: (open: boolean) => void;
}

export default function Header({ mentorOpen, setMentorOpen }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 backdrop-blur-md"
      style={{
        backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "var(--accent-gradient)" }}>
          <span className="text-white">
            <BotIcon />
          </span>
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Odaklio
          </span>
          <span className="ml-2 rounded-md px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
            AI Study Platform
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setMentorOpen(!mentorOpen)}
          className="flex h-9 items-center gap-2 rounded-lg px-3 transition-all"
          style={{
            backgroundColor: mentorOpen ? "var(--accent-light)" : "var(--bg-tertiary)",
            color: mentorOpen ? "var(--accent)" : "var(--text-secondary)",
          }}
        >
          <MentorIcon />
          <span className="text-xs font-medium">Mentor</span>
        </button>

        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors"
          style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}
