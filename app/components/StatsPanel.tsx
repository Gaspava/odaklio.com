"use client";
import { useState } from "react";

interface SearchEntry {
  query: string;
  count: number;
  lastSearched: string;
  category: string;
}

const SEARCH_HISTORY: SearchEntry[] = [
  { query: "Kuantum mekanigi", count: 12, lastSearched: "2 saat once", category: "Fizik" },
  { query: "DNA replikasyonu", count: 8, lastSearched: "5 saat once", category: "Biyoloji" },
  { query: "Turev alma kurallari", count: 15, lastSearched: "1 gun once", category: "Matematik" },
  { query: "Organik kimya", count: 6, lastSearched: "2 gun once", category: "Kimya" },
  { query: "Ingilizce grammar", count: 10, lastSearched: "3 gun once", category: "Dil" },
];

const CATEGORY_DATA = [
  { name: "Fizik", hours: 24, color: "#7c6cf0", percent: 35 },
  { name: "Matematik", hours: 18, color: "#0984e3", percent: 26 },
  { name: "Biyoloji", hours: 12, color: "#00b894", percent: 17 },
  { name: "Kimya", hours: 8, color: "#e17055", percent: 12 },
  { name: "Dil", hours: 7, color: "#fdcb6e", percent: 10 },
];

const DAILY_HOURS = [2.5, 3.2, 1.8, 4.0, 3.5, 2.0, 1.5];
const MAX_DAILY = Math.max(...DAILY_HOURS);
const DAYS = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];

export default function StatsPanel() {
  const [tab, setTab] = useState<"overview" | "history" | "insights">("overview");

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Istatistikler
        </h3>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl p-1" style={{ backgroundColor: "var(--bg-tertiary)" }}>
        {([
          { key: "overview", label: "Genel" },
          { key: "history", label: "Arama Gecmisi" },
          { key: "insights", label: "Oneriler" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 rounded-lg py-1.5 text-xs font-medium"
            style={{
              backgroundColor: tab === t.key ? "var(--accent)" : "transparent",
              color: tab === t.key ? "#fff" : "var(--text-secondary)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Bu Hafta", value: "18.5s", sub: "+2.3s", positive: true },
              { label: "Seri", value: "12 gun", sub: "En iyi: 18", positive: true },
              { label: "Kartlar", value: "156", sub: "%78 basari", positive: true },
              { label: "Sorular", value: "89", sub: "Bu ay", positive: true },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-3" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{s.label}</div>
                <div className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</div>
                <div className="text-[10px]" style={{ color: s.positive ? "#00b894" : "#e17055" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Daily chart */}
          <div className="rounded-xl p-3" style={{ backgroundColor: "var(--bg-tertiary)" }}>
            <h4 className="mb-3 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              Gunluk Calisma Suresi
            </h4>
            <div className="flex items-end gap-2">
              {DAILY_HOURS.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                    {h}s
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${(h / MAX_DAILY) * 60}px`,
                      background: "var(--accent-gradient)",
                      opacity: 0.6 + (h / MAX_DAILY) * 0.4,
                    }}
                  />
                  <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>{DAYS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="rounded-xl p-3" style={{ backgroundColor: "var(--bg-tertiary)" }}>
            <h4 className="mb-3 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
              Konu Dagilimi
            </h4>
            <div className="flex flex-col gap-2">
              {CATEGORY_DATA.map((c) => (
                <div key={c.name}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-xs" style={{ color: "var(--text-primary)" }}>{c.name}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{c.hours}s ({c.percent}%)</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ backgroundColor: "var(--border-color)" }}>
                    <div className="h-full rounded-full" style={{ width: `${c.percent}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Aradiklarin kayit altina aliniyor. Seni tanimaya basliyorum!
          </p>
          {SEARCH_HISTORY.map((entry) => (
            <div key={entry.query} className="rounded-xl p-3" style={{ backgroundColor: "var(--bg-tertiary)" }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {entry.query}
                </span>
                <span
                  className="rounded-md px-1.5 py-0.5 text-[9px]"
                  style={{
                    backgroundColor: "var(--accent-light)",
                    color: "var(--accent)",
                  }}
                >
                  {entry.category}
                </span>
              </div>
              <div className="mt-1 flex gap-3 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                <span>{entry.count}x aranmis</span>
                <span>{entry.lastSearched}</span>
              </div>
            </div>
          ))}
          <div className="mt-2 rounded-xl p-3" style={{ backgroundColor: "var(--accent-light)" }}>
            <div className="text-xs font-medium" style={{ color: "var(--accent)" }}>
              Profil Analizi
            </div>
            <p className="mt-1 text-[10px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Fizik ve Matematik alanlarinda yoğun calisiyorsun. Kuantum mekanigi ve turev konularina ozel ilgi gosteriyorsun.
              Bu hafta biyoloji konusunda daha az calistın.
            </p>
          </div>
        </div>
      )}

      {tab === "insights" && (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {[
            {
              title: "Zayif Alan Tespiti",
              desc: "Organik kimya konusunda basari oranin %45. Bu konuda daha fazla flash kart calis.",
              color: "#e17055",
              action: "Flash Kartlara Git",
            },
            {
              title: "En Verimli Saatin",
              desc: "Saat 09:00-11:00 arasi en verimli calistığın saat dilimi. Zor konulari bu saate planla.",
              color: "#00b894",
              action: "Programa Ekle",
            },
            {
              title: "Tekrar Zamani",
              desc: "DNA replikasyonu konusunu 3 gundur tekrar etmedin. Unutma egrisi baslıyor!",
              color: "#fdcb6e",
              action: "Simdi Tekrar Et",
            },
            {
              title: "Haftalik Hedef",
              desc: "Bu hafta 20 saat hedefinin %92.5'ini tamamladin. 1.5 saat daha calis!",
              color: "#7c6cf0",
              action: "Pomodoro Baslat",
            },
          ].map((insight) => (
            <div
              key={insight.title}
              className="rounded-xl p-3"
              style={{
                backgroundColor: `${insight.color}11`,
                border: `1px solid ${insight.color}22`,
              }}
            >
              <div className="text-xs font-semibold" style={{ color: insight.color }}>
                {insight.title}
              </div>
              <p className="mt-1 text-[10px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {insight.desc}
              </p>
              <button
                className="mt-2 rounded-lg px-3 py-1 text-[10px] font-medium"
                style={{ backgroundColor: `${insight.color}22`, color: insight.color }}
              >
                {insight.action} →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
