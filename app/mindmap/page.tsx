"use client";

import MindMap from "../components/mindmap/MindMap";
import MentorBot from "../components/mentor/MentorBot";

export default function MindMapPage() {
  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Mind Map
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Bilgilerini görsel olarak bağla, düğümleri sürükle ve keşfet.
            Obsidian tarzı ama daha gelişmiş.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn-primary text-sm">+ Yeni Harita</button>
          <button className="btn-secondary text-sm">Kaydet</button>
        </div>
      </div>

      {/* Map Library */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
        {[
          { name: "Kuantum Fiziği", active: true },
          { name: "Hücre Biyolojisi", active: false },
          { name: "Calculus", active: false },
          { name: "Osmanlı Tarihi", active: false },
        ].map((map) => (
          <button
            key={map.name}
            className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: map.active
                ? "var(--accent-primary-light)"
                : "var(--bg-tertiary)",
              color: map.active
                ? "var(--accent-primary)"
                : "var(--text-tertiary)",
              border: map.active
                ? "1px solid var(--accent-primary)"
                : "1px solid transparent",
            }}
          >
            {map.name}
          </button>
        ))}
      </div>

      <MindMap />

      <MentorBot />
    </div>
  );
}
