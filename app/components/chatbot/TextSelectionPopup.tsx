"use client";

import { useRef, useLayoutEffect, useState, useCallback } from "react";
import { IconBrain, IconSearch, IconLightning } from "../icons/Icons";
import { useAuth } from "@/app/providers/AuthProvider";
import { saveUserNoteToDb } from "@/lib/db/conversations";

interface TextSelectionPopupProps {
  x: number;
  y: number;
  bottom: number;
  selectedText: string;
  onAction: (action: "quick-learn" | "what-is-this" | "speed-read") => void;
  onClose: () => void;
  isMobile?: boolean;
}

const ARROW_SIZE = 6;
const GAP = 6;

export default function TextSelectionPopup({
  x,
  y,
  bottom,
  selectedText,
  onAction,
  onClose,
  isMobile = false,
}: TextSelectionPopupProps) {
  const { user } = useAuth();
  const popupRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; openBelow: boolean } | null>(null);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);

  const handleSaveNote = useCallback(async () => {
    if (!user || noteSaving || noteSaved) return;
    setNoteSaving(true);
    try {
      await saveUserNoteToDb(user.id, selectedText, "Odak");
      setNoteSaved(true);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setNoteSaving(false);
    }
  }, [user, selectedText, noteSaving, noteSaved, onClose]);

  const handleAction = (action: "quick-learn" | "what-is-this" | "speed-read") => {
    onAction(action);
  };

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
    const pad = 6;
    if (left < pad) left = pad;
    if (left + popupW > window.innerWidth - pad) left = window.innerWidth - pad - popupW;

    setPos({ left, top, openBelow });
  }, [x, y, bottom]);

  // Compute arrow horizontal position relative to popup
  const arrowLeft = pos ? Math.min(Math.max(x - pos.left, ARROW_SIZE + 4), (popupRef.current?.offsetWidth || 200) - ARROW_SIZE - 4) : 0;

  // Shared button handler to prevent propagation on both mouse and touch
  const stop = (e: React.MouseEvent | React.TouchEvent) => e.stopPropagation();

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
        className="rounded-xl shadow-lg"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-xl)",
          overflow: "hidden",
        }}
      >
        {/* Top row - action buttons */}
        <div className={`flex items-center ${isMobile ? "gap-0.5 p-0.5" : "gap-1 p-1"}`}>
          {isMobile ? (
            <>
              <button
                onMouseDown={stop}
                onTouchStart={stop}
                onClick={() => handleAction("quick-learn")}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors active:scale-[0.96]"
                style={{ color: "var(--accent-warning)" }}
              >
                <IconBrain size={11} />
                Öğren
              </button>
              <div className="w-px h-4" style={{ background: "var(--border-primary)" }} />
              <button
                onMouseDown={stop}
                onTouchStart={stop}
                onClick={() => handleAction("what-is-this")}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors active:scale-[0.96]"
                style={{ color: "var(--accent-secondary)" }}
              >
                <IconSearch size={11} />
                Nedir?
              </button>
              <div className="w-px h-4" style={{ background: "var(--border-primary)" }} />
              <button
                onMouseDown={stop}
                onTouchStart={stop}
                onClick={() => handleAction("speed-read")}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors active:scale-[0.96]"
                style={{ color: "var(--accent-primary)" }}
              >
                <IconLightning size={11} />
                Hızlı Oku
              </button>
            </>
          ) : (
            <>
              <button
                onMouseDown={stop}
                onClick={() => handleAction("quick-learn")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                style={{ color: "var(--accent-warning)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-warning-light)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <IconBrain size={14} />
                Hızlı Öğren
              </button>
              <div className="w-px h-5" style={{ background: "var(--border-primary)" }} />
              <button
                onMouseDown={stop}
                onClick={() => handleAction("what-is-this")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                style={{ color: "var(--accent-secondary)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-secondary-light)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <IconSearch size={14} />
                Bu nedir?
              </button>
              <div className="w-px h-5" style={{ background: "var(--border-primary)" }} />
              <button
                onMouseDown={stop}
                onClick={() => handleAction("speed-read")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
                style={{ color: "var(--accent-primary)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-primary-light)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <IconLightning size={14} />
                Hızlı Oku
              </button>
            </>
          )}
        </div>

        {/* Bottom row - save to notes */}
        {user && (
          <>
            <div className="h-px" style={{ background: "var(--border-primary)" }} />
            <button
              onMouseDown={stop}
              onTouchStart={stop}
              onClick={handleSaveNote}
              disabled={noteSaving || noteSaved}
              className={`flex items-center justify-center gap-1.5 w-full transition-colors active:scale-[0.98] ${
                isMobile ? "px-2 py-1.5 text-[10px]" : "px-3 py-2 text-xs"
              } font-medium`}
              style={{
                color: noteSaved ? "var(--accent-primary)" : "var(--text-tertiary)",
                background: noteSaved ? "var(--accent-primary-light)" : "transparent",
              }}
              onMouseEnter={(e) => { if (!noteSaved) e.currentTarget.style.background = "var(--bg-tertiary)"; }}
              onMouseLeave={(e) => { if (!noteSaved) e.currentTarget.style.background = "transparent"; }}
            >
              {noteSaved ? (
                <>
                  <svg width={isMobile ? 11 : 13} height={isMobile ? 11 : 13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Kaydedildi!
                </>
              ) : noteSaving ? (
                <>
                  <div className={`border-2 border-current border-t-transparent rounded-full animate-spin ${isMobile ? "w-2.5 h-2.5" : "w-3 h-3"}`} />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <svg width={isMobile ? 11 : 13} height={isMobile ? 11 : 13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                  </svg>
                  Notlarıma Ekle
                </>
              )}
            </button>
          </>
        )}
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
