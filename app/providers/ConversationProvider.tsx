"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthProvider";
import {
  createConversation,
  getConversation,
  getMessages,
  getRecentConversations,
  insertMessage,
  updateMessageContent,
  updateConversationTitle,
  deleteConversation as dbDeleteConversation,
  saveMindmapNodes,
  getMindmapNodes,
  getAllMindmapMessages,
  updateCanvasState,
  createChildRoadmapConversation,
  type Conversation,
  type ConversationType,
  type Message as DbMessage,
  type MindmapNode,
  type CanvasState,
} from "@/lib/db/conversations";
import { insertInteraction } from "@/lib/db/tracking";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  dbId?: string;
  imageUrl?: string;
}

export interface MindmapSaveData {
  nodes: { id: string; parentNodeId: string | null; label: string; x: number; y: number; sortOrder: number }[];
  canvasState: CanvasState;
}

export interface MindmapLoadData {
  nodes: MindmapNode[];
  messages: DbMessage[];
  canvasState: CanvasState | null;
}

interface ConversationContextType {
  activeConversationId: string | null;
  activeConversationType: ConversationType | null;
  conversations: Conversation[];
  isLoadingConversation: boolean;

  startNewConversation: () => void;
  loadConversation: (id: string) => Promise<ChatMessage[]>;
  refreshConversations: () => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;

  saveUserMessage: (content: string, nodeId?: string | null, type?: ConversationType, imageUrl?: string) => Promise<{ conversationId: string; messageId: string }>;
  saveAssistantMessage: (conversationId: string, content: string, nodeId?: string | null) => Promise<string>;
  updateAssistantMessage: (messageId: string, content: string) => Promise<void>;
  generateTitle: (conversationId: string, firstMessage: string) => Promise<void>;

  createTypedConversation: (type: ConversationType) => Promise<string>;

  // Mindmap-specific
  createMindmapConversation: () => Promise<string>;
  saveMindmap: (conversationId: string, data: MindmapSaveData) => Promise<void>;
  loadMindmap: (conversationId: string) => Promise<MindmapLoadData>;
  saveMindmapMessage: (conversationId: string, nodeId: string, role: "user" | "assistant", content: string) => Promise<string>;
  updateMindmapMessage: (messageId: string, content: string) => Promise<void>;

  createChildRoadmap: (parentId: string, stepNumber: number) => Promise<string>;

  setActiveConversationId: (id: string | null) => void;
  setActiveConversationType: (type: ConversationType | null) => void;
}

const ConversationContext = createContext<ConversationContextType>({
  activeConversationId: null,
  activeConversationType: null,
  conversations: [],
  isLoadingConversation: false,
  startNewConversation: () => {},
  loadConversation: async () => [],
  refreshConversations: async () => {},
  deleteConversation: async () => {},
  saveUserMessage: async () => ({ conversationId: "", messageId: "" }),
  saveAssistantMessage: async () => "",
  updateAssistantMessage: async () => {},
  generateTitle: async () => {},
  createTypedConversation: async () => "",
  createMindmapConversation: async () => "",
  saveMindmap: async () => {},
  loadMindmap: async () => ({ nodes: [], messages: [], canvasState: null }),
  saveMindmapMessage: async () => "",
  updateMindmapMessage: async () => {},
  createChildRoadmap: async () => "",
  setActiveConversationId: () => {},
  setActiveConversationType: () => {},
});

export function useConversation() {
  return useContext(ConversationContext);
}

