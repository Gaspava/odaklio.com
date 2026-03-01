"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend, IconMic, IconHelp } from "../icons/Icons";
import TextSelectionPopup from "./TextSelectionPopup";
import SpeedReadingOverlay from "../speed-reading/SpeedReadingOverlay";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isRichContent?: boolean;
}

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Merhaba! Ben Odaklio AI, senin kişisel öğrenme asistanınım. Herhangi bir konuda soru sorabilir, metin seçerek hızlı okuma yapabilir veya derinlemesine anlayış isteyebilirsin.\n\nBugün ne öğrenmek istiyorsun?",
  timestamp: new Date(),
};

async function streamChat(
  messages: { role: string; content: string }[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const data = await res.json();
    onError(data.error || "Bir hata oluştu.");
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) {
    onError("Stream okunamadı.");
    return;
  }

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
      const payload = trimmed.slice(6);
      if (payload === "[DONE]") {
        onDone();
        return;
      }
      try {
        const parsed = JSON.parse(payload);
        if (parsed.error) {
          onError(parsed.error);
          return;
        }
        if (parsed.text) {
          onChunk(parsed.text);
        }
      } catch {
        // skip malformed JSON
      }
    }
  }
  onDone();
}

export default function MainChat() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [speedReadText, setSpeedReadText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const streamingMsgId = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle text selection in AI responses
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length < 3) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectionPopup({
      x: rect.left + rect.width / 2,
      y: rect.top,
      text: selectedText,
    });
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => document.removeEventListener("mouseup", handleTextSelection);
  }, [handleTextSelection]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-selection-popup]")) {
        setSelectionPopup(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
        timestamp: new Date(),
      };

      const aiMsgId = (Date.now() + 1).toString();
      streamingMsgId.current = aiMsgId;

      const aiPlaceholder: Message = {
        id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
      setInput("");
      setIsLoading(true);

      // Build chat history (exclude welcome & current placeholder)
      const chatHistory = [
        ...messages.filter((m) => m.id !== "welcome"),
        userMsg,
      ].map((m) => ({ role: m.role, content: m.content }));

      streamChat(
        chatHistory,
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, content: m.content + chunk } : m
            )
          );
        },
        () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId ? { ...m, isRichContent: true } : m
            )
          );
          streamingMsgId.current = null;
          setIsLoading(false);
        },
        (err) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? { ...m, content: `Hata: ${err}`, isRichContent: true }
                : m
            )
          );
          streamingMsgId.current = null;
          setIsLoading(false);
        }
      );
    },
    [isLoading, messages]
  );

  const handleSend = () => {
    sendMessage(input);
  };

  const handleSelectionAction = (
    action: "didnt-understand" | "what-is-this" | "speed-read"
  ) => {
    if (!selectionPopup) return;
    const selectedText = selectionPopup.text;

    if (action === "speed-read") {
      setSpeedReadText(selectedText);
      setSelectionPopup(null);
      return;
    }

    const prompts = {
      "didnt-understand": `"${selectedText}" kısmını anlamadım. Daha basit ve adım adım açıklar mısın?`,
      "what-is-this": `"${selectedText}" nedir? Kısaca tanımla ve örnekle açıkla.`,
    };

    setSelectionPopup(null);
    sendMessage(prompts[action]);
  };

  const quickPrompts = [
    "Kuantum fiziği hakkında bilgi ver",
    "İntegral nasıl çözülür?",
    "Newton yasalarını açıkla",
  ];

  return (
    <>
      <div className="flex flex-col h-full" ref={chatAreaRef}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                {msg.role === "assistant" && (
                  <div
                    className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg mr-3 mt-1 text-white text-[10px] font-bold"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    O
                  </div>
                )}

                <div
                  className={`group relative max-w-[85%] ${msg.role === "user" ? "max-w-[70%]" : ""}`}
                >
                  <div
                    className="rounded-2xl px-4 py-3"
                    style={{
                      background:
                        msg.role === "user"
                          ? "var(--accent-primary)"
                          : "var(--bg-card)",
                      color:
                        msg.role === "user"
                          ? "white"
                          : "var(--text-primary)",
                      border:
                        msg.role === "assistant"
                          ? "1px solid var(--border-primary)"
                          : "none",
                      borderRadius:
                        msg.role === "user"
                          ? "20px 20px 4px 20px"
                          : "20px 20px 20px 4px",
                    }}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose-content text-sm leading-relaxed whitespace-pre-line select-text">
                        {msg.content || (
                          <span
                            className="inline-flex items-center gap-1.5"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            <span className="inline-block h-2 w-2 rounded-full animate-pulse" style={{ background: "var(--accent-primary)" }} />
                            Düşünüyorum...
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>

                  {/* Hover "Anlamadım" for entire AI message */}
                  {msg.role === "assistant" && msg.isRichContent && (
                    <button
                      onClick={() => sendMessage("Bu açıklamayı anlamadım, daha basit anlatır mısın?")}
                      className="absolute -bottom-2 right-4 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-primary)",
                        color: "var(--accent-warning)",
                        boxShadow: "var(--shadow-md)",
                      }}
                    >
                      <IconHelp size={10} />
                      Anlamadım
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (show when few messages) */}
          {messages.length <= 1 && (
            <div className="max-w-2xl mx-auto mt-8">
              <p
                className="text-xs font-medium mb-3 text-center"
                style={{ color: "var(--text-tertiary)" }}
              >
                Hızlı başla
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="rounded-full px-4 py-2 text-xs font-medium transition-all hover:scale-[1.02]"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex-shrink-0 px-4 pb-4">
          <div
            className="max-w-2xl mx-auto flex items-center gap-2 rounded-2xl px-4 py-2"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <button
              onClick={() => setIsListening(!isListening)}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all"
              style={{
                background: isListening ? "var(--accent-danger)" : "var(--bg-tertiary)",
                color: isListening ? "white" : "var(--text-tertiary)",
              }}
            >
              <IconMic size={14} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Mesajını yaz veya sesli konuş..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-primary)" }}
              disabled={isLoading}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30"
              style={{
                background: input.trim() && !isLoading ? "var(--gradient-primary)" : "var(--bg-tertiary)",
                color: input.trim() && !isLoading ? "white" : "var(--text-tertiary)",
              }}
            >
              <IconSend size={14} />
            </button>
          </div>

          <p
            className="text-center text-[10px] mt-2"
            style={{ color: "var(--text-tertiary)" }}
          >
            Metni seç → Anlamadım · Bu nedir? · Hızlı Oku
          </p>
        </div>
      </div>

      {/* Text Selection Popup */}
      {selectionPopup && (
        <div data-selection-popup>
          <TextSelectionPopup
            x={selectionPopup.x}
            y={selectionPopup.y}
            selectedText={selectionPopup.text}
            onAction={handleSelectionAction}
            onClose={() => setSelectionPopup(null)}
          />
        </div>
      )}

      {/* Speed Reading Overlay */}
      {speedReadText && (
        <SpeedReadingOverlay
          text={speedReadText}
          onClose={() => setSpeedReadText(null)}
        />
      )}
    </>
  );
}
