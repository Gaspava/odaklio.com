"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { IconPlay, IconPause, IconRefresh, IconX } from "../icons/Icons";

interface SpeedReadingOverlayProps {
  text: string;
  onClose: () => void;
}

export default function SpeedReadingOverlay({
  text,
  onClose,
}: SpeedReadingOverlayProps) {
  const words = text.split(/\s+/).filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentWord = words[currentIndex] || "";
  const progress = words.length > 0 ? Math.round((currentIndex / words.length) * 100) : 0;

  const tick = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev + 1 >= words.length) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [words.length]);

  useEffect(() => {
    if (isPlaying) {
      const interval = (60 / wpm) * 1000;
      intervalRef.current = setInterval(tick, interval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, wpm, tick]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Highlight the pivot letter in the word (middle letter)
  const renderWord = (word: string) => {
    if (!word) return null;
    const pivotIndex = Math.max(0, Math.floor(word.length / 2) - (word.length > 4 ? 1 : 0));
    return (
      <span className="text-3xl sm:text-5xl font-semibold tracking-wide">
        <span style={{ color: "var(--text-secondary)" }}>{word.slice(0, pivotIndex)}</span>
        <span style={{ color: "var(--accent-primary)" }}>{word[pivotIndex]}</span>
        <span style={{ color: "var(--text-secondary)" }}>{word.slice(pivotIndex + 1)}</span>
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in p-4"
      style={{ background: "var(--bg-overlay)", backdropFilter: "blur(12px)" }}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4"
          style={{ borderBottom: "1px solid var(--border-primary)" }}
        >
          <div>
            <h2 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              Hızlı Okuma
            </h2>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              {words.length} kelime
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Display Area */}
        <div
          className="flex flex-col items-center justify-center relative"
          style={{ height: 160 }}
        >
          {/* Focus guide line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 opacity-10"
            style={{ background: "var(--accent-primary)" }}
          />

          {renderWord(currentWord)}

          {currentIndex >= words.length - 1 && !isPlaying && currentIndex > 0 && (
            <p className="mt-4 text-xs" style={{ color: "var(--accent-success)" }}>
              Tamamlandı!
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="px-4 pb-4 sm:px-6 sm:pb-5 space-y-4">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                {currentIndex}/{words.length}
              </span>
              <span className="text-[10px] font-medium" style={{ color: "var(--accent-primary)" }}>
                {progress}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
              <div
                className="h-full rounded-full transition-all duration-150"
                style={{ width: `${progress}%`, background: "var(--gradient-primary)" }}
              />
            </div>
          </div>

          {/* Buttons & Speed */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setIsPlaying(false);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-[0.95]"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
              >
                <IconRefresh size={16} />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-12 w-12 items-center justify-center rounded-xl text-white transition-all active:scale-[0.95]"
                style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
              >
                {isPlaying ? <IconPause size={20} /> : <IconPlay size={20} />}
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
              <span className="text-[10px] hidden sm:inline" style={{ color: "var(--text-tertiary)" }}>Hız</span>
              <input
                type="range"
                min="100"
                max="800"
                step="50"
                value={wpm}
                onChange={(e) => setWpm(Number(e.target.value))}
                className="h-1 w-16 sm:w-24 cursor-pointer appearance-none rounded-full"
                style={{ accentColor: "var(--accent-primary)" }}
              />
              <span
                className="rounded-md px-2 py-0.5 text-[11px] font-bold"
                style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
              >
                {wpm}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
