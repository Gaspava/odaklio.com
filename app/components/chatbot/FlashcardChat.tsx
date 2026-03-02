"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend, IconChevronLeft, IconChevronRight } from "../icons/Icons";
import {
  useConversation,
  type ChatMessage,
} from "@/app/providers/ConversationProvider";

/* ===== TYPES ===== */
interface FlashcardChatProps {
  isMobile?: boolean;
}

interface Flashcard {
  question: string;
  answer: string;
}

/* ===== FLASHCARD PARSER ===== */
function parseFlashcards(content: string): Flashcard[] {
  const regex = /\[FLASHCARD\]([\s\S]*?)\|([\s\S]*?)\[\/FLASHCARD\]/g;
  const cards: Flashcard[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    cards.push({ question: match[1].trim(), answer: match[2].trim() });
  }
  return cards;
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
      <div
        className="typing-dot w-2 h-2 rounded-full"
        style={{ background: "var(--accent-warning)" }}
      />
      <div
        className="typing-dot w-2 h-2 rounded-full"
        style={{ background: "var(--accent-warning)" }}
      />
      <div
        className="typing-dot w-2 h-2 rounded-full"
        style={{ background: "var(--accent-warning)" }}
      />
    </div>
  );
}

/* ===== FLASHCARD CARD COMPONENT ===== */
function FlashcardCard({
  card,
  isFlipped,
  onFlip,
}: {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      className="w-full max-w-[400px] mx-auto cursor-pointer"
      style={{ perspective: "1000px", height: 250 }}
      onClick={onFlip}
    >
      <div
        className="relative w-full h-full"
        style={{
          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front - Question */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl px-6 py-5 gap-3"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: "var(--bg-card)",
            border: "2px solid var(--accent-warning)",
            boxShadow:
              "0 0 24px rgba(245, 158, 11, 0.12), var(--shadow-lg)",
          }}
        >
          <span className="text-3xl mb-1" aria-hidden="true">
            &#10067;
          </span>
          <p
            className="text-center text-sm sm:text-base font-medium leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            {card.question}
          </p>
          <p
            className="text-[10px] mt-auto"
            style={{ color: "var(--text-tertiary)" }}
          >
            Cevabi gormek icin tikla
          </p>
        </div>

        {/* Back - Answer */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl px-6 py-5 gap-3"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background:
              "linear-gradient(135deg, var(--bg-card) 0%, rgba(16, 185, 129, 0.06) 100%)",
            border: "2px solid var(--accent-primary)",
            boxShadow:
              "0 0 24px rgba(16, 185, 129, 0.12), var(--shadow-lg)",
          }}
        >
          <span className="text-3xl mb-1" aria-hidden="true">
            &#128161;
          </span>
          <p
            className="text-center text-sm sm:text-base font-medium leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            {card.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== SCORE SUMMARY ===== */
function ScoreSummary({
  correct,
  incorrect,
  total,
  onReset,
}: {
  correct: number;
  incorrect: number;
  total: number;
  onReset: () => void;
}) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div
      className="w-full max-w-[400px] mx-auto rounded-2xl p-6 flex flex-col items-center gap-4 animate-fade-in"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div
        className="flex items-center justify-center w-16 h-16 rounded-full mb-1"
        style={{
          background:
            percentage >= 70
              ? "rgba(16, 185, 129, 0.12)"
              : percentage >= 40
              ? "rgba(245, 158, 11, 0.12)"
              : "rgba(239, 68, 68, 0.12)",
        }}
      >
        <span className="text-3xl">
          {percentage >= 70 ? "\uD83C\uDF89" : percentage >= 40 ? "\uD83D\uDCAA" : "\uD83D\uDCDA"}
        </span>
      </div>

      <h3
        className="text-lg font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Tamamlandi!
      </h3>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-center">
          <span
            className="text-2xl font-bold"
            style={{ color: "var(--accent-primary)" }}
          >
            {correct}
          </span>
          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--text-tertiary)" }}
          >
            Dogru
          </span>
        </div>
        <div
          className="w-px h-8"
          style={{ background: "var(--border-primary)" }}
        />
        <div className="flex flex-col items-center">
          <span
            className="text-2xl font-bold"
            style={{ color: "var(--accent-danger)" }}
          >
            {incorrect}
          </span>
          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--text-tertiary)" }}
          >
            Yanlis
          </span>
        </div>
        <div
          className="w-px h-8"
          style={{ background: "var(--border-primary)" }}
        />
        <div className="flex flex-col items-center">
          <span
            className="text-2xl font-bold"
            style={{ color: "var(--accent-warning)" }}
          >
            %{percentage}
          </span>
          <span
            className="text-[11px] font-medium"
            style={{ color: "var(--text-tertiary)" }}
          >
            Basari
          </span>
        </div>
      </div>

      <button
        onClick={onReset}
        className="mt-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
        style={{
          background: "var(--gradient-primary)",
          boxShadow: "var(--shadow-glow-sm)",
        }}
      >
        Yeni kartlar iste
      </button>
    </div>
  );
}

