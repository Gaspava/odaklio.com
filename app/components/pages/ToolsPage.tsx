"use client";

import { useState } from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
  IconSend,
  IconPlus,
  IconStar,
  IconBookmark,
  IconPlay,
  IconPause,
  IconRefresh,
  IconBrain,
  IconMindMap,
  IconFlashcard,
  IconPomodoro,
  IconSpeedRead,
  IconSettings,
} from "../icons/Icons";

/* ===== TOOL CARD ===== */
interface ToolCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tag?: string;
  count?: string;
  onClick: () => void;
}

function ToolCard({ name, description, icon, color, tag, count, onClick }: ToolCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-start gap-3 rounded-2xl p-4 transition-all active:scale-[0.97] hover:shadow-lg text-left group overflow-hidden"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      {/* Gradient overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${color}08 0%, ${color}15 100%)`,
        }}
      />

      <div className="relative flex items-center justify-between w-full">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl transition-all group-hover:scale-110"
          style={{
            background: `${color}15`,
            color: color,
            boxShadow: `0 0 20px ${color}10`,
          }}
        >
          {icon}
        </div>
        {tag && (
          <span
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
            style={{ background: `${color}12`, color }}
          >
            {tag}
          </span>
        )}
      </div>
      <div className="relative">
        <h3 className="text-[14px] font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
          {name}
        </h3>
        <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          {description}
        </p>
      </div>
      {count && (
        <span className="relative text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ===== NOTLARIM (MY NOTES) DETAIL ===== */
function NotlarimDetail({ onBack }: { onBack: () => void }) {
  const notes = [
    { id: 1, title: "Fizik - Newton Yasaları", date: "Bugün", preview: "F = m × a formülü ve uygulamaları...", color: "var(--accent-primary)" },
    { id: 2, title: "Matematik - İntegral", date: "Dün", preview: "Belirli integral hesaplama adımları...", color: "var(--accent-secondary)" },
    { id: 3, title: "Biyoloji - Hücre Yapısı", date: "2 gün önce", preview: "Hücre organelleri ve görevleri...", color: "var(--accent-success)" },
    { id: 4, title: "Tarih - Osmanlı Dönemi", date: "3 gün önce", preview: "Kuruluş döneminden yükseliş dönemine...", color: "var(--accent-warning)" },
    { id: 5, title: "Kimya - Periyodik Tablo", date: "1 hafta önce", preview: "Elementlerin sınıflandırılması...", color: "var(--accent-purple)" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronLeft size={16} />
        </button>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Notlarım</h2>
          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{notes.length} not</p>
        </div>
        <button
          className="ml-auto flex h-9 items-center gap-1.5 px-3 rounded-xl transition-all active:scale-95 text-white text-[11px] font-semibold"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
        >
          <IconPlus size={12} />
          Yeni Not
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }}>
          <IconSearch size={13} />
        </div>
        <input type="text" placeholder="Notlarda ara..." className="input" style={{ paddingLeft: 34, height: 38, fontSize: 12 }} />
      </div>

      <div className="space-y-2">
        {notes.map((note) => (
          <button
            key={note.id}
            className="w-full text-left rounded-2xl p-3.5 transition-all active:scale-[0.99] hover:shadow-md group"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-start gap-3">
              <div className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5" style={{ background: note.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>{note.title}</h3>
                  <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>{note.date}</span>
                </div>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: "var(--text-tertiary)" }}>{note.preview}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== ZİHİN HARİTASI (MIND MAP) DETAIL ===== */
function MindMapDetail({ onBack }: { onBack: () => void }) {
  const maps = [
    { id: 1, title: "Newton Yasaları", nodes: 12, color: "var(--accent-primary)", updated: "Bugün" },
    { id: 2, title: "Hücre Bölünmesi", nodes: 8, color: "var(--accent-success)", updated: "Dün" },
    { id: 3, title: "Osmanlı Tarihi", nodes: 15, color: "var(--accent-warning)", updated: "3 gün önce" },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronLeft size={16} />
        </button>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Zihin Haritası</h2>
          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{maps.length} harita</p>
        </div>
        <button
          className="ml-auto flex h-9 items-center gap-1.5 px-3 rounded-xl transition-all active:scale-95 text-white text-[11px] font-semibold"
          style={{ background: "var(--gradient-accent)", boxShadow: "0 0 12px rgba(139,92,246,0.15)" }}
        >
          <IconPlus size={12} />
          Yeni Harita
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {maps.map((map) => (
          <button
            key={map.id}
            className="text-left rounded-2xl overflow-hidden transition-all active:scale-[0.98] hover:shadow-lg group"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            {/* Mini map preview */}
            <div className="h-28 relative" style={{ background: "var(--bg-tertiary)" }}>
              <svg width="100%" height="100%" viewBox="0 0 200 100">
                <line x1="100" y1="50" x2="40" y2="20" stroke={map.color} strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="100" y1="50" x2="160" y2="20" stroke={map.color} strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="100" y1="50" x2="40" y2="80" stroke={map.color} strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="100" y1="50" x2="160" y2="80" stroke={map.color} strokeWidth="1.5" strokeOpacity="0.4" />
                <circle cx="100" cy="50" r="14" fill={map.color} fillOpacity="0.15" stroke={map.color} strokeWidth="1.5" />
                <circle cx="40" cy="20" r="8" fill={map.color} fillOpacity="0.1" stroke={map.color} strokeWidth="1" />
                <circle cx="160" cy="20" r="8" fill={map.color} fillOpacity="0.1" stroke={map.color} strokeWidth="1" />
                <circle cx="40" cy="80" r="8" fill={map.color} fillOpacity="0.1" stroke={map.color} strokeWidth="1" />
                <circle cx="160" cy="80" r="8" fill={map.color} fillOpacity="0.1" stroke={map.color} strokeWidth="1" />
              </svg>
            </div>
            <div className="p-3">
              <h3 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>{map.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{map.nodes} düğüm</span>
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{map.updated}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== FLASH KARTLAR DETAIL ===== */
function FlashcardDetail({ onBack }: { onBack: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);

  const decks = [
    { name: "Fizik Formülleri", count: 24, color: "var(--accent-primary)", mastered: 18 },
    { name: "Biyoloji Terimleri", count: 32, color: "var(--accent-success)", mastered: 20 },
    { name: "Matematik Kuralları", count: 18, color: "var(--accent-secondary)", mastered: 12 },
    { name: "Tarih Tarihleri", count: 40, color: "var(--accent-warning)", mastered: 25 },
  ];

  const [activeDeck, setActiveDeck] = useState<number | null>(null);

  const cards = [
    { q: "Newton'un birinci yasası nedir?", a: "Eylemsizlik yasası: Net kuvvet sıfırsa cisim halini korur." },
    { q: "F = m × a ne anlama gelir?", a: "Kuvvet = kütle × ivme. Newton'un ikinci yasası." },
    { q: "Momentum formülü?", a: "p = m × v (kütle × hız)" },
  ];

  if (activeDeck !== null) {
    const card = cards[cardIndex];
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setActiveDeck(null); setCardIndex(0); setFlipped(false); }}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            <IconChevronLeft size={16} />
          </button>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{decks[activeDeck].name}</h2>
          <span className="text-[11px] ml-auto" style={{ color: "var(--text-tertiary)" }}>
            {cardIndex + 1} / {cards.length}
          </span>
        </div>

        <div
          className="cursor-pointer rounded-3xl p-10 text-center transition-all active:scale-[0.98]"
          onClick={() => setFlipped(!flipped)}
          style={{
            background: flipped ? "var(--accent-primary-light)" : "var(--bg-card)",
            border: flipped ? "2px solid rgba(16, 185, 129, 0.3)" : "2px solid var(--border-primary)",
            minHeight: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: flipped ? "var(--shadow-glow)" : "var(--shadow-card)",
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-widest mb-3"
            style={{ color: flipped ? "var(--accent-primary)" : "var(--text-tertiary)" }}
          >
            {flipped ? "Cevap" : "Soru"}
          </span>
          <p className="text-base font-semibold leading-relaxed" style={{ color: "var(--text-primary)" }}>
            {flipped ? card.a : card.q}
          </p>
          {!flipped && (
            <span className="text-[10px] mt-4" style={{ color: "var(--text-tertiary)" }}>
              Cevap için tıkla
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => { setFlipped(false); setCardIndex((cardIndex - 1 + cards.length) % cards.length); }}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            <IconChevronLeft size={16} />
          </button>
          <div className="flex gap-2">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => { setFlipped(false); setCardIndex(i); }}
                className="w-2.5 h-2.5 rounded-full transition-all"
                style={{
                  background: i === cardIndex ? "var(--accent-primary)" : "var(--bg-tertiary)",
                  boxShadow: i === cardIndex ? "var(--shadow-glow-sm)" : "none",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => { setFlipped(false); setCardIndex((cardIndex + 1) % cards.length); }}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronLeft size={16} />
        </button>
        <div>
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Flash Kartlar</h2>
          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{decks.length} deste</p>
        </div>
        <button
          className="ml-auto flex h-9 items-center gap-1.5 px-3 rounded-xl transition-all active:scale-95 text-white text-[11px] font-semibold"
          style={{ background: "var(--gradient-warm)" }}
        >
          <IconPlus size={12} />
          Yeni Deste
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {decks.map((deck, i) => (
          <button
            key={i}
            onClick={() => setActiveDeck(i)}
            className="text-left rounded-2xl p-4 transition-all active:scale-[0.98] hover:shadow-lg group"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${deck.color}15`, color: deck.color }}
              >
                <IconFlashcard size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>{deck.name}</h3>
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{deck.count} kart</span>
              </div>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(deck.mastered / deck.count) * 100}%`, background: deck.color }}
              />
            </div>
            <span className="text-[10px] mt-1.5 block" style={{ color: "var(--text-tertiary)" }}>
              {deck.mastered}/{deck.count} öğrenildi
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ===== POMODORO DETAIL ===== */
function PomodoroDetail({ onBack }: { onBack: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [mode, setMode] = useState<"work" | "break">("work");

  const circumference = 2 * Math.PI * 60;
  const totalSeconds = mode === "work" ? 25 * 60 : 5 * 60;
  const elapsed = totalSeconds - (minutes * 60 + seconds);
  const progress = (elapsed / totalSeconds) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const modeColor = mode === "work" ? "var(--accent-primary)" : "var(--accent-cyan)";

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronLeft size={16} />
        </button>
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Pomodoro</h2>
      </div>

      <div
        className="rounded-2xl p-6 flex flex-col items-center gap-5"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <div className="flex rounded-xl p-1 w-full max-w-[240px]" style={{ background: "var(--bg-tertiary)" }}>
          {(["work", "break"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setMinutes(m === "work" ? 25 : 5); setSeconds(0); setIsRunning(false); }}
              className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
              style={{
                background: mode === m ? "var(--bg-card)" : "transparent",
                color: mode === m ? modeColor : "var(--text-tertiary)",
                boxShadow: mode === m ? "var(--shadow-sm)" : "none",
              }}
            >
              {m === "work" ? "Çalış (25dk)" : "Mola (5dk)"}
            </button>
          ))}
        </div>

        <div className="relative rounded-3xl">
          <svg width="180" height="180" className="-rotate-90">
            <circle cx="90" cy="90" r="60" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
            <circle
              cx="90" cy="90" r="60"
              fill="none"
              stroke={modeColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear", filter: `drop-shadow(0 0 8px ${modeColor})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
            <span className="text-[11px] font-semibold" style={{ color: modeColor }}>
              {mode === "work" ? "Odak Zamanı" : "Mola Zamanı"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white transition-all active:scale-95"
            style={{ background: modeColor, boxShadow: `0 0 16px ${modeColor}40` }}
          >
            {isRunning ? <IconPause size={20} /> : <IconPlay size={20} />}
          </button>
          <button
            onClick={() => { setIsRunning(false); setMinutes(mode === "work" ? 25 : 5); setSeconds(0); }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl transition-all active:scale-95"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            <IconRefresh size={20} />
          </button>
        </div>

        <div className="w-full max-w-[280px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Günlük Hedef</span>
            <span className="text-[11px] font-semibold" style={{ color: "var(--accent-success)" }}>2/4</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
            <div className="h-full rounded-full" style={{ width: "50%", background: "var(--gradient-primary)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== HIZLI OKUMA (SPEED READ) DETAIL ===== */
function SpeedReadDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronLeft size={16} />
        </button>
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Hızlı Okuma</h2>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{ background: "var(--accent-cyan-light)", color: "var(--accent-cyan)" }}
          >
            <IconSpeedRead size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Hız Antrenmanı</h3>
            <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Mevcut hızın: 250 KPD</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { level: "Başlangıç", wpm: "200 KPD", color: "var(--accent-success)" },
            { level: "Orta", wpm: "350 KPD", color: "var(--accent-warning)" },
            { level: "İleri", wpm: "500 KPD", color: "var(--accent-danger)" },
          ].map((l) => (
            <button
              key={l.level}
              className="w-full flex items-center justify-between rounded-2xl p-4 transition-all active:scale-[0.98] hover:shadow-md"
              style={{ background: "var(--bg-tertiary)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>{l.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{l.wpm}</span>
                <IconChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
      >
        <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Metin Yapıştır</h3>
        <textarea
          placeholder="Okumak istediğin metni buraya yapıştır..."
          className="input"
          rows={4}
          style={{ fontSize: 12, resize: "none" }}
        />
        <button
          className="mt-3 w-full rounded-xl py-2.5 text-[12px] font-semibold text-white transition-all active:scale-[0.98]"
          style={{ background: "var(--gradient-secondary)" }}
        >
          Başlat
        </button>
      </div>
    </div>
  );
}

/* ===== TOOLS PAGE ===== */
export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    {
      id: "notes",
      name: "Notlarım",
      description: "Ders notlarını oluştur, düzenle ve organize et",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
      color: "#10b981",
      tag: "5 not",
      count: "Son: Bugün",
    },
    {
      id: "mindmap",
      name: "Zihin Haritası",
      description: "Görsel öğrenme için zihin haritaları oluştur",
      icon: <IconMindMap size={20} />,
      color: "#8b5cf6",
      tag: "3 harita",
      count: "Son: Dün",
    },
    {
      id: "flashcards",
      name: "Flash Kartlar",
      description: "Tekrar ve ezber için flash kart desteleri oluştur",
      icon: <IconFlashcard size={20} />,
      color: "#f59e0b",
      tag: "4 deste",
      count: "114 kart",
    },
    {
      id: "pomodoro",
      name: "Pomodoro",
      description: "Odaklı çalışma seansları ile verimliliğini artır",
      icon: <IconPomodoro size={20} />,
      color: "#ef4444",
      tag: "Zamanlayıcı",
    },
    {
      id: "speedread",
      name: "Hızlı Okuma",
      description: "Okuma hızını geliştir ve anlama kapasiteni artır",
      icon: <IconSpeedRead size={20} />,
      color: "#06b6d4",
      tag: "Antrenman",
    },
    {
      id: "formulas",
      name: "Formül Tablosu",
      description: "Tüm derslerin formüllerini tek yerde gör",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M12 4v16"/></svg>,
      color: "#3b82f6",
      tag: "6 ders",
    },
  ];

  // Render detail views
  if (activeTool === "notes") return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><NotlarimDetail onBack={() => setActiveTool(null)} /></div></div>;
  if (activeTool === "mindmap") return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><MindMapDetail onBack={() => setActiveTool(null)} /></div></div>;
  if (activeTool === "flashcards") return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><FlashcardDetail onBack={() => setActiveTool(null)} /></div></div>;
  if (activeTool === "pomodoro") return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><PomodoroDetail onBack={() => setActiveTool(null)} /></div></div>;
  if (activeTool === "speedread") return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><SpeedReadDetail onBack={() => setActiveTool(null)} /></div></div>;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="relative space-y-1">
          {/* Hero glow behind the page title */}
          <div
            className="absolute -top-8 left-0 w-32 h-16 rounded-full blur-3xl opacity-30 pointer-events-none"
            style={{ background: "var(--gradient-primary)" }}
          />
          <h1 className="text-xl font-black relative" style={{ color: "var(--text-primary)" }}>
            Araçlar
          </h1>
          <p className="text-sm leading-relaxed relative" style={{ color: "var(--text-tertiary)" }}>
            Öğrenme deneyimini güçlendiren araçlar
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              name={tool.name}
              description={tool.description}
              icon={tool.icon}
              color={tool.color}
              tag={tool.tag}
              count={tool.count}
              onClick={() => setActiveTool(tool.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
