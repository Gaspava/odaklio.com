"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend } from "../icons/Icons";
import ChatMessageRenderer from "./ChatMessageRenderer";
import { useConversation, type ChatMessage } from "@/app/providers/ConversationProvider";

/* ===== TYPES ===== */
interface NoteChatProps {
  isMobile?: boolean;
}

type NoteBlock =
  | { type: "title"; text: string }
  | { type: "section"; text: string }
  | { type: "text"; text: string }
  | { type: "highlight"; text: string }
  | { type: "key"; text: string };

/* ===== NOTE CONTENT PARSER ===== */
function parseNoteContent(content: string): NoteBlock[] {
  const blocks: NoteBlock[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const titleMatch = line.match(/\[NOTE_TITLE\](.*?)\[\/NOTE_TITLE\]/);
    if (titleMatch) {
      blocks.push({ type: "title", text: titleMatch[1].trim() });
      continue;
    }
    const sectionMatch = line.match(/\[NOTE_SECTION\](.*?)\[\/NOTE_SECTION\]/);
    if (sectionMatch) {
      blocks.push({ type: "section", text: sectionMatch[1].trim() });
      continue;
    }
    const highlightMatch = line.match(/\[NOTE_HIGHLIGHT\](.*?)\[\/NOTE_HIGHLIGHT\]/);
    if (highlightMatch) {
      blocks.push({ type: "highlight", text: highlightMatch[1].trim() });
      continue;
    }
    const keyMatch = line.match(/\[NOTE_KEY\](.*?)\[\/NOTE_KEY\]/);
    if (keyMatch) {
      blocks.push({ type: "key", text: keyMatch[1].trim() });
      continue;
    }
    if (line.trim()) {
      blocks.push({ type: "text", text: line });
    }
  }
  return blocks;
}

/* ===== STREAMING HELPER ===== */
async function streamChat(
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onError: (error: string) => void,
  onDone: () => void,
  mode?: string
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, mode }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || `API hatasi: ${res.status}`);
  }
  const reader = res.body?.getReader();
  if (!reader) throw new Error("Stream okunamadi");
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
        if (parsed.text) onChunk(parsed.text);
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
      <div
        className="typing-dot w-2 h-2 rounded-full"
        style={{ background: "var(--accent-primary)" }}
      />
      <div
        className="typing-dot w-2 h-2 rounded-full"
        style={{ background: "var(--accent-primary)" }}
      />
      <div
        className="typing-dot w-2 h-2 rounded-full"
        style={{ background: "var(--accent-primary)" }}
      />
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

/* ===== NOTE BLOCK RENDERER ===== */
function NoteBlockRenderer({ block }: { block: NoteBlock }) {
  switch (block.type) {
    case "title":
      return (
        <div className="text-center mb-5">
          <h2
            className="text-xl font-bold pb-2 inline-block"
            style={{ color: "var(--text-primary)" }}
          >
            {block.text}
          </h2>
          <div
            className="h-[2px] rounded-full mx-auto mt-1"
            style={{
              width: "60%",
              background: "linear-gradient(90deg, transparent, var(--accent-secondary), var(--accent-primary), transparent)",
            }}
          />
        </div>
      );

    case "section":
      return (
        <div className="mt-5 mb-2">
          <h3
            className="text-base font-semibold pl-3"
            style={{
              color: "var(--text-primary)",
              borderLeft: "3px solid var(--accent-secondary)",
            }}
          >
            {block.text}
          </h3>
        </div>
      );

    case "text": {
      const isBullet = block.text.trim().startsWith("\u2022");
      if (isBullet) {
        return (
          <div className="flex items-start gap-2 pl-4 my-1">
            <span
              className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--accent-secondary)" }}
            />
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {block.text.trim().slice(1).trim()}
            </p>
          </div>
        );
      }
      return (
        <p
          className="text-[13px] leading-relaxed my-1.5 pl-1"
          style={{ color: "var(--text-secondary)" }}
        >
          {block.text}
        </p>
      );
    }

    case "highlight":
      return (
        <div
          className="rounded-xl p-4 my-2"
          style={{
            background: "rgba(59, 130, 246, 0.06)",
            border: "1px solid rgba(59, 130, 246, 0.15)",
          }}
        >
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {block.text}
          </p>
        </div>
      );

    case "key":
      return (
        <div
          className="rounded-xl p-4 my-2 flex items-start gap-2.5"
          style={{
            background: "rgba(16, 185, 129, 0.06)",
            border: "1px solid rgba(16, 185, 129, 0.15)",
          }}
        >
          <span className="text-sm flex-shrink-0 mt-0.5">&#128273;</span>
          <p
            className="text-[13px] leading-relaxed font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {block.text}
          </p>
        </div>
      );

    default:
      return null;
  }
}

