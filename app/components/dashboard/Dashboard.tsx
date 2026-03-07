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
  const [pendingInitialMessage, setPendingInitialMessage] = useState<string | null>(null);
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

  // Sync activeSpecialMode with conversation type (handles direct URL navigation)
  useEffect(() => {
    if (activeConversationType === "roadmap") {
      setActiveSpecialMode("roadmap");
    } else if (activeConversationType === "flashcard") {
      setActiveSpecialMode("flashcard");
    }
  }, [activeConversationType]);

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
    setPendingInitialMessage(null);
    setChatKey((k) => k + 1);
    setActivePage("focus");
    router.push("/");
    if (isMobile) setLeftOpen(false);
  };

  const handleClearChat = () => {
    startNewConversation();
    setActiveSpecialMode(null);
    setPendingInitialMessage(null);
    setChatKey((k) => k + 1);
  };

  const handleModeSwitch = useCallback((mode: string, initialMessage?: string) => {
    startNewConversation();
    setPendingInitialMessage(initialMessage || null);
    setActiveSpecialMode(mode as "flashcard" | "roadmap" | "mindmap");
  }, [startNewConversation]);

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
      setPendingInitialMessage(null);
      loadConversation(id).then(({ type }) => {
        // Route special conversation types to their dedicated components
        if (type === "roadmap") {
          setActiveSpecialMode("roadmap");
        } else if (type === "flashcard") {
          setActiveSpecialMode("flashcard");
        } else {
          setActiveSpecialMode(null);
        }
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
      setActiveSpecialMode(null);
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
        if (activeSpecialMode === "flashcard") return <FlashcardChat key={chatKey} isMobile={isMobile} initialMessage={pendingInitialMessage || undefined} />;
        if (activeSpecialMode === "roadmap") return <RoadmapChat key={chatKey} isMobile={isMobile} onOpenConversation={handleOpenConversation} initialMessage={pendingInitialMessage || undefined} />;
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
          <button onClick={toggleLeft} className="mobile-top-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="16" y2="12" /><line x1="4" y1="17" x2="12" y2="17" />
            </svg>
          </button>
          <div className="mobile-top-center">
            <span
              className="mobile-top-logo"
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
          <button onClick={() => handleNewChat()} className="mobile-top-btn mobile-top-btn-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {isMobile && leftOpen && (
          <div className="mobile-overlay" onClick={closeAllPanels} />
        )}

        {/* Mini Sidebar - always visible on desktop */}
        {!isMobile && (
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
              <div className="mobile-drawer-header">
                <span
                  className="mobile-drawer-logo"
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
                <button onClick={() => setLeftOpen(false)} className="mobile-drawer-close">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Page navigation */}
              <div className="mobile-drawer-nav">
                {(["focus", "history", "tools", "mentor", "analysis"] as const).map((page) => {
                  const labels: Record<string, string> = { focus: "Odak", history: "Gecmis", tools: "Araclar", mentor: "Mentor", analysis: "Analiz" };
                  const active = activePage === page;
                  return (
                    <button
                      key={page}
                      className={`mobile-drawer-nav-item ${active ? "mobile-drawer-nav-item-active" : ""}`}
                      onClick={() => { handlePageChange(page); setLeftOpen(false); }}
                    >
                      <span className="mobile-drawer-nav-icon">
                        {page === "focus" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                        {page === "history" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
                        {page === "tools" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>}
                        {page === "mentor" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                        {page === "analysis" && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>}
                      </span>
                      <span className="mobile-drawer-nav-label">{labels[page]}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mobile-drawer-divider" />

              {/* Quick actions */}
              <div className="mobile-drawer-section">
                <p className="mobile-drawer-section-title">Hizli Erisim</p>

                <button className="mobile-drawer-action" onClick={() => { toggleTheme(); }}>
                  <span className="mobile-drawer-action-icon" style={{ background: "var(--accent-purple-light)", color: "var(--accent-purple)" }}>
                    {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
                  </span>
                  <span className="mobile-drawer-action-label">
                    {theme === "dark" ? "Acik Tema" : "Koyu Tema"}
                  </span>
                </button>

                <button className="mobile-drawer-action" onClick={() => { setMobileBottomSheet("pomodoro"); setLeftOpen(false); }} style={{ position: "relative" }}>
                  <span className="mobile-drawer-action-icon" style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3L2 6" /><path d="M22 6l-3-3" />
                    </svg>
                    {pomodoroRunning && <span className="mobile-drawer-pulse" />}
                  </span>
                  <span className="mobile-drawer-action-label">Pomodoro</span>
                </button>

                <button className="mobile-drawer-action" onClick={() => { setMobileBottomSheet("sound"); setLeftOpen(false); }}>
                  <span className="mobile-drawer-action-icon" style={{ background: "var(--accent-cyan-light)", color: "var(--accent-cyan)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                  </span>
                  <span className="mobile-drawer-action-label">Ortam Sesi</span>
                </button>
              </div>

              {/* Conversations (only on focus page) */}
              {activePage === "focus" && (
                <>
                  <div className="mobile-drawer-divider" />
                  <div className="flex-1 overflow-y-auto px-3 pb-3">
                    <p className="mobile-drawer-section-title" style={{ padding: "0 4px", marginBottom: 8 }}>Sohbetler</p>
                    <ChatHistorySidebar onOpenConversation={handleOpenConversation} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Main content - always centered, offset for mini sidebar on desktop */}
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

      </div>
  );
}
