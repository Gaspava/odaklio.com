"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { supabase } from "@/lib/supabase";
import {
  getAnalyticsSummary,
  getStreakDays,
  type AnalyticsSummary,
} from "@/lib/db/analytics";
import type { RoadmapStepRow } from "@/lib/db/conversations";
import {
  IconChat,
  IconMindMap,
  IconFlashcard,
  IconRoadmap,
} from "../icons/Icons";

/* ===== TYPES ===== */
interface HomePageProps {
  onSelectMode: (mode: string) => void;
  onOpenConversation: (id: string, type?: string) => void;
}

interface RoadmapData {
  id: string;
  title: string;
  steps: RoadmapStepRow[];
}

/* ===== HARDCODED DATA ===== */
const quotes = [
  { text: "Başarı, her gün tekrarlanan küçük çabaların toplamıdır.", author: "Robert Collier" },
  { text: "Öğrenmenin sınırı yoktur, sadece başlangıç noktaları vardır.", author: "Anonim" },
  { text: "Bugün yaptıkların, yarının temelini oluşturur.", author: "Anonim" },
  { text: "Bilgi güçtür, ama uygulama güç gösterisidir.", author: "Francis Bacon" },
  { text: "Her uzman bir zamanlar başlangıç seviyesindeydi.", author: "Helen Hayes" },
  { text: "Disiplin, motivasyonun bittiği yerde başlar.", author: "Anonim" },
  { text: "Küçük adımlar, büyük yolculukların başlangıcıdır.", author: "Lao Tzu" },
  { text: "Kendine yatırım yapmak, en iyi getiriyi sağlar.", author: "Benjamin Franklin" },
  { text: "Başarısızlık, başarının baharatıdır.", author: "Truman Capote" },
  { text: "Öğrenmek asla zihni yormaz.", author: "Leonardo da Vinci" },
  { text: "Zorluklar, seni güçlendirmek için vardır.", author: "Anonim" },
  { text: "Bugünün işini yarına bırakma.", author: "Anonim" },
];

const mentors = [
  {
    id: "coach", name: "Ders Koçu", emoji: "\u{1F393}",
    gradient: "linear-gradient(135deg, #10b981, #059669)", color: "#10b981",
    messages: [
      "Bugün harika bir gün çalışmak için! Hedeflerini belirle ve adım adım ilerle.",
      "Düzenli çalışma, başarının anahtarıdır. Bugün de bir adım daha at!",
      "Geçen haftaya göre ilerleme kaydediyorsun, devam et!",
      "Pomodoro tekniğiyle odaklanmayı dene, verimini artıracaksın.",
      "Her gün biraz daha iyisin. Bunu unutma!",
    ],
  },
  {
    id: "psych", name: "Psikolog", emoji: "\u{1F9E0}",
    gradient: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#8b5cf6",
    messages: [
      "Kendine nazik ol. Öğrenme bir maraton, sprint değil.",
      "Bugün kendini nasıl hissediyorsun? Duygularını fark etmek önemli.",
      "Mola vermek de üretkenliğin bir parçası. Kendine zaman tanı.",
      "Stres hissediyorsan derin nefes al. Her şey yoluna girecek.",
      "Küçük başarılarını kutlamayı unutma!",
    ],
  },
  {
    id: "buddy", name: "Kanka", emoji: "\u{1F60E}",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#f59e0b",
    messages: [
      "Heyy! Bugün neler öğreneceğiz? Hadi başlayalım!",
      "Dün güzel çalışmışsın, bugün de aynı tempoyu yakalayalım!",
      "Canın sıkılırsa flashcard'larla pratik yap, eğlenceli oluyor!",
      "Roadmap'ine baktım, güzel ilerliyorsun reis!",
      "Bugün biraz challenge yapalım mı? Kendini zorla!",
    ],
  },
  {
    id: "expert", name: "Uzman", emoji: "\u{1F52C}",
    gradient: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "#06b6d4",
    messages: [
      "Derinlemesine öğrenme, yüzeysel bilgiden her zaman daha değerlidir.",
      "Bugün bir konsepti gerçekten anlamaya odaklan.",
      "Bilgiyi yapılandırmak için mindmap kullanmayı dene.",
      "Öğrendiğin konuları başkasına anlatabiliyorsan, gerçekten öğrenmişsindir.",
      "Kaynaklarını çeşitlendir. Farklı perspektifler öğrenmeyi derinleştirir.",
    ],
  },
];

