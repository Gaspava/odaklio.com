"use client";
import { useState } from "react";

interface FocusModePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  pomodoroMins: number;
  breakMins: number;
  sounds: string[];
  blockSites: string[];
}

const PRESETS: FocusModePreset[] = [
  {
    id: "deep",
    name: "Derin Calisma",
    icon: "🧠",
    description: "Maksimum konsantrasyon. Tum dikkat dagiticilar kapatilir.",
    color: "#7c6cf0",
    pomodoroMins: 50,
    breakMins: 10,
    sounds: ["Yagmur", "Beyaz Gurultu"],
    blockSites: ["twitter.com", "instagram.com", "youtube.com", "reddit.com"],
  },
  {
    id: "reading",
    name: "Okuma Modu",
    icon: "📖",
    description: "Hizli okuma ve not alma icin optimize edilmistir.",
    color: "#0984e3",
    pomodoroMins: 30,
    breakMins: 5,
    sounds: ["Kafe"],
    blockSites: ["twitter.com", "instagram.com"],
  },
  {
    id: "writing",
    name: "Yazim Modu",
    icon: "✍️",
    description: "Dikkat dagitmadan yazim ve icerik uretimi.",
    color: "#00b894",
    pomodoroMins: 45,
    breakMins: 10,
    sounds: ["Somine", "Yagmur"],
    blockSites: ["twitter.com", "instagram.com", "youtube.com"],
  },
  {
    id: "exam",
    name: "Sinav Hazirlik",
    icon: "📝",
    description: "Flash kartlar ve tekrar odakli yogun calisma.",
    color: "#e17055",
    pomodoroMins: 25,
    breakMins: 5,
    sounds: [],
    blockSites: ["twitter.com", "instagram.com", "youtube.com", "reddit.com", "tiktok.com"],
  },
  {
    id: "creative",
    name: "Yaratici Mod",
    icon: "🎨",
    description: "Beyin firtinasi ve yaratici dusunce icin esnek mod.",
    color: "#fdcb6e",
    pomodoroMins: 0,
    breakMins: 0,
    sounds: ["Orman", "Kus Sesleri"],
    blockSites: [],
  },
];

export default function FocusMode() {
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const active = PRESETS.find((p) => p.id === activeMode);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Odak Modlari
        </h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg px-2 py-1 text-xs"
          style={{ backgroundColor: "var(--accent)", color: "#fff" }}
        >
          + Olustur
        </button>
      </div>

      {/* Active mode indicator */}
      {active && (
        <div
          className="mb-4 rounded-2xl p-4"
          style={{ backgroundColor: `${active.color}15`, border: `1px solid ${active.color}33` }}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{active.icon}</span>
              <div>
                <div className="text-sm font-semibold" style={{ color: active.color }}>
                  {active.name}
                </div>
                <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  Aktif
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveMode(null)}
              className="rounded-lg px-3 py-1.5 text-xs"
              style={{ backgroundColor: `${active.color}22`, color: active.color }}
            >
              Durdur
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {active.pomodoroMins > 0 && (
              <span className="rounded-md px-2 py-0.5 text-[10px]" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                {active.pomodoroMins}dk odak / {active.breakMins}dk mola
              </span>
            )}
            {active.sounds.map((s) => (
              <span key={s} className="rounded-md px-2 py-0.5 text-[10px]" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                🔊 {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Presets */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveMode(activeMode === p.id ? null : p.id)}
              className="rounded-2xl p-4 text-left transition-all hover:scale-[1.01]"
              style={{
                backgroundColor: activeMode === p.id ? `${p.color}15` : "var(--bg-tertiary)",
                border: activeMode === p.id ? `1px solid ${p.color}33` : "1px solid transparent",
              }}
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-lg">{p.icon}</span>
                <span className="text-sm font-semibold" style={{ color: activeMode === p.id ? p.color : "var(--text-primary)" }}>
                  {p.name}
                </span>
              </div>
              <p className="mb-2 text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                {p.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {p.pomodoroMins > 0 && (
                  <span className="rounded-md px-1.5 py-0.5 text-[9px]" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
                    ⏱ {p.pomodoroMins}dk
                  </span>
                )}
                {p.blockSites.length > 0 && (
                  <span className="rounded-md px-1.5 py-0.5 text-[9px]" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
                    🚫 {p.blockSites.length} site
                  </span>
                )}
                {p.sounds.length > 0 && (
                  <span className="rounded-md px-1.5 py-0.5 text-[9px]" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-tertiary)" }}>
                    🔊 {p.sounds.length} ses
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Create custom mode */}
      {showCreate && (
        <div className="mt-4 rounded-xl p-3" style={{ backgroundColor: "var(--bg-tertiary)" }}>
          <h4 className="mb-2 text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
            Ozel Mod Olustur
          </h4>
          <div className="flex flex-col gap-2">
            <input
              placeholder="Mod adi..."
              className="rounded-lg border px-3 py-2 text-xs outline-none"
              style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
            />
            <div className="flex gap-2">
              <input
                placeholder="Odak (dk)"
                type="number"
                className="w-1/2 rounded-lg border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              />
              <input
                placeholder="Mola (dk)"
                type="number"
                className="w-1/2 rounded-lg border px-3 py-2 text-xs outline-none"
                style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
              />
            </div>
            <button
              className="rounded-lg py-2 text-xs font-medium text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              Olustur
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
