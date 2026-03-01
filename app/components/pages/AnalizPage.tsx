"use client";

import { useState } from "react";
import {
  IconClock,
  IconPomodoro,
  IconLightning,
  IconTrendingUp,
  IconStar,
  IconFlashcard,
  IconMindMap,
  IconFocus,
  IconChevronRight,
} from "../icons/Icons";

const statCards = [
  { label: "Toplam Çalışma", value: "12s 30dk", icon: <IconClock size={16} />, color: "#3b82f6", change: "+2.5s", desc: "Bu hafta" },
  { label: "Pomodoro", value: "48", icon: <IconPomodoro size={16} />, color: "#10b981", change: "+6", desc: "Tamamlanan" },
  { label: "Günlük Seri", value: "7 gün", icon: <IconLightning size={16} />, color: "#f59e0b", change: "Rekor!", desc: "Aktif seri" },
  { label: "Başarı Oranı", value: "%85", icon: <IconTrendingUp size={16} />, color: "#8b5cf6", change: "+5%", desc: "Quiz ortalaması" },
  { label: "Flashcard", value: "156", icon: <IconFlashcard size={16} />, color: "#ec4899", change: "+24", desc: "Tekrar edilen" },
  { label: "Odak Süresi", value: "2s 15dk", icon: <IconFocus size={16} />, color: "#06b6d4", change: "En iyi", desc: "Ort. oturum" },
];

const weeklyData = [
  { day: "Pzt", hours: 3.5 },
  { day: "Sal", hours: 2.0 },
  { day: "Çar", hours: 4.5 },
  { day: "Per", hours: 1.5 },
  { day: "Cum", hours: 3.0 },
  { day: "Cmt", hours: 5.0 },
  { day: "Paz", hours: 2.5 },
];
const maxHours = 5;

const subjects = [
  { name: "Fizik", percent: 35, color: "#3b82f6", hours: "4s 12dk" },
  { name: "Matematik", percent: 28, color: "#10b981", hours: "3s 22dk" },
  { name: "Biyoloji", percent: 20, color: "#f59e0b", hours: "2s 24dk" },
  { name: "Kimya", percent: 12, color: "#ef4444", hours: "1s 26dk" },
  { name: "Diğer", percent: 5, color: "#64748b", hours: "36dk" },
];

const achievements = [
  { name: "Erken Kuş", desc: "Sabah 7'den önce çalış", emoji: "🐦", earned: true, color: "#f59e0b" },
  { name: "Maraton", desc: "4+ saat aralıksız çalış", emoji: "🏃", earned: true, color: "#10b981" },
  { name: "Hafta Sonu", desc: "Haftasonunda 3+ saat çalış", emoji: "🌟", earned: true, color: "#8b5cf6" },
  { name: "Quiz Master", desc: "%95+ quiz başarısı", emoji: "🏆", earned: false, color: "#3b82f6" },
  { name: "Kart Ustası", desc: "Bir günde 50 flashcard", emoji: "🃏", earned: false, color: "#ec4899" },
  { name: "Haftalık Seri", desc: "7 gün üst üste çalış", emoji: "🔥", earned: true, color: "#ef4444" },
];

const goals = [
  { name: "Günlük Çalışma", current: 3.5, target: 4, unit: "saat", color: "#10b981" },
  { name: "Haftalık Pomodoro", current: 18, target: 24, unit: "pomodoro", color: "#3b82f6" },
  { name: "Flashcard Tekrar", current: 35, target: 50, unit: "kart", color: "#f59e0b" },
  { name: "Quiz Tamamla", current: 2, target: 3, unit: "quiz", color: "#8b5cf6" },
];

const heatmapWeeks = Array.from({ length: 12 }, (_, wi) =>
  Array.from({ length: 7 }, (_, di) => {
    const intensity = Math.random();
    return intensity < 0.15 ? 0 : intensity < 0.35 ? 1 : intensity < 0.6 ? 2 : intensity < 0.8 ? 3 : 4;
  })
);

const recentActivities = [
  { text: "Fizik - Dalga Mekaniği çalışıldı", time: "2 saat önce", color: "#3b82f6" },
  { text: "4 pomodoro tamamlandı", time: "3 saat önce", color: "#10b981" },
  { text: "Flashcard: 12 kart tekrar edildi", time: "5 saat önce", color: "#f59e0b" },
  { text: "Quiz: Matematik %90 başarı", time: "Dün", color: "#8b5cf6" },
  { text: "Mind Map: Hücre Bölünmesi oluşturuldu", time: "Dün", color: "#ec4899" },
  { text: "Hızlı Okuma: 340 wpm ulaşıldı", time: "2 gün önce", color: "#06b6d4" },
];

const heatColors = ["var(--bg-tertiary)", "#10b98120", "#10b98140", "#10b98170", "#10b981"];

type Period = "week" | "month" | "all";

