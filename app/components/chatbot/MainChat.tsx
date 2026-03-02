"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend, IconMic, IconHelp } from "../icons/Icons";
import TextSelectionPopup from "./TextSelectionPopup";
import SpeedReadingOverlay from "../speed-reading/SpeedReadingOverlay";
import QuickLearnOverlay from "./QuickLearnOverlay";
import ChatMessageRenderer from "./ChatMessageRenderer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MainChatProps {
  isMobile?: boolean;
}

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content: "",
  timestamp: new Date(),
};

async function streamChat(
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onError: (error: string) => void,
  onDone: () => void
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `API hatası: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("Stream okunamadı");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;

      const data = trimmed.slice(6);
      if (data === "[DONE]") {
        onDone();
        return;
      }

      try {
        const parsed = JSON.parse(data);
        if (parsed.error) {
          onError(parsed.error);
          return;
        }
        if (parsed.text) {
          onChunk(parsed.text);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  onDone();
}

/* ===== TYPING INDICATOR ===== */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--accent-primary)" }} />
      <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--accent-primary)" }} />
      <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--accent-primary)" }} />
    </div>
  );
}

/* ===== AI AVATAR ===== */
function AiAvatar() {
  return (
    <div
      className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg mr-2.5 mt-1 text-white text-[11px] font-bold relative"
      style={{ background: "var(--gradient-primary)" }}
    >
      O
      <div
        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
        style={{
          background: "var(--accent-success)",
          borderColor: "var(--bg-primary)",
        }}
      />
    </div>
  );
}

export default function MainChat({ isMobile = false }: MainChatProps) {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<{
    x: number;
    y: number;
    bottom: number;
    text: string;
  } | null>(null);
  const [speedReadText, setSpeedReadText] = useState<string | null>(null);
  const [quickLearnText, setQuickLearnText] = useState<string | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastAiMsgIdRef = useRef<string | null>(null);

  // Scroll to the START of the last AI message (not the bottom)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    // Only scroll when a NEW AI message appears, not on every chunk
    if (lastAiMsgIdRef.current === lastMsg.id) return;
    lastAiMsgIdRef.current = lastMsg.id;

    requestAnimationFrame(() => {
      const el = document.getElementById(`msg-${lastMsg.id}`);
      if (el && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const elTop = el.offsetTop - container.offsetTop;
        container.scrollTo({ top: elTop - 16, behavior: "smooth" });
      }
    });
  }, [messages]);

  const isMouseDownRef = useRef(false);

  const handleTextSelection = useCallback(() => {
    if (isMouseDownRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 3) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectionPopup({
      x: rect.left + rect.width / 2,
      y: rect.top,
      bottom: rect.bottom,
      text: selectedText,
    });
  }, []);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't clear popup when clicking popup buttons
      if (target.closest("[data-selection-popup]")) return;
      isMouseDownRef.current = true;
      setSelectionPopup(null);
    };
    const onMouseUp = () => {
      isMouseDownRef.current = false;
      setTimeout(handleTextSelection, 200);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [handleTextSelection]);

  const sendToAI = useCallback(
    async (userContent: string, allMessages: Message[]) => {
      setIsLoading(true);

      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: Message = {
        id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      const apiMessages = allMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: "user", content: userContent });

      try {
        await streamChat(
          apiMessages,
          (text) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId ? { ...m, content: m.content + text } : m
              )
            );
          },
          (error) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? { ...m, content: `[!danger] Hata\n${error}` }
                  : m
              )
            );
          },
          () => {
            setIsLoading(false);
          }
        );
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Bilinmeyen hata";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content: `[!danger] Bağlantı Hatası\n${errorMsg}. Lütfen tekrar dene.`,
                }
              : m
          )
        );
        setIsLoading(false);
      }
    },
    []
  );

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;

    const userContent = input;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    sendToAI(userContent, messages);

    setInput("");
    if (isMobile) {
      inputRef.current?.blur();
    }
  }, [input, isLoading, sendToAI, isMobile, messages]);

  const handleSelectionAction = (
    action: "quick-learn" | "what-is-this" | "speed-read"
  ) => {
    if (!selectionPopup) return;
    const selectedText = selectionPopup.text;

    if (action === "speed-read") {
      setSpeedReadText(selectedText);
      setSelectionPopup(null);
      return;
    }

    if (action === "quick-learn") {
      setQuickLearnText(selectedText);
      setSelectionPopup(null);
      return;
    }

    // "what-is-this" — continue in same chat
    const userContent = `"${selectedText}" nedir? Kısaca tanımla ve örnekle açıkla.`;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    sendToAI(userContent, messages);
    setSelectionPopup(null);
  };

  const isWelcome = messages.length <= 1;

  const quickPrompts = isMobile
    ? [
        { text: "Kuantum fiziği", icon: "⚛️", desc: "Parçacık dünyası", gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
        { text: "İntegral çöz", icon: "∫", desc: "Matematik problemleri", gradient: "linear-gradient(135deg, #8b5cf6, #6366f1)" },
        { text: "Newton yasaları", icon: "🍎", desc: "Fizik temelleri", gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
        { text: "Hücre bölünmesi", icon: "🧬", desc: "Biyoloji", gradient: "linear-gradient(135deg, #10b981, #059669)" },
      ]
    : [
        { text: "Kuantum fiziği hakkında bilgi ver", icon: "⚛️", desc: "Parçacık dünyasını keşfet", gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
        { text: "İntegral nasıl çözülür?", icon: "∫", desc: "Adım adım matematik", gradient: "linear-gradient(135deg, #8b5cf6, #6366f1)" },
        { text: "Newton yasalarını açıkla", icon: "🍎", desc: "Fizik temelleri", gradient: "linear-gradient(135deg, #f59e0b, #ef4444)" },
        { text: "Hücre bölünmesi nedir?", icon: "🧬", desc: "Biyolojinin yapı taşları", gradient: "linear-gradient(135deg, #10b981, #059669)" },
      ];

  const featureChips = [
    { label: "Hızlı Okuma", icon: "📖" },
    { label: "Mind Map", icon: "🧠" },
    { label: "Flashcard", icon: "🃏" },
    { label: "Pomodoro", icon: "⏱️" },
  ];

  return (
    <>
      <div className="flex flex-col h-full" ref={chatAreaRef}>
        {/* Messages / Welcome */}
        <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 ${isMobile ? "pb-2" : ""}`}>

          {/* Modern Welcome Screen */}
          {isWelcome ? (
            <div className="flex flex-col items-center justify-center min-h-full px-2">
              {/* Ambient glow background */}
              <div className="odak-hero-glow" />

              {/* Logo + Brand */}
              <div className="animate-fade-in flex flex-col items-center mb-6 sm:mb-8 relative z-10">
                <div className="odak-hero-logo mb-5">
                  <div
                    className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl text-white text-2xl sm:text-3xl font-black relative"
                    style={{
                      background: "var(--gradient-primary)",
                      boxShadow: "0 0 40px rgba(16, 185, 129, 0.3), 0 0 80px rgba(16, 185, 129, 0.1)",
                    }}
                  >
                    O
                    <div
                      className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[3px] flex items-center justify-center"
                      style={{
                        background: "var(--accent-success)",
                        borderColor: "var(--bg-primary)",
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                </div>

                <h1
                  className="text-2xl sm:text-4xl font-black tracking-tight text-center mb-2 sm:mb-3"
                  style={{ color: "var(--text-primary)" }}
                >
                  Bugün ne{" "}
                  <span className="gradient-text-hero">öğrenmek</span>
                  {" "}istiyorsun?
                </h1>
                <p
                  className="text-sm sm:text-base text-center max-w-md leading-relaxed"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Odaklio AI ile konuşarak öğren, keşfet ve ustalaş
                </p>
              </div>

              {/* Feature Chips */}
              <div
                className="flex flex-wrap justify-center gap-2 mb-8 sm:mb-10 animate-fade-in relative z-10"
                style={{ animationDelay: "0.15s" }}
              >
                {featureChips.map((chip) => (
                  <span
                    key={chip.label}
                    className="odak-feature-chip flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-medium"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span className="text-xs">{chip.icon}</span>
                    {chip.label}
                  </span>
                ))}
              </div>

              {/* Quick Prompt Cards */}
              <div
                className="w-full max-w-[640px] grid grid-cols-2 gap-2.5 sm:gap-3 animate-fade-in relative z-10"
                style={{ animationDelay: "0.25s" }}
              >
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={prompt.text}
                    onClick={() => setInput(prompt.text)}
                    className="odak-prompt-card group flex flex-col items-start gap-2 sm:gap-3 rounded-2xl p-3.5 sm:p-4 text-left transition-all active:scale-[0.97]"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      animationDelay: `${0.3 + i * 0.06}s`,
                    }}
                  >
                    <div
                      className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl text-lg sm:text-xl transition-transform group-hover:scale-110"
                      style={{
                        background: prompt.gradient,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                    >
                      <span className="drop-shadow-sm">{prompt.icon}</span>
                    </div>
                    <div>
                      <span
                        className="text-xs sm:text-[13px] font-semibold block mb-0.5 leading-snug"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {prompt.text}
                      </span>
                      <span
                        className="text-[10px] sm:text-[11px] font-medium"
                        style={{ color: "var(--text-tertiary)" }}
                      >
                        {prompt.desc}
                      </span>
                    </div>
                    <div
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>

              {/* Tip text */}
              {!isMobile && (
                <p
                  className="mt-8 text-[11px] flex items-center gap-2 animate-fade-in"
                  style={{ color: "var(--text-tertiary)", animationDelay: "0.5s" }}
                >
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                    PRO
                  </span>
                  Metni seç ve Hızlı Öğren, Bu Nedir veya Hızlı Oku ile etkileşime geç
                </p>
              )}
            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-[720px] mx-auto space-y-5 sm:space-y-6">
              {messages.filter(m => m.id !== "welcome").map((msg, idx) => (
                <div
                  id={`msg-${msg.id}`}
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-msg-in`}
                  style={{ animationDelay: `${Math.min(idx * 0.05, 0.3)}s` }}
                >
                  {msg.role === "assistant" && <AiAvatar />}

                  <div
                    className={`group relative ${
                      msg.role === "user"
                        ? "max-w-[85%] sm:max-w-[70%]"
                        : "max-w-[92%] sm:max-w-[88%]"
                    }`}
                  >
                    <div
                      className={`px-3.5 py-3 sm:px-4 sm:py-3.5 ${
                        msg.role === "user" ? "msg-user" : "msg-ai"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <>
                          {msg.content ? (
                            <ChatMessageRenderer content={msg.content} />
                          ) : (
                            isLoading && msg.id === messages[messages.length - 1]?.id && (
                              <TypingIndicator />
                            )
                          )}
                        </>
                      ) : (
                        <p className="text-[13px] sm:text-sm leading-relaxed">{msg.content}</p>
                      )}
                    </div>

                    {/* "Anlamadım" button on AI messages */}
                    {msg.role === "assistant" && msg.id !== "welcome" && msg.content && (
                      <button
                        onClick={() => {
                          const userContent =
                            "Bu açıklamayı anlamadım, daha basit anlatır mısın?";
                          const userMsg: Message = {
                            id: Date.now().toString(),
                            role: "user",
                            content: userContent,
                            timestamp: new Date(),
                          };
                          setMessages((prev) => [...prev, userMsg]);
                          sendToAI(userContent, messages);
                        }}
                        className={`absolute -bottom-2.5 right-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all ${
                          isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        }`}
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-primary)",
                          color: "var(--accent-warning)",
                          boxShadow: "var(--shadow-md)",
                        }}
                      >
                        <IconHelp size={10} />
                        Anlamadım
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className={`flex-shrink-0 px-3 sm:px-5 ${isMobile ? "pb-2" : "pb-5"} relative z-10`}>
          <div
            className={`max-w-[640px] mx-auto flex items-center gap-2.5 px-3 sm:px-4 transition-all ${
              isWelcome ? "odak-input-hero rounded-2xl py-3" : "rounded-2xl py-2.5"
            }`}
            style={{
              background: "var(--bg-card)",
              border: `1px solid ${input.trim() ? "rgba(16, 185, 129, 0.25)" : "var(--border-primary)"}`,
              boxShadow: input.trim()
                ? "var(--shadow-glow), 0 4px 24px rgba(0,0,0,0.1)"
                : isWelcome
                ? "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.02)"
                : "var(--shadow-md)",
            }}
          >
            <button
              onClick={() => setIsListening(!isListening)}
              className="flex h-9 w-9 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all active:scale-95"
              style={{
                background: isListening
                  ? "var(--accent-danger)"
                  : "var(--bg-tertiary)",
                color: isListening ? "white" : "var(--text-tertiary)",
              }}
            >
              <IconMic size={15} />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                isLoading
                  ? "Yanıt bekleniyor..."
                  : isMobile
                  ? "Bir şey sor..."
                  : "Bir soru sor veya konu yaz..."
              }
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm sm:text-[15px] outline-none disabled:opacity-50"
              style={{ color: "var(--text-primary)" }}
            />

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 sm:h-8 sm:w-8 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 active:scale-95"
              style={{
                background:
                  input.trim() && !isLoading
                    ? "var(--gradient-primary)"
                    : "var(--bg-tertiary)",
                color:
                  input.trim() && !isLoading
                    ? "white"
                    : "var(--text-tertiary)",
                boxShadow:
                  input.trim() && !isLoading
                    ? "var(--shadow-glow-sm)"
                    : "none",
              }}
            >
              <IconSend size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Text Selection Popup */}
      {selectionPopup && (
        <div data-selection-popup>
          <TextSelectionPopup
            x={selectionPopup.x}
            y={selectionPopup.y}
            bottom={selectionPopup.bottom}
            selectedText={selectionPopup.text}
            onAction={handleSelectionAction}
            onClose={() => setSelectionPopup(null)}
            isMobile={isMobile}
          />
        </div>
      )}

      {/* Speed Reading Overlay */}
      {speedReadText && (
        <SpeedReadingOverlay
          text={speedReadText}
          onClose={() => setSpeedReadText(null)}
        />
      )}

      {/* Quick Learn Overlay */}
      {quickLearnText && (
        <QuickLearnOverlay
          text={quickLearnText}
          onClose={() => setQuickLearnText(null)}
        />
      )}
    </>
  );
}
