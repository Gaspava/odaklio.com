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

interface LeftPanelProps {
  onClose?: () => void;
}

/* ===== POMODORO MINI ===== */
function PomodoroMini() {
  const [isRunning, setIsRunning] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [mode, setMode] = useState<"work" | "break">("work");

  const dailyGoal = 4;
  const completed = 2;
  const goalProgress = (completed / dailyGoal) * 100;

  const circumference = 2 * Math.PI * 42;
  const totalSeconds = mode === "work" ? 25 * 60 : 5 * 60;
  const elapsed = totalSeconds - (minutes * 60 + seconds);
  const progress = (elapsed / totalSeconds) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeColor = mode === "work" ? "var(--accent-primary)" : "var(--accent-cyan)";

  return (
    <div
      className="rounded-2xl p-5 transition-all group relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      {/* Subtle hover gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(6, 182, 212, 0.02) 100%)",
        }}
      />

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)",
              color: "var(--accent-primary)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2" />
            </svg>
          </div>
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--text-tertiary)" }}
          >
            Pomodoro
          </h3>
        </div>
        <Link
          href="/pomodoro"
          className="flex items-center gap-0.5 text-[10px] font-semibold hover-underline"
          style={{ color: "var(--accent-primary)" }}
        >
          İstatistikler
          <IconChevronRight size={10} />
        </Link>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" className="-rotate-90">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="var(--bg-tertiary)"
              strokeWidth="4"
            />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke={modeColor}
              strokeWidth="4"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear", filter: `drop-shadow(0 0 4px ${modeColor})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-lg font-bold tabular-nums"
              style={{ color: "var(--text-primary)" }}
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[9px] font-semibold" style={{ color: modeColor }}>
              {mode === "work" ? "Odak" : "Mola"}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-lg text-white transition-all active:scale-95"
              style={{ background: modeColor, boxShadow: `0 0 8px ${modeColor}40` }}
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
              className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-lg transition-all active:scale-95"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-tertiary)",
              }}
            >
              <IconRefresh size={12} />
            </button>
          </div>

          <div
            className="flex rounded-xl p-0.5"
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
                className="flex-1 rounded-xl py-1.5 sm:py-1 text-[10px] font-semibold transition-all"
                style={{
                  background: mode === m ? "var(--bg-card)" : "transparent",
                  color: mode === m ? modeColor : "var(--text-tertiary)",
                  boxShadow: mode === m ? "var(--shadow-sm)" : "none",
                }}
              >
                {m === "work" ? "Çalış" : "Mola"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Goal */}
      <div className="mt-4 pt-3 relative z-10" style={{ borderTop: "1px solid var(--border-secondary)" }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            Günlük Hedef
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "var(--accent-success)" }}>
            <IconTrendingUp size={10} />
            {completed}/{dailyGoal}
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: "var(--bg-tertiary)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${goalProgress}%`,
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-glow-sm)",
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
    { id: "deep", name: "Derin Odak", icon: <IconBrain size={14} />, color: "#10b981", desc: "Derin konsantrasyon" },
    { id: "reading", name: "Okuma", icon: <IconEye size={14} />, color: "#3b82f6", desc: "Hızlı okuma modu" },
    { id: "creative", name: "Yaratıcı", icon: <IconLightning size={14} />, color: "#f59e0b", desc: "Beyin fırtınası" },
    { id: "night", name: "Gece", icon: <IconMoon size={14} />, color: "#8b5cf6", desc: "Göz koruma" },
    { id: "zen", name: "Zen", icon: <IconFocus size={14} />, color: "#64748b", desc: "Minimal dikkat" },
  ];

  return (
    <div
      className="rounded-2xl p-5 transition-all group relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      {/* Subtle hover gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(139, 92, 246, 0.02) 100%)",
        }}
      />

      {/* Section Header with subtle gradient */}
      <div
        className="flex items-center gap-2.5 mb-4 -mx-5 -mt-5 px-5 pt-4 pb-3 relative z-10 rounded-t-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(59, 130, 246, 0.04) 0%, transparent 100%)",
        }}
      >
        <div
          className="flex h-7 w-7 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.08) 100%)",
            color: "var(--accent-secondary)",
          }}
        >
          <IconFocus size={14} />
        </div>
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Focus Modu
        </h3>
      </div>

      <div className="space-y-1 relative z-10">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(activeMode === mode.id ? null : mode.id)}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-3 sm:py-2.5 transition-all active:scale-[0.98]"
            style={{
              background: activeMode === mode.id ? `${mode.color}12` : "transparent",
              color: activeMode === mode.id ? mode.color : "var(--text-secondary)",
            }}
          >
            <span style={{ opacity: activeMode === mode.id ? 1 : 0.7 }}>{mode.icon}</span>
            <div className="flex-1 text-left">
              <span className="text-xs font-semibold block">{mode.name}</span>
              {activeMode === mode.id && (
                <span className="text-[9px] block" style={{ color: "var(--text-tertiary)" }}>{mode.desc}</span>
              )}
            </div>
            {activeMode === mode.id && (
              <div
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ background: mode.color, boxShadow: `0 0 8px ${mode.color}` }}
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
    { id: "rain", emoji: "\u{1F327}\u{FE0F}", name: "Yağmur" },
    { id: "forest", emoji: "\u{1F332}", name: "Orman" },
    { id: "ocean", emoji: "\u{1F30A}", name: "Okyanus" },
    { id: "fire", emoji: "\u{1F525}", name: "Şömine" },
    { id: "cafe", emoji: "\u{2615}", name: "Kafe" },
    { id: "lofi", emoji: "\u{1F3B5}", name: "Lo-Fi" },
    { id: "white", emoji: "\u{1F4E1}", name: "Beyaz G." },
    { id: "birds", emoji: "\u{1F426}", name: "Kuşlar" },
  ];

  return (
    <div
      className="rounded-2xl p-5 transition-all group relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      {/* Subtle hover gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(6, 182, 212, 0.02) 100%)",
        }}
      />

      {/* Section Header with subtle gradient */}
      <div className="flex items-center justify-between mb-4 -mx-5 -mt-5 px-5 pt-4 pb-3 relative z-10 rounded-t-2xl"
        style={{
          background: "linear-gradient(180deg, rgba(139, 92, 246, 0.04) 0%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)",
              color: "var(--accent-purple)",
            }}
          >
            <IconHeadphones size={14} />
          </div>
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "var(--text-tertiary)" }}
          >
            Arka Plan Sesi
          </h3>
        </div>
        {activeSound && (
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold"
            style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-primary)" }} />
            Aktif
          </span>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 relative z-10">
        {sounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => setActiveSound(activeSound === sound.id ? null : sound.id)}
            className="flex flex-col items-center gap-1 rounded-2xl py-3 sm:py-2.5 transition-all active:scale-95"
            style={{
              background: activeSound === sound.id ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
              border: activeSound === sound.id ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid transparent",
              boxShadow: activeSound === sound.id ? "var(--shadow-glow-sm)" : "none",
            }}
          >
            <span className="text-base">{sound.emoji}</span>
            <span
              className="text-[9px] font-semibold"
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
        <div
          className="flex items-center gap-2.5 mt-4 pt-3 relative z-10 rounded-xl px-3 py-2.5"
          style={{
            background: "var(--bg-tertiary)",
          }}
        >
          <span style={{ color: "var(--accent-primary)", opacity: 0.7 }}>
            <IconVolume size={14} />
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
          <span
            className="text-[10px] font-bold min-w-[32px] text-right tabular-nums px-1.5 py-0.5 rounded-md"
            style={{
              color: "var(--accent-primary)",
              background: "var(--accent-primary-light)",
            }}
          >
            {volume}%
          </span>
        </div>
      )}
    </div>
  );
}

/* ===== LEFT PANEL ===== */
export default function LeftPanel({ onClose }: LeftPanelProps) {
  return (
    <div className="h-full overflow-y-auto p-3 space-y-3 stagger-children relative">
      {/* Top accent bar - thin green gradient line */}
      <div
        className="absolute top-0 left-3 right-3 h-[2px] rounded-full"
        style={{
          background: "var(--gradient-hero)",
          opacity: 0.6,
        }}
      />

      <div className="pb-0.5 pt-2">
        <h2 className="text-sm font-bold gradient-text-hero" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", background: "var(--gradient-hero)" }}>
          Araçlar
        </h2>
      </div>

      {/* Pomodoro section with subtle gradient header */}
      <div className="relative">
        <div
          className="absolute -top-0 left-0 right-0 h-12 rounded-t-2xl pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, transparent 100%)",
          }}
        />
        <PomodoroMini />
      </div>

      <FocusModesCompact />
      <BackgroundSoundsCompact />
    </div>
  );
}