export default function ConversationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeConversationType, setActiveConversationType] = useState<ConversationType | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  useEffect(() => {
    if (user) {
      refreshConversations();
    } else {
      setConversations([]);
      setActiveConversationId(null);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync URL when active conversation changes (replaceState to avoid extra history entries)
  useEffect(() => {
    if (activeConversationId) {
      const url = `/chat/${activeConversationId}`;
      if (window.location.pathname !== url) {
        window.history.replaceState({}, "", url);
      }
    } else if (window.location.pathname.startsWith("/chat/")) {
      window.history.replaceState({}, "", "/");
    }
  }, [activeConversationId]);

  const refreshConversations = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getRecentConversations(user.id);
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, [user]);

  const startNewConversation = useCallback(() => {
    setActiveConversationId(null);
    setActiveConversationType(null);
  }, []);

  const loadConversation = useCallback(async (id: string): Promise<ChatMessage[]> => {
    setIsLoadingConversation(true);
    try {
      const conv = await getConversation(id);
      if (!conv) {
        console.error("Conversation not found");
        return [];
      }
      setActiveConversationId(id);
      setActiveConversationType(conv.type as ConversationType);

      // For mindmap conversations, return empty — MindmapChat handles its own loading
      if (conv.type === "mindmap") return [];

      const dbMessages = await getMessages(id);
      return dbMessages.map((m: DbMessage) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),
        dbId: m.id,
        imageUrl: m.metadata?.image_url as string | undefined,
      }));
    } catch (err) {
      console.error("Failed to load conversation:", err);
      return [];
    } finally {
      setIsLoadingConversation(false);
    }
  }, []);

  const saveUserMessage = useCallback(
    async (content: string, nodeId: string | null = null, type: ConversationType = "standard", imageUrl?: string): Promise<{ conversationId: string; messageId: string }> => {
      if (!user) throw new Error("Not authenticated");

      let convId = activeConversationId;

      if (!convId) {
        const conv = await createConversation(user.id, type);
        convId = conv.id;
        setActiveConversationId(convId);
        setActiveConversationType(type);
      }

      const metadata: Record<string, unknown> = imageUrl ? { image_url: imageUrl } : {};
      const msg = await insertMessage(convId, "user", content, metadata, nodeId);
      insertInteraction(user.id, 'message_sent', convId).catch(console.error);
      return { conversationId: convId, messageId: msg.id };
    },
    [user, activeConversationId]
  );

  const saveAssistantMessage = useCallback(
    async (conversationId: string, content: string, nodeId: string | null = null): Promise<string> => {
      const msg = await insertMessage(conversationId, "assistant", content, {}, nodeId);
      return msg.id;
    },
    []
  );

  const updateAssistantMessage = useCallback(
    async (messageId: string, content: string): Promise<void> => {
      await updateMessageContent(messageId, content);
    },
    []
  );

  const generateTitle = useCallback(
    async (conversationId: string, firstMessage: string) => {
      try {
        const res = await fetch("/api/chat/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: firstMessage }),
        });
        const { title } = await res.json();
        if (title) {
          await updateConversationTitle(conversationId, title);
          await refreshConversations();
        }
      } catch (err) {
        console.error("Failed to generate title:", err);
      }
    },
    [refreshConversations]
  );

  /* ===== MINDMAP METHODS ===== */

  const createMindmapConversation = useCallback(async (): Promise<string> => {
    if (!user) throw new Error("Not authenticated");
    const conv = await createConversation(user.id, "mindmap");
    setActiveConversationId(conv.id);
    setActiveConversationType("mindmap");
    return conv.id;
  }, [user]);

  const createTypedConversation = useCallback(async (type: ConversationType): Promise<string> => {
    if (!user) throw new Error("Not authenticated");
    const conv = await createConversation(user.id, type);
    setActiveConversationId(conv.id);
    setActiveConversationType(type);
    return conv.id;
  }, [user]);

  const saveMindmapData = useCallback(
    async (conversationId: string, data: MindmapSaveData): Promise<void> => {
      await Promise.all([
        saveMindmapNodes(conversationId, data.nodes),
        updateCanvasState(conversationId, data.canvasState),
      ]);
      if (user) {
        insertInteraction(user.id, 'mindmap_node_added', conversationId).catch(console.error);
      }
    },
    [user]
  );

  const loadMindmapData = useCallback(
    async (conversationId: string): Promise<MindmapLoadData> => {
      const conv = await getConversation(conversationId);
      const [nodes, messages] = await Promise.all([
        getMindmapNodes(conversationId),
        getAllMindmapMessages(conversationId),
      ]);
      return {
        nodes,
        messages,
        canvasState: conv?.canvas_state ?? null,
      };
    },
    []
  );

  const saveMindmapMessage = useCallback(
    async (conversationId: string, nodeId: string, role: "user" | "assistant", content: string): Promise<string> => {
      const msg = await insertMessage(conversationId, role, content, {}, nodeId);
      return msg.id;
    },
    []
  );

  const updateMindmapMessage = useCallback(
    async (messageId: string, content: string): Promise<void> => {
      await updateMessageContent(messageId, content);
    },
    []
  );

  const createChildRoadmap = useCallback(
    async (parentId: string, stepNumber: number): Promise<string> => {
      if (!user) throw new Error("Not authenticated");
      const conv = await createChildRoadmapConversation(user.id, parentId, stepNumber);
      setActiveConversationId(conv.id);
      setActiveConversationType("roadmap");
      return conv.id;
    },
    [user]
  );

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      await dbDeleteConversation(id);
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
      await refreshConversations();
    },
    [activeConversationId, refreshConversations]
  );

  return (
    <ConversationContext.Provider
      value={{
        activeConversationId,
        activeConversationType,
        conversations,
        isLoadingConversation,
        startNewConversation,
        loadConversation,
        refreshConversations,
        deleteConversation: handleDeleteConversation,
        saveUserMessage,
        saveAssistantMessage,
        updateAssistantMessage,
        generateTitle,
        createTypedConversation,
        createMindmapConversation,
        saveMindmap: saveMindmapData,
        loadMindmap: loadMindmapData,
        saveMindmapMessage,
        updateMindmapMessage,
        createChildRoadmap,
        setActiveConversationId,
        setActiveConversationType,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
