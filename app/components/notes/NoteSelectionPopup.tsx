"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { saveUserNoteToDb } from "@/lib/db/conversations";

// Page name mapping based on URL path
function getSourcePage(): string {
  const path = window.location.pathname;
  if (path.startsWith("/chat/")) return "Odak";
  if (path === "/") return "Ana Sayfa";
  return "Sayfa";
}

export default function NoteSelectionPopup() {
  const { user } = useAuth();
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Don't show if clicking on the popup itself
      if (popupRef.current?.contains(e.target as Node)) return;

      // Don't show inside elements that have their own selection popup
      const target = e.target as HTMLElement;
      if (target.closest("[data-no-note-popup]")) {
        setSelection(null);
        return;
      }

      // Don't show inside input/textarea elements
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        setSelection(null);
        return;
      }

      // Small delay to let selection finalize
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.toString().trim().length < 3) {
          setSelection(null);
          return;
        }

        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelection({
          text: sel.toString().trim(),
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
        setSaved(false);
      }, 10);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Dismiss popup when clicking outside it
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setSelection(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const handleSave = useCallback(async () => {
    if (!user || !selection || saving) return;
    setSaving(true);
    try {
      await saveUserNoteToDb(user.id, selection.text, getSourcePage());
      setSaved(true);
      setTimeout(() => {
        setSelection(null);
        setSaved(false);
      }, 1200);
    } catch (err) {
      console.error("Failed to save note:", err);
    } finally {
      setSaving(false);
    }
  }, [user, selection, saving]);

  if (!selection || !user) return null;

  // Position: above the selection, centered
  const popupStyle: React.CSSProperties = {
    position: "fixed",
    left: Math.max(20, Math.min(selection.x - 75, window.innerWidth - 170)),
    top: Math.max(8, selection.y - 44),
    zIndex: 9999,
    transform: "translateY(-100%)",
  };

  return (
    <div ref={popupRef} style={popupStyle} className="animate-msg-in">
      <button
        onClick={handleSave}
        disabled={saving || saved}
        className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-[12px] font-semibold transition-all active:scale-95 shadow-lg"
        style={{
          background: saved ? "rgba(16, 185, 129, 0.95)" : "var(--bg-card)",
          border: saved ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-primary)",
          color: saved ? "white" : "var(--text-primary)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        {saved ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Kaydedildi!
          </>
        ) : saving ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Kaydediliyor...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            Notlarima Ekle
          </>
        )}
      </button>
    </div>
  );
}
