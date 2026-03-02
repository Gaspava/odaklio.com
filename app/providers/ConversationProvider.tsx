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
  type Conversation,
  type Message as DbMessage,
} from "@/lib/db/conversations";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  dbId?: string;
}

interface ConversationContextType {
  activeConversationId: string | null;
  conversations: Conversation[];
  isLoadingConversation: boolean;

  startNewConversation: () => void;
  loadConversation: (id: string) => Promise<ChatMessage[]>;
  refreshConversations: () => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;

  saveUserMessage: (content: string) => Promise<{ conversationId: string; messageId: string }>;
  saveAssistantMessage: (conversationId: string, content: string) => Promise<string>;
  updateAssistantMessage: (messageId: string, content: string) => Promise<void>;
  generateTitle: (conversationId: string, firstMessage: string) => Promise<void>;

  setActiveConversationId: (id: string | null) => void;
}

const ConversationContext = createContext<ConversationContextType>({
  activeConversationId: null,
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
  setActiveConversationId: () => {},
});

export function useConversation() {
  return useContext(ConversationContext);
}

export default function ConversationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
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

  // Sync URL with active conversation
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
  }, []);

  const loadConversation = useCallback(async (id: string): Promise<ChatMessage[]> => {
    setIsLoadingConversation(true);
    try {
      const conv = await getConversation(id);
      if (!conv) {
        console.error("Conversation not found");
        return [];
      }
      const dbMessages = await getMessages(id);
      setActiveConversationId(id);
      return dbMessages.map((m: DbMessage) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),
        dbId: m.id,
      }));
    } catch (err) {
      console.error("Failed to load conversation:", err);
      return [];
    } finally {
      setIsLoadingConversation(false);
    }
  }, []);

  const saveUserMessage = useCallback(
    async (content: string): Promise<{ conversationId: string; messageId: string }> => {
      if (!user) throw new Error("Not authenticated");

      let convId = activeConversationId;

      if (!convId) {
        const conv = await createConversation(user.id);
        convId = conv.id;
        setActiveConversationId(convId);
      }

      const msg = await insertMessage(convId, "user", content);
      return { conversationId: convId, messageId: msg.id };
    },
    [user, activeConversationId]
  );

  const saveAssistantMessage = useCallback(
    async (conversationId: string, content: string): Promise<string> => {
      const msg = await insertMessage(conversationId, "assistant", content);
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
        setActiveConversationId,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
