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
  IconTrendingUp,
  IconPomodoro,
  IconSettings,
} from "../icons/Icons";

/* ===== POMODORO FULL ===== */
function PomodoroFull() {
  const [isRunning, setIsRunning] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [mode, setMode] = useState<"work" | "break">("work");

  const dailyGoal = 4;
  const completed = 2;
  const goalProgress = (completed / dailyGoal) * 100;

  const circumference = 2 * Math.PI * 54;
  const totalSeconds = mode === "work" ? 25 * 60 : 5 * 60;
  const elapsed = totalSeconds - (minutes * 60 + seconds);
  const progress = (elapsed / totalSeconds) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const modeColor = mode === "work" ? "var(--accent-primary)" : "var(--accent-cyan)";

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg"
            style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
          >
            <IconPomodoro size={14} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Pomodoro Zamanlayıcı
          </h3>
        </div>
        <span
          className="flex items-center gap-1 text-[11px] font-semibold"
          style={{ color: "var(--accent-success)" }}
        >
          <IconTrendingUp size={12} />
          {completed}/{dailyGoal} tamamlandı
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Timer Circle */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" className="-rotate-90">
            <circle cx="70" cy="70" r="54" fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" />
            <circle
              cx="70" cy="70" r="54"
              fill="none"
              stroke={modeColor}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear", filter: `drop-shadow(0 0 6px ${modeColor})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: modeColor }}>
              {mode === "work" ? "Odak Zamanı" : "Mola Zamanı"}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all active:scale-95"
              style={{ background: modeColor, boxShadow: `0 0 12px ${modeColor}40` }}
            >
              {isRunning ? <IconPause size={16} /> : <IconPlay size={16} />}
            </button>
            <button
              onClick={() => { setIsRunning(false); setMinutes(25); setSeconds(0); setMode("work"); }}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
            >
              <IconRefresh size={16} />
            </button>
          </div>

          <div className="flex rounded-xl p-1" style={{ background: "var(--bg-tertiary)" }}>
            {(["work", "break"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setMinutes(m === "work" ? 25 : 5); setSeconds(0); setIsRunning(false); }}
                className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
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

          {/* Goal Progress */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                Günlük Hedef
              </span>
              <span className="text-[11px] font-semibold" style={{ color: "var(--accent-success)" }}>
                %{Math.round(goalProgress)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${goalProgress}%`, background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== FOCUS MODES FULL ===== */
function FocusModesFull() {
  const [activeMode, setActiveMode] = useState<string | null>(null);

  const modes = [
    { id: "deep", name: "Derin Odak", icon: <IconBrain size={18} />, color: "#10b981", desc: "Maksimum konsantrasyon. Bildirimler kapatılır, zamanlayıcı başlar.", duration: "25 dk" },
    { id: "reading", name: "Okuma Modu", icon: <IconEye size={18} />, color: "#3b82f6", desc: "Hızlı okuma ve not alma için optimize edilmiş ortam.", duration: "30 dk" },
    { id: "creative", name: "Yaratıcı Mod", icon: <IconLightning size={18} />, color: "#f59e0b", desc: "Beyin fırtınası ve yaratıcı düşünce için serbest alan.", duration: "20 dk" },
    { id: "night", name: "Gece Modu", icon: <IconMoon size={18} />, color: "#8b5cf6", desc: "Düşük mavi ışık, göz koruma aktif, karanlık tema.", duration: "45 dk" },
    { id: "zen", name: "Zen Modu", icon: <IconFocus size={18} />, color: "#64748b", desc: "Minimal arayüz, dikkati dağıtan her şey gizlenir.", duration: "15 dk" },
  ];

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: "var(--accent-secondary-light)", color: "var(--accent-secondary)" }}
        >
          <IconFocus size={14} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Odak Modları
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(activeMode === mode.id ? null : mode.id)}
            className="flex items-start gap-3 rounded-xl p-3.5 transition-all active:scale-[0.98] text-left"
            style={{
              background: activeMode === mode.id ? `${mode.color}12` : "var(--bg-tertiary)",
              border: activeMode === mode.id ? `1px solid ${mode.color}30` : "1px solid transparent",
            }}
          >
            <span
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
              style={{
                background: activeMode === mode.id ? `${mode.color}20` : "var(--bg-card)",
                color: activeMode === mode.id ? mode.color : "var(--text-tertiary)",
              }}
            >
              {mode.icon}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-semibold"
                  style={{ color: activeMode === mode.id ? mode.color : "var(--text-primary)" }}
                >
                  {mode.name}
                </span>
                {activeMode === mode.id && (
                  <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: mode.color }} />
                )}
              </div>
              <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                {mode.desc}
              </p>
              <span className="text-[9px] font-semibold mt-1 inline-block" style={{ color: "var(--text-tertiary)" }}>
                Süre: {mode.duration}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== BACKGROUND SOUNDS FULL ===== */
function BackgroundSoundsFull() {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(40);

  const sounds = [
    { id: "rain", emoji: "🌧️", name: "Yağmur", desc: "Hafif yağmur sesi" },
    { id: "forest", emoji: "🌲", name: "Orman", desc: "Doğa sesleri" },
    { id: "ocean", emoji: "🌊", name: "Okyanus", desc: "Dalga sesi" },
    { id: "fire", emoji: "🔥", name: "Şömine", desc: "Çıtırtı sesi" },
    { id: "cafe", emoji: "☕", name: "Kafe", desc: "Kafe ambiyansı" },
    { id: "lofi", emoji: "🎵", name: "Lo-Fi", desc: "Lo-Fi müzik" },
    { id: "white", emoji: "📡", name: "Beyaz Gürültü", desc: "Beyaz gürültü" },
    { id: "birds", emoji: "🐦", name: "Kuşlar", desc: "Kuş sesleri" },
  ];

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg"
            style={{ background: "var(--accent-purple-light)", color: "var(--accent-purple)" }}
          >
            <IconHeadphones size={14} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Arka Plan Sesleri
          </h3>
        </div>
        {activeSound && (
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-primary)" }} />
            Çalınıyor
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {sounds.map((sound) => (
          <button
            key={sound.id}
            onClick={() => setActiveSound(activeSound === sound.id ? null : sound.id)}
            className="flex flex-col items-center gap-1.5 rounded-xl py-4 transition-all active:scale-95"
            style={{
              background: activeSound === sound.id ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
              border: activeSound === sound.id ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid transparent",
              boxShadow: activeSound === sound.id ? "var(--shadow-glow-sm)" : "none",
            }}
          >
            <span className="text-xl">{sound.emoji}</span>
            <span
              className="text-[11px] font-semibold"
              style={{ color: activeSound === sound.id ? "var(--accent-primary)" : "var(--text-secondary)" }}
            >
              {sound.name}
            </span>
            <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>
              {sound.desc}
            </span>
          </button>
        ))}
      </div>

      {activeSound && (
        <div className="flex items-center gap-3 mt-4 pt-3" style={{ borderTop: "1px solid var(--border-secondary)" }}>
          <span style={{ color: "var(--text-tertiary)" }}>
            <IconVolume size={14} />
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: "var(--accent-primary)" }}
          />
          <span className="text-[11px] font-semibold min-w-[32px] text-right" style={{ color: "var(--text-tertiary)" }}>
            {volume}%
          </span>
        </div>
      )}
    </div>
  );
}

/* ===== QUICK TOOLS ===== */
function QuickTools() {
  const tools = [
    { name: "Not Defteri", icon: "📝", color: "var(--accent-primary)", desc: "Hızlı not al" },
    { name: "Hesap Makinesi", icon: "🔢", color: "var(--accent-secondary)", desc: "Hesaplama yap" },
    { name: "Sözlük", icon: "📖", color: "var(--accent-purple)", desc: "Kelime ara" },
    { name: "Çeviri", icon: "🌍", color: "var(--accent-warning)", desc: "Metin çevir" },
    { name: "Formül Tablosu", icon: "📐", color: "var(--accent-cyan)", desc: "Formülleri gör" },
    { name: "Hatırlatıcı", icon: "⏰", color: "var(--accent-danger)", desc: "Hatırlatma kur" },
  ];

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: "var(--accent-warning-light)", color: "var(--accent-warning)" }}
        >
          <IconSettings size={14} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Hızlı Araçlar
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.name}
            className="flex items-center gap-2.5 rounded-xl p-3 transition-all active:scale-[0.98] hover:shadow-sm"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <span className="text-lg">{tool.icon}</span>
            <div className="text-left">
              <span className="text-[11px] font-semibold block" style={{ color: "var(--text-primary)" }}>
                {tool.name}
              </span>
              <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>
                {tool.desc}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== TOOLS PAGE ===== */
export default function ToolsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Araçlar
          </h1>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Öğrenme deneyimini optimize eden araçlar
          </p>
        </div>

        <PomodoroFull />
        <FocusModesFull />
        <BackgroundSoundsFull />
        <QuickTools />
      </div>
    </div>
  );
}
