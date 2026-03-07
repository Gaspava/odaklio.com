"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { usePomodoro } from "@/app/providers/PomodoroProvider";
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
  IconSettings,
} from "../icons/Icons";
import ChatHistorySidebar from "./ChatHistorySidebar";
import PomodoroPopup from "../tools/PomodoroPopup";
import AmbientSoundPopup from "../tools/AmbientSoundPopup";
import NotesPopup from "../tools/NotesPopup";
import { PAGE_ROUTES } from "@/lib/routes";

export type PageType = "history" | "tools" | "focus" | "mentor" | "analysis";

interface SidebarProps {
  activePage: PageType;
  onPageChange: (page: PageType) => void;
  onNewChat: () => void;
  onClearChat: () => void;
  onOpenConversation: (id: string) => void;
  onModeSwitch?: (mode: string) => void;
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

const toolItems = [
  { id: "notes", label: "Notlarim", iconId: "bookmark", color: "#10b981" },
  { id: "mindmap", label: "Zihin Haritasi", iconId: "mindmap", color: "#8b5cf6" },
  { id: "flashcard", label: "Flash Kartlar", iconId: "flashcard", color: "#f59e0b" },
  { id: "roadmap", label: "Yol Haritalari", iconId: "roadmap", color: "#ef4444" },
  { id: "pomodoro", label: "Pomodoro", iconId: "pomodoro", color: "#e04d08" },
  { id: "speedread", label: "Hizli Okuma", iconId: "speedread", color: "#06b6d4" },
  { id: "sound", label: "Ortam Sesi", iconId: "headphones", color: "#6366f1" },
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
  onClearChat,
  onOpenConversation,
  onModeSwitch,
  onLogout,
  isMobile,
  isOpen,
  onToggle,
}: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { isRunning, timeLeft } = usePomodoro();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [activePopup, setActivePopup] = useState<"pomodoro" | "sound" | "notes" | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const pomodoroMinutes = Math.floor(timeLeft / 60);
  const pomodoroSeconds = timeLeft % 60;

