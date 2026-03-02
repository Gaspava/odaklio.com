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
  IconChat,
} from "../icons/Icons";
import Link from "next/link";
import { useConversation } from "@/app/providers/ConversationProvider";
import type { Conversation } from "@/lib/db/conversations";

interface LeftPanelProps {
  onClose?: () => void;
  onOpenConversation?: (id: string) => void;
}

/* ===== RELATIVE TIME ===== */
function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  if (diffDay === 1) return "Dün";
  if (diffDay < 7) return `${diffDay} gün önce`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} hafta önce`;
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

/* ===== CHAT HISTORY SIDEBAR ===== */
function ChatHistorySidebar({ onOpenConversation }: { onOpenConversation?: (id: string) => void }) {
  const { conversations, activeConversationId, startNewConversation } = useConversation();

  return (
    <div
      className="rounded-xl p-3 transition-all"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-md"
            style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
          >
            <IconChat size={10} />
          </div>
          <h3
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: "var(--text-tertiary)" }}
          >
            Sohbetler
          </h3>
        </div>
        <button
          onClick={() => {
            startNewConversation();
            onOpenConversation?.("");
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all active:scale-95"
          style={{
            background: "var(--accent-primary-light)",
            color: "var(--accent-primary)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yeni
        </button>
      </div>

      {conversations.length === 0 ? (
        <p className="text-[10px] text-center py-4" style={{ color: "var(--text-tertiary)" }}>
          Henüz sohbet yok
        </p>
      ) : (
        <div className="space-y-0.5 max-h-[280px] overflow-y-auto">
          {conversations.map((conv: Conversation) => {
            const isActive = activeConversationId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => onOpenConversation?.(conv.id)}
                className="w-full text-left flex items-center gap-2 rounded-lg px-2 py-2 transition-all active:scale-[0.98]"
                style={{
                  background: isActive ? "var(--accent-primary-light)" : "transparent",
                  color: isActive ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium truncate">{conv.title}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {relativeTime(conv.updated_at)}
                  </p>
                </div>
                {isActive && (
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "var(--accent-primary)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
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

  const circumference = 2 * Math.PI * 38;
  const totalSeconds = mode === "work" ? 25 * 60 : 5 * 60;
  const elapsed = totalSeconds - (minutes * 60 + seconds);
  const progress = (elapsed / totalSeconds) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeColor = mode === "work" ? "var(--accent-primary)" : "var(--accent-cyan)";

  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-md"
            style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2" />
            </svg>
          </div>
          <h3
            className="text-[11px] font-bold uppercase tracking-wider"
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

        <div className="flex-1 space-y-2">
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
            className="flex rounded-lg p-0.5"
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
                className="flex-1 rounded-md py-1.5 sm:py-1 text-[10px] font-semibold transition-all"
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
      <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-secondary)" }}>
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
      className="rounded-xl p-4 transition-all"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex h-5 w-5 items-center justify-center rounded-md"
          style={{ background: "var(--accent-secondary-light)", color: "var(--accent-secondary)" }}
        >
          <IconFocus size={10} />
        </div>
        <h3
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Focus Modu
        </h3>
      </div>

      <div className="space-y-1">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(activeMode === mode.id ? null : mode.id)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 sm:py-2 transition-all active:scale-[0.98]"
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
      className="rounded-xl p-4 transition-all"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-md"
            style={{ background: "var(--accent-purple-light)", color: "var(--accent-purple)" }}
          >
            <IconHeadphones size={10} />
          </div>
          <h3
            className="text-[11px] font-bold uppercase tracking-wider"
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

      <div className="grid grid-cols-4 gap-1.5">
        {sounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => setActiveSound(activeSound === sound.id ? null : sound.id)}
            className="flex flex-col items-center gap-1 rounded-xl py-2.5 sm:py-2 transition-all active:scale-95"
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
          <span className="text-[10px] font-semibold min-w-[28px] text-right" style={{ color: "var(--text-tertiary)" }}>
            {volume}%
          </span>
        </div>
      )}
    </div>
  );
}

/* ===== LEFT PANEL ===== */
export default function LeftPanel({ onClose, onOpenConversation }: LeftPanelProps) {
  return (
    <div className="h-full overflow-y-auto p-3 space-y-3 stagger-children">
      <div className="pb-0.5">
        <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Araçlar
        </h2>
      </div>
      <ChatHistorySidebar onOpenConversation={onOpenConversation} />
      <PomodoroMini />
      <FocusModesCompact />
      <BackgroundSoundsCompact />
    </div>
  );
}
