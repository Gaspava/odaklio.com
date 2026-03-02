# Mentor WhatsApp-Style Chat Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mentor sayfasini WhatsApp tarzi sol panel (mentor listesi) + sag panel (chat) layoutuna donustur, gercek AI ile calistir, sohbetleri Supabase'e kaydet.

**Architecture:** Mevcut `/api/chat/route.ts` endpointine mentor system promptlari eklenir. `conversations` tablosunda `type: "mentor"` + `mentor_id` metadata alani kullanilir. Her mentor icin bagimsiz conversation. MentorPage.tsx tamamen yeniden yazilir.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Supabase, Google Gemini API (gemini-3-flash-preview)

---

### Task 1: Add mentor system prompts to chat API

**Files:**
- Modify: `app/api/chat/route.ts:40-107` (MODE_PROMPTS object)

**Step 1: Add mentor persona prompts to MODE_PROMPTS**

Add these entries to the `MODE_PROMPTS` object in `app/api/chat/route.ts`:

```typescript
mentor_coach: `Sen Odaklio platformundaki "Ders Kocu" mentorsun. Adin Ders Kocu.

Rolu: Akademik danismanlk. Ogrencilere calisma plani olusturmak, konulari derinlemesine anlamak ve sinava hazirlanmak konusunda yardim et.

Tarzi:
- Akademik, yapilandirilmis ve tesvik edici bir dil kullan.
- Calisma stratejileri ve zaman yonetimi tavsiyeleri ver.
- Konulari adim adim, anlasilir bir dille acikla.
- Ogrenciyi motive et ve basariya yonlendir.
- Her zaman Turkce yanit ver.
- Kisa ve oz yanitlar ver, gereksiz uzatma.
- Markdown formati kullan: **kalin**, *italik*, listeler, basliklar.
- Ozel bilgi kutulari kullan: [!tip], [!info], [!warning], [!note], [!success], [!danger]`,

mentor_psych: `Sen Odaklio platformundaki "Psikolog" mentorsun. Adin Psikolog.

Rolu: Ruhsal destek. Ogrencilere sinav stresi, motivasyon kaybi ve duygusal zorluklar konusunda yardim et.

Tarzi:
- Empatik, anlayisli ve destekleyici bir dil kullan.
- Ogrencinin duygularini dogrula ve normallestir.
- Pratik basa cikma stratejileri oner.
- Gerektiginde profesyonel yardim almayi tesvk et.
- Her zaman Turkce yanit ver.
- Kisa ve oz yanitlar ver, gereksiz uzatma.
- Markdown formati kullan: **kalin**, *italik*, listeler, basliklar.
- Ozel bilgi kutulari kullan: [!tip], [!info], [!warning], [!note], [!success], [!danger]`,

mentor_buddy: `Sen Odaklio platformundaki "Kanka" mentorsun. Adin Kanka.

Rolu: Calisma arkadasi. Ogrencilerle samimi bir sekilde calisarak onlari motive et.

Tarzi:
- Samimi, eglenceli ve motive edici bir dil kullan.
- Gunluk konusma dili kullan, resmi olma.
- Konulari basit ve anlasilir sekilde acikla.
- Birlikte calisma hissi ver.
- Her zaman Turkce yanit ver.
- Kisa ve oz yanitlar ver, gereksiz uzatma.
- Markdown formati kullan: **kalin**, *italik*, listeler, basliklar.
- Ozel bilgi kutulari kullan: [!tip], [!info], [!warning], [!note], [!success], [!danger]`,

mentor_expert: `Sen Odaklio platformundaki "Uzman" mentorsun. Adin Uzman.

Rolu: Konu uzmani. Ogrencilere derinlemesine bilgi, detayli aciklama ve ileri duzey konularda yardim et.

Tarzi:
- Detayli, bilimsel ve analitik bir dil kullan.
- Konulari derinlemesine acikla, kaynaklara atifta bulun.
- Matematiksel ifadelerde Unicode sembollerini kullan.
- Ileri duzey sorulara kapsamli yanitlar ver.
- Her zaman Turkce yanit ver.
- Kisa ve oz yanitlar ver, gereksiz uzatma.
- Markdown formati kullan: **kalin**, *italik*, listeler, basliklar.
- Ozel bilgi kutulari kullan: [!tip], [!info], [!warning], [!note], [!success], [!danger]`,
```

