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
    name: "Ders Koçu",
    emoji: "🎓",
    role: "Akademik Danışman",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    greeting:
      "Merhaba! Ben senin ders koçunum. Çalışma planı oluşturmak, konuları derinlemesine anlamak veya sınava hazırlanmak konusunda yanındayım. Bugün hangi konuda çalışmak istersin?",
    style: "Akademik, yapılandırılmış ve teşvik edici",
  },
  {
    id: "psych",
    name: "Psikolog",
    emoji: "🧠",
    role: "Ruhsal Destek",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    greeting:
      "Merhaba, nasıl hissediyorsun bugün? Sınav stresi, motivasyon kaybı ya da sadece konuşmak istediğin bir şey varsa buradayım. Her duygu önemli ve geçerli.",
    style: "Empatik, anlayışlı ve destekleyici",
  },
  {
    id: "buddy",
    name: "Kanka",
    emoji: "😎",
    role: "Çalışma Arkadaşı",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    greeting:
      "Selaaam! Naber, bugün ne çalışıyoruz? Birlikte çalışmak daha eğlenceli! Takılsan sormaktan çekinme, birlikte çözeriz.",
    style: "Samimi, eğlenceli ve motive edici",
  },
  {
    id: "expert",
    name: "Uzman",
    emoji: "🔬",
    role: "Konu Uzmanı",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    greeting:
      "Hoş geldiniz. Herhangi bir konuda derinlemesine bilgi, detaylı açıklama veya ileri düzey sorularınız için hazırım. Hangi alanda araştırma yapmak istersiniz?",
    style: "Detaylı, bilimsel ve analitik",
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
        if (parsed.text) onChunk(parsed.text);
      } catch {
        // skip malformed chunks
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

    // Add user message immediately (before any DB call)
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
    };
    setChatMessages((prev) => ({
      ...prev,
      [personaId]: [...(prev[personaId] || []), userMsg],
    }));

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

    // Save user message to DB
    try {
      await insertMessage(convId, "user", userContent);
    } catch (err) {
      console.error("Failed to save user message:", err);
    }

    // Add empty AI message for streaming
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = { id: aiMsgId, role: "assistant", content: "" };
    setChatMessages((prev) => ({
      ...prev,
      [personaId]: [...(prev[personaId] || []), aiMsg],
    }));

    // Build API messages from chat history
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
            ? { ...m, content: `[!danger] Bağlantı Hatası\n${errorMsg}` }
            : m
        ),
      }));
      setIsLoading(false);
    }
  }, [input, isLoading, selectedPersona, user, conversationIds, chatMessages]);

  /* ===== LEFT PANEL: Mentor List ===== */
  const renderLeftPanel = () => (
    <div className="flex flex-col h-full" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4" style={{ borderBottom: "1px solid var(--border-primary)" }}>
        <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
          Mentorlar
        </h2>
        <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
          AI mentörlerinden biriyle sohbet et
        </p>
      </div>

      {/* Mentor List */}
      <div className="flex-1 overflow-y-auto">
        {personas.map((persona) => {
          const isActive = selectedPersona?.id === persona.id;
          const lastMsg = getLastMessage(persona.id);
          const preview = lastMsg.length > 60 ? lastMsg.slice(0, 60) + "..." : lastMsg;

          return (
            <button
              key={persona.id}
              onClick={() => handleSelectPersona(persona)}
              className="w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left"
              style={{
                background: isActive ? `${persona.color}08` : "transparent",
                borderBottom: "1px solid var(--border-primary)",
                borderLeft: isActive ? `3px solid ${persona.color}` : "3px solid transparent",
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
                  style={{ background: "#22c55e", borderColor: "var(--bg-primary)" }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[13px] font-semibold truncate"
                    style={{ color: isActive ? persona.color : "var(--text-primary)" }}
                  >
                    {persona.name}
                  </span>
                  <span className="text-[10px] flex-shrink-0 ml-2" style={{ color: "var(--text-tertiary)" }}>
                    {persona.role}
                  </span>
                </div>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>
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
          <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Bir mentor seç ve sohbete başla
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Soldan bir mentor seçin
          </p>
        </div>
      );
    }

    const msgs = getMessagesForPersona(selectedPersona.id);
    const isLoadingChat = loadingChats[selectedPersona.id];

    return (
      <div className="flex flex-col h-full" style={{ background: "var(--bg-secondary)" }}>
        {/* Chat Header */}
        <div
          className="flex-shrink-0 flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: "1px solid var(--border-primary)", background: "var(--bg-primary)" }}
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
            <h3 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
              {selectedPersona.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                Çevrimiçi · {selectedPersona.style}
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
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-msg-in`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 flex items-center mr-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-xs"
                        style={{ background: `${selectedPersona.color}15` }}
                      >
                        {selectedPersona.emoji}
                      </div>
                      {!msg.content && isLoading && (
                        <div className="ml-2"><TypingIndicator /></div>
                      )}
                    </div>
                  )}
                  {(msg.role === "user" || msg.content) && (
                  <div
                    className={`${msg.role === "user" ? "max-w-[80%]" : "max-w-[85%]"} rounded-2xl px-4 py-3 text-[13px] leading-relaxed`}
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
                      <ChatMessageRenderer content={msg.content} />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div
          className="flex-shrink-0 px-4 py-3"
          style={{ borderTop: "1px solid var(--border-primary)", background: "var(--bg-primary)" }}
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
                background: input.trim() && !isLoading ? selectedPersona.gradient : "var(--bg-tertiary)",
                boxShadow: input.trim() && !isLoading ? `0 0 12px ${selectedPersona.color}30` : "none",
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
      <div className="flex-shrink-0" style={{ width: 320, borderRight: "1px solid var(--border-primary)" }}>
        {renderLeftPanel()}
      </div>
      <div className="flex-1 min-w-0">{renderRightPanel()}</div>
    </div>
  );
}
