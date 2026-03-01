"use client";

import PomodoroTimer from "../components/pomodoro/PomodoroTimer";

export default function PomodoroPage() {
  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-8 text-center">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Pomodoro Zamanlayıcı
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Odaklanmış çalışma dönemleriyle verimliliğini artır. 25 dakika
          çalış, 5 dakika dinlen.
        </p>
      </div>

      <PomodoroTimer />
    </div>
  );
}
