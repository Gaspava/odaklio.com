"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  IconSun,
  IconMoon,
  IconChat,
  IconMentor,
  IconTrendingUp,
  IconClock,
  IconBookmark,
  IconMindMap,
  IconFlashcard,
  IconRoadmap,
  IconPomodoro,
  IconSpeedRead,
  IconHeadphones,
  IconPlus,
} from "../icons/Icons";
import ChatHistorySidebar from "./ChatHistorySidebar";
import { PAGE_ROUTES } from "@/lib/routes";

export type PageType = "history" | "focus" | "mentor" | "analysis" | "notes" | "flashcards" | "roadmaps" | "pomodoro-tool" | "speedread";

interface SidebarProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
  onNewChat: () => void;
  onOpenConversation: (id: string) => void;
  onLogout?: () => void;
  isMobile: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const navItems: { id: PageType; label: string; iconId: string }[] = [
  { id: "focus", label: "Odak", iconId: "chat" },
  { id: "mentor", label: "Mentor", iconId: "mentor" },
  { id: "analysis", label: "Analiz", iconId: "trending" },
  { id: "history", label: "Gecmis", iconId: "clock" },
];

const toolItems: { id: PageType; label: string; iconId: string; color: string }[] = [
  { id: "notes", label: "Notlarim", iconId: "bookmark", color: "#10b981" },
  { id: "flashcards", label: "Flash Kartlar", iconId: "flashcard", color: "#f59e0b" },
  { id: "roadmaps", label: "Yol Haritalari", iconId: "roadmap", color: "#ef4444" },
  { id: "pomodoro-tool", label: "Pomodoro", iconId: "pomodoro", color: "#e04d08" },
  { id: "speedread", label: "Hizli Okuma", iconId: "speedread", color: "#06b6d4" },
];

function NavIcon({ iconId, size = 18 }: { iconId: string; size?: number }) {
  switch (iconId) {
    case "chat": return <IconChat size={size} />;
    case "mentor": return <IconMentor size={size} />;
    case "trending": return <IconTrendingUp size={size} />;
    case "clock": return <IconClock size={size} />;
    case "bookmark": return <IconBookmark size={size} />;
    case "mindmap": return <IconMindMap size={size} />;
    case "flashcard": return <IconFlashcard size={size} />;
    case "roadmap": return <IconRoadmap size={size} />;
    case "pomodoro": return <IconPomodoro size={size} />;
    case "speedread": return <IconSpeedRead size={size} />;
    case "headphones": return <IconHeadphones size={size} />;
    default: return null;
  }
}

export default function Sidebar({
  activePage,
  onPageChange,
  onNewChat,
  onOpenConversation,
  onLogout,
  isMobile,
  isOpen,
  onToggle,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = user?.user_metadata?.full_name || user?.email || "";
  const initials = displayName
    ? displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  useEffect(() => {
    if (!profileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  const handleNavClick = useCallback((page: PageType) => {
    onPageChange(page);
    onToggle();
  }, [onPageChange, onToggle]);

  const handleToolClick = useCallback((page: PageType) => {
    onPageChange(page);
    onToggle();
  }, [onPageChange, onToggle]);

  const handleNewChat = useCallback(() => {
    onNewChat();
    onToggle();
  }, [onNewChat, onToggle]);

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
      <aside className={`sidebar sidebar-panel ${isOpen ? "open" : ""}`}>
        <div className="sidebar-inner">
          {/* Header */}
          <div className="sidebar-header">
            <span
              className="sidebar-logo"
              style={{
                backgroundImage: theme === "dark"
                  ? "linear-gradient(135deg, #e2e8f0, #f8fafc)"
                  : "linear-gradient(135deg, #1e293b, #334155)",
              }}
            >
              ODAKLIO
            </span>
            <button onClick={onToggle} className="sidebar-toggle-btn" title="Kapat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* New Chat */}
          <div className="sidebar-section" style={{ padding: "0 12px" }}>
            <button onClick={handleNewChat} className="sidebar-new-chat">
              <IconPlus size={16} />
              <span>Yeni Sohbet</span>
            </button>
          </div>

          {/* Navigation */}
          <div className="sidebar-section" style={{ padding: "0 12px" }}>
            <div className="sidebar-nav-group">
              {navItems.map(item => {
                const active = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`sidebar-nav-item ${active ? "active" : ""}`}
                  >
                    <span className="sidebar-nav-icon">
                      <NavIcon iconId={item.iconId} size={18} />
                    </span>
                    <span className="sidebar-nav-label">{item.label}</span>
                    {active && <span className="sidebar-active-dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* Tools */}
          <div className="sidebar-section" style={{ padding: "0 12px" }}>
            <span className="sidebar-section-label">Araclar</span>
            <div className="sidebar-tools-group">
              {toolItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleToolClick(item.id)}
                  className="sidebar-tool-item"
                >
                  <span className="sidebar-tool-icon" style={{ color: item.color }}>
                    <NavIcon iconId={item.iconId} size={16} />
                  </span>
                  <span className="sidebar-tool-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-divider" />

          {/* Chat History */}
          <div className="sidebar-history">
            <span className="sidebar-section-label" style={{ padding: "0 12px" }}>Son Sohbetler</span>
            <div className="sidebar-history-list">
              <ChatHistorySidebar onOpenConversation={(id) => {
                onOpenConversation(id);
                onToggle();
              }} />
            </div>
          </div>

          {/* Bottom */}
          <div className="sidebar-bottom" style={{ padding: "0 12px" }}>
            <button onClick={toggleTheme} className="sidebar-bottom-btn">
              {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
              <span>{theme === "dark" ? "Acik Tema" : "Koyu Tema"}</span>
            </button>

            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="sidebar-profile-btn">
                <span className="sidebar-avatar" style={{ background: "var(--gradient-primary)" }}>
                  {initials}
                </span>
                <span className="sidebar-profile-name">
                  {user?.user_metadata?.full_name || "Kullanici"}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto", opacity: 0.4 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {profileOpen && (
                <div className="sidebar-profile-dropdown">
                  <button className="sidebar-profile-dropdown-item" onClick={() => { setProfileOpen(false); onToggle(); router.push("/profil"); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                    Profil
                  </button>
                  <button className="sidebar-profile-dropdown-item" onClick={() => setProfileOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Abonelik
                  </button>
                  <div className="sidebar-profile-dropdown-divider" />
                  <button className="sidebar-profile-dropdown-item danger" onClick={() => { setProfileOpen(false); onLogout?.(); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Cikis Yap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
