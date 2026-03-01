"use client";

import { IconHelp, IconSearch, IconLightning } from "../icons/Icons";

interface TextSelectionPopupProps {
  x: number;
  y: number;
  selectedText: string;
  onAction: (action: "didnt-understand" | "what-is-this" | "speed-read") => void;
  onClose: () => void;
  isMobile?: boolean;
}

export default function TextSelectionPopup({
  x,
  y,
  onAction,
  isMobile = false,
}: TextSelectionPopupProps) {
  // On mobile, position at bottom center; on desktop, follow selection
  if (isMobile) {
    return (
      <div
        className="fixed z-[100] animate-slide-up"
        style={{
          left: "50%",
          bottom: 72,
          transform: "translateX(-50%)",
        }}
      >
        <div
          className="flex items-center gap-1 rounded-2xl p-1.5 shadow-lg"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          <button
            onClick={() => onAction("didnt-understand")}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium transition-colors active:scale-[0.96]"
            style={{ color: "var(--accent-warning)", background: "var(--accent-warning-light)" }}
          >
            <IconHelp size={14} />
            Anlamadım
          </button>

          <button
            onClick={() => onAction("what-is-this")}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium transition-colors active:scale-[0.96]"
            style={{ color: "var(--accent-secondary)", background: "var(--accent-secondary-light)" }}
          >
            <IconSearch size={14} />
            Bu nedir?
          </button>

          <button
            onClick={() => onAction("speed-read")}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-medium transition-colors active:scale-[0.96]"
            style={{ color: "var(--accent-primary)", background: "var(--accent-primary-light)" }}
          >
            <IconLightning size={14} />
            Hızlı Oku
          </button>
        </div>
      </div>
    );
  }

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
