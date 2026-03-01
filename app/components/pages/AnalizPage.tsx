"use client";

import {
  IconClock,
  IconPomodoro,
  IconLightning,
  IconTrendingUp,
} from "../icons/Icons";

const statCards = [
  { label: "Toplam Çalışma", value: "12s 30dk", icon: <IconClock size={16} />, color: "#3b82f6", change: "+2.5s" },
  { label: "Pomodoro", value: "48", icon: <IconPomodoro size={16} />, color: "#10b981", change: "+6" },
  { label: "Günlük Seri", value: "7 gün", icon: <IconLightning size={16} />, color: "#f59e0b", change: "Rekor!" },
  { label: "Başarı Oranı", value: "%85", icon: <IconTrendingUp size={16} />, color: "#8b5cf6", change: "+5%" },
];

const weeklyData = [
  { day: "Pzt", hours: 3.5, max: 5 },
  { day: "Sal", hours: 2.0, max: 5 },
  { day: "Çar", hours: 4.5, max: 5 },
  { day: "Per", hours: 1.5, max: 5 },
  { day: "Cum", hours: 3.0, max: 5 },
  { day: "Cmt", hours: 5.0, max: 5 },
  { day: "Paz", hours: 2.5, max: 5 },
];

const subjects = [
  { name: "Fizik", percent: 35, color: "#3b82f6", hours: "4s 12dk" },
  { name: "Matematik", percent: 28, color: "#10b981", hours: "3s 22dk" },
  { name: "Biyoloji", percent: 20, color: "#f59e0b", hours: "2s 24dk" },
  { name: "Kimya", percent: 12, color: "#ef4444", hours: "1s 26dk" },
  { name: "Diğer", percent: 5, color: "#64748b", hours: "36dk" },
];

const recentActivities = [
  { text: "Fizik - Dalga Mekaniği çalışıldı", time: "2 saat önce", type: "study" },
  { text: "4 pomodoro tamamlandı", time: "3 saat önce", type: "pomodoro" },
  { text: "Flashcard: 12 kart tekrar edildi", time: "5 saat önce", type: "flashcard" },
  { text: "Quiz: Matematik %90 başarı", time: "Dün", type: "quiz" },
  { text: "Mind Map: Hücre Bölünmesi oluşturuldu", time: "Dün", type: "mindmap" },
];

export default function AnalizPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-5">
        {/* Page Header */}
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Analiz & İstatistikler
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Bu hafta · 1 Mar - 7 Mar
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-3.5 transition-all"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${stat.color}12`, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--accent-success-light)", color: "var(--accent-success)" }}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                {stat.value}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Weekly Chart */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Haftalık Çalışma
            </h3>
            <span className="text-[10px] font-semibold" style={{ color: "var(--accent-primary)" }}>
              Ort: 3.1s
            </span>
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[9px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  {d.hours}s
                </span>
                <div
                  className="w-full rounded-lg relative overflow-hidden"
                  style={{
                    height: `${(d.hours / d.max) * 100}%`,
                    minHeight: 8,
                    background: d.day === "Cmt"
                      ? "var(--gradient-primary)"
                      : "var(--accent-primary-light)",
                  }}
                >
                  {d.day === "Cmt" && (
                    <div
                      className="absolute inset-0"
                      style={{ boxShadow: "inset 0 0 12px rgba(16, 185, 129, 0.3)" }}
                    />
                  )}
                </div>
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: d.day === "Cmt" ? "var(--accent-primary)" : "var(--text-tertiary)" }}
                >
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subject Distribution */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
          }}
        >
          <h3
            className="text-[11px] font-bold uppercase tracking-wider mb-4"
            style={{ color: "var(--text-tertiary)" }}
          >
            Konu Dağılımı
          </h3>

          {/* Combined bar */}
          <div className="flex h-3 rounded-full overflow-hidden mb-4">
            {subjects.map((s) => (
              <div
                key={s.name}
                style={{ width: `${s.percent}%`, background: s.color }}
              />
            ))}
          </div>

          <div className="space-y-2">
            {subjects.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-[11px] font-semibold flex-1" style={{ color: "var(--text-primary)" }}>
                  {s.name}
                </span>
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  {s.hours}
                </span>
                <span
                  className="text-[10px] font-bold min-w-[32px] text-right"
                  style={{ color: s.color }}
                >
                  %{s.percent}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
          }}
        >
          <h3
            className="text-[11px] font-bold uppercase tracking-wider mb-3"
            style={{ color: "var(--text-tertiary)" }}
          >
            Son Aktiviteler
          </h3>
          <div className="space-y-1">
            {recentActivities.map((act, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-2 px-2 rounded-lg transition-all hover:bg-[var(--bg-tertiary)]"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "var(--accent-primary)" }}
                />
                <span className="text-[11px] flex-1" style={{ color: "var(--text-secondary)" }}>
                  {act.text}
                </span>
                <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
                  {act.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
