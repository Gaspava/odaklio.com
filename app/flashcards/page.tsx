"use client";

import FlashCardDeck from "../components/flashcard/FlashCard";
import MentorBot from "../components/mentor/MentorBot";

export default function FlashcardsPage() {
  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Flashcard
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Aralıklı tekrar yöntemiyle bilgilerini kalıcı hale getir. Kartları
          çevir, öğrendiklerini işaretle.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {["Tümü", "Fizik", "Matematik", "Biyoloji", "Kimya", "Tarih"].map(
          (cat, i) => (
            <button
              key={cat}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background:
                  i === 0 ? "var(--accent-primary)" : "var(--bg-tertiary)",
                color: i === 0 ? "white" : "var(--text-secondary)",
              }}
            >
              {cat}
            </button>
          )
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Toplam Kart", value: "128" },
          { label: "Öğrenildi", value: "89" },
          { label: "Tekrar Edilecek", value: "24" },
          { label: "Yeni", value: "15" },
        ].map((stat) => (
          <div key={stat.label} className="card-static p-3 text-center">
            <div
              className="text-lg font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {stat.value}
            </div>
            <div
              className="text-[11px] mt-0.5"
              style={{ color: "var(--text-tertiary)" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <FlashCardDeck />

      <MentorBot />
    </div>
  );
}
