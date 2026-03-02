# AI Chat History System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Persist AI chat conversations in Supabase with per-user isolation, URL-based conversation access, auto-generated titles, sidebar history, and full history page.

**Architecture:** Two normalized Supabase tables (conversations + messages) with RLS for user isolation. Frontend uses a ConversationProvider context to manage active conversation state and URL sync. Dashboard internally tracks `activeConversationId` — when a conversation is active, URL updates to `/chat/{uuid}` via `window.history.replaceState` (no full Next.js route change needed for SPA feel). A separate `app/chat/[id]/page.tsx` handles direct URL access (bookmarks, shared links) by rendering Dashboard with the conversation pre-loaded.

**Tech Stack:** Supabase (Postgres + RLS), Next.js 16 App Router, React 19, TypeScript, Google Gemini API

---

## Task 1: Create Supabase Database Schema

**What:** Create `conversations` and `messages` tables with RLS policies, indexes, and trigger for `updated_at`.

**Step 1: Apply the migration via Supabase MCP**

```sql
-- conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Yeni Sohbet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_conversations_user_updated ON public.conversations(user_id, updated_at DESC);
CREATE INDEX idx_messages_conversation_created ON public.messages(conversation_id, created_at ASC);

-- Auto-update updated_at on conversations when messages are inserted
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- RLS: Enable
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for conversations
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for messages (via conversation ownership)
CREATE POLICY "Users can view messages of own conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages of own conversations"
  ON public.messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );
```

**Step 2: Verify tables exist**

Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
Expected: conversations, messages

**Step 3: Commit** (N/A — database migration, not file change)

---

## Task 2: Create Database Service Layer

**Files:**
- Create: `lib/db/conversations.ts`

**What:** TypeScript module with all Supabase DB operations for conversations and messages.

**Step 1: Create `lib/db/conversations.ts`**

```typescript
import { supabase } from "@/lib/supabase";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface ConversationWithPreview extends Conversation {
  messages: { content: string }[];
}

// Create a new conversation
export async function createConversation(userId: string): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Get conversations for a user (most recent first)
export async function getUserConversations(
  userId: string,
  limit = 50,
  offset = 0
): Promise<ConversationWithPreview[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*, messages(content)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1)
    // Get only the last message for preview
    .limit(1, { foreignTable: "messages" });
  if (error) throw error;
  return data || [];
}

// Get recent conversations (for sidebar)
export async function getRecentConversations(
  userId: string,
  limit = 10
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, user_id, title, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// Get a single conversation
export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  return data;
}

// Update conversation title
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  const { error } = await supabase
    .from("conversations")
    .update({ title })
    .eq("id", conversationId);
  if (error) throw error;
}

// Delete a conversation (cascades to messages)
export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);
  if (error) throw error;
}

// Get messages for a conversation
export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

// Insert a message
export async function insertMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role, content, metadata })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Update a message's content (for streaming — update assistant message as it completes)
export async function updateMessageContent(
  messageId: string,
  content: string
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ content })
    .eq("id", messageId);
  if (error) throw error;
}
```

**Step 2: Commit**

```bash
git add lib/db/conversations.ts
git commit -m "feat: add Supabase database service layer for conversations and messages"
```

---

## Task 3: Create Title Generation API Endpoint

**Files:**
- Create: `app/api/chat/title/route.ts`

**What:** API endpoint that generates a short conversation title from the first user message using Gemini.