/* ===== COPY ICON ===== */
function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

/* ===== CHECK ICON ===== */
function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ===== MAIN COMPONENT ===== */
const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Merhaba! Ben Not Alma asistaninirim. Bir konu soyle, sana duzenli ve yapilandirilmis notlar hazirlayayim.\n\nOrnek: \"Kuantum fizigi temel kavramlar\" veya \"Osmanli tarihi kurulus donemi\"",
  timestamp: new Date(),
};

export default function NoteChat({ isMobile = false }: NoteChatProps) {
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
  const [noteContent, setNoteContent] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstMessageRef = useRef(true);

  // Load conversation on mount if active
  useEffect(() => {
    if (activeConversationId) {
      isFirstMessageRef.current = false;
      setIsInitialLoading(true);
      loadConversation(activeConversationId).then((loaded) => {
        if (loaded.length > 0) {
          setMessages([welcomeMessage, ...loaded]);
          // Find the last assistant message to display as note
          const lastAi = [...loaded].reverse().find((m) => m.role === "assistant");
          if (lastAi) {
            setNoteContent(lastAi.content);
          }
        }
        setIsInitialLoading(false);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to top of note area when note updates
  useEffect(() => {
    if (noteContent && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [noteContent]);

  const sendToAI = useCallback(
    async (userContent: string, allMessages: ChatMessage[]) => {
      setIsLoading(true);

      // Save user message to DB
      let conversationId: string;
      const isFirst = isFirstMessageRef.current;
      try {
        const result = await saveUserMessage(userContent, null, "note");
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
            setNoteContent((prev) => prev + text);
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
            setNoteContent("");
          },
          () => {
            setIsLoading(false);
          },
          "note"
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
                  content: `[!danger] Baglanti Hatasi\n${errorMsg}. Lutfen tekrar dene.`,
                }
              : m
          )
        );
        setNoteContent("");
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
    // Reset note content for new response
    setNoteContent("");
    sendToAI(userContent, messages);

    setInput("");
    if (isMobile) {
      inputRef.current?.blur();
    }
  }, [input, isLoading, sendToAI, isMobile, messages]);

  const handleCopyNote = useCallback(() => {
    if (!noteContent) return;
    const blocks = parseNoteContent(noteContent);
    const plainText = blocks
      .map((b) => {
        if (b.type === "title") return `${b.text}\n${"=".repeat(b.text.length)}`;
        if (b.type === "section") return `\n## ${b.text}`;
        if (b.type === "highlight") return `> ${b.text}`;
        if (b.type === "key") return `* ${b.text}`;
        return b.text;
      })
      .join("\n");
    navigator.clipboard.writeText(plainText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [noteContent]);

  const handleDetailRequest = useCallback(() => {
    if (isLoading) return;
    const userContent = "Bu notu daha detayli anlat";
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setNoteContent("");
    sendToAI(userContent, messages);
  }, [isLoading, sendToAI, messages]);

  const quickPrompts = [
    { text: "Kuantum fizigi", icon: "\u269b\ufe0f" },
    { text: "Osmanli tarihi", icon: "\ud83c\udff0" },
    { text: "Python programlama", icon: "\ud83d\udc0d" },
  ];

  const noteBlocks = noteContent ? parseNoteContent(noteContent) : [];
  const hasNoteBlocks = noteBlocks.length > 0;
  const userMessages = messages.filter(
    (m) => m.role === "user" && m.id !== "welcome"
  );

  if (isInitialLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3">
        <div className="auth-spinner" style={{ width: 28, height: 28 }} />
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Notlar yukleniyor...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Note Display Area / Welcome */}
      <div
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 ${isMobile ? "pb-2" : ""}`}
      >
        {hasNoteBlocks ? (
          /* ===== RENDERED NOTE CARD ===== */
          <div className="max-w-[720px] mx-auto">
            <div
              className="rounded-2xl p-6 animate-msg-in"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              {noteBlocks.map((block, idx) => (
                <NoteBlockRenderer key={idx} block={block} />
              ))}

              {/* Loading indicator while streaming */}
              {isLoading && <TypingIndicator />}
            </div>

            {/* Note Action Buttons */}
            {!isLoading && (
              <div className="flex items-center justify-center gap-2.5 mt-4 animate-fade-in">
                <button
                  onClick={handleCopyNote}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all active:scale-[0.97]"
                  style={{
                    background: copied
                      ? "rgba(16, 185, 129, 0.1)"
                      : "var(--bg-card)",
                    border: copied
                      ? "1px solid rgba(16, 185, 129, 0.3)"
                      : "1px solid var(--border-primary)",
                    color: copied
                      ? "var(--accent-primary)"
                      : "var(--text-secondary)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied ? "Kopyalandi!" : "Kopyala"}
                </button>

                <button
                  onClick={handleDetailRequest}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium transition-all active:scale-[0.97]"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-primary)",
                    color: "var(--accent-secondary)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                  Detaylandir
                </button>
              </div>
            )}

            {/* Compact Message History */}
            {userMessages.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 text-[11px] font-medium transition-all"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: showHistory ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  Sohbet Gecmisi ({userMessages.length})
                </button>

                {showHistory && (
                  <div className="flex flex-wrap gap-1.5 mt-2 animate-fade-in">
                    {userMessages.map((msg) => (
                      <span
                        key={msg.id}
                        className="inline-block rounded-full px-3 py-1 text-[11px] truncate max-w-[200px]"
                        style={{
                          background: "var(--bg-tertiary)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-primary)",
                        }}
                      >
                        {msg.content}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ===== WELCOME STATE ===== */
          <div className="max-w-[720px] mx-auto space-y-5 sm:space-y-6">
            {/* Welcome Message */}
            <div className="flex justify-start animate-msg-in">
              <AiAvatar />
              <div className="max-w-[92%] sm:max-w-[88%]">
                <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 msg-ai">
                  {isLoading ? (
                    <TypingIndicator />
                  ) : (
                    <ChatMessageRenderer content={welcomeMessage.content} />
                  )}
                </div>
              </div>
            </div>

            {/* Quick Prompts (only when no messages sent yet) */}
            {messages.length <= 1 && (
              <div
                className="mt-8 sm:mt-10 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="text-center mb-6">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-float"
                    style={{
                      background: "var(--accent-primary-light)",
                      boxShadow: "var(--shadow-glow-sm)",
                    }}
                  >
                    <span className="text-2xl">{"\ud83d\udcdd"}</span>
                  </div>
                  <h2
                    className="text-base font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Hangi konuda not hazirlayalim?
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Bir konu sec ya da kendi konunu yaz
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2.5">
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
        )}
      </div>

      {/* Input Bar */}
      <div
        className={`flex-shrink-0 px-3 sm:px-4 ${isMobile ? "pb-2" : "pb-4"}`}
      >
        <div
          className="max-w-[720px] mx-auto flex items-center gap-2 rounded-2xl px-3 py-2.5 sm:px-4 transition-all"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: input.trim()
              ? "var(--shadow-glow-sm)"
              : "var(--shadow-md)",
            borderColor: input.trim()
              ? "rgba(59, 130, 246, 0.2)"
              : "var(--border-primary)",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              isLoading
                ? "Not hazirlaniyor..."
                : "Not konusu yaz... (or: Biyoloji hucre yapisi)"
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
            <span
              style={{ color: "var(--accent-secondary)", opacity: 0.6 }}
            >
              {"\u25cf"}
            </span>
            Konu yaz, yapilandirilmis notlarini al
          </p>
        )}
      </div>
    </div>
  );
}
