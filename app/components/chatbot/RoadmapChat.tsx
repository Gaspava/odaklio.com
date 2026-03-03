"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend, IconRoadmap, IconChevronLeft, IconChevronRight } from "../icons/Icons";
import { useConversation } from "@/app/providers/ConversationProvider";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  saveRoadmapSteps,
  getRoadmapSteps,
  toggleRoadmapStepCompletion,
  getChildConversations,
  getConversationBreadcrumb,
  getConversation,
  type Conversation,
  type RoadmapStepRow,
} from "@/lib/db/conversations";

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

type Phase = "input" | "loading" | "roadmap";
const MAX_DEPTH = 4;

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
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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
  onStudy: (step: RoadmapStep) => void;
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
              onStudy={() => onStudy(step)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ===== MAIN COMPONENT ===== */
export default function RoadmapChat({ isMobile = false, onOpenConversation }: RoadmapChatProps) {
  const { user } = useAuth();
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isGeneratingRef = useRef(false);

  /* ===== AUTO-SCROLL RIGHT ===== */
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

  /* ===== TOGGLE COMPLETION ===== */
  const handleToggleComplete = useCallback((colIndex: number, stepNumber: number) => {
    setColumns((prev) => {
      const next = [...prev];
      const col = { ...next[colIndex] };
      const newCompleted = new Set(col.completedSteps);

      if (newCompleted.has(stepNumber)) {
        newCompleted.delete(stepNumber);
      } else {
        newCompleted.add(stepNumber);
      }

      col.completedSteps = newCompleted;
      next[colIndex] = col;
      return next;
    });

    // Persist to DB
    const col = columns[colIndex];
    if (col) {
      const wasCompleted = col.completedSteps.has(stepNumber);
      toggleRoadmapStepCompletion(col.conversationId, stepNumber, !wasCompleted).catch(console.error);
    }
  }, [columns]);

  /* ===== STUDY TOPIC ===== */
  const handleStudyTopic = useCallback(async (step: RoadmapStep) => {
    if (!onOpenConversation) return;
    try {
      const convId = await createTypedConversation("standard");
      await saveAssistantMessage(convId, `"${step.title}" konusunu birlikte calisalim!\n\n${step.description}\n\nNe sormak istersin?`);
      onOpenConversation(convId, "standard");
    } catch (err) {
      console.error("Study topic error:", err);
    }
  }, [onOpenConversation, createTypedConversation, saveAssistantMessage]);

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
        let currentId = rootId;
        let targetPath: string[] = [];

        // Build the path from root to active conversation
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
    const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "";
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: "var(--bg-primary)" }}>
        <div className="min-h-full flex flex-col items-center justify-center px-4 py-8 animate-fade-in">
          {/* Mode badge */}
          <div className="welcome-mode-badge welcome-mode-badge-red mb-4">
            <span>🗺️</span> Yol Haritası Modu
          </div>
          <div className="welcome-logo-glow mb-5">
            <img src="/odaklio-logo.svg" alt="Odaklio" className="w-24 h-24 sm:w-28 sm:h-28" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 text-center tracking-wide">
            {firstName ? (
              <>
                <span style={{ color: "var(--text-primary)" }}>MERHABA, </span>
                <span className="welcome-name-glow-red">{firstName.toUpperCase()}!</span>
              </>
            ) : (
              <span style={{ color: "var(--text-primary)" }}>MERHABA!</span>
            )}
          </h1>
          <p className="text-sm sm:text-base mb-8 text-center" style={{ color: "var(--text-tertiary)" }}>
            Bir konu yaz, sana adım adım öğrenme yol haritası hazırlayayım.
          </p>

          <div className="w-full max-w-[600px] mb-6">
            <div className="welcome-input-wrapper">
              <div className="welcome-input-glow-red" />
              <div className="welcome-input-inner">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                  placeholder={isMobile ? "Konu yaz..." : "Öğrenmek istediğin konuyu yaz... (örn: React ile web geliştirme)"}
                  disabled={isGenerating}
                  className="flex-1 bg-transparent text-sm sm:text-base outline-none disabled:opacity-50"
                  style={{ color: "var(--text-primary)" }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!inputText.trim() || isGenerating}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl transition-all active:scale-[0.95] disabled:opacity-40"
                  style={{
                    background: inputText.trim() && !isGenerating ? "#ef4444" : "var(--bg-tertiary)",
                    color: inputText.trim() && !isGenerating ? "white" : "var(--text-tertiary)",
                    boxShadow: inputText.trim() && !isGenerating ? "0 0 12px rgba(239, 68, 68, 0.3)" : "none",
                  }}
                >
                  <IconSend size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5 max-w-[600px]">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.text}
                onClick={() => handleGenerate(qp.text)}
                disabled={isGenerating}
                className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all active:scale-[0.97] hover:shadow-md disabled:opacity-50"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "var(--text-secondary)",
                }}
              >
                <span>{qp.icon}</span>
                {qp.text}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-4 text-[12px] text-center" style={{ color: "var(--accent-danger)" }}>
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

  /* ===== RENDER: ROADMAP PHASE (MILLER COLUMNS) ===== */
  if (isMobile) {
    const activeCol = columns[mobileActiveColumn];
    if (!activeCol) return null;

    return (
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--bg-primary)" }}>
        {/* Overall progress */}
        <OverallProgress columns={columns} />

        {/* Mobile navigation header */}
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

        {/* Single column view */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <MillerColumn
            column={activeCol}
            colIndex={mobileActiveColumn}
            totalColumns={columns.length}
            onSelectStep={(stepNum) => handleSelectStep(mobileActiveColumn, stepNum)}
            onToggleComplete={(stepNum) => handleToggleComplete(mobileActiveColumn, stepNum)}
            onStudy={(step) => handleStudyTopic(step)}
          />
        </div>
      </div>
    );
  }

  /* Desktop: horizontal scroll container */
  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Overall progress */}
      <OverallProgress columns={columns} />

      {/* Miller columns container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex overflow-x-auto miller-columns-container"
      >
        {columns.map((col, idx) => (
          <MillerColumn
            key={col.conversationId || `loading-${idx}`}
            column={col}
            colIndex={idx}
            totalColumns={columns.length}
            onSelectStep={(stepNum) => handleSelectStep(idx, stepNum)}
            onToggleComplete={(stepNum) => handleToggleComplete(idx, stepNum)}
            onStudy={(step) => handleStudyTopic(step)}
          />
        ))}
      </div>
    </div>
  );
}
