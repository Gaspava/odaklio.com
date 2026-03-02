"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend, IconMic, IconHelp } from "../icons/Icons";
import TextSelectionPopup from "./TextSelectionPopup";
import SpeedReadingOverlay from "../speed-reading/SpeedReadingOverlay";
import QuickLearnOverlay from "./QuickLearnOverlay";
import ChatMessageRenderer from "./ChatMessageRenderer";
import { useConversation, type ChatMessage } from "@/app/providers/ConversationProvider";

interface MainChatProps {
  isMobile?: boolean;
}

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Merhaba! Ben **Odaklio AI**, senin kişisel öğrenme asistanınım.\n\nHerhangi bir konuda soru sorabilir, metin seçerek hızlı okuma yapabilir veya derinlemesine anlayış isteyebilirsin.\n\n[!tip] Nasıl Kullanılır?\nMetin seç → Hızlı Öğren · Bu nedir? · Hızlı Oku seçeneklerini kullan.\n\nBugün ne öğrenmek istiyorsun?",
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
  const {
    activeConversationId,
    saveUserMessage,
    saveAssistantMessage,
    generateTitle,
    refreshConversations,
    loadConversation,
  } = useConversation();

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
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
  const isFirstMessageRef = useRef(true);

  // Load conversation ONLY on mount — if there's an active conversation, fetch its messages
  useEffect(() => {
    if (activeConversationId) {
      isFirstMessageRef.current = false;
      setIsInitialLoading(true);
      loadConversation(activeConversationId).then((loaded) => {
        if (loaded.length > 0) {
          setMessages([welcomeMessage, ...loaded]);
        }
        setIsInitialLoading(false);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to the START of the last AI message
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
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
    async (userContent: string, allMessages: ChatMessage[]) => {
      setIsLoading(true);

      // Save user message to DB
      let conversationId: string;
      let isFirst = isFirstMessageRef.current;
      try {
        const result = await saveUserMessage(userContent);
        conversationId = result.conversationId;
        if (isFirst) {
          isFirstMessageRef.current = false;
        }
      } catch (err) {
        console.error("Failed to save user message:", err);
        setIsLoading(false);
        return;
      }

      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: ChatMessage = {
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

      let fullContent = "";

      try {
        await streamChat(
          apiMessages,
          (text) => {
            fullContent += text;
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

        // Save completed assistant message to DB
        if (fullContent) {
          try {
            await saveAssistantMessage(conversationId, fullContent);
          } catch (err) {
            console.error("Failed to save assistant message:", err);
          }
        }

        // Generate title on first message
        if (isFirst && fullContent) {
          generateTitle(conversationId, userContent);
        }

        // Refresh sidebar
        refreshConversations();
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
    [saveUserMessage, saveAssistantMessage, generateTitle, refreshConversations]
  );

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;

    const userContent = input;
    const userMsg: ChatMessage = {
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
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    sendToAI(userContent, messages);
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

  if (isInitialLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3">
        <div className="auth-spinner" style={{ width: 28, height: 28 }} />
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Sohbet yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full" ref={chatAreaRef}>
        {/* Messages */}
        <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 ${isMobile ? "pb-2" : ""}`}>
          <div className="max-w-[720px] mx-auto space-y-5 sm:space-y-6">
            {messages.map((msg, idx) => (
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
                        const userMsg: ChatMessage = {
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
              type="button"
              onMouseDown={(e) => e.preventDefault()}
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
              Metni seç → Hızlı Öğren · Bu nedir? · Hızlı Oku
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
