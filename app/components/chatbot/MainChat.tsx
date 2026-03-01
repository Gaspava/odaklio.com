"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend, IconMic, IconHelp } from "../icons/Icons";
import TextSelectionPopup from "./TextSelectionPopup";
import SpeedReadingOverlay from "../speed-reading/SpeedReadingOverlay";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isRichContent?: boolean;
}

interface MainChatProps {
  isMobile?: boolean;
}

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Merhaba! Ben Odaklio AI, senin kişisel öğrenme asistanınım. Herhangi bir konuda soru sorabilir, metin seçerek hızlı okuma yapabilir veya derinlemesine anlayış isteyebilirsin.\n\nBugün ne öğrenmek istiyorsun?",
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

  // Handle text selection in AI responses
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 3) return;

    // Check if selection is within a chat message
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectionPopup({
      x: rect.left + rect.width / 2,
      y: rect.top,
      text: selectedText,
    });
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    // Also handle touch selection on mobile
    document.addEventListener("selectionchange", () => {
      // Debounce selection change on mobile
      setTimeout(handleTextSelection, 300);
    });
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, [handleTextSelection]);

  // Close popup when clicking outside
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

      // Create placeholder for AI response
      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: Message = {
        id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isRichContent: true,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Build conversation history for the API
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
                  ? { ...m, content: `Hata oluştu: ${error}` }
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
                  content: `Bağlantı hatası: ${errorMsg}. Lütfen tekrar dene.`,
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
    // Blur input on mobile after send to hide keyboard
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
    ? ["Kuantum fiziği", "İntegral çöz", "Newton yasaları"]
    : ["Kuantum fiziği hakkında bilgi ver", "İntegral nasıl çözülür?", "Newton yasalarını açıkla"];

  return (
    <>
      <div className="flex flex-col h-full" ref={chatAreaRef}>
        {/* Messages */}
        <div className={`flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 ${isMobile ? "pb-2" : ""}`}>
          <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                {msg.role === "assistant" && (
                  <div
                    className="flex-shrink-0 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg mr-2 sm:mr-3 mt-1 text-white text-[10px] font-bold"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    O
                  </div>
                )}

                <div
                  className={`group relative ${
                    msg.role === "user"
                      ? "max-w-[85%] sm:max-w-[70%]"
                      : "max-w-[90%] sm:max-w-[85%]"
                  }`}
                >
                  <div
                    className="rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3"
                    style={{
                      background:
                        msg.role === "user"
                          ? "var(--accent-primary)"
                          : "var(--bg-card)",
                      color:
                        msg.role === "user"
                          ? "white"
                          : "var(--text-primary)",
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
                    {msg.role === "assistant" ? (
                      <div className="prose-content text-[13px] sm:text-sm leading-relaxed whitespace-pre-line select-text">
                        {msg.content}
                        {isLoading && msg.id === messages[messages.length - 1]?.id && !msg.content && (
                          <span className="inline-flex gap-1">
                            <span className="animate-pulse">●</span>
                            <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>●</span>
                            <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>●</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[13px] sm:text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>

                  {/* Hover "Anlamadım" for entire AI message */}
                  {msg.role === "assistant" && msg.isRichContent && msg.content && (
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
                      className={`absolute -bottom-2 right-4 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-opacity ${
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

          {/* Quick Prompts (show when few messages) */}
          {messages.length <= 1 && (
            <div className="max-w-2xl mx-auto mt-6 sm:mt-8">
              <p
                className="text-xs font-medium mb-3 text-center"
                style={{ color: "var(--text-tertiary)" }}
              >
                Hızlı başla
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt);
                    }}
                    className="rounded-full px-3 py-2 sm:px-4 text-xs font-medium transition-all active:scale-[0.97]"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className={`flex-shrink-0 px-3 sm:px-4 ${isMobile ? "pb-2" : "pb-4"}`}>
          <div
            className="max-w-2xl mx-auto flex items-center gap-2 rounded-2xl px-3 py-2 sm:px-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              boxShadow: "var(--shadow-md)",
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
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30"
              style={{
                background:
                  input.trim() && !isLoading
                    ? "var(--gradient-primary)"
                    : "var(--bg-tertiary)",
                color:
                  input.trim() && !isLoading
                    ? "white"
                    : "var(--text-tertiary)",
              }}
            >
              <IconSend size={14} />
            </button>
          </div>

          {!isMobile && (
            <p
              className="text-center text-[10px] mt-2"
              style={{ color: "var(--text-tertiary)" }}
            >
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
