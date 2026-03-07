"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconChevronLeft } from "../icons/Icons";

interface DebateMessage {
  id: string;
  speaker: "A" | "B";
  content: string;
  timestamp: Date;
}

type DebatePhase = "setup" | "debating" | "finished";
type ModeratorAction = "continue" | "redirect" | null;

export default function AIDebateDetail({ onBack }: { onBack: () => void }) {
  const [topicA, setTopicA] = useState("");
  const [topicB, setTopicB] = useState("");
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [phase, setPhase] = useState<DebatePhase>("setup");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<"A" | "B">("A");
  const [streamingText, setStreamingText] = useState("");
  const [moderatorAction, setModeratorAction] = useState<ModeratorAction>(null);
  const [redirectText, setRedirectText] = useState("");
  const [roundCount, setRoundCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, scrollToBottom]);

  const fetchDebateResponse = useCallback(async (
    speaker: "A" | "B",
    history: DebateMessage[],
    moderatorNote?: string
  ) => {
    setIsStreaming(true);
    setStreamingText("");
    setCurrentSpeaker(speaker);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/ai-debate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicA,
          topicB,
          history: history.map((m) => ({
            role: "assistant",
            speaker: m.speaker,
            content: m.content,
          })),
          speaker,
          moderatorNote,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error("API hatasi");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream okunamamasi");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setStreamingText(fullText);
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }

      const newMessage: DebateMessage = {
        id: `${speaker}-${Date.now()}`,
        speaker,
        content: fullText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setStreamingText("");
      setIsStreaming(false);
      return newMessage;
    } catch (error) {
      if ((error as Error).name === "AbortError") return null;
      setIsStreaming(false);
      setStreamingText("");
      return null;
    }
  }, [topicA, topicB]);

  const startDebate = async () => {
    if (!topicA.trim() || !topicB.trim()) return;
    setPhase("debating");
    setMessages([]);
    setRoundCount(1);

    const msgA = await fetchDebateResponse("A", []);
    if (!msgA) return;

    await fetchDebateResponse("B", [msgA]);
  };

  const handleContinue = async () => {
    setModeratorAction(null);
    setRoundCount((r) => r + 1);

    const nextSpeaker = messages.length > 0 && messages[messages.length - 1].speaker === "B" ? "A" : "B";

    const msgFirst = await fetchDebateResponse(nextSpeaker, messages);
    if (!msgFirst) return;

    const otherSpeaker = nextSpeaker === "A" ? "B" : "A";
    await fetchDebateResponse(otherSpeaker, [...messages, msgFirst]);
  };

  const handleRedirect = async () => {
    if (!redirectText.trim()) return;
    setModeratorAction(null);
    setRoundCount((r) => r + 1);

    const nextSpeaker = messages.length > 0 && messages[messages.length - 1].speaker === "B" ? "A" : "B";

    const msgFirst = await fetchDebateResponse(nextSpeaker, messages, redirectText);
    if (!msgFirst) return;

    const otherSpeaker = nextSpeaker === "A" ? "B" : "A";
    await fetchDebateResponse(otherSpeaker, [...messages, msgFirst], redirectText);
    setRedirectText("");
  };

  const endDebate = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setPhase("finished");
    setIsStreaming(false);
    setStreamingText("");
  };

  const resetDebate = () => {
    setPhase("setup");
    setMessages([]);
    setTopicA("");
    setTopicB("");
    setRoundCount(0);
    setModeratorAction(null);
    setRedirectText("");
    setStreamingText("");
  };

  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  // ===== SETUP PHASE =====
  if (phase === "setup") {
    return (
      <div className="space-y-6 animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <IconChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              AI Tartisma Arenasi
            </h2>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Iki yapay zeka karsi karsiya - sen moderatorsun
            </p>
          </div>
        </div>

        {/* Arena Visual */}
        <div className="relative rounded-2xl p-8 overflow-hidden" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)" }}>
          <div className="absolute inset-0 opacity-5" style={{
            background: "radial-gradient(circle at 20% 50%, #ef4444, transparent 50%), radial-gradient(circle at 80% 50%, #3b82f6, transparent 50%)"
          }} />

          <div className="relative flex items-center justify-between gap-6">
            {/* AI Alpha */}
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239, 68, 68, 0.15)" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4 4 0 0 1 4 4v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6a4 4 0 0 1 4-4z"/>
                  <rect x="8" y="10" width="8" height="8" rx="1"/>
                  <path d="M10 18v2"/><path d="M14 18v2"/>
                  <circle cx="10" cy="13.5" r="1" fill="#ef4444"/>
                  <circle cx="14" cy="13.5" r="1" fill="#ef4444"/>
                </svg>
              </div>
              <div className="text-base font-bold" style={{ color: "#ef4444" }}>Alpha</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Savunucu #1</div>
            </div>

            {/* VS Badge */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-base" style={{
                background: "linear-gradient(135deg, #ef4444 0%, #8b5cf6 50%, #3b82f6 100%)",
                color: "white",
                boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)"
              }}>
                VS
              </div>
            </div>

            {/* AI Beta */}
            <div className="flex-1 text-center">
              <div className="w-20 h-20 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: "rgba(59, 130, 246, 0.15)" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4 4 0 0 1 4 4v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6a4 4 0 0 1 4-4z"/>
                  <rect x="8" y="10" width="8" height="8" rx="1"/>
                  <path d="M10 18v2"/><path d="M14 18v2"/>
                  <circle cx="10" cy="13.5" r="1" fill="#3b82f6"/>
                  <circle cx="14" cy="13.5" r="1" fill="#3b82f6"/>
                </svg>
              </div>
              <div className="text-base font-bold" style={{ color: "#3b82f6" }}>Beta</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Savunucu #2</div>
            </div>
          </div>
        </div>

        {/* Topic Inputs */}
        <div className="space-y-4">
          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "2px solid rgba(239, 68, 68, 0.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>A</div>
              <span className="text-sm font-semibold" style={{ color: "#ef4444" }}>Alpha&apos;nin Fikri</span>
            </div>
            <input
              type="text"
              value={topicA}
              onChange={(e) => setTopicA(e.target.value)}
              placeholder="Ornegin: Uzaktan egitim geleneksel egitimden daha etkilidir"
              className="w-full text-base rounded-xl px-4 py-3 outline-none transition-all"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-primary)",
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={(e) => e.target.style.borderColor = "#ef4444"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
            />
          </div>

          <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "2px solid rgba(59, 130, 246, 0.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }}>B</div>
              <span className="text-sm font-semibold" style={{ color: "#3b82f6" }}>Beta&apos;nin Fikri</span>
            </div>
            <input
              type="text"
              value={topicB}
              onChange={(e) => setTopicB(e.target.value)}
              placeholder="Ornegin: Yuz yuze egitim her zaman daha verimlidir"
              className="w-full text-base rounded-xl px-4 py-3 outline-none transition-all"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-primary)",
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-primary)"}
            />
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startDebate}
          disabled={!topicA.trim() || !topicB.trim()}
          className="w-full py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: topicA.trim() && topicB.trim()
              ? "linear-gradient(135deg, #ef4444 0%, #8b5cf6 50%, #3b82f6 100%)"
              : "var(--bg-tertiary)",
            boxShadow: topicA.trim() && topicB.trim()
              ? "0 4px 20px rgba(139, 92, 246, 0.3)"
              : "none",
          }}
        >
          Tartismayi Baslat
        </button>

        {/* How it works */}
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)" }}>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Nasil Calisir?</h3>
          <div className="space-y-3">
            {[
              { step: "1", text: "Her iki tarafa birer fikir yaz", color: "#8b5cf6" },
              { step: "2", text: "AI'lar sirayla fikirlerini savunur", color: "#f59e0b" },
              { step: "3", text: "Sen moderator olarak tartismayi yonlendir", color: "#10b981" },
              { step: "4", text: "\"Devam Et\" veya \"Yonlendir\" ile tartismayi kontrol et", color: "#3b82f6" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: item.color }}>
                  {item.step}
                </div>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===== DEBATING / FINISHED PHASE =====
  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-primary)" }}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <IconChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
              AI Tartisma Arenasi
            </h2>
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Raund {roundCount} {isStreaming && "- Konusuluyor..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {phase === "debating" && (
            <button
              onClick={endDebate}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
              style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
            >
              Bitir
            </button>
          )}
          {phase === "finished" && (
            <button
              onClick={resetDebate}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
              style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}
            >
              Yeni Tartisma
            </button>
          )}
        </div>
      </div>

      {/* Topic Summary Bar */}
      <div className="flex gap-3 py-3 flex-shrink-0">
        <div className="flex-1 rounded-xl px-4 py-2.5" style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.12)" }}>
          <div className="text-[10px] font-bold mb-0.5" style={{ color: "#ef4444" }}>ALPHA</div>
          <div className="text-xs line-clamp-1" style={{ color: "var(--text-secondary)" }}>{topicA}</div>
        </div>
        <div className="flex-1 rounded-xl px-4 py-2.5" style={{ background: "rgba(59, 130, 246, 0.06)", border: "1px solid rgba(59, 130, 246, 0.12)" }}>
          <div className="text-[10px] font-bold mb-0.5" style={{ color: "#3b82f6" }}>BETA</div>
          <div className="text-xs line-clamp-1" style={{ color: "var(--text-secondary)" }}>{topicB}</div>
        </div>
      </div>

      {/* Messages Area - Chat Style */}
      <div className="flex-1 overflow-y-auto py-4 min-h-0 space-y-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} renderText={renderText} />
        ))}

        {/* Streaming message */}
        {isStreaming && streamingText && (
          <ChatBubble
            message={{
              id: "streaming",
              speaker: currentSpeaker,
              content: streamingText,
              timestamp: new Date(),
            }}
            renderText={renderText}
            isStreaming
          />
        )}

        {/* Streaming indicator without text */}
        {isStreaming && !streamingText && (
          <div className={`flex items-center gap-3 ${currentSpeaker === "A" ? "" : "justify-end"}`}>
            <div className={`flex items-center gap-2 px-5 py-3 rounded-2xl ${currentSpeaker === "A" ? "rounded-bl-md" : "rounded-br-md"}`} style={{
              background: currentSpeaker === "A" ? "rgba(239, 68, 68, 0.08)" : "rgba(59, 130, 246, 0.08)",
              border: `1px solid ${currentSpeaker === "A" ? "rgba(239, 68, 68, 0.15)" : "rgba(59, 130, 246, 0.15)"}`,
            }}>
              <span className="text-xs font-semibold" style={{ color: currentSpeaker === "A" ? "#ef4444" : "#3b82f6" }}>
                {currentSpeaker === "A" ? "Alpha" : "Beta"}
              </span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: currentSpeaker === "A" ? "#ef4444" : "#3b82f6", animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: currentSpeaker === "A" ? "#ef4444" : "#3b82f6", animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: currentSpeaker === "A" ? "#ef4444" : "#3b82f6", animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Moderator Controls */}
      {phase === "debating" && !isStreaming && messages.length >= 2 && (
        <div className="flex-shrink-0 pt-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
          <div className="rounded-2xl p-5" style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-primary)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(139, 92, 246, 0.15)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>
              <span className="text-sm font-bold" style={{ color: "#8b5cf6" }}>Moderator Paneli</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                Raund {roundCount}
              </span>
            </div>

            {moderatorAction === "redirect" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={redirectText}
                  onChange={(e) => setRedirectText(e.target.value)}
                  placeholder="Tartismayi hangi yone cekmek istiyorsun?"
                  className="w-full text-sm rounded-xl px-4 py-3 outline-none"
                  style={{
                    background: "var(--bg-card)",
                    color: "var(--text-primary)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleRedirect()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleRedirect}
                    disabled={!redirectText.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40"
                    style={{ background: "#8b5cf6" }}
                  >
                    Gonder
                  </button>
                  <button
                    onClick={() => { setModeratorAction(null); setRedirectText(""); }}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
                  >
                    Iptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleContinue}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] hover:shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    boxShadow: "0 2px 10px rgba(16, 185, 129, 0.2)",
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Devam Et
                  </span>
                </button>
                <button
                  onClick={() => setModeratorAction("redirect")}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98] hover:shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                    boxShadow: "0 2px 10px rgba(139, 92, 246, 0.2)",
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    Yonlendir
                  </span>
                </button>
                <button
                  onClick={endDebate}
                  className="py-3 px-5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                  style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
                >
                  Bitir
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Finished State */}
      {phase === "finished" && (
        <div className="flex-shrink-0 pt-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
          <div className="rounded-2xl p-6 text-center" style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(99, 102, 241, 0.08))",
            border: "1px solid rgba(139, 92, 246, 0.15)",
          }}>
            <div className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>Tartisma Sona Erdi</div>
            <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
              {roundCount} raund boyunca {messages.length} arguman sunuldu
            </p>
            <button
              onClick={resetDebate}
              className="px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                boxShadow: "0 2px 12px rgba(139, 92, 246, 0.3)",
              }}
            >
              Yeni Tartisma Baslat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== CHAT BUBBLE COMPONENT - Messaging Style =====
