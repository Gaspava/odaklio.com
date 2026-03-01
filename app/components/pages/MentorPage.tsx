"use client";

import { useState } from "react";
import { IconSend, IconMentor } from "../icons/Icons";

const modes = [
  {
    id: "psikolog",
    name: "Psikolog",
    emoji: "🧠",
    desc: "Duygularını anla, stresle başa çık",
    greeting: "Merhaba! Seni dinliyorum. Bugün nasıl hissediyorsun?",
    color: "#8b5cf6",
  },
  {
    id: "abi",
    name: "Abi/Abla",
    emoji: "💪",
    desc: "Samimi tavsiyeler, motivasyon",
    greeting: "Selam! Anlat bakalım, bugün ne var ne yok?",
    color: "#3b82f6",
  },
  {
    id: "ogretmen",
    name: "Öğretmen",
    emoji: "📚",
    desc: "Akademik rehberlik ve planlama",
    greeting: "Hoş geldin! Hangi konuda çalışmak istiyorsun?",
    color: "#10b981",
  },
  {
    id: "koc",
    name: "Koç",
    emoji: "🎯",
    desc: "Hedef belirleme, disiplin",
    greeting: "Hazır mısın? Bugünün hedeflerini birlikte belirleyelim!",
    color: "#f59e0b",
  },
];

const demoMessages = [
  { role: "ai" as const, text: "" },
  { role: "user" as const, text: "Sınavlara çalışırken çok stresli hissediyorum" },
  { role: "ai" as const, text: "Bu çok normal bir duygu. Sınav stresi herkesin yaşadığı bir şey. Sana birkaç soru sormak istiyorum - stresini en çok ne tetikliyor? Zaman yetersizliği mi, konu anlamama korkusu mu?" },
];

export default function MentorPage() {
  const [activeMode, setActiveMode] = useState("psikolog");
  const [input, setInput] = useState("");

  const currentMode = modes.find((m) => m.id === activeMode)!;
  const messages = [{ role: "ai" as const, text: currentMode.greeting }, ...demoMessages.slice(1)];

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
          {/* Page Header */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white"
              style={{ background: currentMode.color }}
            >
              <IconMentor size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                AI Mentor
              </h1>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                Seninle konuşmaya hazır
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className="flex-shrink-0 flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all"
                style={{
                  background: activeMode === mode.id ? `${mode.color}15` : "var(--bg-card)",
                  border: activeMode === mode.id
                    ? `1px solid ${mode.color}30`
                    : "1px solid var(--border-primary)",
                }}
              >
                <span className="text-base">{mode.emoji}</span>
                <div className="text-left">
                  <span
                    className="text-[11px] font-bold block"
                    style={{ color: activeMode === mode.id ? mode.color : "var(--text-primary)" }}
                  >
                    {mode.name}
                  </span>
                  <span className="text-[9px] block" style={{ color: "var(--text-tertiary)" }}>
                    {mode.desc}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Chat Area */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              minHeight: 300,
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-2.5"
                  style={{
                    background:
                      msg.role === "user"
                        ? "var(--gradient-primary)"
                        : "var(--bg-tertiary)",
                    color: msg.role === "user" ? "white" : "var(--text-primary)",
                    borderBottomRightRadius: msg.role === "user" ? 6 : undefined,
                    borderBottomLeftRadius: msg.role === "ai" ? 6 : undefined,
                  }}
                >
                  <p className="text-[12px] leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div
        className="flex-shrink-0 p-4 sm:px-6"
        style={{ borderTop: "1px solid var(--border-primary)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${currentMode.name} ile konuş...`}
            className="flex-1 h-10 rounded-xl px-4 text-xs outline-none transition-all"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            }}
          />
          <button
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all active:scale-95"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "var(--shadow-glow-sm)",
            }}
          >
            <IconSend size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
