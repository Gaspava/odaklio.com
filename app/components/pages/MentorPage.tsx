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
  IconTrendingUp,
  IconBrain,
} from "../icons/Icons";

/* ===== MENTOR CHAT ===== */
function MentorChat() {
  const [mentorInput, setMentorInput] = useState("");

  const messages = [
    { role: "mentor" as const, text: "Merhaba! Ben senin kişisel öğrenme mentorunum. Sana çalışma stratejileri, motivasyon ve öğrenme teknikleri konusunda yardımcı olabilirim." },
    { role: "user" as const, text: "Sınavlara nasıl daha iyi hazırlanabilirim?" },
    { role: "mentor" as const, text: "Harika bir soru! İşte etkili sınav hazırlığı için 3 altın kural:\n\n1. **Aralıklı Tekrar**: Konuları 1, 3 ve 7 gün arayla tekrar et.\n2. **Aktif Hatırlama**: Sadece okumak yerine kendini test et.\n3. **Pomodoro**: 25 dk çalış, 5 dk mola ver." },
  ];

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-center gap-2 p-4 pb-3" style={{ borderBottom: "1px solid var(--border-secondary)" }}>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
        >
          <IconMentor size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            AI Mentor
          </h3>
          <span className="text-[10px] flex items-center gap-1" style={{ color: "var(--accent-success)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-success)" }} />
            Aktif
          </span>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed"
              style={
                msg.role === "user"
                  ? { background: "var(--gradient-primary)", color: "white", borderRadius: "16px 16px 4px 16px" }
                  : { background: "var(--bg-tertiary)", color: "var(--text-primary)", borderRadius: "4px 16px 16px 16px", border: "1px solid var(--border-primary)" }
              }
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 p-3" style={{ borderTop: "1px solid var(--border-secondary)" }}>
        <input
          type="text"
          value={mentorInput}
          onChange={(e) => setMentorInput(e.target.value)}
          placeholder="Mentora bir soru sor..."
          className="input"
          style={{ height: 38, fontSize: 12, padding: "0 12px" }}
        />
        <button
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all active:scale-95"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
        >
          <IconSend size={13} />
        </button>
      </div>
    </div>
  );
}

