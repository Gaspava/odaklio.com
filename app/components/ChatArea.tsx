"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  parallelThread?: Message[];
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? "#e17055" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function BotAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--accent-gradient)" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8" />
        <rect x="2" y="8" width="20" height="14" rx="2" />
        <path d="M6 16h.01" />
        <path d="M18 16h.01" />
        <path d="M10 20v-4h4v4" />
      </svg>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-2 py-3">
      <BotAvatar />
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm px-4 py-3" style={{ backgroundColor: "var(--bg-message-bot)" }}>
        {[0, 150, 300].map((d) => (
          <span key={d} className="inline-block h-2 w-2 animate-bounce rounded-full" style={{ backgroundColor: "var(--text-tertiary)", animationDelay: `${d}ms` }} />
        ))}
      </div>
    </div>
  );
}

function RenderContent({ content }: { content: string }) {
  const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);

  return (
    <div>
      {parts.map((part, i) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const formula = part.slice(2, -2);
          return (
            <div key={i} className="my-3 flex justify-center">
              <div
                className="rounded-xl px-6 py-3 font-mono text-sm italic"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--accent)",
                  border: "1px solid var(--border-color)",
                }}
              >
                {formula}
              </div>
            </div>
          );
        }
        if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
          const formula = part.slice(1, -1);
          return (
            <span key={i} className="mx-1 rounded px-1.5 py-0.5 font-mono text-xs italic" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--accent)" }}>
              {formula}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}

const WELCOME_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    role: "bot",
    content: "Merhaba! Ben Odaklio AI asistaniyim. Sana ogrenme surecinde yardimci olabilirim. Sorularini sor, metinleri analiz edeyim, flash kartlar onereyim veya konulari gorsellestireyim!",
    timestamp: new Date(),
  },
];

const SUGGESTION_BOXES = [
  { icon: "🔬", text: "Kuantum mekanigi nedir?", category: "Fizik" },
  { icon: "🧬", text: "DNA replikasyonunu acikla", category: "Biyoloji" },
  { icon: "📐", text: "Turev nasil alinir?", category: "Matematik" },
  { icon: "⚗️", text: "Periyodik tabloyu acikla", category: "Kimya" },
];

const RELATED_QUESTIONS = [
  "Bu konuda flash kart olustur",
  "Daha detayli acikla",
  "Zihin haritasi olustur",
  "Sinav sorusu sor",
];

