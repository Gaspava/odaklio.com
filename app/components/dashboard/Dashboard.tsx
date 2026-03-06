"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header, { type PageType } from "../layout/Header";
import MiniSidebar from "../layout/MiniSidebar";
import ChatHistorySidebar from "../layout/ChatHistorySidebar";
import MainChat from "../chatbot/MainChat";
import MindmapChat from "../chatbot/MindmapChat";
import FlashcardChat from "../chatbot/FlashcardChat";
import RoadmapChat from "../chatbot/RoadmapChat";
import ChatHistoryPage from "../pages/ChatHistoryPage";
import ToolsPage from "../pages/ToolsPage";
import MentorPage from "../pages/MentorPage";
import AnalysisPage from "../pages/AnalysisPage";
import PomodoroPopup from "../tools/PomodoroPopup";
import AmbientSoundPopup from "../tools/AmbientSoundPopup";
import NewChatPopup from "../tools/NewChatPopup";
import NotesPopup from "../tools/NotesPopup";
import {
  IconChat,
  IconPomodoro,
  IconMentor,
  IconSun,
  IconMoon,
} from "../icons/Icons";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useConversation } from "@/app/providers/ConversationProvider";
import { usePageTracking } from "@/app/providers/PageTrackingProvider";
import { usePomodoro } from "@/app/providers/PomodoroProvider";
import { PAGE_ROUTES } from "@/lib/routes";

const TRANSITION_CONFIG: Record<string, { label: string; desc: string; color: string; bg: string; icon: React.ReactNode }> = {
  flashcard: {
    label: "Flashcard",
    desc: "Kartlarla öğren",
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.12)",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  roadmap: {
    label: "Roadmap",
    desc: "Yol haritasını keşfet",
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.12)",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/>
        <path d="M12 7v3M12 10l-5 7M12 10l5 7"/>
      </svg>
    ),
  },
  mindmap: {
    label: "Mindmap",
    desc: "Zihin haritası oluştur",
    color: "#8b5cf6",
    bg: "rgba(139, 92, 246, 0.12)",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2.5"/><circle cx="4" cy="7" r="2"/><circle cx="20" cy="7" r="2"/>
        <circle cx="4" cy="17" r="2"/><circle cx="20" cy="17" r="2"/>
        <path d="M9.8 10.8L6 8.5M14.2 10.8L18 8.5M9.8 13.2L6 15.5M14.2 13.2L18 15.5"/>
      </svg>
    ),
  },
};

