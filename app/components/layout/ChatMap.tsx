"use client";

import { useState, useEffect, useCallback } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatMapProps {
  onClose?: () => void;
  chatStyle?: string;
  isMobile?: boolean;
}

export default function ChatMap({ onClose, chatStyle, isMobile }: ChatMapProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  // Observe messages in the chat area to track which ones are visible
  useEffect(() => {
    // Find all user messages in the DOM
    const updateMessages = () => {
      const msgElements = document.querySelectorAll("[id^='msg-']");
      const found: ChatMessage[] = [];
      msgElements.forEach((el) => {
        const id = el.id.replace("msg-", "");
        if (id === "welcome") return;
        // Check if it's a user message (has justify-end class)
        const isUser = el.classList.contains("justify-end") || el.className.includes("justify-end");
        if (isUser) {
          const textEl = el.querySelector("p");
          const content = textEl?.textContent || "";
          if (content) {
            found.push({ id, role: "user", content });
          }
        }
      });
      setMessages(found);
    };

    // Run initially and set up a MutationObserver for new messages
    updateMessages();
    const observer = new MutationObserver(updateMessages);
    const chatContainer = document.querySelector("[class*='overflow-y-auto']");
    if (chatContainer) {
      observer.observe(chatContainer, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, [chatStyle]);

  // Track which message is currently visible
  useEffect(() => {
    if (messages.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace("msg-", "");
          setActiveMessageId(id);
        }
      });
    }, observerOptions);

    messages.forEach((msg) => {
      const el = document.getElementById(`msg-${msg.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [messages]);

  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveMessageId(messageId);
    }
  }, []);

  const truncate = (text: string, maxLen: number = 40) => {
    return text.length > maxLen ? text.substring(0, maxLen) + "..." : text;
  };

  return (
    <div className={isMobile ? "h-full overflow-y-auto p-3" : "chat-map"}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded-md"
            style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
            Chat Map
          </h3>
        </div>
        {onClose && (
          <button onClick={onClose}
            className="flex items-center justify-center w-6 h-6 rounded-md transition-all hover:bg-[var(--bg-tertiary)]"
            style={{ color: "var(--text-tertiary)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Message List */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-3"
            style={{ background: "var(--bg-tertiary)" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ color: "var(--text-tertiary)" }}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            Henuz mesaj yok
          </p>
          <p className="text-[10px] mt-1" style={{ color: "var(--text-tertiary)", opacity: 0.6 }}>
            Sohbet basladiginda mesajlar burada gorunecek
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {messages.map((msg, index) => (
            <button
              key={msg.id}
              onClick={() => scrollToMessage(msg.id)}
              className={`chat-map-item w-full text-left ${activeMessageId === msg.id ? "active" : ""}`}
            >
              <div className="chat-map-item-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="chat-map-item-text">{truncate(msg.content)}</p>
                <p className="text-[9px] mt-0.5" style={{ color: "var(--text-tertiary)", opacity: 0.7 }}>
                  Mesaj {index + 1}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
