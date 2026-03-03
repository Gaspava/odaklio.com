"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "odaklio-onboarding-done";

interface Step {
  emoji: string;
  title: string;
  description: string;
  highlight?: string;
}

const steps: Step[] = [
  {
    emoji: "👋",
    title: "Odaklio'ya Hoş Geldin!",
    description:
      "AI destekli öğrenme platformuna hoş geldin. Birkaç adımda temel özellikleri tanıyalım.",
  },
  {
    emoji: "💬",
    title: "Odak Modu — AI Sohbet",
    description:
      "Herhangi bir konuyu AI'ya sor. Metni seçerek 'Hızlı Öğren', 'Bu nedir?' veya 'Hızlı Oku' özelliklerini kullanabilirsin.",
    highlight: "Odak",
  },
  {
    emoji: "🗺️",
    title: "4 Öğrenme Modu",
    description:
      "Standart sohbet dışında Mindmap, Flashcard ve Roadmap modlarıyla farklı öğrenme stillerini dene. Sol paneldeki 'Odak Modları'ndan seçebilirsin.",
    highlight: "Modlar",
  },
  {
    emoji: "👨‍🏫",
    title: "AI Mentorlar",
    description:
      "Koç, Psikolog, Arkadaş ve Uzman olmak üzere 4 farklı mentor karakteriyle öğrenme motivasyonunu artır.",
    highlight: "Mentor",
  },
  {
    emoji: "⏱️",
    title: "Pomodoro & Araçlar",
    description:
      "Sol paneldeki Pomodoro sayacıyla odaklı çalış. Araçlar sayfasında kaydettiğin flashcard'ları, notları ve roadmap'leri bul.",
    highlight: "Araçlar",
  },
  {
    emoji: "⌨️",
    title: "Klavye Kısayolları",
    description:
      "Ctrl+K ile komut paletini aç, Ctrl+N ile yeni sohbet başlat, Ctrl+1-5 ile sayfalar arası geçiş yap. Yazı boyutunu sağ üstteki ⚙️ butondan değiştir.",
  },
  {
    emoji: "🚀",
    title: "Hazırsın!",
    description:
      "Artık Odaklio'yu keşfetmeye hazırsın. İlk sorunla başla ve AI ile öğrenmenin keyfini çıkar!",
  },
];

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay to let the app render first
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const handleNext = () => {
    if (animating) return;
    if (stepIdx < steps.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStepIdx((i) => i + 1);
        setAnimating(false);
      }, 200);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (animating || stepIdx === 0) return;
    setAnimating(true);
    setTimeout(() => {
      setStepIdx((i) => i - 1);
      setAnimating(false);
    }, 200);
  };

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  const step = steps[stepIdx];
  const isLast = stepIdx === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[9500] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="relative rounded-3xl overflow-hidden w-full max-w-sm mx-4 animate-msg-in"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Progress bar */}
        <div className="h-1 w-full" style={{ background: "var(--bg-tertiary)" }}>
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${((stepIdx + 1) / steps.length) * 100}%`,
              background: "var(--gradient-primary)",
            }}
          />
        </div>

        {/* Content */}
        <div className="px-7 py-8 text-center" style={{ opacity: animating ? 0 : 1, transition: "opacity 0.2s" }}>
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 text-3xl"
            style={{ background: "var(--accent-primary-light)" }}
          >
            {step.emoji}
          </div>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            {step.title}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {step.description}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 pb-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStepIdx(i)}
              className="rounded-full transition-all"
              style={{
                width: i === stepIdx ? 20 : 6,
                height: 6,
                background: i === stepIdx ? "var(--accent-primary)" : "var(--bg-tertiary)",
              }}
            />
          ))}
        </div>

        {/* Footer buttons */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: "1px solid var(--border-secondary)" }}
        >
          <button
            onClick={handleClose}
            className="text-xs font-medium px-3 py-2 rounded-lg transition-all"
            style={{ color: "var(--text-tertiary)" }}
          >
            Atla
          </button>

          <div className="flex items-center gap-2">
            {stepIdx > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all active:scale-95"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                }}
              >
                ← Geri
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 text-xs font-bold px-5 py-2 rounded-xl transition-all active:scale-95 text-white"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "var(--shadow-glow-sm)",
              }}
            >
              {isLast ? "Başla 🚀" : "İleri →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
