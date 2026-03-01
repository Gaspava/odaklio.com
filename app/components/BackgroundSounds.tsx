"use client";
import { useState } from "react";

interface Sound {
  id: string;
  name: string;
  icon: string;
  volume: number;
  active: boolean;
  color: string;
}

interface Preset {
  name: string;
  sounds: Record<string, number>;
}

const PRESETS: Preset[] = [
  { name: "Kafe Ortami", sounds: { rain: 0, cafe: 80, fire: 30, forest: 0, ocean: 0, wind: 0, thunder: 0, birds: 20 } },
  { name: "Yagmurlu Gece", sounds: { rain: 80, cafe: 0, fire: 40, forest: 0, ocean: 0, wind: 20, thunder: 50, birds: 0 } },
  { name: "Dogada Calisma", sounds: { rain: 0, cafe: 0, fire: 0, forest: 70, ocean: 0, wind: 30, thunder: 0, birds: 60 } },
  { name: "Okyanus Huzuru", sounds: { rain: 20, cafe: 0, fire: 0, forest: 0, ocean: 80, wind: 40, thunder: 0, birds: 0 } },
];

export default function BackgroundSounds() {
  const [sounds, setSounds] = useState<Sound[]>([
    { id: "rain", name: "Yagmur", icon: "🌧", volume: 0, active: false, color: "#74b9ff" },
    { id: "cafe", name: "Kafe", icon: "☕", volume: 0, active: false, color: "#fdcb6e" },
    { id: "fire", name: "Somine", icon: "🔥", volume: 0, active: false, color: "#e17055" },
    { id: "forest", name: "Orman", icon: "🌲", volume: 0, active: false, color: "#00b894" },
    { id: "ocean", name: "Okyanus", icon: "🌊", volume: 0, active: false, color: "#0984e3" },
    { id: "wind", name: "Ruzgar", icon: "💨", volume: 0, active: false, color: "#dfe6e9" },
    { id: "thunder", name: "Gok Gurultusu", icon: "⚡", volume: 0, active: false, color: "#a29bfe" },
    { id: "birds", name: "Kus Sesleri", icon: "🐦", volume: 0, active: false, color: "#55efc4" },
  ]);
  const [masterVolume, setMasterVolume] = useState(70);

  const toggleSound = (id: string) => {
    setSounds((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, active: !s.active, volume: s.active ? 0 : 50 } : s
      )
    );
  };

  const setVolume = (id: string, vol: number) => {
    setSounds((prev) =>
      prev.map((s) => (s.id === id ? { ...s, volume: vol, active: vol > 0 } : s))
    );
  };

  const applyPreset = (preset: Preset) => {
    setSounds((prev) =>
      prev.map((s) => ({
        ...s,
        volume: preset.sounds[s.id] || 0,
        active: (preset.sounds[s.id] || 0) > 0,
      }))
    );
  };

  const activeSounds = sounds.filter((s) => s.active);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Arka Plan Sesleri
        </h3>
        <div
          className="flex items-center gap-1 rounded-lg px-2 py-1"
          style={{ backgroundColor: activeSounds.length > 0 ? "var(--accent-light)" : "var(--bg-tertiary)" }}
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: activeSounds.length > 0 ? "var(--accent)" : "var(--text-tertiary)" }}
          />
          <span className="text-[10px]" style={{ color: activeSounds.length > 0 ? "var(--accent)" : "var(--text-tertiary)" }}>
            {activeSounds.length > 0 ? `${activeSounds.length} aktif` : "Kapali"}
          </span>
        </div>
      </div>

      {/* Master volume */}
      <div className="mb-4 rounded-xl p-3" style={{ backgroundColor: "var(--bg-tertiary)" }}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Ana Ses
          </span>
          <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
            {masterVolume}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={masterVolume}
          onChange={(e) => setMasterVolume(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
      </div>

      {/* Presets */}
      <div className="mb-4">
        <h4 className="mb-2 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          Hazir Ayarlar
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="rounded-xl p-2.5 text-center text-[11px] font-medium transition-all hover:scale-[1.02]"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-primary)" }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sound grid */}
      <div className="flex-1 overflow-y-auto">
        <h4 className="mb-2 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          Sesler
        </h4>
        <div className="flex flex-col gap-2">
          {sounds.map((s) => (
            <div
              key={s.id}
              className="rounded-xl p-3 transition-all"
              style={{
                backgroundColor: s.active ? `${s.color}11` : "var(--bg-tertiary)",
                border: s.active ? `1px solid ${s.color}33` : "1px solid transparent",
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <button
                  onClick={() => toggleSound(s.id)}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg">{s.icon}</span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: s.active ? s.color : "var(--text-secondary)" }}
                  >
                    {s.name}
                  </span>
                </button>
                {s.active && (
                  <div className="flex items-center gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="w-0.5 rounded-full"
                        style={{
                          height: `${8 + Math.random() * 10}px`,
                          backgroundColor: s.color,
                          opacity: 0.6 + Math.random() * 0.4,
                          animation: `soundWave 0.5s ease-in-out ${i * 0.1}s infinite alternate`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              {s.active && (
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={s.volume}
                  onChange={(e) => setVolume(s.id, Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
