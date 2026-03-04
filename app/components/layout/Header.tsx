"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { IconSun, IconMoon } from "../icons/Icons";

export type PageType = "history" | "tools" | "focus" | "mentor" | "analysis";

interface HeaderProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
}

const pages: { id: PageType; label: string; icon: React.ReactNode }[] = [
  {
    id: "history",
    label: "Gecmis",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "tools",
    label: "Araclar",
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
  onLogout,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const displayName = user?.user_metadata?.full_name || user?.email || "";
  const initials = displayName
    ? displayName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header
      className="flex items-center px-4 h-14 flex-shrink-0 relative z-10"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-primary)",
      }}
    >
      {/* Left - Logo */}
      <div className="flex items-center flex-shrink-0">
        <span
          className="text-lg font-black tracking-widest select-none"
          style={{ letterSpacing: "0.2em", fontFamily: "'Inter', sans-serif", background: "linear-gradient(90deg, #e2e8f0, #f8fafc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          ODAKLIO
        </span>
      </div>

      {/* Center - Nav Pills (absolutely centered on full page width) */}
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onPageChange(page.id)}
            className={`nav-pill ${activePage === page.id ? "active" : ""}`}
            title={page.label}
          >
            <span className="flex-shrink-0">{page.icon}</span>
            <span className="hidden sm:inline">{page.label}</span>
          </button>
        ))}
      </nav>

      {/* Right - Profile Area */}
      <div className="header-profile-area ml-auto">
        <button onClick={toggleTheme} className="header-icon-btn" title="Tema">
          {theme === "dark" ? <IconSun size={15} /> : <IconMoon size={15} />}
        </button>

        <button className="header-icon-btn" title="Bildirimler">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        <button className="header-icon-btn" title="Ayarlar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-bold text-white cursor-pointer transition-all hover:scale-105"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-glow-sm)",
              border: "none",
            }}
          >
            {initials}
          </button>

          {menuOpen && (
            <div className="profile-dropdown">
              {/* User info */}
              <div className="profile-dropdown-header">
                <div
                  className="profile-dropdown-avatar"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {initials}
                </div>
                <div className="profile-dropdown-info">
                  <span className="profile-dropdown-name">
                    {user?.user_metadata?.full_name || "Kullanici"}
                  </span>
                  <span className="profile-dropdown-email">
                    {user?.email || user?.phone || ""}
                  </span>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              {/* Menu items */}
              <button className="profile-dropdown-item" onClick={() => setMenuOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profil
              </button>

              <button className="profile-dropdown-item" onClick={() => setMenuOpen(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                Abonelik
              </button>

              <div className="profile-dropdown-divider" />

              <button
                className="profile-dropdown-item profile-dropdown-item-danger"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout?.();
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Cikis Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
