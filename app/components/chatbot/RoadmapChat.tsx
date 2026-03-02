"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend, IconRoadmap } from "../icons/Icons";
import ChatMessageRenderer from "./ChatMessageRenderer";
import {
  useConversation,
  type ChatMessage,
} from "@/app/providers/ConversationProvider";
import {
  saveRoadmapSteps,
  getRoadmapSteps,
  toggleRoadmapStepCompletion,
  getChildConversations,
  getConversationBreadcrumb,
  type Conversation,
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

/* ===== ROADMAP PARSERS ===== */
function parseRoadmapTitle(content: string): string | null {
  const match = content.match(/\[ROADMAP_TITLE\](.*?)\[\/ROADMAP_TITLE\]/);
  return match ? match[1].trim() : null;
}

function parseRoadmapSteps(content: string): RoadmapStep[] {
  const regex = /\[STEP\](\d+)\|([\s\S]*?)\|([\s\S]*?)\|([\s\S]*?)\[\/STEP\]/g;
  const steps: RoadmapStep[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    steps.push({
      number: parseInt(match[1]),
      title: match[2].trim(),
      description: match[3].trim(),
      duration: match[4].trim(),
      completed: false,
    });
  }
  return steps;
}

/* ===== CONSTANTS ===== */
const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "Merhaba! Ben Yol Haritasi asistaninim. Ne ogrenmek istedigini soyle, sana adim adim bir ogrenme plani hazirlayayim.\n\nOrnek: \"Python ogrenmek istiyorum\" veya \"Web gelistirme yol haritasi\"",
  timestamp: new Date(),
};

const QUICK_PROMPTS = [
  { text: "Python ogrenme yolu", icon: "\uD83D\uDC0D" },
  { text: "Web gelistirme", icon: "\uD83C\uDF10" },
  { text: "Makine ogrenmesi", icon: "\uD83E\uDD16" },
];

/* ===== CHECKMARK ICON ===== */
function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ===== DETAIL ICON ===== */
function DetailIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/* ===== BOOK ICON ===== */
function BookIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

