"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type MouseEvent as ReactMouseEvent,
} from "react";
import {
  IconSend,
  IconZoomIn,
  IconZoomOut,
  IconMaximize,
  IconX,
  IconGitBranch,
  IconChevronLeft,
} from "../icons/Icons";
import ChatMessageRenderer from "./ChatMessageRenderer";

/* ===== TYPES ===== */
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatNode {
  id: string;
  x: number;
  y: number;
  parentId: string | null;
  label: string;
  messages: Message[];
  isLoading: boolean;
}

interface Connection {
  fromId: string;
  toId: string;
}

interface MindmapChatProps {
  isMobile?: boolean;
}

/* ===== CONSTANTS ===== */
const NODE_WIDTH = 680;
const NODE_HEIGHT = 520;
const NODE_GAP_X = 120;
const NODE_GAP_Y = 80;

/* ===== STREAMING HELPER ===== */
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

/* ===== MINDMAP AI AVATAR ===== */
function MindmapAiAvatar({ isMain }: { isMain: boolean }) {
  return (
    <div
      className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-lg text-white text-[10px] font-bold relative"
      style={{
        background: isMain ? "var(--gradient-primary)" : "var(--gradient-accent)",
      }}
    >
      O
      <div
        className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-[1.5px]"
        style={{
          background: "var(--accent-success)",
          borderColor: "var(--bg-card)",
        }}
      />
    </div>
  );
}