/* ===== MAIN COMPONENT ===== */
const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Merhaba! Ben Flashcard asistanin. Bir konu soyle, sana hafiza kartlari hazirlayayim.\n\nOrnek: \"Biyoloji hucre bolunmesi\" veya \"Ingilizce temel fiiller\"",
  timestamp: new Date(),
};

export default function FlashcardChat({
  isMobile = false,
}: FlashcardChatProps) {
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

  // Flashcard state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [scores, setScores] = useState({ correct: 0, incorrect: 0 });
  const [isReviewComplete, setIsReviewComplete] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isFirstMessageRef = useRef(true);

  // Load conversation on mount if there's an active one
  useEffect(() => {
    if (activeConversationId) {
      isFirstMessageRef.current = false;
      setIsInitialLoading(true);
      loadConversation(activeConversationId).then((loaded) => {
        if (loaded.length > 0) {
          setMessages([welcomeMessage, ...loaded]);
          // Parse flashcards from the last assistant message
          const lastAi = [...loaded].reverse().find((m) => m.role === "assistant");
          if (lastAi) {
            const parsed = parseFlashcards(lastAi.content);
            if (parsed.length > 0) {
              setFlashcards(parsed);
              setCurrentCardIndex(0);
              setIsFlipped(false);
              setScores({ correct: 0, incorrect: 0 });
              setIsReviewComplete(false);
            }
          }
        }
        setIsInitialLoading(false);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll messages area to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  /* ===== SEND TO AI ===== */
  const sendToAI = useCallback(
    async (userContent: string, allMessages: ChatMessage[]) => {
      setIsLoading(true);

      // Save user message to DB
      let conversationId: string;
      const isFirst = isFirstMessageRef.current;
      try {
        const result = await saveUserMessage(userContent, null, "flashcard");
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
                  ? { ...m, content: `Hata: ${error}` }
                  : m
              )
            );
          },
          () => {
            setIsLoading(false);
          },
          "flashcard"
        );

        // Parse flashcards from the completed response
        if (fullContent) {
          const parsed = parseFlashcards(fullContent);
          if (parsed.length > 0) {
            setFlashcards(parsed);
            setCurrentCardIndex(0);
            setIsFlipped(false);
            setScores({ correct: 0, incorrect: 0 });
            setIsReviewComplete(false);
          }
        }

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
                  content: `Baglanti Hatasi: ${errorMsg}. Lutfen tekrar dene.`,
                }
              : m
          )
        );
        setIsLoading(false);
      }
    },
    [saveUserMessage, saveAssistantMessage, generateTitle, refreshConversations]
  );

  /* ===== HANDLE SEND ===== */
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

  /* ===== CARD NAVIGATION ===== */
  const goToNextCard = useCallback(() => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex, flashcards.length]);

  const goToPrevCard = useCallback(() => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentCardIndex]);

  const handleKnow = useCallback(() => {
    setScores((prev) => ({ ...prev, correct: prev.correct + 1 }));
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsReviewComplete(true);
    }
  }, [currentCardIndex, flashcards.length]);

  const handleDontKnow = useCallback(() => {
    setScores((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsReviewComplete(true);
    }
  }, [currentCardIndex, flashcards.length]);

  const handleResetCards = useCallback(() => {
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setScores({ correct: 0, incorrect: 0 });
    setIsReviewComplete(false);
    inputRef.current?.focus();
  }, []);

  /* ===== QUICK PROMPTS ===== */
  const quickPrompts = [
    { text: "Biyoloji hucre yapisi", icon: "\uD83E\uDDEC" },
    { text: "Fizik formulleri", icon: "\u26A1" },
    { text: "Tarih onemli olaylar", icon: "\uD83D\uDCDC" },
  ];

  const hasNonWelcomeMessages = messages.length > 1;

  /* ===== LOADING STATE ===== */
  if (isInitialLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3">
        <div className="auth-spinner" style={{ width: 28, height: 28 }} />
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Kartlar yukleniyor...
        </p>
      </div>
    );
  }

  /* ===== PROGRESS BAR WIDTH ===== */
  const totalAnswered = scores.correct + scores.incorrect;
  const progressPercent =
    flashcards.length > 0
      ? Math.round((totalAnswered / flashcards.length) * 100)
      : 0;
  const correctPercent =
    totalAnswered > 0
      ? Math.round((scores.correct / totalAnswered) * 100)
      : 0;

  return (
    <div className="flex flex-col h-full">
      {/* ===== FLASHCARD DISPLAY AREA ===== */}
      {flashcards.length > 0 && !isReviewComplete && (
        <div
          className="flex-shrink-0 px-3 sm:px-4 py-4 sm:py-6"
          style={{
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <div className="max-w-[480px] mx-auto flex flex-col items-center gap-4">
            {/* Card */}
            <FlashcardCard
              card={flashcards[currentCardIndex]}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped((prev) => !prev)}
            />

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={goToPrevCard}
                disabled={currentCardIndex === 0}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-all disabled:opacity-20 active:scale-90"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <IconChevronLeft size={16} />
              </button>

              <span
                className="text-sm font-semibold tabular-nums min-w-[48px] text-center"
                style={{ color: "var(--text-secondary)" }}
              >
                {currentCardIndex + 1}/{flashcards.length}
              </span>

              <button
                onClick={goToNextCard}
                disabled={currentCardIndex === flashcards.length - 1}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-all disabled:opacity-20 active:scale-90"
                style={{
                  background: "var(--bg-tertiary)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <IconChevronRight size={16} />
              </button>
            </div>

            {/* Know / Don't Know Buttons */}
            <div className="flex items-center gap-3 w-full max-w-[320px]">
              <button
                onClick={handleDontKnow}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "var(--accent-danger)",
                  border: "1px solid rgba(239, 68, 68, 0.25)",
                }}
              >
                <span aria-hidden="true">&#10060;</span>
                Bilmiyorum
              </button>
              <button
                onClick={handleKnow}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "var(--accent-primary)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                }}
              >
                <span aria-hidden="true">&#9989;</span>
                Biliyorum
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-[320px]">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-[10px] font-medium"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Ilerleme
                </span>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {totalAnswered}/{flashcards.length} kart
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <div className="h-full rounded-full flex overflow-hidden transition-all duration-500">
                  {/* Correct portion */}
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${flashcards.length > 0 ? (scores.correct / flashcards.length) * 100 : 0}%`,
                      background: "var(--accent-primary)",
                    }}
                  />
                  {/* Incorrect portion */}
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${flashcards.length > 0 ? (scores.incorrect / flashcards.length) * 100 : 0}%`,
                      background: "var(--accent-danger)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SCORE SUMMARY ===== */}
      {isReviewComplete && (
        <div
          className="flex-shrink-0 px-3 sm:px-4 py-6"
          style={{
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          <ScoreSummary
            correct={scores.correct}
            incorrect={scores.incorrect}
            total={flashcards.length}
            onReset={handleResetCards}
          />
        </div>
      )}

      {/* ===== MESSAGES AREA ===== */}
      <div
        className={`flex-1 overflow-y-auto px-3 sm:px-4 py-3 sm:py-4 ${isMobile ? "pb-2" : ""}`}
      >
        <div className="max-w-[720px] mx-auto space-y-3">
          {messages.map((msg, idx) => {
            // Show welcome message fully
            if (msg.id === "welcome") {
              return (
                <div
                  key={msg.id}
                  className="flex justify-start animate-msg-in"
                  style={{ animationDelay: "0s" }}
                >
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg mr-2.5 mt-1 text-white text-[11px] font-bold relative"
                    style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
                  >
                    F
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                      style={{
                        background: "var(--accent-success, #10b981)",
                        borderColor: "var(--bg-primary)",
                      }}
                    />
                  </div>
                  <div className="max-w-[88%]">
                    <div className="msg-ai px-3.5 py-3 sm:px-4 sm:py-3.5">
                      <p
                        className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-line"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // User messages - right aligned bubbles
            if (msg.role === "user") {
              return (
                <div
                  key={msg.id}
                  className="flex justify-end animate-msg-in"
                  style={{
                    animationDelay: `${Math.min(idx * 0.03, 0.2)}s`,
                  }}
                >
                  <div className="max-w-[85%] sm:max-w-[70%]">
                    <div className="msg-user px-3.5 py-2.5 sm:px-4 sm:py-3">
                      <p className="text-[13px] sm:text-sm leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // AI messages - compact form (raw text without card rendering)
            return (
              <div
                key={msg.id}
                className="flex justify-start animate-msg-in"
                style={{
                  animationDelay: `${Math.min(idx * 0.03, 0.2)}s`,
                }}
              >
                {/* Avatar */}
                <div
                  className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg mr-2.5 mt-1 text-white text-[11px] font-bold relative"
                  style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}
                >
                  F
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
                    style={{
                      background: "var(--accent-success, #10b981)",
                      borderColor: "var(--bg-primary)",
                    }}
                  />
                </div>
                <div className="max-w-[88%]">
                  <div className="msg-ai px-3.5 py-2.5 sm:px-4 sm:py-3">
                    {msg.content ? (
                      <p
                        className="text-[12px] sm:text-[13px] leading-relaxed line-clamp-3"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {/* Strip flashcard tags for display */}
                        {msg.content
                          .replace(/\[FLASHCARD\][\s\S]*?\[\/FLASHCARD\]/g, "")
                          .trim() || "Kartlar hazir!"}
                      </p>
                    ) : (
                      isLoading &&
                      msg.id === messages[messages.length - 1]?.id && (
                        <TypingIndicator />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts - show when no real messages */}
        {!hasNonWelcomeMessages && (
          <div
            className="max-w-[720px] mx-auto mt-8 sm:mt-10 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="text-center mb-6">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-float"
                style={{
                  background: "rgba(245, 158, 11, 0.1)",
                  boxShadow: "0 0 24px rgba(245, 158, 11, 0.08)",
                }}
              >
                <span className="text-2xl">&#127183;</span>
              </div>
              <h2
                className="text-base font-bold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Flashcard olustur
              </h2>
              <p
                className="text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                Bir konu sec veya kendi konunu yaz
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

      {/* ===== INPUT BAR ===== */}
      <div
        className={`flex-shrink-0 px-3 sm:px-4 ${isMobile ? "pb-2" : "pb-4"}`}
      >
        <div
          className="max-w-[720px] mx-auto flex items-center gap-2 rounded-2xl px-3 py-2.5 sm:px-4 transition-all"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: input.trim()
              ? "0 0 16px rgba(245, 158, 11, 0.1)"
              : "var(--shadow-md)",
            borderColor: input.trim()
              ? "rgba(245, 158, 11, 0.3)"
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
                ? "Kartlar hazirlaniyor..."
                : "Bir konu yaz... (or: Fizik formulleri)"
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
                  ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  : "var(--bg-tertiary)",
              color:
                input.trim() && !isLoading
                  ? "white"
                  : "var(--text-tertiary)",
              boxShadow:
                input.trim() && !isLoading
                  ? "0 0 12px rgba(245, 158, 11, 0.3)"
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
            <span style={{ color: "var(--accent-warning)", opacity: 0.6 }}>
              &#9679;
            </span>
            Bir konu yaz, AI sana flashcard hazirlayacak
          </p>
        )}
      </div>
    </div>
  );
}
