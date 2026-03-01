"use client";

import { useState } from "react";
import {
  IconSearch,
  IconStar,
  IconLightning,
  IconBrain,
  IconBookmark,
  IconChevronRight,
  IconTrendingUp,
  IconGlobe,
  IconLayers,
  IconHash,
} from "../icons/Icons";

interface Topic {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  progress?: number;
  difficulty: string;
  subtopics: string[];
}

const categories = [
  { id: "all", name: "Tümü", icon: <IconLayers size={13} />, color: "var(--accent-primary)" },
  { id: "fizik", name: "Fizik", icon: <IconLightning size={13} />, color: "#8B5CF6" },
  { id: "matematik", name: "Matematik", icon: <IconHash size={13} />, color: "#3B82F6" },
  { id: "biyoloji", name: "Biyoloji", icon: <IconBrain size={13} />, color: "#10B981" },
  { id: "kimya", name: "Kimya", icon: <IconGlobe size={13} />, color: "#F59E0B" },
];

const topics: Topic[] = [
  {
    id: "kuantum",
    title: "Kuantum Mekaniği",
    category: "fizik",
    description: "Atomaltı parçacıkların davranışlarını inceleyen fizik dalı. Süperpozisyon, dolanıklık ve belirsizlik ilkesi gibi temel kavramları kapsar.",
    icon: <IconLightning size={20} />,
    color: "#8B5CF6",
    progress: 65,
    difficulty: "Zor",
    subtopics: ["Dalga-Parçacık İkiliği", "Heisenberg Belirsizlik", "Schrödinger Denklemi", "Kuantum Dolanıklık"],
  },
  {
    id: "integral",
    title: "İntegral Hesap",
    category: "matematik",
    description: "Fonksiyonların alanlarını, hacimlerini ve toplamlarını hesaplama yöntemi. Belirli ve belirsiz integral kavramlarını içerir.",
    icon: <IconHash size={20} />,
    color: "#3B82F6",
    progress: 40,
    difficulty: "Orta",
    subtopics: ["Belirsiz İntegral", "Belirli İntegral", "Alan Hesabı", "Hacim Hesabı"],
  },
  {
    id: "genetik",
    title: "Genetik ve Kalıtım",
    category: "biyoloji",
    description: "DNA, RNA ve protein sentezi. Mendel genetiği, modern genetik ve mutasyon kavramlarını kapsar.",
    icon: <IconBrain size={20} />,
    color: "#10B981",
    progress: 80,
    difficulty: "Orta",
    subtopics: ["DNA Yapısı", "Protein Sentezi", "Mendel Genetiği", "Mutasyonlar"],
  },
  {
    id: "termodinamik",
    title: "Termodinamik",
    category: "fizik",
    description: "Isı, enerji ve iş arasındaki ilişkileri inceleyen fizik dalı. Dört temel yasa üzerine kuruludur.",
    icon: <IconLightning size={20} />,
    color: "#EF4444",
    progress: 25,
    difficulty: "Zor",
    subtopics: ["1. Yasa: Enerji Korunumu", "2. Yasa: Entropi", "Carnot Döngüsü", "İdeal Gazlar"],
  },
  {
    id: "turev",
    title: "Türev ve Uygulamaları",
    category: "matematik",
    description: "Fonksiyonların değişim hızlarını analiz etme. Limit, süreklilik ve türev kurallarını kapsar.",
    icon: <IconHash size={20} />,
    color: "#6366F1",
    progress: 90,
    difficulty: "Orta",
    subtopics: ["Limit Kavramı", "Türev Kuralları", "Maks-Min Problemleri", "Eğri Çizimi"],
  },
  {
    id: "organik",
    title: "Organik Kimya",
    category: "kimya",
    description: "Karbon bileşiklerinin yapısı, özellikleri ve reaksiyonları. Hidrokarbonlar ve fonksiyonel gruplar.",
    icon: <IconGlobe size={20} />,
    color: "#F59E0B",
    progress: 15,
    difficulty: "Zor",
    subtopics: ["Hidrokarbonlar", "Alkol ve Eterler", "Aldehit ve Ketonlar", "Karboksilik Asitler"],
  },
  {
    id: "hucre",
    title: "Hücre Biyolojisi",
    category: "biyoloji",
    description: "Hücre yapısı, organeller ve hücre bölünmesi. Prokaryot ve ökaryot hücre farklılıkları.",
    icon: <IconBrain size={20} />,
    color: "#14B8A6",
    progress: 55,
    difficulty: "Kolay",
    subtopics: ["Hücre Zarı", "Organeller", "Mitoz Bölünme", "Mayoz Bölünme"],
  },
  {
    id: "elektromanyetizma",
    title: "Elektromanyetizma",
    category: "fizik",
    description: "Elektrik ve manyetik alanlar, Maxwell denklemleri ve elektromanyetik dalgalar.",
    icon: <IconLightning size={20} />,
    color: "#0EA5E9",
    progress: 35,
    difficulty: "Zor",
    subtopics: ["Coulomb Yasası", "Gauss Yasası", "Faraday Yasası", "Maxwell Denklemleri"],
  },
];

