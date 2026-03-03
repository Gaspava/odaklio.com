"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/app/providers/AuthProvider";
import {
  getAnalyticsSummary,
  getLatestDailyReport,
  getStreakDays,
} from "@/lib/db/analytics";
import type { AnalyticsSummary, DailyReport } from "@/lib/db/analytics";

/* ===== HELPERS ===== */
function formatStudyTime(minutes: number): string {
  if (minutes >= 60) {
    return `${(minutes / 60).toFixed(1)} saat`;
  }
  return `${minutes} dk`;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Bugun, ${timeStr}`;
  if (diffDays === 1) return `Dun, ${timeStr}`;
  return `${diffDays} gun once`;
}

function getDayLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const days = ["Paz", "Pzt", "Sal", "Car", "Per", "Cum", "Cmt"];
  return days[date.getDay()];
}

const SUBJECT_COLORS = [
  "#10b981",
  "#3b82f6",
  "#059669",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#ef4444",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

/* ===== LOADING SPINNER ===== */
function LoadingSpinner() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }}
        />
        <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
          Veriler yukleniyor...
        </span>
      </div>
    </div>
  );
}

/* ===== EMPTY STATE ===== */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
        {message}
      </span>
    </div>
  );
}

/* ===== PERIOD SELECTOR ===== */
function PeriodSelector({
  period,
  onChange,
}: {
  period: "week" | "month" | "all";
  onChange: (p: "week" | "month" | "all") => void;
}) {
  const periods: { id: "week" | "month" | "all"; label: string }[] = [
    { id: "week", label: "Hafta" },
    { id: "month", label: "Ay" },
    { id: "all", label: "Tumu" },
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
function WeeklyActivity({
  dailyStudyHours,
}: {
  dailyStudyHours: { date: string; hours: number }[];
}) {
  if (dailyStudyHours.length === 0) {
    return (
      <div
        className="rounded-xl p-5 transition-all"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg"
            style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
          >
            <IconTrendingUp size={14} />
          </div>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Gunluk Calisma Suresi
          </h3>
        </div>
        <EmptyState message="Henuz calisma verisi yok" />
      </div>
    );
  }

  const target = 3;
  const maxHours = Math.max(...dailyStudyHours.map((d) => Math.max(d.hours, target)));
  const todayStr = new Date().toISOString().split("T")[0];

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
            Gunluk Calisma Suresi
          </h3>
        </div>
        <span className="text-[10px] font-semibold" style={{ color: "var(--accent-primary)" }}>
          Toplam: {dailyStudyHours.reduce((s, d) => s + d.hours, 0).toFixed(1)}s
        </span>
      </div>

      <div className="flex items-end gap-2 mb-2" style={{ height: 100 }}>
        {dailyStudyHours.map((day) => {
          const height = (day.hours / maxHours) * 100;
          const isToday = day.date === todayStr;
          const reachedTarget = day.hours >= target;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
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
                {getDayLabel(day.date)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Target line legend */}
      <div className="flex items-center gap-4 pt-2" style={{ borderTop: "1px solid var(--border-secondary)" }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded" style={{ background: "var(--accent-primary)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Hedef ustu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded" style={{ background: "var(--bg-tertiary)" }} />
          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Hedef alti ({target}s)</span>
        </div>
      </div>
    </div>
  );
}

/* ===== SUBJECT PROGRESS ===== */
function SubjectProgress({
  subjectBreakdown,
}: {
  subjectBreakdown: Record<string, number>;
}) {
  const entries = Object.entries(subjectBreakdown).sort(([, a], [, b]) => b - a);

  if (entries.length === 0) {
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
            Ders Bazli Ilerleme
          </h3>
        </div>
        <EmptyState message="Henuz ders verisi yok" />
      </div>
    );
  }

  const maxMinutes = Math.max(...entries.map(([, v]) => v));

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
          Ders Bazli Ilerleme
        </h3>
      </div>

      <div className="space-y-3">
        {entries.map(([name, minutes], i) => {
          const percentage = maxMinutes > 0 ? Math.round((minutes / maxMinutes) * 100) : 0;
          const color = SUBJECT_COLORS[i % SUBJECT_COLORS.length];

          return (
            <div key={name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
                    {name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    {formatStudyTime(minutes)}
                  </span>
                  <span className="text-[10px] font-bold min-w-[30px] text-right" style={{ color }}>
                    %{percentage}
                  </span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${percentage}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== ACTIVITY HEATMAP ===== */
function ActivityHeatmap({
  heatmapData,
}: {
  heatmapData: { date: string; level: number }[];
}) {
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
            Calisma Haritasi
          </h3>
        </div>
        <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
          Son 4 Hafta
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {["P", "S", "C", "P", "C", "C", "P"].map((d, i) => (
          <div key={i} className="text-center text-[9px] font-semibold pb-1" style={{ color: "var(--text-tertiary)" }}>
            {d}
          </div>
        ))}
        {heatmapData.map((day, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm transition-all hover:scale-110"
            style={{
              background: levelColors[day.level] || levelColors[0],
              border: day.level > 0 ? "none" : "1px solid var(--border-secondary)",
            }}
            title={`${new Date(day.date).toLocaleDateString("tr-TR")} - Seviye ${day.level}`}
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
        <span className="text-[9px] ml-1" style={{ color: "var(--text-tertiary)" }}>Cok</span>
      </div>
    </div>
  );
}

/* ===== RECENT SESSIONS ===== */
function RecentSessions({
  sessions,
}: {
  sessions: { type: string; subject: string | null; duration: number; date: string }[];
}) {
  const typeIcons: Record<string, React.ReactNode> = {
    Pomodoro: <IconPomodoro size={12} />,
    chat: <IconChat size={12} />,
    flashcard: <IconFlashcard size={12} />,
  };

  const typeColors: Record<string, string> = {
    Pomodoro: "#ef4444",
    chat: "#3b82f6",
    flashcard: "#06b6d4",
  };

  if (sessions.length === 0) {
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
            Son Calisma Oturumlari
          </h3>
        </div>
        <EmptyState message="Henuz oturum verisi yok" />
      </div>
    );
  }

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
          Son Calisma Oturumlari
        </h3>
      </div>

      <div className="space-y-2">
        {sessions.map((session, i) => {
          const color = typeColors[session.type] || "#6b7280";
          const icon = typeIcons[session.type] || <IconClock size={12} />;
          const subjectName = session.subject || "Genel";

          return (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg p-2.5 transition-all"
              style={{ background: "var(--bg-tertiary)" }}
            >
              <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {subjectName}
                  </span>
                  <span
                    className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold"
                    style={{ background: `${color}15`, color }}
                  >
                    {icon}
                    {session.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    {session.duration} dk
                  </span>
                </div>
              </div>
              <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
                {formatRelativeDate(session.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== STREAK ===== */
function StreakCard({ streak }: { streak: number }) {
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
          Streak
        </h3>
      </div>

      <div
        className="rounded-xl p-4 flex items-center gap-4"
        style={{ background: "var(--bg-tertiary)" }}
      >
        <span className="text-3xl">&#x1F525;</span>
        <div>
          <div className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {streak} Gun
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            Kesintisiz calisma serisi
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== LLM REPORT ===== */
function LlmReportCard({ report }: { report: DailyReport | null }) {
  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
        >
          <IconBrain size={14} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Gunluk Rapor
        </h3>
      </div>

      {!report ? (
        <EmptyState message="Henuz gunluk rapor olusturulmadi" />
      ) : (
        <div className="space-y-3">
          <div className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            {new Date(report.report_date).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" - "}
            {formatStudyTime(report.total_study_minutes)} calisma, {report.total_pomodoros} pomodoro, {report.streak_days} gun streak
          </div>

          {report.llm_analysis && (
            <div
              className="rounded-lg p-3 text-[11px] leading-relaxed"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
            >
              {report.llm_analysis}
            </div>
          )}

          {report.llm_recommendations && report.llm_recommendations.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Oneriler
              </div>
              <ul className="space-y-1.5">
                {report.llm_recommendations.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[11px] leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span
                      className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5"
                      style={{ background: "var(--accent-primary)" }}
                    />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ===== ANALYSIS PAGE ===== */
export default function AnalysisPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [report, setReport] = useState<DailyReport | null>(null);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const periodDays = period === "week" ? 7 : period === "month" ? 30 : 365;

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getAnalyticsSummary(user.id, periodDays),
      getLatestDailyReport(user.id),
      getStreakDays(user.id),
    ])
      .then(([s, r, st]) => {
        setSummary(s);
        setReport(r);
        setStreak(st);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id, periodDays]); // eslint-disable-line react-hooks/exhaustive-deps

  const periodLabel =
    period === "week" ? "Bu hafta" : period === "month" ? "Bu ay" : "Toplam";

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 sm:p-6">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Analiz
            </h1>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Ogrenme performansin ve istatistiklerin
            </p>
          </div>
          <PeriodSelector period={period} onChange={setPeriod} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard
            label="Toplam Calisma"
            value={summary ? formatStudyTime(summary.totalStudyMinutes) : "0 dk"}
            subtext={periodLabel}
            icon={<IconClock size={18} />}
            color="var(--accent-primary)"
          />
          <StatCard
            label="Pomodoro"
            value={summary ? String(summary.totalPomodoros) : "0"}
            subtext={periodLabel}
            icon={<IconPomodoro size={18} />}
            color="var(--accent-secondary)"
          />
          <StatCard
            label="Sohbet Sayisi"
            value={summary ? String(summary.totalMessages) : "0"}
            subtext={periodLabel}
            icon={<IconChat size={18} />}
            color="var(--accent-purple)"
          />
          <StatCard
            label="Flashcard"
            value={summary ? String(summary.totalFlashcards) : "0"}
            subtext={periodLabel}
            icon={<IconFlashcard size={18} />}
            color="var(--accent-warning)"
          />
        </div>

        <WeeklyActivity dailyStudyHours={summary?.dailyStudyHours || []} />
        <ActivityHeatmap heatmapData={summary?.heatmapData || []} />
        <SubjectProgress subjectBreakdown={summary?.subjectBreakdown || {}} />
        <RecentSessions sessions={summary?.recentSessions || []} />
        <StreakCard streak={streak} />
        <LlmReportCard report={report} />
      </div>
    </div>
  );
}
