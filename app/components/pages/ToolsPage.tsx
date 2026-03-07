"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { usePomodoro } from "@/app/providers/PomodoroProvider";
import { getRecentSessions, getAllSessions, getPomodoroStats, type PomodoroSession } from "@/lib/db/pomodoro";
import {
  getSavedFlashcards,
  getSavedFlashcardsByConversation,
  deleteSavedFlashcard,
  getUserNotes,
  deleteUserNote,
  getConversation,
  getUserRoadmaps,
  type SavedFlashcard,
  type UserNote,
  type RoadmapWithProgress,
} from "@/lib/db/conversations";
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
  IconRoadmap,
} from "../icons/Icons";
import AIDebateDetail from "../tools/AIDebateDetail";

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
      className="flex flex-col items-start gap-3 rounded-2xl p-4 transition-all active:scale-[0.97] hover:shadow-lg text-left group"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-between w-full">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl transition-all group-hover:scale-110"
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
            className="px-2 py-0.5 rounded-full text-[9px] font-bold"
            style={{ background: `${color}12`, color }}
          >
            {tag}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
          {name}
        </h3>
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
          {description}
        </p>
      </div>
      {count && (
        <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
          {count}
        </span>
      )}
    </button>
  );
}

/* ===== NOTLARIM (MY NOTES) DETAIL ===== */
function NotlarimDetail({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user) {
      getUserNotes(user.id).then(data => {
        setNotes(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleDelete = async (noteId: string) => {
    try {
      await deleteUserNote(noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const filteredNotes = notes.filter(n =>
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Simdi";
    if (diffMins < 60) return `${diffMins} dk once`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat once`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Dun";
    if (diffDays < 7) return `${diffDays} gun once`;
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  const pageColors: Record<string, string> = {
    "Odak": "#10b981",
    "Mentor": "#8b5cf6",
    "Araclar": "#f59e0b",
    "Analiz": "#3b82f6",
    "Ana Sayfa": "#ef4444",
    "Sayfa": "#6b7280",
  };

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
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Notlarim</h2>
          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{notes.length} not</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }}>
          <IconSearch size={13} />
        </div>
        <input
          type="text"
          placeholder="Notlarda ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          style={{ paddingLeft: 34, height: 38, fontSize: 12 }}
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Yukleniyor...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "rgba(16, 185, 129, 0.1)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {search ? "Sonuc bulunamadi" : "Henuz not eklemediniz"}
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            {search ? "Farkli bir arama deneyin" : "Herhangi bir sayfada metin secip 'Notlarima Ekle' butonuna tiklayin"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl p-3.5 transition-all hover:shadow-md group"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              <div className="flex items-start gap-3">
                <div className="w-1 h-10 rounded-full flex-shrink-0 mt-0.5" style={{ background: pageColors[note.source_page] || "#6b7280" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{
                      background: `${pageColors[note.source_page] || "#6b7280"}15`,
                      color: pageColors[note.source_page] || "#6b7280"
                    }}>
                      {note.source_page}
                    </span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
                      {formatDate(note.created_at)}
                    </span>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-1.5 py-0.5 rounded"
                      style={{ color: "var(--accent-danger)" }}
                    >
                      Sil
                    </button>
                  </div>
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-primary)" }}>
                    {note.content.length > 200 ? note.content.slice(0, 200) + "..." : note.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronLeft size={16} />
        </button>
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Zihin Haritası</h2>
          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{maps.length} harita</p>
        </div>
        <button
          className="ml-auto flex h-8 items-center gap-1.5 px-3 rounded-lg transition-all active:scale-95 text-white text-[11px] font-semibold"
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
            className="text-left rounded-xl overflow-hidden transition-all active:scale-[0.98] hover:shadow-lg"
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
interface Deck {
  conversationId: string;
  title: string;
  cards: SavedFlashcard[];
  lastDate: string;
}

function FlashcardDetail({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadDecks();
  }, [user]);

  const loadDecks = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const allCards = await getSavedFlashcards(user.id);
      // Group by conversation_id
      const grouped: Record<string, SavedFlashcard[]> = {};
      for (const card of allCards) {
        if (!grouped[card.conversation_id]) grouped[card.conversation_id] = [];
        grouped[card.conversation_id].push(card);
      }

      // Build deck objects
      const deckList: Deck[] = [];
      for (const [convId, cards] of Object.entries(grouped)) {
        let title = "Flash Kart Destesi";
        try {
          const conv = await getConversation(convId);
          if (conv?.title) title = conv.title;
        } catch {}
        deckList.push({
          conversationId: convId,
          title,
          cards: cards.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
          lastDate: cards[0]?.created_at || "",
        });
      }
      setDecks(deckList);
    } catch (err) {
      console.error("Failed to load flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteSavedFlashcard(cardId);
      if (activeDeck) {
        const updatedCards = activeDeck.cards.filter(c => c.id !== cardId);
        if (updatedCards.length === 0) {
          setActiveDeck(null);
          setDecks(prev => prev.filter(d => d.conversationId !== activeDeck.conversationId));
        } else {
          const updated = { ...activeDeck, cards: updatedCards };
          setActiveDeck(updated);
          setDecks(prev => prev.map(d => d.conversationId === activeDeck.conversationId ? updated : d));
          if (cardIndex >= updatedCards.length) setCardIndex(updatedCards.length - 1);
        }
      }
    } catch (err) {
      console.error("Failed to delete card:", err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return "Bugun";
    if (diffDays === 1) return "Dun";
    if (diffDays < 7) return `${diffDays} gun once`;
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  // Active deck card review view
  if (activeDeck) {
    const card = activeDeck.cards[cardIndex];
    if (!card) { setActiveDeck(null); return null; }

    return (
      <div className="space-y-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setActiveDeck(null); setCardIndex(0); setFlipped(false); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-95"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            <IconChevronLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{activeDeck.title}</h2>
            <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{activeDeck.cards.length} kart</p>
          </div>
          <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>
            {cardIndex + 1} / {activeDeck.cards.length}
          </span>
        </div>

        <div
          className="cursor-pointer rounded-2xl p-8 text-center transition-all active:scale-[0.98]"
          onClick={() => setFlipped(!flipped)}
          style={{
            background: flipped ? "rgba(245, 158, 11, 0.06)" : "var(--bg-card)",
            border: flipped ? "2px solid rgba(245, 158, 11, 0.3)" : "2px solid var(--border-primary)",
            minHeight: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: flipped ? "0 0 20px rgba(245, 158, 11, 0.1)" : "var(--shadow-card)",
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-widest mb-3"
            style={{ color: flipped ? "#f59e0b" : "var(--text-tertiary)" }}
          >
            {flipped ? "Cevap" : "Soru"}
          </span>
          <p className="text-base font-semibold leading-relaxed" style={{ color: "var(--text-primary)" }}>
            {flipped ? card.answer : card.question}
          </p>
          {!flipped && (
            <span className="text-[10px] mt-4" style={{ color: "var(--text-tertiary)" }}>
              Cevap icin tikla
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => { setFlipped(false); setCardIndex(Math.max(0, cardIndex - 1)); }}
            disabled={cardIndex === 0}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-30"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            <IconChevronLeft size={16} />
          </button>
          <div className="flex gap-2">
            {activeDeck.cards.map((_, i) => (
              <button
                key={i}
                onClick={() => { setFlipped(false); setCardIndex(i); }}
                className="w-2.5 h-2.5 rounded-full transition-all"
                style={{
                  background: i === cardIndex ? "#f59e0b" : "var(--bg-tertiary)",
                  boxShadow: i === cardIndex ? "0 0 8px rgba(245, 158, 11, 0.4)" : "none",
                }}
              />
            ))}
          </div>
          <button
            onClick={() => { setFlipped(false); setCardIndex(Math.min(activeDeck.cards.length - 1, cardIndex + 1)); }}
            disabled={cardIndex === activeDeck.cards.length - 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-30"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            <IconChevronRight size={16} />
          </button>
        </div>

        {/* Delete card button */}
        <div className="text-center">
          <button
            onClick={() => handleDeleteCard(card.id)}
            className="text-[11px] px-3 py-1.5 rounded-lg transition-all active:scale-95"
            style={{ color: "var(--accent-danger)", background: "rgba(239, 68, 68, 0.08)" }}
          >
            Bu karti sil
          </button>
        </div>
      </div>
    );
  }

  // Deck list view
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
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Flash Kartlar</h2>
          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            {decks.length} deste, {decks.reduce((sum, d) => sum + d.cards.length, 0)} kart
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Yukleniyor...</p>
        </div>
      ) : decks.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "rgba(245, 158, 11, 0.1)" }}>
            <IconFlashcard size={24} style={{ color: "#f59e0b" }} />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Henuz kaydedilmis kart yok
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Odak modunda Flash Kart sohbetinde 'Ekle' butonuna tiklayarak kart kaydedin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {decks.map((deck) => (
            <button
              key={deck.conversationId}
              onClick={() => { setActiveDeck(deck); setCardIndex(0); setFlipped(false); }}
              className="text-left rounded-xl p-4 transition-all active:scale-[0.98] hover:shadow-lg"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}
                >
                  <IconFlashcard size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[13px] font-bold truncate" style={{ color: "var(--text-primary)" }}>{deck.title}</h3>
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{deck.cards.length} kart</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  {formatDate(deck.lastDate)}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                  Tekrar et
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== POMODORO DETAIL ===== */
function PomodoroDetail({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const {
    isRunning,
    isPaused,
    mode,
    timeLeft,
    totalTime,
    settings,
    completedPomodoros,
    currentSubject,
    start,
    pause,
    resume,
    reset,
    skip,
    updateSettings,
  } = usePomodoro();

  const [activeTab, setActiveTab] = useState<"timer" | "stats" | "history">("timer");
  const [showSettings, setShowSettings] = useState(false);
  const [todayStats, setTodayStats] = useState({ totalMinutes: 0, count: 0, total: 0 });
  const [statsPeriod, setStatsPeriod] = useState<7 | 30 | 0>(7);
  const [statsData, setStatsData] = useState<{ date: string; count: number; totalMinutes: number }[]>([]);
  const [subjectStats, setSubjectStats] = useState<Record<string, number>>({});
  const [loadingStats, setLoadingStats] = useState(false);
  const [historySessions, setHistorySessions] = useState<PomodoroSession[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const displayMinutes = Math.floor(timeLeft / 60);
  const displaySeconds = timeLeft % 60;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const modeColor = mode === "work" ? "var(--accent-primary)" : "var(--accent-cyan)";

  const completionPct = todayStats.total > 0
    ? Math.round((todayStats.count / todayStats.total) * 100)
    : completedPomodoros > 0 ? 100 : 0;

  // Load today's stats from pomodoro_sessions
  useEffect(() => {
    if (!user) return;
    getRecentSessions(user.id, 20).then((sessions) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaySessions = sessions.filter(
        (s) => new Date(s.started_at) >= today
      );
      const completed = todaySessions.filter((s) => s.status === "completed");
      setTodayStats({
        count: completed.length,
        totalMinutes: completed.reduce((sum, s) => sum + Math.round(s.actual_seconds / 60), 0),
        total: todaySessions.length,
      });
    }).catch(() => {});
  }, [user, completedPomodoros]);

  // Stats sekmesi veri yukle
  useEffect(() => {
    if (activeTab !== "stats" || !user) return;
    setLoadingStats(true);
    Promise.all([
      getPomodoroStats(user.id, statsPeriod),
      getAllSessions(user.id, 200),
    ]).then(([data, sessions]) => {
      setStatsData(data);
      const since = statsPeriod > 0
        ? new Date(Date.now() - statsPeriod * 24 * 60 * 60 * 1000)
        : null;
      const filtered = since
        ? sessions.filter((s) => new Date(s.started_at) >= since)
        : sessions;
      const bySubject: Record<string, number> = {};
      for (const s of filtered) {
        if (s.status !== "completed") continue;
        const sub = s.subject || "Genel";
        bySubject[sub] = (bySubject[sub] || 0) + Math.round(s.actual_seconds / 60);
      }
      setSubjectStats(bySubject);
      setLoadingStats(false);
    }).catch(() => setLoadingStats(false));
  }, [activeTab, statsPeriod, user]);

  // Gecmis sekmesi veri yukle
  useEffect(() => {
    if (activeTab !== "history" || !user) return;
    setLoadingHistory(true);
    getAllSessions(user.id, 100).then((sessions) => {
      setHistorySessions(sessions);
      setLoadingHistory(false);
    }).catch(() => setLoadingHistory(false));
  }, [activeTab, user]);

  const handlePlayPause = () => {
    if (isRunning) {
      isPaused ? resume() : pause();
    } else {
      start();
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-95"
            style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
          >
            <IconChevronLeft size={16} />
          </button>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Pomodoro</h2>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-95"
          style={{
            background: showSettings ? "var(--bg-card)" : "var(--bg-tertiary)",
            color: showSettings ? "var(--accent-primary)" : "var(--text-tertiary)",
          }}
        >
          <IconSettings size={16} />
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex rounded-xl p-1" style={{ background: "var(--bg-tertiary)" }}>
        {(["timer", "stats", "history"] as const).map((tab) => {
          const labels = { timer: "Timer", stats: "Istatistik", history: "Gecmis" };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
              style={{
                background: activeTab === tab ? "var(--bg-card)" : "transparent",
                color: activeTab === tab ? "var(--accent-primary)" : "var(--text-tertiary)",
                boxShadow: activeTab === tab ? "var(--shadow-sm)" : "none",
              }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* ===== TIMER TAB ===== */}
      {activeTab === "timer" && (
        <>
          {/* Timer Card */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center gap-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            {/* Subject Badge */}
            {currentSubject && (
              <div className="px-3 py-1 rounded-full text-[10px] font-semibold"
                style={{ background: `${modeColor}15`, color: modeColor }}>
                {currentSubject}
              </div>
            )}

            {/* Mode Toggle */}
            <div className="flex rounded-xl p-1 w-full max-w-[260px]" style={{ background: "var(--bg-tertiary)" }}>
              {(["work", "break"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { if (!isRunning && m !== mode) reset(); }}
                  className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all"
                  style={{
                    background: mode === m ? "var(--bg-card)" : "transparent",
                    color: mode === m ? (m === "work" ? "var(--accent-primary)" : "var(--accent-cyan)") : "var(--text-tertiary)",
                    boxShadow: mode === m ? "var(--shadow-sm)" : "none",
                    opacity: isRunning && mode !== m ? 0.4 : 1,
                    cursor: isRunning && mode !== m ? "not-allowed" : "pointer",
                  }}
                >
                  {m === "work" ? `Calis (${settings.workMinutes}dk)` : `Mola (${settings.shortBreakMinutes}dk)`}
                </button>
              ))}
            </div>

            {/* Timer Circle */}
            <div className="relative">
              <svg width="200" height="200" className="-rotate-90">
                <circle cx="100" cy="100" r="70" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
                <circle
                  cx="100" cy="100" r="70"
                  fill="none"
                  stroke={modeColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dashoffset 1s linear",
                    filter: `drop-shadow(0 0 10px ${modeColor === "var(--accent-primary)" ? "rgba(16,185,129,0.5)" : "rgba(6,182,212,0.5)"})`,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold tabular-nums tracking-tight" style={{ color: "var(--text-primary)" }}>
                  {String(displayMinutes).padStart(2, "0")}:{String(displaySeconds).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold mt-1" style={{ color: modeColor }}>
                  {mode === "work" ? "Odak Zamani" : "Mola Zamani"}
                </span>
                {isRunning && isPaused && (
                  <span className="text-[9px] font-medium mt-0.5" style={{ color: "var(--accent-warning)" }}>
                    Duraklatildi
                  </span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-white transition-all active:scale-95 hover:scale-105"
                style={{ background: modeColor, boxShadow: `0 0 24px ${modeColor}50` }}
              >
                {isRunning && !isPaused ? <IconPause size={22} /> : <IconPlay size={22} />}
              </button>
              <button
                onClick={() => reset()}
                className="flex h-12 w-12 items-center justify-center rounded-2xl transition-all active:scale-95"
                style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
              >
                <IconRefresh size={20} />
              </button>
              {mode === "break" && (
                <button
                  onClick={() => skip()}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl transition-all active:scale-95"
                  style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
                  title="Molayi atla"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 4 15 12 5 20 5 4" /><rect x="15" y="4" width="4" height="16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Today's Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <div className="text-lg font-bold" style={{ color: "var(--accent-primary)" }}>
                {todayStats.count} <span className="text-base">&#x1F345;</span>
              </div>
              <div className="text-[9px] font-medium" style={{ color: "var(--text-tertiary)" }}>Bugun</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <div className="text-lg font-bold" style={{ color: "var(--accent-cyan)" }}>
                {todayStats.totalMinutes}
              </div>
              <div className="text-[9px] font-medium" style={{ color: "var(--text-tertiary)" }}>Dakika</div>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
              <div className="text-lg font-bold" style={{ color: completionPct >= 80 ? "var(--accent-success)" : "var(--accent-warning)" }}>
                %{completionPct}
              </div>
              <div className="text-[9px] font-medium" style={{ color: "var(--text-tertiary)" }}>Tamamlama</div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
            >
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-tertiary)" }}>
                Sure Ayarlari
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Calisma Suresi", key: "workMinutes" as const, max: 120, color: "var(--accent-primary)", suffix: "dk" },
                  { label: "Kisa Mola", key: "shortBreakMinutes" as const, max: 30, color: "var(--accent-cyan)", suffix: "dk" },
                  { label: "Uzun Mola", key: "longBreakMinutes" as const, max: 60, color: "var(--accent-warning)", suffix: "dk" },
                ].map(({ label, key, max, color, suffix }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--bg-tertiary)" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      <span className="text-[12px] font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        max={max}
                        value={settings[key]}
                        onChange={(e) => updateSettings({ [key]: Math.max(1, Math.min(max, Number(e.target.value))) })}
                        className="w-14 px-2 py-1.5 rounded-lg text-[12px] text-center font-bold outline-none"
                        style={{
                          background: "var(--bg-card)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-primary)",
                        }}
                        disabled={isRunning}
                      />
                      <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{suffix}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] mt-3 text-center" style={{ color: "var(--text-tertiary)" }}>
                Her 4 pomodoro sonrasi uzun mola otomatik baslar
              </p>
            </div>
          )}
        </>
      )}

      {/* ===== STATS TAB ===== */}
      {activeTab === "stats" && (() => {
        const totalCount = statsData.reduce((s, d) => s + d.count, 0);
        const totalMinutes = statsData.reduce((s, d) => s + d.totalMinutes, 0);
        const activeDays = statsData.length;
        const avgPerDay = activeDays > 0 ? Math.round(totalCount / activeDays) : 0;
        const maxCount = Math.max(...statsData.map((d) => d.count), 1);
        const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

        return (
          <div className="space-y-4">
            {/* Period Selector */}
            <div className="flex rounded-lg p-0.5" style={{ background: "var(--bg-tertiary)" }}>
              {([7, 30, 0] as const).map((p) => {
                const label = p === 7 ? "7 Gun" : p === 30 ? "30 Gun" : "Tumu";
                return (
                  <button
                    key={p}
                    onClick={() => setStatsPeriod(p)}
                    className="flex-1 px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all"
                    style={{
                      background: statsPeriod === p ? "var(--bg-card)" : "transparent",
                      color: statsPeriod === p ? "var(--accent-primary)" : "var(--text-tertiary)",
                      boxShadow: statsPeriod === p ? "var(--shadow-sm)" : "none",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Toplam Pomodoro", value: String(totalCount), color: "var(--accent-primary)" },
                { label: "Toplam Sure", value: totalMinutes >= 60 ? `${(totalMinutes / 60).toFixed(1)}s` : `${totalMinutes}dk`, color: "var(--accent-cyan)" },
                { label: "Aktif Gun", value: String(activeDays), color: "var(--accent-secondary)" },
                { label: "Ort. / Gun", value: String(avgPerDay), color: "var(--accent-warning)" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl p-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                  <div className="text-xl font-bold" style={{ color }}>{value}</div>
                  <div className="text-[10px] font-medium mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Daily Bar Chart */}
            {loadingStats ? (
              <div className="text-center py-6 text-[11px]" style={{ color: "var(--text-tertiary)" }}>Yukleniyor...</div>
            ) : statsData.length === 0 ? (
              <div className="text-center py-6 text-[11px]" style={{ color: "var(--text-tertiary)" }}>Bu donemde veri yok</div>
            ) : (
              <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                <div className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Gunluk Pomodoro</div>
                <div className="flex items-end gap-1" style={{ height: 80 }}>
                  {statsData.slice(-14).map((day) => {
                    const h = (day.count / maxCount) * 100;
                    const dateLabel = new Date(day.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center gap-1"
                        title={`${dateLabel}: ${day.count} pomodoro, ${day.totalMinutes}dk`}
                      >
                        <div
                          className="w-full rounded-t-md transition-all"
                          style={{
                            height: `${Math.max(h, 4)}%`,
                            background: "var(--accent-primary)",
                            opacity: 0.85,
                            boxShadow: "0 0 4px rgba(16,185,129,0.3)",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>
                    {statsData.length > 0 ? new Date(statsData[Math.max(0, statsData.length - 14)].date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : ""}
                  </span>
                  <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>
                    {statsData.length > 0 ? new Date(statsData[statsData.length - 1].date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : ""}
                  </span>
                </div>
              </div>
            )}

            {/* Subject Breakdown */}
            {Object.keys(subjectStats).length > 0 && (() => {
              const entries = Object.entries(subjectStats).sort(([, a], [, b]) => b - a);
              const maxMin = Math.max(...entries.map(([, v]) => v));
              return (
                <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}>
                  <div className="text-xs font-bold mb-3" style={{ color: "var(--text-primary)" }}>Konulara Gore</div>
                  <div className="space-y-2.5">
                    {entries.slice(0, 6).map(([subject, minutes], i) => {
                      const pct = maxMin > 0 ? Math.round((minutes / maxMin) * 100) : 0;
                      const color = COLORS[i % COLORS.length];
                      return (
                        <div key={subject}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold truncate max-w-[150px]" style={{ color: "var(--text-primary)" }}>{subject}</span>
                            <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                              {minutes >= 60 ? `${(minutes / 60).toFixed(1)}s` : `${minutes}dk`}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        );
      })()}

      {/* ===== HISTORY TAB ===== */}
      {activeTab === "history" && (() => {
        if (loadingHistory) return (
          <div className="text-center py-8 text-[11px]" style={{ color: "var(--text-tertiary)" }}>Yukleniyor...</div>
        );
        if (historySessions.length === 0) return (
          <div className="text-center py-10">
            <div className="text-3xl mb-2">&#x1F345;</div>
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Henuz tamamlanan oturum yok</p>
          </div>
        );

        // Group by date
        const grouped: Record<string, PomodoroSession[]> = {};
        for (const s of historySessions) {
          const date = new Date(s.started_at).toISOString().split("T")[0];
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(s);
        }

        const formatGroupDate = (dateStr: string) => {
          const d = new Date(dateStr);
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (d.toDateString() === today.toDateString()) return "Bugun";
          if (d.toDateString() === yesterday.toDateString()) return "Dun";
          return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
        };

        return (
          <div className="space-y-4">
            {Object.entries(grouped).map(([date, sessions]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                    {formatGroupDate(date)}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    · {sessions.filter((s) => s.status === "completed").length} pomodoro
                  </span>
                </div>

                {/* Sessions */}
                <div className="space-y-1.5">
                  {sessions.map((session) => {
                    const isCompleted = session.status === "completed";
                    const durationMin = Math.round(session.actual_seconds / 60);
                    const time = new Date(session.started_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

                    return (
                      <div
                        key={session.id}
                        className="flex items-center gap-3 rounded-xl p-3 transition-all"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            background: isCompleted ? "var(--accent-primary)" : "var(--text-tertiary)",
                            boxShadow: isCompleted ? "0 0 6px rgba(16,185,129,0.5)" : "none",
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[12px] font-semibold block truncate" style={{ color: "var(--text-primary)" }}>
                            {session.subject || "Odak Oturumu"}
                          </span>
                          <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{time}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[12px] font-bold tabular-nums block" style={{ color: "var(--text-secondary)" }}>
                            {durationMin} dk
                          </span>
                          <span
                            className="text-[9px] font-semibold"
                            style={{ color: isCompleted ? "var(--accent-primary)" : "var(--text-tertiary)" }}
                          >
                            {isCompleted ? "Tamamlandi" : "Iptal"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        );
      })()}
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
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all active:scale-95"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
        >
          <IconChevronLeft size={16} />
        </button>
        <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>H\u0131zl\u0131 Okuma</h2>
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
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>H\u0131z Antrenman\u0131</h3>
            <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Mevcut h\u0131z\u0131n: 250 KPD</span>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { level: "Ba\u015flang\u0131\u00e7", wpm: "200 KPD", color: "var(--accent-success)" },
            { level: "Orta", wpm: "350 KPD", color: "var(--accent-warning)" },
            { level: "\u0130leri", wpm: "500 KPD", color: "var(--accent-danger)" },
          ].map((l) => (
            <button
              key={l.level}
              className="w-full flex items-center justify-between rounded-xl p-3.5 transition-all active:scale-[0.98]"
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
        <h3 className="text-sm font-bold mb-3" style={{ color: "var(--text-primary)" }}>Metin Yap\u0131\u015ft\u0131r</h3>
        <textarea
          placeholder="Okumak istedi\u011fin metni buraya yap\u0131\u015ft\u0131r..."
          className="input"
          rows={4}
          style={{ fontSize: 12, resize: "none" }}
        />
        <button
          className="mt-3 w-full rounded-xl py-2.5 text-[12px] font-semibold text-white transition-all active:scale-[0.98]"
          style={{ background: "var(--gradient-secondary)" }}
        >
          Ba\u015flat
        </button>
      </div>
    </div>
  );
}

/* ===== YOL HARITALARI (ROADMAPS) DETAIL ===== */
function RoadmapDetail({ onBack, onOpenConversation }: { onBack: () => void; onOpenConversation?: (id: string, type?: string) => void }) {
  const { user } = useAuth();
  const [roadmaps, setRoadmaps] = useState<RoadmapWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      getUserRoadmaps(user.id).then(data => {
        setRoadmaps(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [user]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Simdi";
    if (diffMins < 60) return `${diffMins} dk once`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} saat once`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Dun";
    if (diffDays < 7) return `${diffDays} gun once`;
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  };

  const renderRoadmapItem = (r: RoadmapWithProgress, depth: number) => {
    const percentage = r.total_steps > 0 ? Math.round((r.completed_steps / r.total_steps) * 100) : 0;
    const hasChildren = r.children.length > 0;
    const isExpanded = expandedIds.has(r.id);

    return (
      <div key={r.id}>
        <button
          onClick={() => {
            if (hasChildren) toggleExpand(r.id);
            else if (onOpenConversation) onOpenConversation(r.id, "roadmap");
          }}
          className="w-full text-left rounded-xl p-3.5 transition-all active:scale-[0.98] hover:shadow-md group"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            marginLeft: depth * 20,
            width: `calc(100% - ${depth * 20}px)`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0"
              style={{
                background: depth === 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.06)",
                color: "#ef4444",
              }}
            >
              <IconRoadmap size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-bold truncate" style={{ color: "var(--text-primary)" }}>
                  {r.title}
                </h3>
                {hasChildren && (
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444" }}
                  >
                    {r.children.length} alt
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                {r.total_steps > 0 ? (
                  <>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)", maxWidth: 120 }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          background: percentage === 100 ? "#10b981" : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
                      {r.completed_steps}/{r.total_steps} ({percentage}%)
                    </span>
                  </>
                ) : (
                  <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                    Adim yok
                  </span>
                )}
                <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
                  {formatDate(r.updated_at)}
                </span>
              </div>
            </div>
            {hasChildren ? (
              <span
                className="flex-shrink-0 transition-transform"
                style={{
                  color: "var(--text-tertiary)",
                  transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                }}
              >
                <IconChevronRight size={14} />
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenConversation) onOpenConversation(r.id, "roadmap");
                }}
                className="flex-shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-lg transition-all active:scale-95"
                style={{ background: "rgba(239, 68, 68, 0.08)", color: "#ef4444" }}
              >
                Ac
              </button>
            )}
          </div>
        </button>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="space-y-2 mt-2">
            {r.children.map((child) => renderRoadmapItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

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
        <div>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Yol Haritalarim</h2>
          <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{roadmaps.length} yol haritasi</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ color: "var(--text-tertiary)" }} />
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Yukleniyor...</p>
        </div>
      ) : roadmaps.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: "rgba(239, 68, 68, 0.1)" }}>
            <IconRoadmap size={24} style={{ color: "#ef4444" }} />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            Henuz yol haritasi olusturmadiniz
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Odak modunda Yol Haritasi secenegi ile olusturabilirsiniz
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {roadmaps.map((r) => renderRoadmapItem(r, 0))}
        </div>
      )}
    </div>
  );
}

