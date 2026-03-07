"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { IconChevronLeft, IconChevronRight } from "../icons/Icons";

/* ===== TYPES ===== */
interface PdfReaderDetailProps {
  onBack: () => void;
}

interface ReaderSettings {
  bgColor: string;
  textColor: string;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
}

interface SavedNote {
  id: string;
  text: string;
  page: number;
  timestamp: number;
}

const BG_PRESETS = [
  { name: "Beyaz", bg: "#ffffff", text: "#1a1a1a" },
  { name: "Krem", bg: "#fdf6e3", text: "#3a3226" },
  { name: "Sepia", bg: "#f4ecd8", text: "#5b4636" },
  { name: "Yesil", bg: "#e8f5e9", text: "#2e4a30" },
  { name: "Koyu", bg: "#1e1e2e", text: "#cdd6f4" },
  { name: "Siyah", bg: "#0d0d0d", text: "#e0e0e0" },
];

const FONT_OPTIONS = [
  { name: "System", value: "system-ui, -apple-system, sans-serif" },
  { name: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { name: "Mono", value: "'Courier New', monospace" },
];

/* ===== PDF READER DETAIL ===== */
export default function PdfReaderDetail({ onBack }: PdfReaderDetailProps) {
  // Core state
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<"reader" | "speed" | "settings" | "notes" | "ai">("reader");

  // Settings
  const [settings, setSettings] = useState<ReaderSettings>({
    bgColor: "#fdf6e3",
    textColor: "#3a3226",
    fontSize: 16,
    lineHeight: 1.8,
    fontFamily: "system-ui, -apple-system, sans-serif",
  });

  // Speed reading
  const [speedWords, setSpeedWords] = useState<string[]>([]);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [speedWpm, setSpeedWpm] = useState(300);
  const [speedRunning, setSpeedRunning] = useState(false);
  const speedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // AI word learning
  const [selectedWord, setSelectedWord] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Notes
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [noteInput, setNoteInput] = useState("");

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textContentRef = useRef<string[]>([]);

  /* ===== PDF LOADING ===== */
  const loadPdf = useCallback(async (file: File) => {
    setLoading(true);
    setFileName(file.name);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setTotalPages(pdf.numPages);

      const pages: string[] = [];
      const texts: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => (item.str as string) || "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        pages.push(pageText);
        texts.push(pageText);
      }

      setPdfPages(pages);
      textContentRef.current = texts;
      setCurrentPage(1);

      // Prepare speed reading words from all pages
      const allText = texts.join(" ");
      setSpeedWords(allText.split(/\s+/).filter(w => w.length > 0));
    } catch (err) {
      console.error("PDF yukleme hatasi:", err);
      setPdfPages(["PDF yuklenirken bir hata olustu. Lutfen gecerli bir PDF dosyasi yukleyin."]);
      setTotalPages(1);
    }
    setLoading(false);
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") loadPdf(file);
  }, [loadPdf]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadPdf(file);
  }, [loadPdf]);

  /* ===== SPEED READING ===== */
  useEffect(() => {
    if (speedRunning && speedWords.length > 0) {
      const interval = 60000 / speedWpm;
      speedTimerRef.current = setInterval(() => {
        setSpeedIndex(prev => {
          if (prev >= speedWords.length - 1) {
            setSpeedRunning(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    }
    return () => {
      if (speedTimerRef.current) clearInterval(speedTimerRef.current);
    };
  }, [speedRunning, speedWpm, speedWords.length]);

  /* ===== AI WORD LEARNING ===== */
  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0 && text.length < 100) {
      setSelectedWord(text);
      setActiveTab("ai");
    }
  }, []);

  const explainWord = useCallback(async () => {
    if (!selectedWord) return;
    setAiLoading(true);
    setAiResult("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `"${selectedWord}" kelimesini/kavramini kisa ve ogrenci dostu bir sekilde acikla. Eger yabanci dilde bir kelimeyse Turkce anlamini ve ornek cumle ver. Eger bir terim/kavramsa kisa tanimini yap. Maximum 3-4 cumle.`,
            },
          ],
        }),
      });
      const data = await res.json();
      setAiResult(data.response || data.text || "Bir hata olustu.");
    } catch {
      setAiResult("AI yanit veremedi. Lutfen tekrar deneyin.");
    }
    setAiLoading(false);
  }, [selectedWord]);

  useEffect(() => {
    if (selectedWord && activeTab === "ai") {
      explainWord();
    }
  }, [selectedWord, activeTab, explainWord]);

  /* ===== NOTES ===== */
  const addNote = useCallback(() => {
    if (!noteInput.trim()) return;
    const note: SavedNote = {
      id: Date.now().toString(),
      text: noteInput.trim(),
      page: currentPage,
      timestamp: Date.now(),
    };
    setNotes(prev => [note, ...prev]);
    setNoteInput("");
  }, [noteInput, currentPage]);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  /* ===== UPLOAD SCREEN ===== */
  if (pdfPages.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-95"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            <IconChevronLeft size={16} />
          </button>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>PDF Okuyucu</h2>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all min-h-[300px]"
          style={{
            background: dragOver ? "var(--accent-primary)08" : "var(--bg-card)",
            border: dragOver ? "2px dashed var(--accent-primary)" : "2px dashed var(--border-secondary)",
          }}
        >
          {loading ? (
            <>
              <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border-primary)", borderTopColor: "var(--accent-primary)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>PDF yukleniyor...</p>
            </>
          ) : (
            <>
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: "var(--accent-danger)12", color: "var(--accent-danger)" }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  PDF dosyasi yukle
                </p>
                <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                  Surukle birak veya tiklayarak sec
                </p>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Features Info */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "📖", title: "Hizli Okuma", desc: "RSVP teknigi ile hizli oku" },
            { icon: "🎨", title: "Tasarim", desc: "Arka plan, yazi tipi ayarla" },
            { icon: "🤖", title: "AI Ogrenme", desc: "Kelime sec, aninda ogren" },
            { icon: "📝", title: "Notlar", desc: "Okurken not al ve kaydet" },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl p-3"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              <div className="text-xl mb-1">{f.icon}</div>
              <div className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>{f.title}</div>
              <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ===== MAIN READER VIEW ===== */
  const currentText = pdfPages[currentPage - 1] || "";
  const progressPct = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{fileName}</h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              Sayfa {currentPage}/{totalPages}
            </span>
            <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)", maxWidth: 80 }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: "var(--accent-primary)" }} />
            </div>
            <span className="text-[10px] font-medium" style={{ color: "var(--accent-primary)" }}>%{progressPct}</span>
          </div>
        </div>
        <button
          onClick={() => {
            setPdfPages([]);
            setTotalPages(0);
            setFileName("");
            setCurrentPage(1);
            setSpeedWords([]);
            setSpeedIndex(0);
            setSpeedRunning(false);
            setActiveTab("reader");
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          title="Yeni PDF"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex rounded-lg p-0.5" style={{ background: "var(--bg-tertiary)" }}>
        {([
          { id: "reader" as const, label: "Okuma" },
          { id: "speed" as const, label: "Hizli" },
          { id: "settings" as const, label: "Tasarim" },
          { id: "notes" as const, label: "Notlar" },
          { id: "ai" as const, label: "AI" },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 px-2 py-1.5 rounded-md text-[10px] font-semibold transition-all"
            style={{
              background: activeTab === tab.id ? "var(--bg-card)" : "transparent",
              color: activeTab === tab.id ? "var(--accent-primary)" : "var(--text-tertiary)",
              boxShadow: activeTab === tab.id ? "var(--shadow-sm)" : "none",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== READER TAB ===== */}
      {activeTab === "reader" && (
        <div className="space-y-3">
          <div
            className="rounded-2xl p-5 min-h-[400px] max-h-[60vh] overflow-y-auto"
            style={{
              background: settings.bgColor,
              border: "1px solid var(--border-primary)",
            }}
            onMouseUp={handleTextSelect}
          >
            <p
              style={{
                color: settings.textColor,
                fontSize: settings.fontSize,
                lineHeight: settings.lineHeight,
                fontFamily: settings.fontFamily,
                wordBreak: "break-word",
              }}
            >
              {currentText || "Bu sayfada metin bulunamadi."}
            </p>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95 disabled:opacity-30"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
            >
              <IconChevronLeft size={14} /> Onceki
            </button>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(totalPages, Number(e.target.value)));
                  setCurrentPage(v);
                }}
                className="w-12 text-center text-[12px] font-bold rounded-lg py-1 outline-none"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-primary)", border: "1px solid var(--border-primary)" }}
              />
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>/ {totalPages}</span>
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95 disabled:opacity-30"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)", color: "var(--text-primary)" }}
            >
              Sonraki <IconChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ===== SPEED READING TAB ===== */}
      {activeTab === "speed" && (
        <div className="space-y-4">
          {speedWords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Hizli okuma icin once bir PDF yukleyin</p>
            </div>
          ) : (
            <>
              {/* RSVP Display */}
              <div
                className="rounded-2xl p-8 flex items-center justify-center min-h-[200px]"
                style={{
                  background: settings.bgColor,
                  border: "1px solid var(--border-primary)",
                }}
              >
                <span
                  className="font-bold text-center"
                  style={{
                    fontSize: Math.max(settings.fontSize * 2, 32),
                    color: settings.textColor,
                    fontFamily: settings.fontFamily,
                  }}
                >
                  {speedWords[speedIndex] || "Basla"}
                </span>
              </div>

              {/* Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  <span>{speedIndex + 1} / {speedWords.length} kelime</span>
                  <span>{speedWpm} KPD</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${((speedIndex + 1) / speedWords.length) * 100}%`,
                      background: "var(--accent-primary)",
                    }}
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => { setSpeedIndex(0); setSpeedRunning(false); }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                  title="Basa don"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="4" width="4" height="16" /><polygon points="20 4 10 12 20 20" />
                  </svg>
                </button>
                <button
                  onClick={() => setSpeedRunning(!speedRunning)}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-all active:scale-95"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {speedRunning ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setSpeedIndex(prev => Math.min(speedWords.length - 1, prev + 10))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                  title="10 kelime atla"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="4 4 14 12 4 20" /><rect x="16" y="4" width="4" height="16" />
                  </svg>
                </button>
              </div>

              {/* Speed Control */}
              <div
                className="rounded-xl p-4"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold" style={{ color: "var(--text-primary)" }}>Okuma Hizi</span>
                  <span className="text-[11px] font-bold" style={{ color: "var(--accent-primary)" }}>{speedWpm} KPD</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={1000}
                  step={25}
                  value={speedWpm}
                  onChange={(e) => setSpeedWpm(Number(e.target.value))}
                  className="w-full accent-[var(--accent-primary)]"
                />
                <div className="flex justify-between text-[9px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                  <span>100</span>
                  <span>Yavas</span>
                  <span>Orta</span>
                  <span>Hizli</span>
                  <span>1000</span>
                </div>
              </div>

              {/* Quick Speed Presets */}
              <div className="flex gap-2">
                {[
                  { label: "Yavas", wpm: 150, color: "var(--accent-success)" },
                  { label: "Normal", wpm: 250, color: "var(--accent-secondary)" },
                  { label: "Hizli", wpm: 400, color: "var(--accent-warning)" },
                  { label: "Cok Hizli", wpm: 600, color: "var(--accent-danger)" },
                ].map(p => (
                  <button
                    key={p.label}
                    onClick={() => setSpeedWpm(p.wpm)}
                    className="flex-1 rounded-lg py-2 text-[10px] font-semibold transition-all active:scale-95"
                    style={{
                      background: speedWpm === p.wpm ? `${p.color}` : "var(--bg-tertiary)",
                      color: speedWpm === p.wpm ? "#fff" : "var(--text-secondary)",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== SETTINGS TAB ===== */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          {/* Background Color */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <h3 className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Arka Plan Rengi</h3>
            <div className="grid grid-cols-3 gap-2">
              {BG_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => setSettings(s => ({ ...s, bgColor: preset.bg, textColor: preset.text }))}
                  className="rounded-xl p-3 transition-all active:scale-95"
                  style={{
                    background: preset.bg,
                    border: settings.bgColor === preset.bg
                      ? "2px solid var(--accent-primary)"
                      : "2px solid var(--border-primary)",
                  }}
                >
                  <span className="text-[11px] font-semibold" style={{ color: preset.text }}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Yazi Boyutu</h3>
              <span className="text-[11px] font-bold" style={{ color: "var(--accent-primary)" }}>{settings.fontSize}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={28}
              value={settings.fontSize}
              onChange={(e) => setSettings(s => ({ ...s, fontSize: Number(e.target.value) }))}
              className="w-full accent-[var(--accent-primary)]"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>12px</span>
              <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>28px</span>
            </div>
          </div>

          {/* Line Height */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Satir Araligi</h3>
              <span className="text-[11px] font-bold" style={{ color: "var(--accent-primary)" }}>{settings.lineHeight}</span>
            </div>
            <input
              type="range"
              min={1.2}
              max={3}
              step={0.1}
              value={settings.lineHeight}
              onChange={(e) => setSettings(s => ({ ...s, lineHeight: Number(e.target.value) }))}
              className="w-full accent-[var(--accent-primary)]"
            />
          </div>

          {/* Font Family */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <h3 className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Yazi Tipi</h3>
            <div className="space-y-2">
              {FONT_OPTIONS.map(font => (
                <button
                  key={font.name}
                  onClick={() => setSettings(s => ({ ...s, fontFamily: font.value }))}
                  className="w-full flex items-center justify-between rounded-xl p-3 transition-all active:scale-95"
                  style={{
                    background: settings.fontFamily === font.value ? "var(--accent-primary)12" : "var(--bg-tertiary)",
                    border: settings.fontFamily === font.value ? "1px solid var(--accent-primary)" : "1px solid transparent",
                  }}
                >
                  <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)", fontFamily: font.value }}>
                    {font.name} - Ornek yazi
                  </span>
                  {settings.fontFamily === font.value && (
                    <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent-primary)" }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: settings.bgColor,
              border: "1px solid var(--border-primary)",
            }}
          >
            <p className="text-[10px] font-semibold mb-2" style={{ color: settings.textColor, opacity: 0.6 }}>Onizleme</p>
            <p
              style={{
                color: settings.textColor,
                fontSize: settings.fontSize,
                lineHeight: settings.lineHeight,
                fontFamily: settings.fontFamily,
              }}
            >
              Bu bir onizleme metnidir. Sectiginiz ayarlar ile metnin nasil gorunecegini buradan kontrol edebilirsiniz.
            </p>
          </div>
        </div>
      )}

      {/* ===== NOTES TAB ===== */}
      {activeTab === "notes" && (
        <div className="space-y-3">
          {/* Add Note */}
          <div
            className="rounded-2xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <h3 className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>Yeni Not</h3>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Notunuzu buraya yazin..."
              className="input"
              rows={3}
              style={{ fontSize: 12, resize: "none" }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Sayfa {currentPage}</span>
              <button
                onClick={addNote}
                disabled={!noteInput.trim()}
                className="px-4 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all active:scale-95 disabled:opacity-40"
                style={{ background: "var(--gradient-primary)" }}
              >
                Kaydet
              </button>
            </div>
          </div>

          {/* Notes List */}
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">📝</div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Henuz not eklenmedi</p>
              <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Okurken aldiginiz notlar burada gorunecek</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map(note => (
                <div
                  key={note.id}
                  className="rounded-xl p-3 group"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[12px] flex-1" style={{ color: "var(--text-primary)" }}>{note.text}</p>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] p-1 rounded"
                      style={{ color: "var(--accent-danger)" }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}>
                      Sayfa {note.page}
                    </span>
                    <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>
                      {new Date(note.timestamp).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== AI LEARNING TAB ===== */}
      {activeTab === "ai" && (
        <div className="space-y-3">
          <div
            className="rounded-2xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: "var(--accent-purple)15", color: "var(--accent-purple)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.8 2.8-2 3.5v1h-4v-1A4 4 0 0 1 12 2z"/>
                  <path d="M8 14h8"/><path d="M9 18h6"/><path d="M10 22h4"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>AI Kelime Ogrenme</h3>
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Metinden bir kelime secin veya asagiya yazin</p>
              </div>
            </div>

            {/* Manual Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedWord}
                onChange={(e) => setSelectedWord(e.target.value)}
                placeholder="Kelime veya kavram yazin..."
                className="input flex-1"
                style={{ fontSize: 12 }}
                onKeyDown={(e) => { if (e.key === "Enter") explainWord(); }}
              />
              <button
                onClick={explainWord}
                disabled={!selectedWord.trim() || aiLoading}
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all active:scale-95 disabled:opacity-40"
                style={{ background: "var(--gradient-primary)" }}
              >
                {aiLoading ? "..." : "Acikla"}
              </button>
            </div>
          </div>

          {/* AI Result */}
          {(aiResult || aiLoading) && (
            <div
              className="rounded-2xl p-4"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              {aiLoading ? (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--border-primary)", borderTopColor: "var(--accent-primary)" }} />
                  <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>AI dusunuyor...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--accent-purple)12", color: "var(--accent-purple)" }}>
                      {selectedWord}
                    </span>
                  </div>
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
                    {aiResult}
                  </p>
                  <button
                    onClick={() => {
                      const note: SavedNote = {
                        id: Date.now().toString(),
                        text: `[${selectedWord}]: ${aiResult}`,
                        page: currentPage,
                        timestamp: Date.now(),
                      };
                      setNotes(prev => [note, ...prev]);
                    }}
                    className="mt-3 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all active:scale-95"
                    style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                    Notlarima Kaydet
                  </button>
                </>
              )}
            </div>
          )}

          {/* Tip */}
          <div
            className="rounded-xl p-3"
            style={{ background: "var(--accent-cyan)08", border: "1px solid var(--accent-cyan)20" }}
          >
            <p className="text-[10px]" style={{ color: "var(--accent-cyan)" }}>
              Ipucu: Okuma sekmesindeki metinden bir kelimeyi sectiginizde otomatik olarak AI aciklamasi yapilir.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
