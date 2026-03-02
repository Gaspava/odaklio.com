"use client";

import { useState } from "react";
import { IconSearch, IconChat, IconX } from "../icons/Icons";

interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  date: string;
  messageCount: number;
  tags: string[];
}

const mockChats: ChatHistoryItem[] = [
  {
    id: "1",
    title: "Newton Yasaları ve Hareket",
    preview: "Newton'un üç hareket yasasını detaylı olarak inceledik...",
    date: "Bugün, 14:30",
    messageCount: 12,
    tags: ["Fizik", "Mekanik"],
  },
  {
    id: "2",
    title: "İntegral Hesaplama Teknikleri",
    preview: "Belirli ve belirsiz integral arasındaki farkları ele aldık...",
    date: "Bugün, 10:15",
    messageCount: 8,
    tags: ["Matematik"],
  },
  {
    id: "3",
    title: "Hücre Bölünmesi: Mitoz vs Mayoz",
    preview: "Mitoz ve mayoz bölünme arasındaki temel farklar...",
    date: "Dün, 19:45",
    messageCount: 15,
    tags: ["Biyoloji"],
  },
  {
    id: "4",
    title: "Osmanlı İmparatorluğu Kuruluş Dönemi",
    preview: "Osmanlı İmparatorluğu'nun kuruluş dönemini kronolojik olarak...",
    date: "Dün, 16:20",
    messageCount: 10,
    tags: ["Tarih"],
  },
  {
    id: "5",
    title: "Kimyasal Bağlar ve Molekül Yapıları",
    preview: "İyonik, kovalent ve metalik bağları karşılaştırdık...",
    date: "2 gün önce",
    messageCount: 7,
    tags: ["Kimya"],
  },
  {
    id: "6",
    title: "İngilizce Tense Yapıları",
    preview: "Present Perfect ve Past Simple arasındaki kullanım farklarını...",
    date: "3 gün önce",
    messageCount: 20,
    tags: ["İngilizce"],
  },
  {
    id: "7",
    title: "Python Temel Programlama",
    preview: "Değişkenler, döngüler ve fonksiyonlar üzerine çalıştık...",
    date: "4 gün önce",
    messageCount: 18,
    tags: ["Programlama"],
  },
  {
    id: "8",
    title: "Dalga Mekaniği ve Optik",
    preview: "Işığın dalga ve parçacık doğasını inceledik...",
    date: "1 hafta önce",
    messageCount: 14,
    tags: ["Fizik", "Optik"],
  },
];

const tagColors: Record<string, string> = {
  Fizik: "var(--accent-primary)",
  Mekanik: "var(--accent-cyan)",
  Matematik: "var(--accent-secondary)",
  Biyoloji: "var(--accent-success)",
  Tarih: "var(--accent-warning)",
  Kimya: "var(--accent-danger)",
  İngilizce: "var(--accent-purple)",
  Programlama: "var(--accent-info)",
  Optik: "var(--accent-cyan)",
};

export default function ChatHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const allTags = Array.from(new Set(mockChats.flatMap((c) => c.tags)));

  const filteredChats = mockChats.filter((chat) => {
    const matchesSearch =
      !searchQuery ||
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !selectedFilter || chat.tags.includes(selectedFilter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Header with subtle gradient hero glow */}
        <div className="relative">
          {/* Gradient hero glow behind header */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 w-[280px] h-[90px] rounded-full blur-[60px] opacity-[0.12] pointer-events-none"
            style={{ background: "var(--gradient-hero)" }}
          />
          <div className="relative space-y-1.5">
            <h1
              className="text-xl font-black"
              style={{ color: "var(--text-primary)" }}
            >
              Geçmiş <span className="gradient-text-hero">Sohbetler</span>
            </h1>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--text-tertiary)" }}
            >
              Önceki öğrenme oturumlarına göz at ve devam et
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <div
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-tertiary)" }}
          >
            <IconSearch size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sohbet ara..."
            className="w-full rounded-2xl h-12 text-[13px] outline-none transition-all"
            style={{
              paddingLeft: 40,
              paddingRight: 40,
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
              boxShadow: "0 0 0 0 transparent",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-primary)";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(var(--accent-primary-rgb, 99, 102, 241), 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-primary)";
              e.currentTarget.style.boxShadow = "0 0 0 0 transparent";
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            >
              <IconX size={14} />
            </button>
          )}
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedFilter(selectedFilter === tag ? null : tag)}
              className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all active:scale-95"
              style={{
                background: selectedFilter === tag ? `${tagColors[tag]}20` : "var(--bg-tertiary)",
                color: selectedFilter === tag ? tagColors[tag] : "var(--text-tertiary)",
                border: selectedFilter === tag ? `1px solid ${tagColors[tag]}30` : "1px solid transparent",
                boxShadow: selectedFilter === tag ? `0 0 12px ${tagColors[tag]}15` : "none",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Chat List */}
        <div className="space-y-2">
          {filteredChats.map((chat, i) => (
            <button
              key={chat.id}
              className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.99]"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                animationDelay: `${i * 0.05}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08), 0 0 15px rgba(var(--accent-primary-rgb, 99, 102, 241), 0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl mt-0.5"
                  style={{
                    background: `${tagColors[chat.tags[0]] || "var(--accent-primary)"}15`,
                    color: tagColors[chat.tags[0]] || "var(--accent-primary)",
                  }}
                >
                  <IconChat size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className="text-[14px] font-bold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {chat.title}
                    </h3>
                    <span
                      className="text-[10px] font-medium flex-shrink-0"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {chat.date}
                    </span>
                  </div>
                  <p
                    className="text-xs mt-0.5 truncate"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {chat.preview}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {chat.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                        style={{
                          background: `${tagColors[tag]}15`,
                          color: tagColors[tag],
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    <span
                      className="text-[9px] font-medium ml-auto"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {chat.messageCount} mesaj
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredChats.length === 0 && (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl mx-auto mb-3"
              style={{
                background: "var(--gradient-hero)",
                color: "white",
                opacity: 0.85,
              }}
            >
              <IconSearch size={22} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Sonuç bulunamadı
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              Farklı bir arama terimi deneyin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
