"use client";

import { useState } from "react";
import {
  IconFlashcard,
  IconMindMap,
  IconSpeedRead,
  IconPomodoro,
  IconHelp,
  IconBrain,
  IconChevronRight,
  IconStar,
  IconTrendingUp,
  IconLightning,
  IconBookmark,
} from "../icons/Icons";

type ToolCat = "all" | "calisma" | "tekrar" | "yaratici";

const toolCategories: { id: ToolCat; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "calisma", label: "Çalışma" },
  { id: "tekrar", label: "Tekrar" },
  { id: "yaratici", label: "Yaratıcılık" },
];

const tools = [
  { id: "flashcard", name: "Flashcard", desc: "Kartlarla etkili tekrar yap, aralıklı tekrar sistemiyle hafızanı güçlendir", icon: <IconFlashcard size={24} />, color: "#f59e0b", cat: "tekrar" as ToolCat, stats: "48 kart", progress: 65, lastUsed: "Bugün" },
  { id: "mindmap", name: "Mind Map", desc: "Görsel haritalar oluştur, konular arası bağlantıları keşfet", icon: <IconMindMap size={24} />, color: "#8b5cf6", cat: "yaratici" as ToolCat, stats: "5 harita", progress: 40, lastUsed: "Dün" },
  { id: "speed-read", name: "Hızlı Okuma", desc: "RSVP tekniğiyle okuma hızını artır, anlama kapasiteni geliştir", icon: <IconSpeedRead size={24} />, color: "#3b82f6", cat: "calisma" as ToolCat, stats: "320 wpm", progress: 72, lastUsed: "2 gün önce" },
  { id: "pomodoro", name: "Pomodoro", desc: "Odaklı çalışma zamanlayıcısı, mola ve çalışma döngüleri", icon: <IconPomodoro size={24} />, color: "#10b981", cat: "calisma" as ToolCat, stats: "4/6 bugün", progress: 67, lastUsed: "Bugün" },
  { id: "quiz", name: "Quiz", desc: "Kendini test et, zayıf noktalarını belirle ve geliştir", icon: <IconHelp size={24} />, color: "#ef4444", cat: "tekrar" as ToolCat, stats: "12 quiz", progress: 85, lastUsed: "Dün" },
  { id: "notes", name: "Akıllı Notlar", desc: "AI destekli not tutma, otomatik özetleme ve anahtar kelime çıkarma", icon: <IconBrain size={24} />, color: "#06b6d4", cat: "yaratici" as ToolCat, stats: "23 not", progress: 50, lastUsed: "3 gün önce" },
  { id: "summary", name: "Hızlı Öğren", desc: "Herhangi bir konuyu hızlıca öğren, AI destekli özet ve açıklama", icon: <IconLightning size={24} />, color: "#ec4899", cat: "calisma" as ToolCat, stats: "18 konu", progress: 55, lastUsed: "Bugün" },
  { id: "bookmark", name: "Kaynak Kütüphanesi", desc: "Faydalı kaynakları kaydet, düzenle ve konulara göre grupla", icon: <IconBookmark size={24} />, color: "#64748b", cat: "yaratici" as ToolCat, stats: "34 kaynak", progress: 30, lastUsed: "Bu hafta" },
];

const featuredTool = tools[0];

export default function AraclarPage() {
  const [activeCat, setActiveCat] = useState<ToolCat>("all");

  const filtered = activeCat === "all" ? tools : tools.filter((t) => t.cat === activeCat);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar - Stats & Categories */}
      <div
        className="hidden sm:flex flex-col w-[220px] flex-shrink-0 overflow-y-auto p-3 space-y-3"
        style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border-primary)" }}
      >
        {/* Usage Stats */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}>
              <IconTrendingUp size={10} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Kullanım</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Bugün</span>
              <span className="text-[10px] font-bold" style={{ color: "var(--accent-primary)" }}>12 kullanım</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Bu Hafta</span>
              <span className="text-[10px] font-bold" style={{ color: "var(--text-primary)" }}>67 kullanım</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>En Çok</span>
              <span className="text-[10px] font-bold" style={{ color: "#f59e0b" }}>Flashcard</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-secondary-light)", color: "var(--accent-secondary)" }}>
              <IconStar size={10} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Kategoriler</span>
          </div>
          <div className="space-y-0.5">
            {toolCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[11px] font-medium transition-all"
                style={{
                  background: activeCat === cat.id ? "var(--accent-primary-muted)" : "transparent",
                  color: activeCat === cat.id ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Favorites */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-warning-light)", color: "var(--accent-warning)" }}>
              <IconStar size={10} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Sık Kullanılanlar</span>
          </div>
          {tools.slice(0, 3).map((t) => (
            <button
              key={t.id}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 transition-all hover:bg-[var(--bg-tertiary)]"
            >
              <span style={{ color: t.color }}>{t.icon}</span>
              <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {/* Featured Tool */}
        <div
          className="rounded-xl p-5 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${featuredTool.color}18, ${featuredTool.color}08)`,
            border: `1px solid ${featuredTool.color}20`,
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-white"
              style={{ background: featuredTool.color, boxShadow: `0 0 20px ${featuredTool.color}40` }}
            >
              {featuredTool.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: featuredTool.color }}>
                  EN ÇOK KULLANILAN
                </span>
              </div>
              <h2 className="text-base font-bold mt-1" style={{ color: "var(--text-primary)" }}>
                {featuredTool.name}
              </h2>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                {featuredTool.desc}
              </p>
            </div>
            <button
              className="hidden sm:flex h-9 items-center gap-1.5 rounded-xl px-4 text-[11px] font-semibold text-white transition-all active:scale-95"
              style={{ background: featuredTool.color }}
            >
              Başla
              <IconChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Mobile Category Tabs */}
        <div className="flex sm:hidden gap-1.5 overflow-x-auto">
          {toolCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
              style={{
                background: activeCat === cat.id ? "var(--accent-primary-muted)" : "var(--bg-tertiary)",
                color: activeCat === cat.id ? "var(--accent-primary)" : "var(--text-tertiary)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((tool) => (
            <button
              key={tool.id}
              className="text-left rounded-xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99] group"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                  style={{ background: `${tool.color}12`, color: tool.color }}
                >
                  {tool.icon}
                </div>
                <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}>
                  {tool.lastUsed}
                </span>
              </div>
              <h3 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>{tool.name}</h3>
              <p className="text-[10px] mt-1 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{tool.desc}</p>

              {/* Progress */}
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-secondary)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold" style={{ color: tool.color }}>{tool.stats}</span>
                  <span className="text-[9px] font-medium" style={{ color: "var(--text-tertiary)" }}>{tool.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${tool.progress}%`, background: tool.color }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
