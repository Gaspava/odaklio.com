"use client";
import { useState, useRef, useEffect } from "react";

interface MentorMessage {
  id: string;
  role: "mentor" | "user";
  content: string;
  type?: "tip" | "quiz" | "motivation" | "normal";
}

const INITIAL_MESSAGES: MentorMessage[] = [
  {
    id: "m1",
    role: "mentor",
    content: "Merhaba! Ben senin kisisel mentor botuyum. Calisma rutinini takip ediyorum ve sana ozel tavsiyeler veriyorum.",
    type: "normal",
  },
  {
    id: "m2",
    role: "mentor",
    content: "💡 Ipucu: Bugun henuz Pomodoro baslatamadiniz. Gunluk 4 seans hedefine ulasmak icin simdi baslamanizi oneririm!",
    type: "tip",
  },
  {
    id: "m3",
    role: "mentor",
    content: "📝 Mini Quiz: Fotonun kilesiz bir parcacik oldugunu biliyor muydunuz? Bir fotonun enerjisi E = hf formuluyle hesaplanir. h nedir?",
    type: "quiz",
  },
];

const MENTOR_RESPONSES = [
  "Bu harika bir soru! Arastirmalarima gore en etkili ogrenme yontemi aktif tekrar ve aralikli tekrar birlesimi. Pomodoro teknigiyle birlikte kullanmanı oneririm.",
  "Calismana devam et! Unutma ki her gun 30 dakika bile olsa duzenli calisma, haftada bir gun 5 saatlik calistirmadan daha etkili.",
  "Bu konuyu daha iyi anlamak icin zihin haritasi olusturmanı oneririm. Gorsel ogrenme, metin okumaya gore %65 daha etkili olabiliyor.",
  "Harika ilerliyorsun! Bu haftaki calisma serilerin etkileyici. Kendini odullendir ve kisa bir mola ver.",
];

const SUGGESTED_TOPICS = [
  "Verimli calisma teknikleri",
  "Hafiza guclendirme yontemleri",
  "Sinav stresi ile basa cikma",
  "Ogrenme stilimi kesfet",
];

export default function MentorBot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<MentorMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: MentorMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply: MentorMessage = {
        id: (Date.now() + 1).toString(),
        role: "mentor",
        content: MENTOR_RESPONSES[Math.floor(Math.random() * MENTOR_RESPONSES.length)],
        type: "normal",
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const typeColor = (type?: string) => {
    switch (type) {
      case "tip": return "#fdcb6e";
      case "quiz": return "#0984e3";
      case "motivation": return "#00b894";
      default: return "var(--accent)";
    }
  };

  return (
    <div
      className="flex h-full w-[300px] shrink-0 flex-col border-l"
      style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
            style={{ background: "linear-gradient(135deg, #00b894, #0984e3)" }}
          >
            🎓
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Mentor</div>
            <div className="text-[10px]" style={{ color: "#00b894" }}>Cevrimici</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed"
                style={{
                  backgroundColor:
                    msg.role === "user"
                      ? "var(--accent)"
                      : "var(--bg-tertiary)",
                  color:
                    msg.role === "user"
                      ? "#fff"
                      : "var(--text-primary)",
                  borderLeft: msg.role === "mentor" && msg.type !== "normal"
                    ? `3px solid ${typeColor(msg.type)}`
                    : "none",
                  borderTopLeftRadius: msg.role === "mentor" ? "4px" : undefined,
                  borderTopRightRadius: msg.role === "user" ? "4px" : undefined,
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div
                className="flex items-center gap-1 rounded-2xl px-3 py-2"
                style={{ backgroundColor: "var(--bg-tertiary)" }}
              >
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="inline-block h-1.5 w-1.5 animate-bounce rounded-full"
                    style={{ backgroundColor: "var(--text-tertiary)", animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      {/* Suggested topics */}
      <div className="border-t px-3 py-2" style={{ borderColor: "var(--border-color)" }}>
        <div className="mb-1 text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          Onerilr:
        </div>
        <div className="flex flex-wrap gap-1">
          {SUGGESTED_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => { setInput(topic); }}
              className="rounded-lg px-2 py-1 text-[10px] transition-all hover:scale-[1.02]"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t p-3" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Mentora sor..."
            className="flex-1 rounded-xl border px-3 py-2 text-xs outline-none"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #00b894, #0984e3)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
