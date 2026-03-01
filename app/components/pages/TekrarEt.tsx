"use client";

import { useState } from "react";
import {
  IconFileText,
  IconMindMap,
  IconFlashcard,
  IconPlus,
  IconChevronRight,
  IconChevronLeft,
  IconStar,
  IconClock,
  IconSearch,
} from "../icons/Icons";

/* ===== TYPES ===== */
type SubTab = "notlar" | "mindmap" | "flashcard";

interface Note {
  id: number;
  title: string;
  content: string;
  subject: string;
  color: string;
  date: string;
  pinned?: boolean;
}

/* ===== NOTES SECTION ===== */
function NotesSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const notes: Note[] = [
    {
      id: 1,
      title: "Kuantum Mekaniği Temelleri",
      content:
        "Dalga-parçacık ikiliği, Heisenberg belirsizlik ilkesi, Schrödinger denklemi. Kuantum süperpozisyon ve dolanıklık kavramları...",
      subject: "Fizik",
      color: "var(--accent-primary)",
      date: "Bugün",
      pinned: true,
    },
    {
      id: 2,
      title: "İntegral Alma Kuralları",
      content:
        "Belirsiz integral, belirli integral, kısmi integrasyon, değişken değiştirme yöntemi. Trigonometrik integraller...",
      subject: "Matematik",
      color: "var(--accent-secondary)",
      date: "Dün",
      pinned: true,
    },
    {
      id: 3,
      title: "Hücre Bölünmesi - Mitoz & Mayoz",
      content:
        "Mitoz: Profaz, metafaz, anafaz, telofaz. 2n → 2n. Mayoz: İki aşamalı bölünme, krossing over, genetik çeşitlilik...",
      subject: "Biyoloji",
      color: "var(--accent-success)",
      date: "2 gün önce",
    },
    {
      id: 4,
      title: "Osmanlı Devleti Kuruluş Dönemi",
      content:
        "1299 kuruluş, Osman Bey, Orhan Bey dönemi genişlemeleri. Bursa'nın fethi, Rumeli'ye geçiş...",
      subject: "Tarih",
      color: "var(--accent-warning)",
      date: "3 gün önce",
    },
    {
      id: 5,
      title: "Organik Kimya - Hidrokarbonlar",
      content:
        "Alkanlar, alkenler, alkinler. Adlandırma kuralları, izomerlik, fonksiyonel gruplar...",
      subject: "Kimya",
      color: "var(--accent-danger)",
      date: "4 gün önce",
    },
  ];

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <IconSearch
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            placeholder="Notlarında ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{
              paddingLeft: 34,
              height: 36,
              fontSize: 13,
              color: "var(--text-primary)",
            }}
          />
        </div>
        <button
          className="flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-medium text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <IconPlus size={14} />
          Yeni Not
        </button>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((note) => (
          <div
            key={note.id}
            className="rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01]"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              borderLeft: `3px solid ${note.color}`,
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: `${note.color}15`, color: note.color }}
                >
                  {note.subject}
                </span>
                {note.pinned && (
                  <IconStar
                    size={12}
                    className="fill-current"
                    style={{ color: "var(--accent-warning)" }}
                  />
                )}
              </div>
              <span
                className="text-[10px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                {note.date}
              </span>
            </div>
            <h4
              className="text-sm font-semibold mb-1.5"
              style={{ color: "var(--text-primary)" }}
            >
              {note.title}
            </h4>
            <p
              className="text-xs leading-relaxed line-clamp-3"
              style={{ color: "var(--text-secondary)" }}
            >
              {note.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== MIND MAP SECTION ===== */
function MindMapSection() {
  const maps = [
    {
      id: 1,
      title: "Kuantum Fiziği",
      nodes: 12,
      subject: "Fizik",
      color: "var(--accent-primary)",
      date: "Bugün",
    },
    {
      id: 2,
      title: "Türev & İntegral",
      nodes: 8,
      subject: "Matematik",
      color: "var(--accent-secondary)",
      date: "Dün",
    },
    {
      id: 3,
      title: "Hücre Yapısı",
      nodes: 15,
      subject: "Biyoloji",
      color: "var(--accent-success)",
      date: "3 gün önce",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {maps.length} mind map oluşturdun
        </p>
        <button
          className="flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-medium text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          <IconPlus size={14} />
          Yeni Mind Map
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {maps.map((map) => (
          <div
            key={map.id}
            className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.01]"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
            }}
          >
            {/* Mini SVG Preview */}
            <div
              className="relative"
              style={{ height: 140, background: "var(--bg-tertiary)" }}
            >
              <svg width="100%" height="100%" viewBox="0 0 300 140">
                <line
                  x1="150"
                  y1="70"
                  x2="60"
                  y2="30"
                  stroke={map.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                />
                <line
                  x1="150"
                  y1="70"
                  x2="240"
                  y2="30"
                  stroke={map.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                />
                <line
                  x1="150"
                  y1="70"
                  x2="60"
                  y2="110"
                  stroke={map.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                />
                <line
                  x1="150"
                  y1="70"
                  x2="240"
                  y2="110"
                  stroke={map.color}
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                />
                <circle
                  cx="150"
                  cy="70"
                  r="18"
                  fill={map.color}
                  fillOpacity="0.15"
                  stroke={map.color}
                  strokeWidth="1.5"
                />
                <text
                  x="150"
                  y="74"
                  textAnchor="middle"
                  fontSize="8"
                  fill="var(--text-primary)"
                  fontWeight="600"
                >
                  {map.title.split(" ")[0]}
                </text>
                {[
                  { x: 60, y: 30 },
                  { x: 240, y: 30 },
                  { x: 60, y: 110 },
                  { x: 240, y: 110 },
                ].map((pos, i) => (
                  <circle
                    key={i}
                    cx={pos.x}
                    cy={pos.y}
                    r="12"
                    fill={map.color}
                    fillOpacity="0.08"
                    stroke={map.color}
                    strokeWidth="1"
                  />
                ))}
              </svg>
            </div>

            <div className="p-3.5">
              <div className="flex items-center justify-between mb-1">
                <h4
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {map.title}
                </h4>
                <span
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    background: `${map.color}15`,
                    color: map.color,
                  }}
                >
                  {map.subject}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="text-[11px] flex items-center gap-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <IconMindMap size={11} />
                  {map.nodes} düğüm
                </span>
                <span
                  className="text-[11px] flex items-center gap-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <IconClock size={11} />
                  {map.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== FLASHCARD SECTION ===== */
function FlashcardSection() {
  const [activeSet, setActiveSet] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const sets = [
    {
      title: "Fizik - Kuantum",
      count: 15,
      mastered: 8,
      color: "var(--accent-primary)",
      cards: [
        {
          q: "Heisenberg Belirsizlik İlkesi nedir?",
          a: "Bir parçacığın konumu ve momentumu aynı anda kesin olarak belirlenemez. Δx·Δp ≥ ℏ/2",
        },
        {
          q: "Dalga fonksiyonu (ψ) ne anlama gelir?",
          a: "Kuantum sisteminin durumunu tanımlar. |ψ|² olasılık yoğunluğunu verir.",
        },
        {
          q: "Foton enerjisi formülü nedir?",
          a: "E = hf (h: Planck sabiti, f: frekans) veya E = hc/λ",
        },
      ],
    },
    {
      title: "Matematik - İntegral",
      count: 12,
      mastered: 5,
      color: "var(--accent-secondary)",
      cards: [
        { q: "∫ sin(x) dx = ?", a: "-cos(x) + C" },
        { q: "∫ eˣ dx = ?", a: "eˣ + C" },
        { q: "∫ 1/x dx = ?", a: "ln|x| + C" },
      ],
    },
    {
      title: "Biyoloji - Hücre",
      count: 10,
      mastered: 7,
      color: "var(--accent-success)",
      cards: [
        {
          q: "Mitokondri ne iş yapar?",
          a: "Hücrenin enerji santrali. Oksijenli solunum ile ATP üretir.",
        },
        {
          q: "DNA ve RNA farkı?",
          a: "DNA: çift zincir, deoksiriboz, timin. RNA: tek zincir, riboz, urasil.",
        },
        {
          q: "Hücre zarı modeli?",
          a: "Akıcı mozaik model: fosfolipid çift tabaka + proteinler + karbonhidratlar.",
        },
      ],
    },
  ];

  const currentSet = sets[activeSet];
  const card = currentSet.cards[cardIndex];

  return (
    <div className="space-y-4">
      {/* Set Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {sets.map((set, i) => (
          <button
            key={i}
            onClick={() => {
              setActiveSet(i);
              setCardIndex(0);
              setFlipped(false);
            }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all"
            style={{
              background:
                activeSet === i ? `${set.color}15` : "var(--bg-card)",
              border: `1px solid ${activeSet === i ? set.color : "var(--border-primary)"}`,
              color:
                activeSet === i ? set.color : "var(--text-secondary)",
            }}
          >
            <IconFlashcard size={14} />
            {set.title}
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px]"
              style={{
                background:
                  activeSet === i ? `${set.color}20` : "var(--bg-tertiary)",
              }}
            >
              {set.mastered}/{set.count}
            </span>
          </button>
        ))}
        <button
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-colors"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            color: "var(--text-tertiary)",
          }}
        >
          <IconPlus size={14} />
        </button>
      </div>

      {/* Progress */}
      <div
        className="rounded-xl p-4"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-tertiary)" }}
          >
            İlerleme
          </span>
          <span
            className="text-xs font-semibold"
            style={{ color: currentSet.color }}
          >
            {Math.round((currentSet.mastered / currentSet.count) * 100)}%
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full"
          style={{ background: "var(--bg-tertiary)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(currentSet.mastered / currentSet.count) * 100}%`,
              background: currentSet.color,
            }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className="rounded-xl overflow-hidden cursor-pointer transition-all"
        onClick={() => setFlipped(!flipped)}
        style={{
          background: flipped ? `${currentSet.color}08` : "var(--bg-card)",
          border: `1px solid ${flipped ? currentSet.color : "var(--border-primary)"}`,
          minHeight: 200,
        }}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center h-full" style={{ minHeight: 200 }}>
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider mb-4"
            style={{
              background: flipped
                ? `${currentSet.color}15`
                : "var(--bg-tertiary)",
              color: flipped ? currentSet.color : "var(--text-tertiary)",
            }}
          >
            {flipped ? "Cevap" : "Soru"}
          </span>
          <p
            className="text-base font-medium leading-relaxed max-w-md"
            style={{ color: "var(--text-primary)" }}
          >
            {flipped ? card.a : card.q}
          </p>
          {!flipped && (
            <span
              className="text-[11px] mt-4"
              style={{ color: "var(--text-tertiary)" }}
            >
              Cevabı görmek için tıkla
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setFlipped(false);
            setCardIndex(
              (cardIndex - 1 + currentSet.cards.length) %
                currentSet.cards.length
            );
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            color: "var(--text-tertiary)",
          }}
        >
          <IconChevronLeft size={16} />
        </button>
        <span
          className="text-sm font-medium"
          style={{ color: "var(--text-tertiary)" }}
        >
          {cardIndex + 1} / {currentSet.cards.length}
        </span>
        <button
          onClick={() => {
            setFlipped(false);
            setCardIndex((cardIndex + 1) % currentSet.cards.length);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            color: "var(--text-tertiary)",
          }}
        >
          <IconChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* ===== TEKRAR ET PAGE ===== */
export default function TekrarEt() {
  const [subTab, setSubTab] = useState<SubTab>("notlar");

  const subTabs: { id: SubTab; label: string; icon: typeof IconFileText }[] = [
    { id: "notlar", label: "Notlarım", icon: IconFileText },
    { id: "mindmap", label: "Mind Map", icon: IconMindMap },
    { id: "flashcard", label: "Flashcard", icon: IconFlashcard },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-5xl mx-auto animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-xl font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Tekrar Et
            </h1>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Notlarını, mind map&apos;lerini ve flashcard&apos;larını yönet
            </p>
          </div>
        </div>

        {/* Sub Tabs */}
        <div
          className="flex items-center gap-1 rounded-xl p-1 mb-6"
          style={{ background: "var(--bg-tertiary)", width: "fit-content" }}
        >
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all"
                style={{
                  background: isActive ? "var(--bg-card)" : "transparent",
                  color: isActive
                    ? "var(--accent-primary)"
                    : "var(--text-tertiary)",
                  boxShadow: isActive ? "var(--shadow-sm)" : "none",
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {subTab === "notlar" && <NotesSection />}
        {subTab === "mindmap" && <MindMapSection />}
        {subTab === "flashcard" && <FlashcardSection />}
      </div>
    </div>
  );
}