/* ===== STEP CARD COMPONENT ===== */
function StepCard({
  step,
  isCompleted,
  isExpanded,
  onToggleComplete,
  onToggleExpand,
  onAskDetail,
  onCreateSubRoadmap,
  onStudyTopic,
  childRoadmapId,
  onOpenChild,
  stepsSaved,
  index,
}: {
  step: RoadmapStep;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggleComplete: () => void;
  onToggleExpand: () => void;
  onAskDetail: () => void;
  onCreateSubRoadmap: () => void;
  onStudyTopic: () => void;
  childRoadmapId: string | null;
  onOpenChild: (id: string) => void;
  stepsSaved: boolean;
  index: number;
}) {
  return (
    <div
      className="relative flex gap-0 animate-msg-in"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Timeline dot */}
      <div className="relative flex-shrink-0" style={{ width: 24 }}>
        <button
          onClick={onToggleComplete}
          className="relative z-10 flex items-center justify-center rounded-full transition-all duration-300"
          style={{
            width: 24,
            height: 24,
            marginTop: 16,
            background: isCompleted ? "#10b981" : "var(--bg-primary)",
            border: isCompleted
              ? "2px solid #10b981"
              : "2px solid var(--border-primary)",
            color: isCompleted ? "white" : "transparent",
            boxShadow: isCompleted
              ? "0 0 12px rgba(16, 185, 129, 0.35)"
              : "none",
            cursor: "pointer",
          }}
          title={isCompleted ? "Tamamlandi olarak isaretlendi" : "Tamamlandi olarak isaretle"}
        >
          {isCompleted && <CheckIcon />}
        </button>
      </div>

      {/* Step card content */}
      <div
        className="flex-1 rounded-xl p-4 mb-4 transition-all duration-300"
        style={{
          marginLeft: 16,
          background: isCompleted
            ? "rgba(16, 185, 129, 0.06)"
            : "var(--bg-card)",
          border: isCompleted
            ? "1px solid rgba(16, 185, 129, 0.2)"
            : "1px solid var(--border-primary)",
          opacity: isCompleted ? 0.85 : 1,
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Step header */}
        <div className="flex items-center gap-2.5 mb-2">
          {/* Step number badge */}
          <span
            className="flex items-center justify-center rounded-lg text-[11px] font-bold flex-shrink-0"
            style={{
              width: 26,
              height: 26,
              background: "#ef4444",
              color: "white",
            }}
          >
            {step.number}
          </span>

          <span
            className="font-semibold text-sm flex-1"
            style={{
              color: "var(--text-primary)",
              textDecoration: isCompleted ? "line-through" : "none",
              textDecorationColor: isCompleted
                ? "rgba(16, 185, 129, 0.5)"
                : undefined,
            }}
          >
            {step.title}
          </span>

          {/* Duration badge */}
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium flex-shrink-0"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-tertiary)",
            }}
          >
            <span style={{ fontSize: 11 }}>&#9201;</span>
            {step.duration}
          </span>
        </div>

        {/* Description */}
        <p
          className="text-[13px] leading-relaxed mb-3"
          style={{ color: "var(--text-secondary)" }}
        >
          {step.description}
        </p>

        {/* Child roadmap badge */}
        {childRoadmapId && (
          <button
            onClick={() => onOpenChild(childRoadmapId)}
            className="flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all active:scale-[0.97]"
            style={{
              background: "rgba(239, 68, 68, 0.06)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.15)",
            }}
          >
            <IconRoadmap size={10} />
            Alt yol haritasi mevcut
          </button>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onToggleComplete}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all active:scale-[0.97]"
            style={{
              background: isCompleted
                ? "rgba(16, 185, 129, 0.12)"
                : "var(--bg-tertiary)",
              color: isCompleted ? "#10b981" : "var(--text-tertiary)",
              border: isCompleted
                ? "1px solid rgba(16, 185, 129, 0.2)"
                : "1px solid transparent",
            }}
          >
            {isCompleted ? (
              <>
                <CheckIcon />
                Tamamlandi
              </>
            ) : (
              "Tamamla"
            )}
          </button>

          <button
            onClick={onAskDetail}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all active:scale-[0.97]"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              color: "#ef4444",
              border: "1px solid rgba(239, 68, 68, 0.15)",
            }}
          >
            <DetailIcon />
            Detay
          </button>

          {/* Sub-roadmap button */}
          {!childRoadmapId && (
            <button
              onClick={onCreateSubRoadmap}
              disabled={!stepsSaved}
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all active:scale-[0.97] disabled:opacity-40"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                color: "#ef4444",
                border: "1px solid rgba(239, 68, 68, 0.15)",
              }}
            >
              <IconRoadmap size={11} />
              Roadmap
            </button>
          )}

          {/* Study topic button */}
          <button
            onClick={onStudyTopic}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all active:scale-[0.97]"
            style={{
              background: "rgba(16, 185, 129, 0.08)",
              color: "#10b981",
              border: "1px solid rgba(16, 185, 129, 0.15)",
            }}
          >
            <BookIcon />
            Bu Konuyu Calis
          </button>
        </div>

        {/* Expanded detail area */}
        {isExpanded && (
          <div
            className="mt-3 pt-3 text-[12px]"
            style={{
              borderTop: "1px solid var(--border-primary)",
              color: "var(--text-tertiary)",
            }}
          >
            AI&apos;dan detay isteniyor...
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== PROGRESS BAR ===== */
function ProgressBar({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-xs font-semibold"
          style={{ color: "var(--text-secondary)" }}
        >
          Ilerleme
        </span>
        <span
          className="text-xs font-bold"
          style={{
            color: percentage === 100 ? "#10b981" : "var(--text-tertiary)",
          }}
        >
          {completed}/{total} adim ({percentage}%)
        </span>
      </div>
      <div
        className="relative h-2 rounded-full overflow-hidden"
        style={{ background: "var(--bg-tertiary)" }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background:
              percentage === 100
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, #ef4444, #f87171)",
            boxShadow:
              percentage > 0
                ? percentage === 100
                  ? "0 0 12px rgba(16, 185, 129, 0.4)"
                  : "0 0 12px rgba(239, 68, 68, 0.3)"
                : "none",
          }}
        />
      </div>
    </div>
  );
}

/* ===== TYPING INDICATOR ===== */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      <div
        className="typing-dot w-2 h-2 rounded-full"
        style={{ background: "#ef4444" }}
      />
      <div
        className="typing-dot w-2 h-2 rounded-full"
        style={{ background: "#ef4444" }}
      />
      <div
        className="typing-dot w-2 h-2 rounded-full"
        style={{ background: "#ef4444" }}
      />
    </div>
  );
}

