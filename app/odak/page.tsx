"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  IconPlay,
  IconPause,
  IconRefresh,
  IconBrain,
  IconEye,
  IconLightning,
  IconMoon,
  IconFocus,
  IconHeadphones,
  IconVolume,
  IconTrendingUp,
} from "../components/icons/Icons";

export default function OdakPage() {
  // Pomodoro state
  const [isRunning, setIsRunning] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [mode, setMode] = useState<"work" | "break">("work");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Daily tracking
  const dailyGoal = 4;
  const [completed, setCompleted] = useState(2);

  // Focus mode
  const [activeMode, setActiveMode] = useState<string | null>(null);

  // Background sounds
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(40);

  // Timer
  const circumference = 2 * Math.PI * 80;
  const totalSeconds = mode === "work" ? 25 * 60 : 5 * 60;
  const elapsed = totalSeconds - (minutes * 60 + seconds);
  const progress = (elapsed / totalSeconds) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const modeColor = mode === "work" ? "var(--accent-primary)" : "var(--accent-success)";

  const tick = useCallback(() => {
    setSeconds((prevSec) => {
      if (prevSec === 0) {
        setMinutes((prevMin) => {
          if (prevMin === 0) {
            setIsRunning(false);
            if (mode === "work") {
              setCompleted((prev) => prev + 1);
              setMode("break");
              setMinutes(5);
            } else {
              setMode("work");
              setMinutes(25);
            }
            return mode === "work" ? 5 : 25;
          }
          return prevMin - 1;
        });
        return 59;
      }
      return prevSec - 1;
    });
  }, [mode]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(mode === "work" ? 25 : 5);
    setSeconds(0);
  };

  const focusModes = [
    { id: "deep", name: "Derin Odak", icon: <IconBrain size={16} />, color: "#8B5CF6", desc: "Kesintisiz çalışma" },
    { id: "reading", name: "Okuma", icon: <IconEye size={16} />, color: "#3B82F6", desc: "Sessiz okuma modu" },
    { id: "creative", name: "Yaratıcı", icon: <IconLightning size={16} />, color: "#F59E0B", desc: "Serbest düşünme" },
    { id: "night", name: "Gece", icon: <IconMoon size={16} />, color: "#6366F1", desc: "Düşük ışık modu" },
    { id: "zen", name: "Zen", icon: <IconFocus size={16} />, color: "#64748B", desc: "Minimalist odak" },
  ];

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
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Odaklan
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Zamanlayıcı ve odak araçları ile verimli çalış
          </p>
        </div>

        {/* Pomodoro Timer - Large */}
        <div
          className="rounded-2xl p-6 sm:p-8 text-center animate-fade-in"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: isRunning ? "var(--shadow-glow)" : "var(--shadow-card)",
          }}
        >
          {/* Timer Circle */}
          <div className="relative mx-auto" style={{ width: 180, height: 180 }}>
            <svg width="180" height="180" className="-rotate-90">
              <circle
                cx="90" cy="90" r="80"
                fill="none"
                stroke="var(--bg-tertiary)"
                strokeWidth="6"
              />
              <circle
                cx="90" cy="90" r="80"
                fill="none"
                stroke={modeColor}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-4xl sm:text-5xl font-bold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
              <span className="text-xs font-medium mt-1" style={{ color: modeColor }}>
                {mode === "work" ? "Odak Zamanı" : "Mola"}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={resetTimer}
              className="flex h-12 w-12 items-center justify-center rounded-xl transition-all active:scale-[0.95]"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
            >
              <IconRefresh size={18} />
            </button>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-all active:scale-[0.95]"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
            >
              {isRunning ? <IconPause size={22} /> : <IconPlay size={22} />}
            </button>
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
                  className="rounded-md px-3 py-2 text-xs font-medium transition-all"
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

          {/* Daily Goal */}
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border-secondary)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
                Günlük Hedef
              </span>
              <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--accent-success)" }}>
                <IconTrendingUp size={12} />
                {completed}/{dailyGoal}
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min((completed / dailyGoal) * 100, 100)}%`,
                  background: "var(--gradient-primary)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Focus Modes */}
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Odak Modu
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {focusModes.map((fm) => (
              <button
                key={fm.id}
                onClick={() => setActiveMode(activeMode === fm.id ? null : fm.id)}
                className="flex items-center gap-2.5 rounded-xl p-3 transition-all active:scale-[0.97] text-left"
                style={{
                  background: activeMode === fm.id ? `${fm.color}15` : "var(--bg-card)",
                  border: `1px solid ${activeMode === fm.id ? fm.color : "var(--border-primary)"}`,
                  color: activeMode === fm.id ? fm.color : "var(--text-secondary)",
                }}
              >
                {fm.icon}
                <div className="min-w-0">
                  <p className="text-xs font-semibold">{fm.name}</p>
                  <p className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>{fm.desc}</p>
                </div>
                {activeMode === fm.id && (
                  <div
                    className="ml-auto h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: fm.color, boxShadow: `0 0 6px ${fm.color}` }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Background Sounds */}
        <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Arka Plan Sesleri
            </h2>
            {activeSound && (
              <span className="flex items-center gap-1">
                <IconHeadphones size={12} style={{ color: "var(--accent-primary)" }} />
                <span className="text-[10px] font-medium" style={{ color: "var(--accent-primary)" }}>
                  Aktif
                </span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {sounds.map((sound) => (
              <button
                key={sound.id}
                onClick={() => setActiveSound(activeSound === sound.id ? null : sound.id)}
                className="flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all active:scale-[0.97]"
                style={{
                  background: activeSound === sound.id ? "var(--accent-primary-light)" : "var(--bg-card)",
                  border: `1px solid ${activeSound === sound.id ? "var(--accent-primary)" : "var(--border-primary)"}`,
                }}
              >
                <span className="text-lg">{sound.emoji}</span>
                <span
                  className="text-[10px] font-medium"
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
            <div className="flex items-center gap-2 mt-3 p-3 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <IconVolume size={14} style={{ color: "var(--text-tertiary)" }} />
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
                style={{ accentColor: "var(--accent-primary)" }}
              />
              <span className="text-[11px] min-w-[32px] text-right font-medium" style={{ color: "var(--text-tertiary)" }}>
                {volume}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
