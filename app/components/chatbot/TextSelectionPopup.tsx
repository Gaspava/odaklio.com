"use client";

import { useRef, useLayoutEffect, useState } from "react";
import { IconHelp, IconSearch, IconLightning } from "../icons/Icons";

interface TextSelectionPopupProps {
  x: number;
  y: number;
  bottom: number;
  selectedText: string;
  onAction: (action: "didnt-understand" | "what-is-this" | "speed-read") => void;
  onClose: () => void;
  isMobile?: boolean;
}

const ARROW_SIZE = 6;
const GAP = 6;

export default function TextSelectionPopup({
  x,
  y,
  bottom,
  onAction,
  isMobile = false,
}: TextSelectionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; openBelow: boolean } | null>(null);

  useLayoutEffect(() => {
    const el = popupRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const popupH = rect.height;
    const popupW = rect.width;

    const spaceAbove = y;
    const openBelow = spaceAbove < popupH + ARROW_SIZE + GAP;

    let top: number;
    if (openBelow) {
      top = bottom + ARROW_SIZE + GAP;
    } else {
      top = y - popupH - ARROW_SIZE - GAP;
    }

    let left = x - popupW / 2;
    const pad = 8;
    if (left < pad) left = pad;
    if (left + popupW > window.innerWidth - pad) left = window.innerWidth - pad - popupW;

    setPos({ left, top, openBelow });
  }, [x, y, bottom]);

  // Mobile layout
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

  // Compute arrow horizontal position relative to popup
  const arrowLeft = pos ? x - pos.left : 0;

  return (
    <div
      ref={popupRef}
      className="fixed z-[100]"
      style={{
        left: pos ? pos.left : x,
        top: pos ? pos.top : y - 50,
        opacity: pos ? 1 : 0,
        transition: "opacity 0.15s ease",
      }}
    >
      {/* Arrow on top (when popup opens below) */}
      {pos?.openBelow && (
        <div
          style={{
            position: "absolute",
            top: -ARROW_SIZE,
            left: arrowLeft - ARROW_SIZE,
            width: 0,
            height: 0,
            borderLeft: `${ARROW_SIZE}px solid transparent`,
            borderRight: `${ARROW_SIZE}px solid transparent`,
            borderBottom: `${ARROW_SIZE}px solid var(--border-primary)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 1.5,
              left: -ARROW_SIZE + 1,
              width: 0,
              height: 0,
              borderLeft: `${ARROW_SIZE - 1}px solid transparent`,
              borderRight: `${ARROW_SIZE - 1}px solid transparent`,
              borderBottom: `${ARROW_SIZE - 1}px solid var(--bg-card)`,
            }}
          />
        </div>
      )}

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

      {/* Arrow on bottom (when popup opens above) */}
      {pos && !pos.openBelow && (
        <div
          style={{
            position: "absolute",
            bottom: -ARROW_SIZE,
            left: arrowLeft - ARROW_SIZE,
            width: 0,
            height: 0,
            borderLeft: `${ARROW_SIZE}px solid transparent`,
            borderRight: `${ARROW_SIZE}px solid transparent`,
            borderTop: `${ARROW_SIZE}px solid var(--border-primary)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              bottom: 1.5,
              left: -ARROW_SIZE + 1,
              width: 0,
              height: 0,
              borderLeft: `${ARROW_SIZE - 1}px solid transparent`,
              borderRight: `${ARROW_SIZE - 1}px solid transparent`,
              borderTop: `${ARROW_SIZE - 1}px solid var(--bg-card)`,
            }}
          />
        </div>
      )}
    </div>
  );
}