/* ===== CHAT NODE COMPONENT ===== */
function ChatNodeComponent({
  node,
  isActive,
  onActivate,
  onSend,
  onCreateBranch,
  onClose,
  isMain,
  scale,
}: {
  node: ChatNode;
  isActive: boolean;
  onActivate: () => void;
  onSend: (content: string) => void;
  onCreateBranch: (selectedText: string) => void;
  onClose: () => void;
  isMain: boolean;
  scale: number;
}) {
  const [input, setInput] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [showBranchButton, setShowBranchButton] = useState(false);
  const [branchBtnPos, setBranchBtnPos] = useState({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastAiMsgIdRef = useRef<string | null>(null);

  // Scroll to the START of the last AI message (not the bottom)
  useEffect(() => {
    const lastMsg = node.messages[node.messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    if (lastAiMsgIdRef.current === lastMsg.id) return;
    lastAiMsgIdRef.current = lastMsg.id;

    requestAnimationFrame(() => {
      const el = document.getElementById(`mindmap-msg-${node.id}-${lastMsg.id}`);
      if (el && scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const elTop = el.offsetTop;
        container.scrollTo({ top: elTop - 8, behavior: "smooth" });
      }
    });
  }, [node.messages, node.id]);

  const handleSend = () => {
    if (!input.trim() || node.isLoading) return;
    onSend(input.trim());
    setInput("");
  };

  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setShowBranchButton(false);
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 2) {
        setShowBranchButton(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const nodeEl = nodeRef.current;
      if (!nodeEl) return;
      const nodeRect = nodeEl.getBoundingClientRect();

      setSelectedText(text);
      setBranchBtnPos({
        x: (rect.left + rect.width / 2 - nodeRect.left) / scale,
        y: (rect.top - nodeRect.top) / scale,
      });
      setShowBranchButton(true);
    }, 100);
  }, [scale]);

  const handleMouseDown = useCallback(() => {
    setShowBranchButton(false);
  }, []);

  const accentColor = isMain ? "var(--accent-primary)" : "var(--accent-purple)";
  const accentLightColor = isMain ? "var(--accent-primary-light)" : "var(--accent-purple-light)";

  return (
    <div
      ref={nodeRef}
      className="mindmap-node"
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        borderColor: isActive ? accentColor : "var(--border-primary)",
        boxShadow: isActive
          ? isMain
            ? "0 0 0 1px rgba(16, 185, 129, 0.15), 0 8px 32px rgba(16, 185, 129, 0.12), 0 2px 8px rgba(0,0,0,0.06)"
            : "0 0 0 1px rgba(139, 92, 246, 0.15), 0 8px 32px rgba(139, 92, 246, 0.12), 0 2px 8px rgba(0,0,0,0.06)"
          : "0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
    >
      {/* Node Header */}
      <div className="mindmap-node-header">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg flex-shrink-0"
            style={{
              background: accentLightColor,
              color: accentColor,
            }}
          >
            {isMain ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            ) : (
              <IconGitBranch size={13} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span
              className="text-[13px] font-semibold truncate block"
              style={{ color: "var(--text-primary)" }}
            >
              {isMain ? "Ana Sohbet" : node.label}
            </span>
            {!isMain && (
              <span
                className="text-[10px] truncate block"
                style={{ color: "var(--text-tertiary)" }}
              >
                Dal sohbeti
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {node.isLoading && (
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium"
              style={{ background: accentLightColor, color: accentColor }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
              Yazıyor
            </div>
          )}
          <span
            className="text-[10px] font-medium px-2 py-1 rounded-md"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-tertiary)",
            }}
          >
            {node.messages.filter(m => m.role === "user").length} mesaj
          </span>
          {!isMain && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--accent-danger-light)";
                e.currentTarget.style.color = "var(--accent-danger)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-tertiary)";
              }}
            >
              <IconX size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollContainerRef}
        className="mindmap-node-messages"
        onWheel={(e) => e.stopPropagation()}
      >
        {node.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{
                background: accentLightColor,
                boxShadow: `0 4px 12px ${isMain ? "rgba(16,185,129,0.1)" : "rgba(139,92,246,0.1)"}`,
              }}
            >
              {isMain ? (
                <span className="text-2xl">🎓</span>
              ) : (
                <IconGitBranch size={24} style={{ color: accentColor, opacity: 0.7 }} />
              )}
            </div>
            <div className="text-center">
              <p
                className="text-[13px] font-semibold mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                {isMain ? "Ne öğrenmek istiyorsun?" : "Yeni dal başlat"}
              </p>
              <p
                className="text-[11px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                {isMain
                  ? "Bir soru yazarak sohbete başla"
                  : "Bu konuda sorular sorabilirsin"}
              </p>
            </div>
          </div>
        )}
        {node.messages.map((msg) => (
          <div
            id={`mindmap-msg-${node.id}-${msg.id}`}
            key={msg.id}
            className={`mindmap-msg-row ${msg.role === "user" ? "mindmap-msg-row-user" : "mindmap-msg-row-ai"}`}
          >
            {msg.role === "assistant" && (
              <MindmapAiAvatar isMain={isMain} />
            )}
            <div
              className={`mindmap-msg ${
                msg.role === "user" ? "mindmap-msg-user" : "mindmap-msg-ai"
              }`}
            >
              {msg.role === "assistant" ? (
                msg.content ? (
                  <div className="msg-ai-content">
                    <ChatMessageRenderer content={msg.content} />
                  </div>
                ) : (
                  node.isLoading && (
                    <div className="flex items-center gap-1.5 px-1 py-1.5">
                      <div
                        className="typing-dot w-1.5 h-1.5 rounded-full"
                        style={{ background: accentColor }}
                      />
                      <div
                        className="typing-dot w-1.5 h-1.5 rounded-full"
                        style={{ background: accentColor }}
                      />
                      <div
                        className="typing-dot w-1.5 h-1.5 rounded-full"
                        style={{ background: accentColor }}
                      />
                    </div>
                  )
                )
              ) : (
                <p className="text-[13px] leading-relaxed">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Branch Button (appears on text selection) */}
      {showBranchButton && (
        <div
          className="absolute z-50 animate-fade-in-scale"
          style={{
            left: branchBtnPos.x,
            top: branchBtnPos.y - 44,
            transform: "translateX(-50%)",
          }}
        >
          <button
            className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all"
            style={{
              background: "var(--accent-purple)",
              color: "white",
              boxShadow: "0 4px 20px rgba(139, 92, 246, 0.35), 0 0 0 1px rgba(139, 92, 246, 0.1)",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onCreateBranch(selectedText);
              setShowBranchButton(false);
              window.getSelection()?.removeAllRanges();
            }}
          >
            <IconGitBranch size={12} />
            Yeni Yol Oluştur
          </button>
        </div>
      )}

      {/* Input */}
      <div className="mindmap-node-input">
        <div
          className="mindmap-node-input-inner"
          style={{
            borderColor: input.trim()
              ? isMain
                ? "rgba(16, 185, 129, 0.25)"
                : "rgba(139, 92, 246, 0.25)"
              : "var(--border-primary)",
            boxShadow: input.trim()
              ? isMain
                ? "0 0 0 3px rgba(16, 185, 129, 0.06)"
                : "0 0 0 3px rgba(139, 92, 246, 0.06)"
              : "none",
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") handleSend();
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder={node.isLoading ? "Yanıt bekleniyor..." : "Mesajını yaz..."}
            disabled={node.isLoading}
            className="flex-1 bg-transparent text-[13px] outline-none disabled:opacity-50 placeholder:font-medium"
            style={{ color: "var(--text-primary)" }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSend();
            }}
            disabled={!input.trim() || node.isLoading}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 active:scale-95"
            style={{
              background:
                input.trim() && !node.isLoading
                  ? isMain
                    ? "var(--gradient-primary)"
                    : "var(--gradient-accent)"
                  : "var(--bg-tertiary)",
              color:
                input.trim() && !node.isLoading
                  ? "white"
                  : "var(--text-tertiary)",
              boxShadow:
                input.trim() && !node.isLoading
                  ? isMain
                    ? "0 2px 8px rgba(16,185,129,0.3)"
                    : "0 2px 8px rgba(139,92,246,0.3)"
                  : "none",
            }}
          >
            <IconSend size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== MOBILE MINDMAP VIEW ===== */
function MobileMindmapView({
  nodes,
  connections,
  activeNodeId,
  setActiveNodeId,
  onSendMessage,
  onCreateBranch,
  onCloseNode,
}: {
  nodes: ChatNode[];
  connections: Connection[];
  activeNodeId: string;
  setActiveNodeId: (id: string) => void;
  onSendMessage: (nodeId: string, content: string) => void;
  onCreateBranch: (parentNodeId: string, selectedText: string) => void;
  onCloseNode: (nodeId: string) => void;
}) {
  const [input, setInput] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [showBranchPopup, setShowBranchPopup] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastAiMsgIdRef = useRef<string | null>(null);

  const activeNode = nodes.find((n) => n.id === activeNodeId) || nodes[0];
  const isMain = activeNode.id === "main";
  const parentNode = activeNode.parentId
    ? nodes.find((n) => n.id === activeNode.parentId)
    : null;
  const accentColor = isMain ? "var(--accent-primary)" : "var(--accent-purple)";
  const accentLightColor = isMain ? "var(--accent-primary-light)" : "var(--accent-purple-light)";

  // Scroll to last AI message start
  useEffect(() => {
    const lastMsg = activeNode.messages[activeNode.messages.length - 1];
    if (!lastMsg || lastMsg.role !== "assistant") return;
    if (lastAiMsgIdRef.current === lastMsg.id) return;
    lastAiMsgIdRef.current = lastMsg.id;

    requestAnimationFrame(() => {
      const el = document.getElementById(`mobile-msg-${activeNode.id}-${lastMsg.id}`);
      if (el && scrollRef.current) {
        const elTop = el.offsetTop;
        scrollRef.current.scrollTo({ top: elTop - 8, behavior: "smooth" });
      }
    });
  }, [activeNode.messages, activeNode.id]);

  // Scroll active tab into view
  useEffect(() => {
    if (!tabsRef.current) return;
    const activeTab = tabsRef.current.querySelector(`[data-node-id="${activeNodeId}"]`);
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeNodeId]);

  const handleSend = () => {
    if (!input.trim() || activeNode.isLoading) return;
    onSendMessage(activeNode.id, input.trim());
    setInput("");
    inputRef.current?.blur();
  };

  // Text selection handler for branch creation (touch-friendly)
  const handleTouchEnd = useCallback(() => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setShowBranchPopup(false);
        return;
      }
      const text = selection.toString().trim();
      if (text.length < 2) {
        setShowBranchPopup(false);
        return;
      }
      setSelectedText(text);
      setShowBranchPopup(true);
    }, 200);
  }, []);

  // Build breadcrumb path
  const breadcrumb: ChatNode[] = [];
  if (!isMain) {
    let current: ChatNode | undefined = activeNode;
    while (current) {
      breadcrumb.unshift(current);
      current = current.parentId
        ? nodes.find((n) => n.id === current!.parentId)
        : undefined;
    }
  }

  return (
    <div className="flex flex-col h-full relative" style={{ background: "var(--bg-primary)" }}>
      {/* Mobile Top Bar - only show for branch nodes */}
      {!isMain && (
        <div
          className="flex items-center gap-2 px-3 py-2.5 flex-shrink-0 z-10"
          style={{
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          {parentNode && (
            <button
              onClick={() => setActiveNodeId(parentNode.id)}
              className="flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 active:scale-95 transition-transform"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
              }}
            >
              <IconChevronLeft size={16} />
            </button>
          )}
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0"
            style={{ background: accentLightColor, color: accentColor }}
          >
            <IconGitBranch size={14} />
          </div>
          <div className="min-w-0 flex-1">
            <span
              className="text-[13px] font-semibold truncate block"
              style={{ color: "var(--text-primary)" }}
            >
              {activeNode.label}
            </span>
            {breadcrumb.length > 1 && (
              <span
                className="text-[10px] truncate block"
                style={{ color: "var(--text-tertiary)" }}
              >
                {breadcrumb.slice(0, -1).map(n => n.id === "main" ? "Ana" : n.label.slice(0, 12)).join(" > ")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {activeNode.isLoading && (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-md"
                style={{ background: accentLightColor }}
              >
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
                <span className="text-[10px] font-medium" style={{ color: accentColor }}>Yazıyor</span>
              </div>
            )}
            <button
              onClick={() => {
                onCloseNode(activeNode.id);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl active:scale-95 transition-transform"
              style={{
                background: "var(--accent-danger-light)",
                color: "var(--accent-danger)",
              }}
            >
              <IconX size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Floating status for main node (no top bar) */}
      {isMain && activeNode.isLoading && (
        <div
          className="flex items-center justify-center gap-1.5 py-1.5 flex-shrink-0"
          style={{
            background: "var(--accent-primary-light)",
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent-primary)" }} />
          <span className="text-[11px] font-medium" style={{ color: "var(--accent-primary)" }}>Yanıt yazılıyor...</span>
        </div>
      )}

      {/* Node Tabs */}
      {nodes.length > 1 && (
        <div
          ref={tabsRef}
          className="flex items-center gap-2 px-3 py-2 overflow-x-auto flex-shrink-0 mobile-mindmap-tabs"
          style={{
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border-primary)",
          }}
        >
          {nodes.map((node) => {
            const isNodeMain = node.id === "main";
            const isNodeActive = node.id === activeNodeId;
            const nodeAccent = isNodeMain ? "var(--accent-primary)" : "var(--accent-purple)";
            const nodeAccentLight = isNodeMain ? "var(--accent-primary-light)" : "var(--accent-purple-light)";
            return (
              <button
                key={node.id}
                data-node-id={node.id}
                onClick={() => setActiveNodeId(node.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0 transition-all active:scale-95 text-[11px] font-medium whitespace-nowrap"
                style={{
                  background: isNodeActive ? nodeAccentLight : "var(--bg-card)",
                  color: isNodeActive ? nodeAccent : "var(--text-tertiary)",
                  border: `1px solid ${isNodeActive ? nodeAccent : "var(--border-primary)"}`,
                  boxShadow: isNodeActive
                    ? `0 0 0 2px ${isNodeMain ? "rgba(16,185,129,0.08)" : "rgba(139,92,246,0.08)"}`
                    : "none",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: isNodeActive ? nodeAccent : "var(--text-tertiary)",
                    opacity: isNodeActive ? 1 : 0.4,
                  }}
                />
                {isNodeMain ? "Ana" : node.label.length > 16 ? node.label.slice(0, 16) + "..." : node.label}
                {node.isLoading && (
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: nodeAccent }} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-4"
        style={{ WebkitOverflowScrolling: "touch" }}
        onTouchEnd={handleTouchEnd}
      >
        {activeNode.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
            {isMain && (
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ background: "var(--accent-purple-light)", color: "var(--accent-purple)" }}
                >
                  <IconGitBranch size={13} />
                </div>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--text-secondary)" }}
                >
                  MindmapChat
                </span>
              </div>
            )}
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: accentLightColor,
                boxShadow: `0 4px 16px ${isMain ? "rgba(16,185,129,0.12)" : "rgba(139,92,246,0.12)"}`,
              }}
            >
              {isMain ? (
                <span className="text-3xl">🎓</span>
              ) : (
                <IconGitBranch size={28} style={{ color: accentColor, opacity: 0.7 }} />
              )}
            </div>
            <div className="text-center px-6">
              <p
                className="text-[15px] font-semibold mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                {isMain ? "Ne öğrenmek istiyorsun?" : "Yeni dal başlat"}
              </p>
              <p
                className="text-[12px] leading-relaxed"
                style={{ color: "var(--text-tertiary)" }}
              >
                {isMain
                  ? "Bir soru yaz, yanıttaki metni seçerek yeni dal oluştur"
                  : "Bu konuda sorular sorabilirsin"}
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3.5 max-w-[640px] mx-auto">
          {activeNode.messages.map((msg) => (
            <div
              id={`mobile-msg-${activeNode.id}-${msg.id}`}
              key={msg.id}
              className={`mindmap-msg-row ${msg.role === "user" ? "mindmap-msg-row-user" : "mindmap-msg-row-ai"}`}
            >
              {msg.role === "assistant" && (
                <MindmapAiAvatar isMain={isMain} />
              )}
              <div
                className={`mindmap-msg ${
                  msg.role === "user" ? "mindmap-msg-user" : "mindmap-msg-ai"
                }`}
              >
                {msg.role === "assistant" ? (
                  msg.content ? (
                    <div className="msg-ai-content">
                      <ChatMessageRenderer content={msg.content} />
                    </div>
                  ) : (
                    activeNode.isLoading && (
                      <div className="flex items-center gap-1.5 px-1 py-1.5">
                        <div className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
                        <div className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
                        <div className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: accentColor }} />
                      </div>
                    )
                  )
                ) : (
                  <p className="text-[13px] leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Creation Popup (fixed at bottom, touch-friendly) */}
      {showBranchPopup && (
        <div
          className="absolute left-3 right-3 z-50 animate-fade-in"
          style={{ bottom: 72 }}
        >
          <div
            className="flex items-center gap-3 p-3 rounded-2xl"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--accent-purple)",
              boxShadow: "0 8px 32px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium mb-0.5" style={{ color: "var(--text-tertiary)" }}>
                Seçili metin
              </p>
              <p className="text-[12px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                &ldquo;{selectedText.length > 50 ? selectedText.slice(0, 50) + "..." : selectedText}&rdquo;
              </p>
            </div>
            <button
              onClick={() => {
                onCreateBranch(activeNode.id, selectedText);
                setShowBranchPopup(false);
                window.getSelection()?.removeAllRanges();
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12px] font-semibold flex-shrink-0 active:scale-95 transition-transform"
              style={{
                background: "var(--accent-purple)",
                color: "white",
                boxShadow: "0 2px 8px rgba(139,92,246,0.3)",
              }}
            >
              <IconGitBranch size={12} />
              Dal Oluştur
            </button>
            <button
              onClick={() => {
                setShowBranchPopup(false);
                window.getSelection()?.removeAllRanges();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0 active:scale-95"
              style={{ color: "var(--text-tertiary)" }}
            >
              <IconX size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Input Bar */}
      <div
        className="flex-shrink-0 px-3 py-2.5 safe-area-bottom"
        style={{
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border-primary)",
        }}
      >
        <div
          className="mindmap-node-input-inner"
          style={{
            borderColor: input.trim()
              ? isMain
                ? "rgba(16, 185, 129, 0.25)"
                : "rgba(139, 92, 246, 0.25)"
              : "var(--border-primary)",
            boxShadow: input.trim()
              ? isMain
                ? "0 0 0 3px rgba(16, 185, 129, 0.06)"
                : "0 0 0 3px rgba(139, 92, 246, 0.06)"
              : "none",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder={activeNode.isLoading ? "Yanıt bekleniyor..." : "Mesajını yaz..."}
            disabled={activeNode.isLoading}
            className="flex-1 bg-transparent text-[14px] outline-none disabled:opacity-50 placeholder:font-medium"
            style={{ color: "var(--text-primary)" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || activeNode.isLoading}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 active:scale-95"
            style={{
              background:
                input.trim() && !activeNode.isLoading
                  ? isMain
                    ? "var(--gradient-primary)"
                    : "var(--gradient-accent)"
                  : "var(--bg-tertiary)",
              color:
                input.trim() && !activeNode.isLoading
                  ? "white"
                  : "var(--text-tertiary)",
              boxShadow:
                input.trim() && !activeNode.isLoading
                  ? isMain
                    ? "0 2px 8px rgba(16,185,129,0.3)"
                    : "0 2px 8px rgba(139,92,246,0.3)"
                  : "none",
            }}
          >
            <IconSend size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== DESKTOP CANVAS VIEW ===== */
function DesktopCanvasView({
  nodes,
  connections,
  activeNodeId,
  setActiveNodeId,
  onSendMessage,
  onCreateBranch,
  onCloseNode,
}: {
  nodes: ChatNode[];
  connections: Connection[];
  activeNodeId: string;
  setActiveNodeId: (id: string) => void;
  onSendMessage: (nodeId: string, content: string) => void;
  onCreateBranch: (parentNodeId: string, selectedText: string) => void;
  onCloseNode: (nodeId: string) => void;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffsetStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(scale);
  const offsetRef = useRef(offset);

  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { offsetRef.current = offset; }, [offset]);

  // Center canvas on mount
  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newOffset = {
        x: rect.width / 2 - NODE_WIDTH / 2,
        y: rect.height / 2 - NODE_HEIGHT / 2,
      };
      setOffset(newOffset);
      offsetRef.current = newOffset;
    }
  }, []);

  /* ===== PAN HANDLERS ===== */
  const handleCanvasMouseDown = (e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest(".mindmap-node")) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    panOffsetStart.current = { ...offsetRef.current };
  };

  const handleCanvasMouseMove = useCallback(
    (e: globalThis.MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      const newOffset = {
        x: panOffsetStart.current.x + dx,
        y: panOffsetStart.current.y + dy,
      };
      setOffset(newOffset);
      offsetRef.current = newOffset;
    },
    [isPanning]
  );

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleCanvasMouseMove);
    window.addEventListener("mouseup", handleCanvasMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleCanvasMouseMove);
      window.removeEventListener("mouseup", handleCanvasMouseUp);
    };
  }, [handleCanvasMouseMove, handleCanvasMouseUp]);

  /* ===== ZOOM ===== */
  const handleWheel = useCallback((e: WheelEvent) => {
    if ((e.target as HTMLElement).closest(".mindmap-node-messages")) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const oldScale = scaleRef.current;
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    const newScale = Math.min(Math.max(oldScale + delta, 0.25), 2.5);
    const oldOff = offsetRef.current;
    const newOffset = {
      x: mouseX - (mouseX - oldOff.x) * (newScale / oldScale),
      y: mouseY - (mouseY - oldOff.y) * (newScale / oldScale),
    };
    scaleRef.current = newScale;
    offsetRef.current = newOffset;
    setScale(newScale);
    setOffset(newOffset);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const zoomAtCenter = useCallback((delta: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const oldScale = scaleRef.current;
    const newScale = Math.min(Math.max(oldScale + delta, 0.25), 2.5);
    const oldOff = offsetRef.current;
    const newOffset = {
      x: cx - (cx - oldOff.x) * (newScale / oldScale),
      y: cy - (cy - oldOff.y) * (newScale / oldScale),
    };
    scaleRef.current = newScale;
    offsetRef.current = newOffset;
    setScale(newScale);
    setOffset(newOffset);
  }, []);

  const zoomIn = () => zoomAtCenter(0.15);
  const zoomOut = () => zoomAtCenter(-0.15);
  const resetView = () => {
    scaleRef.current = 1;
    setScale(1);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newOffset = {
        x: rect.width / 2 - NODE_WIDTH / 2,
        y: rect.height / 2 - NODE_HEIGHT / 2,
      };
      offsetRef.current = newOffset;
      setOffset(newOffset);
    }
  };

  const renderConnections = () => {
    return connections.map((conn) => {
      const from = nodes.find((n) => n.id === conn.fromId);
      const to = nodes.find((n) => n.id === conn.toId);
      if (!from || !to) return null;
      const fromX = from.x + NODE_WIDTH;
      const fromY = from.y + NODE_HEIGHT / 2;
      const toX = to.x;
      const toY = to.y + NODE_HEIGHT / 2;
      const midX = (fromX + toX) / 2;
      const gradId = `conn-grad-${conn.fromId}-${conn.toId}`;
      return (
        <g key={`${conn.fromId}-${conn.toId}`}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <path
            d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <circle cx={toX} cy={toY} r={4} fill="var(--accent-purple)" opacity={0.5} />
        </g>
      );
    });
  };

  const branchCount = nodes.length - 1;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0 z-10"
        style={{
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-primary)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-purple-light)", color: "var(--accent-purple)" }}
          >
            <IconGitBranch size={14} />
          </div>
          <div>
            <span className="text-[13px] font-semibold block" style={{ color: "var(--text-primary)" }}>
              MindmapChat
            </span>
            <span className="text-[10px] block" style={{ color: "var(--text-tertiary)" }}>
              {branchCount > 0 ? `${branchCount} aktif dal` : "Metin seçerek dal oluştur"}
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-1 rounded-xl px-1.5 py-1"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-primary)" }}
        >
          <button onClick={zoomOut} className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-[var(--bg-tertiary)]" style={{ color: "var(--text-tertiary)" }}>
            <IconZoomOut size={13} />
          </button>
          <span className="text-[10px] font-mono w-10 text-center font-medium" style={{ color: "var(--text-secondary)" }}>
            {Math.round(scale * 100)}%
          </span>
          <button onClick={zoomIn} className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-[var(--bg-tertiary)]" style={{ color: "var(--text-tertiary)" }}>
            <IconZoomIn size={13} />
          </button>
          <div className="w-px h-4 mx-0.5" style={{ background: "var(--border-primary)" }} />
          <button onClick={resetView} className="flex h-7 w-7 items-center justify-center rounded-lg transition-all hover:bg-[var(--bg-tertiary)]" style={{ color: "var(--text-tertiary)" }} title="Görünümü sıfırla">
            <IconMaximize size={13} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        style={{ background: "var(--bg-primary)", cursor: isPanning ? "grabbing" : "grab" }}
        onMouseDown={handleCanvasMouseDown}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, var(--border-primary) 1px, transparent 1px)`,
            backgroundSize: `${30 * scale}px ${30 * scale}px`,
            backgroundPosition: `${offset.x % (30 * scale)}px ${offset.y % (30 * scale)}px`,
            opacity: 0.5,
          }}
        />
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <svg
            className="absolute pointer-events-none"
            style={{ width: "10000px", height: "10000px", top: "-5000px", left: "-5000px", overflow: "visible" }}
          >
            {renderConnections()}
          </svg>
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute"
              style={{
                left: node.x,
                top: node.y,
                transition: isPanning ? "none" : "left 0.3s ease, top 0.3s ease",
              }}
            >
              <ChatNodeComponent
                node={node}
                isActive={activeNodeId === node.id}
                onActivate={() => setActiveNodeId(node.id)}
                onSend={(content) => onSendMessage(node.id, content)}
                onCreateBranch={(text) => onCreateBranch(node.id, text)}
                onClose={() => onCloseNode(node.id)}
                isMain={node.id === "main"}
                scale={scale}
              />
            </div>
          ))}
        </div>
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-2.5 rounded-2xl pointer-events-none"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <span className="text-[10px] font-medium flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
            <span style={{ color: "var(--accent-purple)", opacity: 0.7 }}>
              <IconGitBranch size={11} />
            </span>
            Metin seç &rarr; Yeni dal &nbsp;&bull;&nbsp; Sürükle &rarr; Kaydır &nbsp;&bull;&nbsp; Scroll &rarr; Yakınlaştır
          </span>
        </div>
      </div>
    </div>
  );
}

/* ===== MAIN MINDMAP CHAT ===== */
export default function MindmapChat({ isMobile = false }: MindmapChatProps) {
  const [nodes, setNodes] = useState<ChatNode[]>([
    {
      id: "main",
      x: 0,
      y: 0,
      parentId: null,
      label: "Ana Sohbet",
      messages: [],
      isLoading: false,
    },
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeNodeId, setActiveNodeId] = useState("main");

  /* ===== SEND MESSAGE ===== */
  const handleSendMessage = useCallback(
    async (nodeId: string, content: string) => {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: Message = {
        id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                messages: [...n.messages, userMsg, aiMsg],
                isLoading: true,
              }
            : n
        )
      );

      const node = nodes.find((n) => n.id === nodeId);
      const apiMessages = (node?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      apiMessages.push({ role: "user", content });

      try {
        await streamChat(
          apiMessages,
          (text) => {
            setNodes((prev) =>
              prev.map((n) =>
                n.id === nodeId
                  ? {
                      ...n,
                      messages: n.messages.map((m) =>
                        m.id === aiMsgId
                          ? { ...m, content: m.content + text }
                          : m
                      ),
                    }
                  : n
              )
            );
          },
          (error) => {
            setNodes((prev) =>
              prev.map((n) =>
                n.id === nodeId
                  ? {
                      ...n,
                      isLoading: false,
                      messages: n.messages.map((m) =>
                        m.id === aiMsgId
                          ? { ...m, content: `[!danger] Hata\n${error}` }
                          : m
                      ),
                    }
                  : n
              )
            );
          },
          () => {
            setNodes((prev) =>
              prev.map((n) =>
                n.id === nodeId ? { ...n, isLoading: false } : n
              )
            );
          }
        );
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Bilinmeyen hata";
        setNodes((prev) =>
          prev.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  isLoading: false,
                  messages: n.messages.map((m) =>
                    m.id === aiMsgId
                      ? {
                          ...m,
                          content: `[!danger] Bağlantı Hatası\n${errorMsg}`,
                        }
                      : m
                  ),
                }
              : n
          )
        );
      }
    },
    [nodes]
  );

  /* ===== CREATE BRANCH ===== */
  const handleCreateBranch = useCallback(
    (parentNodeId: string, selectedText: string) => {
      const parentNode = nodes.find((n) => n.id === parentNodeId);
      if (!parentNode) return;

      const childCount = nodes.filter(
        (n) => n.parentId === parentNodeId
      ).length;

      const newId = `node-${Date.now()}`;
      const newNode: ChatNode = {
        id: newId,
        x: parentNode.x + NODE_WIDTH + NODE_GAP_X,
        y: parentNode.y + childCount * (NODE_HEIGHT + NODE_GAP_Y),
        parentId: parentNodeId,
        label:
          selectedText.length > 40
            ? selectedText.slice(0, 40) + "..."
            : selectedText,
        messages: [],
        isLoading: false,
      };

      setNodes((prev) => [...prev, newNode]);
      setConnections((prev) => [
        ...prev,
        { fromId: parentNodeId, toId: newId },
      ]);
      setActiveNodeId(newId);

      // Auto-send the selected text as first message
      setTimeout(() => {
        const question = `"${selectedText}" hakkında detaylı bilgi ver.`;
        handleSendMessage(newId, question);
      }, 100);
    },
    [nodes, handleSendMessage]
  );

  /* ===== CLOSE NODE ===== */
  const handleCloseNode = useCallback(
    (nodeId: string) => {
      const idsToRemove = new Set<string>();
      const findChildren = (id: string) => {
        idsToRemove.add(id);
        nodes
          .filter((n) => n.parentId === id)
          .forEach((n) => findChildren(n.id));
      };
      findChildren(nodeId);

      setNodes((prev) => prev.filter((n) => !idsToRemove.has(n.id)));
      setConnections((prev) =>
        prev.filter(
          (c) => !idsToRemove.has(c.fromId) && !idsToRemove.has(c.toId)
        )
      );

      if (idsToRemove.has(activeNodeId)) {
        setActiveNodeId("main");
      }
    },
    [nodes, activeNodeId]
  );

  if (isMobile) {
    return (
      <MobileMindmapView
        nodes={nodes}
        connections={connections}
        activeNodeId={activeNodeId}
        setActiveNodeId={setActiveNodeId}
        onSendMessage={handleSendMessage}
        onCreateBranch={handleCreateBranch}
        onCloseNode={handleCloseNode}
      />
    );
  }

  return (
    <DesktopCanvasView
      nodes={nodes}
      connections={connections}
      activeNodeId={activeNodeId}
      setActiveNodeId={setActiveNodeId}
      onSendMessage={handleSendMessage}
      onCreateBranch={handleCreateBranch}
      onCloseNode={handleCloseNode}
    />
  );
}
