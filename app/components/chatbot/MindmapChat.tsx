"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import {
  IconSend,
  IconZoomIn,
  IconZoomOut,
  IconMaximize,
  IconX,
  IconGitBranch,
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
const NODE_WIDTH_DESKTOP = 680;
const NODE_HEIGHT_DESKTOP = 520;
const NODE_WIDTH_MOBILE = 320;
const NODE_HEIGHT_MOBILE = 420;
const NODE_GAP_X_DESKTOP = 120;
const NODE_GAP_Y_DESKTOP = 80;
const NODE_GAP_X_MOBILE = 40;
const NODE_GAP_Y_MOBILE = 40;

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
  isMobile,
  nodeWidth,
  nodeHeight,
}: {
  node: ChatNode;
  isActive: boolean;
  onActivate: () => void;
  onSend: (content: string) => void;
  onCreateBranch: (selectedText: string) => void;
  onClose: () => void;
  isMain: boolean;
  scale: number;
  isMobile: boolean;
  nodeWidth: number;
  nodeHeight: number;
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

  const handleTextSelection = useCallback(() => {
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
    }, isMobile ? 300 : 100);
  }, [scale, isMobile]);

  const handleSelectionStart = useCallback(() => {
    setShowBranchButton(false);
  }, []);

  return (
    <div
      ref={nodeRef}
      className={`mindmap-node ${isMobile ? "mindmap-node-mobile" : ""}`}
      style={{
        width: nodeWidth,
        height: nodeHeight,
        borderColor: isActive
          ? isMain
            ? "var(--accent-primary)"
            : "var(--accent-purple)"
          : "var(--border-primary)",
        boxShadow: isActive
          ? isMain
            ? "var(--shadow-glow)"
            : "0 0 20px rgba(139, 92, 246, 0.2)"
          : "var(--shadow-card)",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      onMouseUp={!isMobile ? handleTextSelection : undefined}
      onMouseDown={!isMobile ? handleSelectionStart : undefined}
      onTouchEnd={isMobile ? handleTextSelection : undefined}
      onTouchStart={isMobile ? handleSelectionStart : undefined}
    >
      {/* Node Header */}
      <div className="mindmap-node-header">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              background: isMain
                ? "var(--accent-primary)"
                : "var(--accent-purple)",
            }}
          />
          <span
            className={`font-semibold truncate ${isMobile ? "text-[11px]" : "text-xs"}`}
            style={{ color: "var(--text-primary)" }}
          >
            {isMain ? "Ana Sohbet" : node.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {!isMain && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className={`flex items-center justify-center rounded-md transition-colors ${
                isMobile ? "h-8 w-8" : "h-6 w-6"
              }`}
              style={{ color: "var(--text-tertiary)" }}
              onMouseEnter={!isMobile ? (e) => {
                e.currentTarget.style.background = "var(--accent-danger-light)";
                e.currentTarget.style.color = "var(--accent-danger)";
              } : undefined}
              onMouseLeave={!isMobile ? (e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-tertiary)";
              } : undefined}
            >
              <IconX size={isMobile ? 14 : 12} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area - scrolls ONLY inside this container */}
      <div
        ref={scrollContainerRef}
        className={`mindmap-node-messages ${isMobile ? "mindmap-node-messages-mobile" : ""}`}
        onWheel={(e) => e.stopPropagation()}
      >
        {node.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
            <IconGitBranch
              size={isMobile ? 28 : 32}
              style={{ color: "var(--text-tertiary)", opacity: 0.4 }}
            />
            <p
              className={`text-center ${isMobile ? "text-[11px]" : "text-xs"}`}
              style={{ color: "var(--text-tertiary)" }}
            >
              {isMain
                ? "Bir soru sorarak başla"
                : "Bu dalda sohbete başla"}
            </p>
          </div>
        )}
        {node.messages.map((msg) => (
          <div
            id={`mindmap-msg-${node.id}-${msg.id}`}
            key={msg.id}
            className={`mindmap-msg ${
              msg.role === "user" ? "mindmap-msg-user" : "mindmap-msg-ai"
            } ${isMobile ? "mindmap-msg-mobile" : ""}`}
          >
            {msg.role === "assistant" ? (
              msg.content ? (
                <div className="msg-ai-content">
                  <ChatMessageRenderer content={msg.content} />
                </div>
              ) : (
                node.isLoading && (
                  <div className="flex items-center gap-1.5 px-1 py-2">
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
                )
              )
            ) : (
              <p className={`leading-relaxed ${isMobile ? "text-[12px]" : "text-[13px]"}`}>{msg.content}</p>
            )}
          </div>
        ))}
      </div>

      {/* Branch Button (appears on text selection) */}
      {showBranchButton && (
        <div
          className="absolute z-50 animate-fade-in-scale"
          style={{
            left: branchBtnPos.x,
            top: branchBtnPos.y - (isMobile ? 48 : 40),
            transform: "translateX(-50%)",
          }}
        >
          <button
            className={`flex items-center gap-1.5 rounded-lg font-semibold transition-all shadow-lg ${
              isMobile ? "px-4 py-2.5 text-[11px]" : "px-3.5 py-2 text-xs"
            }`}
            style={{
              background: "var(--accent-purple)",
              color: "white",
              boxShadow: "0 4px 16px rgba(139, 92, 246, 0.35)",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onCreateBranch(selectedText);
              setShowBranchButton(false);
              window.getSelection()?.removeAllRanges();
            }}
          >
            <IconGitBranch size={isMobile ? 14 : 12} />
            Yeni Yol Oluştur
          </button>
        </div>
      )}

      {/* Input */}
      <div className={`mindmap-node-input ${isMobile ? "mindmap-node-input-mobile" : ""}`}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") handleSend();
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          placeholder={node.isLoading ? "Yanıt bekleniyor..." : "Mesaj yaz..."}
          disabled={node.isLoading}
          className={`flex-1 bg-transparent outline-none disabled:opacity-50 ${
            isMobile ? "text-[14px]" : "text-[13px]"
          }`}
          style={{ color: "var(--text-primary)" }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSend();
          }}
          onTouchStart={(e) => e.stopPropagation()}
          disabled={!input.trim() || node.isLoading}
          className={`flex flex-shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 active:scale-95 ${
            isMobile ? "h-10 w-10" : "h-8 w-8"
          }`}
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
          }}
        >
          <IconSend size={isMobile ? 16 : 14} />
        </button>
      </div>
    </div>
  );
}

