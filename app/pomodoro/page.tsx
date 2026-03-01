"use client";

import Link from "next/link";
import {
  IconChevronLeft,
  IconClock,
  IconTrendingUp,
  IconStar,
  IconLightning,
} from "../components/icons/Icons";

export default function PomodoroStatsPage() {
  const weeklyData = [
    { day: "Pzt", pomodoros: 6, minutes: 150 },
    { day: "Sal", pomodoros: 4, minutes: 100 },
    { day: "Çar", pomodoros: 8, minutes: 200 },
    { day: "Per", pomodoros: 5, minutes: 125 },
    { day: "Cum", pomodoros: 7, minutes: 175 },
    { day: "Cmt", pomodoros: 3, minutes: 75 },
    { day: "Paz", pomodoros: 2, minutes: 50 },
  ];

  const maxPomodoros = Math.max(...weeklyData.map((d) => d.pomodoros));

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 h-14"
        style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-primary)",
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 sm:gap-2 text-sm font-medium transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <IconChevronLeft size={16} />
          <span className="hidden sm:inline">Ana Sayfa</span>
          <span className="sm:hidden">Geri</span>
        </Link>
        <h1
          className="text-base sm:text-lg font-bold truncate"
          style={{ color: "var(--text-primary)" }}
        >
          Pomodoro İstatistikleri
        </h1>
      </div>

      <div className="p-4 sm:p-6 max-w-4xl mx-auto animate-fade-in">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            {
              icon: IconClock,
              label: "Toplam Süre",
              value: "48s 30dk",
              change: "+5s",
              color: "var(--accent-primary)",
            },
            {
              icon: IconStar,
              label: "Tamamlanan",
              value: "35 tur",
              change: "+8",
              color: "var(--accent-success)",
            },
            {
              icon: IconLightning,
              label: "En Uzun Streak",
              value: "12 tur",
              change: "+3",
              color: "var(--accent-warning)",
            },
            {
              icon: IconTrendingUp,
              label: "Günlük Ort.",
              value: "5 tur",
              change: "+1",
              color: "var(--accent-secondary)",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card-static p-3.5 sm:p-5">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div
                    className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl"
                    style={{ background: `${stat.color}15`, color: stat.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <span
                    className="flex items-center gap-1 text-[10px] sm:text-xs font-medium"
                    style={{ color: "var(--accent-success)" }}
                  >
                    <IconTrendingUp size={10} />
                    {stat.change}
                  </span>
                </div>
                <div
                  className="text-lg sm:text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-[10px] sm:text-xs mt-0.5"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Chart */}
        <div className="card-static p-4 sm:p-6 mb-6 sm:mb-8">
          <h2
            className="text-sm sm:text-base font-semibold mb-4 sm:mb-6"
            style={{ color: "var(--text-primary)" }}
          >
            Haftalık Pomodoro
          </h2>

          <div className="flex items-end justify-between gap-2 sm:gap-3" style={{ height: 150 }}>
            {weeklyData.map((day) => {
              const height = (day.pomodoros / maxPomodoros) * 100;
              return (
                <div
                  key={day.day}
                  className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2"
                >
                  <span
                    className="text-[10px] sm:text-[11px] font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {day.pomodoros}
                  </span>
                  <div
                    className="w-full rounded-md sm:rounded-lg transition-all"
                    style={{
                      height: `${height}%`,
                      minHeight: 8,
                      background: "var(--gradient-primary)",
                      opacity: 0.8,
                    }}
                  />
                  <span
                    className="text-[9px] sm:text-[10px] font-medium"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="card-static">
          <div
            className="px-4 py-3 sm:px-5 sm:py-4"
            style={{ borderBottom: "1px solid var(--border-primary)" }}
          >
            <h2
              className="text-sm sm:text-base font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Son Oturumlar
            </h2>
          </div>

          {[
            {
              subject: "Kuantum Fiziği",
              pomodoros: 4,
              duration: "100 dk",
              date: "Bugün",
            },
            {
              subject: "Matematik - İntegral",
              pomodoros: 3,
              duration: "75 dk",
              date: "Dün",
            },
            {
              subject: "Biyoloji - Hücre",
              pomodoros: 2,
              duration: "50 dk",
              date: "2 gün önce",
            },
            {
              subject: "Tarih - Osmanlı",
              pomodoros: 5,
              duration: "125 dk",
              date: "3 gün önce",
            },
          ].map((session, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 transition-colors"
              style={{
                borderBottom:
                  i < 3 ? "1px solid var(--border-secondary)" : "none",
              }}
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                  style={{
                    background: "var(--accent-primary-light)",
                    color: "var(--accent-primary)",
                  }}
                >
                  {session.pomodoros}
                </div>
                <div className="min-w-0">
                  <div
                    className="text-[13px] sm:text-sm font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {session.subject}
                  </div>
                  <div
                    className="text-[11px] sm:text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {session.duration}
                  </div>
                </div>
              </div>
              <span
                className="text-[11px] sm:text-xs flex-shrink-0 ml-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                {session.date}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
