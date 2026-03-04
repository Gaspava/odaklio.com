import { supabase as defaultSupabase } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  user_id: string;

  // Learning Style
  learning_modality: string | null;
  preferred_depth: string | null;
  preferred_pace: string | null;

  // Study Habits
  peak_study_hours: number[] | null;
  preferred_session_minutes: number | null;
  study_consistency: string | null;
  avg_daily_study_minutes: number | null;

  // Academic Profile
  subjects_strength: Record<string, number>;
  subjects_weakness: Record<string, number>;
  subjects_interest: Record<string, number>;
  current_focus_subjects: string[] | null;

  // Engagement Profile
  preferred_tools: Record<string, number>;
  mentor_preference: string | null;
  completion_rate: number | null;

  // Motivation Profile
  motivation_pattern: string | null;
  frustration_signals: string[] | null;

  // LLM Generated
  personality_summary: string | null;
  strengths_text: string | null;
  weaknesses_text: string | null;
  recommendations: string[] | null;
  overall_assessment: string | null;

  // Meta
  profile_version: number;
  last_updated_at: string;
  raw_data_snapshot: Record<string, unknown>;
  created_at: string;
}

export async function getUserProfile(userId: string, client?: SupabaseClient): Promise<UserProfile | null> {
  const db = client ?? defaultSupabase;
  const { data, error } = await db
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function upsertUserProfile(
  userId: string,
  profile: Partial<UserProfile>,
  client?: SupabaseClient
): Promise<UserProfile> {
  const db = client ?? defaultSupabase;
  const { data, error } = await db
    .from("user_profiles")
    .upsert(
      {
        user_id: userId,
        ...profile,
        last_updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// DATA AGGREGATION - Collects ALL user data for LLM analysis
// ============================================================

export interface AggregatedUserData {
  // Account
  accountCreatedAt: string | null;
  totalDaysActive: number;

  // Pomodoro Stats
  totalPomodoros: number;
  completedPomodoros: number;
  cancelledPomodoros: number;
  completionRate: number;
  totalStudyMinutes: number;
  avgSessionMinutes: number;
  subjectBreakdown: Record<string, number>; // subject -> minutes
  hourDistribution: Record<number, number>; // hour (0-23) -> count
  dayDistribution: Record<string, number>; // day name -> count

  // Conversation Stats
  totalConversations: number;
  conversationsByType: Record<string, number>;
  recentConversationTitles: string[];
  totalMessages: number;
  avgMessagesPerConversation: number;

  // Interaction Stats
  interactionCounts: Record<string, number>;
  totalFlashcardsSaved: number;
  totalNotesCreated: number;
  totalMindmapNodes: number;
  totalRoadmapStepsCompleted: number;

  // Page Usage
  pageTimeDistribution: Record<string, number>; // page -> minutes
  totalPageViews: number;

  // Study Patterns
  studyDaysLast30: number;
  currentStreak: number;
  longestGap: number;
  avgDailyMinutes: number;
  recentDailyMinutes: { date: string; minutes: number }[];

  // Mentor Usage
  mentorConversations: Record<string, number>; // mentor type -> count

  // Recent Daily Reports
  recentReportSummaries: string[];
}

export async function aggregateAllUserData(userId: string, client?: SupabaseClient): Promise<AggregatedUserData> {
  const db = client ?? defaultSupabase;
  // Fetch all data in parallel
  const [
    pomodoroRes,
    conversationRes,
    interactionRes,
    pageTrackingRes,
    flashcardRes,
    noteRes,
    dailyReportRes,
  ] = await Promise.all([
    // All pomodoro sessions
    db
      .from("pomodoro_sessions")
      .select("subject, session_type, duration_minutes, actual_seconds, status, started_at, page_context")
      .eq("user_id", userId)
      .eq("session_type", "work")
      .order("started_at", { ascending: false }),

    // All conversations
    db
      .from("conversations")
      .select("id, title, type, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),

    // All interactions
    db
      .from("user_interactions")
      .select("interaction_type, subject, created_at")
      .eq("user_id", userId),

    // Page tracking
    db
      .from("page_tracking")
      .select("page_name, duration_seconds, started_at")
      .eq("user_id", userId)
      .gt("duration_seconds", 2),

    // Saved flashcards count
    db
      .from("saved_flashcards")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),

    // Notes count
    db
      .from("user_notes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),

    // Recent daily reports
    db
      .from("daily_reports")
      .select("llm_analysis, report_date, total_study_minutes, streak_days")
      .eq("user_id", userId)
      .order("report_date", { ascending: false })
      .limit(5),
  ]);

  const pomodoros = pomodoroRes.data || [];
  const conversations = conversationRes.data || [];
  const interactions = interactionRes.data || [];
  const pageTracking = pageTrackingRes.data || [];
  const dailyReports = dailyReportRes.data || [];

  // Get total message count from interactions (message_sent events)
  const totalMessagesSent = interactions.filter((i) => i.interaction_type === "message_sent").length;

  // Process pomodoro data
  const completed = pomodoros.filter((p) => p.status === "completed");
  const cancelled = pomodoros.filter((p) => p.status === "cancelled");
  const totalStudySeconds = completed.reduce((sum, p) => sum + (p.actual_seconds || 0), 0);

  const subjectBreakdown: Record<string, number> = {};
  const hourDistribution: Record<number, number> = {};
  const dayDistribution: Record<string, number> = {};
  const dayNames = ["Pazar", "Pazartesi", "Sali", "Carsamba", "Persembe", "Cuma", "Cumartesi"];

  for (const p of completed) {
    // Subject
    const subject = p.subject || "Genel";
    subjectBreakdown[subject] = (subjectBreakdown[subject] || 0) + Math.round((p.actual_seconds || 0) / 60);

    // Hour distribution
    const hour = new Date(p.started_at).getHours();
    hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;

    // Day distribution
    const day = dayNames[new Date(p.started_at).getDay()];
    dayDistribution[day] = (dayDistribution[day] || 0) + 1;
  }

  // Process conversation data
  const conversationsByType: Record<string, number> = {};
  const mentorConversations: Record<string, number> = {};
  for (const c of conversations) {
    conversationsByType[c.type] = (conversationsByType[c.type] || 0) + 1;
    if (c.type === "mentor") {
      // Extract mentor type from title if possible
      const mentorTypes = ["coach", "psych", "buddy", "expert"];
      for (const mt of mentorTypes) {
        if (c.title?.toLowerCase().includes(mt)) {
          mentorConversations[mt] = (mentorConversations[mt] || 0) + 1;
        }
      }
    }
  }

  // Process interaction data
  const interactionCounts: Record<string, number> = {};
  for (const i of interactions) {
    interactionCounts[i.interaction_type] = (interactionCounts[i.interaction_type] || 0) + 1;
  }

  // Process page tracking
  const pageTimeDistribution: Record<string, number> = {};
  for (const p of pageTracking) {
    pageTimeDistribution[p.page_name] = (pageTimeDistribution[p.page_name] || 0) + Math.round(p.duration_seconds / 60);
  }

  // Calculate study days in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const studyDatesSet = new Set<string>();
  const dailyMinutesMap: Record<string, number> = {};

  for (const p of completed) {
    const date = new Date(p.started_at);
    if (date >= thirtyDaysAgo) {
      const dateStr = date.toISOString().split("T")[0];
      studyDatesSet.add(dateStr);
      dailyMinutesMap[dateStr] = (dailyMinutesMap[dateStr] || 0) + Math.round((p.actual_seconds || 0) / 60);
    }
  }

  // Also count page tracking days
  for (const p of pageTracking) {
    const date = new Date(p.started_at);
    if (date >= thirtyDaysAgo && p.duration_seconds > 60) {
      const dateStr = date.toISOString().split("T")[0];
      studyDatesSet.add(dateStr);
      dailyMinutesMap[dateStr] = (dailyMinutesMap[dateStr] || 0) + Math.round(p.duration_seconds / 60);
    }
  }

  const recentDailyMinutes = Object.entries(dailyMinutesMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 14)
    .map(([date, minutes]) => ({ date, minutes }));

  // Calculate streak
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    if (studyDatesSet.has(dateStr) || dailyMinutesMap[dateStr] > 0) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  // Calculate longest gap between study sessions
  const sortedDates = [...studyDatesSet].sort();
  let longestGap = 0;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = Math.floor(
      (new Date(sortedDates[i]).getTime() - new Date(sortedDates[i - 1]).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff > longestGap) longestGap = diff;
  }

  // Account age
  const { data: userData } = await db.auth.getUser();
  const accountCreatedAt = userData?.user?.created_at || null;
  const totalDaysActive = accountCreatedAt
    ? Math.floor((Date.now() - new Date(accountCreatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalConversations = conversations.length;

  return {
    accountCreatedAt,
    totalDaysActive,

    totalPomodoros: pomodoros.length,
    completedPomodoros: completed.length,
    cancelledPomodoros: cancelled.length,
    completionRate: pomodoros.length > 0 ? Math.round((completed.length / pomodoros.length) * 100) : 0,
    totalStudyMinutes: Math.round(totalStudySeconds / 60),
    avgSessionMinutes: completed.length > 0 ? Math.round(totalStudySeconds / completed.length / 60) : 0,
    subjectBreakdown,
    hourDistribution,
    dayDistribution,

    totalConversations,
    conversationsByType,
    recentConversationTitles: conversations.slice(0, 20).map((c) => c.title || "Isimsiz").filter(Boolean),
    totalMessages: totalMessagesSent,
    avgMessagesPerConversation: totalConversations > 0 ? Math.round(totalMessagesSent / totalConversations) : 0,

    interactionCounts,
    totalFlashcardsSaved: flashcardRes.count || 0,
    totalNotesCreated: noteRes.count || 0,
    totalMindmapNodes: interactionCounts["mindmap_node_added"] || 0,
    totalRoadmapStepsCompleted: interactionCounts["roadmap_step_completed"] || 0,

    pageTimeDistribution,
    totalPageViews: pageTracking.length,

    studyDaysLast30: studyDatesSet.size,
    currentStreak,
    longestGap,
    avgDailyMinutes: studyDatesSet.size > 0
      ? Math.round(Object.values(dailyMinutesMap).reduce((s, v) => s + v, 0) / studyDatesSet.size)
      : 0,
    recentDailyMinutes,

    mentorConversations,

    recentReportSummaries: dailyReports
      .filter((r) => r.llm_analysis)
      .map((r) => r.llm_analysis as string)
      .slice(0, 3),
  };
}

/**
 * Check if profile needs refresh (older than specified hours)
 */
export function isProfileStale(profile: UserProfile | null, maxAgeHours: number = 24): boolean {
  if (!profile) return true;
  const age = Date.now() - new Date(profile.last_updated_at).getTime();
  return age > maxAgeHours * 60 * 60 * 1000;
}
