"use client";

import Link from "next/link";
import {
  IconChat,
  IconFlashcard,
  IconFocus,
  IconTrendingUp,
  IconLightning,
  IconStar,
  IconClock,
  IconChevronRight,
} from "./components/icons/Icons";

export default function Dashboard() {
  // Mock data
  const streak = 7;
  const dailyGoal = 4;
  const completedPomodoros = 2;
  const totalMinutesToday = 50;

  const quickActions = [
    {
      href: "/ogren",
      title: "Öğren",
      description: "AI ile yeni konular keşfet",
      icon: IconChat,
      color: "var(--accent-primary)",
      gradient: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)",
    },
    {
      href: "/tekrar",
      title: "Tekrar",
      description: "Flashcard'larını gözden geçir",
      icon: IconFlashcard,
      color: "var(--accent-secondary)",
      gradient: "linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)",
    },
    {
      href: "/odak",
      title: "Odaklan",
      description: "Pomodoro ile çalışmaya başla",
      icon: IconFocus,
      color: "var(--accent-success)",
      gradient: "linear-gradient(135deg, #10B981 0%, #06B6D4 100%)",
    },
  ];

  const recentActivity = [
    { title: "Kuantum Fiziği sohbeti", type: "ogren", time: "15 dk önce", duration: "12 dk" },
    { title: "3 flashcard tekrarlandı", type: "tekrar", time: "1 saat önce", duration: "5 dk" },
    { title: "Pomodoro tamamlandı", type: "odak", time: "2 saat önce", duration: "25 dk" },
    { title: "Matematik - İntegral", type: "ogren", time: "Dün", duration: "30 dk" },
  ];

  const typeColors: Record<string, string> = {
    ogren: "var(--accent-primary)",
    tekrar: "var(--accent-secondary)",
    odak: "var(--accent-success)",
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-8">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Hoş geldin! 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Bugün öğrenmeye hazır mısın?
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="card-static p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconLightning size={14} style={{ color: "var(--accent-warning)" }} />
              <span className="text-lg sm:text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {streak}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs" style={{ color: "var(--text-tertiary)" }}>
              Gün Streak
            </span>
          </div>

          <div className="card-static p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconStar size={14} style={{ color: "var(--accent-primary)" }} />
              <span className="text-lg sm:text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {completedPomodoros}/{dailyGoal}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs" style={{ color: "var(--text-tertiary)" }}>
              Pomodoro
            </span>
          </div>

          <div className="card-static p-3 sm:p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconClock size={14} style={{ color: "var(--accent-success)" }} />
              <span className="text-lg sm:text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {totalMinutesToday}
              </span>
            </div>
            <span className="text-[10px] sm:text-xs" style={{ color: "var(--text-tertiary)" }}>
              Dakika
            </span>
          </div>
        </div>

        {/* Daily Progress Bar */}
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              Günlük İlerleme
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--accent-primary)" }}>
              {Math.round((completedPomodoros / dailyGoal) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(completedPomodoros / dailyGoal) * 100}%`,
                background: "var(--gradient-primary)",
              }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Hızlı Başla
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group rounded-xl p-4 transition-all active:scale-[0.98]"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-primary)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white"
                      style={{ background: action.gradient }}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-sm font-semibold group-hover:text-[var(--accent-primary)] transition-colors"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {action.title}
                      </h3>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                        {action.description}
                      </p>
                    </div>
                    <IconChevronRight size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Son Aktiviteler
            </h2>
            <Link
              href="/ilerleme"
              className="text-xs font-medium flex items-center gap-0.5"
              style={{ color: "var(--accent-primary)" }}
            >
              Tümünü gör
              <IconChevronRight size={12} />
            </Link>
          </div>

          <div className="card-static overflow-hidden">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 transition-colors"
                style={{
                  borderBottom: i < recentActivity.length - 1 ? "1px solid var(--border-secondary)" : "none",
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: typeColors[item.type] }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {item.title}
                    </p>
                    <p className="text-[10px] sm:text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {item.time}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] flex-shrink-0 ml-3 font-medium" style={{ color: "var(--text-tertiary)" }}>
                  {item.duration}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mentor Daily Tip */}
        <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--accent-success-light)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm"
                style={{ background: "var(--accent-success)", color: "white" }}
              >
                💡
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: "var(--accent-success)" }}>
                  Günün İpucu
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  Pomodoro tekniği ile çalışman odaklanmanı %40 artırabilir. Bugün en az 2 pomodoro tamamlamayı hedefle!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
