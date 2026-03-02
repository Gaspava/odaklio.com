"use client";

import { useState, useRef, useEffect } from "react";
import { IconSend } from "../icons/Icons";

/* ===== PERSONAS ===== */
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

const personas: Persona[] = [
  {
    id: "coach",
    name: "Ders Koçu",
    emoji: "🎓",
    role: "Akademik Danışman",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    greeting: "Merhaba! Ben senin ders koçunum. Çalışma planı oluşturmak, konuları derinlemesine anlamak veya sınava hazırlanmak konusunda yanındayım. Bugün hangi konuda çalışmak istersin?",
    style: "Akademik, yapılandırılmış ve teşvik edici",
  },
  {
    id: "psych",
    name: "Psikolog",
    emoji: "🧠",
    role: "Ruhsal Destek",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
    greeting: "Merhaba, nasıl hissediyorsun bugün? Sınav stresi, motivasyon kaybı ya da sadece konuşmak istediğin bir şey varsa buradayım. Her duygu önemli ve geçerli.",
    style: "Empatik, anlayışlı ve destekleyici",
  },
  {
    id: "buddy",
    name: "Kanka",
    emoji: "😎",
    role: "Çalışma Arkadaşı",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    greeting: "Selaaam! Naber, bugün ne çalışıyoruz? Birlikte çalışmak daha eğlenceli! Takılsan sormaktan çekinme, birlikte çözeriz.",
    style: "Samimi, eğlenceli ve motive edici",
  },
  {
    id: "expert",
    name: "Uzman",
    emoji: "🔬",
    role: "Konu Uzmanı",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
    greeting: "Hoş geldiniz. Herhangi bir konuda derinlemesine bilgi, detaylı açıklama veya ileri düzey sorularınız için hazırım. Hangi alanda araştırma yapmak istersiniz?",
    style: "Detaylı, bilimsel ve analitik",
  },
];

interface Message {
  id: number;
  role: "user" | "mentor";
  text: string;
}

/* ===== MENTOR PAGE ===== */
export default function MentorPage() {
  const [activePersona, setActivePersona] = useState<Persona>(personas[0]);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, role: "mentor", text: personas[0].greeting },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePersonaChange = (persona: Persona) => {
    setActivePersona(persona);
    setMessages([{ id: 1, role: "mentor", text: persona.greeting }]);
    setInput("");
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulated mentor reply
    setTimeout(() => {
      const replies: Record<string, string> = {
        coach: "Güzel bir soru! Bu konuda şöyle bir yaklaşım önerebilirim: Önce temel kavramları gözden geçirelim, sonra pratik sorularla pekiştirelim. Adım adım ilerleyelim.",
        psych: "Seni anlıyorum, bu tür duygular gayet normal. Kendine nazik olmayı unutma. Biraz derin nefes al ve bir adım geri çekilip duruma yeniden bakalım.",
        buddy: "Haa anladım! Bak şimdi, bunu düşünmenin en kolay yolu şöyle: basitçe parçalara ayır ve teker teker çöz. Takıldığın yeri söyle birlikte bakalım!",
        expert: "Bu konuda literatürde birkaç farklı yaklaşım bulunmaktadır. En kabul gören teori şöyle açıklar: temel prensipleri anlamak için önce varsayımları incelememiz gerekir.",
      };
      const mentorMsg: Message = {
        id: Date.now() + 1,
        role: "mentor",
        text: replies[activePersona.id] || "Anlıyorum, devam edelim.",
      };
      setMessages((prev) => [...prev, mentorMsg]);
    }, 800);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Persona Selector */}
      <div
        className="flex-shrink-0 px-3 sm:px-4 py-3"
        style={{ borderBottom: "1px solid var(--border-primary)" }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {personas.map((persona) => {
              const isActive = activePersona.id === persona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaChange(persona)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all active:scale-95 flex-shrink-0"
                  style={{
                    background: isActive ? `${persona.color}15` : "var(--bg-tertiary)",
                    border: isActive ? `1.5px solid ${persona.color}40` : "1.5px solid transparent",
                    boxShadow: isActive ? `0 0 12px ${persona.color}15` : "none",
                  }}
                >
                  <span className="text-lg">{persona.emoji}</span>
                  <div className="text-left">
                    <span
                      className="text-[11px] font-bold block leading-tight"
                      style={{ color: isActive ? persona.color : "var(--text-primary)" }}
                    >
                      {persona.name}
                    </span>
                    <span className="text-[9px] leading-tight" style={{ color: "var(--text-tertiary)" }}>
                      {persona.role}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Persona Info Card */}
          <div
            className="rounded-2xl p-4 mb-4 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <span className="text-3xl mb-2 block">{activePersona.emoji}</span>
            <h3 className="text-base font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
              {activePersona.name}
            </h3>
            <p className="text-[11px] mb-2" style={{ color: "var(--text-tertiary)" }}>
              {activePersona.role}
            </p>
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold"
              style={{ background: `${activePersona.color}12`, color: activePersona.color }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: activePersona.color }}
              />
              Çevrimiçi
            </span>
            <p className="text-[10px] mt-2 px-4 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
              Tarz: {activePersona.style}
            </p>
          </div>

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-msg-in`}
            >
              {msg.role === "mentor" && (
                <div
                  className="flex-shrink-0 flex items-end mr-2"
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs"
                    style={{ background: `${activePersona.color}15` }}
                  >
                    {activePersona.emoji}
                  </div>
                </div>
              )}
              <div
                className="max-w-[80%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed"
                style={
                  msg.role === "user"
                    ? {
                        background: activePersona.gradient,
                        color: "white",
                        borderRadius: "20px 20px 4px 20px",
                        boxShadow: `0 0 12px ${activePersona.color}25`,
                      }
                    : {
                        background: "var(--bg-card)",
                        color: "var(--text-primary)",
                        borderRadius: "4px 20px 20px 20px",
                        border: "1px solid var(--border-primary)",
                      }
                }
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div
        className="flex-shrink-0 px-3 sm:px-4 py-3"
        style={{
          borderTop: "1px solid var(--border-primary)",
          background: "var(--bg-secondary)",
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`${activePersona.name}'a bir mesaj yaz...`}
            className="input"
            style={{ height: 42, fontSize: 13, padding: "0 14px" }}
          />
          <button
            onClick={handleSend}
            className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl text-white transition-all active:scale-95"
            style={{
              background: activePersona.gradient,
              boxShadow: `0 0 12px ${activePersona.color}30`,
              opacity: input.trim() ? 1 : 0.5,
            }}
          >
            <IconSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
