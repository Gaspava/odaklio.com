"use client";

import { useState } from "react";
import { IconMentor, IconX, IconSend, IconStar, IconLightning } from "../icons/Icons";

interface MentorTip {
  id: string;
  type: "tip" | "question" | "encouragement";
  content: string;
}

const initialTips: MentorTip[] = [
  {
    id: "1",
    type: "tip",
    content:
      "Pomodoro tekniğini kullanarak çalışman, odaklanmanı %40 artırabilir. Denemek ister misin?",
  },
  {
    id: "2",
    type: "question",
    content:
      "Son okuduğun konudaki 3 ana fikri kendi cümlelerinle ifade edebilir misin?",
  },
  {
    id: "3",
    type: "encouragement",
    content:
      "Harika gidiyorsun! 7 günlük streak'ini koruyorsun. Bugün de hedefini tamamla!",
  },
];

export default function MentorBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [tips] = useState<MentorTip[]>(initialTips);
  const [mentorInput, setMentorInput] = useState("");

  const getTypeStyle = (type: MentorTip["type"]) => {
    switch (type) {
      case "tip":
        return {
          bg: "var(--accent-primary-light)",
          color: "var(--accent-primary)",
          icon: <IconLightning size={14} />,
          label: "İpucu",
        };
      case "question":
        return {
          bg: "var(--accent-secondary-light)",
          color: "var(--accent-secondary)",
          icon: <IconStar size={14} />,
          label: "Soru",
        };
      case "encouragement":
        return {
          bg: "var(--accent-success-light)",
          color: "var(--accent-success)",
          icon: <IconStar size={14} />,
          label: "Motivasyon",
        };
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 z-50 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 hover:scale-105"
        style={{
          background: "var(--gradient-success)",
          boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)",
        }}
      >
        <IconMentor size={20} className="text-white" />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-24 z-50 flex flex-col overflow-hidden rounded-2xl animate-slide-up"
      style={{
        width: 340,
        maxHeight: 480,
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-primary)",
        boxShadow: "var(--shadow-xl)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{
          background: "var(--gradient-success)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <IconMentor size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Mentor</h3>
            <span className="text-[11px] text-white/70">
              Öğrenme rehberin
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white"
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Tips */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {tips.map((tip) => {
          const style = getTypeStyle(tip.type);
          return (
            <div
              key={tip.id}
              className="rounded-xl p-3.5 animate-fade-in"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{ background: style.bg, color: style.color }}
                >
                  {style.icon}
                  {style.label}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {tip.content}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  className="rounded-lg px-3 py-1.5 text-xs font-medium"
                  style={{
                    background: style.bg,
                    color: style.color,
                  }}
                >
                  Kabul et
                </button>
                <button
                  className="rounded-lg px-3 py-1.5 text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Sonra
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 p-3"
        style={{
          borderTop: "1px solid var(--border-primary)",
        }}
      >
        <input
          type="text"
          value={mentorInput}
          onChange={(e) => setMentorInput(e.target.value)}
          placeholder="Mentora sor..."
          className="input"
          style={{ height: 36, fontSize: 13 }}
        />
        <button
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white"
          style={{ background: "var(--accent-success)" }}
        >
          <IconSend size={14} />
        </button>
      </div>
    </div>
  );
}
