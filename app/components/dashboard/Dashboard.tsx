"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header, { type PageType } from "../layout/Header";
import MiniSidebar from "../layout/MiniSidebar";
import ChatHistorySidebar from "../layout/ChatHistorySidebar";
import MainChat from "../chatbot/MainChat";
import MindmapChat from "../chatbot/MindmapChat";
import FlashcardChat from "../chatbot/FlashcardChat";
import RoadmapChat from "../chatbot/RoadmapChat";
import { type ChatStyle } from "../chatbot/ChatStyleSelector";
import ModeSelector from "./ModeSelector";
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
  const [chatStyle, setChatStyle] = useState<ChatStyle>("standard");
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [chatKey, setChatKey] = useState(0);
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

  // Sync chatStyle with conversation type (for /chat/[id] URL loads)
  useEffect(() => {
    if (activeConversationType && activeConversationType !== chatStyle) {
      setChatStyle(activeConversationType as ChatStyle);
      setChatKey((k) => k + 1);
    }
  }, [activeConversationType]); // eslint-disable-line react-hooks/exhaustive-deps

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
    setShowModeSelector(true);
    setChatStyle("standard");
    setChatKey((k) => k + 1);
  };

  const handleClearChat = () => {
    startNewConversation();
    setShowModeSelector(true);
    setChatStyle("standard");
    setChatKey((k) => k + 1);
  };

  const handleSelectStyle = (style: ChatStyle) => {
    startNewConversation();
    setChatStyle(style);
    setChatKey((k) => k + 1);
    setShowModeSelector(false);
    // Hide right panel when entering a focused mode
    if (style !== "standard") {
      setRightOpen(false);
    }
  };

  const handlePageChange = (page: PageType) => {
    setActivePage(page);
    router.push(PAGE_ROUTES[page]);
    if (isMobile) {
      setLeftOpen(false);
      setRightOpen(false);
    }
  };

  const handleOpenConversation = useCallback((id: string, type?: string) => {
    if (id) {
      loadConversation(id).then(() => {
        const convType = type || conversations.find((c) => c.id === id)?.type;
        const typeToStyle: Record<string, ChatStyle> = {
          standard: "standard",
          mindmap: "mindmap",
          flashcard: "flashcard",
          note: "standard",
          roadmap: "roadmap",
        };
        setChatStyle(typeToStyle[convType || "standard"] || "standard");
        setChatKey((k) => k + 1);
        setShowModeSelector(false);
        setActivePage("focus");
        router.push(`/chat/${id}`);
        if (isMobile) {
          setLeftOpen(false);
          setRightOpen(false);
        }
      });
    } else {
      startNewConversation();
      setShowModeSelector(true);
      setChatStyle("standard");
      setChatKey((k) => k + 1);
      setActivePage("focus");
      router.push("/");
      if (isMobile) {
        setLeftOpen(false);
        setRightOpen(false);
      }
    }
  }, [loadConversation, startNewConversation, isMobile, conversations, router]);

  const showSidePanels = activePage === "focus";

  const renderPageContent = () => {
    switch (activePage) {
      case "history":
        return <ChatHistoryPage onOpenConversation={handleOpenConversation} />;
      case "tools":
        return <ToolsPage onOpenConversation={handleOpenConversation} />;
      case "focus":
        if (!activeConversationId && showModeSelector) {
          return <ModeSelector onSelectMode={(mode) => handleSelectStyle(mode as ChatStyle)} />;
        }
        switch (chatStyle) {
          case "mindmap":
            return <MindmapChat key={chatKey} isMobile={isMobile} />;
          case "flashcard":
            return <FlashcardChat key={chatKey} isMobile={isMobile} />;
          case "roadmap":
            return <RoadmapChat key={chatKey} isMobile={isMobile} onOpenConversation={handleOpenConversation} />;
          default:
            return <MainChat key={chatKey} isMobile={isMobile} />;
        }
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
            style={{ opacity: showSidePanels ? 1 : 0.4, pointerEvents: showSidePanels ? "auto" : "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            onClick={() => setMobileBottomSheet("new-chat")}
            className="flex items-center justify-center w-8 h-8 rounded-xl active:scale-90 transition-all"
            style={{ background: "#ffffff", color: "#1e293b", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
          >
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

        {/* Mini Sidebar - always visible on desktop when on focus page */}
        {!isMobile && showSidePanels && (
          <MiniSidebar
            onNewChat={(mode) => handleSelectStyle(mode as ChatStyle)}
            onClearChat={handleClearChat}
          />
        )}

        {/* Mobile left panel - ChatHistorySidebar */}
        {showSidePanels && isMobile && leftOpen && (
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

              {/* Quick actions */}
              <div className="px-3 pb-3 space-y-2">
                <button className="mobile-sidebar-action" onClick={() => { toggleTheme(); }}>
                  <div className="mobile-sidebar-action-icon" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                    {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
                  </div>
                  <div>
                    <div className="mobile-sidebar-action-label" style={{ color: "var(--text-primary)" }}>
                      {theme === "dark" ? "Açık Tema" : "Koyu Tema"}
                    </div>
                    <div className="mobile-sidebar-action-sub">Görünümü değiştir</div>
                  </div>
                </button>

                <button className="mobile-sidebar-action" onClick={() => { setMobileBottomSheet("pomodoro"); setLeftOpen(false); }} style={{ position: "relative" }}>
                  <div className="mobile-sidebar-action-icon" style={{ background: "rgba(204,61,0,0.1)", color: "var(--accent-primary)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3L2 6" /><path d="M22 6l-3-3" />
                    </svg>
                    {pomodoroRunning && <span style={{ position: "absolute", top: 10, right: 10, width: 8, height: 8, borderRadius: "50%", background: "var(--accent-primary)", animation: "pulse 1.5s infinite" }} />}
                  </div>
                  <div>
                    <div className="mobile-sidebar-action-label" style={{ color: "var(--text-primary)" }}>Pomodoro</div>
                    <div className="mobile-sidebar-action-sub">{pomodoroRunning ? "Süre devam ediyor" : "Odak zamanlayıcı"}</div>
                  </div>
                </button>

                <button className="mobile-sidebar-action" onClick={() => { setMobileBottomSheet("sound"); setLeftOpen(false); }}>
                  <div className="mobile-sidebar-action-icon" style={{ background: "rgba(6,182,212,0.1)", color: "var(--accent-cyan)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="mobile-sidebar-action-label" style={{ color: "var(--text-primary)" }}>Ortam Sesi</div>
                    <div className="mobile-sidebar-action-sub">{soundPlaying ? "Çalıyor" : "Odak müziği"}</div>
                  </div>
                </button>
              </div>

              {/* Divider */}
              <div className="mx-3 mb-2" style={{ height: 1, background: "var(--border-secondary)" }} />

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto px-3 pb-3">
                <p className="text-[11px] font-semibold mb-2 px-1" style={{ color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>Sohbetler</p>
                <ChatHistorySidebar onOpenConversation={handleOpenConversation} />
              </div>
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


      {isMobile && (
        <nav className="mobile-bottom-nav">
          {(["history", "tools", "focus", "mentor", "analysis"] as const).map((page) => {
            const active = activePage === page;
            const labels: Record<string, string> = { history: "Geçmiş", tools: "Araçlar", focus: "Odak", mentor: "Mentor", analysis: "Analiz" };
            return (
              <button
                key={page}
                data-active={active}
                onClick={() => { handlePageChange(page); if (page === "focus") { setLeftOpen(false); setRightOpen(false); } }}
                style={{ color: active ? "var(--accent-primary)" : "var(--text-tertiary)" }}
              >
                {page === "history" && (
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                )}
                {page === "tools" && <IconPomodoro size={20} />}
                {page === "focus" && <IconChat size={20} />}
                {page === "mentor" && <IconMentor size={20} />}
                {page === "analysis" && (
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                  </svg>
                )}
                <span style={{ color: "inherit" }}>{labels[page]}</span>
              </button>
            );
          })}
        </nav>
      )}

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
                onSelectMode={(mode) => {
                  handleSelectStyle(mode as ChatStyle);
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
