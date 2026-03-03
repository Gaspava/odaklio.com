"use client";

import { useState, useEffect } from "react";

interface PomodoroPopupProps {
  onClose: () => void;
  onTimerChange?: (running: boolean, minutes: number, seconds: number) => void;
}

export default function PomodoroPopup({ onClose, onTimerChange }: PomodoroPopupProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [mode, setMode] = useState<"work" | "break">("work");

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setSeconds((s) => {
        if (s === 0) {
          if (minutes === 0) {
            // Timer done - switch mode
            const newMode = mode === "work" ? "break" : "work";
            setMode(newMode);
            setMinutes(newMode === "work" ? 25 : 5);
            setIsRunning(false);
            return 0;
          }
          setMinutes((m) => m - 1);
          return 59;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, minutes, mode]);

  useEffect(() => {
    onTimerChange?.(isRunning, minutes, seconds);
  }, [isRunning, minutes, seconds, onTimerChange]);

  const circumference = 2 * Math.PI * 42;
  const totalSeconds = mode === "work" ? 25 * 60 : 5 * 60;
  const elapsed = totalSeconds - (minutes * 60 + seconds);
  const progress = (elapsed / totalSeconds) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const modeColor = mode === "work" ? "var(--accent-primary)" : "var(--accent-cyan)";

  return (
    <div className="tool-popup tool-popup-pomodoro" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Pomodoro
        </h3>
        <button onClick={onClose} className="flex items-center justify-center w-6 h-6 rounded-md transition-all hover:bg-[var(--bg-tertiary)]"
          style={{ color: "var(--text-tertiary)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

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
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[9px] font-semibold" style={{ color: modeColor }}>
              {mode === "work" ? "Odak" : "Mola"}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button onClick={() => setIsRunning(!isRunning)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all active:scale-95"
          style={{ background: modeColor }}>
          {isRunning ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          )}
        </button>
        <button onClick={() => { setIsRunning(false); setMinutes(mode === "work" ? 25 : 5); setSeconds(0); }}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-lg p-0.5" style={{ background: "var(--bg-tertiary)" }}>
        {(["work", "break"] as const).map((m) => (
          <button key={m}
            onClick={() => { setMode(m); setMinutes(m === "work" ? 25 : 5); setSeconds(0); setIsRunning(false); }}
            className="flex-1 rounded-md py-1.5 text-[10px] font-semibold transition-all"
            style={{
              background: mode === m ? "var(--bg-card)" : "transparent",
              color: mode === m ? (m === "work" ? "var(--accent-primary)" : "var(--accent-cyan)") : "var(--text-tertiary)",
              boxShadow: mode === m ? "var(--shadow-sm)" : "none",
            }}>
            {m === "work" ? "Calis" : "Mola"}
          </button>
        ))}
      </div>
    </div>
  );
}
