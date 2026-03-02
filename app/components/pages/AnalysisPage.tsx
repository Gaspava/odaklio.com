"use client";

import { useState } from "react";
import {
  IconTrendingUp,
  IconClock,
  IconBrain,
  IconStar,
  IconLightning,
  IconChat,
  IconPomodoro,
  IconFlashcard,
} from "../icons/Icons";

/* ===== PERIOD SELECTOR ===== */
function PeriodSelector({ period, onChange }: { period: string; onChange: (p: string) => void }) {
  const periods = [
    { id: "week", label: "Hafta" },
    { id: "month", label: "Ay" },
    { id: "all", label: "Tümü" },
  ];

  return (
    <div className="flex rounded-lg p-0.5" style={{ background: "var(--bg-tertiary)" }}>
      {periods.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className="px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all"
          style={{
            background: period === p.id ? "var(--bg-card)" : "transparent",
            color: period === p.id ? "var(--accent-primary)" : "var(--text-tertiary)",
            boxShadow: period === p.id ? "var(--shadow-sm)" : "none",
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

/* ===== STAT CARD ===== */
function StatCard({
  label,
  value,
  subtext,
  icon,
  color,
  trend,
}: {
  label: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}) {
  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className="flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "var(--accent-success-light)", color: "var(--accent-success)" }}
          >
            <IconTrendingUp size={10} />
            {trend}
          </span>
        )}
      </div>
      <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
        {value}
      </div>
      <div className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
        {label}
      </div>
      <div className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
        {subtext}
      </div>
    </div>
  );
}

/* ===== WEEKLY ACTIVITY ===== */
function WeeklyActivity() {
  const days = [
    { name: "Pzt", hours: 2.5 },
    { name: "Sal", hours: 3.2 },
    { name: "Çar", hours: 1.8 },
    { name: "Per", hours: 4.0 },
    { name: "Cum", hours: 2.1 },
    { name: "Cmt", hours: 3.5 },
    { name: "Paz", hours: 1.5 },
  ];

  const target = 3;
  const maxHours = Math.max(...days.map((d) => Math.max(d.hours, target)));
  const todayIndex = new Date().getDay() - 1;

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
            <IconTrendingUp size={14} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Günlük Çalışma Süresi
          </h3>
        </div>
        <span className="text-[10px] font-semibold" style={{ color: "var(--accent-primary)" }}>
          Toplam: {days.reduce((s, d) => s + d.hours, 0).toFixed(1)}s
        </span>
      </div>

      <div className="flex items-end gap-2 mb-2" style={{ height: 100 }}>
        {days.map((day, i) => {
          const height = (day.hours / maxHours) * 100;
          const isToday = i === todayIndex;
          const reachedTarget = day.hours >= target;

          return (
            <div key={day.name} className="flex-1 flex flex-col items-center gap-1">
              <span
                className="text-[9px] font-semibold"
                style={{ color: reachedTarget ? "var(--accent-success)" : "var(--text-tertiary)" }}
              >
                {day.hours}s
              </span>
              <div className="w-full flex justify-center" style={{ height: 70 }}>
                <div
                  className="w-full max-w-[28px] rounded-t-lg transition-all relative"
                  style={{
                    height: `${height}%`,
                    background: isToday
                      ? "var(--gradient-primary)"
                      : reachedTarget
                      ? "var(--accent-primary)"
                      : "var(--bg-tertiary)",
                    opacity: isToday ? 1 : reachedTarget ? 0.6 : 0.35,
                    boxShadow: isToday ? "var(--shadow-glow-sm)" : "none",
                  }}
                />
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: isToday ? "var(--accent-primary)" : "var(--text-tertiary)" }}
              >
                {day.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Target line legend */}
      <div className="flex items-center gap-4 pt-2" style={{ borderTop: "1px solid var(--border-secondary)" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded" style={{ background: "var(--accent-primary)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Hedef üstü</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded" style={{ background: "var(--bg-tertiary)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Hedef altı ({target}s)</span>
        </div>
      </div>
    </div>
  );
}

/* ===== SUBJECT PROGRESS ===== */
function SubjectProgress() {
  const subjects = [
    { name: "Fizik", progress: 72, color: "#10b981", topics: 18, total: 25, time: "12.5s" },
    { name: "Matematik", progress: 58, color: "#3b82f6", topics: 14, total: 24, time: "10.2s" },
    { name: "Biyoloji", progress: 85, color: "#059669", topics: 17, total: 20, time: "8.4s" },
    { name: "Kimya", progress: 45, color: "#f59e0b", topics: 9, total: 20, time: "6.1s" },
    { name: "Tarih", progress: 63, color: "#8b5cf6", topics: 12, total: 19, time: "5.8s" },
    { name: "İngilizce", progress: 90, color: "#06b6d4", topics: 18, total: 20, time: "5.5s" },
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
          <IconBrain size={14} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Ders Bazlı İlerleme
        </h3>
      </div>

      <div className="space-y-3">
        {subjects.map((subject) => (
          <div key={subject.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: subject.color }} />
                <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  {subject.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  {subject.time}
                </span>
                <span className="text-[10px] font-semibold min-w-[55px] text-right" style={{ color: "var(--text-tertiary)" }}>
                  {subject.topics}/{subject.total} konu
                </span>
                <span className="text-[10px] font-bold min-w-[30px] text-right" style={{ color: subject.color }}>
                  %{subject.progress}
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${subject.progress}%`, background: subject.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== ACTIVITY HEATMAP ===== */
function ActivityHeatmap() {
  // Generate 28 days of mock data
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    return {
      date: d,
      level: Math.floor(Math.random() * 5), // 0-4 intensity
    };
  });

  const levelColors = [
    "var(--bg-tertiary)",
    "rgba(16, 185, 129, 0.15)",
    "rgba(16, 185, 129, 0.35)",
    "rgba(16, 185, 129, 0.55)",
    "rgba(16, 185, 129, 0.8)",
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
            style={{ background: "var(--accent-success-light)", color: "var(--accent-success)" }}
          >
            <IconStar size={14} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Çalışma Haritası
          </h3>
        </div>
        <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
          Son 4 Hafta
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {["P", "S", "Ç", "P", "C", "C", "P"].map((d, i) => (
          <div key={i} className="text-center text-[9px] font-semibold pb-1" style={{ color: "var(--text-tertiary)" }}>
            {d}
          </div>
        ))}
        {days.map((day, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm transition-all hover:scale-110"
            style={{
              background: levelColors[day.level],
              border: day.level > 0 ? "none" : "1px solid var(--border-secondary)",
            }}
            title={`${day.date.toLocaleDateString("tr-TR")} - Seviye ${day.level}`}
          />
        ))}
      </div>

      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-[9px] mr-1" style={{ color: "var(--text-tertiary)" }}>Az</span>
        {levelColors.map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ background: color, border: i === 0 ? "1px solid var(--border-secondary)" : "none" }}
          />
        ))}
        <span className="text-[9px] ml-1" style={{ color: "var(--text-tertiary)" }}>Çok</span>
      </div>
    </div>
  );
}

/* ===== RECENT SESSIONS ===== */
function RecentSessions() {
  const sessions = [
    { subject: "Fizik", topic: "Newton Yasaları", duration: "45 dk", date: "Bugün, 14:30", type: "chat", color: "#10b981" },
    { subject: "Matematik", topic: "İntegral Hesaplama", duration: "30 dk", date: "Bugün, 10:15", type: "pomodoro", color: "#3b82f6" },
    { subject: "Biyoloji", topic: "Hücre Bölünmesi", duration: "55 dk", date: "Dün, 19:45", type: "chat", color: "#059669" },
    { subject: "İngilizce", topic: "Tense Pratik", duration: "20 dk", date: "Dün, 16:20", type: "flashcard", color: "#06b6d4" },
    { subject: "Tarih", topic: "Osmanlı Dönemi", duration: "40 dk", date: "2 gün önce", type: "chat", color: "#8b5cf6" },
  ];

  const typeIcons: Record<string, React.ReactNode> = {
    chat: <IconChat size={12} />,
    pomodoro: <IconPomodoro size={12} />,
    flashcard: <IconFlashcard size={12} />,
  };

  const typeLabels: Record<string, string> = {
    chat: "Sohbet",
    pomodoro: "Pomodoro",
    flashcard: "Flashcard",
  };

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
          <IconClock size={14} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Son Çalışma Oturumları
        </h3>
      </div>

      <div className="space-y-2">
        {sessions.map((session, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg p-2.5 transition-all"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: session.color }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                  {session.topic}
                </span>
                <span
                  className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold"
                  style={{ background: `${session.color}15`, color: session.color }}
                >
                  {typeIcons[session.type]}
                  {typeLabels[session.type]}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{session.subject}</span>
                <span className="text-[8px]" style={{ color: "var(--text-tertiary)" }}>·</span>
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{session.duration}</span>
              </div>
            </div>
            <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
              {session.date}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== STREAK & ACHIEVEMENTS ===== */
function StreakAndAchievements() {
  const achievements = [
    { name: "7 Gün Streak", emoji: "🔥", earned: true },
    { name: "İlk Flashcard", emoji: "🃏", earned: true },
    { name: "100 Mesaj", emoji: "💬", earned: true },
    { name: "Gece Kuşu", emoji: "🦉", earned: true },
    { name: "30 Gün Streak", emoji: "⭐", earned: false },
    { name: "1000 Mesaj", emoji: "🏆", earned: false },
  ];

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: "var(--accent-danger-light)", color: "var(--accent-danger)" }}
        >
          <IconLightning size={14} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Streak & Başarımlar
        </h3>
      </div>

      <div
        className="rounded-xl p-4 mb-3 flex items-center gap-4"
        style={{ background: "var(--bg-tertiary)" }}
      >
        <span className="text-3xl">🔥</span>
        <div>
          <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>7 Gün</div>
          <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Kesintisiz çalışma serisi</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm font-bold" style={{ color: "var(--accent-primary)" }}>En Uzun: 12</div>
          <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>gün</div>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {achievements.map((a) => (
          <div
            key={a.name}
            className="flex flex-col items-center gap-1 rounded-xl py-3 transition-all"
            style={{
              background: "var(--bg-tertiary)",
              opacity: a.earned ? 1 : 0.35,
            }}
          >
            <span className="text-lg">{a.emoji}</span>
            <span className="text-[8px] font-semibold text-center px-1" style={{ color: "var(--text-secondary)" }}>
              {a.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== ANALYSIS PAGE ===== */
export default function AnalysisPage() {
  const [period, setPeriod] = useState("week");

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Analiz
            </h1>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Öğrenme performansın ve istatistiklerin
            </p>
          </div>
          <PeriodSelector period={period} onChange={setPeriod} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard
            label="Toplam Çalışma"
            value="48.5s"
            subtext="Bu ay"
            icon={<IconClock size={18} />}
            color="var(--accent-primary)"
            trend="+12%"
          />
          <StatCard
            label="Tamamlanan Konu"
            value="88"
            subtext="6 ders"
            icon={<IconBrain size={18} />}
            color="var(--accent-secondary)"
            trend="+8"
          />
          <StatCard
            label="Sohbet Sayısı"
            value="156"
            subtext="Bu ay"
            icon={<IconChat size={18} />}
            color="var(--accent-purple)"
          />
          <StatCard
            label="Doğruluk Oranı"
            value="%82"
            subtext="Flashcard"
            icon={<IconLightning size={18} />}
            color="var(--accent-warning)"
            trend="+5%"
          />
        </div>

        <WeeklyActivity />
        <ActivityHeatmap />
        <SubjectProgress />
        <RecentSessions />
        <StreakAndAchievements />
      </div>
    </div>
  );
}
