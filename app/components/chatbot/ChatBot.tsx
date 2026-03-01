"use client";

import { useState, useRef, useEffect } from "react";
import { IconChat, IconSend, IconX, IconMic, IconHelp } from "../icons/Icons";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  hasDidntUnderstand?: boolean;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Merhaba! Ben Odaklio AI asistanınım. Herhangi bir konuda soru sorabilir, anlamadığın yerleri işaretleyebilir veya paralel sorular sorabilirsin. Nasıl yardımcı olabilirim?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulated AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Bu konuyla ilgili size yardımcı olabilirim. İlgili kaynakları inceliyorum ve en uygun açıklamayı hazırlıyorum...",
        timestamp: new Date(),
        hasDidntUnderstand: true,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  const handleDidntUnderstand = (msgId: string) => {
    const aiMsg: Message = {
      id: (Date.now() + 2).toString(),
      role: "assistant",
      content:
        "Anlaşıldı! Daha basit bir şekilde açıklayayım. Bu konuyu adım adım, görsellerle birlikte ele alalım...",
      timestamp: new Date(),
      hasDidntUnderstand: true,
    };
    setMessages((prev) => [...prev, aiMsg]);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-105"
          style={{
            background: "var(--gradient-primary)",
            boxShadow: "var(--shadow-glow)",
          }}
        >
          <IconChat size={24} />
          {/* Pulse Ring */}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: "var(--gradient-primary)",
              animation: "pulse-ring 2s ease-out infinite",
            }}
          />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl animate-slide-up"
          style={{
            width: 400,
            height: 560,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3.5"
            style={{
              background: "var(--gradient-primary)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <IconChat size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Odaklio AI
                </h3>
                <span className="text-xs text-white/70">Çevrimiçi</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <IconX size={18} />
            </button>
          </div>

          {/* Parallel Question Bar */}
          <div
            className="flex items-center gap-2 px-4 py-2 text-xs"
            style={{
              background: "var(--bg-tertiary)",
              borderBottom: "1px solid var(--border-primary)",
              color: "var(--text-tertiary)",
            }}
          >
            <IconHelp size={14} />
            <span>
              Bir konunun üzerine gelip{" "}
              <strong style={{ color: "var(--accent-primary)" }}>
                &quot;Anlamadım&quot;
              </strong>{" "}
              diyebilir veya paralel soru sorabilirsin
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className="group relative max-w-[85%] rounded-2xl px-4 py-2.5"
                  style={{
                    background:
                      msg.role === "user"
                        ? "var(--accent-primary)"
                        : "var(--bg-card)",
                    color:
                      msg.role === "user" ? "white" : "var(--text-primary)",
                    border:
                      msg.role === "assistant"
                        ? "1px solid var(--border-primary)"
                        : "none",
                    borderRadius:
                      msg.role === "user"
                        ? "20px 20px 4px 20px"
                        : "20px 20px 20px 4px",
                  }}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>

                  {/* "Anlamadım" Button - appears on hover for AI messages */}
                  {msg.role === "assistant" && msg.hasDidntUnderstand && (
                    <button
                      onClick={() => handleDidntUnderstand(msg.id)}
                      className="mt-2 flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
                      style={{
                        background: "var(--accent-warning-light)",
                        color: "var(--accent-warning)",
                      }}
                    >
                      <IconHelp size={12} />
                      Anlamadım, daha basit açıkla
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div
            className="flex gap-2 overflow-x-auto px-4 py-2"
            style={{ borderTop: "1px solid var(--border-secondary)" }}
          >
            {["Bu konuyu özetle", "Soru sor", "Görselleştir"].map((chip) => (
              <button
                key={chip}
                onClick={() => setInput(chip)}
                className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background: "var(--accent-primary-light)",
                  color: "var(--accent-primary)",
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <div
            className="flex items-center gap-2 p-3"
            style={{
              borderTop: "1px solid var(--border-primary)",
              background: "var(--bg-secondary)",
            }}
          >
            <button
              onClick={() => setIsListening(!isListening)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all"
              style={{
                background: isListening
                  ? "var(--accent-danger)"
                  : "var(--bg-tertiary)",
                color: isListening ? "white" : "var(--text-tertiary)",
              }}
            >
              <IconMic size={16} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Mesajını yaz..."
              className="input"
              style={{ height: 38, fontSize: 13 }}
            />
            <button
              onClick={handleSend}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all hover:opacity-90"
              style={{ background: "var(--gradient-primary)" }}
            >
              <IconSend size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
