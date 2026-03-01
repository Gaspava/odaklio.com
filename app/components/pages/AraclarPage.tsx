"use client";

import {
  IconFlashcard,
  IconMindMap,
  IconSpeedRead,
  IconPomodoro,
  IconHelp,
  IconBrain,
  IconChevronRight,
} from "../icons/Icons";

const tools = [
  {
    id: "flashcard",
    name: "Flashcard",
    desc: "Kartlarla etkili tekrar yap",
    icon: <IconFlashcard size={22} />,
    color: "#f59e0b",
    stats: "48 kart",
  },
  {
    id: "mindmap",
    name: "Mind Map",
    desc: "Görsel haritalar oluştur",
    icon: <IconMindMap size={22} />,
    color: "#8b5cf6",
    stats: "5 harita",
  },
  {
    id: "speed-read",
    name: "Hızlı Okuma",
    desc: "Okuma hızını geliştir",
    icon: <IconSpeedRead size={22} />,
    color: "#3b82f6",
    stats: "320 wpm",
  },
  {
    id: "pomodoro",
    name: "Pomodoro",
    desc: "Odaklı çalışma zamanlayıcısı",
    icon: <IconPomodoro size={22} />,
    color: "#10b981",
    stats: "4/6 bugün",
  },
  {
    id: "quiz",
    name: "Quiz",
    desc: "Kendini test et",
    icon: <IconHelp size={22} />,
    color: "#ef4444",
    stats: "12 quiz",
  },
  {
    id: "notes",
    name: "Akıllı Notlar",
    desc: "AI destekli not tutma",
    icon: <IconBrain size={22} />,
    color: "#06b6d4",
    stats: "23 not",
  },
];

export default function AraclarPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
        {/* Page Header */}
        <div>
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Araçlar
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Öğrenme araçlarınız
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-2 gap-3">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className="text-left rounded-xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98] group"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: `${tool.color}12`, color: tool.color }}
                >
                  {tool.icon}
                </div>
                <IconChevronRight
                  size={14}
                  style={{ color: "var(--text-tertiary)", opacity: 0 }}
                  className="group-hover:opacity-100 transition-opacity"
                />
              </div>
              <h3 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                {tool.name}
              </h3>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                {tool.desc}
              </p>
              <div className="mt-3 pt-2" style={{ borderTop: "1px solid var(--border-secondary)" }}>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${tool.color}10`, color: tool.color }}
                >
                  {tool.stats}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
