"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "./components/layout/Header";
import LeftPanel from "./components/layout/LeftPanel";
import RightPanel from "./components/layout/RightPanel";
import MainChat from "./components/chatbot/MainChat";
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

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <Header
        onToggleLeft={toggleLeft}
        onToggleRight={toggleRight}
        onChat={() => { setLeftOpen(false); setRightOpen(false); }}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
      />

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

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="mobile-bottom-nav">
          <button
            onClick={toggleLeft}
            style={{
              color: leftOpen ? "var(--accent-primary)" : "var(--text-tertiary)",
              background: leftOpen ? "var(--accent-primary-light)" : "transparent",
            }}
          >
            <IconPomodoro size={19} />
            <span style={{ color: "inherit" }}>Araçlar</span>
          </button>

          <button
            onClick={() => { setLeftOpen(false); setRightOpen(false); }}
            style={{
              color: !leftOpen && !rightOpen ? "var(--accent-primary)" : "var(--text-tertiary)",
              background: !leftOpen && !rightOpen ? "var(--accent-primary-light)" : "transparent",
            }}
          >
            <IconChat size={19} />
            <span style={{ color: "inherit" }}>Sohbet</span>
          </button>

          <button
            onClick={toggleRight}
            style={{
              color: rightOpen ? "var(--accent-primary)" : "var(--text-tertiary)",
              background: rightOpen ? "var(--accent-primary-light)" : "transparent",
            }}
          >
            <IconMentor size={19} />
            <span style={{ color: "inherit" }}>Mentor</span>
          </button>
        </nav>
      )}
    </div>
  );
}
