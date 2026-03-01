"use client";

import { useState } from "react";
import { IconSend, IconMentor, IconStar, IconLightning, IconHelp } from "../icons/Icons";

const modes = [
  {
    id: "psikolog",
    name: "Psikolog",
    emoji: "🧠",
    desc: "Duygularını anla, stresle başa çık",
    greeting: "Merhaba! Seni dinliyorum. Bugün nasıl hissediyorsun?",
    color: "#8b5cf6",
    traits: ["Empati", "Dinleme", "Destek"],
  },
  {
    id: "abi",
    name: "Abi / Abla",
    emoji: "💪",
    desc: "Samimi tavsiyeler, motivasyon",
    greeting: "Selam! Anlat bakalım, bugün ne var ne yok?",
    color: "#3b82f6",
    traits: ["Samimiyet", "Motivasyon", "Rehberlik"],
  },
  {
    id: "ogretmen",
    name: "Öğretmen",
    emoji: "📚",
    desc: "Akademik rehberlik ve planlama",
    greeting: "Hoş geldin! Hangi konuda çalışmak istiyorsun?",
    color: "#10b981",
    traits: ["Akademik", "Planlama", "Strateji"],
  },
  {
    id: "koc",
    name: "Koç",
    emoji: "🎯",
    desc: "Hedef belirleme, disiplin",
    greeting: "Hazır mısın? Bugünün hedeflerini birlikte belirleyelim!",
    color: "#f59e0b",
    traits: ["Disiplin", "Hedef", "Performans"],
  },
  {
    id: "arkadas",
    name: "Arkadaş",
    emoji: "🤝",
    desc: "Rahat sohbet, moral desteği",
    greeting: "Hey! Nasılsın? Bugün neler yaptın?",
    color: "#ec4899",
    traits: ["Rahat", "Eğlenceli", "Moral"],
  },
];

const demoChats: Record<string, { role: "ai" | "user"; text: string }[]> = {
  psikolog: [
    { role: "user", text: "Sınavlara çalışırken çok stresli hissediyorum, odaklanamıyorum" },
    { role: "ai", text: "Bu çok normal bir duygu. Sınav stresi herkesin yaşadığı bir şey. Sana birkaç soru sormak istiyorum - stresini en çok ne tetikliyor? Zaman yetersizliği mi, konu anlamama korkusu mu?" },
    { role: "user", text: "İkisi de aslında, zamanımın yetmeyeceğini düşünüyorum" },
    { role: "ai", text: "Anlıyorum. Bu \"yetmeyecek\" düşüncesi çok yaygın ve genelde gerçeklikten daha büyük hissettiriyor. Birlikte küçük, ulaşılabilir hedefler koyalım mı? Günde 2 saat odaklı çalışma bile büyük fark yaratır." },
  ],
  abi: [
    { role: "user", text: "Abi motivasyonum çok düşük, hiçbir şey yapasım gelmiyor" },
    { role: "ai", text: "Kardeşim bak, herkesin böyle dönemleri oluyor, çok normal. Ama şunu bil: bu his geçici. Şimdi sana bir şey söyleyeceğim - bugün sadece 20 dakika çalış. Sadece 20 dakika. O 20 dakikadan sonra devam etmek istersen et, istemezsen bırak. Ama başla." },
  ],
  ogretmen: [
    { role: "user", text: "Hocam integral konusunu anlayamıyorum" },
    { role: "ai", text: "Tamam, integral aslında türevin tersi işlemidir. Şöyle düşün: türev bir fonksiyonun değişim hızını veriyordu. İntegral ise o değişim hızından orijinal fonksiyona geri dönmemizi sağlar. Adım adım gidelim - önce temel integral kurallarından başlayalım mı?" },
  ],
  koc: [
    { role: "user", text: "Bu hafta hedeflerimi tutturamadım" },
    { role: "ai", text: "Sorun değil, önemli olan farkında olmak. Şimdi şunu yapalım: bu haftanın hedeflerini gözden geçirelim. Hangilerini tamamladın, hangilerini tamamlayamadın? Sebeplerini anlarsak gelecek hafta daha gerçekçi hedefler koyabiliriz." },
  ],
  arkadas: [
    { role: "user", text: "Bugün çok yorgunum ya" },
    { role: "ai", text: "Ay anladım seni, bazen öyle günler oluyor. Ne yaptın bugün bu kadar yorulacak? Biraz mola vermeyi hak ediyorsun bence. Bir 10 dakika kafanı dinle, sonra birlikte plan yaparız!" },
  ],
};

