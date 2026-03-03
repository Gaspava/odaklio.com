"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend, IconRoadmap, IconChevronLeft, IconChevronRight } from "../icons/Icons";
import {
  useConversation,
} from "@/app/providers/ConversationProvider";
import {
  saveRoadmapSteps,
  getRoadmapSteps,
  toggleRoadmapStepCompletion,
  getChildConversations,
  getConversationBreadcrumb,
  getConversation,
  type RoadmapStepRow,
} from "@/lib/db/conversations";
import ChatMessageRenderer from "./ChatMessageRenderer";

/* ===== TYPES ===== */
interface RoadmapChatProps {
  isMobile?: boolean;
  onOpenConversation?: (id: string, type?: string) => void;
}

interface RoadmapStep {
  number: number;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  expandable: boolean;
}

interface RoadmapColumn {
  conversationId: string;
  title: string;
  steps: RoadmapStep[];
  selectedStepNumber: number | null;
  completedSteps: Set<number>;
  isLoading: boolean;
}

interface StudyMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

type Phase = "input" | "loading" | "roadmap";
const MAX_DEPTH = 4;

/* ===== STREAMING HELPER ===== */
async function streamChat(
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onError: (error: string) => void,
  onDone: () => void,
  mode?: string,
  signal?: AbortSignal
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, mode }),
    signal,
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

/* ===== PARSERS ===== */
function parseRoadmapTitle(content: string): string | null {
  const match = content.match(/\[ROADMAP_TITLE\](.*?)\[\/ROADMAP_TITLE\]/);
  return match ? match[1].trim() : null;
}

function parseRoadmapSteps(content: string): RoadmapStep[] {
  const regex = /\[STEP\](\d+)\|([\s\S]*?)\|([\s\S]*?)\|([\s\S]*?)(?:\|(true|false))?\[\/STEP\]/g;
  const steps: RoadmapStep[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    steps.push({
      number: parseInt(match[1]),
      title: match[2].trim(),
      description: match[3].trim(),
      duration: match[4].trim(),
      completed: false,
      expandable: match[5] ? match[5] === "true" : true,
    });
  }
  return steps;
}

/* ===== CONSTANTS ===== */
const QUICK_PROMPTS = [
  { text: "Python ogrenmek istiyorum", icon: "\uD83D\uDC0D" },
  { text: "Web gelistirme yol haritasi", icon: "\uD83C\uDF10" },
  { text: "Makine ogrenmesi", icon: "\uD83E\uDD16" },
];

/* ===== INLINE SVG ICONS ===== */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

/* ===== OVERALL PROGRESS BAR ===== */
function OverallProgress({ columns }: { columns: RoadmapColumn[] }) {
  let total = 0;
  let completed = 0;
  for (const col of columns) {
    total += col.steps.length;
    completed += col.completedSteps.size;
  }
  if (total === 0) return null;
  const pct = Math.round((completed / total) * 100);

  return (
    <div className="flex items-center gap-3 px-4 py-2" style={{ borderBottom: "1px solid var(--border-primary)" }}>
      <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
        Ilerleme
      </span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: "var(--accent-primary)" }}
        />
      </div>
      <span className="text-[11px] font-semibold" style={{ color: pct === 100 ? "var(--accent-primary)" : "var(--text-secondary)" }}>
        {completed}/{total} ({pct}%)
      </span>
    </div>
  );
}

