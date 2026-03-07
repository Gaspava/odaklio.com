"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { IconSun, IconMoon } from "../icons/Icons";
import { PAGE_ROUTES } from "@/lib/routes";

export type PageType = "history" | "tools" | "focus" | "mentor" | "analysis";

interface HeaderProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
  onLogout?: () => void;
}

const pages: { id: PageType; label: string; icon: React.ReactNode }[] = [
  {
    id: "focus",
    label: "Odak",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "history",
    label: "Gecmis",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "tools",
    label: "Araclar",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "mentor",
    label: "Mentor",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  // Update indicator position
  useEffect(() => {
    if (!navRef.current) return;
    const activeBtn = navRef.current.querySelector(`[data-page="${activePage}"]`) as HTMLElement;
    if (activeBtn) {
      const navRect = navRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setIndicatorStyle({
        left: btnRect.left - navRect.left,
        width: btnRect.width,
      });
    }
  }, [activePage]);

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
    <header className="header-bar">
      {/* Left - Logo */}
      <div className="header-left">
        <span
          className="header-logo"
          key={theme}
          style={{
            backgroundImage: theme === "dark"
              ? "linear-gradient(135deg, #e2e8f0, #cbd5e1)"
              : "linear-gradient(135deg, #1e293b, #475569)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ODAKLIO
        </span>
      </div>

      {/* Center - Navigation Tabs */}
      <nav className="header-nav" ref={navRef}>
        <div
          className="header-nav-indicator"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />
        {pages.map((page) => (
          <Link
            key={page.id}
            href={PAGE_ROUTES[page.id]}
            data-page={page.id}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(page.id);
            }}
            className={`header-nav-item ${activePage === page.id ? "header-nav-item-active" : ""}`}
          >
            <span className="header-nav-icon">{page.icon}</span>
            <span className="header-nav-label">{page.label}</span>
          </Link>
        ))}
      </nav>

      {/* Right - Actions & Profile */}
      <div className="header-right">
        <button onClick={toggleTheme} className="header-action-btn" title="Tema">
          {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>

        <button className="header-action-btn" title="Bildirimler">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="header-avatar"
            style={{ background: "var(--gradient-primary)" }}
          >
            {initials}
          </button>

          {menuOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div
                  className="profile-dropdown-avatar"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {initials}
                </div>
                <div className="profile-dropdown-info">
                  <span className="profile-dropdown-name">
                    {(user?.user_metadata?.full_name || "Kullanici").toUpperCase()}
                  </span>
                  <span className="profile-dropdown-email">
                    {user?.email || user?.phone || ""}
                  </span>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <button className="profile-dropdown-item" onClick={() => { setMenuOpen(false); router.push("/profil"); }}>
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