export default function MentorPage() {
  const [activeMode, setActiveMode] = useState("psikolog");
  const [input, setInput] = useState("");

  const currentMode = modes.find((m) => m.id === activeMode)!;
  const messages = [
    { role: "ai" as const, text: currentMode.greeting },
    ...(demoChats[activeMode] || []),
  ];

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar - Mode Selector */}
      <div
        className="hidden sm:flex flex-col w-[240px] flex-shrink-0 overflow-y-auto p-3 space-y-3"
        style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border-primary)" }}
      >
        {/* Mentor Info */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-success-light)", color: "var(--accent-success)" }}>
              <IconMentor size={10} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>AI Mentor</span>
          </div>
          <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
            Farklı modlarda seninle sohbet edebilen yapay zeka destekli mentorün. Her mod farklı bir yaklaşım sunar.
          </p>
        </div>

        {/* Mode Cards */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-secondary-light)", color: "var(--accent-secondary)" }}>
              <IconStar size={10} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Modlar</span>
          </div>
          <div className="space-y-1.5">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 transition-all active:scale-[0.98]"
                style={{
                  background: activeMode === mode.id ? `${mode.color}12` : "transparent",
                  border: activeMode === mode.id ? `1px solid ${mode.color}25` : "1px solid transparent",
                }}
              >
                <span className="text-lg">{mode.emoji}</span>
                <div className="flex-1 text-left min-w-0">
                  <span
                    className="text-[11px] font-bold block"
                    style={{ color: activeMode === mode.id ? mode.color : "var(--text-primary)" }}
                  >
                    {mode.name}
                  </span>
                  <span className="text-[9px] block truncate" style={{ color: "var(--text-tertiary)" }}>
                    {mode.desc}
                  </span>
                </div>
                {activeMode === mode.id && (
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: mode.color, boxShadow: `0 0 6px ${mode.color}` }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Prompts */}
        <div
          className="rounded-xl p-3"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-md" style={{ background: "var(--accent-warning-light)", color: "var(--accent-warning)" }}>
              <IconLightning size={10} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Hızlı Başlat</span>
          </div>
          <div className="space-y-1">
            {["Bugün nasıl çalışmalıyım?", "Motivasyonumu artır", "Stresimi azalt"].map((p) => (
              <button
                key={p}
                className="w-full text-left text-[10px] font-medium rounded-lg px-2.5 py-2 transition-all hover:bg-[var(--bg-tertiary)]"
                style={{ color: "var(--text-secondary)" }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border-primary)", background: "var(--bg-secondary)" }}
        >
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
            style={{ background: `${currentMode.color}15`, border: `1px solid ${currentMode.color}25` }}
          >
            {currentMode.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
              {currentMode.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: currentMode.color }} />
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Aktif</span>
            </div>
          </div>
          <div className="flex gap-1">
            {currentMode.traits.map((t) => (
              <span
                key={t}
                className="hidden sm:inline text-[9px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${currentMode.color}10`, color: currentMode.color }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Mobile Mode Selector */}
        <div
          className="flex sm:hidden gap-1.5 px-3 py-2 overflow-x-auto flex-shrink-0"
          style={{ borderBottom: "1px solid var(--border-primary)" }}
        >
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
              style={{
                background: activeMode === mode.id ? `${mode.color}15` : "var(--bg-tertiary)",
                color: activeMode === mode.id ? mode.color : "var(--text-tertiary)",
              }}
            >
              <span>{mode.emoji}</span>
              {mode.name}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
              {msg.role === "ai" && (
                <div
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm mt-1"
                  style={{ background: `${currentMode.color}12` }}
                >
                  {currentMode.emoji}
                </div>
              )}
              <div
                className="max-w-[75%] rounded-2xl px-4 py-3"
                style={{
                  background: msg.role === "user" ? "var(--gradient-primary)" : "var(--bg-card)",
                  color: msg.role === "user" ? "white" : "var(--text-primary)",
                  border: msg.role === "ai" ? "1px solid var(--border-primary)" : "none",
                  borderBottomRightRadius: msg.role === "user" ? 6 : undefined,
                  borderBottomLeftRadius: msg.role === "ai" ? 6 : undefined,
                }}
              >
                <p className="text-[12px] leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-3 sm:p-4" style={{ borderTop: "1px solid var(--border-primary)" }}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`${currentMode.name} ile konuş...`}
              className="flex-1 h-10 rounded-xl px-4 text-xs outline-none transition-all"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
            />
            <button
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white transition-all active:scale-95"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
            >
              <IconSend size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