**Step 1: Create `app/api/chat/title/route.ts`**

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API key missing" }, { status: 500 });
    }

    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return Response.json({ error: "Invalid message" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent(
      `Bu mesaj için çok kısa bir Türkçe başlık üret (maksimum 5 kelime, emoji yok, tırnak işareti yok). Sadece başlığı yaz, başka bir şey yazma.\n\nMesaj: "${message.slice(0, 200)}"`
    );

    const title = result.response.text().trim().replace(/["']/g, "").slice(0, 100);

    return Response.json({ title });
  } catch (error) {
    console.error("[Title Generation Error]", error);
    return Response.json({ title: "Yeni Sohbet" });
  }
}
```

**Step 2: Commit**

```bash
git add app/api/chat/title/route.ts
git commit -m "feat: add AI title generation endpoint for conversations"
```

---

## Task 4: Create Conversation Context Provider

**Files:**
- Create: `app/providers/ConversationProvider.tsx`

**What:** React context that manages the active conversation, provides methods to create/load/list conversations, and syncs with URL.

**Step 1: Create `app/providers/ConversationProvider.tsx`**

```typescript
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
  dbId?: string; // Supabase message ID
}

interface ConversationContextType {
  // State
  activeConversationId: string | null;
  conversations: Conversation[];
  messages: ChatMessage[];
  isLoadingConversation: boolean;

  // Actions
  startNewConversation: () => void;
  loadConversation: (id: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;

  // Message persistence
  saveUserMessage: (content: string) => Promise<{ conversationId: string; messageId: string }>;
  saveAssistantMessage: (conversationId: string, content: string) => Promise<string>;
  updateAssistantMessage: (messageId: string, content: string) => Promise<void>;
  generateTitle: (conversationId: string, firstMessage: string) => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType>({
  activeConversationId: null,
  conversations: [],
  messages: [],
  isLoadingConversation: false,
  startNewConversation: () => {},
  loadConversation: async () => {},
  refreshConversations: async () => {},
  deleteConversation: async () => {},
  saveUserMessage: async () => ({ conversationId: "", messageId: "" }),
  saveAssistantMessage: async () => "",
  updateAssistantMessage: async () => {},
  generateTitle: async () => {},
});

export function useConversation() {
  return useContext(ConversationContext);
}

export default function ConversationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);

  // Load recent conversations when user changes
  useEffect(() => {
    if (user) {
      refreshConversations();
    } else {
      setConversations([]);
      setMessages([]);
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
    setMessages([]);
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    setIsLoadingConversation(true);
    try {
      const conv = await getConversation(id);
      if (!conv) {
        console.error("Conversation not found");
        setIsLoadingConversation(false);
        return;
      }
      const dbMessages = await getMessages(id);
      setActiveConversationId(id);
      setMessages(
        dbMessages.map((m: DbMessage) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
          dbId: m.id,
        }))
      );
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setIsLoadingConversation(false);
    }
  }, []);

  const saveUserMessage = useCallback(
    async (content: string): Promise<{ conversationId: string; messageId: string }> => {
      if (!user) throw new Error("Not authenticated");

      let convId = activeConversationId;

      // Create conversation if needed
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
        setMessages([]);
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
        messages,
        isLoadingConversation,
        startNewConversation,
        loadConversation,
        refreshConversations,
        deleteConversation: handleDeleteConversation,
        saveUserMessage,
        saveAssistantMessage,
        updateAssistantMessage,
        generateTitle,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
```

**Step 2: Add ConversationProvider to layout**

In `app/layout.tsx`, wrap children with `ConversationProvider` inside `AuthProvider`:

```diff
-        <ThemeProvider>
-          <AuthProvider>{children}</AuthProvider>
-        </ThemeProvider>
+        <ThemeProvider>
+          <AuthProvider>
+            <ConversationProvider>{children}</ConversationProvider>
+          </AuthProvider>
+        </ThemeProvider>
```

Import: `import ConversationProvider from "./providers/ConversationProvider";`

**Step 3: Commit**

```bash
git add app/providers/ConversationProvider.tsx app/layout.tsx
git commit -m "feat: add ConversationProvider context for chat state management"
```

---

## Task 5: Integrate MainChat with Database Persistence

**Files:**
- Modify: `app/components/chatbot/MainChat.tsx`

**What:** Update MainChat to use ConversationProvider for saving/loading messages. On first message, create conversation + save to DB + generate title. On subsequent messages, save to existing conversation. When loading an existing conversation, display persisted messages.

**Key changes:**
1. Import and use `useConversation()` hook
2. Replace local `messages` state with conversation context messages + local streaming state
3. On `handleSend`: call `saveUserMessage`, then stream AI response, then `saveAssistantMessage`
4. On first message of a new conversation: call `generateTitle`
5. Accept optional `conversationId` prop — if provided, load that conversation on mount
6. Keep welcome message logic (show when no messages)

**Important implementation detail — streaming flow:**
1. User types message -> add to local state immediately (optimistic)
2. Call `saveUserMessage(content)` -> returns `{conversationId, messageId}`
3. Create empty assistant message in local state
4. Stream AI response, updating local assistant message content on each chunk
5. When stream complete: call `saveAssistantMessage(conversationId, fullContent)`
6. If this was the first message: call `generateTitle(conversationId, content)`
7. Call `refreshConversations()` to update sidebar

**The full modified MainChat.tsx should:**
- Use `useConversation()` for `activeConversationId`, `messages` (from context), `saveUserMessage`, `saveAssistantMessage`, `generateTitle`, `refreshConversations`, `isLoadingConversation`
- Maintain local `streamingMessages` state that merges with context messages for display
- Keep all existing UI/UX (text selection, quick prompts, typing indicator, etc.) exactly the same

**Step 1: Modify MainChat.tsx**

See full implementation in the code changes. Key additions:
- `const { activeConversationId, messages: dbMessages, saveUserMessage, saveAssistantMessage, generateTitle, refreshConversations, isLoadingConversation } = useConversation();`
- Merge `dbMessages` with local streaming messages for display
- `handleSend` flow uses DB operations
- Show loading state while conversation loads

**Step 2: Commit**

```bash
git add app/components/chatbot/MainChat.tsx
git commit -m "feat: integrate MainChat with Supabase conversation persistence"
```

---

## Task 6: Update LeftPanel with Conversation History Sidebar

**Files:**
- Modify: `app/components/layout/LeftPanel.tsx`

**What:** Add a "Sohbet Gecmisi" (Chat History) section at the top of the left panel showing recent 10 conversations. Each item shows title and relative time. Clicking loads that conversation. Add "Yeni Sohbet" button.

**Key changes:**
1. Import `useConversation()` and `useAuth()`
2. Add `ChatHistorySidebar` component that renders conversation list
3. Show relative time (e.g., "2 saat once", "Dun", "3 gun once")
4. Active conversation highlighted
5. "Yeni Sohbet" button at top calls `startNewConversation()`
6. Keep existing Pomodoro, Focus Modes, Background Sounds sections

**Step 1: Modify LeftPanel.tsx** (add ChatHistorySidebar component above existing content)

**Step 2: Commit**

```bash
git add app/components/layout/LeftPanel.tsx
git commit -m "feat: add conversation history sidebar to left panel"
```

---

## Task 7: Update ChatHistoryPage with Real Data

**Files:**
- Modify: `app/components/pages/ChatHistoryPage.tsx`

**What:** Replace mock data with real Supabase data. Show all conversations with search, pagination (load more on scroll), delete functionality, and click to open.

**Key changes:**
1. Remove all mock data
2. Import `useConversation()` and use `getUserConversations()` directly
3. Search filters title
4. Each card shows: title, first message preview, date, message count
5. Click navigates to that conversation (via `loadConversation` + change page to "focus")
6. Delete button with confirmation
7. Remove tag system (conversations don't have tags yet — YAGNI)

**Step 1: Modify ChatHistoryPage.tsx**

**Step 2: Commit**

```bash
git add app/components/pages/ChatHistoryPage.tsx
git commit -m "feat: update ChatHistoryPage with real Supabase data"
```

---

## Task 8: Create Direct URL Access Route

**Files:**
- Create: `app/chat/[id]/page.tsx`

**What:** Next.js dynamic route that handles direct URL access to `/chat/{uuid}`. Renders Dashboard with the conversation pre-loaded.

**Step 1: Create `app/chat/[id]/page.tsx`**

```typescript
"use client";

import { useEffect, use } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useConversation } from "@/app/providers/ConversationProvider";
import LandingPage from "@/app/components/landing/LandingPage";
import Dashboard from "@/app/components/dashboard/Dashboard";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, loading, logout } = useAuth();
  const { loadConversation, activeConversationId } = useConversation();

  useEffect(() => {
    if (isAuthenticated && id && activeConversationId !== id) {
      loadConversation(id);
    }
  }, [isAuthenticated, id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div style={{ background: "var(--bg-primary)", height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="auth-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <Dashboard onLogout={logout} initialPage="focus" />;
}
```

**Step 2: Update Dashboard to accept `initialPage` prop**

In `Dashboard.tsx`, add optional `initialPage` prop:
```typescript
interface DashboardProps {
  onLogout: () => void;
  initialPage?: PageType;
}
```
And use it: `const [activePage, setActivePage] = useState<PageType>(initialPage || "focus");`

**Step 3: Commit**

```bash
git add app/chat/[id]/page.tsx app/components/dashboard/Dashboard.tsx
git commit -m "feat: add direct URL access route for conversations"
```

---

## Task 9: Wire Up Dashboard Page Switching with Conversations

**Files:**
- Modify: `app/components/dashboard/Dashboard.tsx`

**What:** When user navigates to ChatHistoryPage and clicks a conversation, switch to "focus" page with that conversation loaded. Pass necessary callbacks.

**Key changes:**
1. Import `useConversation()`
2. When `ChatHistoryPage` triggers "open conversation", call `loadConversation(id)` then `setActivePage("focus")`
3. Pass `onOpenConversation` callback to `ChatHistoryPage`
4. `handleNewChat` should call `startNewConversation()` before showing style selector

**Step 1: Modify Dashboard.tsx**

**Step 2: Commit**

```bash
git add app/components/dashboard/Dashboard.tsx
git commit -m "feat: wire up conversation navigation in Dashboard"
```

---

## Task 10: Run Security Advisors and Final Verification

**What:** Check Supabase security advisors for any missing RLS policies or issues. Test the complete flow.

**Step 1: Run Supabase security advisors**

Check for any security warnings on the new tables.

**Step 2: Verify complete flow**
1. User logs in
2. Types first message -> conversation created, URL changes, title generated
3. AI responds -> messages saved
4. Sidebar shows conversation
5. Navigate to history page -> all conversations listed
6. Click conversation -> loaded and displayed
7. Direct URL `/chat/{uuid}` -> conversation loaded
8. Different user cannot access other's conversations (RLS)

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete AI chat history system with Supabase persistence"
```