**Step 2: Commit**

```bash
git add app/api/chat/route.ts
git commit -m "feat(mentor): add mentor persona system prompts to chat API"
```

---

### Task 2: Add "mentor" to ConversationType and DB helpers

**Files:**
- Modify: `lib/db/conversations.ts:3` (ConversationType)
- Modify: `lib/db/conversations.ts` (add mentor helper functions)
- Modify: `app/providers/ConversationProvider.tsx` (add mentor conversation support)

**Step 1: Update ConversationType to include "mentor"**

In `lib/db/conversations.ts`, change line 3:

```typescript
export type ConversationType = "standard" | "mindmap" | "flashcard" | "note" | "roadmap" | "mentor";
```

**Step 2: Add mentor DB helper functions**

Add at the end of `lib/db/conversations.ts`:

```typescript
/* ===== MENTOR CONVERSATIONS ===== */

export async function getMentorConversation(
  userId: string,
  mentorId: string
): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "mentor")
    .eq("title", mentorId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function createMentorConversation(
  userId: string,
  mentorId: string
): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, type: "mentor", title: mentorId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getOrCreateMentorConversation(
  userId: string,
  mentorId: string
): Promise<Conversation> {
  const existing = await getMentorConversation(userId, mentorId);
  if (existing) return existing;
  return createMentorConversation(userId, mentorId);
}
```

**Step 3: Commit**

```bash
git add lib/db/conversations.ts app/providers/ConversationProvider.tsx
git commit -m "feat(mentor): add mentor type and DB helpers for mentor conversations"
```

---

### Task 3: Rewrite MentorPage.tsx with WhatsApp layout

**Files:**
- Rewrite: `app/components/pages/MentorPage.tsx`

**Step 1: Write the complete new MentorPage component**

This is the full rewrite. The component has:
- Left panel: mentor list with last message preview
- Right panel: chat area with streaming AI, input bar
- Mobile: toggle between panels
- Supabase integration for loading/saving messages
- Uses existing `/api/chat` endpoint with `mode: "mentor_<id>"`
- Uses `ChatMessageRenderer` for rich markdown in AI responses

```tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend } from "../icons/Icons";
import ChatMessageRenderer from "../chatbot/ChatMessageRenderer";
import { useAuth } from "@/app/providers/AuthProvider";
import {
  getOrCreateMentorConversation,
  getMessages,
  insertMessage,
  type Message as DbMessage,
} from "@/lib/db/conversations";

/* ===== TYPES ===== */
interface Persona {
  id: string;
  name: string;
  emoji: string;
  role: string;
  color: string;
  gradient: string;
  greeting: string;
  style: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/* ===== PERSONAS ===== */
const personas: Persona[] = [
  {
    id: "coach",
    name: "Ders Kocu",
    emoji: "\ud83c\udf93",
    role: "Akademik Danismanlk",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    greeting:
      "Merhaba! Ben senin ders kocunum. Calisma plani olusturmak, konulari derinlemesine anlamak veya sinava hazirlanmak konusunda yanindayim. Bugun hangi konuda calismak istersin?",
    style: "Akademik, yapilandirilmis ve tesvik edici",
  },
  {
    id: "psych",
    name: "Psikolog",
    emoji: "\ud83e\udde0",
    role: "Ruhsal Destek",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    greeting:
      "Merhaba, nasil hissediyorsun bugun? Sinav stresi, motivasyon kaybi ya da sadece konusmak istedigin bir sey varsa buradayim. Her duygu onemli ve gecerli.",
    style: "Empatik, anlayisli ve destekleyici",
  },
  {
    id: "buddy",
    name: "Kanka",
    emoji: "\ud83d\ude0e",
    role: "Calisma Arkadasi",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    greeting:
      "Selaaam! Naber, bugun ne calisiyoruz? Birlikte calismak daha eglenceli! Takilsan sormaktan cekinme, birlikte cozeriz.",
    style: "Samimi, eglenceli ve motive edici",
  },
  {
    id: "expert",
    name: "Uzman",
    emoji: "\ud83d\udd2c",
    role: "Konu Uzmani",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    greeting:
      "Hos geldiniz. Herhangi bir konuda derinlemesine bilgi, detayli aciklama veya ileri duzey sorulariniz icin hazirim. Hangi alanda arastirma yapmak istersiniz?",
    style: "Detayli, bilimsel ve analitik",
  },
];

/* ===== STREAM CHAT ===== */
async function streamMentorChat(
  messages: { role: string; content: string }[],
  mentorId: string,
  onChunk: (text: string) => void,
  onDone: () => void
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, mode: `mentor_${mentorId}` }),
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
        if (parsed.text) onChunk(parsed.text);
      } catch {
        // skip
      }
    }
  }
  onDone();
}

/* ===== TYPING INDICATOR ===== */
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1">
      <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--accent-primary)" }} />
      <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--accent-primary)" }} />
      <div className="typing-dot w-2 h-2 rounded-full" style={{ background: "var(--accent-primary)" }} />
    </div>
  );
}

/* ===== BACK ARROW ICON ===== */
function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/* ===== MAIN COMPONENT ===== */
export default function MentorPage() {
  const { user } = useAuth();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [conversationIds, setConversationIds] = useState<Record<string, string>>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingChats, setLoadingChats] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, selectedPersona]);

  // Focus input when persona selected
  useEffect(() => {
    if (selectedPersona) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedPersona]);

  // Load mentor conversation from DB
  const loadMentorChat = useCallback(
    async (personaId: string) => {
      if (!user || loadingChats[personaId] || conversationIds[personaId]) return;
      setLoadingChats((prev) => ({ ...prev, [personaId]: true }));
      try {
        const conv = await getOrCreateMentorConversation(user.id, personaId);
        setConversationIds((prev) => ({ ...prev, [personaId]: conv.id }));
        const dbMessages = await getMessages(conv.id);
        if (dbMessages.length > 0) {
          const msgs: ChatMessage[] = dbMessages.map((m: DbMessage) => ({
            id: m.id,
            role: m.role,
            content: m.content,
          }));
          setChatMessages((prev) => ({ ...prev, [personaId]: msgs }));
        }
      } catch (err) {
        console.error("Failed to load mentor chat:", err);
      } finally {
        setLoadingChats((prev) => ({ ...prev, [personaId]: false }));
      }
    },
    [user, loadingChats, conversationIds]
  );

  // Load all mentor chats on mount
  useEffect(() => {
    if (user) {
      personas.forEach((p) => loadMentorChat(p.id));
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setInput("");
  };

  const handleBack = () => {
    setSelectedPersona(null);
    setInput("");
  };

  const getMessagesForPersona = (personaId: string): ChatMessage[] => {
    return chatMessages[personaId] || [];
  };

  const getLastMessage = (personaId: string): string => {
    const msgs = getMessagesForPersona(personaId);
    if (msgs.length === 0) {
      const persona = personas.find((p) => p.id === personaId);
      return persona?.greeting || "";
    }
    return msgs[msgs.length - 1].content;
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !selectedPersona || !user) return;

    const personaId = selectedPersona.id;
    const userContent = input.trim();
    setInput("");
    setIsLoading(true);

    // Ensure conversation exists
    let convId = conversationIds[personaId];
    if (!convId) {
      try {
        const conv = await getOrCreateMentorConversation(user.id, personaId);
        convId = conv.id;
        setConversationIds((prev) => ({ ...prev, [personaId]: convId }));
      } catch (err) {
        console.error("Failed to create conversation:", err);
        setIsLoading(false);
        return;
      }
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
    };
    setChatMessages((prev) => ({
      ...prev,
      [personaId]: [...(prev[personaId] || []), userMsg],
    }));

    // Save user message to DB
    try {
      await insertMessage(convId, "user", userContent);
    } catch (err) {
      console.error("Failed to save user message:", err);
    }

    // Add empty AI message
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = { id: aiMsgId, role: "assistant", content: "" };
    setChatMessages((prev) => ({
      ...prev,
      [personaId]: [...(prev[personaId] || []), aiMsg],
    }));

    // Build API messages
    const currentMsgs = [...(chatMessages[personaId] || []), userMsg];
    const apiMessages = currentMsgs.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let fullContent = "";

    try {
      await streamMentorChat(
        apiMessages,
        personaId,
        (text) => {
          fullContent += text;
          setChatMessages((prev) => ({
            ...prev,
            [personaId]: (prev[personaId] || []).map((m) =>
              m.id === aiMsgId ? { ...m, content: m.content + text } : m
            ),
          }));
        },
        () => setIsLoading(false)
      );

      // Save AI message to DB
      if (fullContent) {
        try {
          await insertMessage(convId, "assistant", fullContent);
        } catch (err) {
          console.error("Failed to save assistant message:", err);
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Bilinmeyen hata";
      setChatMessages((prev) => ({
        ...prev,
        [personaId]: (prev[personaId] || []).map((m) =>
          m.id === aiMsgId
            ? { ...m, content: `[!danger] Baglanti Hatasi\n${errorMsg}` }
            : m
        ),
      }));
      setIsLoading(false);
    }
  }, [input, isLoading, selectedPersona, user, conversationIds, chatMessages]);

  /* ===== LEFT PANEL: Mentor List ===== */
  const renderLeftPanel = () => (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 px-4 py-4"
        style={{ borderBottom: "1px solid var(--border-primary)" }}
      >
        <h2
          className="text-base font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Mentorlar
        </h2>
        <p
          className="text-[11px] mt-0.5"
          style={{ color: "var(--text-tertiary)" }}
        >
          AI mentorlarinden biriyle sohbet et
        </p>
      </div>

      {/* Mentor List */}
      <div className="flex-1 overflow-y-auto">
        {personas.map((persona) => {
          const isActive = selectedPersona?.id === persona.id;
          const lastMsg = getLastMessage(persona.id);
          const preview =
            lastMsg.length > 60 ? lastMsg.slice(0, 60) + "..." : lastMsg;

          return (
            <button
              key={persona.id}
              onClick={() => handleSelectPersona(persona)}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left"
              style={{
                background: isActive
                  ? `${persona.color}08`
                  : "transparent",
                borderBottom: "1px solid var(--border-primary)",
                borderLeft: isActive
                  ? `3px solid ${persona.color}`
                  : "3px solid transparent",
              }}
            >
              {/* Avatar */}
              <div
                className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl relative"
                style={{ background: `${persona.color}15` }}
              >
                {persona.emoji}
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                  style={{
                    background: "#22c55e",
                    borderColor: "var(--bg-primary)",
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[13px] font-semibold truncate"
                    style={{
                      color: isActive
                        ? persona.color
                        : "var(--text-primary)",
                    }}
                  >
                    {persona.name}
                  </span>
                  <span
                    className="text-[10px] flex-shrink-0 ml-2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {persona.role}
                  </span>
                </div>
                <p
                  className="text-[11px] mt-0.5 truncate"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {preview}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  /* ===== RIGHT PANEL: Chat ===== */
  const renderRightPanel = () => {
    if (!selectedPersona) {
      return (
        <div
          className="flex flex-col items-center justify-center h-full gap-3"
          style={{ background: "var(--bg-secondary)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: "var(--bg-tertiary)" }}
          >
            💬
          </div>
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            Bir mentor sec ve sohbete basla
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Soldan bir mentor secin
          </p>
        </div>
      );
    }

    const msgs = getMessagesForPersona(selectedPersona.id);
    const isLoadingChat = loadingChats[selectedPersona.id];

    return (
      <div
        className="flex flex-col h-full"
        style={{ background: "var(--bg-secondary)" }}
      >
        {/* Chat Header */}
        <div
          className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
          style={{
            borderBottom: "1px solid var(--border-primary)",
            background: "var(--bg-primary)",
          }}
        >
          {isMobile && (
            <button
              onClick={handleBack}
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg transition-all"
              style={{ color: "var(--text-secondary)" }}
            >
              <IconBack />
            </button>
          )}
          <div
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg"
            style={{ background: `${selectedPersona.color}15` }}
          >
            {selectedPersona.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="text-[13px] font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {selectedPersona.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#22c55e" }}
              />
              <span
                className="text-[10px]"
                style={{ color: "var(--text-tertiary)" }}
              >
                Cevrimici · {selectedPersona.style}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoadingChat ? (
            <div className="flex items-center justify-center h-full">
              <div className="auth-spinner" style={{ width: 24, height: 24 }} />
            </div>
          ) : (
            <div className="max-w-[720px] mx-auto space-y-3">
              {/* Greeting if no messages */}
              {msgs.length === 0 && (
                <div className="flex justify-start animate-msg-in">
                  <div className="flex-shrink-0 flex items-end mr-2">
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full text-xs"
                      style={{ background: `${selectedPersona.color}15` }}
                    >
                      {selectedPersona.emoji}
                    </div>
                  </div>
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
                    style={{
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                      borderRadius: "4px 20px 20px 20px",
                      border: "1px solid var(--border-primary)",
                    }}
                  >
                    {selectedPersona.greeting}
                  </div>
                </div>
              )}

              {/* Chat messages */}
              {msgs.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  } animate-msg-in`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 flex items-end mr-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs"
                        style={{
                          background: `${selectedPersona.color}15`,
                        }}
                      >
                        {selectedPersona.emoji}
                      </div>
                    </div>
                  )}
                  <div
                    className={`${
                      msg.role === "user"
                        ? "max-w-[80%]"
                        : "max-w-[85%]"
                    } rounded-2xl px-4 py-3 text-[13px] leading-relaxed`}
                    style={
                      msg.role === "user"
                        ? {
                            background: selectedPersona.gradient,
                            color: "white",
                            borderRadius: "20px 20px 4px 20px",
                            boxShadow: `0 0 12px ${selectedPersona.color}25`,
                          }
                        : {
                            background: "var(--bg-card)",
                            color: "var(--text-primary)",
                            borderRadius: "4px 20px 20px 20px",
                            border: "1px solid var(--border-primary)",
                          }
                    }
                  >
                    {msg.role === "assistant" ? (
                      msg.content ? (
                        <ChatMessageRenderer content={msg.content} />
                      ) : (
                        isLoading && <TypingIndicator />
                      )
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div
          className="flex-shrink-0 px-4 py-3"
          style={{
            borderTop: "1px solid var(--border-primary)",
            background: "var(--bg-primary)",
          }}
        >
          <div className="max-w-[720px] mx-auto flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`${selectedPersona.name}'a bir mesaj yaz...`}
              disabled={isLoading}
              className="flex-1 bg-transparent text-[13px] outline-none rounded-xl px-4 py-2.5 disabled:opacity-50"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-primary)",
                color: "var(--text-primary)",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30 active:scale-95"
              style={{
                background:
                  input.trim() && !isLoading
                    ? selectedPersona.gradient
                    : "var(--bg-tertiary)",
                boxShadow:
                  input.trim() && !isLoading
                    ? `0 0 12px ${selectedPersona.color}30`
                    : "none",
              }}
            >
              <IconSend size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ===== LAYOUT ===== */
  if (isMobile) {
    return (
      <div className="h-full overflow-hidden">
        {selectedPersona ? renderRightPanel() : renderLeftPanel()}
      </div>
    );
  }

  return (
    <div className="h-full flex overflow-hidden">
      <div
        className="flex-shrink-0"
        style={{
          width: 320,
          borderRight: "1px solid var(--border-primary)",
        }}
      >
        {renderLeftPanel()}
      </div>
      <div className="flex-1 min-w-0">{renderRightPanel()}</div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add app/components/pages/MentorPage.tsx
git commit -m "feat(mentor): rewrite MentorPage with WhatsApp-style layout and real AI"
```

---

### Task 4: Test and verify

**Step 1: Run dev server and verify**

```bash
cd /c/Users/kutayy/Desktop/odaklio && npm run dev
```

Check:
- Mentor page loads with 4 mentors in left panel
- Clicking a mentor opens chat on right
- Sending a message streams AI response
- Messages persist after page reload
- Mobile layout works (toggle between panels)

**Step 2: Final commit if any fixes needed**
