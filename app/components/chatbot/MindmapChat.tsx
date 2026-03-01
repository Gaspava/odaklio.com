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
  IconPlus,
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
const NODE_WIDTH = 380;
const NODE_HEIGHT_MIN = 300;
const NODE_GAP_X = 80;
const NODE_GAP_Y = 60;

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

/* ===== MINI CHAT NODE COMPONENT ===== */
function MiniChatNode({
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [node.messages]);

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

  return (
    <div
      ref={nodeRef}
      className="mindmap-node"
      style={{
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT_MIN,
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
      onMouseUp={handleMouseUp}
      onMouseDown={handleMouseDown}
    >
      {/* Node Header */}
      <div className="mindmap-node-header">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{
              background: isMain
                ? "var(--accent-primary)"
                : "var(--accent-purple)",
            }}
          />
          <span
            className="text-[11px] font-semibold truncate"
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
              className="flex h-5 w-5 items-center justify-center rounded transition-colors"
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
              <IconX size={10} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="mindmap-node-messages">
        {node.messages.length === 0 && (
          <div
            className="flex flex-col items-center justify-center h-full gap-2 py-8"
          >
            <IconGitBranch
              size={24}
              style={{ color: "var(--text-tertiary)", opacity: 0.5 }}
            />
            <p
              className="text-[11px] text-center"
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
            key={msg.id}
            className={`mindmap-msg ${
              msg.role === "user" ? "mindmap-msg-user" : "mindmap-msg-ai"
            }`}
          >
            {msg.role === "assistant" ? (
              msg.content ? (
                <div className="msg-ai-content text-[11px] leading-relaxed">
                  <ChatMessageRenderer content={msg.content} />
                </div>
              ) : (
                node.isLoading && (
                  <div className="flex items-center gap-1 px-1 py-1">
                    <div
                      className="typing-dot w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--accent-primary)" }}
                    />
                    <div
                      className="typing-dot w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--accent-primary)" }}
                    />
                    <div
                      className="typing-dot w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--accent-primary)" }}
                    />
                  </div>
                )
              )
            ) : (
              <p className="text-[11px] leading-relaxed">{msg.content}</p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Branch Button (appears on text selection) */}
      {showBranchButton && (
        <div
          className="absolute z-50 animate-fade-in-scale"
          style={{
            left: branchBtnPos.x,
            top: branchBtnPos.y - 36,
            transform: "translateX(-50%)",
          }}
        >
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-semibold transition-all shadow-lg"
            style={{
              background: "var(--accent-purple)",
              color: "white",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onCreateBranch(selectedText);
              setShowBranchButton(false);
              window.getSelection()?.removeAllRanges();
            }}
          >
            <IconGitBranch size={10} />
            Yeni Yol Oluştur
          </button>
        </div>
      )}

      {/* Input */}
      <div className="mindmap-node-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === "Enter") handleSend();
          }}
          onClick={(e) => e.stopPropagation()}
          placeholder={node.isLoading ? "Yanıt bekleniyor..." : "Mesaj yaz..."}
          disabled={node.isLoading}
          className="flex-1 bg-transparent text-[11px] outline-none disabled:opacity-50"
          style={{ color: "var(--text-primary)" }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSend();
          }}
          disabled={!input.trim() || node.isLoading}
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-white transition-all disabled:opacity-30 active:scale-95"
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
          <IconSend size={10} />
        </button>
      </div>
    </div>
  );
}