/* ===== MAIN MINDMAP CHAT ===== */
export default function MindmapChat({ isMobile = false }: MindmapChatProps) {
  // Responsive dimensions
  const nodeWidth = isMobile ? NODE_WIDTH_MOBILE : NODE_WIDTH_DESKTOP;
  const nodeHeight = isMobile ? NODE_HEIGHT_MOBILE : NODE_HEIGHT_DESKTOP;
  const nodeGapX = isMobile ? NODE_GAP_X_MOBILE : NODE_GAP_X_DESKTOP;
  const nodeGapY = isMobile ? NODE_GAP_Y_MOBILE : NODE_GAP_Y_DESKTOP;

  // Canvas state
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffsetStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(scale);
  const offsetRef = useRef(offset);

  // Touch state for pinch-to-zoom
  const lastPinchDist = useRef<number | null>(null);
  const lastPinchCenter = useRef<{ x: number; y: number } | null>(null);
  const isTouchPanning = useRef(false);
  const touchStartedOnNode = useRef(false);

  // Keep refs in sync
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  // Chat nodes
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

  // Center canvas on mount
  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newOffset = {
        x: rect.width / 2 - nodeWidth / 2,
        y: rect.height / 2 - nodeHeight / 2,
      };
      setOffset(newOffset);
      offsetRef.current = newOffset;
    }
  }, [nodeWidth, nodeHeight]);

  /* ===== MOUSE PAN HANDLERS ===== */
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

  /* ===== TOUCH PAN & PINCH-TO-ZOOM HANDLERS ===== */
  const handleCanvasTouchStart = useCallback((e: globalThis.TouchEvent) => {
    // Don't intercept touches on nodes (inputs, buttons, scrolling)
    if ((e.target as HTMLElement).closest(".mindmap-node")) {
      touchStartedOnNode.current = true;
      return;
    }
    touchStartedOnNode.current = false;

    if (e.touches.length === 2) {
      // Pinch start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDist.current = Math.sqrt(dx * dx + dy * dy);
      lastPinchCenter.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      isTouchPanning.current = false;
    } else if (e.touches.length === 1) {
      // Single finger pan start
      isTouchPanning.current = true;
      panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panOffsetStart.current = { ...offsetRef.current };
    }
  }, []);

  const handleCanvasTouchMove = useCallback((e: globalThis.TouchEvent) => {
    if (touchStartedOnNode.current) return;

    if (e.touches.length === 2) {
      // Pinch zoom
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      if (lastPinchDist.current !== null && lastPinchCenter.current !== null) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();

        const pinchScale = dist / lastPinchDist.current;
        const oldScale = scaleRef.current;
        const newScale = Math.min(Math.max(oldScale * pinchScale, 0.2), 3);

        const mouseX = centerX - rect.left;
        const mouseY = centerY - rect.top;

        const oldOff = offsetRef.current;
        const newOffset = {
          x: mouseX - (mouseX - oldOff.x) * (newScale / oldScale),
          y: mouseY - (mouseY - oldOff.y) * (newScale / oldScale),
        };

        scaleRef.current = newScale;
        offsetRef.current = newOffset;
        setScale(newScale);
        setOffset(newOffset);
      }

      lastPinchDist.current = dist;
      lastPinchCenter.current = { x: centerX, y: centerY };
      isTouchPanning.current = false;
    } else if (e.touches.length === 1 && isTouchPanning.current) {
      // Single finger pan
      e.preventDefault();
      const dx = e.touches[0].clientX - panStart.current.x;
      const dy = e.touches[0].clientY - panStart.current.y;
      const newOffset = {
        x: panOffsetStart.current.x + dx,
        y: panOffsetStart.current.y + dy,
      };
      setOffset(newOffset);
      offsetRef.current = newOffset;
    }
  }, []);

  const handleCanvasTouchEnd = useCallback(() => {
    lastPinchDist.current = null;
    lastPinchCenter.current = null;
    isTouchPanning.current = false;
    touchStartedOnNode.current = false;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("touchstart", handleCanvasTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleCanvasTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleCanvasTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener("touchstart", handleCanvasTouchStart);
      canvas.removeEventListener("touchmove", handleCanvasTouchMove);
      canvas.removeEventListener("touchend", handleCanvasTouchEnd);
    };
  }, [handleCanvasTouchStart, handleCanvasTouchMove, handleCanvasTouchEnd]);

  /* ===== ZOOM TO CURSOR (WHEEL) ===== */
  const handleWheel = useCallback((e: WheelEvent) => {
    // Don't zoom if scrolling inside a chat node's message area
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

    // Zoom toward cursor: adjust offset so the point under the cursor stays fixed
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
    const newScale = 1;
    scaleRef.current = newScale;
    setScale(newScale);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newOffset = {
        x: rect.width / 2 - nodeWidth / 2,
        y: rect.height / 2 - nodeHeight / 2,
      };
      offsetRef.current = newOffset;
      setOffset(newOffset);
    }
  };

  /* ===== Navigate to node ===== */
  const navigateToNode = useCallback((targetNode: ChatNode) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const s = scaleRef.current;
    const newOffset = {
      x: rect.width / 2 - (targetNode.x + nodeWidth / 2) * s,
      y: rect.height / 2 - (targetNode.y + nodeHeight / 2) * s,
    };
    offsetRef.current = newOffset;
    setOffset(newOffset);
  }, [nodeWidth, nodeHeight]);

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
        x: parentNode.x + nodeWidth + nodeGapX,
        y: parentNode.y + childCount * (nodeHeight + nodeGapY),
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

      // Pan to new node
      navigateToNode(newNode);

      // Auto-send the selected text as first message
      setTimeout(() => {
        const question = `"${selectedText}" hakkında detaylı bilgi ver.`;
        handleSendMessage(newId, question);
      }, 100);
    },
    [nodes, handleSendMessage, nodeWidth, nodeHeight, nodeGapX, nodeGapY, navigateToNode]
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

  /* ===== RENDER CONNECTIONS (SVG) ===== */
  const renderConnections = () => {
    return connections.map((conn) => {
      const from = nodes.find((n) => n.id === conn.fromId);
      const to = nodes.find((n) => n.id === conn.toId);
      if (!from || !to) return null;

      const fromX = from.x + nodeWidth;
      const fromY = from.y + nodeHeight / 2;
      const toX = to.x;
      const toY = to.y + nodeHeight / 2;
      const midX = (fromX + toX) / 2;

      return (
        <path
          key={`${conn.fromId}-${conn.toId}`}
          d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
          fill="none"
          stroke="var(--accent-purple)"
          strokeWidth={isMobile ? 1.5 : 2}
          strokeDasharray="8 4"
          opacity={0.5}
        />
      );
    });
  };

  const branchCount = nodes.length - 1;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Top Bar */}
      <div
        className={`flex items-center justify-between flex-shrink-0 z-10 ${
          isMobile ? "px-3 py-2" : "px-4 py-2.5"
        }`}
        style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-primary)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center rounded-lg ${
              isMobile ? "h-7 w-7" : "h-6 w-6"
            }`}
            style={{
              background: "var(--accent-purple-light)",
              color: "var(--accent-purple)",
            }}
          >
            <IconGitBranch size={isMobile ? 14 : 12} />
          </div>
          <span
            className={`font-semibold ${isMobile ? "text-[11px]" : "text-xs"}`}
            style={{ color: "var(--text-primary)" }}
          >
            MindmapChat
          </span>
          {branchCount > 0 && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: "var(--accent-purple-light)",
                color: "var(--accent-purple)",
              }}
            >
              {branchCount} dal
            </span>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            className={`flex items-center justify-center rounded-lg transition-all ${
              isMobile ? "h-9 w-9" : "h-7 w-7"
            }`}
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-tertiary)",
            }}
          >
            <IconZoomOut size={isMobile ? 16 : 13} />
          </button>
          <span
            className={`font-mono text-center ${
              isMobile ? "text-[11px] w-11" : "text-[10px] w-10"
            }`}
            style={{ color: "var(--text-tertiary)" }}
          >
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className={`flex items-center justify-center rounded-lg transition-all ${
              isMobile ? "h-9 w-9" : "h-7 w-7"
            }`}
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-tertiary)",
            }}
          >
            <IconZoomIn size={isMobile ? 16 : 13} />
          </button>
          <button
            onClick={resetView}
            className={`flex items-center justify-center rounded-lg transition-all ml-1 ${
              isMobile ? "h-9 w-9" : "h-7 w-7"
            }`}
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-tertiary)",
            }}
            title="Görünümü sıfırla"
          >
            <IconMaximize size={isMobile ? 16 : 13} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        style={{
          background: "var(--bg-primary)",
          cursor: isPanning ? "grabbing" : "grab",
          touchAction: "none",
        }}
        onMouseDown={!isMobile ? handleCanvasMouseDown : undefined}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, var(--border-primary) 1px, transparent 1px)`,
            backgroundSize: `${30 * scale}px ${30 * scale}px`,
            backgroundPosition: `${offset.x % (30 * scale)}px ${offset.y % (30 * scale)}px`,
            opacity: 0.5,
          }}
        />

        {/* Transform Container */}
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {/* SVG Connections */}
          <svg
            className="absolute pointer-events-none"
            style={{
              width: "10000px",
              height: "10000px",
              top: "-5000px",
              left: "-5000px",
              overflow: "visible",
            }}
          >
            {renderConnections()}
          </svg>

          {/* Chat Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute"
              style={{
                left: node.x,
                top: node.y,
                transition: isPanning
                  ? "none"
                  : "left 0.3s ease, top 0.3s ease",
              }}
            >
              <ChatNodeComponent
                node={node}
                isActive={activeNodeId === node.id}
                onActivate={() => setActiveNodeId(node.id)}
                onSend={(content) => handleSendMessage(node.id, content)}
                onCreateBranch={(text) =>
                  handleCreateBranch(node.id, text)
                }
                onClose={() => handleCloseNode(node.id)}
                isMain={node.id === "main"}
                scale={scale}
                isMobile={isMobile}
                nodeWidth={nodeWidth}
                nodeHeight={nodeHeight}
              />
            </div>
          ))}
        </div>

        {/* Help Hint */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full pointer-events-none ${
            isMobile ? "bottom-3 px-3 py-1.5" : "bottom-4 px-4 py-2"
          }`}
          style={{
            background: "var(--bg-glass-heavy)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-md)",
            maxWidth: isMobile ? "calc(100vw - 24px)" : undefined,
          }}
        >
          <span
            className={`font-medium text-center ${
              isMobile ? "text-[9px] leading-tight" : "text-[10px]"
            }`}
            style={{ color: "var(--text-tertiary)" }}
          >
            {isMobile
              ? "Metin seç \u2192 dal olu\u015Ftur \u2022 Parmakla kayd\u0131r \u2022 K\u0131st\u0131rarak yak\u0131nla\u015Ft\u0131r"
              : "Metin se\u00E7 \u2192 \"Yeni Yol Olu\u015Ftur\" ile paralel sohbet olu\u015Ftur \u2022 Bo\u015F alana t\u0131kla ve s\u00FCr\u00FCkle \u2022 Scroll ile yak\u0131nla\u015Ft\u0131r"}
          </span>
        </div>
      </div>
    </div>
  );
}
