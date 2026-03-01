"use client";

import {
  IconHistory,
  IconWrench,
  IconFocus,
  IconMentor,
  IconBarChart,
} from "../icons/Icons";

export type LearningTab =
  | "gecmis"
  | "araclar"
  | "odaklan"
  | "mentor"
  | "analiz";

interface LearningMenuProps {
  activeTab: LearningTab;
  onTabChange: (tab: LearningTab) => void;
}

const tabs: {
  id: LearningTab;
  label: string;
  icon: (size: number) => React.ReactNode;
  isCenter?: boolean;
}[] = [
  {
    id: "gecmis",
    label: "Sohbetlerim",
    icon: (s) => <IconHistory size={s} />,
  },
  {
    id: "araclar",
    label: "Araclar",
    icon: (s) => <IconWrench size={s} />,
  },
  {
    id: "odaklan",
    label: "Odaklan",
    icon: (s) => <IconFocus size={s} />,
    isCenter: true,
  },
  {
    id: "mentor",
    label: "Mentor",
    icon: (s) => <IconMentor size={s} />,
  },
  {
    id: "analiz",
    label: "Analiz",
    icon: (s) => <IconBarChart size={s} />,
  },
];

export default function LearningMenu({
  activeTab,
  onTabChange,
}: LearningMenuProps) {
  return (
    <nav
      className="flex items-end justify-center gap-1 px-2 sm:px-4 py-2 flex-shrink-0 relative"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-primary)",
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isCenter = tab.isCenter;

        if (isCenter) {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center mx-1 sm:mx-3 transition-all active:scale-95 relative"
              style={{
                minWidth: 72,
              }}
            >
              {/* Center glow ring */}
              <div
                className="flex items-center justify-center rounded-2xl transition-all"
                style={{
                  width: 52,
                  height: 52,
                  background: isActive
                    ? "var(--gradient-primary)"
                    : "var(--bg-tertiary)",
                  boxShadow: isActive ? "var(--shadow-glow)" : "var(--shadow-sm)",
                  border: isActive
                    ? "2px solid rgba(16, 185, 129, 0.3)"
                    : "1px solid var(--border-primary)",
                  color: isActive ? "#ffffff" : "var(--text-tertiary)",
                }}
              >
                {tab.icon(22)}
              </div>
              <span
                className="text-[10px] sm:text-[11px] font-bold mt-1.5 tracking-wide"
                style={{
                  color: isActive
                    ? "var(--accent-primary)"
                    : "var(--text-tertiary)",
                }}
              >
                {tab.label}
              </span>
              {isActive && (
                <div
                  className="absolute -bottom-2 w-8 h-0.5 rounded-full"
                  style={{
                    background: "var(--gradient-primary)",
                    boxShadow: "var(--shadow-glow-sm)",
                  }}
                />
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col items-center justify-center transition-all active:scale-95 relative"
            style={{
              minWidth: 56,
              padding: "4px 8px",
            }}
          >
            <div
              className="flex items-center justify-center rounded-xl transition-all"
              style={{
                width: 38,
                height: 38,
                background: isActive
                  ? "var(--accent-primary-light)"
                  : "transparent",
                color: isActive
                  ? "var(--accent-primary)"
                  : "var(--text-tertiary)",
                border: isActive
                  ? "1px solid rgba(16, 185, 129, 0.15)"
                  : "1px solid transparent",
              }}
            >
              {tab.icon(16)}
            </div>
            <span
              className="text-[9px] sm:text-[10px] font-semibold mt-1 whitespace-nowrap"
              style={{
                color: isActive
                  ? "var(--accent-primary)"
                  : "var(--text-tertiary)",
              }}
            >
              {tab.label}
            </span>
            {isActive && (
              <div
                className="absolute -bottom-2 w-6 h-0.5 rounded-full"
                style={{ background: "var(--accent-primary)" }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