export default function AnalizPage() {
  const [period, setPeriod] = useState<Period>("week");

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar - Quick Stats & Goals */}
      <div
        className="hidden sm:flex flex-col w-[240px] flex-shrink-0 overflow-y-auto p-3 space-y-3"
        style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border-primary)" }}
      >
        {/* Period Selector */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}>
              <IconClock size={10} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Dönem</span>
          </div>
          <div className="flex rounded-lg p-0.5" style={{ background: "var(--bg-tertiary)" }}>
            {([["week", "Hafta"], ["month", "Ay"], ["all", "Tümü"]] as [Period, string][]).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setPeriod(id)}
                className="flex-1 py-1.5 rounded-md text-[10px] font-semibold transition-all"
                style={{
                  background: period === id ? "var(--bg-card)" : "transparent",
                  color: period === id ? "var(--accent-primary)" : "var(--text-tertiary)",
                  boxShadow: period === id ? "var(--shadow-sm)" : "none",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Goals Progress */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-warning-light)", color: "var(--accent-warning)" }}>
              <IconStar size={10} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Hedefler</span>
          </div>
          <div className="space-y-3">
            {goals.map((g) => {
              const pct = Math.min((g.current / g.target) * 100, 100);
              return (
                <div key={g.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium" style={{ color: "var(--text-secondary)" }}>{g.name}</span>
                    <span className="text-[9px] font-bold" style={{ color: g.color }}>
                      {g.current}/{g.target} {g.unit}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: g.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievements */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-purple-light)", color: "var(--accent-purple)" }}>
              <IconLightning size={10} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Rozetler</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {achievements.map((a) => (
              <div
                key={a.name}
                className="flex flex-col items-center py-2 rounded-lg transition-all"
                style={{
                  background: a.earned ? `${a.color}10` : "var(--bg-tertiary)",
                  opacity: a.earned ? 1 : 0.4,
                }}
                title={a.desc}
              >
                <span className="text-lg">{a.emoji}</span>
                <span className="text-[8px] font-semibold mt-0.5" style={{ color: "var(--text-tertiary)" }}>{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-3 transition-all"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: `${stat.color}12`, color: stat.color }}
                >
                  {stat.icon}
                </div>
                <span
                  className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--accent-success-light)", color: "var(--accent-success)" }}
                >
                  {stat.change}
                </span>
              </div>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
              <p className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>{stat.desc}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Weekly Chart */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}>
                  <IconTrendingUp size={10} />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Haftalık Çalışma</h3>
              </div>
              <span className="text-[10px] font-semibold" style={{ color: "var(--accent-primary)" }}>Ort: 3.1s</span>
            </div>
            <div className="flex items-end justify-between gap-2 h-36">
              {weeklyData.map((d) => {
                const pct = (d.hours / maxHours) * 100;
                const isBest = d.hours === maxHours;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[9px] font-semibold" style={{ color: "var(--text-tertiary)" }}>{d.hours}s</span>
                    <div
                      className="w-full rounded-lg relative overflow-hidden"
                      style={{ height: `${pct}%`, minHeight: 8, background: isBest ? "var(--gradient-primary)" : "var(--accent-primary-light)" }}
                    />
                    <span className="text-[10px] font-semibold" style={{ color: isBest ? "var(--accent-primary)" : "var(--text-tertiary)" }}>{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Subject Distribution */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-secondary-light)", color: "var(--accent-secondary)" }}>
                <IconMindMap size={10} />
              </div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Konu Dağılımı</h3>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden mb-4">
              {subjects.map((s) => (
                <div key={s.name} style={{ width: `${s.percent}%`, background: s.color }} />
              ))}
            </div>
            <div className="space-y-2.5">
              {subjects.map((s) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-[11px] font-semibold flex-1" style={{ color: "var(--text-primary)" }}>{s.name}</span>
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{s.hours}</span>
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="h-full rounded-full" style={{ width: `${s.percent}%`, background: s.color }} />
                  </div>
                  <span className="text-[10px] font-bold min-w-[28px] text-right" style={{ color: s.color }}>%{s.percent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Heatmap + Recent Activity Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Study Heatmap */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-warning-light)", color: "var(--accent-warning)" }}>
                  <IconLightning size={10} />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Çalışma Haritası</h3>
              </div>
              <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>Son 12 hafta</span>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {heatmapWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((level, di) => (
                    <div
                      key={di}
                      className="w-3 h-3 rounded-sm"
                      style={{ background: heatColors[level] }}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-1.5 mt-3">
              <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>Az</span>
              {heatColors.map((c, i) => (
                <div key={i} className="w-3 h-3 rounded-sm" style={{ background: c }} />
              ))}
              <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>Çok</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-purple-light)", color: "var(--accent-purple)" }}>
                  <IconClock size={10} />
                </div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Son Aktiviteler</h3>
              </div>
              <button className="flex items-center gap-0.5 text-[10px] font-semibold" style={{ color: "var(--accent-primary)" }}>
                Tümü <IconChevronRight size={10} />
              </button>
            </div>
            <div className="space-y-0.5">
              {recentActivities.map((act, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 px-2 rounded-lg transition-all hover:bg-[var(--bg-tertiary)]"
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: act.color }} />
                  <span className="text-[11px] flex-1" style={{ color: "var(--text-secondary)" }}>{act.text}</span>
                  <span className="text-[9px] flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
