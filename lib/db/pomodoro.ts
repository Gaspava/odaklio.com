import { supabase } from "@/lib/supabase";

export interface PomodoroSession {
  id: string;
  user_id: string;
  conversation_id: string | null;
  subject: string | null;
  session_type: "work" | "break";
  duration_minutes: number;
  actual_seconds: number;
  status: "completed" | "cancelled" | "active";
  started_at: string;
  ended_at: string | null;
  page_context: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function createPomodoroSession(
  userId: string,
  sessionType: "work" | "break",
  durationMinutes: number,
  subject?: string | null,
  conversationId?: string | null,
  pageContext?: string | null
): Promise<PomodoroSession> {
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .insert({
      user_id: userId,
      session_type: sessionType,
      duration_minutes: durationMinutes,
      actual_seconds: 0,
      status: "active",
      started_at: new Date().toISOString(),
      subject: subject || null,
      conversation_id: conversationId || null,
      page_context: pageContext || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function completePomodoroSession(
  sessionId: string,
  actualSeconds: number
): Promise<void> {
  const { error } = await supabase
    .from("pomodoro_sessions")
    .update({
      status: "completed",
      actual_seconds: actualSeconds,
      ended_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function cancelPomodoroSession(
  sessionId: string,
  actualSeconds: number
): Promise<void> {
  const { error } = await supabase
    .from("pomodoro_sessions")
    .update({
      status: "cancelled",
      actual_seconds: actualSeconds,
      ended_at: new Date().toISOString(),
    })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function getTodayPomodoros(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count, error } = await supabase
    .from("pomodoro_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("session_type", "work")
    .eq("status", "completed")
    .gte("started_at", today.toISOString());
  if (error) throw error;
  return count || 0;
}

export async function getRecentSessions(
  userId: string,
  limit: number = 10
): Promise<PomodoroSession[]> {
  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("session_type", "work")
    .in("status", ["completed", "cancelled"])
    .order("started_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getPomodoroStats(
  userId: string,
  days: number = 7
): Promise<{ date: string; count: number; totalMinutes: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select("started_at, actual_seconds")
    .eq("user_id", userId)
    .eq("session_type", "work")
    .eq("status", "completed")
    .gte("started_at", since.toISOString())
    .order("started_at", { ascending: true });
  if (error) throw error;

  const byDate: Record<string, { count: number; totalMinutes: number }> = {};
  for (const s of data || []) {
    const date = new Date(s.started_at).toISOString().split("T")[0];
    if (!byDate[date]) byDate[date] = { count: 0, totalMinutes: 0 };
    byDate[date].count++;
    byDate[date].totalMinutes += Math.round(s.actual_seconds / 60);
  }

  return Object.entries(byDate).map(([date, stats]) => ({ date, ...stats }));
}
