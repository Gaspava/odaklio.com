"use client";
import { useState } from "react";

interface Task {
  id: string;
  title: string;
  time?: string;
  done: boolean;
  priority: "high" | "medium" | "low";
  category?: string;
}

const DAYS = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];
const HOURS = Array.from({ length: 14 }, (_, i) => `${String(i + 7).padStart(2, "0")}:00`);
const PRIORITY_COLORS = { high: "#e17055", medium: "#fdcb6e", low: "#00b894" };

export default function CalendarPanel() {
  const [view, setView] = useState<"calendar" | "tasks" | "schedule">("tasks");
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Fizik calismasi", time: "09:00", done: false, priority: "high", category: "Ders" },
    { id: "2", title: "Matematik odev", time: "11:00", done: true, priority: "medium", category: "Odev" },
    { id: "3", title: "Ingilizce kelime", time: "14:00", done: false, priority: "low", category: "Dil" },
    { id: "4", title: "Biyoloji tekrar", time: "16:00", done: false, priority: "high", category: "Ders" },
    { id: "5", title: "Deneme sinavi", time: "19:00", done: false, priority: "high", category: "Sinav" },
  ]);
  const [newTask, setNewTask] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);

  const now = new Date();
  const currentMonth = now.toLocaleString("tr-TR", { month: "long", year: "numeric" });
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = (new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 6) % 7;

  const toggleTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newTask, done: false, priority: "medium" },
    ]);
    setNewTask("");
  };

  const completedCount = tasks.filter((t) => t.done).length;

  return (
    <div className="flex h-full flex-col p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Takvim & Gorevler
        </h3>
        <button
          onClick={() => setGoogleConnected(!googleConnected)}
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px]"
          style={{
            backgroundColor: googleConnected ? "#00b89422" : "var(--bg-tertiary)",
            color: googleConnected ? "#00b894" : "var(--text-secondary)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googleConnected ? "Bagli" : "Google Takvim"}
        </button>
      </div>

      {/* View tabs */}
      <div className="mb-3 flex gap-1 rounded-xl p-1" style={{ backgroundColor: "var(--bg-tertiary)" }}>
        {([
          { key: "tasks", label: "Gorevler" },
          { key: "calendar", label: "Takvim" },
          { key: "schedule", label: "Program" },
        ] as const).map((v) => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className="flex-1 rounded-lg py-1.5 text-xs font-medium"
            style={{
              backgroundColor: view === v.key ? "var(--accent)" : "transparent",
              color: view === v.key ? "#fff" : "var(--text-secondary)",
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {view === "tasks" && (
        <div className="flex flex-1 flex-col">
          {/* Progress */}
          <div className="mb-3 rounded-xl p-3" style={{ backgroundColor: "var(--bg-tertiary)" }}>
            <div className="mb-1 flex justify-between text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              <span>Bugun</span>
              <span>{completedCount}/{tasks.length} tamamlandi</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-color)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(completedCount / tasks.length) * 100}%`, backgroundColor: "var(--accent)" }}
              />
            </div>
          </div>

          {/* Add task */}
          <div className="mb-3 flex gap-2">
            <input
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="Yeni gorev ekle..."
              className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
              style={{ backgroundColor: "var(--bg-tertiary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            />
            <button
              onClick={addTask}
              className="rounded-xl px-3 text-xs text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              +
            </button>
          </div>

          {/* Task list */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-xl p-3 transition-all"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    opacity: task.done ? 0.5 : 1,
                  }}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border"
                    style={{
                      borderColor: task.done ? "var(--accent)" : "var(--border-color)",
                      backgroundColor: task.done ? "var(--accent)" : "transparent",
                    }}
                  >
                    {task.done && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1">
                    <div
                      className="text-xs font-medium"
                      style={{
                        color: "var(--text-primary)",
                        textDecoration: task.done ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      {task.time && (
                        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          🕐 {task.time}
                        </span>
                      )}
                      {task.category && (
                        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                          {task.category}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "calendar" && (
        <div className="flex-1">
          <div className="mb-3 text-center text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {currentMonth}
          </div>
          <div className="mb-2 grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className="flex h-9 w-full items-center justify-center rounded-lg text-xs transition-all"
                style={{
                  backgroundColor:
                    day === selectedDay ? "var(--accent)" : day === now.getDate() ? "var(--accent-light)" : "transparent",
                  color:
                    day === selectedDay ? "#fff" : day === now.getDate() ? "var(--accent)" : "var(--text-primary)",
                }}
              >
                {day}
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-xl p-3" style={{ backgroundColor: "var(--bg-tertiary)" }}>
            <div className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
              {selectedDay} {currentMonth.split(" ")[0]}
            </div>
            <div className="mt-2 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              {tasks.filter((t) => !t.done).length} bekleyen gorev
            </div>
          </div>
        </div>
      )}

      {view === "schedule" && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {HOURS.map((hour) => {
              const task = tasks.find((t) => t.time === hour);
              return (
                <div
                  key={hour}
                  className="flex items-stretch border-b py-1"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <div className="w-12 shrink-0 py-1 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    {hour}
                  </div>
                  <div className="flex-1 py-1">
                    {task ? (
                      <div
                        className="rounded-lg px-2 py-1.5 text-xs"
                        style={{
                          backgroundColor: `${PRIORITY_COLORS[task.priority]}22`,
                          borderLeft: `3px solid ${PRIORITY_COLORS[task.priority]}`,
                          color: "var(--text-primary)",
                        }}
                      >
                        {task.title}
                      </div>
                    ) : (
                      <div
                        className="h-full min-h-[24px] rounded-lg border border-dashed"
                        style={{ borderColor: "var(--border-light)" }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
