"use client";

import {
  IconTrendingUp,
  IconClock,
  IconBrain,
  IconStar,
  IconLightning,
  IconChat,
} from "../icons/Icons";

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
          className="flex h-8 w-8 items-center justify-center rounded-xl"
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
    { name: "Pzt", hours: 2.5, target: 3 },
    { name: "Sal", hours: 3.2, target: 3 },
    { name: "Çar", hours: 1.8, target: 3 },
    { name: "Per", hours: 4.0, target: 3 },
    { name: "Cum", hours: 2.1, target: 3 },
    { name: "Cmt", hours: 3.5, target: 3 },
    { name: "Paz", hours: 1.5, target: 3 },
  ];

  const maxHours = Math.max(...days.map((d) => Math.max(d.hours, d.target)));

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
            Haftalık Aktivite
          </h3>
        </div>
        <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
          Bu Hafta
        </span>
      </div>

      <div className="flex items-end gap-2 h-32">
        {days.map((day, i) => {
          const height = (day.hours / maxHours) * 100;
          const isToday = i === new Date().getDay() - 1;
          const reachedTarget = day.hours >= day.target;

          return (
            <div key={day.name} className="flex-1 flex flex-col items-center gap-1">
              <span
                className="text-[9px] font-semibold"
                style={{ color: reachedTarget ? "var(--accent-success)" : "var(--text-tertiary)" }}
              >
                {day.hours}s
              </span>
              <div className="w-full flex justify-center" style={{ height: "80px" }}>
                <div
                  className="w-full max-w-[28px] rounded-t-lg transition-all relative"
                  style={{
                    height: `${height}%`,
                    background: isToday
                      ? "var(--gradient-primary)"
                      : reachedTarget
                      ? "var(--accent-primary)"
                      : "var(--bg-tertiary)",
                    opacity: isToday ? 1 : reachedTarget ? 0.7 : 0.4,
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

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid var(--border-secondary)" }}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded" style={{ background: "var(--accent-primary)" }} />
            <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Çalışma</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded" style={{ background: "var(--bg-tertiary)" }} />
            <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Hedef altı</span>
          </div>
        </div>
        <span className="text-[10px] font-semibold" style={{ color: "var(--accent-primary)" }}>
          Toplam: 18.6 saat
        </span>
      </div>
    </div>
  );
}

/* ===== SUBJECT PROGRESS ===== */
function SubjectProgress() {
  const subjects = [
    { name: "Fizik", progress: 72, color: "var(--accent-primary)", topics: 18, total: 25 },
    { name: "Matematik", progress: 58, color: "var(--accent-secondary)", topics: 14, total: 24 },
    { name: "Biyoloji", progress: 85, color: "var(--accent-success)", topics: 17, total: 20 },
    { name: "Kimya", progress: 45, color: "var(--accent-warning)", topics: 9, total: 20 },
    { name: "Tarih", progress: 63, color: "var(--accent-purple)", topics: 12, total: 19 },
    { name: "İngilizce", progress: 90, color: "var(--accent-cyan)", topics: 18, total: 20 },
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
          Konu İlerlemesi
        </h3>
      </div>

      <div className="space-y-3">
        {subjects.map((subject) => (
          <div key={subject.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>
                {subject.name}
              </span>
              <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                {subject.topics}/{subject.total} konu  ·  %{subject.progress}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${subject.progress}%`,
                  background: subject.color,
                  boxShadow: `0 0 8px ${subject.color}30`,
                }}
              />
            </div>
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
          style={{ background: "var(--accent-warning-light)", color: "var(--accent-warning)" }}
        >
          <IconStar size={14} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Başarımlar
        </h3>
      </div>

      {/* Streak Counter */}
      <div
        className="rounded-xl p-4 mb-3 text-center"
        style={{ background: "var(--bg-tertiary)" }}
      >
        <div className="text-3xl mb-1">🔥</div>
        <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          7 Gün
        </div>
        <div className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
          Kesintisiz çalışma serisi
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {achievements.map((a) => (
          <div
            key={a.name}
            className="flex flex-col items-center gap-1 rounded-xl py-3 transition-all"
            style={{
              background: a.earned ? "var(--bg-tertiary)" : "var(--bg-tertiary)",
              opacity: a.earned ? 1 : 0.4,
            }}
          >
            <span className="text-lg">{a.emoji}</span>
            <span className="text-[9px] font-semibold text-center px-1" style={{ color: "var(--text-secondary)" }}>
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
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Analiz
          </h1>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Öğrenme performansın ve istatistiklerin
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard
            label="Toplam Çalışma"
            value="48.5s"
            subtext="Bu ay"
            icon={<IconClock size={16} />}
            color="var(--accent-primary)"
            trend="+12%"
          />
          <StatCard
            label="Tamamlanan Konu"
            value="88"
            subtext="6 ders"
            icon={<IconBrain size={16} />}
            color="var(--accent-secondary)"
            trend="+8"
          />
          <StatCard
            label="Sohbet Sayısı"
            value="156"
            subtext="Bu ay"
            icon={<IconChat size={16} />}
            color="var(--accent-purple)"
          />
          <StatCard
            label="Doğruluk Oranı"
            value="%82"
            subtext="Flashcard'lar"
            icon={<IconLightning size={16} />}
            color="var(--accent-warning)"
            trend="+5%"
          />
        </div>

        <WeeklyActivity />
        <SubjectProgress />
        <StreakAndAchievements />
      </div>
    </div>
  );
}