/* ===== COLUMN SKELETON ===== */
function ColumnSkeleton() {
  return (
    <div className="miller-column" style={{ background: "var(--bg-primary)" }}>
      <div className="p-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
        <div className="h-4 w-32 rounded-md animate-pulse" style={{ background: "var(--bg-tertiary)" }} />
      </div>
      <div className="p-3 flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl p-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border-secondary)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-lg animate-pulse" style={{ background: "var(--bg-tertiary)", animationDelay: `${i * 0.1}s` }} />
              <div className="h-3.5 flex-1 rounded-md animate-pulse" style={{ background: "var(--bg-tertiary)", animationDelay: `${i * 0.12}s` }} />
            </div>
            <div className="h-2.5 w-3/4 rounded-md animate-pulse" style={{ background: "var(--bg-tertiary)", animationDelay: `${i * 0.15}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== MILLER STEP ITEM ===== */
function MillerStepItem({
  step,
  isCompleted,
  isSelected,
  canExpand,
  onToggleComplete,
  onClick,
  onStudy,
}: {
  step: RoadmapStep;
  isCompleted: boolean;
  isSelected: boolean;
  canExpand: boolean;
  onToggleComplete: () => void;
  onClick: () => void;
  onStudy: () => void;
}) {
  return (
    <div
      className={`miller-step-item ${isSelected ? "selected" : ""}`}
      style={{
        background: isCompleted ? "rgba(16, 185, 129, 0.04)" : "var(--bg-card)",
        border: isSelected
          ? "1.5px solid #ef4444"
          : isCompleted
            ? "1px solid rgba(16, 185, 129, 0.2)"
            : "1px solid var(--border-secondary)",
      }}
    >
      <div className="flex items-center gap-2.5">
        {/* Completion checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
          className="relative z-10 flex items-center justify-center rounded-full flex-shrink-0 transition-all duration-200"
          style={{
            width: 20,
            height: 20,
            background: isCompleted ? "#10b981" : "transparent",
            border: isCompleted ? "2px solid #10b981" : "2px solid var(--border-primary)",
            color: isCompleted ? "white" : "transparent",
            cursor: "pointer",
          }}
          title={isCompleted ? "Tamamlandi" : "Tamamla"}
        >
          {isCompleted && <CheckIcon />}
        </button>

        {/* Step number badge + title + duration — clickable area */}
        <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          <span
            className="flex items-center justify-center rounded-lg text-[10px] font-bold flex-shrink-0"
            style={{ width: 22, height: 22, background: "#ef4444", color: "white" }}
          >
            {step.number}
          </span>
          <span
            className="text-[13px] font-medium flex-1 min-w-0 truncate"
            style={{
              color: "var(--text-primary)",
              textDecoration: isCompleted ? "line-through" : "none",
              textDecorationColor: isCompleted ? "rgba(16, 185, 129, 0.5)" : undefined,
            }}
          >
            {step.title}
          </span>
          <span
            className="text-[10px] flex-shrink-0 px-1.5 py-0.5 rounded-full"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            {step.duration}
          </span>
        </div>

        {/* Right action: chevron for expandable OR study button for leaf */}
        {canExpand ? (
          <button
            onClick={onClick}
            className="flex-shrink-0 flex items-center justify-center transition-colors"
            style={{ color: "var(--text-tertiary)", width: 20, height: 20 }}
          >
            <IconChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onStudy(); }}
            className="flex-shrink-0 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all active:scale-[0.97]"
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              color: "#10b981",
              border: "1px solid rgba(16, 185, 129, 0.15)",
            }}
          >
            <BookIcon />
            Calis
          </button>
        )}
      </div>

      {/* Description on hover/selection — show when selected */}
      {isSelected && (
        <p
          className="text-[11px] leading-relaxed mt-2 pt-2"
          style={{ color: "var(--text-tertiary)", borderTop: "1px solid var(--border-secondary)" }}
        >
          {step.description}
        </p>
      )}
    </div>
  );
}

/* ===== MILLER COLUMN ===== */
function MillerColumn({
  column,
  colIndex,
  totalColumns,
  onSelectStep,
  onToggleComplete,
  onStudy,
}: {
  column: RoadmapColumn;
  colIndex: number;
  totalColumns: number;
  onSelectStep: (stepNumber: number) => void;
  onToggleComplete: (stepNumber: number) => void;
  onStudy: (step: RoadmapStep, colIndex: number) => void;
}) {
  const completed = column.completedSteps.size;
  const total = column.steps.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const bgColor = colIndex % 2 === 0 ? "var(--bg-primary)" : "var(--bg-secondary)";

  if (column.isLoading) {
    return <ColumnSkeleton />;
  }

  return (
    <div className="miller-column" style={{ background: bgColor }}>
      {/* Column header */}
      <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-primary)" }}>
        <h3 className="text-[13px] font-semibold truncate mb-1.5" style={{ color: "var(--text-primary)" }}>
          {column.title || "Yol Haritasi"}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${pct}%`, background: "var(--accent-primary)" }}
            />
          </div>
          <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            {completed}/{total}
          </span>
        </div>
      </div>

      {/* Step list */}
      <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-1.5">
        {column.steps.map((step) => {
          const canExpand = step.expandable && colIndex + 1 < MAX_DEPTH;
          return (
            <MillerStepItem
              key={step.number}
              step={step}
              isCompleted={column.completedSteps.has(step.number)}
              isSelected={column.selectedStepNumber === step.number}
              canExpand={canExpand}
              onToggleComplete={() => onToggleComplete(step.number)}
              onClick={() => onSelectStep(step.number)}
              onStudy={() => onStudy(step, colIndex)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ===== STUDY CHAT PANEL ===== */
function StudyChatPanel({
  step,
  messages,
  isStreaming,
  input,
  onInputChange,
  onSend,
  endRef,
}: {
  step: RoadmapStep | null;
  messages: StudyMessage[];
  isStreaming: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  endRef: React.RefObject<HTMLDivElement>;
}) {
  // Welcome state — no step selected yet
  if (!step) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-8"
        style={{ background: "var(--bg-secondary)" }}
      >
        <div className="flex flex-col items-center gap-4 text-center" style={{ maxWidth: 300 }}>
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{ width: 64, height: 64, background: "rgba(16,185,129,0.08)" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
              Ders Paneli
            </h3>
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              Yol haritasından bir adıma tıkla ve{" "}
              <span className="font-semibold" style={{ color: "#10b981" }}>Çalış</span>{" "}
              butonuna bas — AI o konuyu sana ders gibi anlatacak.
            </p>
          </div>
          {/* Decorative hint */}
          <div className="flex items-center gap-2 mt-1">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-lg flex items-center justify-center text-[10px] font-bold"
                style={{ width: 28, height: 28, background: "rgba(239,68,68,0.08)", color: "#ef4444" }}
              >
                {i}
              </div>
            ))}
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>→ Çalış</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--bg-secondary)" }}>
      {/* Panel header */}
      <div
        className="study-chat-panel-header"
        style={{ borderBottom: "1px solid var(--border-primary)", background: "var(--bg-primary)" }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* AI avatar */}
          <div
            className="flex items-center justify-center rounded-xl text-white text-[10px] font-bold flex-shrink-0"
            style={{ width: 30, height: 30, background: "var(--gradient-primary)" }}
          >
            AI
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
              Konu Anlatımı
            </p>
            <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
              {step.title}
            </p>
          </div>
        </div>
        <div
          className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ml-2"
          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}
        >
          {step.duration}
        </div>
      </div>

      {/* Messages */}
      <div className="study-chat-messages">
        {messages.map(msg => (
          <div key={msg.id}>
            {msg.role === "user" ? (
              <div className="study-msg-user">
                {msg.content}
              </div>
            ) : (
              <div className="study-msg-ai">
                {msg.content ? (
                  <ChatMessageRenderer content={msg.content} />
                ) : (
                  /* Typing indicator */
                  <div className="flex gap-1.5 py-1 px-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="rounded-full animate-bounce"
                        style={{
                          width: 7,
                          height: 7,
                          background: "var(--text-tertiary)",
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div className="study-chat-input-bar">
        <input
          type="text"
          value={input}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }}
          placeholder="Sormak istediğin bir şey var mı?"
          disabled={isStreaming}
          className="study-chat-input"
        />
        <button
          onClick={onSend}
          disabled={!input.trim() || isStreaming}
          className="study-chat-send-btn"
        >
          <IconSend size={16} />
        </button>
      </div>
    </div>
  );
}

/* ===== MAIN COMPONENT ===== */
export default function RoadmapChat({ isMobile = false, onOpenConversation }: RoadmapChatProps) {
  const {
    activeConversationId,
    saveUserMessage,
    saveAssistantMessage,
    generateTitle,
    createTypedConversation,
    createChildRoadmap,
    refreshConversations,
    setActiveConversationId,
    setActiveConversationType,
  } = useConversation();

  const [phase, setPhase] = useState<Phase>("input");
  const [columns, setColumns] = useState<RoadmapColumn[]>([]);
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileActiveColumn, setMobileActiveColumn] = useState(0);

  // Study panel state
  const [studyStep, setStudyStep] = useState<RoadmapStep | null>(null);
  const [studyMessages, setStudyMessages] = useState<StudyMessage[]>([]);
  const [studyInput, setStudyInput] = useState("");
  const [isStudying, setIsStudying] = useState(false);
  const [mobileTab, setMobileTab] = useState<"roadmap" | "study">("roadmap");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isGeneratingRef = useRef(false);
  const studyEndRef = useRef<HTMLDivElement>(null);
  const studyAbortRef = useRef<AbortController | null>(null);

  /* ===== AUTO-SCROLL STUDY PANEL ===== */
  useEffect(() => {
    studyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [studyMessages]);

  /* ===== AUTO-SCROLL MILLER COLUMNS RIGHT ===== */
  const scrollToRight = useCallback(() => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          left: scrollContainerRef.current.scrollWidth,
          behavior: "smooth",
        });
      }
    }, 100);
  }, []);

  /* ===== GENERATE INITIAL ROADMAP ===== */
  const handleGenerate = useCallback(async (topic: string) => {
    if (!topic.trim() || isGenerating) return;

    setPhase("loading");
    setIsGenerating(true);
    isGeneratingRef.current = true;
    setError(null);

    let fullResponse = "";

    try {
      const { conversationId } = await saveUserMessage(topic, null, "roadmap");
      generateTitle(conversationId, topic);

      await new Promise<void>((resolve, reject) => {
        streamChat(
          [{ role: "user", content: topic }],
          (chunk) => { fullResponse += chunk; },
          (err) => reject(new Error(err)),
          () => resolve(),
          "roadmap"
        );
      });

      const title = parseRoadmapTitle(fullResponse) || topic;
      const steps = parseRoadmapSteps(fullResponse);

      if (steps.length === 0) {
        throw new Error("Yol haritasi adimlari olusturulamadi. Lutfen tekrar deneyin.");
      }

      await saveRoadmapSteps(conversationId, steps.map((s) => ({
        stepNumber: s.number,
        title: s.title,
        description: s.description,
        duration: s.duration,
        isExpandable: s.expandable,
      })));

      await saveAssistantMessage(conversationId, fullResponse);
      await refreshConversations();

      setColumns([{
        conversationId,
        title,
        steps,
        selectedStepNumber: null,
        completedSteps: new Set(),
        isLoading: false,
      }]);
      setPhase("roadmap");
    } catch (err) {
      console.error("Roadmap generation error:", err);
      setError(err instanceof Error ? err.message : "Bir hata olustu");
      setPhase("input");
    } finally {
      setIsGenerating(false);
      isGeneratingRef.current = false;
    }
  }, [isGenerating, saveUserMessage, generateTitle, saveAssistantMessage, refreshConversations]);

  /* ===== SELECT STEP (EXPAND) ===== */
  const handleSelectStep = useCallback(async (colIndex: number, stepNumber: number) => {
    const col = columns[colIndex];
    if (!col) return;

    const step = col.steps.find((s) => s.number === stepNumber);
    if (!step) return;

    // If same step clicked again → deselect and remove columns to the right
    if (col.selectedStepNumber === stepNumber) {
      setColumns((prev) => {
        const next = prev.slice(0, colIndex + 1);
        next[colIndex] = { ...next[colIndex], selectedStepNumber: null };
        return next;
      });
      return;
    }

    // Update selection, remove columns to the right
    setColumns((prev) => {
      const next = prev.slice(0, colIndex + 1);
      next[colIndex] = { ...next[colIndex], selectedStepNumber: stepNumber };
      return next;
    });

    // Don't expand if not expandable or at max depth
    if (!step.expandable || colIndex + 1 >= MAX_DEPTH) return;

    // Check DB for existing child
    try {
      const children = await getChildConversations(col.conversationId);
      const existingChild = children.find((c) => c.parent_step_number === stepNumber);

      if (existingChild) {
        // Load existing sub-roadmap
        const childSteps = await getRoadmapSteps(existingChild.id);
        const completedSet = new Set(childSteps.filter((s) => s.is_completed).map((s) => s.step_number));
        const mappedSteps = childSteps.map((s) => ({
          number: s.step_number,
          title: s.title,
          description: s.description,
          duration: s.duration,
          completed: s.is_completed,
          expandable: s.is_expandable,
        }));

        setColumns((prev) => {
          const next = [...prev.slice(0, colIndex + 1)];
          next[colIndex] = { ...next[colIndex], selectedStepNumber: stepNumber };
          next.push({
            conversationId: existingChild.id,
            title: existingChild.title || step.title,
            steps: mappedSteps,
            selectedStepNumber: null,
            completedSteps: completedSet,
            isLoading: false,
          });
          return next;
        });

        if (isMobile) setMobileActiveColumn(colIndex + 1);
        scrollToRight();
        return;
      }

      // Create new child roadmap — add loading column first
      setColumns((prev) => {
        const next = [...prev.slice(0, colIndex + 1)];
        next[colIndex] = { ...next[colIndex], selectedStepNumber: stepNumber };
        next.push({
          conversationId: "",
          title: step.title,
          steps: [],
          selectedStepNumber: null,
          completedSteps: new Set(),
          isLoading: true,
        });
        return next;
      });

      if (isMobile) setMobileActiveColumn(colIndex + 1);
      scrollToRight();

      // Create child conversation and stream sub-roadmap
      const childConvId = await createChildRoadmap(col.conversationId, stepNumber);
      // Don't update active conversation — keep the root
      setActiveConversationId(columns[0]?.conversationId || null);
      setActiveConversationType("roadmap");

      const subPrompt = `"${step.title}" konusunu alt adimlara ayir. Bu bir ust yol haritasinin alt yol haritasidir. Ustundeki adimin aciklamasi: "${step.description}"`;

      let subResponse = "";
      await new Promise<void>((resolve, reject) => {
        streamChat(
          [{ role: "user", content: subPrompt }],
          (chunk) => { subResponse += chunk; },
          (err) => reject(new Error(err)),
          () => resolve(),
          "roadmap"
        );
      });

      const subTitle = parseRoadmapTitle(subResponse) || step.title;
      const subSteps = parseRoadmapSteps(subResponse);

      if (subSteps.length > 0) {
        await saveRoadmapSteps(childConvId, subSteps.map((s) => ({
          stepNumber: s.number,
          title: s.title,
          description: s.description,
          duration: s.duration,
          isExpandable: s.expandable,
        })));
      }

      await saveAssistantMessage(childConvId, subResponse);

      // Update child conversation title
      const { updateConversationTitle } = await import("@/lib/db/conversations");
      await updateConversationTitle(childConvId, subTitle);

      setColumns((prev) => {
        const lastIndex = prev.length - 1;
        if (lastIndex < colIndex + 1) return prev;
        const next = [...prev];
        next[lastIndex] = {
          conversationId: childConvId,
          title: subTitle,
          steps: subSteps,
          selectedStepNumber: null,
          completedSteps: new Set(),
          isLoading: false,
        };
        return next;
      });
    } catch (err) {
      console.error("Expansion error:", err);
      // Remove loading column on error
      setColumns((prev) => prev.slice(0, colIndex + 1));
    }
  }, [columns, createChildRoadmap, saveAssistantMessage, isMobile, scrollToRight, setActiveConversationId, setActiveConversationType]);

  /* ===== TOGGLE COMPLETION WITH CASCADE ===== */
  const handleToggleComplete = useCallback((colIndex: number, stepNumber: number) => {
    const col = columns[colIndex];
    if (!col) return;

    const wasCompleted = col.completedSteps.has(stepNumber);
    const isNowCompleted = !wasCompleted;

    // Collect all DB updates: original + cascades
    const dbUpdates: { conversationId: string; stepNumber: number; completed: boolean }[] = [
      { conversationId: col.conversationId, stepNumber, completed: isNowCompleted },
    ];

    setColumns(prev => {
      // Deep-clone all completedSets
      const next = prev.map(c => ({ ...c, completedSteps: new Set(c.completedSteps) }));

      // Apply the toggle
      if (isNowCompleted) next[colIndex].completedSteps.add(stepNumber);
      else next[colIndex].completedSteps.delete(stepNumber);

      // Cascade upward when marking complete
      if (isNowCompleted) {
        let ci = colIndex;
        while (ci > 0) {
          const curCol = next[ci];
          const allDone = curCol.steps.every(s => curCol.completedSteps.has(s.number));
          if (!allDone) break;

          const parentCI = ci - 1;
          const parentStepNum = next[parentCI].selectedStepNumber;
          if (parentStepNum === null) break;
          if (next[parentCI].completedSteps.has(parentStepNum)) break; // already complete

          next[parentCI].completedSteps.add(parentStepNum);
          dbUpdates.push({
            conversationId: next[parentCI].conversationId,
            stepNumber: parentStepNum,
            completed: true,
          });
          ci = parentCI;
        }
      }

      return next;
    });

    // Persist all updates to DB (fire-and-forget)
    for (const u of dbUpdates) {
      toggleRoadmapStepCompletion(u.conversationId, u.stepNumber, u.completed).catch(console.error);
    }
  }, [columns]);

  /* ===== STUDY TOPIC — open inline study panel ===== */
  const handleStudyTopic = useCallback(async (step: RoadmapStep) => {
    // Abort any in-flight study stream
    studyAbortRef.current?.abort();
    const controller = new AbortController();
    studyAbortRef.current = controller;

    setStudyStep(step);
    setStudyInput("");
    setMobileTab("study");

    const loadingId = crypto.randomUUID();
    setStudyMessages([{ id: loadingId, role: "assistant", content: "", isStreaming: true }]);
    setIsStudying(true);

    const prompt = `Konu: "${step.title}"\n\nKonu açıklaması: ${step.description}\n\nBu konuyu bana adım adım, tam bir ders gibi anlat. Hiçbir ön bilgi varsayma, sıfırdan başla.`;

    let accumulated = "";
    try {
      await new Promise<void>((resolve, reject) => {
        streamChat(
          [{ role: "user", content: prompt }],
          (chunk) => {
            accumulated += chunk;
            setStudyMessages(prev =>
              prev.map(m => m.id === loadingId ? { ...m, content: accumulated } : m)
            );
          },
          (err) => reject(new Error(err)),
          () => resolve(),
          "roadmap_study",
          controller.signal
        );
      });
      setStudyMessages(prev => prev.map(m =>
        m.id === loadingId ? { ...m, isStreaming: false } : m
      ));
    } catch (err) {
      // Ignore abort errors (user switched topics)
      if (err instanceof Error && err.name === "AbortError") return;
      setStudyMessages(prev => prev.map(m =>
        m.id === loadingId
          ? { ...m, content: "Bir hata oluştu. Tekrar deneyin.", isStreaming: false }
          : m
      ));
    } finally {
      setIsStudying(false);
    }
  }, []);

  /* ===== SEND FOLLOW-UP IN STUDY CHAT ===== */
  const handleSendStudyMessage = useCallback(async () => {
    const text = studyInput.trim();
    if (!text || isStudying || !studyStep) return;
    setStudyInput("");

    const userMsg: StudyMessage = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();
    setStudyMessages(prev => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "", isStreaming: true },
    ]);
    setIsStudying(true);

    // Full API history: hidden intro prompt + all shown messages + new user message
    const introPrompt = `Konu: "${studyStep.title}"\nKonu açıklaması: ${studyStep.description}\nBu konuyu bana öğret.`;
    const history = [
      { role: "user", content: introPrompt },
      ...studyMessages.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: text },
    ];

    let accumulated = "";
    try {
      await new Promise<void>((resolve, reject) => {
        streamChat(
          history,
          (chunk) => {
            accumulated += chunk;
            setStudyMessages(prev =>
              prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m)
            );
          },
          (err) => reject(new Error(err)),
          () => resolve(),
          "roadmap_study"
        );
      });
      setStudyMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, isStreaming: false } : m
      ));
    } catch {
      setStudyMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: "Bir hata oluştu. Tekrar deneyin.", isStreaming: false }
          : m
      ));
    } finally {
      setIsStudying(false);
    }
  }, [studyInput, isStudying, studyMessages, studyStep]);

  /* ===== LOAD EXISTING ROADMAP ===== */
  useEffect(() => {
    if (!activeConversationId) {
      setPhase("input");
      setColumns([]);
      return;
    }

    // Don't interfere while handleGenerate is running — it manages its own state
    if (isGeneratingRef.current) return;

    let cancelled = false;
    setPhase("loading");

    async function loadExisting() {
      try {
        // Walk up to root
        const breadcrumb = await getConversationBreadcrumb(activeConversationId!);
        if (cancelled || breadcrumb.length === 0) return;

        const rootId = breadcrumb[0].id;

        // Walk down from root, building columns
        const builtColumns: RoadmapColumn[] = [];

        // Build the path from root to active conversation
        let targetPath: string[] = [];
        if (breadcrumb.length > 1) {
          targetPath = breadcrumb.slice(1).map((b) => b.id);
        }

        // Load root column
        const rootConv = await getConversation(rootId);
        if (cancelled || !rootConv) return;

        const rootSteps = await getRoadmapSteps(rootId);
        if (cancelled) return;

        const rootCompleted = new Set(rootSteps.filter((s) => s.is_completed).map((s) => s.step_number));
        const rootMapped = rootSteps.map(stepRowToStep);

        // Find which step leads to next in path
        let selectedStep: number | null = null;
        if (targetPath.length > 0) {
          const children = await getChildConversations(rootId);
          const nextChild = children.find((c) => c.id === targetPath[0]);
          if (nextChild?.parent_step_number) selectedStep = nextChild.parent_step_number;
        }

        builtColumns.push({
          conversationId: rootId,
          title: rootConv.title || "Yol Haritasi",
          steps: rootMapped,
          selectedStepNumber: selectedStep,
          completedSteps: rootCompleted,
          isLoading: false,
        });

        // Walk down the path
        for (let i = 0; i < targetPath.length; i++) {
          if (cancelled) return;
          const childId = targetPath[i];
          const childConv = await getConversation(childId);
          if (!childConv) break;

          const childSteps = await getRoadmapSteps(childId);
          const childCompleted = new Set(childSteps.filter((s) => s.is_completed).map((s) => s.step_number));
          const childMapped = childSteps.map(stepRowToStep);

          let childSelected: number | null = null;
          if (i + 1 < targetPath.length) {
            const grandchildren = await getChildConversations(childId);
            const nextGrandchild = grandchildren.find((c) => c.id === targetPath[i + 1]);
            if (nextGrandchild?.parent_step_number) childSelected = nextGrandchild.parent_step_number;
          }

          builtColumns.push({
            conversationId: childId,
            title: childConv.title || "Alt Yol Haritasi",
            steps: childMapped,
            selectedStepNumber: childSelected,
            completedSteps: childCompleted,
            isLoading: false,
          });
        }

        if (!cancelled) {
          setColumns(builtColumns);
          setPhase("roadmap");
          if (isMobile) setMobileActiveColumn(builtColumns.length - 1);
        }
      } catch (err) {
        console.error("Load existing roadmap error:", err);
        if (!cancelled) {
          setPhase("input");
        }
      }
    }

    loadExisting();
    return () => { cancelled = true; };
  }, [activeConversationId, isMobile]);

  /* ===== HELPERS ===== */
  function stepRowToStep(row: RoadmapStepRow): RoadmapStep {
    return {
      number: row.step_number,
      title: row.title,
      description: row.description,
      duration: row.duration,
      completed: row.is_completed,
      expandable: row.is_expandable,
    };
  }

  /* ===== INPUT SUBMISSION ===== */
  const handleSubmit = () => {
    if (inputText.trim()) {
      handleGenerate(inputText.trim());
      setInputText("");
    }
  };

  /* ===== RENDER: INPUT PHASE ===== */
  if (phase === "input") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center gap-6 w-full" style={{ maxWidth: 480 }}>
          {/* Icon + heading */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: 56, height: 56, background: "rgba(239, 68, 68, 0.08)" }}
            >
              <IconRoadmap size={28} className="" />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              Ne ogrenmek istiyorsun?
            </h2>
            <p className="text-[13px] text-center" style={{ color: "var(--text-tertiary)" }}>
              Bir konu yaz, sana adim adim ogrenme yol haritasi hazirlayayim.
            </p>
          </div>

          {/* Quick prompts */}
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.text}
                onClick={() => handleGenerate(qp.text)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[12px] font-medium transition-all active:scale-[0.97] disabled:opacity-50"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                  color: "var(--text-secondary)",
                }}
              >
                <span>{qp.icon}</span>
                {qp.text}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="w-full flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              placeholder="Ornegin: React ile web uygulamasi gelistirme..."
              disabled={isGenerating}
              className="flex-1 rounded-xl px-4 py-3 text-[13px] outline-none transition-all"
              style={{
                background: "var(--bg-input)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={!inputText.trim() || isGenerating}
              className="flex items-center justify-center rounded-xl transition-all active:scale-[0.95] disabled:opacity-40"
              style={{
                width: 44,
                height: 44,
                background: "#ef4444",
                color: "white",
              }}
            >
              <IconSend size={18} />
            </button>
          </div>

          {error && (
            <p className="text-[12px] text-center" style={{ color: "var(--accent-danger)" }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ===== RENDER: LOADING PHASE ===== */
  if (phase === "loading") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8" style={{ background: "var(--bg-primary)" }}>
        <div className="flex flex-col items-center gap-5" style={{ maxWidth: 400 }}>
          <div
            className="flex items-center justify-center rounded-2xl animate-pulse"
            style={{ width: 56, height: 56, background: "rgba(239, 68, 68, 0.08)" }}
          >
            <IconRoadmap size={28} />
          </div>
          <p className="text-[14px] font-medium" style={{ color: "var(--text-secondary)" }}>
            Yol haritaniz hazirlaniyor...
          </p>

          {/* Skeleton steps */}
          <div className="w-full flex flex-col gap-2.5" style={{ maxWidth: 360 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-xl p-3 animate-pulse"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-secondary)",
                  animationDelay: `${i * 0.12}s`,
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-lg" style={{ background: "var(--bg-tertiary)" }} />
                  <div className="h-3 flex-1 rounded-md" style={{ background: "var(--bg-tertiary)" }} />
                  <div className="h-3 w-10 rounded-md" style={{ background: "var(--bg-tertiary)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ===== RENDER: ROADMAP PHASE ===== */
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <OverallProgress columns={columns} />

      {/* Mobile tab bar — shown only when a study session is active */}
      {isMobile && studyStep && (
        <div className="roadmap-mobile-tabs">
          <button
            className={`roadmap-mobile-tab ${mobileTab === "roadmap" ? "active" : ""}`}
            onClick={() => setMobileTab("roadmap")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" y1="3" x2="9" y2="18" />
              <line x1="15" y1="6" x2="15" y2="21" />
            </svg>
            Yol Haritası
          </button>
          <button
            className={`roadmap-mobile-tab ${mobileTab === "study" ? "active" : ""}`}
            onClick={() => setMobileTab("study")}
          >
            <BookIcon />
            Ders
          </button>
        </div>
      )}

      {isMobile ? (
        /* ===== MOBILE: single panel based on tab ===== */
        <div className="flex-1 overflow-hidden flex flex-col">
          {(mobileTab === "roadmap" || !studyStep) ? (
            <>
              {mobileActiveColumn > 0 && (
                <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid var(--border-secondary)" }}>
                  <button
                    onClick={() => setMobileActiveColumn((prev) => Math.max(0, prev - 1))}
                    className="flex items-center gap-1 text-[12px] font-medium rounded-lg px-2 py-1"
                    style={{ color: "#ef4444" }}
                  >
                    <IconChevronLeft size={14} />
                    Geri
                  </button>
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                    {columns[mobileActiveColumn - 1]?.title}
                  </span>
                </div>
              )}
              {columns[mobileActiveColumn] && (
                <MillerColumn
                  column={columns[mobileActiveColumn]}
                  colIndex={mobileActiveColumn}
                  totalColumns={columns.length}
                  onSelectStep={(stepNum) => handleSelectStep(mobileActiveColumn, stepNum)}
                  onToggleComplete={(stepNum) => handleToggleComplete(mobileActiveColumn, stepNum)}
                  onStudy={handleStudyTopic}
                />
              )}
            </>
          ) : (
            <StudyChatPanel
              step={studyStep}
              messages={studyMessages}
              isStreaming={isStudying}
              input={studyInput}
              onInputChange={setStudyInput}
              onSend={handleSendStudyMessage}
              endRef={studyEndRef}
            />
          )}
        </div>
      ) : (
        /* ===== DESKTOP: 2-panel split ===== */
        <div className="roadmap-split-layout">
          {/* Left: Miller Columns */}
          <div
            ref={scrollContainerRef}
            className={`roadmap-left-panel miller-columns-container ${studyStep ? "has-study-panel" : ""}`}
          >
            {columns.map((col, idx) => (
              <MillerColumn
                key={col.conversationId || `loading-${idx}`}
                column={col}
                colIndex={idx}
                totalColumns={columns.length}
                onSelectStep={(stepNum) => handleSelectStep(idx, stepNum)}
                onToggleComplete={(stepNum) => handleToggleComplete(idx, stepNum)}
                onStudy={handleStudyTopic}
              />
            ))}
          </div>

          {/* Right: Study Chat Panel */}
          <div className={studyStep ? "study-chat-panel" : "flex-1 flex flex-col"}>
            <StudyChatPanel
              step={studyStep}
              messages={studyMessages}
              isStreaming={isStudying}
              input={studyInput}
              onInputChange={setStudyInput}
              onSend={handleSendStudyMessage}
              endRef={studyEndRef}
            />
          </div>
        </div>
      )}
    </div>
  );
}
