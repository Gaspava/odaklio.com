"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend, IconMic, IconHelp, IconCopy, IconThumbUp, IconThumbDown } from "../icons/Icons";
import TextSelectionPopup from "./TextSelectionPopup";
import SpeedReadingOverlay from "../speed-reading/SpeedReadingOverlay";
import QuickLearnOverlay from "./QuickLearnOverlay";
import ChatMessageRenderer from "./ChatMessageRenderer";
import { useConversation, type ChatMessage } from "@/app/providers/ConversationProvider";
import { useAuth } from "@/app/providers/AuthProvider";

interface MainChatProps {
  isMobile?: boolean;
}

const welcomeMessage: ChatMessage = {
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
function AiAvatar({ spinning = false }: { spinning?: boolean }) {
  return (
    <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full mr-3 mt-1">
      <img
        src="/odaklio-logo.svg"
        alt=""
        style={{
          width: 32,
          height: 32,
          animation: spinning ? "logo-spin 2s linear infinite" : "logo-spin 12s linear infinite",
        }}
      />
      <style>{`@keyframes logo-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function MainChat({ isMobile = false }: MainChatProps) {
  const { user } = useAuth();
  const {
    activeConversationId,
    saveUserMessage,
    saveAssistantMessage,
    generateTitle,
    refreshConversations,
    loadConversation,
  } = useConversation();
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "";

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<"basit" | "detayli" | "akademik" | "hikaye">("basit");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectionPopup, setSelectionPopup] = useState<{
    x: number;
    y: number;
    bottom: number;
    text: string;
  } | null>(null);
  const [speedReadText, setSpeedReadText] = useState<string | null>(null);
  const [quickLearnText, setQuickLearnText] = useState<string | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastAiMsgIdRef = useRef<string | null>(null);
  const isFirstMessageRef = useRef(true);

  const STYLE_OPTIONS = [
    { id: "basit" as const, label: "Basit", emoji: "💡" },
    { id: "detayli" as const, label: "Detaylı", emoji: "📖" },
    { id: "akademik" as const, label: "Akademik", emoji: "🎓" },
    { id: "hikaye" as const, label: "Hikaye", emoji: "✨" },
  ];

  const STYLE_PREFIXES: Record<string, string> = {
    basit: "",
    detayli: "[Detaylı ve kapsamlı açıklama yap] ",
    akademik: "[Akademik ve teknik üslupla açıkla] ",
    hikaye: "[Hikaye anlatır gibi, akıcı ve eğlenceli anlat] ",
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

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

    // Mobile: detect text selection via selectionchange (long-press)
    let selectionTimer: ReturnType<typeof setTimeout>;
    const onSelectionChange = () => {
      clearTimeout(selectionTimer);
      selectionTimer = setTimeout(handleTextSelection, 500);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectionchange", onSelectionChange);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", onSelectionChange);
      clearTimeout(selectionTimer);
    };
  }, [handleTextSelection]);

  const sendToAI = useCallback(
    async (userContent: string, allMessages: ChatMessage[], style: string = "basit") => {
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

      const stylePrefix: Record<string, string> = {
        basit: "",
        detayli: "[Detaylı ve kapsamlı açıklama yap] ",
        akademik: "[Akademik ve teknik üslupla açıkla] ",
        hikaye: "[Hikaye anlatır gibi, akıcı ve eğlenceli anlat] ",
      };
      const enriched = (stylePrefix[style] || "") + userContent;

      const apiMessages = allMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: "user", content: enriched });

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
    if ((!input.trim() && !imagePreview) || isLoading) return;

    const userContent = imagePreview
      ? input.trim() ? `${input.trim()} [Görsel eklendi]` : "[Görsel eklendi]"
      : input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    sendToAI(userContent, messages, selectedStyle);

    setInput("");
    setImagePreview(null);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    if (isMobile) {
      inputRef.current?.blur();
    }
  }, [input, imagePreview, isLoading, sendToAI, isMobile, messages, selectedStyle]);

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
        <img
          src="/odaklio-logo.svg"
          alt=""
          style={{ width: 48, height: 48, animation: "logo-spin 2s linear infinite" }}
        />
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Sohbet yükleniyor...
        </p>
      </div>
    );
  }

  const userMessages = messages.filter((m) => m.role === "user" && m.id !== "welcome");
  const hasUserMessages = userMessages.length > 0;

  return (
    <>
      <div className="flex flex-col h-full" ref={chatAreaRef}>
        {/* Messages + Inline Map */}
        <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 ${isMobile ? "pb-2" : ""}`}>
          {/* Neon inline chat map - fixed to right side, desktop only */}
          {!isMobile && hasUserMessages && (
            <div className="inline-chat-map">
              {userMessages.map((msg, index) => {
                const truncated = msg.content.length > 30 ? msg.content.substring(0, 30) + "…" : msg.content;
                return (
                  <button
                    key={msg.id}
                    onClick={() => {
                      const el = document.getElementById(`msg-${msg.id}`);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="inline-chat-map-item"
                    title={msg.content}
                  >
                    <span className="inline-chat-map-dot" />
                    <span className="inline-chat-map-text">{truncated}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Welcome Screen - shown when no real messages */}
          {messages.length <= 1 ? (
            <div className="flex flex-col items-center justify-center min-h-full px-4 animate-fade-in">
              {/* Logo */}
              <div className="welcome-logo-glow mb-6 sm:mb-8">
                <img
                  src="/odaklio-logo.svg"
                  alt="Odaklio"
                  className="w-24 h-24 sm:w-28 sm:h-28"
                  style={{ animation: "logo-spin 12s linear infinite" }}
                />
              </div>

              {/* Greeting */}
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 text-center tracking-wide">
                {firstName ? (
                  <>
                    <span style={{ color: "var(--text-primary)" }}>MERHABA, </span>
                    <span className="welcome-name-glow">{firstName.toUpperCase()}!</span>
                  </>
                ) : (
                  <span style={{ color: "var(--text-primary)" }}>MERHABA!</span>
                )}
              </h1>
              <p className="text-sm sm:text-base mb-8 sm:mb-10 text-center" style={{ color: "var(--text-tertiary)" }}>
                Bugün sana nasıl yardımcı olabilirim?
              </p>

              {/* Animated Input */}
              <div className="w-full max-w-[600px] mb-3 sm:mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }}
                />
                <div className="welcome-input-wrapper" onClick={() => inputRef.current?.focus()}>
                  <div className="welcome-input-inner">
                    <button
                      onClick={(e) => { e.stopPropagation(); setIsListening(!isListening); }}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all mb-0.5"
                      style={{
                        background: isListening ? "var(--accent-danger)" : "var(--bg-tertiary)",
                        color: isListening ? "white" : "var(--text-tertiary)",
                      }}
                    >
                      <IconMic size={14} />
                    </button>
                    <div className="flex-1 flex flex-col gap-2">
                      {imagePreview && (
                        <div className="relative w-fit">
                          <img src={imagePreview} alt="preview" className="h-16 rounded-lg object-cover" style={{ maxWidth: 120 }} />
                          <button
                            onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px]"
                            style={{ background: "var(--accent-danger)" }}
                          >✕</button>
                        </div>
                      )}
                      <textarea
                        ref={inputRef}
                        rows={1}
                        value={input}
                        onChange={(e) => { setInput(e.target.value); autoResize(e.target); }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                        }}
                        onPaste={(e) => {
                          const items = Array.from(e.clipboardData.items);
                          const img = items.find(i => i.type.startsWith("image/"));
                          if (img) { e.preventDefault(); const f = img.getAsFile(); if (f) handleImageFile(f); }
                        }}
                        placeholder={isMobile ? "Ne öğrenmek istiyorsun?" : "Ne öğrenmek istiyorsun? Herhangi bir şey sor..."}
                        disabled={isLoading}
                        className="w-full bg-transparent text-sm sm:text-base outline-none disabled:opacity-50 resize-none leading-relaxed"
                        style={{ color: "var(--text-primary)", minHeight: "24px", maxHeight: "200px", overflowY: "auto" }}
                      />
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0 mb-0.5">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl transition-all"
                        style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                        title="Görsel ekle"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => { e.stopPropagation(); handleSend(); }}
                        disabled={(!input.trim() && !imagePreview) || isLoading}
                        className="flex h-8 w-8 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 active:scale-95"
                        style={{
                          background: (input.trim() || imagePreview) && !isLoading ? "var(--gradient-primary)" : "var(--bg-tertiary)",
                          color: (input.trim() || imagePreview) && !isLoading ? "white" : "var(--text-tertiary)",
                          boxShadow: (input.trim() || imagePreview) && !isLoading ? "var(--shadow-glow-sm)" : "none",
                        }}
                      >
                        <IconSend size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Style Pills */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {STYLE_OPTIONS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStyle(s.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                      style={{
                        background: selectedStyle === s.id ? "rgba(255, 107, 53, 0.12)" : "var(--bg-tertiary)",
                        color: selectedStyle === s.id ? "var(--accent-primary)" : "var(--text-tertiary)",
                        border: selectedStyle === s.id ? "1px solid rgba(255, 107, 53, 0.3)" : "1px solid transparent",
                      }}
                    >
                      <span>{s.emoji}</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Prompts */}
              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-2.5 max-w-[600px]">
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
                  {msg.role === "assistant" && (
                    <AiAvatar spinning={isLoading && msg.id === messages[messages.length - 1]?.id} />
                  )}

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

                    {/* Action buttons + "Anlamadım" on AI messages */}
                    {msg.role === "assistant" && msg.content && (
                      <>
                        <div className={`flex items-center gap-1 mt-2 ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                          <button title="Kopyala" onClick={() => navigator.clipboard.writeText(msg.content)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-[var(--bg-tertiary)]"
                            style={{ color: "var(--text-tertiary)" }}>
                            <IconCopy size={13} />
                          </button>
                          <button title="Begendim"
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-[var(--bg-tertiary)]"
                            style={{ color: "var(--text-tertiary)" }}>
                            <IconThumbUp size={13} />
                          </button>
                          <button title="Begenmedim"
                            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-[var(--bg-tertiary)]"
                            style={{ color: "var(--text-tertiary)" }}>
                            <IconThumbDown size={13} />
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            const userContent = "Bu aciklamayi anlamadim, daha basit anlatir misin?";
                            const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: userContent, timestamp: new Date() };
                            setMessages((prev) => [...prev, userMsg]);
                            sendToAI(userContent, messages);
                          }}
                          className={`absolute -bottom-2.5 right-4 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all ${isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", color: "var(--accent-warning)", boxShadow: "var(--shadow-md)" }}>
                          <IconHelp size={10} />
                          Anlamadim
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div />
            </div>
          )}
        </div>

        {/* Input Bar - only shown when in chat mode (has messages) */}
        {messages.length > 1 && (
        <div className={`flex-shrink-0 px-3 sm:px-4 ${isMobile ? "pb-2" : "pb-4"}`}>
          <div
            className="max-w-[720px] mx-auto rounded-2xl px-3 py-2.5 sm:px-4 transition-all cursor-text"
            style={{
              background: "var(--bg-card)",
              border: "1.5px solid var(--border-primary)",
              boxShadow: input.trim() ? "var(--shadow-glow-sm)" : "var(--shadow-md)",
              borderColor: input.trim() ? "rgba(255, 107, 53, 0.4)" : "var(--border-primary)",
            }}
            onClick={() => inputRef.current?.focus()}
          >
            {imagePreview && (
              <div className="relative w-fit mb-2">
                <img src={imagePreview} alt="preview" className="h-14 rounded-lg object-cover" style={{ maxWidth: 100 }} />
                <button
                  onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px]"
                  style={{ background: "var(--accent-danger)" }}
                >✕</button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setIsListening(!isListening); }}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all mb-0.5"
                style={{
                  background: isListening ? "var(--accent-danger)" : "var(--bg-tertiary)",
                  color: isListening ? "white" : "var(--text-tertiary)",
                }}
              >
                <IconMic size={14} />
              </button>

              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(e.target); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
                }}
                onPaste={(e) => {
                  const items = Array.from(e.clipboardData.items);
                  const img = items.find(i => i.type.startsWith("image/"));
                  if (img) { e.preventDefault(); const f = img.getAsFile(); if (f) handleImageFile(f); }
                }}
                placeholder={
                  isLoading
                    ? "Yanıt bekleniyor..."
                    : isMobile
                    ? "Mesajını yaz..."
                    : "Mesajını yaz veya sesli konuş..."
                }
                disabled={isLoading}
                className="flex-1 bg-transparent text-[13px] sm:text-sm outline-none disabled:opacity-50 resize-none leading-relaxed"
                style={{ color: "var(--text-primary)", minHeight: "24px", maxHeight: "200px", overflowY: "auto" }}
              />

              <div className="flex gap-1 flex-shrink-0 mb-0.5">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition-all"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                  title="Görsel ekle"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => { e.stopPropagation(); handleSend(); }}
                  disabled={(!input.trim() && !imagePreview) || isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 active:scale-95"
                  style={{
                    background: (input.trim() || imagePreview) && !isLoading ? "var(--gradient-primary)" : "var(--bg-tertiary)",
                    color: (input.trim() || imagePreview) && !isLoading ? "white" : "var(--text-tertiary)",
                    boxShadow: (input.trim() || imagePreview) && !isLoading ? "var(--shadow-glow-sm)" : "none",
                  }}
                >
                  <IconSend size={14} />
                </button>
              </div>
            </div>
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
        )}
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
