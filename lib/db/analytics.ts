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

export interface PageSession {
  page_name: string;
  content_title: string | null;
  content_subject: string | null;
  duration_seconds: number;
  started_at: string;
}

export interface AnalyticsSummary {
  totalStudyMinutes: number;
  activeDaysLast30: number;
  totalMessages: number;
  totalFlashcards: number;
  subjectBreakdown: Record<string, number>;
  dailyStudyHours: { date: string; hours: number }[];
  heatmapData: { date: string; level: number }[];
  recentPageSessions: PageSession[];
  pageTimeDistribution: Record<string, number>;
}

export async function getAnalyticsSummary(
  userId: string,
  periodDays: number = 7
): Promise<AnalyticsSummary> {
  const since = new Date();
  since.setDate(since.getDate() - periodDays);
  since.setHours(0, 0, 0, 0);
  const sinceISO = since.toISOString();

  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);
  since30.setHours(0, 0, 0, 0);
  const since30ISO = since30.toISOString();

  const [pageRes, interactionRes, page30Res] = await Promise.all([
    supabase
      .from("page_tracking")
      .select("page_name, content_subject, content_title, duration_seconds, started_at")
      .eq("user_id", userId)
      .gte("started_at", sinceISO)
      .order("started_at", { ascending: true }),
    supabase
      .from("user_interactions")
      .select("interaction_type, subject, created_at")
      .eq("user_id", userId)
      .gte("created_at", sinceISO),
    supabase
      .from("page_tracking")
      .select("started_at")
      .eq("user_id", userId)
      .gte("started_at", since30ISO),
  ]);

  if (pageRes.error) throw pageRes.error;
  if (interactionRes.error) throw interactionRes.error;
  if (page30Res.error) throw page30Res.error;

  const pages = pageRes.data || [];
  const interactions = interactionRes.data || [];
  const pages30 = page30Res.data || [];

  const totalStudyMinutes = Math.round(
    pages.reduce((sum, p) => sum + p.duration_seconds, 0) / 60
  );

  const totalMessages = interactions.filter(
    (i) => i.interaction_type === "message_sent"
  ).length;
  const totalFlashcards = interactions.filter(
    (i) =>
      i.interaction_type === "flashcard_saved" ||
      i.interaction_type === "flashcard_flipped"
  ).length;

  // activeDaysLast30 — distinct days from page_tracking in last 30 days
  const distinctDays30 = new Set(
    pages30.map((p) => new Date(p.started_at).toISOString().split("T")[0])
  );
  const activeDaysLast30 = distinctDays30.size;

  // subjectBreakdown — from page_tracking.content_subject
  const subjectBreakdown: Record<string, number> = {};
  for (const p of pages) {
    if (!p.content_subject) continue;
    subjectBreakdown[p.content_subject] =
      (subjectBreakdown[p.content_subject] || 0) + Math.round(p.duration_seconds / 60);
  }

  // pageTimeDistribution — page_name → total minutes
  const pageTimeDistribution: Record<string, number> = {};
  for (const p of pages) {
    const name = p.page_name || "diger";
    pageTimeDistribution[name] =
      (pageTimeDistribution[name] || 0) + p.duration_seconds / 60;
  }
  // Round all values
  for (const key of Object.keys(pageTimeDistribution)) {
    pageTimeDistribution[key] = Math.round(pageTimeDistribution[key]);
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

  // recentPageSessions — last 10 page_tracking records with duration > 30s
  const recentPageSessions: PageSession[] = pages
    .filter((p) => p.duration_seconds > 30)
    .slice(-10)
    .reverse()
    .map((p) => ({
      page_name: p.page_name,
      content_title: p.content_title ?? null,
      content_subject: p.content_subject ?? null,
      duration_seconds: p.duration_seconds,
      started_at: p.started_at,
    }));

  return {
    totalStudyMinutes,
    activeDaysLast30,
    totalMessages,
    totalFlashcards,
    subjectBreakdown,
    dailyStudyHours,
    heatmapData,
    recentPageSessions,
    pageTimeDistribution,
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
