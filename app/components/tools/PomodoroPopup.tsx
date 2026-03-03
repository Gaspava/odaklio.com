"use client";

import { useState, useEffect, useCallback } from "react";
import { usePomodoro } from "@/app/providers/PomodoroProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import { getRecentSessions, PomodoroSession } from "@/lib/db/pomodoro";

interface PomodoroPopupProps {
  onClose: () => void;
  onTimerChange?: (running: boolean, minutes: number, seconds: number) => void;
  inline?: boolean;
}

export default function PomodoroPopup({ onClose, onTimerChange, inline }: PomodoroPopupProps) {
  const { user } = useAuth();
  const {
    isRunning,
    isPaused,
    mode,
    timeLeft,
    totalTime,
    settings,
    completedPomodoros,
    currentSubject,
    start,
    pause,
    resume,
    reset,
    skip,
    updateSettings,
  } = usePomodoro();

  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [recentSessions, setRecentSessions] = useState<PomodoroSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Derived display values
  const displayMinutes = Math.floor(timeLeft / 60);
  const displaySeconds = timeLeft % 60;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  // SVG circle values
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const modeColor = mode === "work" ? "var(--accent-primary)" : "var(--accent-cyan)";

  // Callback for parent
  useEffect(() => {
    onTimerChange?.(isRunning && !isPaused, displayMinutes, displaySeconds);
  }, [isRunning, isPaused, displayMinutes, displaySeconds, onTimerChange]);

  // Load recent sessions when history panel opens
  const loadRecentSessions = useCallback(async () => {
    if (!user) return;
    setLoadingSessions(true);
    try {
      const sessions = await getRecentSessions(user.id, 5);
      setRecentSessions(sessions);
    } catch (e) {
      console.error("Failed to load recent sessions:", e);
    } finally {
      setLoadingSessions(false);
    }
  }, [user]);

  useEffect(() => {
    if (showHistory) {
      loadRecentSessions();
    }
  }, [showHistory, loadRecentSessions]);

  // Play/Pause/Start handler
  const handlePlayPause = () => {
    if (isRunning) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      start();
    }
  };

  // Reset handler
  const handleReset = () => {
    reset();
  };

  // Format time helper for session history
  const formatSessionTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatSessionDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Bugun";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Dun";
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  return (
    <div className={inline ? "" : "tool-popup tool-popup-pomodoro"} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Pomodoro
          {completedPomodoros > 0 && (
            <span className="ml-2 text-[10px] font-normal" style={{ color: modeColor }}>
              {completedPomodoros} tamamlandi
            </span>
          )}
        </h3>
        <button onClick={onClose} className="flex items-center justify-center w-6 h-6 rounded-md transition-all hover:bg-[var(--bg-tertiary)]"
          style={{ color: "var(--text-tertiary)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Current Subject */}
      {currentSubject && (
        <div className="mb-3 text-center">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
            {currentSubject}
          </span>
        </div>
      )}

      {/* Timer Circle */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative">
          <svg width="100" height="100" className="-rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg-tertiary)" strokeWidth="4" />
            <circle cx="50" cy="50" r="42" fill="none" stroke={modeColor} strokeWidth="4"
              strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear", filter: `drop-shadow(0 0 4px ${modeColor === "var(--accent-primary)" ? "rgba(16,185,129,0.4)" : "rgba(6,182,212,0.4)"})` }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
              {String(displayMinutes).padStart(2, "0")}:{String(displaySeconds).padStart(2, "0")}
            </span>
            <span className="text-[9px] font-semibold" style={{ color: modeColor }}>
              {mode === "work" ? "Odak" : "Mola"}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button onClick={handlePlayPause}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all active:scale-95"
          style={{ background: modeColor }}>
          {isRunning && !isPaused ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          )}
        </button>
        <button onClick={handleReset}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
        {mode === "break" && (
          <button onClick={() => skip()}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
            title="Molayi atla">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 4 15 12 5 20 5 4" /><rect x="15" y="4" width="4" height="16" />
            </svg>
          </button>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-lg p-0.5" style={{ background: "var(--bg-tertiary)" }}>
        {(["work", "break"] as const).map((m) => (
          <button key={m}
            onClick={() => {
              if (!isRunning) {
                // Only allow mode switch when not running; provider handles via reset
                if (m !== mode) {
                  reset();
                }
              }
            }}
            className="flex-1 rounded-md py-1.5 text-[10px] font-semibold transition-all"
            style={{
              background: mode === m ? "var(--bg-card)" : "transparent",
              color: mode === m ? (m === "work" ? "var(--accent-primary)" : "var(--accent-cyan)") : "var(--text-tertiary)",
              boxShadow: mode === m ? "var(--shadow-sm)" : "none",
              opacity: isRunning && mode !== m ? 0.5 : 1,
              cursor: isRunning && mode !== m ? "not-allowed" : "pointer",
            }}>
            {m === "work" ? "Calis" : "Mola"}
          </button>
        ))}
      </div>

      {/* Settings & History Toggles */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => { setShowSettings(!showSettings); setShowHistory(false); }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
          style={{
            background: showSettings ? "var(--bg-card)" : "var(--bg-tertiary)",
            color: showSettings ? "var(--accent-primary)" : "var(--text-tertiary)",
            boxShadow: showSettings ? "var(--shadow-sm)" : "none",
          }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          Ayarlar
        </button>
        <button
          onClick={() => { setShowHistory(!showHistory); setShowSettings(false); }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
          style={{
            background: showHistory ? "var(--bg-card)" : "var(--bg-tertiary)",
            color: showHistory ? "var(--accent-primary)" : "var(--text-tertiary)",
            boxShadow: showHistory ? "var(--shadow-sm)" : "none",
          }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          Gecmis
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>
                Calisma (dk)
              </label>
              <input
                type="number"
                min={1}
                max={120}
                value={settings.workMinutes}
                onChange={(e) => updateSettings({ workMinutes: Math.max(1, Math.min(120, Number(e.target.value))) })}
                className="w-14 px-2 py-1 rounded-md text-[11px] text-center font-semibold outline-none"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                }}
                disabled={isRunning}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>
                Kisa Mola (dk)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={settings.shortBreakMinutes}
                onChange={(e) => updateSettings({ shortBreakMinutes: Math.max(1, Math.min(30, Number(e.target.value))) })}
                className="w-14 px-2 py-1 rounded-md text-[11px] text-center font-semibold outline-none"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                }}
                disabled={isRunning}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>
                Uzun Mola (dk)
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={settings.longBreakMinutes}
                onChange={(e) => updateSettings({ longBreakMinutes: Math.max(1, Math.min(60, Number(e.target.value))) })}
                className="w-14 px-2 py-1 rounded-md text-[11px] text-center font-semibold outline-none"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-primary)",
                }}
                disabled={isRunning}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions Panel */}
      {showHistory && (
        <div className="mt-3 p-3 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
          <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
            Son Oturumlar
          </h4>
          {loadingSessions ? (
            <div className="text-[10px] text-center py-2" style={{ color: "var(--text-tertiary)" }}>
              Yukleniyor...
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="text-[10px] text-center py-2" style={{ color: "var(--text-tertiary)" }}>
              Henuz oturum yok
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between py-1 px-2 rounded-md"
                  style={{ background: "var(--bg-card)" }}>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium" style={{ color: "var(--text-primary)" }}>
                      {session.subject || "Odak"}
                    </span>
                    <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>
                      {formatSessionDate(session.started_at)} {formatSessionTime(session.started_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold tabular-nums" style={{ color: "var(--text-secondary)" }}>
                      {Math.round(session.actual_seconds / 60)}dk
                    </span>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: session.status === "completed" ? "var(--accent-primary)" : "var(--text-tertiary)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
