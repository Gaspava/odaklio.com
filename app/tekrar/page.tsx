"use client";

import { useState } from "react";
import {
  IconChevronRight,
  IconChevronLeft,
  IconStar,
  IconLightning,
  IconRefresh,
} from "../components/icons/Icons";

/* ===== FLASHCARD DATA ===== */
const decks = [
  {
    id: "fizik",
    name: "Fizik",
    count: 12,
    color: "var(--accent-primary)",
    cards: [
      { q: "Newton'un birinci yasası nedir?", a: "Eylemsizlik yasası: Net kuvvet yoksa cisim halini korur." },
      { q: "Hız ile sürat arasındaki fark?", a: "Hız vektörel (yön + büyüklük), sürat skaler (sadece büyüklük) bir niceliktir." },
      { q: "Enerji korunumu yasası nedir?", a: "Enerji yoktan var edilemez, vardan yok edilemez; sadece bir formdan diğerine dönüştürülür." },
    ],
  },
  {
    id: "matematik",
    name: "Matematik",
    count: 8,
    color: "var(--accent-secondary)",
    cards: [
      { q: "∫ x² dx = ?", a: "x³/3 + C" },
      { q: "Türevin geometrik anlamı?", a: "Eğriye çizilen teğet doğrunun eğimidir." },
      { q: "Limit nedir?", a: "Bir fonksiyonun belirli bir noktaya yaklaşırken aldığı değerdir." },
    ],
  },
  {
    id: "biyoloji",
    name: "Biyoloji",
    count: 10,
    color: "var(--accent-success)",
    cards: [
      { q: "Mitoz vs Mayoz farkı?", a: "Mitoz: 2 diploid hücre. Mayoz: 4 haploid hücre." },
      { q: "DNA'nın yapısı?", a: "Çift sarmal (double helix) yapıda, nükleotidlerden oluşur. A-T, G-C bazları eşleşir." },
      { q: "Fotosentez denklemi?", a: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (ışık enerjisi ile)" },
    ],
  },
  {
    id: "tarih",
    name: "Tarih",
    count: 6,
    color: "var(--accent-warning)",
    cards: [
      { q: "İstanbul'un fethi hangi yıl?", a: "1453 - Fatih Sultan Mehmet tarafından fethedildi." },
      { q: "Cumhuriyet ne zaman ilan edildi?", a: "29 Ekim 1923" },
    ],
  },
];

export default function TekrarPage() {
  const [activeDeckId, setActiveDeckId] = useState(decks[0].id);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const activeDeck = decks.find((d) => d.id === activeDeckId)!;
  const cards = activeDeck.cards;
  const card = cards[cardIndex];

  const nextCard = () => {
    setFlipped(false);
    if (cardIndex + 1 < cards.length) {
      setCardIndex(cardIndex + 1);
    } else {
      setCardIndex(0);
    }
    setReviewedCount((prev) => prev + 1);
  };

  const prevCard = () => {
    setFlipped(false);
    setCardIndex((cardIndex - 1 + cards.length) % cards.length);
  };

  const switchDeck = (deckId: string) => {
    setActiveDeckId(deckId);
    setCardIndex(0);
    setFlipped(false);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Tekrar
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Bilgilerini pekiştir, flashcard'larını gözden geçir
          </p>
        </div>

        {/* Today's Review Stats */}
        <div className="flex gap-3 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="card-static flex-1 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconStar size={14} style={{ color: "var(--accent-warning)" }} />
              <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {reviewedCount}
              </span>
            </div>
            <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              Tekrarlanan
            </span>
          </div>
          <div className="card-static flex-1 p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <IconLightning size={14} style={{ color: "var(--accent-primary)" }} />
              <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {cards.length}
              </span>
            </div>
            <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              Bu Destede
            </span>
          </div>
        </div>

        {/* Deck Selector */}
        <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
            Deste Seç
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => switchDeck(deck.id)}
                className="flex-shrink-0 flex items-center gap-2 rounded-xl px-3.5 py-2.5 transition-all active:scale-[0.97]"
                style={{
                  background: activeDeckId === deck.id ? `${deck.color}15` : "var(--bg-card)",
                  border: `1px solid ${activeDeckId === deck.id ? deck.color : "var(--border-primary)"}`,
                  color: activeDeckId === deck.id ? deck.color : "var(--text-secondary)",
                }}
              >
                <span className="text-xs font-semibold">{deck.name}</span>
                <span
                  className="text-[10px] font-medium rounded-full px-1.5 py-0.5"
                  style={{
                    background: activeDeckId === deck.id ? `${deck.color}20` : "var(--bg-tertiary)",
                  }}
                >
                  {deck.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Flashcard */}
        <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div
            className="cursor-pointer rounded-2xl p-6 sm:p-8 text-center transition-all active:scale-[0.99] select-none"
            onClick={() => setFlipped(!flipped)}
            style={{
              background: flipped ? "var(--accent-primary-light)" : "var(--bg-card)",
              border: `1px solid ${flipped ? "var(--accent-primary)" : "var(--border-primary)"}`,
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: flipped ? "var(--shadow-glow)" : "var(--shadow-card)",
            }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: flipped ? "var(--accent-primary)" : "var(--text-tertiary)" }}
            >
              {flipped ? "Cevap" : "Soru"}
            </span>
            <p
              className="text-base sm:text-lg font-medium leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              {flipped ? card.a : card.q}
            </p>
            {!flipped && (
              <span className="text-[10px] mt-4" style={{ color: "var(--text-tertiary)" }}>
                Cevabı görmek için tıkla
              </span>
            )}
          </div>

          {/* Card Controls */}
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={prevCard}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-[0.95]"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
            >
              <IconChevronLeft size={18} />
            </button>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {cardIndex + 1} / {cards.length}
              </span>
              <button
                onClick={() => { setCardIndex(0); setFlipped(false); }}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-[0.95]"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                title="Başa dön"
              >
                <IconRefresh size={14} />
              </button>
            </div>

            <button
              onClick={nextCard}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all active:scale-[0.95]"
              style={{ background: "var(--gradient-primary)" }}
            >
              <IconChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Quick Read Section */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Hızlı Okumalar
          </h2>
          <div className="space-y-2">
            {[
              { title: "Dalga-Parçacık İkiliği", topic: "Fizik", readTime: "3 dk" },
              { title: "Türev Kuralları Özeti", topic: "Matematik", readTime: "2 dk" },
              { title: "Hücre Organelleri", topic: "Biyoloji", readTime: "4 dk" },
            ].map((item, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 rounded-xl p-3.5 transition-all active:scale-[0.99] text-left"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm"
                  style={{ background: "var(--accent-secondary-light)", color: "var(--accent-secondary)" }}
                >
                  📖
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {item.title}
                  </p>
                  <p className="text-[10px] sm:text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {item.topic} · {item.readTime} okuma
                  </p>
                </div>
                <IconChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
