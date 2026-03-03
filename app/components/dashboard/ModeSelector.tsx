"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  IconChat,
  IconMindMap,
  IconFlashcard,
  IconRoadmap,
  IconSpeedRead,
  IconPomodoro,
  IconSend,
} from "../icons/Icons";

interface ModeSelectorProps {
  onSelectMode: (mode: string) => void;
  onNavigateToPage?: (page: string) => void;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Günaydın";
  if (hour >= 12 && hour < 18) return "İyi Günler";
  return "İyi Akşamlar";
}

const features = [
  {
    id: "standard",
    name: "Standart Sohbet",
    desc: "Klasik AI sohbet deneyimi",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    type: "mode" as const,
  },
  {
    id: "mindmap",
    name: "Mindmap Chat",
    desc: "Görsel düşünce haritası",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    type: "mode" as const,
  },
  {
    id: "flashcard",
    name: "Flashcard",
    desc: "AI destekli hafıza kartları",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    type: "mode" as const,
  },
  {
    id: "roadmap",
    name: "Roadmap",
    desc: "Adım adım öğrenme planı",
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    type: "mode" as const,
  },
  {
    id: "speedread",
    name: "Hızlı Okuma",
    desc: "Okuma hızını geliştir",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    type: "tool" as const,
  },
  {
    id: "pomodoro",
    name: "Pomodoro",
    desc: "Zamanlı odak seansı",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    type: "tool" as const,
  },
];

const featureIcons: Record<
  string,
  React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>
> = {
  standard: IconChat,
  mindmap: IconMindMap,
  flashcard: IconFlashcard,
  roadmap: IconRoadmap,
  speedread: IconSpeedRead,
  pomodoro: IconPomodoro,
};

const chatModes = features.filter((f) => f.type === "mode");

export default function ModeSelector({ onSelectMode, onNavigateToPage }: ModeSelectorProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [showModePicker, setShowModePicker] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const displayName = user?.user_metadata?.full_name?.split(" ")[0] || "Öğrenci";
  const greeting = getGreeting();

  // Close picker on outside click
  useEffect(() => {
    if (!showModePicker) return;
    const handleClick = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowModePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showModePicker]);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      setShowModePicker(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleModeFromPicker = (mode: string) => {
    setShowModePicker(false);
    setInputValue("");
    onSelectMode(mode);
  };

  const handleCardClick = (feature: (typeof features)[0]) => {
    if (feature.type === "tool") {
      onNavigateToPage?.("tools");
    } else {
      onSelectMode(feature.id);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-4 py-8 overflow-y-auto"
      style={{ background: "var(--bg-primary)" }}
    >
      <div style={{ maxWidth: 720, width: "100%" }}>
        {/* Greeting */}
        <div className="text-center mb-6 animate-fade-in">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {greeting},{" "}
            <span
              style={{
                background: "var(--gradient-hero)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {displayName}
            </span>
          </h1>
          <p
            className="text-sm sm:text-base"
            style={{ color: "var(--text-tertiary)" }}
          >
            Öğrenme yolculuğuna devam et. AI destekli araçlarla hızlıca başla.
          </p>
        </div>

        {/* Input Area */}
        <div
          className="relative mb-8 animate-fade-in"
          style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
          ref={pickerRef}
        >
          <div
            className="relative rounded-2xl overflow-hidden transition-all"
            style={{
              background: "var(--bg-card)",
              border: showModePicker
                ? "1px solid var(--accent-primary)"
                : "1px solid var(--border-primary)",
              boxShadow: showModePicker
                ? "var(--shadow-glow), var(--shadow-lg)"
                : "var(--shadow-md)",
            }}
          >
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Konu, soru veya öğrenmek istediğin bir şey yaz..."
              rows={3}
              className="w-full resize-none bg-transparent px-5 pt-4 pb-14 text-sm outline-none"
              style={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
              }}
            />
            <div className="absolute bottom-3 left-5 right-3 flex items-center justify-between">
              <span
                className="text-[11px] hidden sm:inline"
                style={{ color: "var(--text-tertiary)" }}
              >
                Enter ile mod seç
              </span>
              <button
                onClick={handleSubmit}
                disabled={!inputValue.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all active:scale-95 ml-auto"
                style={{
                  background: inputValue.trim()
                    ? "var(--gradient-primary)"
                    : "var(--bg-tertiary)",
                  boxShadow: inputValue.trim()
                    ? "var(--shadow-glow-sm)"
                    : "none",
                  color: inputValue.trim() ? "white" : "var(--text-tertiary)",
                  cursor: inputValue.trim() ? "pointer" : "default",
                }}
              >
                <IconSend size={16} />
              </button>
            </div>
          </div>

          {/* Mode Picker Popup */}
          {showModePicker && (
            <div
              className="absolute left-0 right-0 top-full mt-2 z-50 animate-fade-in"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-xl)",
                padding: "16px",
              }}
            >
              <p
                className="text-xs font-semibold mb-3"
                style={{ color: "var(--text-tertiary)" }}
              >
                Hangi modda devam etmek istersin?
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {chatModes.map((mode) => {
                  const Icon = featureIcons[mode.id];
                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleModeFromPicker(mode.id)}
                      className="flex flex-col items-center gap-2 rounded-xl p-3 transition-all active:scale-95"
                      style={{
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-secondary)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = mode.color + "60";
                        e.currentTarget.style.boxShadow = `0 4px 16px ${mode.color}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-secondary)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ background: mode.gradient }}
                      >
                        <Icon size={18} style={{ color: "white" }} />
                      </div>
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {mode.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div
          className="dashboard-home-grid animate-fade-in"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            animationDelay: "0.2s",
            animationFillMode: "backwards",
          }}
        >
          {features.map((feature, index) => {
            const Icon = featureIcons[feature.id];
            const isHovered = hoveredId === feature.id;

            return (
              <button
                key={feature.id}
                onClick={() => handleCardClick(feature)}
                onMouseEnter={() => setHoveredId(feature.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="animate-fade-in"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "20px",
                  borderRadius: "var(--radius-xl)",
                  background: "var(--bg-card)",
                  border: `1px solid ${isHovered ? feature.color + "40" : "var(--border-primary)"}`,
                  cursor: "pointer",
                  transition: "var(--transition-normal)",
                  transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                  boxShadow: isHovered
                    ? `0 8px 32px ${feature.color}15, 0 0 0 1px ${feature.color}10`
                    : "var(--shadow-card)",
                  animationDelay: `${0.25 + index * 0.05}s`,
                  animationFillMode: "backwards",
                  textAlign: "left",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-lg)",
                    background: feature.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isHovered
                      ? `0 4px 16px ${feature.color}30`
                      : `0 2px 8px ${feature.color}15`,
                    transition: "var(--transition-normal)",
                  }}
                >
                  <Icon size={20} style={{ color: "white" }} />
                </div>

                {/* Title */}
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {feature.name}
                </span>

                {/* Description */}
                <span
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {feature.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        .dashboard-home-grid textarea::placeholder {
          color: var(--text-tertiary);
        }
        @media (max-width: 768px) {
          .dashboard-home-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
