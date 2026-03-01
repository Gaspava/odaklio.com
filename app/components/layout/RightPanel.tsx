"use client";

import { useState } from "react";
import {
  IconStar,
  IconLightning,
  IconBookmark,
  IconChevronRight,
  IconChevronLeft,
  IconHelp,
  IconSend,
  IconMentor,
} from "../icons/Icons";

/* ===== MENTOR TIPS ===== */
function MentorTips() {
  const [mentorInput, setMentorInput] = useState("");

  const tips = [
    {
      type: "tip" as const,
      content: "Pomodoro ile çalışman odaklanmanı %40 artırabilir.",
    },
    {
      type: "question" as const,
      content: "Son okuduğun konunun 3 ana fikrini söyleyebilir misin?",
    },
    {
      type: "encouragement" as const,
      content: "7 günlük streak'ini koruyorsun, harika!",
    },
  ];

  const typeStyles = {
    tip: { bg: "var(--accent-primary-light)", color: "var(--accent-primary)", label: "İpucu", icon: <IconLightning size={10} /> },
    question: { bg: "var(--accent-secondary-light)", color: "var(--accent-secondary)", label: "Soru", icon: <IconHelp size={10} /> },
    encouragement: { bg: "var(--accent-success-light)", color: "var(--accent-success)", label: "Motivasyon", icon: <IconStar size={10} /> },
  };

  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex h-5 w-5 items-center justify-center rounded-md"
          style={{ background: "var(--accent-success-light)", color: "var(--accent-success)" }}
        >
          <IconMentor size={11} />
        </div>
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Mentor
        </h3>
      </div>

      <div className="space-y-2">
        {tips.map((tip, i) => {
          const s = typeStyles[tip.type];
          return (
            <div
              key={i}
              className="rounded-lg p-2.5"
              style={{ background: "var(--bg-tertiary)" }}
            >
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-medium mb-1.5"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
                {s.label}
              </span>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {tip.content}
              </p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        <input
          type="text"
          value={mentorInput}
          onChange={(e) => setMentorInput(e.target.value)}
          placeholder="Mentora sor..."
          className="input"
          style={{ height: 30, fontSize: 11, padding: "0 10px" }}
        />
        <button
          className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg text-white"
          style={{ background: "var(--accent-success)" }}
        >
          <IconSend size={11} />
        </button>
      </div>
    </div>
  );
}

/* ===== FLASHCARD MINI ===== */
function FlashcardMini() {
  const [flipped, setFlipped] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);

  const cards = [
    { q: "Newton'un birinci yasası nedir?", a: "Eylemsizlik yasası: Net kuvvet yoksa cisim halini korur." },
    { q: "∫ x² dx = ?", a: "x³/3 + C" },
    { q: "Mitoz vs Mayoz farkı?", a: "Mitoz: 2 diploid hücre. Mayoz: 4 haploid hücre." },
  ];

  const card = cards[cardIndex];

  return (
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
        Flashcard
      </h3>

      <div
        className="cursor-pointer rounded-lg p-4 text-center transition-all"
        onClick={() => setFlipped(!flipped)}
        style={{
          background: flipped ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
          border: flipped ? "1px solid var(--accent-primary)" : "1px solid var(--border-secondary)",
          minHeight: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="text-[9px] font-medium uppercase tracking-wider mb-1"
          style={{ color: flipped ? "var(--accent-primary)" : "var(--text-tertiary)" }}
        >
          {flipped ? "Cevap" : "Soru"}
        </span>
        <p
          className="text-xs font-medium leading-relaxed"
          style={{ color: "var(--text-primary)" }}
        >
          {flipped ? card.a : card.q}
        </p>
        {!flipped && (
          <span className="text-[9px] mt-2" style={{ color: "var(--text-tertiary)" }}>
            Cevap için tıkla
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => {
            setFlipped(false);
            setCardIndex((cardIndex - 1 + cards.length) % cards.length);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronLeft size={12} />
        </button>
        <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          {cardIndex + 1} / {cards.length}
        </span>
        <button
          onClick={() => {
            setFlipped(false);
            setCardIndex((cardIndex + 1) % cards.length);
          }}
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

/* ===== RECOMMENDATIONS COMPACT ===== */
function RecommendationsCompact() {
  const items = [
    { title: "Dalga-Parçacık İkiliği", tag: "Önerilen", icon: <IconLightning size={10} />, color: "var(--accent-primary)" },
    { title: "İntegral Pratik Soruları", tag: "Soru Bankası", icon: <IconStar size={10} />, color: "var(--accent-warning)" },
    { title: "Hücre Bölünmesi Video", tag: "Kaynak", icon: <IconBookmark size={10} />, color: "var(--accent-secondary)" },
  ];

  return (
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
        Sana Özel
      </h3>

      <div className="space-y-1.5">
        {items.map((item, i) => (
          <button
            key={i}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <span
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md"
              style={{ background: `${item.color}15`, color: item.color }}
            >
              {item.icon}
            </span>
            <div className="flex-1 text-left">
              <span className="text-[11px] font-medium block" style={{ color: "var(--text-primary)" }}>
                {item.title}
              </span>
              <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>
                {item.tag}
              </span>
            </div>
            <IconChevronRight size={12} className="flex-shrink-0 text-[var(--text-tertiary)]" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== MIND MAP MINI PREVIEW ===== */
function MindMapPreview() {
  return (
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
        Mind Map
      </h3>

      <div
        className="rounded-lg overflow-hidden"
        style={{
          height: 120,
          background: "var(--bg-tertiary)",
          position: "relative",
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 240 120">
          {/* Lines */}
          <line x1="120" y1="60" x2="50" y2="25" stroke="var(--accent-primary)" strokeWidth="1.5" strokeOpacity="0.3" />
          <line x1="120" y1="60" x2="190" y2="25" stroke="var(--accent-success)" strokeWidth="1.5" strokeOpacity="0.3" />
          <line x1="120" y1="60" x2="50" y2="95" stroke="var(--accent-warning)" strokeWidth="1.5" strokeOpacity="0.3" />
          <line x1="120" y1="60" x2="190" y2="95" stroke="var(--accent-danger)" strokeWidth="1.5" strokeOpacity="0.3" />

          {/* Center */}
          <circle cx="120" cy="60" r="16" fill="var(--accent-primary)" fillOpacity="0.2" stroke="var(--accent-primary)" strokeWidth="1.5" />
          <text x="120" y="63" textAnchor="middle" fontSize="7" fill="var(--text-primary)" fontWeight="600">Ana Konu</text>

          {/* Branches */}
          <circle cx="50" cy="25" r="12" fill="var(--accent-primary)" fillOpacity="0.1" stroke="var(--accent-primary)" strokeWidth="1" />
          <text x="50" y="28" textAnchor="middle" fontSize="6" fill="var(--text-secondary)">Dal 1</text>

          <circle cx="190" cy="25" r="12" fill="var(--accent-success)" fillOpacity="0.1" stroke="var(--accent-success)" strokeWidth="1" />
          <text x="190" y="28" textAnchor="middle" fontSize="6" fill="var(--text-secondary)">Dal 2</text>

          <circle cx="50" cy="95" r="12" fill="var(--accent-warning)" fillOpacity="0.1" stroke="var(--accent-warning)" strokeWidth="1" />
          <text x="50" y="98" textAnchor="middle" fontSize="6" fill="var(--text-secondary)">Dal 3</text>

          <circle cx="190" cy="95" r="12" fill="var(--accent-danger)" fillOpacity="0.1" stroke="var(--accent-danger)" strokeWidth="1" />
          <text x="190" y="98" textAnchor="middle" fontSize="6" fill="var(--text-secondary)">Dal 4</text>
        </svg>
      </div>

      <button
        className="mt-2 w-full rounded-lg py-1.5 text-[11px] font-medium text-center transition-colors"
        style={{
          background: "var(--accent-primary-light)",
          color: "var(--accent-primary)",
        }}
      >
        Mind Map Aç
      </button>
    </div>
  );
}

/* ===== RIGHT PANEL ===== */
export default function RightPanel() {
  return (
    <div className="h-full overflow-y-auto p-3 space-y-3">
      <MentorTips />
      <FlashcardMini />
      <RecommendationsCompact />
      <MindMapPreview />
    </div>
  );
}
