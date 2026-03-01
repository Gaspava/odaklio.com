"use client";

import { useState } from "react";
import { IconChat, IconSearch, IconStar, IconClock } from "../icons/Icons";

const conversations = [
  {
    id: 1,
    title: "Fizik - Dalga Mekaniği",
    lastMessage: "Newton'un dalga teorisi ve ışığın parçacık-dalga ikiliği hakkında konuştuk...",
    time: "2 saat önce",
    messageCount: 12,
    subject: "Fizik",
    color: "#3b82f6",
    starred: true,
  },
  {
    id: 2,
    title: "Matematik - İntegral Çözümleri",
    lastMessage: "Belirli integral hesaplama yöntemleri ve alan bulma problemleri...",
    time: "5 saat önce",
    messageCount: 8,
    subject: "Matematik",
    color: "#10b981",
    starred: false,
  },
  {
    id: 3,
    title: "Biyoloji - Hücre Bölünmesi",
    lastMessage: "Mitoz ve mayoz bölünme arasındaki farklar, hücre döngüsü...",
    time: "Dün",
    messageCount: 15,
    subject: "Biyoloji",
    color: "#f59e0b",
    starred: true,
  },
  {
    id: 4,
    title: "Kimya - Organik Bileşikler",
    lastMessage: "Hidrokarbonlar, fonksiyonel gruplar ve isimlendirme kuralları...",
    time: "Dün",
    messageCount: 6,
    subject: "Kimya",
    color: "#ef4444",
    starred: false,
  },
  {
    id: 5,
    title: "Tarih - Kurtuluş Savaşı",
    lastMessage: "Mondros Ateşkes Antlaşması ve sonrası gelişmeler...",
    time: "2 gün önce",
    messageCount: 20,
    subject: "Tarih",
    color: "#8b5cf6",
    starred: false,
  },
  {
    id: 6,
    title: "Edebiyat - Şiir Analizi",
    lastMessage: "Yahya Kemal'in şiirlerinde İstanbul teması ve toplumsal yansımalar...",
    time: "3 gün önce",
    messageCount: 10,
    subject: "Edebiyat",
    color: "#ec4899",
    starred: false,
  },
];

type Filter = "all" | "starred" | "recent";

export default function SohbetlerimPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = conversations.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === "starred" && !c.starred) return false;
    return true;
  });

  const filters: { id: Filter; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "Tümü", icon: <IconChat size={12} /> },
    { id: "starred", label: "Yıldızlı", icon: <IconStar size={12} /> },
    { id: "recent", label: "Son", icon: <IconClock size={12} /> },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Page Header */}
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Sohbetlerim
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Tüm geçmiş konuşmalarınız
          </p>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 h-10"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
          }}
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
        </div>

        {/* Filters */}
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={{
                background: filter === f.id ? "var(--accent-primary-muted)" : "var(--bg-tertiary)",
                color: filter === f.id ? "var(--accent-primary)" : "var(--text-tertiary)",
                border: filter === f.id ? "1px solid rgba(16, 185, 129, 0.15)" : "1px solid transparent",
              }}
            >
              {f.icon}
              {f.label}
            </button>
          ))}
        </div>

        {/* Conversations */}
        <div className="space-y-2">
          {filtered.map((conv) => (
            <button
              key={conv.id}
              className="w-full text-left rounded-xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ background: conv.color }}
                >
                  <IconChat size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {conv.title}
                    </h3>
                    {conv.starred && (
                      <IconStar size={13} style={{ color: "var(--accent-warning)", flexShrink: 0 }} />
                    )}
                  </div>
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>
                    {conv.lastMessage}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${conv.color}15`, color: conv.color }}
                    >
                      {conv.subject}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                      {conv.time}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                      {conv.messageCount} mesaj
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
