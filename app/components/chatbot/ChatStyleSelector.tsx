"use client";

import { IconChat, IconMindMap, IconX } from "../icons/Icons";

export type ChatStyle = "standard" | "mindmap" | "flashcard" | "note" | "roadmap";

interface ChatStyleSelectorProps {
  onSelect: (style: ChatStyle) => void;
  onClose: () => void;
}

export default function ChatStyleSelector({
  onSelect,
  onClose,
}: ChatStyleSelectorProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: "var(--bg-overlay)" }}
      onClick={onClose}
    >
      <div
        className="relative w-[90vw] max-w-[480px] rounded-2xl p-6 animate-fade-in-scale"
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
            Yeni Sohbet Oluştur
          </h2>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Sohbet stilini seç
          </p>
        </div>

        {/* Style Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Standard Chat */}
          <button
            onClick={() => onSelect("standard")}
            className="group flex flex-col items-center gap-3 rounded-xl p-5 transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: "var(--bg-tertiary)",
              border: "2px solid var(--border-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-primary)";
              e.currentTarget.style.background = "var(--accent-primary-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-primary)";
              e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "var(--accent-primary-light)",
                color: "var(--accent-primary)",
              }}
            >
              <IconChat size={24} />
            </div>
            <div className="text-center">
              <p
                className="text-sm font-semibold mb-0.5"
                style={{ color: "var(--text-primary)" }}
              >
                Standart Sohbet
              </p>
              <p
                className="text-[10px] leading-tight"
                style={{ color: "var(--text-tertiary)" }}
              >
                Klasik AI sohbet deneyimi
              </p>
            </div>
          </button>

          {/* MindmapChat */}
          <button
            onClick={() => onSelect("mindmap")}
            className="group flex flex-col items-center gap-3 rounded-xl p-5 transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
            style={{
              background: "var(--bg-tertiary)",
              border: "2px solid var(--border-primary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-purple)";
              e.currentTarget.style.background = "var(--accent-purple-light)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-primary)";
              e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
          >
            {/* New badge */}
            <div
              className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
              style={{
                background: "var(--accent-purple)",
                color: "white",
              }}
            >
              YENİ
            </div>
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: "var(--accent-purple-light)",
                color: "var(--accent-purple)",
              }}
            >
              <IconMindMap size={24} />
            </div>
            <div className="text-center">
              <p
                className="text-sm font-semibold mb-0.5"
                style={{ color: "var(--text-primary)" }}
              >
                MindmapChat
              </p>
              <p
                className="text-[10px] leading-tight"
                style={{ color: "var(--text-tertiary)" }}
              >
                2D paralel sohbet haritası
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