export default function ChatArea() {
  const [messages, setMessages] = useState<Message[]>(WELCOME_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [parallelOpen, setParallelOpen] = useState<string | null>(null);
  const [parallelInput, setParallelInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("odaklio-search-history");
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const saveSearch = (query: string) => {
    const updated = [query, ...searchHistory.filter((s) => s !== query)].slice(0, 50);
    setSearchHistory(updated);
    localStorage.setItem("odaklio-search-history", JSON.stringify(updated));
  };

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;

    saveSearch(msg);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setShowSuggestions(false);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: getBotResponse(msg),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      setInput((prev) => prev + (prev ? " " : "") + "Kuantum fizigi hakkinda bilgi ver");
    } else {
      setRecording(true);
    }
  };

  const handleNotUnderstand = (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg) return;
    handleSend("Anlamadim, daha basit aciklar misin? Onceki mesajini daha kolay anlasilir sekilde anlat.");
  };

  const sendParallelQuestion = (msgId: string) => {
    if (!parallelInput.trim()) return;
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          const thread = m.parallelThread || [];
          return {
            ...m,
            parallelThread: [
              ...thread,
              { id: `${Date.now()}-pq`, role: "user" as const, content: parallelInput, timestamp: new Date() },
              { id: `${Date.now()}-pa`, role: "bot" as const, content: "Bu konuyla ilgili daha detayli aciklama: " + parallelInput.slice(0, 30) + " hakkinda ek bilgi. Bu kavram daha genis bir baglamda dusunulmelidir.", timestamp: new Date() },
            ],
          };
        }
        return m;
      })
    );
    setParallelInput("");
    setParallelOpen(null);
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden" style={{ backgroundColor: "var(--bg-chat)" }}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-1">
          {messages.map((msg) => (
            <div key={msg.id}>
              <div
                className={`group relative flex items-start gap-3 px-2 py-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                onMouseEnter={() => msg.role === "bot" && setHoveredMsg(msg.id)}
                onMouseLeave={() => setHoveredMsg(null)}
              >
                {msg.role === "bot" && <BotAvatar />}
                {msg.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-semibold" style={{ backgroundColor: "var(--accent-light)", color: "var(--accent)" }}>
                    S
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-line ${msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                  style={{
                    backgroundColor: msg.role === "user" ? "var(--bg-message-user)" : "var(--bg-message-bot)",
                    color: msg.role === "user" ? "var(--text-on-accent)" : "var(--text-primary)",
                  }}
                >
                  <RenderContent content={msg.content} />
                </div>

                {/* Hover actions for bot messages */}
                {msg.role === "bot" && hoveredMsg === msg.id && (
                  <div className="absolute bottom-0 left-12 z-10 flex gap-1" style={{ transform: "translateY(50%)" }}>
                    <button
                      onClick={() => handleNotUnderstand(msg.id)}
                      className="rounded-lg px-2 py-1 text-[10px] font-medium shadow-lg transition-all hover:scale-105"
                      style={{ backgroundColor: "var(--bg-card)", color: "#e17055", border: "1px solid var(--border-color)" }}
                    >
                      Anlamadim
                    </button>
                    <button
                      onClick={() => setParallelOpen(parallelOpen === msg.id ? null : msg.id)}
                      className="rounded-lg px-2 py-1 text-[10px] font-medium shadow-lg transition-all hover:scale-105"
                      style={{ backgroundColor: "var(--bg-card)", color: "var(--accent)", border: "1px solid var(--border-color)" }}
                    >
                      Soru Sor
                    </button>
                    <button
                      className="rounded-lg px-2 py-1 text-[10px] font-medium shadow-lg transition-all hover:scale-105"
                      style={{ backgroundColor: "var(--bg-card)", color: "#00b894", border: "1px solid var(--border-color)" }}
                    >
                      Kopyala
                    </button>
                  </div>
                )}
              </div>

              {/* Parallel question thread */}
              {parallelOpen === msg.id && (
                <div className="mb-3 ml-14 rounded-xl p-3" style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-color)" }}>
                  <div className="mb-2 text-[10px] font-semibold" style={{ color: "var(--accent)" }}>
                    Paralel Soru
                  </div>
                  {msg.parallelThread?.map((pm) => (
                    <div key={pm.id} className={`mb-1 text-xs ${pm.role === "user" ? "text-right" : ""}`}>
                      <span
                        className="inline-block rounded-lg px-2 py-1"
                        style={{
                          backgroundColor: pm.role === "user" ? "var(--accent)" : "var(--bg-secondary)",
                          color: pm.role === "user" ? "#fff" : "var(--text-primary)",
                        }}
                      >
                        {pm.content}
                      </span>
                    </div>
                  ))}
                  <div className="mt-2 flex gap-2">
                    <input
                      value={parallelInput}
                      onChange={(e) => setParallelInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendParallelQuestion(msg.id)}
                      placeholder="Bu kisim hakkinda sor..."
                      className="flex-1 rounded-lg border px-2 py-1.5 text-xs outline-none"
                      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}
                    />
                    <button
                      onClick={() => sendParallelQuestion(msg.id)}
                      className="rounded-lg px-3 py-1.5 text-xs text-white"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      Sor
                    </button>
                  </div>
                </div>
              )}

              {/* Related questions after bot messages */}
              {msg.role === "bot" && msg.id !== "welcome-1" && (
                <div className="mb-2 ml-14 flex flex-wrap gap-1.5">
                  {RELATED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="rounded-lg px-2.5 py-1 text-[11px] transition-all hover:scale-[1.02]"
                      style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestion boxes */}
      {showSuggestions && messages.length <= 1 && (
        <div className="mx-auto w-full max-w-3xl px-4 pb-3">
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTION_BOXES.map((s) => (
              <button
                key={s.text}
                onClick={() => handleSend(s.text)}
                className="flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:scale-[1.01]"
                style={{ backgroundColor: "var(--bg-tertiary)", border: "1px solid var(--border-light)" }}
              >
                <span className="text-xl">{s.icon}</span>
                <div>
                  <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{s.text}</div>
                  <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{s.category}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            {["Sinav sorulari coz", "Konu ozeti cikar", "Benzer konular"].map((r) => (
              <button
                key={r}
                onClick={() => handleSend(r)}
                className="flex-1 rounded-xl py-2.5 text-center text-xs font-medium transition-all hover:scale-[1.01]"
                style={{ background: "var(--accent-gradient)", color: "#fff", opacity: 0.85 }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="sticky bottom-0 px-4 pb-6 pt-2" style={{ backgroundColor: "var(--bg-primary)" }}>
        <div className="mx-auto max-w-3xl">
          <div
            className="flex items-end gap-2 rounded-2xl border p-2"
            style={{
              backgroundColor: "var(--bg-input)",
              borderColor: recording ? "#e17055" : "var(--border-color)",
              boxShadow: recording ? "0 0 0 2px rgba(225, 112, 85, 0.2)" : "var(--shadow-md)",
            }}
          >
            <button
              onClick={toggleRecording}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all"
              style={{
                backgroundColor: recording ? "#e1705522" : "var(--bg-tertiary)",
                color: recording ? "#e17055" : "var(--text-tertiary)",
              }}
            >
              <MicIcon active={recording} />
            </button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={recording ? "Dinleniyor..." : "Mesajinizi yazin... (LaTeX icin $formul$ kullanin)"}
              rows={1}
              className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] leading-relaxed outline-none placeholder:text-[var(--text-tertiary)]"
              style={{ color: "var(--text-primary)" }}
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition-all disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: input.trim() ? "var(--accent-gradient)" : "var(--bg-tertiary)",
                color: input.trim() ? "var(--text-on-accent)" : "var(--text-tertiary)",
              }}
            >
              <SendIcon />
            </button>
          </div>
          <p className="mt-2 text-center text-xs" style={{ color: "var(--text-tertiary)" }}>
            Odaklio AI | LaTeX: $E=mc^2$ | Sesli komut destegi
          </p>
        </div>
      </div>
    </div>
  );
}

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("merhaba") || lower.includes("selam") || lower.includes("hey")) {
    return "Merhaba! Size nasil yardimci olabilirim? Herhangi bir konu hakkinda soru sorabilir, flash kart olusturabilir veya calisma plani yapabiliriz.";
  }
  if (lower.includes("kuantum")) {
    return "Kuantum Mekanigi\n\nKuantum mekanigi, atom alti parcaciklarin davranislarini inceleyen fizik dalidir.\n\nTemel ilkeler:\n\u2022 Dalga-parcacik ikiligi: Parcaciklar hem dalga hem parcacik ozelligi gosterir\n\u2022 Heisenberg Belirsizlik Ilkesi: Konum ve momentum ayni anda kesin olarak bilinemez\n\u2022 Kuantum dolanikligi: Iki parcacigin birbirine bagli olmasi\n\nTemel formul:\n$$E = hf$$\n\nBurada $h$ Planck sabiti (6.626 x 10^-34 J\u00b7s) ve $f$ frekansdir.";
  }
  if (lower.includes("dna") || lower.includes("replikasyon")) {
    return "DNA Replikasyonu\n\nDNA replikasyonu, hucrede DNA'nin kendini kopyalama surecidir.\n\nAsamalar:\n1. Helikaz enzimi cift sarmali acar\n2. Primaz enzimi RNA primeri sentezler\n3. DNA polimeraz III yeni zinciri sentezler\n4. DNA polimeraz I primerleri kaldirir\n5. DNA ligaz parcalari birlestirir\n\nGorsellestirme:\n5' --------> 3' (Oncul zincir - surekli sentez)\n3' <-------- 5' (Gecikme zinciri - Okazaki parcalari)";
  }
  if (lower.includes("turev") || lower.includes("matematik") || lower.includes("formul")) {
    return "Turev Alma Kurallari\n\nTemel kurallar:\n\n1. Sabit Kural: $d/dx [c] = 0$\n2. Kuvvet Kurali: $d/dx [x^n] = nx^(n-1)$\n3. Carpim Kurali: $d/dx [f*g] = f'g + fg'$\n4. Bolme Kurali: $d/dx [f/g] = (f'g - fg') / g^2$\n5. Zincir Kurali: $d/dx [f(g(x))] = f'(g(x)) * g'(x)$\n\nOrnek:\n$$f(x) = 3x^2 + 2x - 5$$\n$$f'(x) = 6x + 2$$";
  }
  if (lower.includes("flash kart")) {
    return "Flash kart sistemi hazirliyorum!\n\nSon konusmalarina dayanarak su konularda kart onerebilirim:\n\n\u2022 Kuantum Mekanigi - 12 kart\n\u2022 DNA Yapisi - 8 kart\n\u2022 Turev Kurallari - 15 kart\n\nSol panelden Flash Kartlar sekmesine giderek kartlari gorebilirsin!";
  }
  if (lower.includes("zihin haritasi") || lower.includes("mind map")) {
    return "Zihin haritasi aracini kullanarak konulari gorsel olarak organize edebilirsin!\n\nSol panelden 'Zihin Haritasi' sekmesine tikla. Dugumleri surekleyerek konumlandir, yeni dugumler ekle ve aralarinda baglantilar olustur.\n\nOnerilen baslangic konulari:\n\u2022 Fizik alt dallari\n\u2022 Biyoloji hucre yapisi\n\u2022 Matematik temel kavramlar";
  }
  if (lower.includes("anlamadim") || lower.includes("basit")) {
    return "Tabii, daha basit anlatayim!\n\nBir onceki konuyu gunluk hayattan bir ornekle aciklayalim:\n\nDusun ki bir topu havaya atiyorsun. Top yukselirken yavasliyor, en tepe noktasinda duruyor ve sonra dusmeye basliyor. Iste bu hareket, fizik kurallarina gore tahmin edilebilir!\n\nDaha fazla ornek ister misin?";
  }
  if (lower.includes("sinav") || lower.includes("soru")) {
    return "Sinav Sorusu\n\nSoru: Bir cisim $v = 20 m/s$ hizla hareket ederken $a = -4 m/s^2$ ivme ile yavasliyor. Cisim kac saniyede durur?\n\nA) 3 s\nB) 4 s\nC) 5 s (Dogru)\nD) 6 s\n\nCozum:\n$$v = v0 + at$$\n$$0 = 20 + (-4)t$$\n$$t = 5 s$$";
  }
  if (lower.includes("ozet") || lower.includes("konu ozeti")) {
    return "Konu Ozeti\n\nSon konustugumuz konularin ozeti:\n\nKuantum Mekanigi:\n\u2022 Dalga-parcacik ikiligi\n\u2022 Heisenberg belirsizlik ilkesi\n\u2022 $E = hf$ formulu\n\nTemel Kavramlar:\n\u2022 Enerji korunumu\n\u2022 Kuvvet ve hareket iliskisi\n\u2022 $F = ma$ (Newton'un 2. yasasi)";
  }
  if (lower.includes("benzer konu")) {
    return "Benzer Konular\n\nSu konulara da bakmak isteyebilirsin:\n\n1. Ozel Gorelilik Teorisi - Isik hizi ve zaman genlemesi\n2. Atom Fizigi - Atom modelleri ve spektrum\n3. Nukleer Fizik - Cekirdek yapisi ve radyoaktivite\n4. Kati Hal Fizigi - Kristal yapilari\n\nHangi konuyu incelemek istersin?";
  }
  if (lower.includes("tesekkur") || lower.includes("sagol")) {
    return "Rica ederim! Baska bir sorunuz olursa yardimci olmaktan mutluluk duyarim. Sol panelden Pomodoro'yu baslatip odaklanarak calisabilirsin!";
  }
  if (lower.includes("periyodik tablo") || lower.includes("kimya")) {
    return "Periyodik Tablo\n\nElementlerin periyodik tablodaki dizilisi:\n\n\u2022 Periyot: Yatay satirlar (1-7), elektron katman sayisini gosterir\n\u2022 Grup: Dikey sutunlar (1-18), degerlik elektron sayisini belirler\n\u2022 Metal -> Ametal -> Soygazlar\n\nOnemli elementler:\n$H$ (Hidrojen) - En hafif element\n$He$ (Helyum) - Soygaz\n$C$ (Karbon) - Organik yasamin temeli\n$Fe$ (Demir) - En cok kullanilan metal\n\n$$Atom No = Proton Sayisi = Elektron Sayisi$$";
  }

  return "Anliyorum. Bu konuda size daha detayli yardimci olabilirim. Su seceneklerden birini tercih edebilirsiniz:\n\n\u2022 Konuyu daha detayli aciklamamı ister misiniz?\n\u2022 Flash kart olusturmami ister misiniz?\n\u2022 Zihin haritasi cizmemi ister misiniz?\n\u2022 Sinav sorusu hazirlamamı ister misiniz?";
}
