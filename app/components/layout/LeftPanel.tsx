"use client";

import { useState } from "react";
import {
  IconPlay,
  IconPause,
  IconRefresh,
  IconFocus,
  IconHeadphones,
  IconBrain,
  IconEye,
  IconLightning,
  IconMoon,
  IconVolume,
  IconChevronRight,
  IconTrendingUp,
} from "../icons/Icons";
import Link from "next/link";

/* ===== POMODORO MINI ===== */
function PomodoroMini() {
  const [isRunning, setIsRunning] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [mode, setMode] = useState<"work" | "break">("work");

  // Daily goal
  const dailyGoal = 4; // 4 pomodoros
  const completed = 2;
  const goalProgress = (completed / dailyGoal) * 100;

  const circumference = 2 * Math.PI * 38;
  const totalSeconds = mode === "work" ? 25 * 60 : 5 * 60;
  const elapsed = totalSeconds - (minutes * 60 + seconds);
  const progress = (elapsed / totalSeconds) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeColor = mode === "work" ? "var(--accent-primary)" : "var(--accent-success)";

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Pomodoro
        </h3>
        <Link
          href="/pomodoro"
          className="flex items-center gap-0.5 text-[10px] font-medium"
          style={{ color: "var(--accent-primary)" }}
        >
          İstatistikler
          <IconChevronRight size={10} />
        </Link>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" className="-rotate-90">
            <circle
              cx="44" cy="44" r="38"
              fill="none"
              stroke="var(--bg-tertiary)"
              strokeWidth="4"
            />
            <circle
              cx="44" cy="44" r="38"
              fill="none"
              stroke={modeColor}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[9px] font-medium" style={{ color: modeColor }}>
              {mode === "work" ? "Odak" : "Mola"}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
              style={{ background: modeColor }}
            >
              {isRunning ? <IconPause size={12} /> : <IconPlay size={12} />}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setMinutes(25);
                setSeconds(0);
                setMode("work");
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-tertiary)",
              }}
            >
              <IconRefresh size={12} />
            </button>
          </div>

          {/* Mode Toggle */}
          <div
            className="flex rounded-md p-0.5"
            style={{ background: "var(--bg-tertiary)" }}
          >
            {(["work", "break"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setMinutes(m === "work" ? 25 : 5);
                  setSeconds(0);
                  setIsRunning(false);
                }}
                className="flex-1 rounded-md py-1 text-[10px] font-medium transition-all"
                style={{
                  background: mode === m ? "var(--bg-card)" : "transparent",
                  color: mode === m ? modeColor : "var(--text-tertiary)",
                }}
              >
                {m === "work" ? "Çalış" : "Mola"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Goal */}
      <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-secondary)" }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            Günlük Hedef
          </span>
          <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--accent-success)" }}>
            <IconTrendingUp size={10} />
            {completed}/{dailyGoal}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: "var(--bg-tertiary)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${goalProgress}%`,
              background: "var(--gradient-primary)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ===== FOCUS MODES COMPACT ===== */
function FocusModesCompact() {
  const [activeMode, setActiveMode] = useState<string | null>(null);

  const modes = [
    { id: "deep", name: "Derin Odak", icon: <IconBrain size={14} />, color: "#8B5CF6" },
    { id: "reading", name: "Okuma", icon: <IconEye size={14} />, color: "#3B82F6" },
    { id: "creative", name: "Yaratıcı", icon: <IconLightning size={14} />, color: "#F59E0B" },
    { id: "night", name: "Gece", icon: <IconMoon size={14} />, color: "#6366F1" },
    { id: "zen", name: "Zen", icon: <IconFocus size={14} />, color: "#64748B" },
  ];

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: "var(--text-tertiary)" }}
      >
        Focus Modu
      </h3>

      <div className="space-y-1">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(activeMode === mode.id ? null : mode.id)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all"
            style={{
              background: activeMode === mode.id ? `${mode.color}15` : "transparent",
              color: activeMode === mode.id ? mode.color : "var(--text-secondary)",
            }}
          >
            {mode.icon}
            <span className="text-xs font-medium">{mode.name}</span>
            {activeMode === mode.id && (
              <div
                className="ml-auto h-2 w-2 rounded-full"
                style={{ background: mode.color, boxShadow: `0 0 6px ${mode.color}` }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== BACKGROUND SOUNDS COMPACT ===== */
function BackgroundSoundsCompact() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(40);

  const sounds = [
    { id: "rain", emoji: "🌧️", name: "Yağmur" },
    { id: "forest", emoji: "🌲", name: "Orman" },
    { id: "ocean", emoji: "🌊", name: "Okyanus" },
    { id: "fire", emoji: "🔥", name: "Şömine" },
    { id: "cafe", emoji: "☕", name: "Kafe" },
    { id: "lofi", emoji: "🎵", name: "Lo-Fi" },
    { id: "white", emoji: "📡", name: "Beyaz G." },
    { id: "birds", emoji: "🐦", name: "Kuşlar" },
  ];

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Arka Plan Sesi
        </h3>
        {activeSound && (
          <span className="flex items-center gap-1">
            <IconHeadphones size={10} className="text-[var(--accent-primary)]" />
            <span className="text-[10px] font-medium" style={{ color: "var(--accent-primary)" }}>
              Aktif
            </span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {sounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => setActiveSound(activeSound === sound.id ? null : sound.id)}
            className="flex flex-col items-center gap-1 rounded-lg py-2 transition-all"
            style={{
              background: activeSound === sound.id ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
              border: activeSound === sound.id ? "1px solid var(--accent-primary)" : "1px solid transparent",
            }}
          >
            <span className="text-base">{sound.emoji}</span>
            <span
              className="text-[9px] font-medium"
              style={{
                color: activeSound === sound.id ? "var(--accent-primary)" : "var(--text-tertiary)",
              }}
            >
              {sound.name}
            </span>
          </button>
        ))}
      </div>

      {activeSound && (
        <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: "1px solid var(--border-secondary)" }}>
          <span style={{ color: "var(--text-tertiary)" }}>
            <IconVolume size={12} />
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: "var(--accent-primary)" }}
          />
          <span className="text-[10px] min-w-[28px] text-right" style={{ color: "var(--text-tertiary)" }}>
            {volume}%
          </span>
        </div>
      )}
    </div>
  );
}

/* ===== LEFT PANEL ===== */
export default function LeftPanel() {
  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <PomodoroMini />
      <FocusModesCompact />
      <BackgroundSoundsCompact />
    </div>
  );
}
