"use client";

import { useState } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
  IconStar,
  IconHelp,
} from "../icons/Icons";

interface Card {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  mastered: boolean;
}

const sampleCards: Card[] = [
  {
    id: "1",
    front: "Newton'un birinci yasası nedir?",
    back: "Eylemsizlik yasası: Bir cisim üzerine net kuvvet etki etmediği sürece, durma halindeyse durur, hareket halindeyse sabit hızla düzgün doğrusal hareket eder.",
    category: "Fizik",
    difficulty: "easy",
    mastered: false,
  },
  {
    id: "2",
    front: "∫ x² dx = ?",
    back: "x³/3 + C\n\nGenel kural: ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C, n ≠ -1",
    category: "Matematik",
    difficulty: "medium",
    mastered: false,
  },
  {
    id: "3",
    front: "Mitoz ve Mayoz bölünme arasındaki temel fark nedir?",
    back: "Mitoz: 1 bölünme → 2 diploid hücre (2n)\nMayoz: 2 bölünme → 4 haploid hücre (n)\n\nMitoz büyüme ve onarım, mayoz üreme hücreleri için gerçekleşir.",
    category: "Biyoloji",
    difficulty: "hard",
    mastered: false,
  },
  {
    id: "4",
    front: "E = mc² formülündeki değişkenler ne anlama gelir?",
    back: "E = Enerji (Joule)\nm = Kütle (kg)\nc = Işık hızı (3 × 10⁸ m/s)\n\nKüçük bir kütle bile devasa enerji üretebilir.",
    category: "Fizik",
    difficulty: "medium",
    mastered: false,
  },
];

export default function FlashCardDeck() {
  const [cards, setCards] = useState<Card[]>(sampleCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDidntUnderstand, setShowDidntUnderstand] = useState(false);

  const currentCard = cards[currentIndex];
  const progress = Math.round(
    (cards.filter((c) => c.mastered).length / cards.length) * 100
  );

  const next = () => {
    setIsFlipped(false);
    setShowDidntUnderstand(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prev = () => {
    setIsFlipped(false);
    setShowDidntUnderstand(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const toggleMastered = () => {
    setCards((prev) =>
      prev.map((c, i) =>
        i === currentIndex ? { ...c, mastered: !c.mastered } : c
      )
    );
  };

  const getDifficultyStyle = (diff: Card["difficulty"]) => {
    switch (diff) {
      case "easy":
        return { bg: "var(--accent-success-light)", color: "var(--accent-success)" };
      case "medium":
        return { bg: "var(--accent-warning-light)", color: "var(--accent-warning)" };
      case "hard":
        return { bg: "var(--accent-danger-light)", color: "var(--accent-danger)" };
    }
  };

  const diffStyle = getDifficultyStyle(currentCard.difficulty);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {currentIndex + 1} / {cards.length}
          </span>
          <span
            className="badge"
            style={{ background: diffStyle.bg, color: diffStyle.color }}
          >
            {currentCard.difficulty === "easy"
              ? "Kolay"
              : currentCard.difficulty === "medium"
                ? "Orta"
                : "Zor"}
          </span>
          <span className="badge badge-primary">{currentCard.category}</span>
        </div>
        <span
          className="text-xs font-medium"
          style={{ color: "var(--accent-success)" }}
        >
          {progress}% tamamlandı
        </span>
      </div>

      {/* Progress Bar */}
      <div
        className="h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--bg-tertiary)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: "var(--gradient-success)",
          }}
        />
      </div>

      {/* Card */}
      <div
        className="relative cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ minHeight: 280 }}
      >
        <div
          className="card-static w-full flex flex-col items-center justify-center p-8 transition-all duration-500"
          style={{
            minHeight: 280,
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              transform: isFlipped ? "rotateY(180deg)" : "none",
            }}
          >
            {!isFlipped ? (
              <div className="text-center">
                <span
                  className="mb-4 inline-block text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Soru
                </span>
                <p
                  className="text-xl font-semibold leading-relaxed"
                  style={{ color: "var(--text-primary)" }}
                >
                  {currentCard.front}
                </p>
                <p
                  className="mt-4 text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Cevabı görmek için tıkla
                </p>
              </div>
            ) : (
              <div
                className="text-center"
                onMouseEnter={() => setShowDidntUnderstand(true)}
                onMouseLeave={() => setShowDidntUnderstand(false)}
              >
                <span
                  className="mb-4 inline-block text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--accent-success)" }}
                >
                  Cevap
                </span>
                <p
                  className="text-lg leading-relaxed whitespace-pre-line"
                  style={{ color: "var(--text-primary)" }}
                >
                  {currentCard.back}
                </p>

                {/* "Anlamadım" Button */}
                {showDidntUnderstand && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium animate-fade-in"
                    style={{
                      background: "var(--accent-warning-light)",
                      color: "var(--accent-warning)",
                    }}
                  >
                    <IconHelp size={14} />
                    Anlamadım, daha basit açıkla
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          <IconChevronLeft size={20} />
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleMastered}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
            style={{
              background: currentCard.mastered
                ? "var(--accent-success)"
                : "var(--accent-success-light)",
              color: currentCard.mastered
                ? "white"
                : "var(--accent-success)",
            }}
          >
            <IconStar size={16} />
            {currentCard.mastered ? "Öğrenildi" : "Öğrendim"}
          </button>
          <button
            onClick={() => {
              setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
            }}
          >
            <IconRefresh size={16} />
            Karıştır
          </button>
        </div>

        <button
          onClick={next}
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          <IconChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
