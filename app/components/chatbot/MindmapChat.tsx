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
  IconX,
  IconGitBranch,
} from "../icons/Icons";
import ChatMessageRenderer from "./ChatMessageRenderer";
import { useConversation } from "@/app/providers/ConversationProvider";

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

  return (
    <div
      ref={nodeRef}
      className="mindmap-node"
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
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
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              background: isMain
                ? "var(--accent-primary)"
                : "var(--accent-purple)",
            }}
          />
          <span
            className="text-xs font-semibold truncate"
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
              className="flex h-6 w-6 items-center justify-center rounded-md transition-colors"
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
              <IconX size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area - scrolls ONLY inside this container */}
      <div
        ref={scrollContainerRef}
        className="mindmap-node-messages"
        onWheel={(e) => e.stopPropagation()}
      >
        {node.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
            <IconGitBranch
              size={32}
              style={{ color: "var(--text-tertiary)", opacity: 0.4 }}
            />
            <p
              className="text-xs text-center"
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
            }`}
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
              <p className="text-[13px] leading-relaxed">{msg.content}</p>
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
            top: branchBtnPos.y - 40,
            transform: "translateX(-50%)",
          }}
        >
          <button
            className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all shadow-lg"
            style={{
              background: "var(--accent-purple)",
              color: "white",
              boxShadow: "0 4px 16px rgba(139, 92, 246, 0.35)",
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
          className="flex-1 bg-transparent text-[13px] outline-none disabled:opacity-50"
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
          }}
        >
          <IconSend size={14} />
        </button>
      </div>
    </div>
  );
}

/* ===== MAIN MINDMAP CHAT ===== */
export default function MindmapChat({ isMobile = false }: MindmapChatProps) {
  const {
    activeConversationId,
    activeConversationType,
    createMindmapConversation,
    saveMindmap,
    loadMindmap,
    saveMindmapMessage,
    updateMindmapMessage,
    generateTitle,
    refreshConversations,
  } = useConversation();

  // Canvas state
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const panOffsetStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(scale);
  const offsetRef = useRef(offset);

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
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // Refs for DB persistence
  const convIdRef = useRef<string | null>(activeConversationId);
  const isFirstMessageRef = useRef(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing mindmap conversation on mount
  useEffect(() => {
    if (activeConversationId && activeConversationType === "mindmap") {
      convIdRef.current = activeConversationId;
      isFirstMessageRef.current = false;
      setIsInitialLoading(true);

      loadMindmap(activeConversationId).then((data) => {
        if (data.nodes.length > 0) {
          // Reconstruct nodes with messages
          const msgsByNode = new Map<string, Message[]>();
          for (const m of data.messages) {
            const nodeId = m.node_id || "main";
            if (!msgsByNode.has(nodeId)) msgsByNode.set(nodeId, []);
            msgsByNode.get(nodeId)!.push({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.created_at),
            });
          }

          const loadedNodes: ChatNode[] = data.nodes.map((n) => ({
            id: n.id,
            x: n.position_x,
            y: n.position_y,
            parentId: n.parent_node_id,
            label: n.label,
            messages: msgsByNode.get(n.id) || [],
            isLoading: false,
          }));

          // Rebuild connections from parent relationships
          const loadedConnections: Connection[] = data.nodes
            .filter((n) => n.parent_node_id !== null)
            .map((n) => ({ fromId: n.parent_node_id!, toId: n.id }));

          setNodes(loadedNodes);
          setConnections(loadedConnections);

          // Restore canvas state
          if (data.canvasState) {
            const cs = data.canvasState;
            setOffset({ x: cs.offsetX, y: cs.offsetY });
            offsetRef.current = { x: cs.offsetX, y: cs.offsetY };
            setScale(cs.scale);
            scaleRef.current = cs.scale;
            setActiveNodeId(cs.activeNodeId || "main");
          }
        }
        setIsInitialLoading(false);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Center canvas on mount (only if not loading from DB)
  useEffect(() => {
    if (convIdRef.current) return; // Will use restored canvas state
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

  // Debounced save of mindmap structure
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      const cid = convIdRef.current;
      if (!cid) return;
      setNodes((currentNodes) => {
        const nodeData = currentNodes.map((n, i) => ({
          id: n.id,
          parentNodeId: n.parentId,
          label: n.label,
          x: n.x,
          y: n.y,
          sortOrder: i,
        }));
        saveMindmap(cid, {
          nodes: nodeData,
          canvasState: {
            offsetX: offsetRef.current.x,
            offsetY: offsetRef.current.y,
            scale: scaleRef.current,
            activeNodeId,
          },
        }).catch((err) => console.error("Failed to save mindmap:", err));
        return currentNodes; // don't mutate
      });
    }, 1000);
  }, [activeNodeId, saveMindmap]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      const cid = convIdRef.current;
      if (!cid) return;
      // Fire final save synchronously-ish
      setNodes((currentNodes) => {
        const nodeData = currentNodes.map((n, i) => ({
          id: n.id,
          parentNodeId: n.parentId,
          label: n.label,
          x: n.x,
          y: n.y,
          sortOrder: i,
        }));
        saveMindmap(cid, {
          nodes: nodeData,
          canvasState: {
            offsetX: offsetRef.current.x,
            offsetY: offsetRef.current.y,
            scale: scaleRef.current,
            activeNodeId,
          },
        }).catch(() => {});
        return currentNodes;
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  /* ===== ZOOM TO CURSOR ===== */
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

  /* ===== SEND MESSAGE ===== */
  const handleSendMessage = useCallback(
    async (nodeId: string, content: string) => {
      // Create conversation in DB on first message
      let cid = convIdRef.current;
      if (!cid) {
        try {
          cid = await createMindmapConversation();
          convIdRef.current = cid;
          // Save initial node structure
          setNodes((currentNodes) => {
            const nodeData = currentNodes.map((n, i) => ({
              id: n.id,
              parentNodeId: n.parentId,
              label: n.label,
              x: n.x,
              y: n.y,
              sortOrder: i,
            }));
            saveMindmap(cid!, {
              nodes: nodeData,
              canvasState: {
                offsetX: offsetRef.current.x,
                offsetY: offsetRef.current.y,
                scale: scaleRef.current,
                activeNodeId: nodeId,
              },
            }).catch(() => {});
            return currentNodes;
          });
        } catch (err) {
          console.error("Failed to create mindmap conversation:", err);
        }
      }

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

      // Save user message to DB
      let userDbId: string | undefined;
      if (cid) {
        saveMindmapMessage(cid, nodeId, "user", content)
          .then((id) => { userDbId = id; })
          .catch((err) => console.error("Failed to save user message:", err));
      }

      const node = nodes.find((n) => n.id === nodeId);
      const apiMessages = (node?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      apiMessages.push({ role: "user", content });

      let fullAiContent = "";
      let aiDbId: string | undefined;

      try {
        await streamChat(
          apiMessages,
          (text) => {
            fullAiContent += text;
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

        // Save AI response to DB
        if (cid && fullAiContent) {
          saveMindmapMessage(cid, nodeId, "assistant", fullAiContent)
            .then((id) => { aiDbId = id; })
            .catch((err) => console.error("Failed to save AI message:", err));
        }

        // Generate title on first message
        if (isFirstMessageRef.current && cid) {
          isFirstMessageRef.current = false;
          generateTitle(cid, content).then(() => refreshConversations());
        }

        // Trigger debounced save of mindmap structure
        debouncedSave();
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
    [nodes, createMindmapConversation, saveMindmap, saveMindmapMessage, generateTitle, refreshConversations, debouncedSave]
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

      // Pan to new node
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const s = scaleRef.current;
        const newOffset = {
          x: rect.width / 2 - (newNode.x + NODE_WIDTH / 2) * s,
          y: rect.height / 2 - (newNode.y + NODE_HEIGHT / 2) * s,
        };
        offsetRef.current = newOffset;
        setOffset(newOffset);
      }

      // Save structure to DB
      debouncedSave();

      // Auto-send the selected text as first message
      setTimeout(() => {
        const question = `"${selectedText}" hakkında detaylı bilgi ver.`;
        handleSendMessage(newId, question);
      }, 100);
    },
    [nodes, handleSendMessage, debouncedSave]
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

      // Save updated structure to DB
      debouncedSave();
    },
    [nodes, activeNodeId, debouncedSave]
  );

  /* ===== RENDER CONNECTIONS (SVG) ===== */
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

      return (
        <path
          key={`${conn.fromId}-${conn.toId}`}
          d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
          fill="none"
          stroke="var(--accent-purple)"
          strokeWidth={2}
          strokeDasharray="8 4"
          opacity={0.5}
        />
      );
    });
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: "var(--bg-primary)" }}>
        <div className="auth-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden">

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
            Metin seç &rarr; &quot;Yeni Yol Oluştur&quot; ile paralel sohbet
            oluştur &bull; Boş alana tıkla ve sürükle &bull; Scroll ile
            yakınlaştır
          </span>
        </div>
      </div>
    </div>
  );
}
