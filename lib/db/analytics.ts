import { supabase } from "@/lib/supabase";

export interface DailyReport {
  id: string;
  user_id: string;
  report_date: string;
  total_study_minutes: number;
  total_pomodoros: number;
  subjects_studied: Record<string, number>;
  pages_used: Record<string, number>;
  interaction_counts: Record<string, number>;
  llm_analysis: string | null;
  llm_recommendations: string[];
  streak_days: number;
  created_at: string;
}

export interface AnalyticsSummary {
  totalStudyMinutes: number;
  totalPomodoros: number;
  totalMessages: number;
  totalFlashcards: number;
  subjectBreakdown: Record<string, number>;
  dailyStudyHours: { date: string; hours: number }[];
  heatmapData: { date: string; level: number }[];
  recentSessions: {
    type: string;
    subject: string | null;
    duration: number;
    date: string;
  }[];
}

export async function getAnalyticsSummary(
  userId: string,
  periodDays: number = 7
): Promise<AnalyticsSummary> {
  const since = new Date();
  since.setDate(since.getDate() - periodDays);
  since.setHours(0, 0, 0, 0);
  const sinceISO = since.toISOString();

  const [pageRes, pomodoroRes, interactionRes] = await Promise.all([
    supabase
      .from("page_tracking")
      .select("page_name, content_subject, duration_seconds, started_at")
      .eq("user_id", userId)
      .gte("started_at", sinceISO)
      .order("started_at", { ascending: true }),
    supabase
      .from("pomodoro_sessions")
      .select("subject, actual_seconds, started_at, status, session_type")
      .eq("user_id", userId)
      .eq("session_type", "work")
      .gte("started_at", sinceISO)
      .order("started_at", { ascending: false }),
    supabase
      .from("user_interactions")
      .select("interaction_type, subject, created_at")
      .eq("user_id", userId)
      .gte("created_at", sinceISO),
  ]);

  if (pageRes.error) throw pageRes.error;
  if (pomodoroRes.error) throw pomodoroRes.error;
  if (interactionRes.error) throw interactionRes.error;

  const pages = pageRes.data || [];
  const pomodoros = pomodoroRes.data || [];
  const interactions = interactionRes.data || [];

  const totalStudyMinutes = Math.round(
    pages.reduce((sum, p) => sum + p.duration_seconds, 0) / 60
  );

  const completedPomodoros = pomodoros.filter((p) => p.status === "completed");
  const totalPomodoros = completedPomodoros.length;

  const totalMessages = interactions.filter(
    (i) => i.interaction_type === "message_sent"
  ).length;
  const totalFlashcards = interactions.filter(
    (i) =>
      i.interaction_type === "flashcard_saved" ||
      i.interaction_type === "flashcard_flipped"
  ).length;

  // Build subject breakdown from pomodoro sessions (LLM-classified subjects)
  const subjectBreakdown: Record<string, number> = {};
  for (const p of completedPomodoros) {
    const subject = p.subject || "Genel";
    subjectBreakdown[subject] =
      (subjectBreakdown[subject] || 0) + Math.round(p.actual_seconds / 60);
  }

  const dailyMap: Record<string, number> = {};
  for (const p of pages) {
    const date = new Date(p.started_at).toISOString().split("T")[0];
    dailyMap[date] = (dailyMap[date] || 0) + p.duration_seconds;
  }
  const dailyStudyHours = Object.entries(dailyMap).map(([date, seconds]) => ({
    date,
    hours: Math.round((seconds / 3600) * 10) / 10,
  }));

  const heatmapData: { date: string; level: number }[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const seconds = dailyMap[dateStr] || 0;
    const hours = seconds / 3600;
    let level = 0;
    if (hours > 0 && hours < 1) level = 1;
    else if (hours >= 1 && hours < 2) level = 2;
    else if (hours >= 2 && hours < 3) level = 3;
    else if (hours >= 3) level = 4;
    heatmapData.push({ date: dateStr, level });
  }

  const recentSessions = completedPomodoros.slice(0, 10).map((p) => ({
    type: "Pomodoro",
    subject: p.subject,
    duration: Math.round(p.actual_seconds / 60),
    date: p.started_at,
  }));

  return {
    totalStudyMinutes,
    totalPomodoros,
    totalMessages,
    totalFlashcards,
    subjectBreakdown,
    dailyStudyHours,
    heatmapData,
    recentSessions,
  };
}

export async function getLatestDailyReport(
  userId: string
): Promise<DailyReport | null> {
  const { data, error } = await supabase
    .from("daily_reports")
    .select("*")
    .eq("user_id", userId)
    .order("report_date", { ascending: false })
    .limit(1)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function getStreakDays(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("daily_reports")
    .select("report_date, total_study_minutes")
    .eq("user_id", userId)
    .order("report_date", { ascending: false })
    .limit(60);
  if (error) throw error;
  if (!data || data.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < data.length; i++) {
    const reportDate = new Date(data[i].report_date);
    reportDate.setHours(0, 0, 0, 0);
    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);

    if (
      reportDate.getTime() === expectedDate.getTime() &&
      data[i].total_study_minutes > 0
    ) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
