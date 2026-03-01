"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { IconPlay, IconPause, IconRefresh, IconSkip } from "../icons/Icons";

type TimerMode = "work" | "short-break" | "long-break";

interface TimerConfig {
  work: number;
  shortBreak: number;
  longBreak: number;
  rounds: number;
}

const defaultConfig: TimerConfig = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  rounds: 4,
};

export default function PomodoroTimer() {
  const [config] = useState<TimerConfig>(defaultConfig);
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(config.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const [completedRounds, setCompletedRounds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalTime =
    mode === "work"
      ? config.work * 60
      : mode === "short-break"
        ? config.shortBreak * 60
        : config.longBreak * 60;

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const tick = useCallback(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        setIsRunning(false);
        if (mode === "work") {
          setCompletedRounds((r) => r + 1);
          if (currentRound % config.rounds === 0) {
            setMode("long-break");
            return config.longBreak * 60;
          } else {
            setMode("short-break");
            return config.shortBreak * 60;
          }
        } else {
          setMode("work");
          setCurrentRound((r) => r + 1);
          return config.work * 60;
        }
      }
      return prev - 1;
    });
  }, [mode, currentRound, config]);

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

  const reset = () => {
    setIsRunning(false);
    setMode("work");
    setTimeLeft(config.work * 60);
    setCurrentRound(1);
  };

  const skip = () => {
    setIsRunning(false);
    if (mode === "work") {
      setCompletedRounds((r) => r + 1);
      if (currentRound % config.rounds === 0) {
        setMode("long-break");
        setTimeLeft(config.longBreak * 60);
      } else {
        setMode("short-break");
        setTimeLeft(config.shortBreak * 60);
      }
    } else {
      setMode("work");
      setCurrentRound((r) => r + 1);
      setTimeLeft(config.work * 60);
    }
  };

  const modeColor =
    mode === "work"
      ? "var(--accent-primary)"
      : mode === "short-break"
        ? "var(--accent-success)"
        : "var(--accent-secondary)";

  const modeGradient =
    mode === "work"
      ? "var(--gradient-primary)"
      : mode === "short-break"
        ? "var(--gradient-success)"
        : "var(--gradient-secondary)";

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Mode Tabs */}
      <div
        className="flex rounded-xl p-1"
        style={{ background: "var(--bg-tertiary)" }}
      >
        {(
          [
            { key: "work", label: "Çalışma" },
            { key: "short-break", label: "Kısa Mola" },
            { key: "long-break", label: "Uzun Mola" },
          ] as const
        ).map((m) => (
          <button
            key={m.key}
            onClick={() => {
              setIsRunning(false);
              setMode(m.key);
              setTimeLeft(
                m.key === "work"
                  ? config.work * 60
                  : m.key === "short-break"
                    ? config.shortBreak * 60
                    : config.longBreak * 60
              );
            }}
            className="rounded-lg px-5 py-2 text-sm font-medium transition-all"
            style={{
              background: mode === m.key ? "var(--bg-card)" : "transparent",
              color:
                mode === m.key ? modeColor : "var(--text-tertiary)",
              boxShadow: mode === m.key ? "var(--shadow-sm)" : "none",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative flex items-center justify-center">
        <svg width="240" height="240" className="-rotate-90">
          {/* Background circle */}
          <circle
            cx="120"
            cy="120"
            r="100"
            fill="none"
            stroke="var(--bg-tertiary)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="120"
            cy="120"
            r="100"
            fill="none"
            stroke={modeColor}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="pomodoro-ring"
            style={{ filter: `drop-shadow(0 0 8px ${modeColor}40)` }}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute flex flex-col items-center">
          <span
            className="text-5xl font-bold tabular-nums tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
          <span
            className="mt-1 text-xs font-medium uppercase tracking-wider"
            style={{ color: modeColor }}
          >
            {mode === "work"
              ? "Odaklan"
              : mode === "short-break"
                ? "Kısa Mola"
                : "Uzun Mola"}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="flex h-12 w-12 items-center justify-center rounded-xl transition-all"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          <IconRefresh size={20} />
        </button>
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg transition-all hover:scale-105"
          style={{
            background: modeGradient,
            boxShadow: `0 0 24px ${modeColor}30`,
          }}
        >
          {isRunning ? <IconPause size={24} /> : <IconPlay size={24} />}
        </button>
        <button
          onClick={skip}
          className="flex h-12 w-12 items-center justify-center rounded-xl transition-all"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          <IconSkip size={20} />
        </button>
      </div>

      {/* Rounds Indicator */}
      <div className="flex items-center gap-3">
        {Array.from({ length: config.rounds }).map((_, i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-full transition-all"
            style={{
              background:
                i < completedRounds ? modeColor : "var(--bg-tertiary)",
              boxShadow:
                i < completedRounds ? `0 0 8px ${modeColor}40` : "none",
            }}
          />
        ))}
        <span
          className="ml-2 text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          Tur {currentRound} / {config.rounds}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {[
          { label: "Tamamlanan", value: `${completedRounds} tur` },
          {
            label: "Toplam Odak",
            value: `${completedRounds * config.work} dk`,
          },
          { label: "Hedef", value: `${config.rounds} tur` },
        ].map((stat) => (
          <div key={stat.label} className="card-static p-3 text-center">
            <div
              className="text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {stat.value}
            </div>
            <div
              className="text-[11px] mt-0.5"
              style={{ color: "var(--text-tertiary)" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
