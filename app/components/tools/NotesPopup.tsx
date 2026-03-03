"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { getUserNotes, deleteUserNote, type UserNote } from "@/lib/db/conversations";

interface NotesPopupProps {
  onClose: () => void;
  inline?: boolean;
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Az once";
  if (mins < 60) return `${mins}dk once`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}sa once`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}g once`;
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export default function NotesPopup({ onClose, inline }: NotesPopupProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserNotes(user.id);
      setNotes(data);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDelete = async (noteId: string) => {
    setDeletingId(noteId);
    try {
      await deleteUserNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err) {
      console.error("Failed to delete note:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={inline ? "" : "tool-popup tool-popup-notes"} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Notlarım
        </h3>
        <div className="flex items-center gap-1">
          <button onClick={fetchNotes} className="flex items-center justify-center w-6 h-6 rounded-md transition-all hover:bg-[var(--bg-tertiary)]"
            style={{ color: "var(--text-tertiary)" }} title="Yenile">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
          <button onClick={onClose} className="flex items-center justify-center w-6 h-6 rounded-md transition-all hover:bg-[var(--bg-tertiary)]"
            style={{ color: "var(--text-tertiary)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notes list */}
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border-primary)", borderTopColor: "var(--accent-primary)" }} />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center py-6 gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-tertiary)", opacity: 0.4 }}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Henuz not eklenmemis
            </span>
            <span className="text-[10px]" style={{ color: "var(--text-tertiary)", opacity: 0.6 }}>
              Metin secip &quot;Notlarıma Ekle&quot; ile kaydedin
            </span>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="group rounded-lg p-2.5 transition-all"
              style={{ background: "var(--bg-tertiary)", border: "1px solid transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; }}
            >
              <p className="text-[11px] leading-relaxed mb-1.5" style={{ color: "var(--text-primary)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {note.content}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                  {note.source_page} · {relativeTime(note.created_at)}
                </span>
                <button
                  onClick={() => handleDelete(note.id)}
                  disabled={deletingId === note.id}
                  className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-5 h-5 rounded transition-all hover:bg-[var(--accent-danger-light)]"
                  style={{ color: "var(--text-tertiary)" }}
                  title="Notu sil"
                >
                  {deletingId === note.id ? (
                    <div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer count */}
      {!loading && notes.length > 0 && (
        <div className="mt-2 pt-2 text-center" style={{ borderTop: "1px solid var(--border-secondary)" }}>
          <span className="text-[10px] font-semibold" style={{ color: "var(--text-tertiary)" }}>
            {notes.length} not
          </span>
        </div>
      )}
    </div>
  );
}
