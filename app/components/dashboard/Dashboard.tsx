"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar, { type PageType } from "../layout/Sidebar";
import MiniSidebar from "../layout/MiniSidebar";
import MainChat from "../chatbot/MainChat";
import MindmapChat from "../chatbot/MindmapChat";
import FlashcardChat from "../chatbot/FlashcardChat";
import RoadmapChat from "../chatbot/RoadmapChat";
import ChatHistoryPage from "../pages/ChatHistoryPage";
import { NotlarimDetail, FlashcardDetail, RoadmapDetail, PomodoroDetail, SpeedReadDetail } from "../pages/ToolsPage";
import MentorPage from "../pages/MentorPage";
import AnalysisPage from "../pages/AnalysisPage";
import PomodoroPopup from "../tools/PomodoroPopup";
import AmbientSoundPopup from "../tools/AmbientSoundPopup";
import NewChatPopup from "../tools/NewChatPopup";
import NotesPopup from "../tools/NotesPopup";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [activeSpecialMode, setActiveSpecialMode] = useState<"flashcard" | "roadmap" | "mindmap" | null>(null);
  const [pendingInitialMessage, setPendingInitialMessage] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<PageType>(initialPage || "focus");
  const [mobileBottomSheet, setMobileBottomSheet] = useState<"pomodoro" | "sound" | "new-chat" | "notes" | null>(null);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState({ minutes: 25, seconds: 0 });
  const [soundPlaying, setSoundPlaying] = useState(false);
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  const { loadConversation, startNewConversation, conversations, activeConversationType, activeConversationId } = useConversation();
  const { trackPageChange } = usePageTracking();
  const { setCurrentPage, setCurrentSubject } = usePomodoro();

  useEffect(() => {
    trackPageChange(activePage, activeConversationId || null);
    setCurrentPage(activePage);
  }, [activePage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeConversationType === "roadmap") setActiveSpecialMode("roadmap");
    else if (activeConversationType === "flashcard") setActiveSpecialMode("flashcard");
  }, [activeConversationType]);

  useEffect(() => {
    if (activeConversationId && conversations) {
      const conv = conversations.find(c => c.id === activeConversationId);
      if (conv) setCurrentSubject(conv.title || null);
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Touch gestures for mobile sidebar
  useEffect(() => {
    if (!isMobile) return;
    let touchStartX = 0;
    const minSwipeDistance = 60;
    const handleTouchStart = (e: TouchEvent) => { touchStartX = e.changedTouches[0].screenX; };
    const handleTouchEnd = (e: TouchEvent) => {
      const distance = e.changedTouches[0].screenX - touchStartX;
      if (distance > minSwipeDistance && touchStartX < 30) setSidebarOpen(true);
      if (distance < -minSwipeDistance && sidebarOpen) setSidebarOpen(false);
    };
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, sidebarOpen]);

  useEffect(() => {
    if (isMobile && sidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, sidebarOpen]);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);

  const handleNewChat = useCallback(() => {
    startNewConversation();
    setActiveSpecialMode(null);
    setPendingInitialMessage(null);
    setChatKey(k => k + 1);
    setActivePage("focus");
    router.push("/");
  }, [startNewConversation, router]);

  const handleClearChat = () => {
    startNewConversation();
    setActiveSpecialMode(null);
    setPendingInitialMessage(null);
    setChatKey(k => k + 1);
  };

  const handleModeSwitch = useCallback((mode: string, initialMessage?: string) => {
    startNewConversation();
    setPendingInitialMessage(initialMessage || null);
    setActiveSpecialMode(mode as "flashcard" | "roadmap" | "mindmap");
  }, [startNewConversation]);

  const handlePageChange = useCallback((page: PageType) => {
    setActivePage(page);
    router.push(PAGE_ROUTES[page]);
  }, [router]);

  const handleOpenConversation = useCallback((id: string) => {
    if (id) {
      setPendingInitialMessage(null);
      loadConversation(id).then(({ type }) => {
        if (type === "roadmap") setActiveSpecialMode("roadmap");
        else if (type === "flashcard") setActiveSpecialMode("flashcard");
        else setActiveSpecialMode(null);
        setChatKey(k => k + 1);
        setActivePage("focus");
        router.push(`/chat/${id}`);
        if (isMobile) setSidebarOpen(false);
      });
    } else {
      startNewConversation();
      setActiveSpecialMode(null);
      setChatKey(k => k + 1);
      setActivePage("focus");
      router.push("/");
      if (isMobile) setSidebarOpen(false);
    }
  }, [loadConversation, startNewConversation, isMobile, router]);

  const handleToolBack = useCallback(() => {
    handlePageChange("focus");
  }, [handlePageChange]);

  const renderPageContent = () => {
    switch (activePage) {
      case "history":
        return <ChatHistoryPage onOpenConversation={handleOpenConversation} />;
      case "focus":
        if (activeSpecialMode === "flashcard") return <FlashcardChat key={chatKey} isMobile={isMobile} initialMessage={pendingInitialMessage || undefined} />;
        if (activeSpecialMode === "roadmap") return <RoadmapChat key={chatKey} isMobile={isMobile} onOpenConversation={handleOpenConversation} initialMessage={pendingInitialMessage || undefined} />;
        if (activeSpecialMode === "mindmap") return <MindmapChat key={chatKey} isMobile={isMobile} />;
        return <MainChat key={chatKey} isMobile={isMobile} onModeSwitch={handleModeSwitch} />;
      case "mentor":
        return <MentorPage />;
      case "analysis":
        return <AnalysisPage />;
      case "notes":
        return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><NotlarimDetail onBack={handleToolBack} /></div></div>;
      case "flashcards":
        return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><FlashcardDetail onBack={handleToolBack} /></div></div>;
      case "roadmaps":
        return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><RoadmapDetail onBack={handleToolBack} onOpenConversation={handleOpenConversation} /></div></div>;
      case "pomodoro-tool":
        return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><PomodoroDetail onBack={handleToolBack} /></div></div>;
      case "speedread":
        return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><SpeedReadDetail onBack={handleToolBack} /></div></div>;
      default:
        return <MainChat key={chatKey} isMobile={isMobile} />;
    }
  };

  return (
    <div className="flex flex-col overflow-hidden" style={{ background: "var(--bg-primary)", height: "100dvh" }}>
      {/* Header bar - hamburger left, ODAKLIO right */}
      <header className="dashboard-header">
        <button onClick={toggleSidebar} className="dashboard-hamburger" title="Menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span
          className="dashboard-logo"
          style={{
            backgroundImage: theme === "dark"
              ? "linear-gradient(90deg, #e2e8f0, #f8fafc)"
              : "linear-gradient(90deg, #1e293b, #334155)",
          }}
        >
          ODAKLIO
        </span>
      </header>

      {/* Main area with MiniSidebar + Content */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* MiniSidebar - old style, always visible on desktop */}
        {!isMobile && (
          <MiniSidebar
            onNewChat={() => handleNewChat()}
            onClearChat={handleClearChat}
          />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden" style={{ background: "var(--bg-primary)" }}>
          {renderPageContent()}
        </div>
      </div>

      {/* Sidebar panel - overlay, toggled by hamburger */}
      <Sidebar
        activePage={activePage}
        onPageChange={handlePageChange}
        onNewChat={handleNewChat}
        onOpenConversation={handleOpenConversation}
        onLogout={onLogout}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Mobile Bottom Sheets */}
      {isMobile && mobileBottomSheet && (
        <div className="bottom-sheet-overlay" onClick={() => setMobileBottomSheet(null)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="bottom-sheet-handle" />
            {mobileBottomSheet === "pomodoro" && <PomodoroPopup onClose={() => setMobileBottomSheet(null)} onTimerChange={handleTimerChange} inline />}
            {mobileBottomSheet === "sound" && <AmbientSoundPopup onClose={() => setMobileBottomSheet(null)} onSoundChange={handleSoundChange} inline />}
            {mobileBottomSheet === "new-chat" && <NewChatPopup onSelectMode={() => { handleNewChat(); setMobileBottomSheet(null); }} onClose={() => setMobileBottomSheet(null)} inline />}
            {mobileBottomSheet === "notes" && <NotesPopup onClose={() => setMobileBottomSheet(null)} inline />}
          </div>
        </div>
      )}
    </div>
  );
}
