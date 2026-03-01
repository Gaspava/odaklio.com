"use client";

import {
  IconClock,
  IconTrendingUp,
  IconStar,
  IconTarget,
  IconAward,
  IconCalendar,
  IconCheckCircle,
  IconLightning,
  IconBook,
  IconFlashcard,
  IconMindMap,
  IconPomodoro,
} from "../icons/Icons";

/* ===== STAT CARD ===== */
function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: typeof IconClock;
  label: string;
  value: string;
  change: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `${color}15`, color }}
        >
          <Icon size={18} />
        </div>
        <span
          className="flex items-center gap-1 text-[11px] font-medium"
          style={{ color: "var(--accent-success)" }}
        >
          <IconTrendingUp size={10} />
          {change}
        </span>
      </div>
      <div
        className="text-xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </div>
      <div
        className="text-xs mt-0.5"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </div>
    </div>
  );
}

/* ===== WEEKLY ACTIVITY CHART ===== */
function WeeklyActivity() {
  const days = [
    { day: "Pzt", hours: 3.5, goal: 4 },
    { day: "Sal", hours: 4.2, goal: 4 },
    { day: "Çar", hours: 5.0, goal: 4 },
    { day: "Per", hours: 2.8, goal: 4 },
    { day: "Cum", hours: 4.5, goal: 4 },
    { day: "Cmt", hours: 1.5, goal: 3 },
    { day: "Paz", hours: 2.0, goal: 3 },
  ];

  const maxHours = 6;

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Haftalık Çalışma
        </h3>
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Bu hafta: 23.5 saat
        </span>
      </div>

      <div
        className="flex items-end justify-between gap-2"
        style={{ height: 160 }}
      >
        {days.map((d) => {
          const height = (d.hours / maxHours) * 100;
          const goalHeight = (d.goal / maxHours) * 100;
          const metGoal = d.hours >= d.goal;
          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-1.5"
            >
              <span
                className="text-[11px] font-bold tabular-nums"
                style={{ color: "var(--text-primary)" }}
              >
                {d.hours}s
              </span>
              <div className="relative w-full" style={{ height: `${goalHeight}%`, minHeight: 8 }}>
                {/* Goal line */}
                <div
                  className="absolute top-0 left-0 right-0"
                  style={{
                    borderTop: "2px dashed var(--border-primary)",
                  }}
                />
                {/* Bar */}
                <div
                  className="absolute bottom-0 left-1 right-1 rounded-md transition-all"
                  style={{
                    height: `${(d.hours / d.goal) * 100}%`,
                    maxHeight: "100%",
                    background: metGoal
                      ? "var(--gradient-primary)"
                      : "var(--accent-primary)",
                    opacity: metGoal ? 1 : 0.5,
                  }}
                />
              </div>
              <span
                className="text-[10px] font-medium"
                style={{ color: "var(--text-tertiary)" }}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== GOALS SECTION ===== */
function GoalsSection() {
  const goals = [
    {
      title: "Günlük 4 saat çalış",
      progress: 78,
      current: "3.1 saat",
      target: "4 saat",
      color: "var(--accent-primary)",
      icon: IconClock,
    },
    {
      title: "Haftada 20 flashcard tekrar et",
      progress: 90,
      current: "18",
      target: "20",
      color: "var(--accent-secondary)",
      icon: IconFlashcard,
    },
    {
      title: "5 yeni konu öğren",
      progress: 60,
      current: "3",
      target: "5",
      color: "var(--accent-success)",
      icon: IconBook,
    },
    {
      title: "Günde 4 pomodoro tamamla",
      progress: 50,
      current: "2",
      target: "4",
      color: "var(--accent-warning)",
      icon: IconPomodoro,
    },
  ];

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Hedeflerim
        </h3>
        <span
          className="flex items-center gap-1 text-[11px] font-medium"
          style={{ color: "var(--accent-primary)" }}
        >
          <IconTarget size={12} />
          4 aktif hedef
        </span>
      </div>

      <div className="space-y-3">
        {goals.map((goal, i) => {
          const Icon = goal.icon;
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-lg"
                    style={{
                      background: `${goal.color}15`,
                      color: goal.color,
                    }}
                  >
                    <Icon size={12} />
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {goal.title}
                  </span>
                </div>
                <span
                  className="text-[11px] font-medium"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {goal.current} / {goal.target}
                </span>
              </div>
              <div
                className="h-1.5 w-full overflow-hidden rounded-full"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${goal.progress}%`,
                    background: goal.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== SUBJECT BREAKDOWN ===== */
function SubjectBreakdown() {
  const subjects = [
    {
      name: "Fizik",
      hours: 12.5,
      sessions: 18,
      color: "var(--accent-primary)",
      percentage: 35,
    },
    {
      name: "Matematik",
      hours: 8.3,
      sessions: 12,
      color: "var(--accent-secondary)",
      percentage: 24,
    },
    {
      name: "Biyoloji",
      hours: 6.0,
      sessions: 9,
      color: "var(--accent-success)",
      percentage: 17,
    },
    {
      name: "Tarih",
      hours: 4.5,
      sessions: 7,
      color: "var(--accent-warning)",
      percentage: 13,
    },
    {
      name: "Kimya",
      hours: 3.8,
      sessions: 5,
      color: "var(--accent-danger)",
      percentage: 11,
    },
  ];

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <h3
        className="text-sm font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        Konu Dağılımı
      </h3>

      {/* Visual Bar */}
      <div className="flex h-3 rounded-full overflow-hidden mb-4">
        {subjects.map((s, i) => (
          <div
            key={i}
            style={{
              width: `${s.percentage}%`,
              background: s.color,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      <div className="space-y-2.5">
        {subjects.map((s, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: s.color }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {s.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span
                className="text-[11px] tabular-nums"
                style={{ color: "var(--text-tertiary)" }}
              >
                {s.hours} saat
              </span>
              <span
                className="text-[11px] tabular-nums font-medium w-8 text-right"
                style={{ color: "var(--text-secondary)" }}
              >
                %{s.percentage}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== ACHIEVEMENTS ===== */
function Achievements() {
  const badges = [
    {
      title: "7 Gün Streak",
      desc: "Art arda 7 gün çalıştın",
      icon: IconLightning,
      color: "var(--accent-warning)",
      earned: true,
    },
    {
      title: "100 Flashcard",
      desc: "100 flashcard tamamladın",
      icon: IconFlashcard,
      color: "var(--accent-primary)",
      earned: true,
    },
    {
      title: "Mind Map Uzmanı",
      desc: "10 mind map oluşturdun",
      icon: IconMindMap,
      color: "var(--accent-success)",
      earned: true,
    },
    {
      title: "Maraton Koşucusu",
      desc: "Bir günde 6+ saat çalış",
      icon: IconAward,
      color: "var(--accent-secondary)",
      earned: false,
    },
  ];

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Başarılar
        </h3>
        <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
          3/4 kazanıldı
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {badges.map((badge, i) => {
          const Icon = badge.icon;
          return (
            <div
              key={i}
              className="rounded-xl p-3 text-center transition-all"
              style={{
                background: badge.earned
                  ? `${badge.color}08`
                  : "var(--bg-tertiary)",
                border: `1px solid ${badge.earned ? `${badge.color}30` : "var(--border-secondary)"}`,
                opacity: badge.earned ? 1 : 0.5,
              }}
            >
              <div
                className="flex h-9 w-9 mx-auto items-center justify-center rounded-xl mb-2"
                style={{
                  background: badge.earned
                    ? `${badge.color}15`
                    : "var(--bg-tertiary)",
                  color: badge.earned
                    ? badge.color
                    : "var(--text-tertiary)",
                }}
              >
                <Icon size={16} />
              </div>
              <p
                className="text-[11px] font-semibold mb-0.5"
                style={{
                  color: badge.earned
                    ? "var(--text-primary)"
                    : "var(--text-tertiary)",
                }}
              >
                {badge.title}
              </p>
              <p
                className="text-[9px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                {badge.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== RECENT ACTIVITY ===== */
function RecentActivity() {
  const activities = [
    {
      action: "Kuantum Fiziği notu eklendi",
      time: "2 saat önce",
      icon: IconBook,
      color: "var(--accent-primary)",
    },
    {
      action: "15 flashcard tekrar edildi",
      time: "3 saat önce",
      icon: IconFlashcard,
      color: "var(--accent-secondary)",
    },
    {
      action: "4 pomodoro tamamlandı",
      time: "5 saat önce",
      icon: IconCheckCircle,
      color: "var(--accent-success)",
    },
    {
      action: "Hücre Bölünmesi mind map güncellendi",
      time: "Dün",
      icon: IconMindMap,
      color: "var(--accent-warning)",
    },
    {
      action: "Günlük hedef tamamlandı",
      time: "Dün",
      icon: IconTarget,
      color: "var(--accent-primary)",
    },
  ];

  return (
    <div
      className="rounded-xl"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="p-4 pb-2">
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Son Aktiviteler
        </h3>
      </div>

      <div>
        {activities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5"
              style={{
                borderBottom:
                  i < activities.length - 1
                    ? "1px solid var(--border-secondary)"
                    : "none",
              }}
            >
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: `${activity.color}15`,
                  color: activity.color,
                }}
              >
                <Icon size={13} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {activity.action}
                </p>
              </div>
              <span
                className="text-[10px] flex-shrink-0"
                style={{ color: "var(--text-tertiary)" }}
              >
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== DEGERLENDIRME PAGE ===== */
export default function Degerlendirme() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        {/* Page Header */}
        <div className="mb-6">
          <h1
            className="text-xl font-bold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Değerlendirme
          </h1>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Öğrenme performansını takip et, hedeflerine ulaş
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard
            icon={IconClock}
            label="Toplam Çalışma"
            value="35.1 saat"
            change="+4.2s"
            color="var(--accent-primary)"
          />
          <StatCard
            icon={IconCalendar}
            label="Streak"
            value="7 gün"
            change="+1"
            color="var(--accent-success)"
          />
          <StatCard
            icon={IconStar}
            label="Tamamlanan"
            value="51 oturum"
            change="+8"
            color="var(--accent-warning)"
          />
          <StatCard
            icon={IconAward}
            label="Başarı Puanı"
            value="847"
            change="+52"
            color="var(--accent-secondary)"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WeeklyActivity />
          <GoalsSection />
          <SubjectBreakdown />
          <Achievements />
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
