"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { useFontSize } from "@/app/providers/FontSizeProvider";
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
  const { fontSize, setFontSize } = useFontSize();
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!settingsOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [settingsOpen]);

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

      {/* Right - Theme + Profile Menu */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-95"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
          title="Tema değiştir (Ctrl+Shift+T)"
        >
          {theme === "dark" ? <IconSun size={15} /> : <IconMoon size={15} />}
        </button>

        {/* Settings (font size) */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-95"
            style={{
              background: settingsOpen ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
              color: settingsOpen ? "var(--accent-primary)" : "var(--text-secondary)",
            }}
            title="Ayarlar"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          {settingsOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden z-50"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                boxShadow: "var(--shadow-xl)",
                top: "100%",
              }}
            >
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                  Yazı Boyutu
                </p>
              </div>
              <div className="p-2 space-y-0.5">
                {(["small", "normal", "large"] as const).map((size) => {
                  const labels = { small: "Küçük", normal: "Normal", large: "Büyük" };
                  const previews = { small: "Aa", normal: "Aa", large: "Aa" };
                  const previewSizes = { small: 11, normal: 14, large: 18 };
                  return (
                    <button
                      key={size}
                      onClick={() => { setFontSize(size); setSettingsOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all"
                      style={{
                        background: fontSize === size ? "var(--accent-primary-light)" : "transparent",
                        color: fontSize === size ? "var(--accent-primary)" : "var(--text-primary)",
                      }}
                    >
                      <span style={{ fontSize: previewSizes[size], fontWeight: 600, minWidth: 24 }}>
                        {previews[size]}
                      </span>
                      <span className="text-sm font-medium">{labels[size]}</span>
                      {fontSize === size && (
                        <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="px-4 py-2 mt-1" style={{ borderTop: "1px solid var(--border-secondary)" }}>
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  Kısayol: <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: "var(--bg-tertiary)" }}>Ctrl+K</kbd> komut paleti
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white cursor-pointer transition-all hover:scale-105"
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
