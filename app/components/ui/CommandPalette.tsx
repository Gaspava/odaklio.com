"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon: string;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  onNewChat: () => void;
  onNavigate: (page: "history" | "tools" | "focus" | "mentor" | "analysis") => void;
  onToggleTheme: () => void;
}

export default function CommandPalette({
  onNewChat,
  onNavigate,
  onToggleTheme,
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    {
      id: "new-chat",
      label: "Yeni Sohbet",
      description: "Yeni bir öğrenme sohbeti başlat",
      shortcut: "Ctrl+N",
      icon: "💬",
      category: "Eylemler",
      action: () => { onNewChat(); setOpen(false); },
    },
    {
      id: "go-focus",
      label: "Odak Sayfası",
      description: "Ana sohbet arayüzüne git",
      shortcut: "Ctrl+1",
      icon: "🎯",
      category: "Navigasyon",
      action: () => { onNavigate("focus"); setOpen(false); },
    },
    {
      id: "go-history",
      label: "Geçmiş",
      description: "Önceki sohbetlere bak",
      shortcut: "Ctrl+2",
      icon: "📜",
      category: "Navigasyon",
      action: () => { onNavigate("history"); setOpen(false); },
    },
    {
      id: "go-tools",
      label: "Araçlar",
      description: "Flashcard, notlar ve roadmap",
      shortcut: "Ctrl+3",
      icon: "🛠️",
      category: "Navigasyon",
      action: () => { onNavigate("tools"); setOpen(false); },
    },
    {
      id: "go-mentor",
      label: "Mentor",
      description: "AI mentorlarla konuş",
      shortcut: "Ctrl+4",
      icon: "👨‍🏫",
      category: "Navigasyon",
      action: () => { onNavigate("mentor"); setOpen(false); },
    },
    {
      id: "go-analysis",
      label: "Analiz",
      description: "Öğrenme istatistiklerini görüntüle",
      shortcut: "Ctrl+5",
      icon: "📊",
      category: "Navigasyon",
      action: () => { onNavigate("analysis"); setOpen(false); },
    },
    {
      id: "toggle-theme",
      label: "Tema Değiştir",
      description: "Açık/koyu mod arasında geçiş yap",
      shortcut: "Ctrl+Shift+T",
      icon: "🌓",
      category: "Görünüm",
      action: () => { onToggleTheme(); setOpen(false); },
    },
  ];

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          (c.description || "").toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  // Group by category
  const categories = Array.from(new Set(filtered.map((c) => c.category)));

  const flatFiltered = filtered;

  useEffect(() => {
    setSelectedIdx(0);
  }, [query]);

  // Keyboard: open with Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Arrow key navigation & Enter to execute
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, flatFiltered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        flatFiltered[selectedIdx]?.action();
      }
    },
    [flatFiltered, selectedIdx]
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-start justify-center pt-[15vh]"
      style={{ background: "var(--bg-overlay)" }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-msg-in"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-xl)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ borderBottom: "1px solid var(--border-primary)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Komut ara veya sayfaya git..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
          <kbd
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            Esc
          </kbd>
        </div>

        {/* Commands list */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: "var(--text-tertiary)" }}>
              Komut bulunamadı
            </div>
          ) : (
            categories.map((cat) => {
              const items = filtered.filter((c) => c.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <div
                    className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {cat}
                  </div>
                  {items.map((cmd) => {
                    const globalIdx = flatFiltered.indexOf(cmd);
                    const isSelected = selectedIdx === globalIdx;
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIdx(globalIdx)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 transition-all"
                        style={{
                          background: isSelected ? "var(--accent-primary-light)" : "transparent",
                          color: isSelected ? "var(--accent-primary)" : "var(--text-primary)",
                        }}
                      >
                        <span className="text-base w-6 text-center flex-shrink-0">{cmd.icon}</span>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium">{cmd.label}</p>
                          {cmd.description && (
                            <p className="text-[11px]" style={{ color: isSelected ? "var(--accent-primary)" : "var(--text-tertiary)", opacity: 0.8 }}>
                              {cmd.description}
                            </p>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <kbd
                            className="text-[9px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{
                              background: isSelected ? "rgba(16,185,129,0.15)" : "var(--bg-tertiary)",
                              color: isSelected ? "var(--accent-primary)" : "var(--text-tertiary)",
                            }}
                          >
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div
          className="px-4 py-2.5 flex items-center gap-4 text-[10px]"
          style={{
            borderTop: "1px solid var(--border-primary)",
            color: "var(--text-tertiary)",
          }}
        >
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded" style={{ background: "var(--bg-tertiary)" }}>↑↓</kbd>
            Seç
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded" style={{ background: "var(--bg-tertiary)" }}>Enter</kbd>
            Çalıştır
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded" style={{ background: "var(--bg-tertiary)" }}>Esc</kbd>
            Kapat
          </span>
        </div>
      </div>
    </div>
  );
}
