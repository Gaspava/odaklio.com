"use client";

import { useState, useEffect, useCallback } from "react";
import Header, { type PageType } from "./components/layout/Header";
import LeftPanel from "./components/layout/LeftPanel";
import RightPanel from "./components/layout/RightPanel";
import MainChat from "./components/chatbot/MainChat";
import MindmapChat from "./components/chatbot/MindmapChat";
import ChatStyleSelector, {
  type ChatStyle,
} from "./components/chatbot/ChatStyleSelector";
import ChatHistoryPage from "./components/pages/ChatHistoryPage";
import ToolsPage from "./components/pages/ToolsPage";
import MentorPage from "./components/pages/MentorPage";
import AnalysisPage from "./components/pages/AnalysisPage";
import {
  IconChat,
  IconPomodoro,
  IconMentor,
} from "./components/icons/Icons";

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

export default function Home() {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [chatStyle, setChatStyle] = useState<ChatStyle>("standard");
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [activePage, setActivePage] = useState<PageType>("focus");
  const isMobile = useIsMobile();

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
    setShowStyleSelector(true);
  };

  const handleSelectStyle = (style: ChatStyle) => {
    setChatStyle(style);
    setChatKey((k) => k + 1);
    setShowStyleSelector(false);
  };

  const handlePageChange = (page: PageType) => {
    setActivePage(page);
    // Close mobile panels when switching pages
    if (isMobile) {
      setLeftOpen(false);
      setRightOpen(false);
    }
  };

  // Side panels show on the Focus (Odak) page in both standard and mindmap mode
  const showSidePanels = activePage === "focus";

  // Render the active page content
  const renderPageContent = () => {
    switch (activePage) {
      case "history":
        return <ChatHistoryPage />;
      case "tools":
        return <ToolsPage />;
      case "focus":
        return chatStyle === "standard" ? (
          <MainChat key={chatKey} isMobile={isMobile} />
        ) : (
          <MindmapChat key={chatKey} isMobile={isMobile} />
        );
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
      <Header
        activePage={activePage}
        onPageChange={handlePageChange}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay Backdrop */}
        {isMobile && (leftOpen || rightOpen) && (
          <div className="mobile-overlay" onClick={closeAllPanels} />
        )}

        {/* Left Panel + Close Notch */}
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
            <LeftPanel onClose={() => setLeftOpen(false)} />
            {/* Close notch on right edge of left panel */}
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

        {/* Left panel open notch - visible when left panel is closed on desktop */}
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

        {/* Main Content Area */}
        <div
          className="flex-1 min-w-0 overflow-hidden"
          style={{ background: "var(--bg-primary)" }}
        >
          {renderPageContent()}
        </div>

        {/* Right panel open notch - visible when right panel is closed on desktop */}
        {showSidePanels && !isMobile && !rightOpen && (
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

        {/* Right Panel + Close Notch */}
        {showSidePanels && (!isMobile || rightOpen) && (
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
            {/* Close notch on left edge of right panel */}
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

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="mobile-bottom-nav glass-heavy">
          {([
            { id: "history" as PageType, label: "Geçmiş", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
            { id: "tools" as PageType, label: "Araçlar", icon: <IconPomodoro size={20} /> },
            { id: "focus" as PageType, label: "Odak", icon: <IconChat size={20} /> },
            { id: "mentor" as PageType, label: "Mentor", icon: <IconMentor size={20} /> },
            { id: "analysis" as PageType, label: "Analiz", icon: <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg> },
          ]).map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { handlePageChange(item.id); if (item.id === "focus") { setLeftOpen(false); setRightOpen(false); } }}
                className="relative"
                style={{
                  color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)",
                  background: isActive ? "var(--accent-primary-light)" : "transparent",
                }}
              >
                {item.icon}
                <span style={{ color: "inherit", fontWeight: isActive ? 700 : 600 }}>{item.label}</span>
                {isActive && (
                  <span
                    className="absolute top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                    style={{ background: "var(--accent-primary)" }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* Chat Style Selector Modal */}
      {showStyleSelector && (
        <ChatStyleSelector
          onSelect={handleSelectStyle}
          onClose={() => setShowStyleSelector(false)}
        />
      )}
    </div>
  );
}
