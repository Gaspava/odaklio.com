"use client";

import { IconHelp, IconSearch, IconLightning } from "../icons/Icons";

interface TextSelectionPopupProps {
  x: number;
  y: number;
  selectedText: string;
  onAction: (action: "didnt-understand" | "what-is-this" | "speed-read") => void;
  onClose: () => void;
}

export default function TextSelectionPopup({
  x,
  y,
  onAction,
}: TextSelectionPopupProps) {
  return (
    <div
      className="fixed z-[100] animate-fade-in"
      style={{
        left: x,
        top: y - 8,
        transform: "translate(-50%, -100%)",
      }}
    >
      <div
        className="flex items-center gap-1 rounded-xl p-1 shadow-lg"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <button
          onClick={() => onAction("didnt-understand")}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          style={{ color: "var(--accent-warning)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-warning-light)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <IconHelp size={14} />
          Anlamadım
        </button>

        <div className="w-px h-5" style={{ background: "var(--border-primary)" }} />

        <button
          onClick={() => onAction("what-is-this")}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          style={{ color: "var(--accent-secondary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-secondary-light)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <IconSearch size={14} />
          Bu nedir?
        </button>

        <div className="w-px h-5" style={{ background: "var(--border-primary)" }} />

        <button
          onClick={() => onAction("speed-read")}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          style={{ color: "var(--accent-primary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-primary-light)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <IconLightning size={14} />
          Hızlı Oku
        </button>
      </div>

      {/* Arrow */}
      <div
        className="mx-auto w-3 h-3 rotate-45"
        style={{
          background: "var(--bg-card)",
          borderRight: "1px solid var(--border-primary)",
          borderBottom: "1px solid var(--border-primary)",
          marginTop: -2,
        }}
      />
    </div>
  );
}
