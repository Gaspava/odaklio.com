"use client";

import { useState } from "react";
import {
  IconVolume,
  IconX,
  IconPlay,
  IconPause,
} from "../icons/Icons";

interface SoundOption {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

const sounds: SoundOption[] = [
  { id: "rain", name: "Yağmur", emoji: "🌧️", category: "Doğa" },
  { id: "forest", name: "Orman", emoji: "🌲", category: "Doğa" },
  { id: "ocean", name: "Okyanus", emoji: "🌊", category: "Doğa" },
  { id: "fire", name: "Şömine", emoji: "🔥", category: "Doğa" },
  { id: "birds", name: "Kuşlar", emoji: "🐦", category: "Doğa" },
  { id: "cafe", name: "Kafe", emoji: "☕", category: "Ortam" },
  { id: "library", name: "Kütüphane", emoji: "📚", category: "Ortam" },
  { id: "lofi", name: "Lo-Fi", emoji: "🎵", category: "Müzik" },
  { id: "classical", name: "Klasik", emoji: "🎻", category: "Müzik" },
  { id: "ambient", name: "Ambient", emoji: "🎧", category: "Müzik" },
  { id: "whitenoise", name: "Beyaz Gürültü", emoji: "📡", category: "Gürültü" },
  { id: "brownnoise", name: "Kahverengi Gürültü", emoji: "🟤", category: "Gürültü" },
];

export default function BackgroundSound() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);

  const categories = [...new Set(sounds.map((s) => s.category))];

  const toggleSound = (soundId: string) => {
    if (activeSound === soundId) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveSound(soundId);
      setIsPlaying(true);
    }
  };

  return (
    <>
      {/* Mini Player Bar - shows when sound is active */}
      {activeSound && !isOpen && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-2 glass"
          style={{
            marginLeft: "var(--sidebar-width)",
            borderTop: "1px solid var(--border-primary)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{
                background: "var(--accent-primary-light)",
                color: "var(--accent-primary)",
              }}
            >
              {isPlaying ? <IconPause size={12} /> : <IconPlay size={12} />}
            </button>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {sounds.find((s) => s.id === activeSound)?.emoji}{" "}
              {sounds.find((s) => s.id === activeSound)?.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
              <IconVolume size={14} />
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1 w-20 cursor-pointer appearance-none rounded-full"
              style={{ accentColor: "var(--accent-primary)" }}
            />
            <button
              onClick={() => setIsOpen(true)}
              className="btn-ghost p-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              <IconVolume size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Sound Picker Panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-2xl animate-slide-up"
          style={{
            width: 420,
            maxHeight: 400,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: "var(--accent-primary)" }}>
                <IconVolume size={16} />
              </span>
              <span
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Arka Plan Sesleri
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              <IconX size={16} />
            </button>
          </div>

          {/* Sound Grid */}
          <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 320 }}>
            {categories.map((cat) => (
              <div key={cat}>
                <h4
                  className="mb-2 text-xs font-medium uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {cat}
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {sounds
                    .filter((s) => s.category === cat)
                    .map((sound) => (
                      <button
                        key={sound.id}
                        onClick={() => toggleSound(sound.id)}
                        className="flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all"
                        style={{
                          background:
                            activeSound === sound.id
                              ? "var(--accent-primary-light)"
                              : "var(--bg-card)",
                          border: `1px solid ${
                            activeSound === sound.id
                              ? "var(--accent-primary)"
                              : "var(--border-primary)"
                          }`,
                        }}
                      >
                        <span className="text-xl">{sound.emoji}</span>
                        <span
                          className="text-[11px] font-medium"
                          style={{
                            color:
                              activeSound === sound.id
                                ? "var(--accent-primary)"
                                : "var(--text-secondary)",
                          }}
                        >
                          {sound.name}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Volume Control */}
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{ borderTop: "1px solid var(--border-primary)" }}
          >
            <span style={{ color: "var(--text-tertiary)" }}>
              <IconVolume size={14} />
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full"
              style={{ accentColor: "var(--accent-primary)" }}
            />
            <span
              className="min-w-[32px] text-right text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              {volume}%
            </span>
          </div>
        </div>
      )}
    </>
  );
}