/* ===== AI AVATAR ===== */
function AiAvatar() {
  return (
    <div
      className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg mr-2.5 mt-1 text-white text-[11px] font-bold relative"
      style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
    >
      <IconRoadmap size={14} />
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

/* ===== BREADCRUMB ===== */
function Breadcrumb({
  crumbs,
  onNavigate,
}: {
  crumbs: { id: string; title: string }[];
  onNavigate: (id: string) => void;
}) {
  if (crumbs.length <= 1) return null;

  return (
    <div
      className="flex items-center gap-1.5 px-4 py-2.5 text-[11px] overflow-x-auto flex-shrink-0"
      style={{
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-primary)",
      }}
    >
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={crumb.id} className="flex items-center gap-1.5 flex-shrink-0">
            {i > 0 && (
              <span style={{ color: "var(--text-tertiary)" }}>&#8250;</span>
            )}
            {isLast ? (
              <span className="font-semibold" style={{ color: "#ef4444" }}>
                {crumb.title}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(crumb.id)}
                className="font-medium transition-colors hover:underline"
                style={{ color: "var(--text-secondary)" }}
              >
                {crumb.title}
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}

/* ===== MAIN ROADMAP CHAT ===== */
export default function RoadmapChat({ isMobile = false, onOpenConversation }: RoadmapChatProps) {
  const {
    activeConversationId,
    saveUserMessage,
    saveAssistantMessage,
    generateTitle,
    refreshConversations,
    loadConversation,
    createChildRoadmap,
    createTypedConversation,
  } = useConversation();

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // Roadmap state
  const [roadmapTitle, setRoadmapTitle] = useState<string | null>(null);
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [stepsSaved, setStepsSaved] = useState(false);

  // 2-panel layout state
  const [activeTab, setActiveTab] = useState<"roadmap" | "chat">("chat");
  const [detailStep, setDetailStep] = useState<RoadmapStep | null>(null);

  // Hierarchy state
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string; title: string }[]>([]);
  const [childRoadmapMap, setChildRoadmapMap] = useState<Record<number, string>>({});

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastAiMsgIdRef = useRef<string | null>(null);
  const isFirstMessageRef = useRef(true);

  // Load conversation on mount if there is an active one
  useEffect(() => {
    if (activeConversationId) {
      isFirstMessageRef.current = false;
      setIsInitialLoading(true);

      // Load steps from DB, breadcrumb, and children in parallel
      const loadAll = async () => {
        const [loaded, dbSteps, crumbs, children] = await Promise.all([
          loadConversation(activeConversationId),
          getRoadmapSteps(activeConversationId).catch(() => []),
          getConversationBreadcrumb(activeConversationId).catch(() => []),
          getChildConversations(activeConversationId).catch(() => [] as Conversation[]),
        ]);

        if (loaded.length > 0) {
          setMessages([WELCOME_MESSAGE, ...loaded]);
        }

        // Load steps from DB if available, otherwise parse from messages
        if (dbSteps.length > 0) {
          const stepsFromDb: RoadmapStep[] = dbSteps.map((s) => ({
            number: s.step_number,
            title: s.title,
            description: s.description,
            duration: s.duration,
            completed: s.is_completed,
          }));
          setSteps(stepsFromDb);
          setCompletedSteps(new Set(dbSteps.filter((s) => s.is_completed).map((s) => s.step_number)));
          setStepsSaved(true);
        } else {
          // Fallback: parse from messages
          for (const msg of loaded) {
            if (msg.role === "assistant") {
              const parsed = parseRoadmapSteps(msg.content);
              if (parsed.length > 0) setSteps(parsed);
            }
          }
        }

        // Parse title from messages
        for (const msg of loaded) {
          if (msg.role === "assistant") {
            const title = parseRoadmapTitle(msg.content);
            if (title) setRoadmapTitle(title);
          }
        }

        setBreadcrumbs(crumbs);

        // Build child roadmap map (stepNumber -> childConversationId)
        const childMap: Record<number, string> = {};
        for (const child of children) {
          if (child.parent_step_number != null) {
            childMap[child.parent_step_number] = child.id;
          }
        }
        setChildRoadmapMap(childMap);

        setIsInitialLoading(false);
      };

      loadAll();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to the START of the last AI message
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    if (lastAiMsgIdRef.current === lastMsg.id) return;
    lastAiMsgIdRef.current = lastMsg.id;

    requestAnimationFrame(() => {
      const el = document.getElementById(`roadmap-msg-${lastMsg.id}`);
      if (el && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const elTop = el.offsetTop - container.offsetTop;
        container.scrollTo({ top: elTop - 16, behavior: "smooth" });
      }
    });
  }, [messages]);

  // Parse roadmap from the latest assistant message whenever messages change
  useEffect(() => {
    // Only parse from messages if steps weren't loaded from DB
    if (stepsSaved) return;

    const assistantMessages = messages.filter(
      (m) => m.role === "assistant" && m.id !== "welcome"
    );
    if (assistantMessages.length === 0) return;

    for (const msg of assistantMessages) {
      const title = parseRoadmapTitle(msg.content);
      if (title) setRoadmapTitle(title);

      const parsed = parseRoadmapSteps(msg.content);
      if (parsed.length > 0) setSteps(parsed);
    }
  }, [messages, stepsSaved]);

  const sendToAI = useCallback(
    async (userContent: string, allMessages: ChatMessage[]) => {
      setIsLoading(true);

      let conversationId: string;
      let isFirst = isFirstMessageRef.current;
      try {
        const result = await saveUserMessage(userContent, null, "roadmap");
        conversationId = result.conversationId;
        if (isFirst) {
          isFirstMessageRef.current = false;
        }
      } catch (err) {
        console.error("Failed to save user message:", err);
        conversationId = "";
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
          },
          "roadmap"
        );

        // Save completed assistant message to DB
        if (fullContent) {
          try {
            await saveAssistantMessage(conversationId, fullContent);
          } catch (err) {
            console.error("Failed to save assistant message:", err);
          }

          // Persist steps to DB after AI stream completes
          const parsedSteps = parseRoadmapSteps(fullContent);
          if (parsedSteps.length > 0 && conversationId) {
            try {
              await saveRoadmapSteps(
                conversationId,
                parsedSteps.map((s) => ({
                  stepNumber: s.number,
                  title: s.title,
                  description: s.description,
                  duration: s.duration,
                  isCompleted: false,
                }))
              );
              setStepsSaved(true);
            } catch (err) {
              console.error("Failed to save roadmap steps:", err);
            }
          }
        }

        if (isFirst && fullContent) {
          generateTitle(conversationId, userContent);
        }

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
        setIsLoading(false);
      }
    },
    [
      saveUserMessage,
      saveAssistantMessage,
      generateTitle,
      refreshConversations,
    ]
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

  const handleAskDetail = useCallback(
    (step: RoadmapStep) => {
      setDetailStep(step);
      const userContent = `Adim ${step.number}: ${step.title} hakkinda detayli bilgi ver`;
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: userContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      sendToAI(userContent, messages);
      if (isMobile) setActiveTab("chat");
    },
    [sendToAI, messages, isMobile]
  );

  const toggleStepComplete = useCallback(
    (stepNumber: number) => {
      setCompletedSteps((prev) => {
        const next = new Set(prev);
        const newState = !next.has(stepNumber);
        if (newState) {
          next.add(stepNumber);
        } else {
          next.delete(stepNumber);
        }

        // Persist to DB
        if (activeConversationId) {
          toggleRoadmapStepCompletion(activeConversationId, stepNumber, newState).catch((err) =>
            console.error("Failed to toggle step:", err)
          );
        }

        return next;
      });
    },
    [activeConversationId]
  );

  const handleCreateSubRoadmap = useCallback(
    async (step: RoadmapStep) => {
      if (!activeConversationId || !onOpenConversation) return;
      try {
        const childId = await createChildRoadmap(activeConversationId, step.number);
        setChildRoadmapMap((prev) => ({ ...prev, [step.number]: childId }));

        // Auto-send message to child roadmap
        const msg = `${step.title} konusunda detayli yol haritasi olustur`;
        await saveUserMessage.call(null, msg, null, "roadmap");

        onOpenConversation(childId, "roadmap");
      } catch (err) {
        console.error("Failed to create sub-roadmap:", err);
      }
    },
    [activeConversationId, createChildRoadmap, onOpenConversation, saveUserMessage]
  );

  const handleStudyTopic = useCallback(
    async (step: RoadmapStep) => {
      if (!onOpenConversation) return;
      try {
        const convId = await createTypedConversation("standard");
        const contextMsg = `${roadmapTitle || "Yol haritasi"} yol haritasinda '${step.title}' konusunu calisiyorum. Aciklama: ${step.description}. Lutfen bu konuyu bana detayli ogret.`;

        // We need to save the user message for the new conversation
        // The createTypedConversation already set it as active, so saveUserMessage will use it
        await saveUserMessage(contextMsg, null, "standard");

        onOpenConversation(convId, "standard");
      } catch (err) {
        console.error("Failed to create study conversation:", err);
      }
    },
    [onOpenConversation, createTypedConversation, saveUserMessage, roadmapTitle]
  );

  const handleBreadcrumbNavigate = useCallback(
    (id: string) => {
      if (onOpenConversation) {
        onOpenConversation(id, "roadmap");
      }
    },
    [onOpenConversation]
  );

  const handleOpenChild = useCallback(
    (id: string) => {
      if (onOpenConversation) {
        onOpenConversation(id, "roadmap");
      }
    },
    [onOpenConversation]
  );

  const handleQuickPrompt = useCallback((text: string) => {
    setInput(text);
  }, []);

  if (isInitialLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3">
        <div className="auth-spinner" style={{ width: 28, height: 28 }} />
        <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          Yol haritasi yukleniyor...
        </p>
      </div>
    );
  }

  const hasRoadmap = steps.length > 0;

  /* ===== FULL-WIDTH MODE (before roadmap generated) ===== */
  if (!hasRoadmap) {
    return (
      <div className="flex flex-col h-full" style={{ background: "var(--bg-primary)" }}>
        {/* Breadcrumb */}
        <Breadcrumb crumbs={breadcrumbs} onNavigate={handleBreadcrumbNavigate} />

        {/* Main scrollable area */}
        <div
          ref={scrollContainerRef}
          className={`flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 ${isMobile ? "pb-2" : ""}`}
        >
          <div className="max-w-[720px] mx-auto">
            {/* Messages */}
            <div className="space-y-5 sm:space-y-6">
              {messages.map((msg, idx) => (
                <div
                  id={`roadmap-msg-${msg.id}`}
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-msg-in`}
                  style={{
                    animationDelay: `${Math.min(idx * 0.05, 0.3)}s`,
                  }}
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
                            isLoading &&
                            msg.id ===
                              messages[messages.length - 1]?.id && (
                              <TypingIndicator />
                            )
                          )}
                        </>
                      ) : (
                        <p className="text-[13px] sm:text-sm leading-relaxed">
                          {msg.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Prompts (show when no user messages yet) */}
            {messages.length <= 1 && (
              <div
                className="mt-8 sm:mt-10 animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="text-center mb-6">
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 animate-float"
                    style={{
                      background: "rgba(239, 68, 68, 0.1)",
                      boxShadow: "0 0 20px rgba(239, 68, 68, 0.15)",
                    }}
                  >
                    <IconRoadmap size={28} style={{ color: "#ef4444" }} />
                  </div>
                  <h2
                    className="text-base font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Ne ogrenmek istiyorsun?
                  </h2>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Bir konu sec, sana adim adim ogrenme yolu cikarayim
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:flex sm:flex-wrap sm:justify-center gap-2 sm:gap-2.5">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={prompt.text}
                      onClick={() => handleQuickPrompt(prompt.text)}
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
                ? "0 0 12px rgba(239, 68, 68, 0.15)"
                : "var(--shadow-md)",
              borderColor: input.trim()
                ? "rgba(239, 68, 68, 0.25)"
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
                  ? "Yanit bekleniyor..."
                  : "Ne ogrenmek istiyorsun? (or: React ogrenme yolu)"
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
                    ? "linear-gradient(135deg, #ef4444, #dc2626)"
                    : "var(--bg-tertiary)",
                color:
                  input.trim() && !isLoading
                    ? "white"
                    : "var(--text-tertiary)",
                boxShadow:
                  input.trim() && !isLoading
                    ? "0 0 12px rgba(239, 68, 68, 0.3)"
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
              <span style={{ color: "#ef4444", opacity: 0.6 }}>&#9679;</span>
              Adimlari tamamla isaretiyle takip et &#183; Detay butonu ile
              derinlemesine ogren
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ===== 2-PANEL MODE (after roadmap generated) ===== */
  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-primary)" }}>
      {/* Breadcrumb */}
      <Breadcrumb crumbs={breadcrumbs} onNavigate={handleBreadcrumbNavigate} />

      <div className="flex flex-1 min-h-0 relative">
        {/* Mobile tab bar - only when hasRoadmap && isMobile */}
        {isMobile && (
          <div
            className="absolute top-0 left-0 right-0 z-10 flex"
            style={{
              borderBottom: "1px solid var(--border-primary)",
              background: "var(--bg-secondary)",
            }}
          >
            <button
              onClick={() => setActiveTab("chat")}
              className="flex-1 py-2.5 text-xs font-semibold transition-colors"
              style={{
                color: activeTab === "chat" ? "#ef4444" : "var(--text-tertiary)",
                borderBottom: activeTab === "chat" ? "2px solid #ef4444" : "2px solid transparent",
              }}
            >
              Sohbet
            </button>
            <button
              onClick={() => setActiveTab("roadmap")}
              className="flex-1 py-2.5 text-xs font-semibold transition-colors"
              style={{
                color: activeTab === "roadmap" ? "#ef4444" : "var(--text-tertiary)",
                borderBottom: activeTab === "roadmap" ? "2px solid #ef4444" : "2px solid transparent",
              }}
            >
              Harita
            </button>
          </div>
        )}

        {/* LEFT PANEL: Chat + Detail */}
        <div
          style={{
            flex: 1,
            display: isMobile && activeTab !== "chat" ? "none" : "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Mobile top padding for tab bar */}
          {isMobile && <div style={{ height: 42, flexShrink: 0 }} />}

          {/* Detail step card - shown at top when a step detail is active */}
          {detailStep && (
            <div
              className="flex-shrink-0 p-3"
              style={{
                borderBottom: "1px solid var(--border-primary)",
                background: "var(--bg-secondary)",
              }}
            >
              <div
                className="rounded-xl p-3"
                style={{
                  background: "rgba(239, 68, 68, 0.04)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="flex items-center justify-center rounded-lg text-[10px] font-bold"
                    style={{
                      width: 22,
                      height: 22,
                      background: "#ef4444",
                      color: "white",
                    }}
                  >
                    {detailStep.number}
                  </span>
                  <span
                    className="font-semibold text-sm flex-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {detailStep.title}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {detailStep.duration}
                  </span>
                  <button
                    onClick={() => setDetailStep(null)}
                    className="ml-1 text-xs rounded-md p-1 transition-colors hover:opacity-70"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    &#10005;
                  </button>
                </div>
                <p
                  className="text-[11px]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {detailStep.description}
                </p>
              </div>
            </div>
          )}

          {/* Messages area - scrollable */}
          <div
            ref={scrollContainerRef}
            className={`flex-1 overflow-y-auto p-4 sm:p-6 ${isMobile ? "pb-2" : ""}`}
          >
            <div className="space-y-5 sm:space-y-6">
              {messages.map((msg, idx) => {
                if (msg.id === "welcome") return null;

                const isRoadmapData =
                  msg.role === "assistant" &&
                  (parseRoadmapSteps(msg.content).length > 0 ||
                    parseRoadmapTitle(msg.content) !== null);

                if (isRoadmapData && msg.content.length > 0) {
                  return (
                    <div
                      id={`roadmap-msg-${msg.id}`}
                      key={msg.id}
                      className="flex justify-start animate-msg-in"
                      style={{
                        animationDelay: `${Math.min(idx * 0.05, 0.3)}s`,
                      }}
                    >
                      <AiAvatar />
                      <div className="group relative max-w-[92%] sm:max-w-[88%]">
                        <div className="px-3.5 py-3 sm:px-4 sm:py-3.5 msg-ai">
                          <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                            <IconRoadmap size={12} style={{ color: "#ef4444" }} />
                            <span>Yol haritasi olusturuldu - sol panelde goruntuleniyor</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    id={`roadmap-msg-${msg.id}`}
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-msg-in`}
                    style={{
                      animationDelay: `${Math.min(idx * 0.05, 0.3)}s`,
                    }}
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
                              isLoading &&
                              msg.id ===
                                messages[messages.length - 1]?.id && (
                                <TypingIndicator />
                              )
                            )}
                          </>
                        ) : (
                          <p className="text-[13px] sm:text-sm leading-relaxed">
                            {msg.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Input Bar */}
          <div
            className={`flex-shrink-0 p-3 sm:p-4`}
            style={{ borderTop: "1px solid var(--border-primary)" }}
          >
            <div
              className="flex items-center gap-2 rounded-2xl px-3 py-2.5 sm:px-4 transition-all"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                boxShadow: input.trim()
                  ? "0 0 12px rgba(239, 68, 68, 0.15)"
                  : "var(--shadow-md)",
                borderColor: input.trim()
                  ? "rgba(239, 68, 68, 0.25)"
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
                    ? "Yanit bekleniyor..."
                    : "Adimlar hakkinda soru sor..."
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
                      ? "linear-gradient(135deg, #ef4444, #dc2626)"
                      : "var(--bg-tertiary)",
                  color:
                    input.trim() && !isLoading
                      ? "white"
                      : "var(--text-tertiary)",
                  boxShadow:
                    input.trim() && !isLoading
                      ? "0 0 12px rgba(239, 68, 68, 0.3)"
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
                <span style={{ color: "#ef4444", opacity: 0.6 }}>&#9679;</span>
                Adimlari tamamla isaretiyle takip et &#183; Detay butonu ile
                derinlemesine ogren
              </p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Roadmap timeline */}
        <div
          style={{
            width: isMobile ? "100%" : "45%",
            display: isMobile && activeTab !== "roadmap" ? "none" : "flex",
            flexDirection: "column",
            borderLeft: isMobile ? "none" : "1px solid var(--border-primary)",
            background: "var(--bg-secondary)",
            transition: "width 0.3s ease",
          }}
          className="overflow-y-auto"
        >
          <div
            className="p-4 sm:p-6"
            style={{ paddingTop: isMobile ? 52 : undefined }}
          >
            {/* Roadmap Title */}
            {roadmapTitle && (
              <div className="text-center mb-6 animate-msg-in">
                <h1
                  className="text-xl sm:text-2xl font-bold mb-2"
                  style={{
                    background:
                      "linear-gradient(135deg, #ef4444, #f97316, #ef4444)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {roadmapTitle}
                </h1>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {steps.length} adimlik ogrenme plani
                </p>
              </div>
            )}

            {/* Progress Bar */}
            <ProgressBar
              completed={completedSteps.size}
              total={steps.length}
            />

            {/* Timeline */}
            <div className="relative">
              {/* Vertical timeline line */}
              <div
                className="absolute"
                style={{
                  left: 11,
                  top: 28,
                  bottom: 16,
                  width: 2,
                  background: `linear-gradient(to bottom, #ef4444, var(--border-primary))`,
                  borderRadius: 1,
                }}
              />

              {/* Steps */}
              {steps.map((step, idx) => (
                <StepCard
                  key={step.number}
                  step={step}
                  isCompleted={completedSteps.has(step.number)}
                  isExpanded={expandedStep === step.number}
                  onToggleComplete={() => toggleStepComplete(step.number)}
                  onToggleExpand={() =>
                    setExpandedStep(
                      expandedStep === step.number ? null : step.number
                    )
                  }
                  onAskDetail={() => handleAskDetail(step)}
                  onCreateSubRoadmap={() => handleCreateSubRoadmap(step)}
                  onStudyTopic={() => handleStudyTopic(step)}
                  childRoadmapId={childRoadmapMap[step.number] || null}
                  onOpenChild={handleOpenChild}
                  stepsSaved={stepsSaved}
                  index={idx}
                />
              ))}
            </div>

            {/* Completion celebration */}
            {completedSteps.size === steps.length && steps.length > 0 && (
              <div
                className="text-center py-6 rounded-xl mt-4 animate-msg-in"
                style={{
                  background: "rgba(16, 185, 129, 0.08)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                }}
              >
                <span className="text-3xl mb-2 block">&#127881;</span>
                <p
                  className="text-sm font-bold"
                  style={{ color: "#10b981" }}
                >
                  Tebrikler! Tum adimlari tamamladin!
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Yeni bir konu kesfetmek icin sohbet panelinden soru sorabilirsin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