const modes = [
  { id: "standard", name: "Standart Sohbet", desc: "Klasik AI sohbet deneyimi", color: "#10b981", gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)" },
  { id: "mindmap", name: "Mindmap Chat", desc: "2D paralel sohbet haritası", color: "#8b5cf6", gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)" },
  { id: "flashcard", name: "Flashcard", desc: "AI destekli hafıza kartları", color: "#f59e0b", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" },
  { id: "roadmap", name: "Roadmap", desc: "Adım adım öğrenme planı", color: "#ef4444", gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" },
];

const modeIcons: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  standard: IconChat,
  mindmap: IconMindMap,
  flashcard: IconFlashcard,
  roadmap: IconRoadmap,
};

const moodFeedback: Record<string, string> = {
  "\u{1F60A}": "Harika! Bu enerjiyi değerlendir!",
  "\u{1F610}": "Biraz motivasyona mı ihtiyacın var? Bir pomodoro dene!",
  "\u{1F614}": "Zor günler de olur. Kendine nazik ol.",
  "\u{1F929}": "Süper enerji! Bugün büyük hedefler koy!",
  "\u{1F634}": "Belki kısa bir mola iyi gelir?",
};

const moodEmojis = ["\u{1F60A}", "\u{1F610}", "\u{1F614}", "\u{1F929}", "\u{1F634}"];

/* ===== HELPERS ===== */
function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function formatStudyTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}sa ${mins}dk`;
  }
  return `${mins}dk`;
}

/* ===== GLASS CARD STYLE ===== */
const glassCard: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(16, 185, 129, 0.12)",
  borderRadius: "var(--radius-2xl)",
  padding: "24px",
  transition: "var(--transition-normal)",
};

/* ===== SHIMMER SKELETON ===== */
function Skeleton({ height, width, borderRadius }: { height: number | string; width?: number | string; borderRadius?: number }) {
  return (
    <div
      className="homepage-shimmer"
      style={{
        height,
        width: width || "100%",
        borderRadius: borderRadius ?? 12,
        background: "rgba(255, 255, 255, 0.06)",
      }}
    />
  );
}

/* ===== MAIN COMPONENT ===== */
export default function HomePage({ onSelectMode, onOpenConversation }: HomePageProps) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [streak, setStreak] = useState(0);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  // Random mentor and message (stable per mount)
  const [mentor] = useState(() => mentors[Math.floor(Math.random() * mentors.length)]);
  const [stableMentorMessage] = useState(
    () => mentor.messages[Math.floor(Math.random() * mentor.messages.length)]
  );

  // Today's quote
  const todayQuote = quotes[getDayOfYear() % quotes.length];

  // First name
  const fullName = user?.user_metadata?.full_name || "";
  const firstName = fullName.split(" ")[0] || "\u00D6\u011Frenci";

  /* Data fetching */
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        const [analyticsData, streakData] = await Promise.all([
          getAnalyticsSummary(user.id, 7),
          getStreakDays(user.id),
        ]);
        setAnalytics(analyticsData);
        setStreak(streakData);

        // Fetch latest roadmap
        const { data: convData } = await supabase
          .from("conversations")
          .select("id, title")
          .eq("user_id", user.id)
          .eq("type", "roadmap")
          .order("updated_at", { ascending: false })
          .limit(1);

        if (convData && convData.length > 0) {
          const conv = convData[0];
          const { data: stepsData } = await supabase
            .from("roadmap_steps")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("step_number", { ascending: true });

          setRoadmap({
            id: conv.id,
            title: conv.title,
            steps: stepsData || [],
          });
        }
      } catch (err) {
        console.error("HomePage data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Analytics derived values */
  const activeDays = analytics ? analytics.dailyStudyHours.filter((d) => d.hours > 0).length : 0;
  const topSubject = analytics
    ? Object.entries(analytics.subjectBreakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || null
    : null;

  /* Goals */
  const goals = [
    { label: "2 saat \u00e7al\u0131\u015f", done: (analytics?.totalStudyMinutes ?? 0) >= 120 },
    { label: "1 pomodoro tamamla", done: (analytics?.totalPomodoros ?? 0) >= 1 },
    { label: "10 flashcard \u00e7\u00f6z", done: (analytics?.totalFlashcards ?? 0) >= 10 },
  ];

  /* ===== LOADING STATE ===== */
  if (loading) {
    return (
      <div className="homepage-container" style={{ overflowY: "auto", height: "100%", padding: "32px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <Skeleton height={140} borderRadius={24} />
          <div className="homepage-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Skeleton height={160} borderRadius={24} />
            <Skeleton height={160} borderRadius={24} />
          </div>
          <Skeleton height={120} borderRadius={24} />
          <div className="homepage-four-col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <Skeleton height={140} borderRadius={24} />
            <Skeleton height={140} borderRadius={24} />
            <Skeleton height={140} borderRadius={24} />
            <Skeleton height={140} borderRadius={24} />
          </div>
          <div className="homepage-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Skeleton height={180} borderRadius={24} />
            <Skeleton height={180} borderRadius={24} />
          </div>
        </div>

        <style>{`
          @keyframes shimmer {
            0% { opacity: 0.5; }
            50% { opacity: 0.8; }
            100% { opacity: 0.5; }
          }
          .homepage-shimmer {
            animation: shimmer 1.5s ease-in-out infinite;
          }
          @media (max-width: 768px) {
            .homepage-two-col { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 640px) {
            .homepage-four-col { grid-template-columns: repeat(2, 1fr) !important; }
            .homepage-container { padding: 16px !important; }
          }
        `}</style>
      </div>
    );
  }

  /* ===== RENDER ===== */
  return (
    <div className="homepage-container" style={{ overflowY: "auto", height: "100%", padding: "32px", paddingBottom: 100 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ========== 1. HERO WELCOME ========== */}
        <div
          style={{
            ...glassCard,
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle gradient orb background */}
          <div style={{
            position: "absolute", top: -40, right: -40, width: 180, height: 180,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                Merhaba, {firstName}!
              </h1>
              {streak > 0 && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "4px 12px", borderRadius: 20,
                  background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(249, 115, 22, 0.15))",
                  fontSize: 12, fontWeight: 600,
                  color: "#f59e0b",
                }}>
                  {"\u{1F525}"} {streak} g\u00fcn seri
                </span>
              )}
            </div>

            <p style={{
              fontSize: 14, fontStyle: "italic",
              color: "var(--text-secondary)", margin: 0, lineHeight: 1.6,
            }}>
              &ldquo;{todayQuote.text}&rdquo;
            </p>
            <p style={{
              fontSize: 12, color: "var(--text-tertiary)",
              margin: 0, marginTop: 4,
            }}>
              &mdash; {todayQuote.author}
            </p>
          </div>
        </div>

        {/* ========== 2. MENTOR + WEEKLY ANALYSIS (2-col) ========== */}
        <div className="homepage-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Mentor Message */}
          <div style={{
            ...glassCard,
            borderColor: `${mentor.color}4D`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: mentor.gradient,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>
                {mentor.emoji}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
                  Ment\u00f6r\u00fcn Mesaj\u0131
                </div>
                <div style={{ fontSize: 11, color: mentor.color, fontWeight: 600 }}>
                  {mentor.name}
                </div>
              </div>
            </div>
            <p style={{
              fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)", margin: 0,
            }}>
              {stableMentorMessage}
            </p>
          </div>

          {/* Weekly Analysis */}
          <div style={glassCard}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
              Haftal\u0131k Analiz
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--accent-primary)" }}>
                  {formatStudyTime(analytics?.totalStudyMinutes ?? 0)}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Toplam \u00c7al\u0131\u015fma</div>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#8b5cf6" }}>
                  {analytics?.totalPomodoros ?? 0}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>Pomodoro</div>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Aktif G\u00fcnler</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>{activeDays}/7</span>
              </div>
              <div style={{
                height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", borderRadius: 3,
                  width: `${(activeDays / 7) * 100}%`,
                  background: "linear-gradient(90deg, #10b981, #059669)",
                  transition: "width 0.5s ease",
                }} />
              </div>
            </div>

            {topSubject && (
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 8 }}>
                En \u00c7ok: <span style={{ color: "var(--accent-primary)", fontWeight: 600 }}>{topSubject}</span>
              </div>
            )}

            <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 4 }}>
              Detayl\u0131 Analiz \u2192
            </div>
          </div>
        </div>

        {/* ========== 3. ROADMAP PREVIEW ========== */}
        <div style={glassCard}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
              Son Roadmap&apos;in
            </div>
            {roadmap && (
              <button
                onClick={() => onOpenConversation(roadmap.id, "roadmap")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 600, color: "var(--accent-primary)",
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "4px 8px", borderRadius: 8,
                  transition: "var(--transition-normal)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(16, 185, 129, 0.1)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
              >
                Devam Et \u2192
              </button>
            )}
          </div>

          {roadmap ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 16 }}>
                {roadmap.title}
              </div>

              {/* Horizontal progress line */}
              <div style={{ position: "relative", overflowX: "auto", paddingBottom: 8 }}>
                <div className="homepage-roadmap-track" style={{
                  display: "flex", alignItems: "flex-start", gap: 0,
                  minWidth: "fit-content", position: "relative",
                }}>
                  {(() => {
                    const visibleSteps = roadmap.steps.length > 8
                      ? [...roadmap.steps.slice(0, 7), null, roadmap.steps[roadmap.steps.length - 1]]
                      : roadmap.steps;

                    const firstIncompleteIndex = roadmap.steps.findIndex((s) => !s.is_completed);

                    return visibleSteps.map((step, i) => {
                      if (step === null) {
                        // Ellipsis
                        return (
                          <div key="ellipsis" style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            minWidth: 40, position: "relative",
                          }}>
                            <div style={{
                              width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
                              color: "var(--text-tertiary)", fontSize: 14, fontWeight: 700,
                            }}>
                              ...
                            </div>
                          </div>
                        );
                      }

                      const originalIndex = roadmap.steps.indexOf(step);
                      const isCompleted = step.is_completed;
                      const isNext = originalIndex === firstIncompleteIndex;
                      const isLast = i === visibleSteps.length - 1;

                      const dotColor = isCompleted ? "#10b981" : isNext ? "#f59e0b" : "rgba(255,255,255,0.15)";
                      const glowShadow = isCompleted
                        ? "0 0 10px #10b981, 0 0 20px rgba(16, 185, 129, 0.3)"
                        : isNext
                          ? "0 0 10px #f59e0b, 0 0 20px rgba(245, 158, 11, 0.3)"
                          : "none";

                      return (
                        <div key={step.id} style={{
                          display: "flex", alignItems: "flex-start",
                          flex: isLast ? "0 0 auto" : 1,
                          minWidth: 60,
                        }}>
                          <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            width: 60,
                          }}>
                            {/* Dot */}
                            <div style={{
                              width: 14, height: 14, borderRadius: "50%",
                              background: dotColor,
                              boxShadow: glowShadow,
                              flexShrink: 0,
                              border: isNext ? "2px solid #f59e0b" : isCompleted ? "none" : "2px solid rgba(255,255,255,0.1)",
                            }} />
                            {/* Step title */}
                            <div style={{
                              fontSize: 9, color: isCompleted ? "#10b981" : isNext ? "#f59e0b" : "var(--text-tertiary)",
                              marginTop: 6, textAlign: "center",
                              maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              fontWeight: isNext ? 600 : 400,
                            }}>
                              {step.title}
                            </div>
                          </div>
                          {/* Connecting line */}
                          {!isLast && (
                            <div style={{
                              flex: 1, height: 2, marginTop: 6,
                              background: isCompleted ? "#10b981" : "rgba(255,255,255,0.08)",
                              borderRadius: 1,
                              minWidth: 16,
                            }} />
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginBottom: 12 }}>
                Hen\u00fcz bir roadmap olu\u015fturmad\u0131n.
              </p>
              <button
                onClick={() => onSelectMode("roadmap")}
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "white", border: "none", cursor: "pointer",
                  padding: "10px 24px", borderRadius: 12,
                  fontSize: 13, fontWeight: 600,
                  boxShadow: "0 4px 16px rgba(239, 68, 68, 0.25)",
                  transition: "var(--transition-normal)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
              >
                \u0130lk roadmap&apos;ini olu\u015ftur
              </button>
            </div>
          )}
        </div>

        {/* ========== 4. QUICK ACCESS - FOCUS MODE CARDS ========== */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12, paddingLeft: 2 }}>
            H\u0131zl\u0131 Eri\u015fim
          </div>
          <div className="homepage-four-col" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {modes.map((mode) => {
              const Icon = modeIcons[mode.id];
              const isHovered = hoveredMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => onSelectMode(mode.id)}
                  onMouseEnter={() => setHoveredMode(mode.id)}
                  onMouseLeave={() => setHoveredMode(null)}
                  style={{
                    ...glassCard,
                    padding: "20px 16px",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 10,
                    cursor: "pointer",
                    borderColor: isHovered ? `${mode.color}60` : "rgba(16, 185, 129, 0.12)",
                    boxShadow: isHovered ? `0 4px 24px ${mode.color}20, 0 0 0 1px ${mode.color}15` : "none",
                    transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                    textAlign: "center",
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: mode.gradient,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: isHovered ? `0 4px 16px ${mode.color}40` : `0 2px 8px ${mode.color}20`,
                    transition: "var(--transition-normal)",
                  }}>
                    <Icon size={20} style={{ color: "white" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                    {mode.name}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--text-tertiary)", lineHeight: 1.3 }}>
                    {mode.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========== 5. SELF-ASSESSMENT + DAILY GOALS (2-col) ========== */}
        <div className="homepage-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Self-Assessment */}
          <div style={glassCard}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
              Kendini Tahlil Et
            </div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 16 }}>
              Bug\u00fcn nas\u0131l hissediyorsun?
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 14 }}>
              {moodEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedMood(emoji)}
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    border: selectedMood === emoji ? "2px solid var(--accent-primary)" : "1px solid rgba(255,255,255,0.08)",
                    background: selectedMood === emoji ? "rgba(16, 185, 129, 0.12)" : "rgba(255,255,255,0.04)",
                    cursor: "pointer", fontSize: 22,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "var(--transition-normal)",
                    transform: selectedMood === emoji ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {selectedMood && (
              <div style={{
                fontSize: 12, color: "var(--accent-primary)",
                textAlign: "center", padding: "8px 12px",
                background: "rgba(16, 185, 129, 0.06)",
                borderRadius: 10, lineHeight: 1.5,
              }}>
                {moodFeedback[selectedMood]}
              </div>
            )}
          </div>

          {/* Daily Goals */}
          <div style={glassCard}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>
              G\u00fcnl\u00fck Hedef
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {goals.map((goal, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {goal.done ? (
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.1)",
                      flexShrink: 0,
                    }} />
                  )}
                  <span style={{
                    fontSize: 13,
                    color: goal.done ? "#10b981" : "var(--text-secondary)",
                    fontWeight: goal.done ? 600 : 400,
                    textDecoration: goal.done ? "line-through" : "none",
                    opacity: goal.done ? 0.85 : 1,
                  }}>
                    {goal.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* ===== SCOPED STYLES ===== */}
      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 0.8; }
          100% { opacity: 0.5; }
        }
        .homepage-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @media (max-width: 768px) {
          .homepage-two-col {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .homepage-four-col {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .homepage-container {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
