"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend } from "../icons/Icons";
import {
  useConversation,
  type ChatMessage,
} from "@/app/providers/ConversationProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import katex from "katex";
import "katex/dist/katex.min.css";

/* ===== TYPES ===== */
interface SolverChatProps {
  isMobile?: boolean;
  initialMessage?: string;
}

interface SolverStep {
  number: string;
  title: string;
  content: string;
}

interface GraphData {
  functions: string[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  title: string;
}

/* ===== PARSERS ===== */
function parseSolverTitle(content: string): string | null {
  const match = content.match(/\[SOLVER_TITLE\]([\s\S]*?)\[\/SOLVER_TITLE\]/);
  return match ? match[1].trim() : null;
}

function parseSolverSteps(content: string): SolverStep[] {
  const regex = /\[STEP\](\d+)\|([^|]*)\|([\s\S]*?)\[\/STEP\]/g;
  const steps: SolverStep[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    steps.push({
      number: match[1].trim(),
      title: match[2].trim(),
      content: match[3].trim(),
    });
  }
  return steps;
}

function parseGraphData(content: string): GraphData[] {
  const regex = /\[GRAPH\]([\s\S]*?)\[\/GRAPH\]/g;
  const graphs: GraphData[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const parts = match[1].split("|");
    if (parts.length >= 6) {
      graphs.push({
        functions: parts[0].split(",").map((f) => f.trim()),
        xMin: parseFloat(parts[1]) || -10,
        xMax: parseFloat(parts[2]) || 10,
        yMin: parseFloat(parts[3]) || -10,
        yMax: parseFloat(parts[4]) || 10,
        title: parts[5]?.trim() || "Grafik",
      });
    }
  }
  return graphs;
}

function getTextOutsideTags(content: string): { before: string; after: string } {
  // Get text before first [SOLVER_TITLE] or [STEP]
  const firstTag = content.search(/\[(SOLVER_TITLE|STEP|GRAPH)\]/);
  const before = firstTag > 0 ? content.slice(0, firstTag).trim() : "";

  // Get text after last closing tag
  const lastClose = Math.max(
    content.lastIndexOf("[/STEP]"),
    content.lastIndexOf("[/GRAPH]"),
    content.lastIndexOf("[/SOLVER_TITLE]")
  );
  const after = lastClose > 0 ? content.slice(lastClose + 7).trim()
    .replace(/\[\/SOLVER_TITLE\]|\[\/GRAPH\]|\[\/STEP\]/g, "").trim() : "";

  return { before, after };
}

/* ===== STREAMING HELPER ===== */
async function streamChat(
  messages: { role: string; content: string; imageData?: string; imageMimeType?: string }[],
  onChunk: (text: string) => void,
  onError: (error: string) => void,
  onDone: () => void
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, mode: "solver" }),
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

/* ===== KATEX RENDERER ===== */
function renderMathContent(text: string): string {
  // Render block math: $$...$$
  let result = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return `<div class="solver-math-block">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<div class="solver-math-block">${math}</div>`;
    }
  });

  // Render inline math: $...$
  result = result.replace(/\$([^$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return math;
    }
  });

  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // Italic
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  // Line breaks
  result = result.replace(/\n/g, "<br/>");

  return result;
}

/* ===== FUNCTION GRAPH COMPONENT ===== */
function FunctionGraph({ data }: { data: GraphData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const renderGraph = async () => {
      try {
        const functionPlot = (await import("function-plot")).default;
        containerRef.current!.innerHTML = "";

        const graphData = data.functions.map((fn, i) => ({
          fn,
          color: ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"][i % 5],
        }));

        functionPlot({
          target: containerRef.current!,
          width: containerRef.current!.clientWidth,
          height: 300,
          xAxis: { domain: [data.xMin, data.xMax] },
          yAxis: { domain: [data.yMin, data.yMax] },
          grid: true,
          data: graphData,
        });

        setError(null);
      } catch (err) {
        setError("Grafik yüklenemedi");
        console.error("Graph render error:", err);
      }
    };

    renderGraph();
  }, [data]);

  return (
    <div className="solver-graph-container">
      <div className="solver-graph-title">{data.title}</div>
      {error ? (
        <div className="solver-graph-error">{error}</div>
      ) : (
        <div ref={containerRef} className="solver-graph" />
      )}
    </div>
  );
}

/* ===== SOLVER STEP COMPONENT ===== */
function SolverStepCard({ step, isOpen, onToggle }: { step: SolverStep; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="solver-step">
      <button className="solver-step-header" onClick={onToggle}>
        <div className="solver-step-number">{step.number}</div>
        <div className="solver-step-title">{step.title}</div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="solver-step-chevron"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div
          className="solver-step-content"
          dangerouslySetInnerHTML={{ __html: renderMathContent(step.content) }}
        />
      )}
    </div>
  );
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

