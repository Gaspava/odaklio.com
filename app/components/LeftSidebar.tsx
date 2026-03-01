"use client";
import PomodoroTimer from "./PomodoroTimer";
import FlashCards from "./FlashCards";
import SpeedReader from "./SpeedReader";
import MindMap from "./MindMap";
import FocusMode from "./FocusMode";
import BackgroundSounds from "./BackgroundSounds";
import CalendarPanel from "./CalendarPanel";
import StatsPanel from "./StatsPanel";

export type PanelType =
  | "pomodoro"
  | "flashcards"
  | "speedreader"
  | "mindmap"
  | "focus"
  | "sounds"
  | "calendar"
  | "stats"
  | null;

interface Props {
  activePanel: PanelType;
  setActivePanel: (p: PanelType) => void;
}

const NAV_ITEMS: { id: PanelType; label: string; icon: React.ReactNode }[] = [
  {
    id: "pomodoro",
    label: "Pomodoro",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "flashcards",
    label: "Flash Kartlar",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
  },
  {
    id: "speedreader",
    label: "Hizli Okuma",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    id: "mindmap",
    label: "Zihin Haritasi",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <circle cx="4" cy="6" r="2" />
        <circle cx="20" cy="6" r="2" />
        <circle cx="4" cy="18" r="2" />
        <circle cx="20" cy="18" r="2" />
        <line x1="9.5" y1="10.5" x2="5.5" y2="7.5" />
        <line x1="14.5" y1="10.5" x2="18.5" y2="7.5" />
        <line x1="9.5" y1="13.5" x2="5.5" y2="16.5" />
        <line x1="14.5" y1="13.5" x2="18.5" y2="16.5" />
      </svg>
    ),
  },
  {
    id: "focus",
    label: "Odak Modlari",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: "sounds",
    label: "Arka Plan Sesleri",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    id: "calendar",
    label: "Takvim & Gorevler",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "stats",
    label: "Istatistikler",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

const PANELS: Record<string, () => React.ReactNode> = {
  pomodoro: () => <PomodoroTimer />,
  flashcards: () => <FlashCards />,
  speedreader: () => <SpeedReader />,
  mindmap: () => <MindMap />,
  focus: () => <FocusMode />,
  sounds: () => <BackgroundSounds />,
  calendar: () => <CalendarPanel />,
  stats: () => <StatsPanel />,
};

export default function LeftSidebar({ activePanel, setActivePanel }: Props) {
  const toggle = (id: PanelType) => {
    setActivePanel(activePanel === id ? null : id);
  };

  const PanelComponent = activePanel ? PANELS[activePanel] : null;
  const isWide = activePanel === "mindmap";

  return (
    <div className="flex h-full shrink-0">
      {/* Icon bar */}
      <div
        className="flex w-[56px] flex-col items-center gap-1 border-r py-3"
        style={{ backgroundColor: "var(--bg-sidebar)", borderColor: "var(--border-color)" }}
      >
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(item.id)}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all"
            style={{
              backgroundColor: activePanel === item.id ? "var(--accent-light)" : "transparent",
              color: activePanel === item.id ? "var(--accent)" : "var(--text-tertiary)",
            }}
            title={item.label}
          >
            {item.icon}
            {/* Active indicator */}
            {activePanel === item.id && (
              <div
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r"
                style={{ backgroundColor: "var(--accent)" }}
              />
            )}
            {/* Tooltip */}
            <div
              className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-medium opacity-0 transition-all group-hover:opacity-100"
              style={{
                backgroundColor: "var(--bg-card)",
                color: "var(--text-primary)",
                boxShadow: "var(--shadow-lg)",
                border: "1px solid var(--border-color)",
              }}
            >
              {item.label}
            </div>
          </button>
        ))}
      </div>

      {/* Panel content */}
      {PanelComponent && (
        <div
          className="flex h-full flex-col overflow-hidden border-r"
          style={{
            width: isWide ? "500px" : "320px",
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <PanelComponent />
        </div>
      )}
    </div>
  );
}
