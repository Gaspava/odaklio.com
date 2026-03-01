"use client";
import { useState, useEffect, useRef } from "react";

const MODES = {
  work: { label: "Odak", duration: 25 * 60, color: "#7c6cf0" },
  shortBreak: { label: "Kisa Mola", duration: 5 * 60, color: "#00b894" },
  longBreak: { label: "Uzun Mola", duration: 15 * 60, color: "#0984e3" },
};
type Mode = keyof typeof MODES;

interface DayStat {
  day: string;
  sessions: number;
  minutes: number;
}

export default function PomodoroTimer() {
  const [mode, setMode] = useState<Mode>("work");
  const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const weekStats: DayStat[] = [
    { day: "Pzt", sessions: 4, minutes: 100 },
    { day: "Sal", sessions: 6, minutes: 150 },
    { day: "Car", sessions: 3, minutes: 75 },
    { day: "Per", sessions: 5, minutes: 125 },
    { day: "Cum", sessions: 7, minutes: 175 },
    { day: "Cmt", sessions: 2, minutes: 50 },
    { day: "Paz", sessions: 3, minutes: 75 },
  ];
  const maxMin = Math.max(...weekStats.map((s) => s.minutes));

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setRunning(false);
      if (mode === "work") setSessions((s) => s + 1);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, timeLeft, mode]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setTimeLeft(MODES[m].duration);
    setRunning(false);
  };

  const reset = () => {
    setTimeLeft(MODES[mode].duration);
    setRunning(false);
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const total = MODES[mode].duration;
  const progress = ((total - timeLeft) / total) * 100;
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ - (progress / 100) * circ;

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Pomodoro
        </h3>
        <button
          onClick={() => setShowStats(!showStats)}
          className="rounded-lg px-2 py-1 text-xs"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          {showStats ? "Zamanlayici" : "Istatistikler"}
        </button>
      </div>

      {!showStats ? (
        <>
          {/* Mode tabs */}
          <div
            className="mb-6 flex gap-1 rounded-xl p-1"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            {(Object.keys(MODES) as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 rounded-lg py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor:
                    mode === m ? MODES[m].color : "transparent",
                  color:
                    mode === m ? "#fff" : "var(--text-secondary)",
                }}
              >
                {MODES[m].label}
              </button>
            ))}
          </div>

          {/* Timer circle */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <svg width="170" height="170" className="-rotate-90">
                <circle
                  cx="85"
                  cy="85"
                  r={radius}
                  fill="none"
                  stroke="var(--bg-tertiary)"
                  strokeWidth="6"
                />
                <circle
                  cx="85"
                  cy="85"
                  r={radius}
                  fill="none"
                  stroke={MODES[mode].color}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-3xl font-bold tabular-nums"
                  style={{ color: "var(--text-primary)" }}
                >
                  {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                </span>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {MODES[mode].label}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mb-6 flex justify-center gap-3">
            <button
              onClick={() => setRunning(!running)}
              className="rounded-xl px-8 py-2.5 text-sm font-semibold text-white transition-all"
              style={{ backgroundColor: MODES[mode].color }}
            >
              {running ? "Duraklat" : "Baslat"}
            </button>
            <button
              onClick={reset}
              className="rounded-xl px-4 py-2.5 text-sm"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
              }}
            >
              Sifirla
            </button>
          </div>

          {/* Session count */}
          <div
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            <span
              className="text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              Bugunun Seansları
            </span>
            <div className="mt-1 flex items-center justify-center gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      i < sessions % 4 ? MODES.work.color : "var(--border-color)",
                  }}
                />
              ))}
              <span
                className="ml-2 text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                {sessions}/4
              </span>
            </div>
          </div>
        </>
      ) : (
        /* Stats view */
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Toplam Seans", value: "47", icon: "🎯" },
              { label: "Odak Suresi", value: "19.5s", icon: "⏱" },
              { label: "Bugun", value: `${sessions}`, icon: "📅" },
              { label: "Seri", value: "5 gun", icon: "🔥" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-3"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                <div className="text-lg">{s.icon}</div>
                <div
                  className="text-lg font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {s.value}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h4
              className="mb-3 text-xs font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Haftalik Odak Suresi
            </h4>
            <div className="flex items-end gap-2">
              {weekStats.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${(d.minutes / maxMin) * 80}px`,
                      backgroundColor: MODES.work.color,
                      opacity: 0.7 + (d.minutes / maxMin) * 0.3,
                    }}
                  />
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {d.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
