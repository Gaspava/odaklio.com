"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend, IconMic, IconHelp, IconCopy, IconThumbUp, IconThumbDown, IconChevronRight } from "../icons/Icons";
import TextSelectionPopup from "./TextSelectionPopup";
import SpeedReadingOverlay from "../speed-reading/SpeedReadingOverlay";
import QuickLearnOverlay from "./QuickLearnOverlay";
import ChatMessageRenderer from "./ChatMessageRenderer";
import { useConversation, type ChatMessage } from "@/app/providers/ConversationProvider";
import type { ConversationType } from "@/lib/db/conversations";
import { useAuth } from "@/app/providers/AuthProvider";
import { supabase } from "@/lib/supabase";

interface MainChatProps {
  isMobile?: boolean;
  onModeSwitch?: (mode: string, initialMessage?: string) => void;
}

const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "",
  timestamp: new Date(),
};

async function streamChat(
  messages: { role: string; content: string; imageData?: string; imageMimeType?: string }[],
  mode: string,
  onChunk: (text: string) => void,
  onError: (error: string) => void,
  onDone: () => void
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, mode }),
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

/* ===== FLASHCARD INLINE RENDERER ===== */
function FlashcardInlineRenderer({ content }: { content: string }) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const regex = /\[FLASHCARD\]([\s\S]*?)\|([\s\S]*?)\[\/FLASHCARD\]/g;
  const cards: { q: string; a: string }[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    cards.push({ q: match[1].trim(), a: match[2].trim() });
  }
  const firstTagIdx = content.indexOf("[FLASHCARD]");
  const intro = firstTagIdx > 0 ? content.slice(0, firstTagIdx).trim() : "";
  const lastTagEnd = content.lastIndexOf("[/FLASHCARD]");
  const outro = lastTagEnd >= 0 ? content.slice(lastTagEnd + 12).trim() : "";
  if (cards.length === 0) return <ChatMessageRenderer content={content} />;
  return (
    <div>
      {intro && <div className="mb-3"><ChatMessageRenderer content={intro} /></div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-2">
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() => setFlipped(prev => ({ ...prev, [i]: !prev[i] }))}
            className="rounded-xl p-4 cursor-pointer transition-all min-h-[72px] flex items-center justify-center text-center select-none"
            style={{
              background: flipped[i] ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
              border: `1px solid ${flipped[i] ? "rgba(210,65,0,0.2)" : "var(--border-primary)"}`,
            }}
          >
            <div>
              <div className="text-[10px] font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                {flipped[i] ? "Cevap" : "Soru"}
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: flipped[i] ? "var(--accent-primary)" : "var(--text-primary)" }}>
                {flipped[i] ? card.a : card.q}
              </p>
            </div>
          </div>
        ))}
      </div>
      {outro && <div className="mt-3"><ChatMessageRenderer content={outro} /></div>}
    </div>
  );
}

/* ===== ROADMAP INLINE RENDERER ===== */
function RoadmapInlineRenderer({ content }: { content: string }) {
  const titleMatch = content.match(/\[ROADMAP_TITLE\]([\s\S]*?)\[\/ROADMAP_TITLE\]/);
  const title = titleMatch?.[1]?.trim() ?? "";
  const stepRegex = /\[STEP\](\d+)\|(.*?)\|(.*?)\|(true|false)\[\/STEP\]/g;
  const steps: { n: number; title: string; desc: string }[] = [];
  let match;
  while ((match = stepRegex.exec(content)) !== null) {
    steps.push({ n: parseInt(match[1]), title: match[2].trim(), desc: match[3].trim() });
  }
  const firstTagIdx = Math.min(
    content.indexOf("[ROADMAP_TITLE]") >= 0 ? content.indexOf("[ROADMAP_TITLE]") : Infinity,
    content.indexOf("[STEP]") >= 0 ? content.indexOf("[STEP]") : Infinity
  );
  const intro = firstTagIdx > 0 && firstTagIdx !== Infinity ? content.slice(0, firstTagIdx).trim() : "";
  const lastStepEnd = content.lastIndexOf("[/STEP]");
  const outro = lastStepEnd >= 0 ? content.slice(lastStepEnd + 7).trim() : "";
  if (steps.length === 0) return <ChatMessageRenderer content={content} />;
  return (
    <div>
      {intro && <div className="mb-3"><ChatMessageRenderer content={intro} /></div>}
      {title && (
        <div className="font-bold text-[14px] mb-3" style={{ color: "var(--text-primary)" }}>{title}</div>
      )}
      <div className="space-y-2 my-2">
        {steps.map((step) => (
          <div
            key={step.n}
            className="flex items-start gap-3 rounded-xl px-3.5 py-3"
            style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)" }}
          >
            <div
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white mt-0.5"
              style={{ background: "var(--accent-primary)" }}
            >
              {step.n}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13px]" style={{ color: "var(--text-primary)" }}>{step.title}</div>
              <div className="text-[12px] mt-0.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.desc}</div>
            </div>
          </div>
        ))}
      </div>
      {outro && <div className="mt-3"><ChatMessageRenderer content={outro} /></div>}
    </div>
  );
}

