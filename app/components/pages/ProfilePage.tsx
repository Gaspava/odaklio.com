"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { IconSun, IconMoon } from "../icons/Icons";
import type { UserProfile } from "@/lib/db/profile";

/* ===== CONSTANTS ===== */
const MODALITY_LABELS: Record<string, { label: string; desc: string; icon: string }> = {
  gorsel: { label: "Gorsel", desc: "Sema, grafik ve gorseller ile daha iyi ogreniyor", icon: "\u{1F441}" },
  metinsel: { label: "Metinsel", desc: "Okuyarak ve yazarak daha iyi ogreniyor", icon: "\u{1F4D6}" },
  interaktif: { label: "Interaktif", desc: "Uygulama ve pratik ile daha iyi ogreniyor", icon: "\u{1F3AF}" },
  karma: { label: "Karma", desc: "Farkli yontemleri birlikte kullaniyor", icon: "\u{1F504}" },
};

const DEPTH_LABELS: Record<string, { label: string; desc: string }> = {
  yuzeysel: { label: "Yuzeysel", desc: "Kisa ve oz aciklamalari tercih ediyor" },
  orta: { label: "Orta", desc: "Dengeli detay seviyesinde ogreniyor" },
  derin: { label: "Derin", desc: "Detayli ve kapsamli aciklamalari tercih ediyor" },
};

const PACE_LABELS: Record<string, { label: string; desc: string }> = {
  hizli: { label: "Hizli", desc: "Konulari hizla kavriyor" },
  orta: { label: "Orta", desc: "Normal tempoda ilerliyor" },
  detayli: { label: "Detayli", desc: "Her konuyu iyice pekistirerek ilerliyor" },
};

const CONSISTENCY_LABELS: Record<string, { label: string; color: string }> = {
  duzensiz: { label: "Duzensiz", color: "#ef4444" },
  ara_sira: { label: "Ara Sira", color: "#f59e0b" },
  orta: { label: "Orta", color: "#3b82f6" },
  duzenli: { label: "Duzenli", color: "#10b981" },
  gunluk: { label: "Her Gun", color: "#059669" },
};

const MOTIVATION_LABELS: Record<string, { label: string; desc: string; icon: string }> = {
  kendini_motive_eden: { label: "Kendini Motive Eden", desc: "Kendi basina hedef koyup takip edebiliyor", icon: "\u{1F4AA}" },
  tesvige_ihtiyac_duyan: { label: "Tesvige Ihtiyac Duyan", desc: "Desteklendiginde daha verimli calisiyor", icon: "\u{1F91D}" },
  rekabetci: { label: "Rekabetci", desc: "Hedefler ve yarisma ile motive oluyor", icon: "\u{1F3C6}" },
  karma: { label: "Karma", desc: "Farkli motivasyon kaynaklarini kullaniyor", icon: "\u{2728}" },
};

const TOOL_LABELS: Record<string, { label: string; icon: string }> = {
  chat: { label: "Sohbet", icon: "\u{1F4AC}" },
  flashcard: { label: "Flashcard", icon: "\u{1F0CF}" },
  mindmap: { label: "Zihin Haritasi", icon: "\u{1F5FA}" },
  roadmap: { label: "Yol Haritasi", icon: "\u{1F4CD}" },
  note: { label: "Not", icon: "\u{1F4DD}" },
  pomodoro: { label: "Pomodoro", icon: "\u{1F345}" },
};

const SUBJECT_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316", "#059669",
];

/* ===== COMPONENTS ===== */
function LoadingState() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }}
        />
        <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
          Profil yukleniyor...
        </span>
      </div>
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 max-w-xs text-center">
        <div
          className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }}
        />
        <div>
          <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Profilin Olusturuluyor
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
            Tum veriler analiz ediliyor. Calisma aliskanliklarin, ogrenme stilin ve akademik profil cikariliyor...
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DimensionRow({ label, value, description }: { label: string; value: string; description?: string }) {
  return (
    <div className="flex items-start justify-between py-2" style={{ borderBottom: "1px solid var(--border-secondary)" }}>
      <div>
        <span className="text-[11px] font-medium" style={{ color: "var(--text-tertiary)" }}>{label}</span>
        {description && (
          <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>{description}</p>
        )}
      </div>
      <span className="text-[12px] font-bold flex-shrink-0 ml-4" style={{ color: "var(--text-primary)" }}>{value}</span>
    </div>
  );
}