  const displayName = user?.user_metadata?.full_name || user?.email || "";
  const initials = displayName
    ? displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  // Close profile dropdown on outside click
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
    if (isMobile) onToggle();
  }, [onPageChange, isMobile, onToggle]);

  const handleToolClick = useCallback((toolId: string) => {
    // Popup-based tools
    if (toolId === "pomodoro" || toolId === "sound" || toolId === "notes") {
      setActivePopup(prev => prev === toolId ? null : toolId as "pomodoro" | "sound" | "notes");
      return;
    }
    // Mode-switching tools (open as chat mode)
    if (toolId === "flashcard" || toolId === "roadmap" || toolId === "mindmap") {
      onModeSwitch?.(toolId);
      onPageChange("focus");
      if (isMobile) onToggle();
      return;
    }
    // Remaining tools navigate to tools page with that tool open
    onPageChange("tools");
    if (isMobile) onToggle();
  }, [onPageChange, onModeSwitch, isMobile, onToggle]);

  const handleNewChat = useCallback(() => {
    onNewChat();
    if (isMobile) onToggle();
  }, [onNewChat, isMobile, onToggle]);

  const expanded = isMobile ? true : !collapsed;

  const sidebarContent = (
    <div className="sidebar-inner">
      {/* Header: Logo + Toggle */}
      <div className="sidebar-header">
        {expanded ? (
          <>
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
            <button
              onClick={isMobile ? onToggle : () => setCollapsed(c => !c)}
              className="sidebar-toggle-btn"
              title={isMobile ? "Kapat" : "Daralt"}
            >
              {isMobile ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="sidebar-toggle-btn"
            title="Genislet"
            style={{ margin: "0 auto" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="sidebar-section" style={{ padding: expanded ? "0 12px" : "0 8px" }}>
        <button
          onClick={handleNewChat}
          className="sidebar-new-chat"
          title="Yeni Sohbet"
        >
          <IconPlus size={16} />
          {expanded && <span>Yeni Sohbet</span>}
        </button>
      </div>

      {/* Navigation */}
      <div className="sidebar-section" style={{ padding: expanded ? "0 12px" : "0 8px" }}>
        <div className="sidebar-nav-group">
          {navItems.map(item => {
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`sidebar-nav-item ${active ? "active" : ""}`}
                title={!expanded ? item.label : undefined}
              >
                <span className="sidebar-nav-icon">
                  <NavIcon iconId={item.iconId} size={18} />
                </span>
                {expanded && <span className="sidebar-nav-label">{item.label}</span>}
                {active && expanded && <span className="sidebar-active-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Tools Section */}
      <div className="sidebar-section sidebar-tools-section" style={{ padding: expanded ? "0 12px" : "0 8px" }}>
        {expanded && <span className="sidebar-section-label">Araclar</span>}
        <div className="sidebar-tools-group">
          {toolItems.map(item => (
            <div key={item.id} className="relative">
              <button
                onClick={() => handleToolClick(item.id)}
                className={`sidebar-tool-item ${activePopup === item.id ? "active" : ""}`}
                title={!expanded ? item.label : undefined}
              >
                <span className="sidebar-tool-icon" style={{ color: item.color }}>
                  <NavIcon iconId={item.iconId} size={16} />
                </span>
                {expanded && <span className="sidebar-tool-label">{item.label}</span>}
                {item.id === "pomodoro" && isRunning && (
                  <span className="sidebar-pomodoro-badge">
                    {String(pomodoroMinutes).padStart(2, "0")}:{String(pomodoroSeconds).padStart(2, "0")}
                  </span>
                )}
              </button>
              {/* Inline Popups */}
              {activePopup === "pomodoro" && item.id === "pomodoro" && (
                <div className="sidebar-popup" onClick={e => e.stopPropagation()}>
                  <PomodoroPopup onClose={() => setActivePopup(null)} />
                </div>
              )}
              {activePopup === "sound" && item.id === "sound" && (
                <div className="sidebar-popup" onClick={e => e.stopPropagation()}>
                  <AmbientSoundPopup onClose={() => setActivePopup(null)} onSoundChange={() => {}} />
                </div>
              )}
              {activePopup === "notes" && item.id === "notes" && (
                <div className="sidebar-popup" onClick={e => e.stopPropagation()}>
                  <NotesPopup onClose={() => setActivePopup(null)} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="sidebar-divider" />

      {/* Chat History - scrollable */}
      {expanded && (
        <div className="sidebar-history">
          <span className="sidebar-section-label" style={{ padding: "0 12px" }}>Son Sohbetler</span>
          <div className="sidebar-history-list">
            <ChatHistorySidebar onOpenConversation={(id) => {
              onOpenConversation(id);
              if (isMobile) onToggle();
            }} />
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="sidebar-bottom" style={{ padding: expanded ? "0 12px" : "0 8px" }}>
        {/* Theme Toggle */}
        <button onClick={toggleTheme} className="sidebar-bottom-btn" title={theme === "dark" ? "Acik Tema" : "Koyu Tema"}>
          {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
          {expanded && <span>{theme === "dark" ? "Acik Tema" : "Koyu Tema"}</span>}
        </button>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="sidebar-profile-btn"
          >
            <span
              className="sidebar-avatar"
              style={{ background: "var(--gradient-primary)" }}
            >
              {initials}
            </span>
            {expanded && (
              <span className="sidebar-profile-name">
                {(user?.user_metadata?.full_name || "Kullanici")}
              </span>
            )}
            {expanded && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "auto", opacity: 0.4 }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            )}
          </button>

          {profileOpen && (
            <div className="sidebar-profile-dropdown">
              <button className="sidebar-profile-dropdown-item" onClick={() => { setProfileOpen(false); router.push("/profil"); }}>
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
              <button
                className="sidebar-profile-dropdown-item danger"
                onClick={() => { setProfileOpen(false); onLogout?.(); }}
              >
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
  );

  // Mobile: overlay sidebar
  if (isMobile) {
    return (
      <>
        {isOpen && <div className="sidebar-overlay" onClick={onToggle} />}
        <aside
          ref={sidebarRef}
          className={`sidebar sidebar-mobile ${isOpen ? "open" : ""}`}
        >
          {sidebarContent}
        </aside>
      </>
    );
  }

  // Desktop: static sidebar
  return (
    <aside
      ref={sidebarRef}
      className={`sidebar sidebar-desktop ${collapsed ? "collapsed" : ""}`}
    >
      {sidebarContent}
    </aside>
  );
}
