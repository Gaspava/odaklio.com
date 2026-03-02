"use client";

import { useState } from "react";
import {
  IconChat,
  IconMindMap,
  IconFlashcard,
  IconEdit,
  IconRoadmap,
} from "../icons/Icons";

interface ModeSelectorProps {
  onSelectMode: (mode: string) => void;
}

const modes = [
  {
    id: "standard",
    name: "Standart Sohbet",
    desc: "Klasik AI sohbet deneyimi",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  {
    id: "mindmap",
    name: "Mindmap Chat",
    desc: "2D paralel sohbet haritası",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
  },
  {
    id: "flashcard",
    name: "Flashcard",
    desc: "AI destekli hafıza kartları",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  {
    id: "note",
    name: "Not Alma",
    desc: "Yapılandırılmış not çıkarma",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
  },
  {
    id: "roadmap",
    name: "Roadmap",
    desc: "Adım adım öğrenme planı",
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  },
];

const modeIcons: Record<
  string,
  React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
> = {
  standard: IconChat,
  mindmap: IconMindMap,
  flashcard: IconFlashcard,
  note: IconEdit,
  roadmap: IconRoadmap,
};

export default function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pressedId, setPressedId] = useState<string | null>(null);

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-4 py-8"
      style={{ background: "var(--bg-primary)" }}
    >
      <div style={{ maxWidth: 800, width: "100%" }}>
        {/* Floating gradient icon */}
        <div className="flex justify-center mb-5 animate-fade-in">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl animate-float"
            style={{
              background:
                "linear-gradient(135deg, #10b981 0%, #8b5cf6 50%, #f59e0b 100%)",
              boxShadow:
                "0 0 24px rgba(139, 92, 246, 0.3), 0 0 48px rgba(16, 185, 129, 0.15)",
            }}
          >
            <svg
              width={28}
              height={28}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
        </div>

        {/* Title & subtitle */}
        <div
          className="text-center mb-8 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {"Odak Modunu Se\u00e7"}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            {"\u00d6\u011frenme tarz\u0131na uygun modu se\u00e7 ve AI ile \u00e7al\u0131\u015fmaya ba\u015fla"}
          </p>
        </div>

        {/* Mode cards grid */}
        <div
          className="mode-selector-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {modes.map((mode, index) => {
            const Icon = modeIcons[mode.id];
            const isHovered = hoveredId === mode.id;
            const isPressed = pressedId === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                onMouseEnter={() => setHoveredId(mode.id)}
                onMouseLeave={() => {
                  setHoveredId(null);
                  setPressedId(null);
                }}
                onMouseDown={() => setPressedId(mode.id)}
                onMouseUp={() => setPressedId(null)}
                className="animate-fade-in"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  height: 160,
                  borderRadius: "var(--radius-2xl)",
                  background: "var(--bg-card)",
                  border: `1px solid ${isHovered ? mode.color + "60" : "var(--border-primary)"}`,
                  cursor: "pointer",
                  padding: "20px 16px",
                  transition: "var(--transition-spring)",
                  transform: isPressed
                    ? "scale(0.97)"
                    : isHovered
                    ? "scale(1.03)"
                    : "scale(1)",
                  boxShadow: isHovered
                    ? `0 8px 32px ${mode.color}25, 0 0 0 1px ${mode.color}15, var(--shadow-card-hover)`
                    : "var(--shadow-card)",
                  animationDelay: `${0.15 + index * 0.07}s`,
                  animationFillMode: "backwards",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--radius-xl)",
                    background: mode.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isHovered
                      ? `0 4px 16px ${mode.color}40`
                      : `0 2px 8px ${mode.color}20`,
                    transition: "var(--transition-normal)",
                    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                  }}
                >
                  <Icon size={22} style={{ color: "white" }} />
                </div>

                {/* Name */}
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--text-primary)",
                    transition: "var(--transition-fast)",
                  }}
                >
                  {mode.name}
                </span>

                {/* Description */}
                <span
                  className="text-xs leading-tight text-center"
                  style={{
                    color: "var(--text-tertiary)",
                    maxWidth: 160,
                    transition: "var(--transition-fast)",
                  }}
                >
                  {mode.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scoped responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .mode-selector-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
