"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
}

function SendIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function BotAvatar() {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
      style={{ background: "var(--accent-gradient)" }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 8V4H8" />
        <rect x="2" y="8" width="20" height="14" rx="2" />
        <path d="M6 16h.01" />
        <path d="M18 16h.01" />
        <path d="M10 20v-4h4v4" />
      </svg>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <BotAvatar />
      <div
        className="flex items-center gap-1 rounded-2xl rounded-tl-sm px-4 py-3"
        style={{ backgroundColor: "var(--bg-message-bot)" }}
      >
        <span
          className="inline-block h-2 w-2 animate-bounce rounded-full"
          style={{ backgroundColor: "var(--text-tertiary)", animationDelay: "0ms" }}
        />
        <span
          className="inline-block h-2 w-2 animate-bounce rounded-full"
          style={{ backgroundColor: "var(--text-tertiary)", animationDelay: "150ms" }}
        />
        <span
          className="inline-block h-2 w-2 animate-bounce rounded-full"
          style={{ backgroundColor: "var(--text-tertiary)", animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

const WELCOME_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    role: "bot",
    content: "Merhaba! Ben Odaklio AI asistaniyim. Size nasil yardimci olabilirim?",
    timestamp: new Date(),
  },
];

export default function ChatArea() {
  const [messages, setMessages] = useState<Message[]>(WELCOME_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: getBotResponse(text),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="mx-auto flex h-full w-full max-w-3xl flex-col"
      style={{ minHeight: "calc(100vh - 65px)" }}
    >
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="flex flex-col gap-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 px-2 py-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {msg.role === "bot" && <BotAvatar />}
              {msg.role === "user" && (
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
                  style={{
                    backgroundColor: "var(--accent-light)",
                    color: "var(--accent)",
                  }}
                >
                  S
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                  msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"
                }`}
                style={{
                  backgroundColor:
                    msg.role === "user"
                      ? "var(--bg-message-user)"
                      : "var(--bg-message-bot)",
                  color:
                    msg.role === "user"
                      ? "var(--text-on-accent)"
                      : "var(--text-primary)",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div
        className="sticky bottom-0 px-4 pb-6 pt-2"
        style={{ backgroundColor: "var(--bg-primary)" }}
      >
        <div
          className="flex items-end gap-2 rounded-2xl border p-2"
          style={{
            backgroundColor: "var(--bg-input)",
            borderColor: "var(--border-color)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajinizi yazin..."
            rows={1}
            className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed outline-none placeholder:text-[var(--text-tertiary)]"
            style={{ color: "var(--text-primary)" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: input.trim()
                ? "var(--accent-gradient)"
                : "var(--bg-tertiary)",
              color: input.trim()
                ? "var(--text-on-accent)"
                : "var(--text-tertiary)",
            }}
          >
            <SendIcon />
          </button>
        </div>
        <p
          className="mt-2 text-center text-xs"
          style={{ color: "var(--text-tertiary)" }}
        >
          Odaklio AI yanlis bilgi verebilir. Onemli bilgileri dogrulayin.
        </p>
      </div>
    </div>
  );
}

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("merhaba") || lower.includes("selam") || lower.includes("hey")) {
    return "Merhaba! Size nasil yardimci olabilirim?";
  }
  if (lower.includes("nasilsin") || lower.includes("nasil")) {
    return "Tesekkur ederim, gayet iyiyim! Size yardimci olmak icin buradayim.";
  }
  if (lower.includes("ne yapabilirsin") || lower.includes("neler yapabilirsin")) {
    return "Sorularinizi yanıtlayabilir, bilgi saglayabilir ve cesitli konularda yardimci olabilirim. Bana istediginizi sorabilirsiniz!";
  }
  if (lower.includes("tesekkur") || lower.includes("sagol")) {
    return "Rica ederim! Baska bir sorunuz olursa yardimci olmaktan mutluluk duyarim.";
  }

  return "Anliyorum. Bu konuda size daha iyi yardimci olabilmem icin biraz daha detay verebilir misiniz?";
}
