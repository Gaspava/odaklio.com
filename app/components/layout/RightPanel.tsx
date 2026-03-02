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
  IconPlus,
} from "../icons/Icons";
import type { ChatStyle } from "../chatbot/ChatStyleSelector";

interface RightPanelProps {
  onClose?: () => void;
  onNewChat?: () => void;
  chatStyle?: ChatStyle;
}

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
    tip: {
      bg: "var(--accent-primary-light)",
      color: "var(--accent-primary)",
      borderColor: "var(--accent-primary)",
      label: "İpucu",
      icon: <IconLightning size={10} />,
    },
    question: {
      bg: "var(--accent-secondary-light)",
      color: "var(--accent-secondary)",
      borderColor: "var(--accent-secondary)",
      label: "Soru",
      icon: <IconHelp size={10} />,
    },
    encouragement: {
      bg: "var(--accent-success-light)",
      color: "var(--accent-success)",
      borderColor: "var(--accent-success)",
      label: "Motivasyon",
      icon: <IconStar size={10} />,
    },
  };

  return (
    <div
      className="rounded-2xl p-5 transition-all group relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      {/* Subtle hover gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(16, 185, 129, 0.03) 0%, rgba(34, 197, 94, 0.02) 100%)",
        }}
      />

      <div className="flex items-center gap-2.5 mb-4 relative z-10">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)",
            color: "var(--accent-success)",
          }}
        >
          <IconMentor size={14} />
        </div>
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Mentor
        </h3>
      </div>

      <div className="space-y-2.5 relative z-10">
        {tips.map((tip, i) => {
          const s = typeStyles[tip.type];
          return (
            <div
              key={i}
              className="rounded-xl p-3 transition-all hover:scale-[1.01]"
              style={{
                background: "var(--bg-tertiary)",
                borderLeft: `3px solid ${s.borderColor}`,
              }}
            >
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold mb-1.5"
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

      <div className="flex items-center gap-1.5 mt-4 relative z-10">
        <input
          type="text"
          value={mentorInput}
          onChange={(e) => setMentorInput(e.target.value)}
          placeholder="Mentora sor..."
          className="input"
          style={{
            height: 36,
            fontSize: 12,
            padding: "0 12px",
            borderRadius: "var(--radius-lg)",
          }}
        />
        <button
          className="flex h-9 w-9 sm:h-[30px] sm:w-[30px] flex-shrink-0 items-center justify-center rounded-xl text-white transition-all active:scale-95 hover:shadow-lg"
          style={{
            background: "var(--gradient-primary)",
            boxShadow: "var(--shadow-glow-sm)",
          }}
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
      className="rounded-2xl p-5 transition-all group relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      {/* Subtle hover gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(245, 158, 11, 0.03) 0%, rgba(251, 191, 36, 0.02) 100%)",
        }}
      />

      <div className="flex items-center gap-2.5 mb-4 relative z-10">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)",
            color: "var(--accent-warning)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M12 8v8" />
            <path d="M8 12h8" />
          </svg>
        </div>
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Flashcard
        </h3>
      </div>

      <div
        className="cursor-pointer rounded-xl p-4 text-center transition-all active:scale-[0.98] relative overflow-hidden"
        onClick={() => setFlipped(!flipped)}
        style={{
          background: flipped ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
          border: flipped ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid var(--border-secondary)",
          minHeight: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: flipped ? "var(--shadow-glow-sm)" : "none",
        }}
      >
        {/* Premium subtle gradient overlay on card */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background: flipped
              ? "linear-gradient(180deg, rgba(16, 185, 129, 0.06) 0%, transparent 60%)"
              : "linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 60%)",
          }}
        />
        <span
          className="text-[9px] font-bold uppercase tracking-wider mb-1 relative z-10"
          style={{ color: flipped ? "var(--accent-primary)" : "var(--text-tertiary)" }}
        >
          {flipped ? "Cevap" : "Soru"}
        </span>
        <p
          className="text-xs font-medium leading-relaxed relative z-10"
          style={{ color: "var(--text-primary)" }}
        >
          {flipped ? card.a : card.q}
        </p>
        {!flipped && (
          <span className="text-[9px] mt-2 relative z-10" style={{ color: "var(--text-tertiary)" }}>
            Cevap için tıkla
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 relative z-10">
        <button
          onClick={() => {
            setFlipped(false);
            setCardIndex((cardIndex - 1 + cards.length) % cards.length);
          }}
          className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-xl transition-all active:scale-95 hover:bg-[var(--bg-hover)]"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronLeft size={12} />
        </button>
        <span className="text-[10px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
          {cardIndex + 1} / {cards.length}
        </span>
        <button
          onClick={() => {
            setFlipped(false);
            setCardIndex((cardIndex + 1) % cards.length);
          }}
          className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-xl transition-all active:scale-95 hover:bg-[var(--bg-hover)]"
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
      className="rounded-2xl p-5 transition-all group relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      {/* Subtle hover gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.02) 100%)",
        }}
      />

      <div className="flex items-center gap-2.5 mb-4 relative z-10">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%)",
            color: "var(--accent-secondary)",
          }}
        >
          <IconStar size={14} />
        </div>
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Sana Özel
        </h3>
      </div>

      <div className="space-y-1.5 relative z-10">
        {items.map((item, i) => (
          <button
            key={i}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 sm:py-2 transition-all duration-200 active:scale-[0.98] hover:bg-[var(--bg-tertiary)] hover:translate-x-0.5"
            style={{ color: "var(--text-secondary)" }}
          >
            <span
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${item.color}12`, color: item.color }}
            >
              {item.icon}
            </span>
            <div className="flex-1 text-left">
              <span className="text-[11px] font-semibold block" style={{ color: "var(--text-primary)" }}>
                {item.title}
              </span>
              <span className="text-[9px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                {item.tag}
              </span>
            </div>
            <IconChevronRight size={12} className="flex-shrink-0 text-[var(--text-tertiary)] transition-transform duration-200 group-hover:translate-x-0.5" />
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
      className="rounded-2xl p-5 transition-all group relative overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      {/* Subtle hover gradient overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(168, 85, 247, 0.02) 100%)",
        }}
      />

      <div className="flex items-center gap-2.5 mb-4 relative z-10">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)",
            color: "var(--accent-purple)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <circle cx="4" cy="6" r="2" />
            <circle cx="20" cy="18" r="2" />
            <path d="M9.5 10.5L5.5 7.5" />
            <path d="M14.5 13.5L18.5 16.5" />
          </svg>
        </div>
        <h3
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Mind Map
        </h3>
      </div>

      <div
        className="rounded-xl overflow-hidden relative z-10"
        style={{
          height: 120,
          position: "relative",
        }}
      >
        {/* Subtle gradient background for SVG area */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{
            background: "linear-gradient(145deg, var(--bg-tertiary) 0%, rgba(139, 92, 246, 0.04) 50%, var(--bg-tertiary) 100%)",
          }}
        />
        <svg width="100%" height="100%" viewBox="0 0 240 120" style={{ position: "relative", zIndex: 1 }}>
          <line x1="120" y1="60" x2="50" y2="25" stroke="var(--accent-primary)" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="120" y1="60" x2="190" y2="25" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="120" y1="60" x2="50" y2="95" stroke="var(--accent-warning)" strokeWidth="1.5" strokeOpacity="0.4" />
          <line x1="120" y1="60" x2="190" y2="95" stroke="var(--accent-danger)" strokeWidth="1.5" strokeOpacity="0.4" />

          <circle cx="120" cy="60" r="16" fill="var(--accent-primary)" fillOpacity="0.15" stroke="var(--accent-primary)" strokeWidth="1.5" />
          <text x="120" y="63" textAnchor="middle" fontSize="7" fill="var(--text-primary)" fontWeight="600">Ana Konu</text>

          <circle cx="50" cy="25" r="12" fill="var(--accent-primary)" fillOpacity="0.1" stroke="var(--accent-primary)" strokeWidth="1" />
          <text x="50" y="28" textAnchor="middle" fontSize="6" fill="var(--text-secondary)">Dal 1</text>

          <circle cx="190" cy="25" r="12" fill="var(--accent-secondary)" fillOpacity="0.1" stroke="var(--accent-secondary)" strokeWidth="1" />
          <text x="190" y="28" textAnchor="middle" fontSize="6" fill="var(--text-secondary)">Dal 2</text>

          <circle cx="50" cy="95" r="12" fill="var(--accent-warning)" fillOpacity="0.1" stroke="var(--accent-warning)" strokeWidth="1" />
          <text x="50" y="98" textAnchor="middle" fontSize="6" fill="var(--text-secondary)">Dal 3</text>

          <circle cx="190" cy="95" r="12" fill="var(--accent-danger)" fillOpacity="0.1" stroke="var(--accent-danger)" strokeWidth="1" />
          <text x="190" y="98" textAnchor="middle" fontSize="6" fill="var(--text-secondary)">Dal 4</text>
        </svg>
      </div>

      <button
        className="btn-primary mt-3 w-full rounded-xl py-2.5 sm:py-2 text-[11px] font-semibold text-center transition-all active:scale-[0.98] relative z-10"
        style={{
          padding: "10px 20px",
        }}
      >
        Mind Map Aç
      </button>
    </div>
  );
}

/* ===== RIGHT PANEL ===== */
export default function RightPanel({ onClose, onNewChat, chatStyle }: RightPanelProps) {
  return (
    <div className="h-full overflow-y-auto p-3 space-y-3 stagger-children relative">
      {/* Top accent bar - thin gradient line matching LeftPanel */}
      <div
        className="absolute top-0 left-3 right-3 h-[2px] rounded-full"
        style={{
          background: "var(--gradient-hero)",
          opacity: 0.6,
        }}
      />

      <div className="pb-0.5 pt-2">
        <h2 className="text-sm font-bold gradient-text-hero" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", background: "var(--gradient-hero)" }}>
          Mentor & Araçlar
        </h2>
      </div>

      {/* Yeni Sohbet Button - moved from header */}
      {onNewChat && (
        <button
          onClick={onNewChat}
          className="flex w-full h-10 items-center justify-center gap-2 rounded-2xl transition-all active:scale-95 hover:shadow-lg"
          style={{
            background: chatStyle === "mindmap" ? "var(--gradient-purple, linear-gradient(135deg, #8B5CF6, #A855F7))" : "var(--gradient-primary)",
            color: "white",
            boxShadow: "var(--shadow-glow-sm)",
          }}
        >
          <IconPlus size={14} />
          <span className="text-[11px] font-bold tracking-wide">Yeni Sohbet</span>
        </button>
      )}

      <MentorTips />
      <FlashcardMini />
      <RecommendationsCompact />
      <MindMapPreview />
    </div>
  );
}