/* ===== SOLVING LOADER ===== */
function SolvingLoader({ topic }: { topic: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 animate-fade-in select-none">
      <style>{`
        @keyframes solver-pulse { 0%,100%{transform:scale(1);opacity:0.8;} 50%{transform:scale(1.08);opacity:1;} }
        @keyframes solver-ring { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
      `}</style>

      <div style={{ position: "relative", width: 80, height: 80 }}>
        <div style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          border: "3px solid var(--border-primary)",
          borderTopColor: "var(--accent-primary)",
          animation: "solver-ring 1.2s linear infinite",
        }} />
        <div style={{
          position: "absolute", inset: 12,
          borderRadius: "50%",
          background: "var(--accent-primary-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "solver-pulse 2s ease-in-out infinite",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Soru Cozuluyor...
        </p>
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {topic.length > 60 ? topic.slice(0, 60) + "..." : topic}
        </p>
      </div>
    </div>
  );
}

/* ===== WELCOME SCREEN ===== */
function SolverWelcome({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  const suggestions = [
    { text: "x² - 4x + 3 = 0 denklemini coz", label: "Ikinci Derece Denklem" },
    { text: "f(x) = x³ - 3x fonksiyonunun ekstremum noktalarini bul", label: "Ekstremum Noktalar" },
    { text: "∫(x² + 2x)dx integralini hesapla", label: "Integral" },
    { text: "lim(x→0) sin(x)/x limitini hesapla", label: "Limit" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 select-none">
      <div className="text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
          style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Soru Cozucu
        </h2>
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Matematik, fizik ve diger sayisal sorularini adim adim coz
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => onSuggestionClick(s.text)}
            className="flex flex-col items-start gap-1 rounded-xl p-3 transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <span className="text-[10px] font-bold" style={{ color: "var(--accent-primary)" }}>
              {s.label}
            </span>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {s.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== SOLUTION DISPLAY ===== */
function SolutionDisplay({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  const [openSteps, setOpenSteps] = useState<Set<string>>(new Set());
  const title = parseSolverTitle(content);
  const steps = parseSolverSteps(content);
  const graphs = parseGraphData(content);
  const { before, after } = getTextOutsideTags(content);

  // Auto-open steps as they stream in
  useEffect(() => {
    if (steps.length > 0) {
      setOpenSteps(new Set(steps.map((s) => s.number)));
    }
  }, [steps.length]);

  const toggleStep = (num: string) => {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  return (
    <div className="solver-solution">
      {before && (
        <div
          className="solver-intro"
          dangerouslySetInnerHTML={{ __html: renderMathContent(before) }}
        />
      )}

      {title && <div className="solver-title">{title}</div>}

      {steps.length > 0 && (
        <div className="solver-steps-container">
          <div className="solver-steps-header">
            <span>COZUM ADIMLARI</span>
          </div>
          {steps.map((step) => (
            <SolverStepCard
              key={step.number}
              step={step}
              isOpen={openSteps.has(step.number)}
              onToggle={() => toggleStep(step.number)}
            />
          ))}
        </div>
      )}

      {graphs.map((graph, i) => (
        <FunctionGraph key={i} data={graph} />
      ))}

      {after && (
        <div
          className="solver-outro"
          dangerouslySetInnerHTML={{ __html: renderMathContent(after) }}
        />
      )}

      {isStreaming && <TypingIndicator />}
    </div>
  );
}

/* ===== MAIN COMPONENT ===== */
export default function SolverChat({ isMobile, initialMessage }: SolverChatProps) {
  const { user } = useAuth();
  const {
    activeConversationId,
    saveUserMessage,
    saveAssistantMessage,
    generateTitle,
    refreshConversations,
    loadConversation,
  } = useConversation();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTopic, setLoadingTopic] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialSent = useRef(false);
  const isFirstMessageRef = useRef(true);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Load existing conversation messages
  useEffect(() => {
    if (activeConversationId) {
      loadConversation(activeConversationId).then(({ messages: loaded }) => {
        if (loaded.length > 0) {
          setMessages(loaded);
          isFirstMessageRef.current = false;
        }
      });
    }
  }, [activeConversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle initial message
  useEffect(() => {
    if (initialMessage && !initialSent.current) {
      initialSent.current = true;
      handleSend(initialMessage);
    }
  }, [initialMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = useCallback(
    async (overrideText?: string) => {
      const text = overrideText || input.trim();
      if (!text || isLoading || !user) return;

      setInput("");
      setIsLoading(true);
      setLoadingTopic(text);

      const isFirst = isFirstMessageRef.current;
      let conversationId = "";

      try {
        // Save user message to DB
        const result = await saveUserMessage(text, null, "solver");
        conversationId = result.conversationId;

        if (isFirst) {
          isFirstMessageRef.current = false;
          generateTitle(conversationId, text);
          refreshConversations();
        }

        // Add user message to local state
        const userMsg: ChatMessage = {
          id: result.messageId,
          role: "user",
          content: text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);

        // Prepare API messages
        const currentMessages = messagesRef.current;
        const apiMessages = [
          ...currentMessages.map((m: ChatMessage) => ({ role: m.role, content: m.content })),
          { role: "user", content: text },
        ];

        // Add assistant placeholder
        const assistantId = `assistant-${Date.now()}`;
        const assistantMsg: ChatMessage = {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        let fullContent = "";
        await streamChat(
          apiMessages,
          (chunk) => {
            fullContent += chunk;
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m))
            );
          },
          (error) => {
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: `Hata: ${error}` } : m))
            );
          },
          () => {
            // Done - save to DB
          }
        );

        // Save assistant message to DB
        if (fullContent && conversationId) {
          try {
            await saveAssistantMessage(conversationId, fullContent);
          } catch (err) {
            console.error("Failed to save assistant message:", err);
          }
        }
      } catch (err) {
        console.error("Solver error:", err);
      } finally {
        setIsLoading(false);
        setLoadingTopic("");
      }
    },
    [input, isLoading, user, saveUserMessage, saveAssistantMessage, generateTitle, refreshConversations]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const userMessages = messages.filter((m: ChatMessage) => m.role === "user");
  const assistantMessages = messages.filter((m: ChatMessage) => m.role === "assistant");
  const hasContent = userMessages.length > 0;

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-primary)" }}>
      {/* Styles */}
      <style>{`
        .solver-solution { padding: 16px; }
        .solver-intro, .solver-outro {
          font-size: 14px; line-height: 1.6;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }
        .solver-outro { margin-top: 16px; margin-bottom: 0; }
        .solver-title {
          font-size: 16px; font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 16px;
        }
        .solver-steps-container {
          border-radius: 12px;
          border: 1px solid var(--border-primary);
          overflow: hidden;
          margin-bottom: 16px;
        }
        .solver-steps-header {
          padding: 10px 16px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.05em;
          color: var(--text-tertiary);
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-primary);
          display: flex; align-items: center; justify-content: space-between;
        }
        .solver-step {
          border-bottom: 1px solid var(--border-primary);
        }
        .solver-step:last-child { border-bottom: none; }
        .solver-step-header {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px; width: 100%;
          background: transparent; border: none; cursor: pointer;
          text-align: left; transition: background 0.15s;
        }
        .solver-step-header:hover { background: var(--bg-tertiary); }
        .solver-step-number {
          flex-shrink: 0;
          width: 28px; height: 28px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; font-size: 12px; font-weight: 700;
          background: var(--accent-primary-light);
          color: var(--accent-primary);
        }
        .solver-step-title {
          flex: 1; font-size: 13px; font-weight: 600;
          color: var(--text-primary);
        }
        .solver-step-chevron {
          flex-shrink: 0;
          color: var(--text-tertiary);
          transition: transform 0.2s;
        }
        .solver-step-content {
          padding: 0 16px 16px 56px;
          font-size: 13px; line-height: 1.7;
          color: var(--text-secondary);
        }
        .solver-math-block {
          margin: 12px 0;
          padding: 8px 0;
          overflow-x: auto;
        }
        .solver-graph-container {
          border-radius: 12px;
          border: 1px solid var(--border-primary);
          overflow: hidden;
          margin-bottom: 16px;
          background: var(--bg-card);
        }
        .solver-graph-title {
          padding: 10px 16px;
          font-size: 12px; font-weight: 600;
          color: var(--text-primary);
          background: var(--bg-tertiary);
          border-bottom: 1px solid var(--border-primary);
        }
        .solver-graph {
          padding: 8px;
        }
        .solver-graph svg {
          width: 100% !important;
          height: auto !important;
        }
        .solver-graph .function-plot {
          width: 100% !important;
        }
        .solver-graph-error {
          padding: 24px; text-align: center;
          font-size: 12px; color: var(--text-tertiary);
        }
        .solver-user-msg {
          padding: 12px 16px;
          border-radius: 16px 16px 4px 16px;
          font-size: 14px; line-height: 1.5;
          max-width: 80%;
          background: var(--accent-primary);
          color: white;
          align-self: flex-end;
        }
      `}</style>

      {/* Main content area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {!hasContent && !isLoading && (
          <SolverWelcome onSuggestionClick={(text) => handleSend(text)} />
        )}

        {isLoading && !assistantMessages.length && (
          <SolvingLoader topic={loadingTopic} />
        )}

        {hasContent && (
          <div className="max-w-3xl mx-auto py-4 px-4 flex flex-col gap-4">
            {messages.map((msg: ChatMessage) => {
                if (msg.role === "user") {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="solver-user-msg">{msg.content}</div>
                    </div>
                  );
                }
                return (
                  <SolutionDisplay
                    key={msg.id}
                    content={msg.content}
                    isStreaming={isLoading && msg === messages[messages.length - 1]}
                  />
                );
              })}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2">
        <div
          className="max-w-3xl mx-auto flex items-end gap-2 rounded-2xl p-3"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Matematik sorunuzu yazin..."
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none"
            style={{
              color: "var(--text-primary)",
              maxHeight: 120,
              lineHeight: "1.5",
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = Math.min(target.scrollHeight, 120) + "px";
            }}
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all"
            style={{
              background: input.trim() ? "var(--accent-primary)" : "var(--bg-tertiary)",
              color: input.trim() ? "white" : "var(--text-tertiary)",
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            <IconSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