/* ===== AI AVATAR ===== */
function AiAvatar({ spinning = false }: { spinning?: boolean }) {
  return (
    <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full mr-3 mt-1">
      <img
        src="/odaklio-logo.svg"
        alt=""
        style={{
          width: 40,
          height: 40,
          animation: spinning ? "logo-spin 2s linear infinite" : "logo-spin 12s linear infinite",
        }}
      />
      <style>{`@keyframes logo-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function MainChat({ isMobile = false, onModeSwitch }: MainChatProps) {
  const { user } = useAuth();
  const {
    activeConversationId,
    activeConversationType,
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
  const [selectedStyle, setSelectedStyle] = useState("sohbet");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectionPopup, setSelectionPopup] = useState<{
    x: number;
    y: number;
    bottom: number;
    text: string;
  } | null>(null);
  const [speedReadText, setSpeedReadText] = useState<string | null>(null);
  const [quickLearnText, setQuickLearnText] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastAiMsgIdRef = useRef<string | null>(null);
  const isFirstMessageRef = useRef(true);
  const loadedConvIdRef = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([welcomeMessage]);
  messagesRef.current = messages;

  const MODE_OPTIONS = [
    {
      id: "sohbet", label: "Sohbet",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    },
    {
      id: "flashcard", label: "Flashcard",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    },
    {
      id: "roadmap", label: "Roadmap",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v3M12 10l-5 7M12 10l5 7"/></svg>
    },
    {
      id: "mindmap", label: "Mindmap",
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2.5"/><circle cx="4" cy="7" r="2"/><circle cx="20" cy="7" r="2"/><circle cx="4" cy="17" r="2"/><circle cx="20" cy="17" r="2"/><path d="M9.8 10.8L6 8.5M14.2 10.8L18 8.5M9.8 13.2L6 15.5M14.2 13.2L18 15.5"/></svg>
    },
  ];

  const SOHBET_STYLES = [
    { id: "sohbet", label: "Normal" },
    { id: "detayli", label: "Detaylı" },
    { id: "akademik", label: "Akademik" },
  ];

  const [activeMode, setActiveMode] = useState("sohbet");
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const modeDropdownRef = useRef<HTMLDivElement>(null);
  const styleDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!modeDropdownOpen && !styleDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
        setModeDropdownOpen(false);
      }
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(e.target as Node)) {
        setStyleDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [modeDropdownOpen, styleDropdownOpen]);

  const handleModeSelect = (modeId: string) => {
    setSelectedStyle(modeId);
    setActiveMode(modeId === "detayli" || modeId === "akademik" ? "sohbet" : modeId);
    setModeDropdownOpen(false);
  };

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

  const uploadImageToStorage = useCallback(async (dataUrl: string): Promise<string | null> => {
    if (!user) return null;
    try {
      const base64Data = dataUrl.split(",")[1];
      const mimeType = dataUrl.split(";")[0].split(":")[1];
      const ext = mimeType.split("/")[1] || "jpg";
      const fileName = `${user.id}/${Date.now()}.${ext}`;
      const byteChars = atob(base64Data);
      const byteNums = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteNums], { type: mimeType });
      const { data, error } = await supabase.storage
        .from("chat-images")
        .upload(fileName, blob, { contentType: mimeType, upsert: false });
      if (error) { console.error("Image upload error:", error); return null; }
      const { data: { publicUrl } } = supabase.storage.from("chat-images").getPublicUrl(data.path);
      return publicUrl;
    } catch (err) {
      console.error("Image upload failed:", err);
      return null;
    }
  }, [user]);

  // Load conversation when activeConversationId changes (handles direct URL access & refresh)
  useEffect(() => {
    if (!activeConversationId) return;
    if (loadedConvIdRef.current === activeConversationId) return;
    // If messages are already building (user just sent first msg), skip reload
    if (messagesRef.current.length > 1) {
      loadedConvIdRef.current = activeConversationId;
      return;
    }
    loadedConvIdRef.current = activeConversationId;
    isFirstMessageRef.current = false;
    setIsInitialLoading(true);
    loadConversation(activeConversationId).then((loaded) => {
      if (loaded.length > 0) {
        setMessages([welcomeMessage, ...loaded]);
      }
      setIsInitialLoading(false);

      // Auto-send for roadmap_study: if only user message(s) and no assistant reply, trigger AI
      if (activeConversationType === "roadmap_study" && loaded.length > 0) {
        const hasAssistant = loaded.some((m) => m.role === "assistant");
        const userMsgs = loaded.filter((m) => m.role === "user");
        if (!hasAssistant && userMsgs.length === 1) {
          // Trigger AI without re-saving user message
          const allMsgs = [welcomeMessage, ...loaded];
          const aiId = (Date.now() + 1).toString();
          const aiMsg: ChatMessage = { id: aiId, role: "assistant", content: "", timestamp: new Date() };
          setMessages((prev) => [...prev, aiMsg]);
          setIsLoading(true);

          const apiMessages = allMsgs
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content }));

          let fullContent = "";
          streamChat(
            apiMessages,
            "roadmap_study",
            (text) => {
              fullContent += text;
              setMessages((prev) =>
                prev.map((m) => m.id === aiId ? { ...m, content: m.content + text } : m)
              );
            },
            (error) => {
              setMessages((prev) =>
                prev.map((m) => m.id === aiId ? { ...m, content: `[!danger] Hata\n${error}` } : m)
              );
            },
            () => { setIsLoading(false); }
          ).then(() => {
            if (fullContent && activeConversationId) {
              saveAssistantMessage(activeConversationId, fullContent).catch(console.error);
            }
          });
        }
      }
    });
  }, [activeConversationId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    async (userContent: string, allMessages: ChatMessage[], style: string = "basit", pendingImageData?: string) => {
      setIsLoading(true);

      // Upload image if present
      let imageUrl: string | undefined;
      if (pendingImageData) {
        imageUrl = await uploadImageToStorage(pendingImageData) ?? undefined;
      }

      // Save user message to DB
      let conversationId: string;
      let isFirst = isFirstMessageRef.current;
      try {
        const convType = (["flashcard", "roadmap", "mindmap"].includes(style) ? style : "standard") as ConversationType;
      const result = await saveUserMessage(userContent, null, convType, imageUrl);
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
        detayli: "[Detaylı ve kapsamlı açıklama yap] ",
        akademik: "[Akademik ve teknik üslupla açıkla] ",
      };
      const modeMap: Record<string, string> = {
        sohbet: "standard", detayli: "standard", akademik: "standard",
        flashcard: "flashcard", roadmap: "roadmap", mindmap: "mindmap",
      };
      let apiMode = modeMap[style] || "standard";
      if (activeConversationType === "roadmap_study") {
        apiMode = "roadmap_study";
      }
      const enriched = (stylePrefix[style] || "") + userContent;

      // Extract base64 and mime type from data URL for API
      let imageData: string | undefined;
      let imageMimeType: string | undefined;
      if (pendingImageData) {
        imageMimeType = pendingImageData.split(";")[0].split(":")[1];
        imageData = pendingImageData.split(",")[1];
      }

      const apiMessages: { role: string; content: string; imageData?: string; imageMimeType?: string }[] = allMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: "user", content: enriched, imageData, imageMimeType });

      let fullContent = "";

      try {
        await streamChat(
          apiMessages,
          apiMode,
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

        // Fetch suggested follow-up questions (non-blocking)
        if (fullContent && apiMode === "standard") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, suggestionsLoading: true } : m
            )
          );
          fetch("/api/chat/suggestions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: fullContent }),
          })
            .then((r) => r.json())
            .then(({ suggestions }) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? { ...m, suggestionsLoading: false, suggestions: suggestions?.length > 0 ? suggestions : m.suggestions }
                    : m
                )
              );
            })
            .catch(() => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, suggestionsLoading: false } : m
                )
              );
            });
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
    [saveUserMessage, saveAssistantMessage, generateTitle, refreshConversations, uploadImageToStorage, onModeSwitch, activeConversationType]
  );

  const handleSend = useCallback(() => {
    if ((!input.trim() && !imagePreview) || isLoading) return;

    const userContent = input.trim() || "";
    const capturedImage = imagePreview;

    // Special modes: delegate immediately without touching DB or messages state
    if (["flashcard", "roadmap", "mindmap"].includes(selectedStyle) && onModeSwitch) {
      onModeSwitch(selectedStyle, userContent);
      setInput("");
      setImagePreview(null);
      if (inputRef.current) inputRef.current.style.height = "auto";
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
      imageUrl: capturedImage ?? undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    sendToAI(userContent, messages, selectedStyle, capturedImage ?? undefined);

    setInput("");
    setImagePreview(null);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    if (isMobile) {
      inputRef.current?.blur();
    }
  }, [input, imagePreview, isLoading, sendToAI, isMobile, messages, selectedStyle, onModeSwitch]);

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

  if (isInitialLoading && activeConversationType === "roadmap_study") {
    return (
      <div className="h-full flex flex-col items-center justify-center px-4 py-8 select-none" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center gap-0" style={{ maxWidth: 420 }}>
          <div className="roadmap-loader-logo">
            <div className="roadmap-loader-glow" />
            <img src="/odaklio-logo.svg" alt="Odaklio" className="w-20 h-20 sm:w-24 sm:h-24" style={{ position: "relative", zIndex: 1 }} />
          </div>
          <p className="text-[16px] sm:text-[18px] font-bold mb-1.5 tracking-wide" style={{ color: "var(--text-primary)" }}>
            Calisma Sayfasi Hazirlaniyor
          </p>
          <p className="text-[12px] sm:text-[13px] mb-8" style={{ color: "var(--text-tertiary)" }}>
            Konu hazirlaniyor, biraz bekleyin...
          </p>
          <div className="flex items-center gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: "#10b981",
                  animation: "roadmapDotBounce 1.4s ease-in-out infinite",
                  animationDelay: `${i * 0.16}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

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

  const userMessages = messages.filter((m) => m.role === "user" && m.id !== "welcome" && !m.content.startsWith("[STUDY_CONTEXT]"));
  const hasUserMessages = userMessages.length > 0;

  return (
    <>
      <div
        className="flex flex-col h-full relative"
        ref={chatAreaRef}
        onDragEnter={(e) => { e.preventDefault(); dragCounterRef.current++; setIsDragOver(true); }}
        onDragLeave={(e) => { e.preventDefault(); dragCounterRef.current--; if (dragCounterRef.current === 0) setIsDragOver(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          dragCounterRef.current = 0;
          setIsDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file && file.type.startsWith("image/")) handleImageFile(file);
        }}
      >
        {/* Hidden file input - always in DOM */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = ""; }}
        />

        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}>
            <div className="flex flex-col items-center gap-4 rounded-2xl px-10 py-8" style={{ border: "2px dashed var(--accent-primary)", background: "rgba(var(--accent-primary-rgb, 99,102,241),0.08)" }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p className="text-base font-semibold" style={{ color: "var(--accent-primary)" }}>Görseli buraya bırak</p>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>PNG, JPG, GIF desteklenir</p>
            </div>
          </div>
        )}
        {/* Messages + Inline Map */}
        <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto px-3 sm:px-4 ${messages.length <= 1 ? "" : `py-4 sm:py-6 ${isMobile ? "pb-2" : ""}`}`}>
          {/* Neon inline chat map - fixed to right side, desktop only */}
          {!isMobile && hasUserMessages && (
            <div className="inline-chat-map">
              {userMessages.map((msg, index) => {
                const displayText = msg.content || (msg.imageUrl ? "🖼 Görsel" : "");
                const truncated = displayText.length > 30 ? displayText.substring(0, 30) + "…" : displayText;
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
            <div className="flex flex-col items-center justify-center w-full h-full px-4 animate-fade-in">

              {/* Logo + Title */}
              <div className="flex flex-col items-center gap-4">
                <img
                  src="/odaklio-logo.svg"
                  alt="Odaklio"
                  className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0"
                  style={{ animation: "logo-spin 12s linear infinite" }}
                />
                <h1 className="text-xl sm:text-2xl font-bold text-center select-none" style={{ color: "var(--text-primary)" }}>
                  {firstName ? (
                    <>
                      Merhaba, <span className="welcome-name-glow">{firstName.toUpperCase()}</span>!<br />
                      Nasıl yardımcı olabilirim?
                    </>
                  ) : (
                    <>
                      Merhaba!<br />
                      Nasıl yardımcı olabilirim?
                    </>
                  )}
                </h1>
              </div>

            </div>
          ) : (
            /* Chat Messages */
            <div className="max-w-[720px] mx-auto space-y-5 sm:space-y-6">
              {messages.filter(m => m.id !== "welcome" && !m.content.startsWith("[STUDY_CONTEXT]")).map((msg, idx) => (
                <div
                  id={`msg-${msg.id}`}
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "flex-col"} animate-msg-in`}
                  style={{ animationDelay: `${Math.min(idx * 0.05, 0.3)}s` }}
                >
                  {msg.role === "assistant" && (
                    <AiAvatar spinning={isLoading && msg.id === messages[messages.length - 1]?.id} />
                  )}

                  <div
                    className={`group relative ${
                      msg.role === "user"
                        ? "max-w-[85%] sm:max-w-[70%]"
                        : "w-full"
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
                            msg.content.includes("[FLASHCARD]") ? (
                              <FlashcardInlineRenderer content={msg.content} />
                            ) : msg.content.includes("[STEP]") ? (
                              <RoadmapInlineRenderer content={msg.content} />
                            ) : (
                              <ChatMessageRenderer content={msg.content} />
                            )
                          ) : (
                            isLoading && msg.id === messages[messages.length - 1]?.id && (
                              <TypingIndicator />
                            )
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="Paylaşılan görsel"
                              className="rounded-lg object-cover max-h-48"
                              style={{ maxWidth: 280 }}
                            />
                          )}
                          {msg.content && (
                            <p className="text-[15px] sm:text-base leading-relaxed">{msg.content}</p>
                          )}
                        </div>
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

                  {/* Suggested follow-up questions */}
                  {msg.role === "assistant" && !isLoading && (msg.suggestionsLoading || (msg.suggestions && msg.suggestions.length > 0)) && (
                    <div className="flex flex-col gap-2 mt-5">
                      {msg.suggestionsLoading ? (
                        <div className="suggestions-loading">
                          <span className="suggestions-loading-dot" />
                          <span className="suggestions-loading-dot" />
                          <span className="suggestions-loading-dot" />
                          <span className="suggestions-loading-text">Konu hakkında sorular yükleniyor</span>
                        </div>
                      ) : (
                        msg.suggestions?.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: suggestion, timestamp: new Date() };
                              setMessages((prev) => [...prev, userMsg]);
                              sendToAI(suggestion, messages, selectedStyle);
                            }}
                            disabled={isLoading}
                            className="suggestion-btn"
                          >
                            <IconChevronRight size={12} />
                            <span>{suggestion}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
              <div />
            </div>
          )}
        </div>

        {/* Input Bar - always shown */}
        <div className={`flex-shrink-0 px-3 sm:px-4 ${isMobile ? "pb-2" : "pb-4"}`}>
          {messages.length <= 1 ? (
            /* Welcome card-style input */
            <div className="w-full max-w-[680px] mx-auto">
              <div className="welcome-card-input" onClick={() => inputRef.current?.focus()}>
                {imagePreview && (
                  <div className="relative w-fit mb-3">
                    <img src={imagePreview} alt="preview" className="h-20 rounded-xl object-cover" style={{ maxWidth: 140 }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); setImagePreview(null); }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full flex items-center justify-center text-white text-[10px]"
                      style={{ background: "var(--accent-danger)" }}
                    >✕</button>
                  </div>
                )}
                <textarea
                  ref={inputRef}
                  rows={2}
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
                  placeholder={isMobile ? "Odaklio'ya mesaj yaz..." : "Odaklio'ya mesaj yaz..."}
                  disabled={isLoading}
                  className="w-full bg-transparent outline-none disabled:opacity-50 resize-none leading-relaxed text-sm sm:text-[15px]"
                  style={{ color: "var(--text-primary)", minHeight: "52px", maxHeight: "200px", overflowY: "auto", padding: 0 }}
                />
                <div className="flex items-center justify-between mt-1.5 pt-1.5" style={{ borderTop: "1px solid var(--border-secondary)" }}>
                  <div className="flex items-center gap-1.5">
                    <div className="relative" ref={modeDropdownRef}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setModeDropdownOpen(v => !v); setStyleDropdownOpen(false); }}
                        className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-[11px] font-medium transition-all"
                        style={{ background: "var(--bg-tertiary)", color: activeMode !== "sohbet" ? "var(--accent-primary)" : "var(--text-secondary)" }}
                      >
                        {MODE_OPTIONS.find(m => m.id === activeMode)?.icon}
                        <span>{MODE_OPTIONS.find(m => m.id === activeMode)?.label}</span>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: modeDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                      {modeDropdownOpen && (
                        <div className="absolute bottom-10 left-0 rounded-xl overflow-hidden z-50" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", boxShadow: "var(--shadow-lg)", minWidth: 130 }} onClick={(e) => e.stopPropagation()}>
                          {MODE_OPTIONS.map((m) => (
                            <button key={m.id} type="button" onClick={() => { handleModeSelect(m.id); setStyleDropdownOpen(false); }} className={`mode-dd-item ${activeMode === m.id ? "mode-dd-active" : ""}`}>
                              {m.icon}<span>{m.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {activeMode === "sohbet" && (
                      <div className="relative" ref={styleDropdownRef}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setStyleDropdownOpen(v => !v); setModeDropdownOpen(false); }}
                          className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl text-[11px] font-medium transition-all"
                          style={{ background: "var(--bg-tertiary)", color: selectedStyle !== "sohbet" ? "var(--accent-primary)" : "var(--text-secondary)" }}
                        >
                          <span>{SOHBET_STYLES.find(s => s.id === selectedStyle)?.label ?? "Normal"}</span>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: styleDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </button>
                        {styleDropdownOpen && (
                          <div className="absolute bottom-10 left-0 rounded-xl overflow-hidden z-50" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", boxShadow: "var(--shadow-lg)", minWidth: 120 }} onClick={(e) => e.stopPropagation()}>
                            {SOHBET_STYLES.map((s) => (
                              <button key={s.id} type="button" onClick={() => { setSelectedStyle(s.id); setStyleDropdownOpen(false); }} className={`mode-dd-item ${selectedStyle === s.id ? "mode-dd-active" : ""}`}>
                                <span>{s.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button type="button" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="flex h-8 w-8 items-center justify-center rounded-full transition-all" style={{ color: "var(--text-tertiary)" }} title="Görsel ekle">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                      </svg>
                    </button>
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={(e) => { e.stopPropagation(); handleSend(); }} disabled={(!input.trim() && !imagePreview) || isLoading}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-all active:scale-95"
                      style={{ background: (input.trim() || imagePreview) && !isLoading ? "var(--gradient-primary)" : "var(--bg-tertiary)", color: (input.trim() || imagePreview) && !isLoading ? "white" : "var(--text-tertiary)", boxShadow: "none", opacity: (!input.trim() && !imagePreview) || isLoading ? 0.4 : 1 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat input bar */
            <div
              className="chat-input-bar max-w-[720px] mx-auto rounded-2xl px-3 py-2.5 sm:px-4 cursor-text"
              style={{ background: "var(--bg-card)" }}
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
            <div className="flex items-center gap-2">
              {/* Left */}
              <div className="flex gap-1 flex-shrink-0 items-center">
                <button
                  onClick={(e) => { e.stopPropagation(); setIsListening(!isListening); }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition-all"
                  style={{ background: "transparent", color: isListening ? "var(--accent-danger)" : "var(--text-tertiary)" }}
                >
                  <IconMic size={17} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition-all"
                  style={{ background: "transparent", color: "var(--text-tertiary)" }}
                  title="Görsel ekle"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              </div>

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
                  isLoading ? "Yanıt bekleniyor..." : isMobile ? "Mesajını yaz..." : "Mesajını yaz veya sesli konuş..."
                }
                disabled={isLoading}
                className="flex-1 bg-transparent text-[13px] sm:text-sm outline-none disabled:opacity-50 resize-none leading-relaxed"
                style={{ color: "var(--text-primary)", minHeight: "24px", maxHeight: "200px", overflowY: "auto", padding: 0 }}
              />

              {/* Right */}
              <div className="flex gap-1 flex-shrink-0 items-center relative">
                {/* 1st: Mode dropdown — hidden once conversation started */}
                {!hasUserMessages && (
                  <div className="relative" ref={modeDropdownRef}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setModeDropdownOpen(v => !v); setStyleDropdownOpen(false); }}
                      className="flex items-center gap-1 h-8 px-2.5 rounded-xl text-[11px] font-medium transition-all"
                      style={{ background: "var(--bg-tertiary)", color: activeMode !== "sohbet" ? "var(--accent-primary)" : "var(--text-secondary)" }}
                    >
                      {MODE_OPTIONS.find(m => m.id === activeMode)?.icon}
                      <span>{MODE_OPTIONS.find(m => m.id === activeMode)?.label}</span>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: modeDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    {modeDropdownOpen && (
                      <div
                        className="absolute bottom-10 right-0 rounded-xl overflow-hidden z-50"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", boxShadow: "var(--shadow-lg)", minWidth: 130 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {MODE_OPTIONS.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => { handleModeSelect(m.id); setStyleDropdownOpen(false); }}
                            className={`mode-dd-item ${activeMode === m.id ? "mode-dd-active" : ""}`}
                          >
                            {m.icon}
                            <span>{m.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2nd: Style dropdown (only when sohbet and no messages yet) */}
                {!hasUserMessages && activeMode === "sohbet" && (
                  <div className="relative" ref={styleDropdownRef}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setStyleDropdownOpen(v => !v); setModeDropdownOpen(false); }}
                      className="flex items-center gap-1 h-8 px-2.5 rounded-xl text-[11px] font-medium transition-all"
                      style={{ background: "var(--bg-tertiary)", color: selectedStyle !== "sohbet" ? "var(--accent-primary)" : "var(--text-secondary)" }}
                    >
                      <span>{SOHBET_STYLES.find(s => s.id === selectedStyle)?.label ?? "Normal"}</span>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: styleDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    {styleDropdownOpen && (
                      <div
                        className="absolute bottom-10 right-0 rounded-xl overflow-hidden z-50"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", boxShadow: "var(--shadow-lg)", minWidth: 120 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {SOHBET_STYLES.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => { setSelectedStyle(s.id); setStyleDropdownOpen(false); }}
                            className={`mode-dd-item ${selectedStyle === s.id ? "mode-dd-active" : ""}`}
                          >
                            <span>{s.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => { e.stopPropagation(); handleSend(); }}
                  disabled={(!input.trim() && !imagePreview) || isLoading}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 active:scale-95"
                  style={{
                    background: (input.trim() || imagePreview) && !isLoading ? "var(--gradient-primary)" : "transparent",
                    color: (input.trim() || imagePreview) && !isLoading ? "white" : "var(--text-tertiary)",
                    boxShadow: "none",
                  }}
                >
                  <IconSend size={17} />
                </button>
              </div>
            </div>
          </div>
          )}

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
