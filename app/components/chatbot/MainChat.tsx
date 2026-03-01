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

const sampleResponses: Record<string, string> = {
  default:
    "Bu ilginç bir soru! Detaylı bir şekilde açıklayayım. İlgili kaynakları inceliyorum ve en uygun açıklamayı hazırlıyorum...",
  kuantum: `Kuantum mekaniği, atomaltı parçacıkların davranışlarını inceleyen fizik dalıdır. Klasik fizikten temel farkları şunlardır:

Süperpozisyon: Bir parçacık aynı anda birden fazla durumda bulunabilir. Schrödinger'in kedisi düşünce deneyinde olduğu gibi, gözlem yapılana kadar parçacık tüm olası durumların bir süperpozisyonundadır.

Dalga-Parçacık İkiliği: Işık ve madde hem dalga hem de parçacık özelliği gösterir. Bu, Young'ın çift yarık deneyiyle kanıtlanmıştır. Fotonlar yarıktan geçerken girişim deseni oluşturur.

Heisenberg Belirsizlik İlkesi: Bir parçacığın hem konumunu hem de momentumunu aynı anda kesin olarak ölçmek imkansızdır. Bu, ölçüm cihazının yetersizliğinden değil, doğanın temel bir özelliğinden kaynaklanır.

Kuantum Dolanıklık: İki parçacık, aralarındaki mesafeden bağımsız olarak birbirleriyle bağlantılı kalabilir. Einstein bunu "uzaktaki ürkütücü eylem" olarak nitelendirmiştir. Ancak bu bağlantı, bilgi transferi için kullanılamaz.

E = hf formülü ile enerji kuantize edilir, burada h Planck sabiti (6.626 × 10⁻³⁴ J·s) ve f frekans değeridir.`,
  matematik: `İntegral, bir fonksiyonun belirli bir aralıktaki alanını hesaplamak için kullanılan matematiksel bir işlemdir.

Temel İntegral Kuralları:

Kuvvet Kuralı: ∫ xⁿ dx = xⁿ⁺¹/(n+1) + C, burada n ≠ -1

Trigonometrik İntegraller:
∫ sin(x) dx = -cos(x) + C
∫ cos(x) dx = sin(x) + C
∫ tan(x) dx = -ln|cos(x)| + C

Üstel Fonksiyonlar:
∫ eˣ dx = eˣ + C
∫ aˣ dx = aˣ/ln(a) + C

Belirli İntegral ile alan hesaplanırken, Newton-Leibniz teoremi kullanılır:
∫ₐᵇ f(x)dx = F(b) - F(a)

Örnek: ∫₀² x² dx = [x³/3]₀² = 8/3 - 0 = 8/3 ≈ 2.667

İntegrasyon teknikleri arasında kısmi integrasyon, trigonometrik yerine koyma ve kısmi kesirlere ayırma bulunur.`,
};

export default function MainChat() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectionPopup, setSelectionPopup] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [speedReadText, setSpeedReadText] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);

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

    // Check if selection is within a chat message
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

  // Close popup when clicking outside
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

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    const query = input.toLowerCase();
    setInput("");

    // Simulated response
    setTimeout(() => {
      let responseContent = sampleResponses.default;
      if (query.includes("kuantum") || query.includes("fizik")) {
        responseContent = sampleResponses.kuantum;
      } else if (query.includes("integral") || query.includes("matematik")) {
        responseContent = sampleResponses.matematik;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        isRichContent: true,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
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

    // For "anlamadım" and "bu nedir", send as chat message
    const prompts = {
      "didnt-understand": `"${selectedText}" kısmını anlamadım. Daha basit ve adım adım açıklar mısın?`,
      "what-is-this": `"${selectedText}" nedir? Kısaca tanımla ve örnekle açıkla.`,
    };

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompts[action],
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setSelectionPopup(null);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          action === "didnt-understand"
            ? `Tabii! "${selectedText}" konusunu daha basit bir şekilde açıklayalım:\n\nBunu günlük hayattan bir örnekle düşünebilirsin. Tıpkı bir top fırlattığında hem konumunu hem hızını aynı anda takip etmeye çalışmak gibi - biri netleşirken diğeri belirsizleşir.\n\nAdım adım:\n1. Önce temel kavramı anla\n2. Sonra formüle bak\n3. Son olarak örnekler üzerinden pekiştir\n\nDaha detaylı bir açıklama ister misin?`
            : `"${selectedText}" kısaca:\n\nTanım: Bu kavram, fizikte/matematikte temel bir ilkeyi ifade eder.\n\nGünlük hayatta: Düşün ki iki telefon Bluetooth ile eşleşmiş - biri kapatılınca diğeri de hemen fark eder.\n\nÖnemli noktalar:\n• İlk kez 20. yüzyılda keşfedildi\n• Modern teknolojinin temelini oluşturur\n• Pratik uygulamaları: GPS, MRI, lazer\n\nDaha derine inmek ister misin?`,
        timestamp: new Date(),
        isRichContent: true,
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 600);
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
                        {msg.content}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    )}
                  </div>

                  {/* Hover "Anlamadım" for entire AI message */}
                  {msg.role === "assistant" && msg.isRichContent && (
                    <button
                      onClick={() => {
                        const userMsg: Message = {
                          id: Date.now().toString(),
                          role: "user",
                          content: "Bu açıklamayı anlamadım, daha basit anlatır mısın?",
                          timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, userMsg]);
                      }}
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
                    onClick={() => {
                      setInput(prompt);
                    }}
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
        <div
          className="flex-shrink-0 px-4 pb-4"
        >
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
            />

            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:opacity-30"
              style={{
                background: input.trim() ? "var(--gradient-primary)" : "var(--bg-tertiary)",
                color: input.trim() ? "white" : "var(--text-tertiary)",
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
