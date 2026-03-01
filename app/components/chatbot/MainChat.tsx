"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend, IconMic, IconHelp } from "../icons/Icons";
import TextSelectionPopup from "./TextSelectionPopup";
import SpeedReadingOverlay from "../speed-reading/SpeedReadingOverlay";
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
  content:
    "Merhaba! Ben **Odaklio AI**, senin kişisel öğrenme asistanınım.\n\nHerhangi bir konuda soru sorabilir, metin seçerek hızlı okuma yapabilir veya derinlemesine anlayış isteyebilirsin.\n\n[!tip] Nasıl Kullanılır?\nMetin seç → Anlamadım · Bu nedir? · Hızlı Oku seçeneklerini kullan.\n\nBugün ne öğrenmek istiyorsun?",
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
    text: string;
  } | null>(null);
  const [speedReadText, setSpeedReadText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTextSelection = useCallback(() => {
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
      text: selectedText,
    });
  }, []);

  useEffect(() => {
    const onMouseUp = () => {
      setTimeout(handleTextSelection, 150);
    };
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [handleTextSelection]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-selection-popup]")) {
        setSelectionPopup(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      sendToAI(input, prev);
      return updated;
    });

    setInput("");
    if (isMobile) {
      inputRef.current?.blur();
    }
  }, [input, isLoading, sendToAI, isMobile]);

  const handleSelectionAction = (
    action: "didnt-understand" | "what-is-this" | "speed-read"
  ) => {
    if (!selectionPopup) return;
    const selectedText = selectionPopup.text;

    if (action === "speed-read") {
      setSpeedReadText(selectedText);
      setSelectionPopup(null);
      return;
    }

    const prompts = {
      "didnt-understand": `"${selectedText}" kısmını anlamadım. Daha basit ve adım adım açıklar mısın?`,
      "what-is-this": `"${selectedText}" nedir? Kısaca tanımla ve örnekle açıkla.`,
    };

    const userContent = prompts[action];
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      sendToAI(userContent, prev);
      return updated;
    });
    setSelectionPopup(null);
  };

  const quickPrompts = isMobile
    ? [
        { text: "Kuantum fiziği", icon: "⚛️" },
        { text: "İntegral çöz", icon: "∫" },
        { text: "Newton yasaları", icon: "🍎" },
      ]
    : [
        { text: "Kuantum fiziği hakkında bilgi ver", icon: "⚛️" },
        { text: "İntegral nasıl çözülür?", icon: "∫" },
        { text: "Newton yasalarını açıkla", icon: "🍎" },
        { text: "Hücre bölünmesi nedir?", icon: "🧬" },
      ];

  return (
    <>
      <div className="flex flex-col h-full" ref={chatAreaRef}>
        {/* Messages */}
        <div className={`flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 ${isMobile ? "pb-2" : ""}`}>
          <div className="max-w-[720px] mx-auto space-y-5 sm:space-y-6">
            {messages.map((msg, idx) => (
              <div
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
                        setMessages((prev) => {
                          const updated = [...prev, userMsg];
                          sendToAI(userContent, prev);
                          return updated;
                        });
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
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="max-w-[720px] mx-auto mt-8 sm:mt-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="text-center mb-6">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-float"
                  style={{
                    background: "var(--accent-primary-light)",
                    boxShadow: "var(--shadow-glow-sm)",
                  }}
                >
                  <span className="text-2xl">🎓</span>
                </div>
                <h2 className="text-base font-bold mb-1" style={{ color: "var(--text-primary)" }}>
                  Ne öğrenmek istiyorsun?
                </h2>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  Bir konu seç ya da kendi sorunu yaz
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-2.5">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={prompt.text}
                    onClick={() => setInput(prompt.text)}
                    className="flex items-center gap-2 rounded-xl px-3.5 py-3 sm:px-4 sm:py-2.5 text-xs font-medium transition-all active:scale-[0.97] hover:shadow-md stagger-children"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-secondary)",
                      animationDelay: `${0.4 + i * 0.08}s`,
                    }}
                  >
                    <span className="text-sm">{prompt.icon}</span>
                    <span>{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className={`flex-shrink-0 px-3 sm:px-4 ${isMobile ? "pb-2" : "pb-4"}`}>
          <div
            className="max-w-[720px] mx-auto flex items-center gap-2 rounded-2xl px-3 py-2.5 sm:px-4 transition-all"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              boxShadow: input.trim() ? "var(--shadow-glow-sm)" : "var(--shadow-md)",
              borderColor: input.trim() ? "rgba(16, 185, 129, 0.2)" : "var(--border-primary)",
            }}
          >
            <button
              onClick={() => setIsListening(!isListening)}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all"
              style={{
                background: isListening
                  ? "var(--accent-danger)"
                  : "var(--bg-tertiary)",
                color: isListening ? "white" : "var(--text-tertiary)",
              }}
            >
              <IconMic size={14} />
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
                  ? "Mesajını yaz..."
                  : "Mesajını yaz veya sesli konuş..."
              }
              disabled={isLoading}
              className="flex-1 bg-transparent text-[13px] sm:text-sm outline-none disabled:opacity-50"
              style={{ color: "var(--text-primary)" }}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 active:scale-95"
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

          {!isMobile && (
            <p
              className="text-center text-[10px] mt-2.5 flex items-center justify-center gap-1.5"
              style={{ color: "var(--text-tertiary)" }}
            >
              <span style={{ color: "var(--accent-primary)", opacity: 0.6 }}>●</span>
              Metni seç → Anlamadım · Bu nedir? · Hızlı Oku
            </p>
          )}
        </div>
      </div>

      {/* Text Selection Popup */}
      {selectionPopup && (
        <div data-selection-popup>
          <TextSelectionPopup
            x={selectionPopup.x}
            y={selectionPopup.y}
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
    </>
  );
}