/* ===== LEARNING TIPS ===== */
function LearningTips() {
  const tips = [
    {
      type: "tip" as const,
      title: "Feynman Tekniği",
      content: "Bir konuyu öğrenmek için onu basit kelimelerle birine anlatmayı dene. Anlatamadığın yerler, öğrenmen gereken yerlerdir.",
      icon: <IconLightning size={12} />,
      color: "var(--accent-primary)",
    },
    {
      type: "question" as const,
      title: "Kendini Test Et",
      content: "Son çalıştığın konunun 3 ana fikrini kendi cümlelerinle yazabilir misin?",
      icon: <IconHelp size={12} />,
      color: "var(--accent-secondary)",
    },
    {
      type: "encouragement" as const,
      title: "Motivasyon",
      content: "7 günlük çalışma streak'ini koruyorsun! Bu süreklilik beyinde kalıcı nöral bağlantılar oluşturur.",
      icon: <IconStar size={12} />,
      color: "var(--accent-warning)",
    },
    {
      type: "tip" as const,
      title: "Aktif Hatırlama",
      content: "Okuduğun notları kapatıp hatırlamaya çalışmak, tekrar okumaktan 50% daha etkilidir.",
      icon: <IconBrain size={12} />,
      color: "var(--accent-purple)",
    },
  ];

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: "var(--accent-success-light)", color: "var(--accent-success)" }}
        >
          <IconLightning size={14} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Öğrenme İpuçları
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {tips.map((tip, i) => (
          <div
            key={i}
            className="rounded-xl p-3.5 transition-all hover:scale-[1.01]"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold mb-2"
              style={{ background: `${tip.color}15`, color: tip.color }}
            >
              {tip.icon}
              {tip.title}
            </span>
            <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {tip.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== FLASHCARDS FULL ===== */
function FlashcardsFull() {
  const [flipped, setFlipped] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);

  const cards = [
    { q: "Newton'un birinci yasası nedir?", a: "Eylemsizlik yasası: Net kuvvet yoksa cisim halini korur.", category: "Fizik" },
    { q: "∫ x² dx = ?", a: "x³/3 + C", category: "Matematik" },
    { q: "Mitoz vs Mayoz farkı?", a: "Mitoz: 2 diploid hücre. Mayoz: 4 haploid hücre.", category: "Biyoloji" },
    { q: "DNA'nın yapı taşı nedir?", a: "Nükleotidler (şeker + fosfat + baz)", category: "Biyoloji" },
    { q: "E = mc² ne anlama gelir?", a: "Enerji = kütle × ışık hızının karesi. Kütle-enerji eşdeğerliği.", category: "Fizik" },
  ];

  const card = cards[cardIndex];

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg"
            style={{ background: "var(--accent-warning-light)", color: "var(--accent-warning)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
          </div>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            Flashcard&apos;lar
          </h3>
        </div>
        <span className="text-[11px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
          {cardIndex + 1} / {cards.length}
        </span>
      </div>

      <div
        className="cursor-pointer rounded-2xl p-6 text-center transition-all active:scale-[0.98]"
        onClick={() => setFlipped(!flipped)}
        style={{
          background: flipped ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
          border: flipped ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid var(--border-secondary)",
          minHeight: 140,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: flipped ? "var(--shadow-glow-sm)" : "none",
        }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
          style={{ color: flipped ? "var(--accent-primary)" : "var(--text-tertiary)" }}
        >
          {flipped ? "Cevap" : "Soru"}
          <span className="px-1.5 py-0.5 rounded text-[8px]" style={{ background: "var(--bg-card)", color: "var(--text-tertiary)" }}>
            {card.category}
          </span>
        </span>
        <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--text-primary)" }}>
          {flipped ? card.a : card.q}
        </p>
        {!flipped && (
          <span className="text-[10px] mt-3" style={{ color: "var(--text-tertiary)" }}>
            Cevap için tıkla
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => { setFlipped(false); setCardIndex((cardIndex - 1 + cards.length) % cards.length); }}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronLeft size={14} />
        </button>
        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFlipped(false); setCardIndex(i); }}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                background: i === cardIndex ? "var(--accent-primary)" : "var(--bg-tertiary)",
                boxShadow: i === cardIndex ? "var(--shadow-glow-sm)" : "none",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => { setFlipped(false); setCardIndex((cardIndex + 1) % cards.length); }}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

/* ===== RECOMMENDATIONS ===== */
function RecommendationsFull() {
  const items = [
    { title: "Dalga-Parçacık İkiliği", tag: "Önerilen", icon: <IconLightning size={12} />, color: "var(--accent-primary)", desc: "Kuantum fiziğinin temel kavramı" },
    { title: "İntegral Pratik Soruları", tag: "Soru Bankası", icon: <IconStar size={12} />, color: "var(--accent-warning)", desc: "50+ pratik soru" },
    { title: "Hücre Bölünmesi Video", tag: "Video", icon: <IconBookmark size={12} />, color: "var(--accent-secondary)", desc: "15 dk animasyonlu anlatım" },
    { title: "Osmanlı Kronolojisi", tag: "Kaynak", icon: <IconBookmark size={12} />, color: "var(--accent-purple)", desc: "İnteraktif zaman çizelgesi" },
    { title: "İngilizce Tense Quiz", tag: "Quiz", icon: <IconStar size={12} />, color: "var(--accent-cyan)", desc: "20 soruluk test" },
    { title: "Python Algoritma Soruları", tag: "Pratik", icon: <IconLightning size={12} />, color: "var(--accent-danger)", desc: "Başlangıç seviyesi" },
  ];

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-lg"
          style={{ background: "var(--accent-secondary-light)", color: "var(--accent-secondary)" }}
        >
          <IconStar size={14} />
        </div>
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Sana Özel Öneriler
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item, i) => (
          <button
            key={i}
            className="flex items-center gap-3 rounded-xl p-3 transition-all active:scale-[0.98] hover:shadow-sm text-left"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <span
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: `${item.color}12`, color: item.color }}
            >
              {item.icon}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold block truncate" style={{ color: "var(--text-primary)" }}>
                {item.title}
              </span>
              <span className="text-[9px] block" style={{ color: "var(--text-tertiary)" }}>
                {item.desc}
              </span>
              <span
                className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-semibold"
                style={{ background: `${item.color}10`, color: item.color }}
              >
                {item.tag}
              </span>
            </div>
            <IconChevronRight size={12} className="flex-shrink-0" style={{ color: "var(--text-tertiary)" }} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== MENTOR PAGE ===== */
export default function MentorPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Mentor
          </h1>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Kişisel öğrenme mentorun ve çalışma rehberin
          </p>
        </div>

        <MentorChat />
        <LearningTips />
        <FlashcardsFull />
        <RecommendationsFull />
      </div>
    </div>
  );
}
