"use client";

import { useState, useEffect, useCallback } from "react";
import Header, { type TabId } from "./components/layout/Header";
import LeftPanel from "./components/layout/LeftPanel";
import RightPanel from "./components/layout/RightPanel";
import MainChat from "./components/chatbot/MainChat";
import SohbetlerimPage from "./components/pages/SohbetlerimPage";
import AraclarPage from "./components/pages/AraclarPage";
import MentorPage from "./components/pages/MentorPage";
import AnalizPage from "./components/pages/AnalizPage";
import {
  IconChat,
  IconPomodoro,
  IconFocus,
  IconMentor,
  IconBarChart,
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
  const [activeTab, setActiveTab] = useState<TabId>("odaklan");
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) {
      if (activeTab === "odaklan") {
        setLeftOpen(true);
        setRightOpen(true);
      }
    } else {
      setLeftOpen(false);
      setRightOpen(false);
    }
  }, [isMobile, activeTab]);

  const closeAllPanels = useCallback(() => {
    if (isMobile) {
      setLeftOpen(false);
      setRightOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile || activeTab !== "odaklan") return;

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
  }, [isMobile, leftOpen, rightOpen, activeTab]);

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

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    if (tab !== "odaklan") {
      setLeftOpen(false);
      setRightOpen(false);
    } else if (!isMobile) {
      setLeftOpen(true);
      setRightOpen(true);
    }
  };

  const mobileNavTabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "sohbetlerim", label: "Sohbet", icon: <IconChat size={19} /> },
    { id: "araclar", label: "Araçlar", icon: <IconPomodoro size={19} /> },
    { id: "odaklan", label: "Odaklan", icon: <IconFocus size={17} className="text-white" /> },
    { id: "mentor", label: "Mentor", icon: <IconMentor size={19} /> },
    { id: "analiz", label: "Analiz", icon: <IconBarChart size={19} /> },
  ];

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onToggleRight={toggleRight}
        rightOpen={rightOpen}
      />

      {activeTab === "odaklan" ? (
        <div className="flex flex-1 overflow-hidden relative">
          {/* Mobile Overlay Backdrop */}
          {isMobile && (leftOpen || rightOpen) && (
            <div className="mobile-overlay" onClick={closeAllPanels} />
          )}

          {/* Left Panel */}
          {(!isMobile || leftOpen) && (
            <div
              className={`flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
                isMobile ? "panel-mobile-overlay panel-left" : ""
              }`}
              style={{
                width: isMobile ? "85vw" : leftOpen ? 280 : 0,
                maxWidth: isMobile ? 320 : undefined,
                borderRight: !isMobile && leftOpen ? "1px solid var(--border-primary)" : "none",
                background: "var(--bg-secondary)",
              }}
            >
              <LeftPanel onClose={isMobile ? () => setLeftOpen(false) : undefined} />
            </div>
          )}

          {/* Main Chat Area */}
          <div
            className={`flex-1 min-w-0 overflow-hidden ${isMobile ? "safe-area-bottom" : ""}`}
            style={{ background: "var(--bg-primary)" }}
          >
            <MainChat isMobile={isMobile} />
          </div>

          {/* Right Panel */}
          {(!isMobile || rightOpen) && (
            <div
              className={`flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
                isMobile ? "panel-mobile-overlay panel-right" : ""
              }`}
              style={{
                width: isMobile ? "85vw" : rightOpen ? 300 : 0,
                maxWidth: isMobile ? 320 : undefined,
                borderLeft: !isMobile && rightOpen ? "1px solid var(--border-primary)" : "none",
                background: "var(--bg-secondary)",
              }}
            >
              <RightPanel onClose={isMobile ? () => setRightOpen(false) : undefined} />
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-hidden" style={{ background: "var(--bg-primary)" }}>
          {activeTab === "sohbetlerim" && <SohbetlerimPage />}
          {activeTab === "araclar" && <AraclarPage />}
          {activeTab === "mentor" && <MentorPage />}
          {activeTab === "analiz" && <AnalizPage />}
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="mobile-bottom-nav">
          {mobileNavTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isOdaklan = tab.id === "odaklan";

            if (isOdaklan) {
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className="relative"
                  style={{ color: "var(--accent-primary)" }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-full -mt-3"
                    style={{
                      background: isActive ? "var(--gradient-primary)" : "var(--bg-tertiary)",
                      boxShadow: isActive ? "0 0 14px rgba(16, 185, 129, 0.4)" : "none",
                      border: isActive ? "none" : "1px solid var(--border-secondary)",
                    }}
                  >
                    <IconFocus
                      size={17}
                      className={isActive ? "text-white" : ""}
                      style={isActive ? undefined : { color: "var(--text-tertiary)" }}
                    />
                  </div>
                  <span
                    className="text-[9px] font-semibold"
                    style={{ color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)" }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)",
                  background: isActive ? "var(--accent-primary-light)" : "transparent",
                }}
              >
                {tab.icon}
                <span style={{ color: "inherit" }}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
