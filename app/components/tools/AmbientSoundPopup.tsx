"use client";

import { useState } from "react";

interface AmbientSoundPopupProps {
  onClose: () => void;
  onSoundChange?: (playing: boolean) => void;
}

const sounds = [
  { id: "rain", emoji: "🌧️", name: "Yagmur" },
  { id: "forest", emoji: "🌲", name: "Orman" },
  { id: "ocean", emoji: "🌊", name: "Okyanus" },
  { id: "fire", emoji: "🔥", name: "Somine" },
  { id: "cafe", emoji: "☕", name: "Kafe" },
  { id: "lofi", emoji: "🎵", name: "Lo-Fi" },
  { id: "white", emoji: "📡", name: "Beyaz G." },
  { id: "birds", emoji: "🐦", name: "Kuslar" },
];

export default function AmbientSoundPopup({ onClose, onSoundChange }: AmbientSoundPopupProps) {
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(40);

  const toggleSound = (id: string) => {
    const newActive = activeSound === id ? null : id;
    setActiveSound(newActive);
    onSoundChange?.(newActive !== null);
  };

  return (
    <div className="tool-popup tool-popup-sound" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Arka Plan Sesi
        </h3>
        <button onClick={onClose} className="flex items-center justify-center w-6 h-6 rounded-md transition-all hover:bg-[var(--bg-tertiary)]"
          style={{ color: "var(--text-tertiary)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Sound Grid */}
      <div className="grid grid-cols-4 gap-1.5">
        {sounds.map((sound) => (
          <button key={sound.id} onClick={() => toggleSound(sound.id)}
            className="flex flex-col items-center gap-1 rounded-xl py-2 transition-all active:scale-95"
            style={{
              background: activeSound === sound.id ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
              border: activeSound === sound.id ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid transparent",
            }}>
            <span className="text-sm">{sound.emoji}</span>
            <span className="text-[9px] font-semibold"
              style={{ color: activeSound === sound.id ? "var(--accent-primary)" : "var(--text-tertiary)" }}>
              {sound.name}
            </span>
          </button>
        ))}
      </div>

      {/* Volume Slider */}
      {activeSound && (
        <div className="flex items-center gap-2 mt-3 pt-2" style={{ borderTop: "1px solid var(--border-secondary)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          <input type="range" min="0" max="100" value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: "var(--accent-primary)" }} />
          <span className="text-[10px] font-semibold min-w-[24px] text-right" style={{ color: "var(--text-tertiary)" }}>
            {volume}%
          </span>
        </div>
      )}
    </div>
  );
}
