"use client";

import {
  IconBarChart,
  IconTrendingUp,
  IconClock,
  IconBrain,
  IconStar,
  IconLightning,
} from "../icons/Icons";

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4 transition-all"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            background: `${color}15`,
            color: color,
          }}
        >
          {icon}
        </div>
        <span
          className="text-[11px] font-semibold"
          style={{ color: "var(--text-tertiary)" }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-2xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
      <p className="text-[10px] font-medium mt-1" style={{ color }}>
        {sub}
      </p>
    </div>
  );
}

function SkillBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </span>
        <span
          className="text-[11px] font-bold"
          style={{ color }}
        >
          %{value}
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--bg-tertiary)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${value}%`,
            background: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
    </div>
  );
}

export default function SelfAnalysisTab() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: "var(--accent-purple-light)",
              color: "var(--accent-purple)",
            }}
          >
            <IconBarChart size={20} />
          </div>
          <div>
            <h2
              className="text-base font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Kendini Analiz Et
            </h2>
            <p
              className="text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              Ogrenme performansini takip et
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<IconClock size={14} />}
            label="Toplam Sure"
            value="24.5s"
            sub="+3.2s bu hafta"
            color="var(--accent-primary)"
          />
          <StatCard
            icon={<IconTrendingUp size={14} />}
            label="Gunluk Seri"
            value="7 Gun"
            sub="En iyi: 12 gun"
            color="var(--accent-warning)"
          />
          <StatCard
            icon={<IconBrain size={14} />}
            label="Soru Cozumu"
            value="142"
            sub="%78 basari"
            color="var(--accent-secondary)"
          />
          <StatCard
            icon={<IconStar size={14} />}
            label="Odak Skoru"
            value="85"
            sub="Cok iyi seviye"
            color="var(--accent-purple)"
          />
        </div>

        {/* Skills Progress */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-lg"
              style={{
                background: "var(--accent-primary-light)",
                color: "var(--accent-primary)",
              }}
            >
              <IconLightning size={12} />
            </div>
            <h3
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Konu Bazli Ilerleme
            </h3>
          </div>
          <div className="space-y-3">
            <SkillBar label="Matematik" value={72} color="var(--accent-primary)" />
            <SkillBar label="Fizik" value={58} color="var(--accent-secondary)" />
            <SkillBar label="Biyoloji" value={85} color="var(--accent-success)" />
            <SkillBar label="Tarih" value={45} color="var(--accent-warning)" />
            <SkillBar label="Programlama" value={90} color="var(--accent-purple)" />
          </div>
        </div>

        {/* Weekly Activity */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-lg"
              style={{
                background: "var(--accent-secondary-light)",
                color: "var(--accent-secondary)",
              }}
            >
              <IconTrendingUp size={12} />
            </div>
            <h3
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Haftalik Aktivite
            </h3>
          </div>
          <div className="flex items-end justify-between gap-2 h-24">
            {[
              { day: "Pzt", h: 65 },
              { day: "Sal", h: 80 },
              { day: "Car", h: 45 },
              { day: "Per", h: 90 },
              { day: "Cum", h: 70 },
              { day: "Cmt", h: 55 },
              { day: "Paz", h: 30 },
            ].map((d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <div
                  className="w-full rounded-md transition-all"
                  style={{
                    height: `${d.h}%`,
                    background:
                      d.h >= 70
                        ? "var(--gradient-primary)"
                        : "var(--bg-tertiary)",
                    boxShadow:
                      d.h >= 70 ? "var(--shadow-glow-sm)" : "none",
                  }}
                />
                <span
                  className="text-[9px] font-semibold"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--accent-primary-muted)",
            border: "1px solid rgba(16, 185, 129, 0.1)",
          }}
        >
          <p
            className="text-xs font-semibold mb-1"
            style={{ color: "var(--accent-primary)" }}
          >
            AI Onerisi
          </p>
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            Tarih konusunda daha fazla calisma yapmaniz onerilir. Haftalik
            hedefinize ulasmak icin gunluk 15 dakika ekstra calisma
            eklemeniz faydali olacaktir.
          </p>
        </div>
      </div>
    </div>
  );
}