function SubjectBarChart({
  entries,
  color,
  emptyText,
}: {
  entries: [string, number][];
  color: string | ((i: number) => string);
  emptyText: string;
}) {
  if (entries.length === 0) {
    return <span className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{emptyText}</span>;
  }
  const max = Math.max(...entries.map(([, v]) => v));
  return (
    <div className="space-y-2">
      {entries.map(([name, score], i) => {
        const barColor = typeof color === "function" ? color(i) : color;
        const pct = max > 0 ? Math.round((score / max) * 100) : 0;
        return (
          <div key={name}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] font-medium" style={{ color: "var(--text-secondary)" }}>{name}</span>
              <span className="text-[10px] font-bold" style={{ color: barColor }}>{score}</span>
            </div>
            <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ===== PROFILE PAGE ===== */
export default function ProfilePage() {
  const { user, session } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const token = session?.access_token;
      const res = await fetch("/api/user-profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : {} as Record<string, string>,
      });
      const data = await res.json();
      return data.profile || null;
    } catch {
      return null;
    }
  }, [session?.access_token]);

  const generateProfile = useCallback(async () => {
    setGenerating(true);
    try {
      const token = session?.access_token;
      const res = await fetch("/api/user-profile", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {} as Record<string, string>,
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err) {
      console.error("Failed to generate profile:", err);
    } finally {
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchProfile()
      .then((p) => {
        setProfile(p);
        if (!p) {
          generateProfile();
        }
      })
      .finally(() => setLoading(false));
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <FullPage><LoadingState /></FullPage>;
  if (generating && !profile) return <FullPage><GeneratingState /></FullPage>;

  const displayName = user?.user_metadata?.full_name || user?.email || "";
  const initials = displayName
    ? displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const isStale = profile
    ? Date.now() - new Date(profile.last_updated_at).getTime() > 24 * 60 * 60 * 1000
    : false;

  const strengthEntries = Object.entries(profile?.subjects_strength || {}).sort(([, a], [, b]) => b - a);
  const weaknessEntries = Object.entries(profile?.subjects_weakness || {}).sort(([, a], [, b]) => b - a);
  const interestEntries = Object.entries(profile?.subjects_interest || {}).sort(([, a], [, b]) => b - a);
  const toolEntries = Object.entries(profile?.preferred_tools || {}).sort(([, a], [, b]) => b - a);

  return (
    <FullPage>
      <div className="h-full overflow-y-auto">
        <div className="max-w-xl mx-auto p-4 sm:p-6 space-y-4 pb-20">

          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:scale-105"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Profilim</h1>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                Yapay zeka tarafindan olusturulan ogrenme profilin
              </p>
            </div>
            <button onClick={toggleTheme} className="header-icon-btn" title="Tema">
              {theme === "dark" ? <IconSun size={15} /> : <IconMoon size={15} />}
            </button>
          </div>

          {/* User Info Card */}
          <div
            className="rounded-xl p-5 flex items-center gap-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white flex-shrink-0"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                {user?.user_metadata?.full_name || "Kullanici"}
              </div>
              <div className="text-[11px] truncate" style={{ color: "var(--text-tertiary)" }}>
                {user?.email || user?.phone || ""}
              </div>
              {profile && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}>
                    Profil v{profile.profile_version}
                  </span>
                  <span className="text-[9px]" style={{ color: "var(--text-tertiary)" }}>
                    {new Date(profile.last_updated_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={generateProfile}
              disabled={generating}
              className="flex-shrink-0 text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: isStale ? "var(--accent-primary)" : "var(--bg-tertiary)",
                color: isStale ? "#fff" : "var(--text-tertiary)",
              }}
            >
              {generating ? "Olusturuluyor..." : isStale ? "Guncelle" : "Yenile"}
            </button>
          </div>

          {!profile ? (
            <div className="flex items-center justify-center py-12">
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Profil henuz olusturulmadi</span>
            </div>
          ) : (
            <>
              {/* Overall Assessment */}
              {profile.overall_assessment && (
                <SectionCard title="Genel Degerlendirme" icon="📋">
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {profile.overall_assessment}
                  </p>
                </SectionCard>
              )}

              {/* Learning Style */}
              <SectionCard title="Ogrenme Stili" icon="🧠">
                <div className="space-y-0.5">
                  {profile.learning_modality && (() => {
                    const m = MODALITY_LABELS[profile.learning_modality!];
                    return m ? (
                      <DimensionRow label="Ogrenme Tipi" value={`${m.icon} ${m.label}`} description={m.desc} />
                    ) : null;
                  })()}
                  {profile.preferred_depth && (() => {
                    const d = DEPTH_LABELS[profile.preferred_depth!];
                    return d ? (
                      <DimensionRow label="Derinlik Tercihi" value={d.label} description={d.desc} />
                    ) : null;
                  })()}
                  {profile.preferred_pace && (() => {
                    const p = PACE_LABELS[profile.preferred_pace!];
                    return p ? (
                      <DimensionRow label="Hiz Tercihi" value={p.label} description={p.desc} />
                    ) : null;
                  })()}
                </div>
                {profile.personality_summary && (
                  <div className="mt-3 rounded-lg p-3" style={{ background: "var(--bg-tertiary)" }}>
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {profile.personality_summary}
                    </p>
                  </div>
                )}
              </SectionCard>

              {/* Study Habits */}
              <SectionCard title="Calisma Aliskanliklari" icon="⏰">
                <div className="space-y-0.5">
                  {profile.study_consistency && (() => {
                    const c = CONSISTENCY_LABELS[profile.study_consistency!];
                    return c ? (
                      <DimensionRow
                        label="Duzenilik"
                        value={c.label}
                      />
                    ) : null;
                  })()}
                  {profile.avg_daily_study_minutes != null && (
                    <DimensionRow label="Gunluk Ortalama" value={`${profile.avg_daily_study_minutes} dk`} />
                  )}
                  {profile.preferred_session_minutes != null && (
                    <DimensionRow label="Tercih Edilen Oturum" value={`${profile.preferred_session_minutes} dk`} />
                  )}
                  {profile.completion_rate != null && (
                    <DimensionRow label="Tamamlama Orani" value={`%${profile.completion_rate}`} />
                  )}
                </div>

                {/* Peak Hours */}
                {profile.peak_study_hours && profile.peak_study_hours.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                      Verimli Saatler
                    </span>
                    <div className="flex gap-1.5 flex-wrap mt-1.5">
                      {profile.peak_study_hours.map((h) => (
                        <span
                          key={h}
                          className="inline-flex items-center justify-center px-2.5 h-7 rounded-lg text-[10px] font-bold"
                          style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
                        >
                          {h}:00
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* Academic Profile */}
              <SectionCard title="Akademik Profil" icon="🎓">
                {/* Strengths */}
                {(strengthEntries.length > 0 || profile.strengths_text) && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[11px] font-semibold" style={{ color: "var(--accent-success)" }}>
                        Guclu Konular
                      </span>
                    </div>
                    {profile.strengths_text && (
                      <p className="text-[10px] leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
                        {profile.strengths_text}
                      </p>
                    )}
                    <SubjectBarChart
                      entries={strengthEntries.slice(0, 6)}
                      color={(i) => SUBJECT_COLORS[i % SUBJECT_COLORS.length]}
                      emptyText=""
                    />
                  </div>
                )}

                {/* Weaknesses */}
                {(weaknessEntries.length > 0 || profile.weaknesses_text) && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[11px] font-semibold" style={{ color: "var(--accent-warning)" }}>
                        Gelisim Alanlari
                      </span>
                    </div>
                    {profile.weaknesses_text && (
                      <p className="text-[10px] leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
                        {profile.weaknesses_text}
                      </p>
                    )}
                    <SubjectBarChart
                      entries={weaknessEntries.slice(0, 6)}
                      color="#f59e0b"
                      emptyText=""
                    />
                  </div>
                )}

                {/* Interest */}
                {interestEntries.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[11px] font-semibold" style={{ color: "var(--accent-primary)" }}>
                        Ilgi Duzeyi
                      </span>
                    </div>
                    <SubjectBarChart
                      entries={interestEntries.slice(0, 6)}
                      color="var(--accent-primary)"
                      emptyText=""
                    />
                  </div>
                )}

                {/* Focus Subjects */}
                {profile.current_focus_subjects && profile.current_focus_subjects.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-secondary)" }}>
                    <span className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                      Aktif Odak Konulari
                    </span>
                    <div className="flex gap-1.5 flex-wrap mt-1.5">
                      {profile.current_focus_subjects.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                          style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </SectionCard>

              {/* Motivation */}
              <SectionCard title="Motivasyon Profili" icon="🔥">
                {profile.motivation_pattern && (() => {
                  const m = MOTIVATION_LABELS[profile.motivation_pattern!];
                  return m ? (
                    <div className="rounded-lg p-3 mb-3" style={{ background: "var(--bg-tertiary)" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{m.icon}</span>
                        <span className="text-[12px] font-bold" style={{ color: "var(--text-primary)" }}>{m.label}</span>
                      </div>
                      <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>{m.desc}</p>
                    </div>
                  ) : null;
                })()}

                {/* Frustration Signals */}
                {profile.frustration_signals && profile.frustration_signals.length > 0 && (
                  <div className="rounded-lg p-3" style={{ background: "rgba(239, 68, 68, 0.05)" }}>
                    <div className="text-[10px] font-semibold mb-1.5" style={{ color: "var(--accent-danger)" }}>
                      Dikkat Edilmesi Gerekenler
                    </div>
                    <ul className="space-y-1">
                      {profile.frustration_signals.map((signal, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                          <span className="flex-shrink-0 w-1 h-1 rounded-full mt-1.5" style={{ background: "var(--accent-danger)" }} />
                          {signal.replace(/_/g, " ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </SectionCard>

              {/* Tool Preferences */}
              {toolEntries.length > 0 && (
                <SectionCard title="Arac Tercihleri" icon="🛠️">
                  <div className="space-y-2">
                    {toolEntries.map(([tool, pct]) => {
                      const t = TOOL_LABELS[tool];
                      return (
                        <div key={tool} className="flex items-center gap-3">
                          <span className="text-sm w-6 text-center">{t?.icon || "\u{2699}"}</span>
                          <span className="text-[11px] font-medium w-24" style={{ color: "var(--text-secondary)" }}>
                            {t?.label || tool}
                          </span>
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--bg-tertiary)" }}>
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: "var(--accent-primary)" }}
                            />
                          </div>
                          <span className="text-[10px] font-bold w-8 text-right" style={{ color: "var(--accent-primary)" }}>
                            %{pct}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {profile.mentor_preference && (
                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-secondary)" }}>
                      <DimensionRow
                        label="Mentor Tercihi"
                        value={{
                          coach: "Ders Kocu",
                          psych: "Psikolog",
                          buddy: "Kanka",
                          expert: "Uzman",
                        }[profile.mentor_preference] || profile.mentor_preference}
                      />
                    </div>
                  )}
                </SectionCard>
              )}

              {/* Recommendations */}
              {profile.recommendations && profile.recommendations.length > 0 && (
                <SectionCard title="Oneriler" icon="💡">
                  <ul className="space-y-2.5">
                    {profile.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span
                          className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold mt-0.5"
                          style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
                        >
                          {i + 1}
                        </span>
                        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {rec}
                        </p>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {/* Data Info */}
              <div
                className="rounded-xl p-4 text-center"
                style={{ background: "var(--bg-tertiary)" }}
              >
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
                  Bu profil, platformdaki tum etkinliklerine dayanarak yapay zeka tarafindan olusturulmustur.
                  Profil her 24 saatte bir otomatik guncellenir.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </FullPage>
  );
}

/* ===== LAYOUT WRAPPER ===== */
function FullPage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-dvh"
      style={{ background: "var(--bg-primary)" }}
    >
      {children}
    </div>
  );
}