/* ===== TOOLS PAGE ===== */
interface ToolsPageProps {
  onOpenConversation?: (id: string, type?: string) => void;
}

export default function ToolsPage({ onOpenConversation }: ToolsPageProps = {}) {
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [notesCount, setNotesCount] = useState(0);
  const [flashcardInfo, setFlashcardInfo] = useState({ decks: 0, cards: 0 });
  const [roadmapCount, setRoadmapCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    getUserNotes(user.id).then(notes => setNotesCount(notes.length)).catch(() => {});
    getSavedFlashcards(user.id).then(cards => {
      const uniqueConvs = new Set(cards.map(c => c.conversation_id));
      setFlashcardInfo({ decks: uniqueConvs.size, cards: cards.length });
    }).catch(() => {});
    getUserRoadmaps(user.id).then(data => {
      const countAll = (items: RoadmapWithProgress[]): number =>
        items.reduce((sum, r) => sum + 1 + countAll(r.children), 0);
      setRoadmapCount(countAll(data));
    }).catch(() => {});
  }, [user]);

  const tools = [
    {
      id: "notes",
      name: "Notlar\u0131m",
      description: "Ders notlar\u0131n\u0131 olu\u015ftur, d\u00fczenle ve organize et",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
      color: "#10b981",
      tag: notesCount > 0 ? `${notesCount} not` : "Bos",
    },
    {
      id: "mindmap",
      name: "Zihin Haritas\u0131",
      description: "G\u00f6rsel \u00f6\u011frenme i\u00e7in zihin haritalar\u0131 olu\u015ftur",
      icon: <IconMindMap size={20} />,
      color: "#8b5cf6",
      tag: "3 harita",
      count: "Son: D\u00fcn",
    },
    {
      id: "flashcards",
      name: "Flash Kartlar",
      description: "Tekrar ve ezber i\u00e7in flash kart desteleri olu\u015ftur",
      icon: <IconFlashcard size={20} />,
      color: "#f59e0b",
      tag: flashcardInfo.decks > 0 ? `${flashcardInfo.decks} deste` : "Bos",
      count: flashcardInfo.cards > 0 ? `${flashcardInfo.cards} kart` : undefined,
    },
    {
      id: "roadmaps",
      name: "Yol Haritalarim",
      description: "Ogrenme yol haritalarini goruntule ve takip et",
      icon: <IconRoadmap size={20} />,
      color: "#ef4444",
      tag: roadmapCount > 0 ? `${roadmapCount} harita` : "Bos",
    },
    {
      id: "pomodoro",
      name: "Pomodoro",
      description: "Odakl\u0131 \u00e7al\u0131\u015fma seanslar\u0131 ile verimlili\u011fini art\u0131r",
      icon: <IconPomodoro size={20} />,
      color: "#ef4444",
      tag: "Zamanlay\u0131c\u0131",
    },
    {
      id: "speedread",
      name: "H\u0131zl\u0131 Okuma",
      description: "Okuma h\u0131z\u0131n\u0131 geli\u015ftir ve anlama kapasiteni art\u0131r",
      icon: <IconSpeedRead size={20} />,
      color: "#06b6d4",
      tag: "Antrenman",
    },
    {
      id: "formulas",
      name: "Form\u00fcl Tablosu",
      description: "T\u00fcm derslerin form\u00fcllerini tek yerde g\u00f6r",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M12 4v16"/></svg>,
      color: "#3b82f6",
      tag: "6 ders",
    },
    {
      id: "ai-debate",
      name: "AI Tartisma",
      description: "Iki yapay zekayi karsi karsiya getir ve tartismayi yonet",
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 1 4 4v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6a4 4 0 0 1 4-4z"/><rect x="8" y="10" width="8" height="8" rx="1"/><path d="M10 18v2"/><path d="M14 18v2"/><circle cx="10" cy="13.5" r="1" fill="currentColor"/><circle cx="14" cy="13.5" r="1" fill="currentColor"/></svg>,
      color: "#8b5cf6",
      tag: "AI vs AI",
    },
  ];

  // Render detail views
  if (activeTool === "notes") return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><NotlarimDetail onBack={() => setActiveTool(null)} /></div></div>;
  if (activeTool === "mindmap") return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><MindMapDetail onBack={() => setActiveTool(null)} /></div></div>;
  if (activeTool === "flashcards") return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><FlashcardDetail onBack={() => setActiveTool(null)} /></div></div>;
  if (activeTool === "roadmaps") return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><RoadmapDetail onBack={() => setActiveTool(null)} onOpenConversation={onOpenConversation} /></div></div>;
  if (activeTool === "pomodoro") return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><PomodoroDetail onBack={() => setActiveTool(null)} /></div></div>;
  if (activeTool === "speedread") return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><SpeedReadDetail onBack={() => setActiveTool(null)} /></div></div>;
  if (activeTool === "ai-debate") return <div className="h-full overflow-y-auto"><div className="max-w-2xl mx-auto p-4 sm:p-6"><AIDebateDetail onBack={() => setActiveTool(null)} /></div></div>;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Ara\u00e7lar
          </h1>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            \u00d6\u011frenme deneyimini g\u00fc\u00e7lendiren ara\u00e7lar
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
