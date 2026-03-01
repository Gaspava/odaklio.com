"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { IconSend, IconMic } from "../icons/Icons";
import TextSelectionPopup from "./TextSelectionPopup";
import SpeedReadingOverlay from "../speed-reading/SpeedReadingOverlay";
import ChatMessage from "./ChatMessage";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface MainChatProps {
  isMobile?: boolean;
}

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "Merhaba! Ben **Odaklio AI**, senin kisisel ogrenme asistaninim.\n\nHerhangi bir konuda soru sorabilir, metin secerek hizli okuma yapabilir veya derinlemesine anlayis isteyebilirsin.\n\n:::tip Baslarken\nMetin sec → *Anlamadim* · *Bu nedir?* · *Hizli Oku* seceneklerini kullanabilirsin.\n:::\n\nBugün ne ogrenmek istiyorsun?",
  timestamp: new Date(),
};

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

export default function MainChat({ isMobile = false }: MainChatProps) {
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    document.addEventListener("selectionchange", () => {
      setTimeout(handleTextSelection, 300);
    });
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
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

  const sendToAI = useCallback(
    async (userContent: string, allMessages: Message[]) => {
      setIsLoading(true);

      const aiMsgId = (Date.now() + 1).toString();
      const aiMsg: Message = {
        id: aiMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      const apiMessages = allMessages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: "user", content: userContent });

      try {
        await streamChat(
          apiMessages,
          (text) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId ? { ...m, content: m.content + text } : m
              )
            );
          },
          (error) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? { ...m, content: `:::danger Hata\n${error}\n:::` }
                  : m
              )
            );
          },
          () => {
            setIsLoading(false);
          }
        );
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Bilinmeyen hata";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMsgId
              ? {
                  ...m,
                  content: `:::danger Baglanti Hatasi\n${errorMsg}. Lutfen tekrar dene.\n:::`,
                }
              : m
          )
        );
        setIsLoading(false);
      }
    },
    []
  );

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg];
      sendToAI(input, prev);
      return updated;
    });

    setInput("");
    if (isMobile) {
      inputRef.current?.blur();
    }
  }, [input, isLoading, sendToAI, isMobile]);

  const handleDidntUnderstand = useCallback(
    (messageContent: string) => {
      const userContent = "Bu aciklamayi anlamadim, daha basit anlatir misin?";
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userContent,
        timestamp: new Date(),
      };
      setMessages((prev) => {
        const updated = [...prev, userMsg];
        sendToAI(userContent, prev);
        return updated;
      });
    },
    [sendToAI]
  );

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
      "didnt-understand": `"${selectedText}" kismini anlamadim. Daha basit ve adim adim aciklar misin?`,
      "what-is-this": `"${selectedText}" nedir? Kisaca tanimla ve ornekle acikla.`,
    };

    const userContent = prompts[action];
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };
    setMessages((prev) => {
      const updated = [...prev, userMsg];
      sendToAI(userContent, prev);
      return updated;
    });
    setSelectionPopup(null);
  };

  const quickPrompts = isMobile
    ? ["Kuantum fizigi", "Integral coz", "Newton yasalari"]
    : [
        "Kuantum fizigi hakkinda bilgi ver",
        "Integral nasil cozulur?",
        "Newton yasalarini acikla",
      ];

  return (
    <>
      <div className="flex flex-col h-full" ref={chatAreaRef}>
        {/* Messages Area */}
        <div
          className={`flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 ${
            isMobile ? "pb-2" : ""
          }`}
          style={{ background: "var(--gradient-mesh)" }}
        >
          <div className="max-w-2xl mx-auto space-y-5 sm:space-y-6">
            {messages.map((msg, idx) => (
              <ChatMessage
                key={msg.id}
                id={msg.id}
                role={msg.role}
                content={msg.content}
                isStreaming={isLoading}
                isLastMessage={idx === messages.length - 1}
                isMobile={isMobile}
                onDidntUnderstand={
                  msg.role === "assistant" && msg.id !== "welcome"
                    ? () => handleDidntUnderstand(msg.content)
                    : undefined
                }
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          {messages.length <= 1 && (
            <div className="max-w-2xl mx-auto mt-6 sm:mt-8 animate-fade-in">
              <p
                className="text-xs font-medium mb-3 text-center"
                style={{ color: "var(--text-tertiary)" }}
              >
                Hizli basla
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="rounded-full px-3 py-2 sm:px-4 text-xs font-medium transition-all active:scale-[0.97] animate-fade-in-scale"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-secondary)",
                      animationDelay: `${i * 100}ms`,
                      animationFillMode: "backwards",
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
        <div
          className={`flex-shrink-0 px-3 sm:px-4 ${
            isMobile ? "pb-2" : "pb-4"
          }`}
          style={{ background: "var(--bg-primary)" }}
        >
          <div
            className="max-w-2xl mx-auto flex items-center gap-2 rounded-2xl px-3 py-2 sm:px-4 transition-all"
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
                background: isListening
                  ? "var(--accent-danger)"
                  : "var(--bg-tertiary)",
                color: isListening ? "white" : "var(--text-tertiary)",
              }}
            >
              <IconMic size={14} />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={
                isLoading
                  ? "Yanit bekleniyor..."
                  : isMobile
                  ? "Mesajini yaz..."
                  : "Mesajini yaz veya sesli konus..."
              }
              disabled={isLoading}
              className="flex-1 bg-transparent text-[13px] sm:text-sm outline-none disabled:opacity-50"
              style={{ color: "var(--text-primary)" }}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all active:scale-90 disabled:opacity-30"
              style={{
                background:
                  input.trim() && !isLoading
                    ? "var(--gradient-primary)"
                    : "var(--bg-tertiary)",
                color:
                  input.trim() && !isLoading
                    ? "white"
                    : "var(--text-tertiary)",
              }}
            >
              <IconSend size={14} />
            </button>
          </div>

          {!isMobile && (
            <p
              className="text-center text-[10px] mt-2"
              style={{ color: "var(--text-tertiary)" }}
            >
              Metni sec → Anlamadim · Bu nedir? · Hizli Oku
            </p>
          )}
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
            isMobile={isMobile}
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
