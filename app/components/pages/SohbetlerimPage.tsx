"use client";

import { useState } from "react";
import { IconChat, IconSearch, IconStar, IconClock, IconChevronRight, IconTrendingUp } from "../icons/Icons";

type Category = "all" | "fen" | "matematik" | "sosyal" | "dil" | "starred";

const categories: { id: Category; label: string; color: string; count: number }[] = [
  { id: "all", label: "Tüm Sohbetler", color: "var(--accent-primary)", count: 24 },
  { id: "fen", label: "Fen Bilimleri", color: "#3b82f6", count: 8 },
  { id: "matematik", label: "Matematik", color: "#10b981", count: 6 },
  { id: "sosyal", label: "Sosyal Bilimler", color: "#8b5cf6", count: 5 },
  { id: "dil", label: "Dil & Edebiyat", color: "#ec4899", count: 3 },
  { id: "starred", label: "Yıldızlı", color: "#f59e0b", count: 2 },
];

const conversations = [
  { id: 1, title: "Dalga Mekaniği", desc: "Newton'un dalga teorisi ve ışığın parçacık-dalga ikiliği...", time: "2 saat önce", count: 12, subject: "Fizik", cat: "fen" as Category, color: "#3b82f6", starred: true, pinned: true },
  { id: 2, title: "İntegral Çözümleri", desc: "Belirli integral hesaplama yöntemleri ve alan bulma...", time: "5 saat önce", count: 8, subject: "Matematik", cat: "matematik" as Category, color: "#10b981", starred: false, pinned: true },
  { id: 3, title: "Hücre Bölünmesi", desc: "Mitoz ve mayoz bölünme arasındaki farklar, hücre döngüsü...", time: "Dün", count: 15, subject: "Biyoloji", cat: "fen" as Category, color: "#f59e0b", starred: true, pinned: false },
  { id: 4, title: "Organik Bileşikler", desc: "Hidrokarbonlar, fonksiyonel gruplar ve isimlendirme kuralları...", time: "Dün", count: 6, subject: "Kimya", cat: "fen" as Category, color: "#ef4444", starred: false, pinned: false },
  { id: 5, title: "Kurtuluş Savaşı", desc: "Mondros Ateşkes Antlaşması ve sonrası gelişmeler...", time: "2 gün önce", count: 20, subject: "Tarih", cat: "sosyal" as Category, color: "#8b5cf6", starred: false, pinned: false },
  { id: 6, title: "Şiir Analizi", desc: "Yahya Kemal'in şiirlerinde İstanbul teması ve yansımalar...", time: "3 gün önce", count: 10, subject: "Edebiyat", cat: "dil" as Category, color: "#ec4899", starred: false, pinned: false },
  { id: 7, title: "Türev Uygulamaları", desc: "Maksimum minimum problemleri ve eğri çizimi...", time: "3 gün önce", count: 14, subject: "Matematik", cat: "matematik" as Category, color: "#10b981", starred: false, pinned: false },
  { id: 8, title: "Elektromanyetizma", desc: "Maxwell denklemleri ve elektromanyetik dalgalar...", time: "4 gün önce", count: 9, subject: "Fizik", cat: "fen" as Category, color: "#3b82f6", starred: false, pinned: false },
];

export default function SohbetlerimPage() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<Category>("all");

  const filtered = conversations.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCat === "starred") return c.starred;
    if (activeCat !== "all" && c.cat !== activeCat) return false;
    return true;
  });

  const pinned = filtered.filter((c) => c.pinned);
  const rest = filtered.filter((c) => !c.pinned);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar - Categories */}
      <div
        className="hidden sm:flex flex-col w-[220px] flex-shrink-0 overflow-y-auto p-3 space-y-3"
        style={{
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-primary)",
        }}
      >
        {/* Summary */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex h-5 w-5 items-center justify-center rounded-md"
              style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
            >
              <IconTrendingUp size={10} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Özet
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center py-1.5 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>24</p>
              <p className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>Toplam</p>
            </div>
            <div className="text-center py-1.5 rounded-lg" style={{ background: "var(--bg-tertiary)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--accent-primary)" }}>5</p>
              <p className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>Bu Hafta</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex h-5 w-5 items-center justify-center rounded-md"
              style={{ background: "var(--accent-secondary-light)", color: "var(--accent-secondary)" }}
            >
              <IconChat size={10} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
              Kategoriler
            </span>
          </div>
          <div className="space-y-0.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 transition-all active:scale-[0.98]"
                style={{
                  background: activeCat === cat.id ? "var(--accent-primary-muted)" : "transparent",
                  color: activeCat === cat.id ? "var(--accent-primary)" : "var(--text-secondary)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: cat.color }}
                />
                <span className="text-[11px] font-medium flex-1 text-left">{cat.label}</span>
                <span className="text-[10px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <button
            className="w-full rounded-lg py-2 text-[11px] font-semibold transition-all active:scale-[0.98]"
            style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
          >
            + Yeni Sohbet Başlat
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 h-10"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <IconSearch size={15} style={{ color: "var(--text-tertiary)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Konuşma ara..."
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            {filtered.length} sonuç
          </span>
        </div>

        {/* Mobile Category Tabs */}
        <div className="flex sm:hidden gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
              style={{
                background: activeCat === cat.id ? "var(--accent-primary-muted)" : "var(--bg-tertiary)",
                color: activeCat === cat.id ? "var(--accent-primary)" : "var(--text-tertiary)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Pinned */}
        {pinned.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Sabitlenmiş
              </span>
              <div className="flex-1 h-px" style={{ background: "var(--border-secondary)" }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pinned.map((conv) => (
                <ConversationCard key={conv.id} conv={conv} />
              ))}
            </div>
          </div>
        )}

        {/* All Conversations */}
        <div>
          {pinned.length > 0 && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                Tüm Sohbetler
              </span>
              <div className="flex-1 h-px" style={{ background: "var(--border-secondary)" }} />
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {rest.map((conv) => (
              <ConversationCard key={conv.id} conv={conv} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversationCard({ conv }: { conv: typeof conversations[number] }) {
  return (
    <button
      className="w-full text-left rounded-xl p-3.5 transition-all hover:scale-[1.01] active:scale-[0.99]"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-white text-[10px] font-bold"
          style={{ background: conv.color }}
        >
          {conv.subject.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[12px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {conv.title}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {conv.starred && <IconStar size={11} style={{ color: "var(--accent-warning)" }} />}
              <IconChevronRight size={12} style={{ color: "var(--text-tertiary)" }} />
            </div>
          </div>
          <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>
            {conv.desc}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: `${conv.color}12`, color: conv.color }}
            >
              {conv.subject}
            </span>
            <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>{conv.time}</span>
            <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>{conv.count} mesaj</span>
          </div>
        </div>
      </div>
    </button>
  );
}