/* ===== MAIN MINDMAP CHAT ===== */
export default function MindmapChat({ isMobile = false }: MindmapChatProps) {
  // Canvas state
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffsetStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

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
      setOffset({
        x: rect.width / 2 - NODE_WIDTH / 2,
        y: rect.height / 2 - NODE_HEIGHT_MIN / 2,
      });
    }
  }, []);

  /* ===== PAN HANDLERS ===== */
  const handleCanvasMouseDown = (e: ReactMouseEvent) => {
    // Only pan if clicking on canvas background (not on a node)
    if ((e.target as HTMLElement).closest(".mindmap-node")) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY };
    panOffsetStart.current = { ...offset };
  };

  const handleCanvasMouseMove = useCallback(
    (e: globalThis.MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setOffset({
        x: panOffsetStart.current.x + dx,
        y: panOffsetStart.current.y + dy,
      });
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

  /* ===== ZOOM HANDLERS ===== */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setScale((s) => Math.min(Math.max(s + delta, 0.3), 2));
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const zoomIn = () => setScale((s) => Math.min(s + 0.15, 2));
  const zoomOut = () => setScale((s) => Math.max(s - 0.15, 0.3));
  const resetView = () => {
    setScale(1);
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setOffset({
        x: rect.width / 2 - NODE_WIDTH / 2,
        y: rect.height / 2 - NODE_HEIGHT_MIN / 2,
      });
    }
  };

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

      // Prepare API messages from this node
      const node = nodes.find((n) => n.id === nodeId);
      const apiMessages = (node?.messages || [])
        .map((m) => ({ role: m.role, content: m.content }));
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
                          ? {
                              ...m,
                              content: `[!danger] Hata\n${error}`,
                            }
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

      // Count existing children to position new node
      const childCount = nodes.filter(
        (n) => n.parentId === parentNodeId
      ).length;

      const newId = `node-${Date.now()}`;
      const newNode: ChatNode = {
        id: newId,
        x: parentNode.x + NODE_WIDTH + NODE_GAP_X,
        y: parentNode.y + childCount * (NODE_HEIGHT_MIN + NODE_GAP_Y),
        parentId: parentNodeId,
        label: selectedText.length > 30 ? selectedText.slice(0, 30) + "..." : selectedText,
        messages: [],
        isLoading: false,
      };

      setNodes((prev) => [...prev, newNode]);
      setConnections((prev) => [
        ...prev,
        { fromId: parentNodeId, toId: newId },
      ]);
      setActiveNodeId(newId);

      // Animate pan to new node
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setOffset({
          x: rect.width / 2 - (newNode.x + NODE_WIDTH / 2) * scale,
          y: rect.height / 2 - (newNode.y + NODE_HEIGHT_MIN / 2) * scale,
        });
      }

      // Auto-send the selected text as first message
      setTimeout(() => {
        const question = `"${selectedText}" hakkında detaylı bilgi ver.`;
        handleSendMessage(newId, question);
      }, 100);
    },
    [nodes, scale, handleSendMessage]
  );

  /* ===== CLOSE NODE ===== */
  const handleCloseNode = useCallback(
    (nodeId: string) => {
      // Recursively remove all children
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

      const fromX = from.x + NODE_WIDTH;
      const fromY = from.y + NODE_HEIGHT_MIN / 2;
      const toX = to.x;
      const toY = to.y + NODE_HEIGHT_MIN / 2;

      const midX = (fromX + toX) / 2;

      return (
        <path
          key={`${conn.fromId}-${conn.toId}`}
          d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
          fill="none"
          stroke="var(--accent-purple)"
          strokeWidth={2}
          strokeDasharray="6 3"
          opacity={0.5}
        />
      );
    });
  };

  /* ===== NODE COUNT INFO ===== */
  const branchCount = nodes.length - 1;

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 z-10"
        style={{
          background: "var(--bg-secondary)",
          borderBottom: "1px solid var(--border-primary)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded-lg"
            style={{
              background: "var(--accent-purple-light)",
              color: "var(--accent-purple)",
            }}
          >
            <IconGitBranch size={12} />
          </div>
          <span
            className="text-xs font-semibold"
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
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-tertiary)",
            }}
          >
            <IconZoomOut size={13} />
          </button>
          <span
            className="text-[10px] font-mono w-10 text-center"
            style={{ color: "var(--text-tertiary)" }}
          >
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-tertiary)",
            }}
          >
            <IconZoomIn size={13} />
          </button>
          <button
            onClick={resetView}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-all ml-1"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-tertiary)",
            }}
            title="Görünümü sıfırla"
          >
            <IconMaximize size={13} />
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
        }}
        onMouseDown={handleCanvasMouseDown}
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
                transition: isPanning ? "none" : "left 0.3s ease, top 0.3s ease",
              }}
            >
              <MiniChatNode
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
              />
            </div>
          ))}
        </div>

        {/* Help Hint */}
        <div
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full pointer-events-none"
          style={{
            background: "var(--bg-glass-heavy)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <span
            className="text-[10px] font-medium"
            style={{ color: "var(--text-tertiary)" }}
          >
            Metin sec → &quot;Yeni Yol Oluştur&quot; ile paralel sohbet oluştur
            &bull; Boş alana tıkla ve sürükle
          </span>
        </div>
      </div>
    </div>
  );
}