function ModeTransitionOverlay({ mode, leaving }: { mode: string; leaving: boolean }) {
  const cfg = TRANSITION_CONFIG[mode];
  if (!cfg) return null;
  return (
    <div
      className={`mode-transition-overlay ${leaving ? "mto-leaving" : ""}`}
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="mode-transition-card">
        <div className="mode-transition-icon" style={{ background: cfg.bg }}>
          {cfg.icon}
        </div>
        <div>
          <div className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{cfg.label}</div>
          <div className="text-sm" style={{ color: "var(--text-tertiary)" }}>{cfg.desc}</div>
        </div>
        <div className="mode-transition-progress-track">
          <div className="mode-transition-progress-bar" style={{ background: cfg.color }} />
        </div>
      </div>
    </div>
  );
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

interface DashboardProps {
  onLogout: () => void;
  initialPage?: PageType;
}

export default function Dashboard({ onLogout, initialPage }: DashboardProps) {
  const router = useRouter();
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [activeSpecialMode, setActiveSpecialMode] = useState<"flashcard" | "roadmap" | "mindmap" | null>(null);
  const [transitionMode, setTransitionMode] = useState<string | null>(null);
  const [transitionLeaving, setTransitionLeaving] = useState(false);
  const [activePage, setActivePage] = useState<PageType>(initialPage || "focus");
  const [mobileBottomSheet, setMobileBottomSheet] = useState<"pomodoro" | "sound" | "new-chat" | "notes" | null>(null);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState({ minutes: 25, seconds: 0 });
  const [soundPlaying, setSoundPlaying] = useState(false);
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const { loadConversation, startNewConversation, conversations, activeConversationType, activeConversationId } = useConversation();
  const { trackPageChange } = usePageTracking();
  const { setCurrentPage, setCurrentSubject } = usePomodoro();

  // Track page changes for analytics and pomodoro context
  useEffect(() => {
    trackPageChange(activePage, activeConversationId || null);
    setCurrentPage(activePage);
  }, [activePage]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-detect subject from active conversation
  useEffect(() => {
    if (activeConversationId && conversations) {
      const conv = conversations.find(c => c.id === activeConversationId);
      if (conv) {
        setCurrentSubject(conv.title || null);
      }
    } else {
      setCurrentSubject(null);
    }
  }, [activeConversationId, conversations]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimerChange = useCallback((running: boolean, minutes: number, seconds: number) => {
    setPomodoroRunning(running);
    setPomodoroTime({ minutes, seconds });
  }, []);

  const handleSoundChange = useCallback((playing: boolean) => {
    setSoundPlaying(playing);
  }, []);

  // Prevent body scroll when dashboard is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setLeftOpen(true);
      setRightOpen(true);
    } else {
      setLeftOpen(false);
      setRightOpen(false);
    }
  }, [isMobile]);

  const closeAllPanels = useCallback(() => {
    if (isMobile) {
      setLeftOpen(false);
      setRightOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return;

    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 60;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      const distance = touchEndX - touchStartX;

      if (distance > minSwipeDistance && touchStartX < 30) {
        setLeftOpen(true);
        setRightOpen(false);
      }
      if (distance < -minSwipeDistance && touchStartX > window.innerWidth - 30) {
        setRightOpen(true);
        setLeftOpen(false);
      }
      if (distance < -minSwipeDistance && leftOpen) {
        setLeftOpen(false);
      }
      if (distance > minSwipeDistance && rightOpen) {
        setRightOpen(false);
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, leftOpen, rightOpen]);

  useEffect(() => {
    if (isMobile && (leftOpen || rightOpen)) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, leftOpen, rightOpen]);

  const toggleLeft = () => {
    if (isMobile) setRightOpen(false);
    setLeftOpen(!leftOpen);
  };

  const toggleRight = () => {
    if (isMobile) setLeftOpen(false);
    setRightOpen(!rightOpen);
  };

  const handleNewChat = () => {
    startNewConversation();
    setActiveSpecialMode(null);
    setChatKey((k) => k + 1);
  };

  const handleClearChat = () => {
    startNewConversation();
    setActiveSpecialMode(null);
    setChatKey((k) => k + 1);
  };

  const handleModeSwitch = useCallback((mode: string) => {
    setTransitionMode(mode);
    setTransitionLeaving(false);
    setTimeout(() => {
      setTransitionLeaving(true);
      setTimeout(() => {
        setActiveSpecialMode(mode as "flashcard" | "roadmap" | "mindmap");
        setTransitionMode(null);
        setTransitionLeaving(false);
      }, 320);
    }, 1050);
  }, []);

  const handlePageChange = (page: PageType) => {
    setActivePage(page);
    router.push(PAGE_ROUTES[page]);
    if (isMobile) {
      setLeftOpen(false);
      setRightOpen(false);
    }
  };

  const handleOpenConversation = useCallback((id: string) => {
    if (id) {
      loadConversation(id).then(() => {
        setChatKey((k) => k + 1);
        setActivePage("focus");
        router.push(`/chat/${id}`);
        if (isMobile) {
          setLeftOpen(false);
          setRightOpen(false);
        }
      });
    } else {
      startNewConversation();
      setChatKey((k) => k + 1);
      setActivePage("focus");
      router.push("/");
      if (isMobile) {
        setLeftOpen(false);
        setRightOpen(false);
      }
    }
  }, [loadConversation, startNewConversation, isMobile, router]);

  const showSidePanels = activePage === "focus";

  const renderPageContent = () => {
    switch (activePage) {
      case "history":
        return <ChatHistoryPage onOpenConversation={handleOpenConversation} />;
      case "tools":
        return <ToolsPage onOpenConversation={handleOpenConversation} />;
      case "focus":
        if (activeSpecialMode === "flashcard") return <FlashcardChat key={chatKey} isMobile={isMobile} />;
        if (activeSpecialMode === "roadmap") return <RoadmapChat key={chatKey} isMobile={isMobile} onOpenConversation={handleOpenConversation} />;
        if (activeSpecialMode === "mindmap") return <MindmapChat key={chatKey} isMobile={isMobile} />;
        return <MainChat key={chatKey} isMobile={isMobile} onModeSwitch={handleModeSwitch} />;
      case "mentor":
        return <MentorPage />;
      case "analysis":
        return <AnalysisPage />;
      default:
        return <MainChat key={chatKey} isMobile={isMobile} />;
    }
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ background: "var(--bg-primary)", height: "100dvh" }}
    >
      {!isMobile && (
        <Header
          activePage={activePage}
          onPageChange={handlePageChange}
          onLogout={onLogout}
        />
      )}

      {isMobile && (
        <div className="mobile-top-bar">
          <button onClick={toggleLeft} className="mobile-sidebar-toggle"
            style={{ width: 32, height: 32 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {/* Centered logo - absolutely positioned */}
          <div className="mobile-top-center">
            <span
              className="text-base font-black tracking-widest select-none"
              key={theme}
              style={{ letterSpacing: "0.2em", fontFamily: "'Inter', sans-serif", backgroundImage: theme === "dark" ? "linear-gradient(90deg, #e2e8f0, #f8fafc)" : "linear-gradient(90deg, #1e293b, #334155)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              ODAKLIO
            </span>
          </div>
          {/* New chat button - top right */}
          <button
            onClick={() => handleNewChat()}
            className="flex items-center justify-center rounded-xl active:scale-90 transition-all"
            style={{ width: 32, height: 32, background: "#ffffff", color: "#1e293b", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {isMobile && leftOpen && (
          <div className="mobile-overlay" onClick={closeAllPanels} />
        )}

        {/* Mini Sidebar - always visible on desktop when on focus page */}
        {!isMobile && showSidePanels && (
          <MiniSidebar
            onNewChat={() => handleNewChat()}
            onClearChat={handleClearChat}
          />
        )}

        {/* Mobile left panel */}
        {isMobile && leftOpen && (
          <div className="panel-mobile-overlay panel-left flex-shrink-0 overflow-visible transition-all duration-300 ease-in-out relative"
            style={{ width: "85vw", maxWidth: 320, background: "var(--bg-secondary)" }}>
            <div className="h-full flex flex-col">
              {/* Sidebar header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <span
                  className="text-base font-black tracking-widest select-none"
                  key={theme}
                  style={{ letterSpacing: "0.18em", fontFamily: "'Inter', sans-serif", backgroundImage: theme === "dark" ? "linear-gradient(90deg, #e2e8f0, #f8fafc)" : "linear-gradient(90deg, #1e293b, #334155)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
                >
                  ODAKLIO
                </span>
                <button onClick={() => setLeftOpen(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl transition-all active:scale-90"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Page navigation */}
              <div className="px-3 pb-3 space-y-1">
                {(["focus", "history", "tools", "mentor", "analysis"] as const).map((page) => {
                  const labels: Record<string, string> = { focus: "Odak", history: "Geçmiş", tools: "Araçlar", mentor: "Mentor", analysis: "Analiz" };
                  const active = activePage === page;
                  return (
                    <button
                      key={page}
                      className="mobile-sidebar-action"
                      onClick={() => { handlePageChange(page); setLeftOpen(false); }}
                      style={{ background: active ? "var(--accent-primary-light, rgba(210,65,0,0.08))" : "transparent" }}
                    >
                      <div className="mobile-sidebar-action-icon" style={{ background: active ? "rgba(210,65,0,0.12)" : "var(--bg-tertiary)", color: active ? "var(--accent-primary)" : "var(--text-tertiary)" }}>
                        {page === "focus" && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                        {page === "history" && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                        {page === "tools" && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>}
                        {page === "mentor" && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                        {page === "analysis" && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
                      </div>
                      <div className="mobile-sidebar-action-label" style={{ color: active ? "var(--accent-primary)" : "var(--text-primary)" }}>{labels[page]}</div>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="mx-3 mb-2" style={{ height: 1, background: "var(--border-secondary)" }} />

              {/* Quick actions */}
              <div className="px-3 pb-3 space-y-1">
                <button className="mobile-sidebar-action" onClick={() => { toggleTheme(); }}>
                  <div className="mobile-sidebar-action-icon" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                    {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
                  </div>
                  <div className="mobile-sidebar-action-label" style={{ color: "var(--text-primary)" }}>
                    {theme === "dark" ? "Açık Tema" : "Koyu Tema"}
                  </div>
                </button>

                <button className="mobile-sidebar-action" onClick={() => { setMobileBottomSheet("pomodoro"); setLeftOpen(false); }} style={{ position: "relative" }}>
                  <div className="mobile-sidebar-action-icon" style={{ background: "rgba(204,61,0,0.1)", color: "var(--accent-primary)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3L2 6" /><path d="M22 6l-3-3" />
                    </svg>
                    {pomodoroRunning && <span style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: "50%", background: "var(--accent-primary)", animation: "pulse 1.5s infinite" }} />}
                  </div>
                  <div className="mobile-sidebar-action-label" style={{ color: "var(--text-primary)" }}>Pomodoro</div>
                </button>

                <button className="mobile-sidebar-action" onClick={() => { setMobileBottomSheet("sound"); setLeftOpen(false); }}>
                  <div className="mobile-sidebar-action-icon" style={{ background: "rgba(6,182,212,0.1)", color: "var(--accent-cyan)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                  </div>
                  <div className="mobile-sidebar-action-label" style={{ color: "var(--text-primary)" }}>Ortam Sesi</div>
                </button>
              </div>

              {/* Divider + Conversations (only on focus page) */}
              {activePage === "focus" && (
                <>
                  <div className="mx-3 mb-2" style={{ height: 1, background: "var(--border-secondary)" }} />
                  <div className="flex-1 overflow-y-auto px-3 pb-3">
                    <p className="text-[11px] font-semibold mb-2 px-1" style={{ color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Sohbetler</p>
                    <ChatHistorySidebar onOpenConversation={handleOpenConversation} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Main content - always centered, not pushed by right panel */}
        <div
          className="flex-1 min-w-0 overflow-hidden"
          style={{ background: "var(--bg-primary)" }}
        >
          {renderPageContent()}
        </div>

      </div>



      {/* Mobile Bottom Sheets */}
      {isMobile && mobileBottomSheet && (
        <div className="bottom-sheet-overlay" onClick={() => setMobileBottomSheet(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bottom-sheet-handle" />
            {mobileBottomSheet === "pomodoro" && (
              <PomodoroPopup
                onClose={() => setMobileBottomSheet(null)}
                onTimerChange={handleTimerChange}
                inline
              />
            )}
            {mobileBottomSheet === "sound" && (
              <AmbientSoundPopup
                onClose={() => setMobileBottomSheet(null)}
                onSoundChange={handleSoundChange}
                inline
              />
            )}
            {mobileBottomSheet === "new-chat" && (
              <NewChatPopup
                onSelectMode={() => {
                  handleNewChat();
                  setMobileBottomSheet(null);
                }}
                onClose={() => setMobileBottomSheet(null)}
                inline
              />
            )}
            {mobileBottomSheet === "notes" && (
              <NotesPopup
                onClose={() => setMobileBottomSheet(null)}
                inline
              />
            )}
          </div>
        </div>
      )}

        {transitionMode && (
          <ModeTransitionOverlay mode={transitionMode} leaving={transitionLeaving} />
        )}
    </div>
  );
}
