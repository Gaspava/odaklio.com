"use client";

interface NewChatPopupProps {
  onSelectMode: (mode: string) => void;
  onClose: () => void;
}

const modes = [
  { id: "standard", name: "Standart Sohbet", desc: "Klasik AI sohbet deneyimi", color: "#10b981" },
  { id: "mindmap", name: "Mindmap Chat", desc: "2D paralel sohbet haritasi", color: "#8b5cf6" },
  { id: "flashcard", name: "Flashcard", desc: "AI destekli hafiza kartlari", color: "#f59e0b" },
  { id: "roadmap", name: "Roadmap", desc: "Adim adim ogrenme plani", color: "#ef4444" },
];

export default function NewChatPopup({ onSelectMode, onClose }: NewChatPopupProps) {
  return (
    <div className="tool-popup tool-popup-new-chat" onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
          Yeni Sohbet
        </h3>
        <button onClick={onClose} className="flex items-center justify-center w-6 h-6 rounded-md transition-all hover:bg-[var(--bg-tertiary)]"
          style={{ color: "var(--text-tertiary)" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mode Cards */}
      <div className="space-y-1.5">
        {modes.map((mode) => (
          <button key={mode.id}
            onClick={() => { onSelectMode(mode.id); onClose(); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all active:scale-[0.98]"
            style={{ background: "transparent", color: "var(--text-secondary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${mode.color}12`;
              e.currentTarget.style.borderColor = `${mode.color}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "transparent";
            }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
              style={{ background: `${mode.color}15`, color: mode.color }}>
              {mode.id === "standard" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              )}
              {mode.id === "mindmap" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              )}
              {mode.id === "flashcard" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M12 8v8" /><path d="M8 12h8" />
                </svg>
              )}
              {mode.id === "roadmap" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              )}
            </div>
            <div className="flex-1 text-left">
              <span className="text-[12px] font-semibold block" style={{ color: "var(--text-primary)" }}>{mode.name}</span>
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{mode.desc}</span>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 flex-shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
