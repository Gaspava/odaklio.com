"use client";
import { useState } from "react";

interface Card {
  id: string;
  front: string;
  back: string;
  difficulty: "easy" | "medium" | "hard";
  lastReview?: Date;
  nextReview?: Date;
}

const SAMPLE_CARDS: Card[] = [
  { id: "1", front: "Foton nedir?", back: "Isik parcacigi; elektromanyetik radyasyonun kuantumu.", difficulty: "medium" },
  { id: "2", front: "E = mc² ne ifade eder?", back: "Kitle-enerji esdegerligi. Enerji = kutle × isik hizi²", difficulty: "hard" },
  { id: "3", front: "Mitokondri ne ise yarar?", back: "Hucrenin enerji santrali; ATP uretir.", difficulty: "easy" },
  { id: "4", front: "DNA'nin yapisi nasil?", back: "Cift sarmal (double helix) yapisinda, nokleotidlerden olusur.", difficulty: "medium" },
];

const SUGGESTIONS = [
  { topic: "Fizik - Kuantum Mekanigi", count: 12 },
  { topic: "Biyoloji - Hucre Yapisi", count: 8 },
  { topic: "Matematik - Turev", count: 15 },
  { topic: "Kimya - Periyodik Tablo", count: 10 },
];

export default function FlashCards() {
  const [cards] = useState<Card[]>(SAMPLE_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  const current = cards[currentIndex];

  const next = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex((i) => (i + 1) % cards.length), 200);
  };

  const prev = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex((i) => (i - 1 + cards.length) % cards.length), 200);
  };

  const diffColor = {
    easy: "#00b894",
    medium: "#fdcb6e",
    hard: "#e17055",
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Flash Kartlar
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => { setShowSuggestions(!showSuggestions); setShowAdd(false); }}
            className="rounded-lg px-2 py-1 text-xs"
            style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
          >
            Oneriler
          </button>
          <button
            onClick={() => { setShowAdd(!showAdd); setShowSuggestions(false); }}
            className="rounded-lg px-2 py-1 text-xs"
            style={{ backgroundColor: "var(--accent)", color: "#fff" }}
          >
            + Ekle
          </button>
        </div>
      </div>

      {showSuggestions && (
        <div className="mb-4 flex flex-col gap-2">
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Konusmalarina gore onerilen kart setleri:
          </p>
          {SUGGESTIONS.map((s) => (
            <button
              key={s.topic}
              className="flex items-center justify-between rounded-xl p-3 text-left transition-all hover:scale-[1.02]"
              style={{ backgroundColor: "var(--bg-tertiary)" }}
            >
              <div>
                <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  {s.topic}
                </div>
                <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  {s.count} kart olusturulabilir
                </div>
              </div>
              <span className="text-xs" style={{ color: "var(--accent)" }}>Olustur →</span>
            </button>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="mb-4 flex flex-col gap-2 rounded-xl p-3" style={{ backgroundColor: "var(--bg-tertiary)" }}>
          <input
            value={newFront}
            onChange={(e) => setNewFront(e.target.value)}
            placeholder="On yuz (soru)..."
            className="rounded-lg border px-3 py-2 text-xs outline-none"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
          />
          <input
            value={newBack}
            onChange={(e) => setNewBack(e.target.value)}
            placeholder="Arka yuz (cevap)..."
            className="rounded-lg border px-3 py-2 text-xs outline-none"
            style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
          />
          <button
            className="rounded-lg py-2 text-xs font-medium text-white"
            style={{ backgroundColor: "var(--accent)" }}
          >
            Kart Ekle
          </button>
        </div>
      )}

      {/* Card */}
      <div className="mb-4 flex-1">
        <div
          className="group relative h-48 cursor-pointer"
          onClick={() => setFlipped(!flipped)}
          style={{ perspective: "1000px" }}
        >
          <div
            className="absolute inset-0 rounded-2xl transition-all duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-6"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: `2px solid ${diffColor[current.difficulty]}33`,
                backfaceVisibility: "hidden",
              }}
            >
              <span
                className="mb-2 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: `${diffColor[current.difficulty]}22`, color: diffColor[current.difficulty] }}
              >
                {current.difficulty === "easy" ? "Kolay" : current.difficulty === "medium" ? "Orta" : "Zor"}
              </span>
              <p className="text-center text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {current.front}
              </p>
              <p className="mt-3 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                Cevirmek icin tikla
              </p>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl p-6"
              style={{
                backgroundColor: "var(--bg-tertiary)",
                border: `2px solid ${diffColor[current.difficulty]}33`,
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <p className="text-center text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                {current.back}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prev}
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
        >
          ←
        </button>
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {currentIndex + 1} / {cards.length}
        </span>
        <button
          onClick={next}
          className="flex h-9 w-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
        >
          →
        </button>
      </div>

      {/* Difficulty rating */}
      <div className="flex gap-2">
        {(["easy", "medium", "hard"] as const).map((d) => (
          <button
            key={d}
            onClick={next}
            className="flex-1 rounded-xl py-2 text-xs font-medium transition-all"
            style={{ backgroundColor: `${diffColor[d]}22`, color: diffColor[d] }}
          >
            {d === "easy" ? "Bildim" : d === "medium" ? "Emin Degilim" : "Bilmedim"}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4 rounded-xl p-3" style={{ backgroundColor: "var(--bg-tertiary)" }}>
        <div className="mb-1 flex justify-between text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          <span>Ilerleme</span>
          <span>75%</span>
        </div>
        <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-color)" }}>
          <div className="h-full rounded-full" style={{ width: "75%", backgroundColor: "var(--accent)" }} />
        </div>
      </div>
    </div>
  );
}