const trendingTopics = [
  { title: "Yapay Zeka Temelleri", searches: "2.4K" },
  { title: "Kuantum Bilgisayarlar", searches: "1.8K" },
  { title: "Biyoteknoloji", searches: "1.2K" },
  { title: "Uzay Fiziği", searches: "980" },
];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    Kolay: "var(--accent-success)",
    Orta: "var(--accent-warning)",
    Zor: "var(--accent-danger)",
  };
  return (
    <span
      className="text-[9px] font-bold uppercase tracking-wider"
      style={{ color: colors[difficulty] || "var(--text-tertiary)" }}
    >
      {difficulty}
    </span>
  );
}

export default function ExploreMode() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const filteredTopics = topics.filter((t) => {
    const matchCategory = activeCategory === "all" || t.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Search Header */}
        <div className="px-8 pt-8 pb-4">
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Keşfet
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
            Yeni konuları keşfet, öğrenme yolculuğunu genişlet
          </p>

          {/* Search Bar */}
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <IconSearch size={18} style={{ color: "var(--text-tertiary)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Konu, kavram veya anahtar kelime ara..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
            />
            {searchQuery && (
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                {filteredTopics.length} sonuç
              </span>
            )}
          </div>

          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  background: activeCategory === cat.id ? cat.color : "var(--bg-tertiary)",
                  color: activeCategory === cat.id ? "#fff" : "var(--text-secondary)",
                  boxShadow: activeCategory === cat.id ? `0 0 16px ${cat.color}30` : "none",
                }}
              >
                {cat.icon}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Cards Grid */}
        <div className="px-8 pb-8">
          <div className="grid grid-cols-2 gap-4">
            {filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="rounded-xl overflow-hidden transition-all hover:scale-[1.01] cursor-pointer"
                style={{
                  background: "var(--bg-card)",
                  border: expandedTopic === topic.id
                    ? `1px solid ${topic.color}`
                    : "1px solid var(--border-primary)",
                  boxShadow: expandedTopic === topic.id
                    ? `0 0 20px ${topic.color}20`
                    : "var(--shadow-sm)",
                }}
                onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: `${topic.color}15`, color: topic.color }}
                    >
                      {topic.icon}
                    </div>
                    <DifficultyBadge difficulty={topic.difficulty} />
                  </div>

                  <h3
                    className="text-sm font-bold mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {topic.title}
                  </h3>
                  <p
                    className="text-[11px] leading-relaxed mb-4"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {topic.description.length > 100
                      ? topic.description.substring(0, 100) + "..."
                      : topic.description}
                  </p>

                  {/* Progress */}
                  {topic.progress !== undefined && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                          İlerleme
                        </span>
                        <span className="text-[10px] font-bold" style={{ color: topic.color }}>
                          %{topic.progress}
                        </span>
                      </div>
                      <div
                        className="h-1.5 w-full rounded-full overflow-hidden"
                        style={{ background: "var(--bg-tertiary)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${topic.progress}%`,
                            background: topic.color,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Expanded Subtopics */}
                {expandedTopic === topic.id && (
                  <div
                    className="px-5 pb-5 pt-0 animate-fade-in"
                    style={{ borderTop: "1px solid var(--border-secondary)" }}
                  >
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wider mb-2 pt-4"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      Alt Konular
                    </p>
                    <div className="space-y-1.5">
                      {topic.subtopics.map((sub, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors"
                          style={{ background: "var(--bg-tertiary)" }}
                        >
                          <div
                            className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                            style={{ background: topic.color }}
                          />
                          <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>
                            {sub}
                          </span>
                          <IconChevronRight size={10} className="ml-auto" style={{ color: "var(--text-tertiary)" }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredTopics.length === 0 && (
            <div className="text-center py-16">
              <IconSearch size={40} style={{ color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Sonuç bulunamadı
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                Farklı bir arama terimi veya kategori deneyin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Trending & Mind Map */}
      <div
        className="w-72 flex-shrink-0 overflow-y-auto border-l"
        style={{
          borderColor: "var(--border-primary)",
          background: "var(--bg-secondary)",
        }}
      >
        <div className="p-4 space-y-4">
          {/* Trending */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <IconTrendingUp size={13} style={{ color: "var(--accent-danger)" }} />
              <h3
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-tertiary)" }}
              >
                Trend Konular
              </h3>
            </div>
            <div className="space-y-2">
              {trendingTopics.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white"
                    style={{
                      background: i === 0
                        ? "var(--accent-danger)"
                        : i === 1
                          ? "var(--accent-warning)"
                          : "var(--bg-secondary)",
                      color: i > 1 ? "var(--text-tertiary)" : "#fff",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {t.title}
                    </p>
                    <p className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>
                      {t.searches} arama
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Stats */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              Öğrenme İstatistikleri
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Konu", value: "12", icon: <IconLayers size={12} />, color: "var(--accent-primary)" },
                { label: "Tamamlanan", value: "4", icon: <IconStar size={12} />, color: "var(--accent-warning)" },
                { label: "Devam Eden", value: "6", icon: <IconLightning size={12} />, color: "var(--accent-success)" },
                { label: "Kayıtlı", value: "8", icon: <IconBookmark size={12} />, color: "var(--accent-secondary)" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-lg p-3 text-center"
                  style={{ background: "var(--bg-tertiary)" }}
                >
                  <div className="flex items-center justify-center mb-1" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
                  <p className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Mind Map Preview */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              Bilgi Haritası
            </h3>

            <div
              className="rounded-lg overflow-hidden"
              style={{ height: 160, background: "var(--bg-tertiary)", position: "relative" }}
            >
              <svg width="100%" height="100%" viewBox="0 0 260 160">
                {/* Connection Lines */}
                <line x1="130" y1="80" x2="50" y2="30" stroke="#8B5CF6" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="130" y1="80" x2="210" y2="30" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="130" y1="80" x2="40" y2="130" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="130" y1="80" x2="220" y2="130" stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.4" />

                {/* Sub lines */}
                <line x1="50" y1="30" x2="15" y2="15" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.2" />
                <line x1="50" y1="30" x2="30" y2="55" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.2" />
                <line x1="210" y1="30" x2="240" y2="15" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.2" />
                <line x1="210" y1="30" x2="235" y2="55" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.2" />

                {/* Center */}
                <circle cx="130" cy="80" r="20" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="2" />
                <text x="130" y="83" textAnchor="middle" fontSize="7" fill="var(--text-primary)" fontWeight="700">Bilgilerim</text>

                {/* Main Branches */}
                <circle cx="50" cy="30" r="15" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="1.5" />
                <text x="50" y="33" textAnchor="middle" fontSize="6" fill="var(--text-secondary)" fontWeight="600">Fizik</text>

                <circle cx="210" cy="30" r="15" fill="#3B82F6" fillOpacity="0.15" stroke="#3B82F6" strokeWidth="1.5" />
                <text x="210" y="33" textAnchor="middle" fontSize="6" fill="var(--text-secondary)" fontWeight="600">Matematik</text>

                <circle cx="40" cy="130" r="15" fill="#10B981" fillOpacity="0.15" stroke="#10B981" strokeWidth="1.5" />
                <text x="40" y="133" textAnchor="middle" fontSize="6" fill="var(--text-secondary)" fontWeight="600">Biyoloji</text>

                <circle cx="220" cy="130" r="15" fill="#F59E0B" fillOpacity="0.15" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="220" y="133" textAnchor="middle" fontSize="6" fill="var(--text-secondary)" fontWeight="600">Kimya</text>

                {/* Sub nodes */}
                <circle cx="15" cy="15" r="8" fill="#8B5CF6" fillOpacity="0.1" stroke="#8B5CF6" strokeWidth="0.8" />
                <circle cx="30" cy="55" r="8" fill="#8B5CF6" fillOpacity="0.1" stroke="#8B5CF6" strokeWidth="0.8" />
                <circle cx="240" cy="15" r="8" fill="#3B82F6" fillOpacity="0.1" stroke="#3B82F6" strokeWidth="0.8" />
                <circle cx="235" cy="55" r="8" fill="#3B82F6" fillOpacity="0.1" stroke="#3B82F6" strokeWidth="0.8" />
              </svg>
            </div>

            <button
              className="mt-3 w-full rounded-lg py-2 text-[11px] font-medium text-center transition-colors"
              style={{
                background: "var(--accent-primary-light)",
                color: "var(--accent-primary)",
              }}
            >
              Tam Ekran Görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
