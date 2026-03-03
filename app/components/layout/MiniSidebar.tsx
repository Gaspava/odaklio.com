"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import PomodoroPopup from "../tools/PomodoroPopup";
import AmbientSoundPopup from "../tools/AmbientSoundPopup";
import NewChatPopup from "../tools/NewChatPopup";
import NotesPopup from "../tools/NotesPopup";

interface MiniSidebarProps {
  onNewChat: (style: string) => void;
  onClearChat: () => void;
}

export default function MiniSidebar({ onNewChat, onClearChat }: MiniSidebarProps) {
  const [activePopup, setActivePopup] = useState<"new-chat" | "pomodoro" | "sound" | "notes" | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState({ minutes: 25, seconds: 0 });
  const [soundPlaying, setSoundPlaying] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close popup on outside click
  useEffect(() => {
    if (!activePopup) return;
    const handleClick = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setActivePopup(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [activePopup]);

  const togglePopup = useCallback((popup: "new-chat" | "pomodoro" | "sound" | "notes") => {
    setActivePopup((prev) => (prev === popup ? null : popup));
  }, []);

  const handleTimerChange = useCallback((running: boolean, minutes: number, seconds: number) => {
    setPomodoroRunning(running);
    setPomodoroTime({ minutes, seconds });
  }, []);

  const handleSoundChange = useCallback((playing: boolean) => {
    setSoundPlaying(playing);
  }, []);

  const handleClearConfirm = () => {
    onClearChat();
    setShowClearConfirm(false);
  };

  return (
    <div className="mini-sidebar" ref={sidebarRef}>
      {/* Clear Chat */}
      <button className="mini-sidebar-btn" onClick={() => setShowClearConfirm(true)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        <span className="mini-sidebar-tooltip">Temizle</span>
      </button>

      {/* Notes */}
      <div className="relative">
        <button
          className={`mini-sidebar-btn ${activePopup === "notes" ? "active" : ""}`}
          onClick={() => togglePopup("notes")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="mini-sidebar-tooltip">Notlarım</span>
        </button>
        {activePopup === "notes" && (
          <NotesPopup
            onClose={() => setActivePopup(null)}
          />
        )}
      </div>

      {/* Ambient Sound */}
      <div className="relative">
        <button
          className={`mini-sidebar-btn ${activePopup === "sound" ? "active" : ""}`}
          onClick={() => togglePopup("sound")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
          </svg>
          {soundPlaying && (
            <div className="sound-wave">
              <span /><span /><span />
            </div>
          )}
          <span className="mini-sidebar-tooltip">Arka Plan Sesi</span>
        </button>
        {activePopup === "sound" && (
          <AmbientSoundPopup
            onClose={() => setActivePopup(null)}
            onSoundChange={handleSoundChange}
          />
        )}
      </div>

      {/* Pomodoro */}
      <div className="relative">
        <button
          className={`mini-sidebar-btn ${activePopup === "pomodoro" ? "active" : ""}`}
          onClick={() => togglePopup("pomodoro")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="13" r="8" />
            <path d="M12 9v4l2 2" />
            <path d="M5 3L2 6" />
            <path d="M22 6l-3-3" />
          </svg>
          {pomodoroRunning && (
            <span className="pomodoro-indicator">
              {String(pomodoroTime.minutes).padStart(2, "0")}:{String(pomodoroTime.seconds).padStart(2, "0")}
            </span>
          )}
          <span className="mini-sidebar-tooltip">Pomodoro</span>
        </button>
        {activePopup === "pomodoro" && (
          <PomodoroPopup
            onClose={() => setActivePopup(null)}
            onTimerChange={handleTimerChange}
          />
        )}
      </div>

      {/* New Chat - green accent circle */}
      <div className="relative">
        <button
          className={`mini-sidebar-btn ${activePopup === "new-chat" ? "active" : ""}`}
          onClick={() => togglePopup("new-chat")}
          style={{
            background: "var(--accent-primary)",
            color: "white",
            border: "none",
            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.35)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="mini-sidebar-tooltip">Yeni Sohbet</span>
        </button>
        {activePopup === "new-chat" && (
          <NewChatPopup
            onSelectMode={(mode) => {
              onNewChat(mode);
              setActivePopup(null);
            }}
            onClose={() => setActivePopup(null)}
          />
        )}
      </div>

      {/* Clear Chat Confirm Dialog */}
      {showClearConfirm && (
        <div className="confirm-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Sohbeti Temizle
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
              Mevcut sohbet temizlenecek ve yeni bir sohbet baslatilacak. Emin misiniz?
            </p>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
              >
                Iptal
              </button>
              <button
                onClick={handleClearConfirm}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all active:scale-95"
                style={{ background: "var(--accent-danger)" }}
              >
                Temizle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