function ChatBubble({
  message,
  renderText,
  isStreaming,
}: {
  message: DebateMessage;
  renderText: (text: string) => React.ReactNode[];
  isStreaming?: boolean;
}) {
  const isA = message.speaker === "A";
  const color = isA ? "#ef4444" : "#3b82f6";
  const name = isA ? "Alpha" : "Beta";
  const isLeft = isA;

  return (
    <div
      className={`flex ${isLeft ? "justify-start" : "justify-end"}`}
      style={{ animation: isStreaming ? undefined : "fadeSlideIn 0.3s ease-out" }}
    >
      <div className={`flex gap-2.5 max-w-[85%] ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${color}20` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6a4 4 0 0 1 4-4z"/>
              <rect x="9" y="10" width="6" height="6" rx="1"/>
            </svg>
          </div>
        </div>

        {/* Bubble */}
        <div>
          {/* Name + status */}
          <div className={`flex items-center gap-2 mb-1 ${isLeft ? "" : "justify-end"}`}>
            <span className="text-xs font-semibold" style={{ color }}>{name}</span>
            {isStreaming && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full animate-pulse" style={{ background: `${color}15`, color }}>
                yaziyor...
              </span>
            )}
          </div>

          {/* Message body */}
          <div
            className={`rounded-2xl px-5 py-3.5 ${isLeft ? "rounded-tl-md" : "rounded-tr-md"}`}
            style={{
              background: isLeft ? "rgba(239, 68, 68, 0.07)" : "rgba(59, 130, 246, 0.07)",
              border: `1px solid ${isLeft ? "rgba(239, 68, 68, 0.12)" : "rgba(59, 130, 246, 0.12)"}`,
            }}
          >
            <div className="text-[15px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-primary)", fontFamily: "'Inter', sans-serif" }}>
              {message.content.split("\n").map((line, i) => (
                <p key={i} className={line.trim() === "" ? "h-2" : "mb-1.5"}>
                  {renderText(line)}
                </p>
              ))}
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: color }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
