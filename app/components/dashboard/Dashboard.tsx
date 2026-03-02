"use client";

import { useState, useEffect, useCallback } from "react";
import Header, { type PageType } from "../layout/Header";
import LeftPanel from "../layout/LeftPanel";
import RightPanel from "../layout/RightPanel";
import MainChat from "../chatbot/MainChat";
import MindmapChat from "../chatbot/MindmapChat";
import FlashcardChat from "../chatbot/FlashcardChat";
import NoteChat from "../chatbot/NoteChat";
import RoadmapChat from "../chatbot/RoadmapChat";
import ChatStyleSelector, {
  type ChatStyle,
} from "../chatbot/ChatStyleSelector";
import ModeSelector from "./ModeSelector";
import ChatHistoryPage from "../pages/ChatHistoryPage";
import ToolsPage from "../pages/ToolsPage";
import MentorPage from "../pages/MentorPage";
import AnalysisPage from "../pages/AnalysisPage";
import {
  IconChat,
  IconPomodoro,
  IconMentor,
  IconSun,
  IconMoon,
} from "../icons/Icons";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useConversation } from "@/app/providers/ConversationProvider";

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
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [chatStyle, setChatStyle] = useState<ChatStyle>("standard");
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(true);
  const [chatKey, setChatKey] = useState(0);
  const [activePage, setActivePage] = useState<PageType>(initialPage || "focus");
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const { loadConversation, startNewConversation, conversations, activeConversationType, activeConversationId } = useConversation();

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

  const handleSelectStyle = (style: ChatStyle) => {
    setChatStyle(style);
    setChatKey((k) => k + 1);
    setShowStyleSelector(false);
    setShowModeSelector(false);
    // Hide right panel when entering a focused mode
    if (style !== "standard") {
      setRightOpen(false);
    }
  };

  const handlePageChange = (page: PageType) => {
    setActivePage(page);
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
          note: "note",
          roadmap: "roadmap",
        };
        setChatStyle(typeToStyle[convType || "standard"] || "standard");
        setChatKey((k) => k + 1);
        setShowModeSelector(false);
        setActivePage("focus");
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
      if (isMobile) {
        setLeftOpen(false);
        setRightOpen(false);
      }
    }
  }, [loadConversation, startNewConversation, isMobile, conversations]);

  const showSidePanels = activePage === "focus";

  const renderPageContent = () => {
    switch (activePage) {
      case "history":
        return <ChatHistoryPage onOpenConversation={handleOpenConversation} />;
      case "tools":
        return <ToolsPage />;
      case "focus":
        if (!activeConversationId && showModeSelector) {
          return <ModeSelector onSelectMode={(mode) => handleSelectStyle(mode as ChatStyle)} />;
        }
        switch (chatStyle) {
          case "mindmap":
            return <MindmapChat key={chatKey} isMobile={isMobile} />;
          case "flashcard":
            return <FlashcardChat key={chatKey} isMobile={isMobile} />;
          case "note":
            return <NoteChat key={chatKey} isMobile={isMobile} />;
          case "roadmap":
            return <RoadmapChat key={chatKey} isMobile={isMobile} />;
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
          <button
            onClick={toggleLeft}
            className="mobile-sidebar-toggle"
            title="Araçlar"
            style={{
              opacity: showSidePanels ? 1 : 0.4,
              pointerEvents: showSidePanels ? "auto" : "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </button>

          <div className="mobile-top-center">
            <div
              className="mobile-logo"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "var(--shadow-glow-sm)",
              }}
            >
              O
            </div>
            <button
              onClick={toggleTheme}
              className="mobile-theme-toggle"
            >
              {theme === "dark" ? <IconSun size={14} /> : <IconMoon size={14} />}
            </button>
          </div>

          <button
            onClick={toggleRight}
            className="mobile-sidebar-toggle"
            title="Mentor"
            style={{
              opacity: showSidePanels ? 1 : 0.4,
              pointerEvents: showSidePanels ? "auto" : "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {isMobile && (leftOpen || rightOpen) && (
          <div className="mobile-overlay" onClick={closeAllPanels} />
        )}

        {showSidePanels && (!isMobile || leftOpen) && (
          <div
            className={`flex-shrink-0 overflow-visible transition-all duration-300 ease-in-out relative ${
              isMobile ? "panel-mobile-overlay panel-left" : ""
            }`}
            style={{
              width: isMobile ? "85vw" : leftOpen ? 280 : 0,
              maxWidth: isMobile ? 320 : undefined,
              borderRight: !isMobile && leftOpen ? "1px solid var(--border-primary)" : "none",
              background: "var(--bg-secondary)",
            }}
          >
            <LeftPanel
              onClose={() => setLeftOpen(false)}
              onOpenConversation={handleOpenConversation}
              onSelectMode={(mode) => handleSelectStyle(mode as ChatStyle)}
            />
            {!isMobile && leftOpen && (
              <button
                onClick={() => setLeftOpen(false)}
                className="absolute top-3 flex items-center justify-center transition-all hover:opacity-100 z-20"
                style={{
                  right: -12,
                  width: 12,
                  height: 32,
                  background: "var(--bg-secondary)",
                  borderRadius: "0 5px 5px 0",
                  color: "var(--text-tertiary)",
                  border: "1px solid var(--border-primary)",
                  borderLeft: "none",
                  opacity: 0.6,
                  cursor: "pointer",
                }}
                title="Araçlar panelini kapat"
              >
                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
          </div>
        )}

        {showSidePanels && !isMobile && !leftOpen && (
          <button
            onClick={toggleLeft}
            className="flex-shrink-0 flex items-center justify-center transition-all hover:opacity-100 self-start mt-3"
            style={{
              width: 12,
              height: 32,
              background: "var(--bg-tertiary)",
              borderRadius: "0 5px 5px 0",
              color: "var(--text-tertiary)",
              border: "1px solid var(--border-primary)",
              borderLeft: "none",
              opacity: 0.5,
              cursor: "pointer",
            }}
            title="Araçlar panelini aç"
          >
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        <div
          className="flex-1 min-w-0 overflow-hidden"
          style={{ background: "var(--bg-primary)" }}
        >
          {renderPageContent()}
        </div>

        {showSidePanels && !["flashcard", "note", "roadmap"].includes(chatStyle) && !isMobile && !rightOpen && (
          <button
            onClick={toggleRight}
            className="flex-shrink-0 flex items-center justify-center transition-all hover:opacity-100 self-start mt-3"
            style={{
              width: 12,
              height: 32,
              background: "var(--bg-tertiary)",
              borderRadius: "5px 0 0 5px",
              color: "var(--text-tertiary)",
              border: "1px solid var(--border-primary)",
              borderRight: "none",
              opacity: 0.5,
              cursor: "pointer",
            }}
            title="Mentor panelini aç"
          >
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {showSidePanels && !["flashcard", "note", "roadmap"].includes(chatStyle) && (!isMobile || rightOpen) && (
          <div
            className={`flex-shrink-0 overflow-visible transition-all duration-300 ease-in-out relative ${
              isMobile ? "panel-mobile-overlay panel-right" : ""
            }`}
            style={{
              width: isMobile ? "85vw" : rightOpen ? 300 : 0,
              maxWidth: isMobile ? 320 : undefined,
              borderLeft: !isMobile && rightOpen ? "1px solid var(--border-primary)" : "none",
              background: "var(--bg-secondary)",
            }}
          >
            {!isMobile && rightOpen && (
              <button
                onClick={() => setRightOpen(false)}
                className="absolute top-3 flex items-center justify-center transition-all hover:opacity-100 z-20"
                style={{
                  left: -12,
                  width: 12,
                  height: 32,
                  background: "var(--bg-secondary)",
                  borderRadius: "5px 0 0 5px",
                  color: "var(--text-tertiary)",
                  border: "1px solid var(--border-primary)",
                  borderRight: "none",
                  opacity: 0.6,
                  cursor: "pointer",
                }}
                title="Mentor panelini kapat"
              >
                <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )}
            <RightPanel
              onClose={() => setRightOpen(false)}
              onNewChat={handleNewChat}
              chatStyle={chatStyle}
            />
          </div>
        )}
      </div>

      {isMobile && (
        <nav className="mobile-bottom-nav">
          <button
            onClick={() => handlePageChange("history")}
            style={{
              color: activePage === "history" ? "var(--accent-primary)" : "var(--text-tertiary)",
              background: activePage === "history" ? "var(--accent-primary-light)" : "transparent",
            }}
          >
            <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span style={{ color: "inherit" }}>Geçmiş</span>
          </button>

          <button
            onClick={() => handlePageChange("tools")}
            style={{
              color: activePage === "tools" ? "var(--accent-primary)" : "var(--text-tertiary)",
              background: activePage === "tools" ? "var(--accent-primary-light)" : "transparent",
            }}
          >
            <IconPomodoro size={19} />
            <span style={{ color: "inherit" }}>Araçlar</span>
          </button>

          <button
            onClick={() => { handlePageChange("focus"); setLeftOpen(false); setRightOpen(false); }}
            style={{
              color: activePage === "focus" ? "var(--accent-primary)" : "var(--text-tertiary)",
              background: activePage === "focus" ? "var(--accent-primary-light)" : "transparent",
            }}
          >
            <IconChat size={19} />
            <span style={{ color: "inherit" }}>Odak</span>
          </button>

          <button
            onClick={() => handlePageChange("mentor")}
            style={{
              color: activePage === "mentor" ? "var(--accent-primary)" : "var(--text-tertiary)",
              background: activePage === "mentor" ? "var(--accent-primary-light)" : "transparent",
            }}
          >
            <IconMentor size={19} />
            <span style={{ color: "inherit" }}>Mentor</span>
          </button>

          <button
            onClick={() => handlePageChange("analysis")}
            style={{
              color: activePage === "analysis" ? "var(--accent-primary)" : "var(--text-tertiary)",
              background: activePage === "analysis" ? "var(--accent-primary-light)" : "transparent",
            }}
          >
            <svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <span style={{ color: "inherit" }}>Analiz</span>
          </button>
        </nav>
      )}

      {showStyleSelector && (
        <ChatStyleSelector
          onSelect={handleSelectStyle}
          onClose={() => setShowStyleSelector(false)}
        />
      )}
    </div>
  );
}
