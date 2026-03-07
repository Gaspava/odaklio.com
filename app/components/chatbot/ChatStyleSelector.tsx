"use client";

import { IconChat, IconMindMap, IconFlashcard, IconRoadmap, IconSolver, IconX } from "../icons/Icons";

export type ChatStyle = "standard" | "mindmap" | "flashcard" | "roadmap" | "solver";

interface ChatStyleSelectorProps {
  onSelect: (style: ChatStyle) => void;
  onClose: () => void;
}

export default function ChatStyleSelector({
  onSelect,
  onClose,
}: ChatStyleSelectorProps) {
  const modes = [
    { id: "standard" as ChatStyle, name: "Standart Sohbet", desc: "Klasik AI sohbet deneyimi", color: "var(--accent-primary)", bgColor: "var(--accent-primary-light)", icon: <IconChat size={24} /> },
    { id: "mindmap" as ChatStyle, name: "Mindmap Chat", desc: "2D paralel sohbet haritasi", color: "var(--accent-purple)", bgColor: "var(--accent-purple-light)", icon: <IconMindMap size={24} /> },
    { id: "flashcard" as ChatStyle, name: "Flashcard", desc: "AI destekli hafiza kartlari", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)", icon: <IconFlashcard size={24} />, isNew: true },
    { id: "roadmap" as ChatStyle, name: "Roadmap", desc: "Adim adim ogrenme plani", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.1)", icon: <IconRoadmap size={24} />, isNew: true },
    { id: "solver" as ChatStyle, name: "Soru Cozucu", desc: "Adim adim matematik cozumu", color: "#8b5cf6", bgColor: "rgba(139, 92, 246, 0.1)", icon: <IconSolver size={24} />, isNew: true },
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "var(--bg-overlay)" }}
      onClick={onClose}
    >
      <div
        className="relative w-[90vw] max-w-[560px] rounded-2xl p-6 animate-fade-in-scale"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg transition-all"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-tertiary)",
          }}
        >
          <IconX size={14} />
        </button>

        {/* Title */}
        <div className="mb-6">
          <h2
            className="text-lg font-bold mb-1"
            style={{ color: "var(--text-primary)" }}
          >
            Yeni Sohbet Olustur
          </h2>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Sohbet stilini sec
          </p>
        </div>

        {/* Style Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSelect(mode.id)}
              className="group flex flex-col items-center gap-3 rounded-xl p-5 transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
              style={{
                background: "var(--bg-tertiary)",
                border: "2px solid var(--border-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = mode.color;
                e.currentTarget.style.background = mode.bgColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-primary)";
                e.currentTarget.style.background = "var(--bg-tertiary)";
              }}
            >
              {mode.isNew && (
                <div
                  className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                  style={{
                    background: mode.color,
                    color: "white",
                  }}
                >
                  YENI
                </div>
              )}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{
                  background: mode.bgColor,
                  color: mode.color,
                }}
              >
                {mode.icon}
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-semibold mb-0.5"
                  style={{ color: "var(--text-primary)" }}
                >
                  {mode.name}
                </p>
                <p
                  className="text-[10px] leading-tight"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {mode.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
