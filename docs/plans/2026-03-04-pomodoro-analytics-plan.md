# Pomodoro & Analytics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a working Pomodoro timer with persistent storage, page/interaction tracking, and LLM-powered daily analytics.

**Architecture:** All data in Supabase PostgreSQL. Two new React Context providers (PomodoroProvider, PageTrackingProvider) manage client-side state and sync to DB. A Supabase Edge Function generates daily LLM reports via Gemini API. AnalysisPage reads real aggregated data.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (PostgreSQL + Edge Functions + RLS), Google Gemini API, Tailwind CSS 4

---

## Task 1: Create Database Tables (Supabase Migration)

**Files:**
- Supabase migration (applied via MCP tool)

**Step 1: Apply the migration**

Use `mcp__supabase__apply_migration` with project_id `yisjudndkgbebtopeqyt`:

```sql
-- Pomodoro sessions
CREATE TABLE pomodoro_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  subject text,
  session_type text NOT NULL CHECK (session_type IN ('work', 'break')),
  duration_minutes integer NOT NULL,
  actual_seconds integer NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('completed', 'cancelled', 'active')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  page_context text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Page tracking
CREATE TABLE page_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_name text NOT NULL,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  content_title text,
  content_subject text,
  duration_seconds integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User interactions
CREATE TABLE user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN (
    'message_sent', 'flashcard_flipped', 'flashcard_saved',
    'roadmap_step_completed', 'mindmap_node_added',
    'pomodoro_completed', 'note_created'
  )),
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  subject text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Daily reports
CREATE TABLE daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_date date NOT NULL,
  total_study_minutes integer NOT NULL DEFAULT 0,
  total_pomodoros integer NOT NULL DEFAULT 0,
  subjects_studied jsonb DEFAULT '{}',
  pages_used jsonb DEFAULT '{}',
  interaction_counts jsonb DEFAULT '{}',
  llm_analysis text,
  llm_recommendations jsonb DEFAULT '[]',
  streak_days integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, report_date)
);

-- Indexes for performance
CREATE INDEX idx_pomodoro_sessions_user_date ON pomodoro_sessions(user_id, started_at DESC);
CREATE INDEX idx_page_tracking_user_date ON page_tracking(user_id, started_at DESC);
CREATE INDEX idx_user_interactions_user_date ON user_interactions(user_id, created_at DESC);
CREATE INDEX idx_daily_reports_user_date ON daily_reports(user_id, report_date DESC);

-- RLS Policies
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pomodoro sessions"
  ON pomodoro_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own page tracking"
  ON page_tracking FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own interactions"
  ON user_interactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own daily reports"
  ON daily_reports FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Migration name: `add_pomodoro_tracking_analytics`

**Step 2: Verify migration**

Use `mcp__supabase__list_tables` to confirm all 4 new tables exist with correct columns.

**Step 3: Run security advisors**

Use `mcp__supabase__get_advisors` type=security to verify RLS policies are correctly set up.

**Step 4: Commit**

```bash
git add -A && git commit -m "feat: add pomodoro, tracking, and analytics database tables"
```

---

## Task 2: Create Pomodoro DB Functions

**Files:**
- Create: `lib/db/pomodoro.ts`

**Step 1: Create the pomodoro DB functions file**

Create `lib/db/pomodoro.ts` with these functions following the existing pattern in `lib/db/conversations.ts`:

```typescript
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
```

**Step 2: Verify build**

```bash
cd C:/Users/kutayy/Desktop/odaklio && npx tsc --noEmit --pretty 2>&1 | head -20
```

**Step 3: Commit**

```bash
git add lib/db/pomodoro.ts && git commit -m "feat: add pomodoro database functions"
```

---

## Task 3: Create Tracking & Analytics DB Functions

**Files:**
- Create: `lib/db/tracking.ts`
- Create: `lib/db/analytics.ts`

**Step 1: Create tracking DB functions**

Create `lib/db/tracking.ts`:

```typescript
import { supabase } from "@/lib/supabase";

export type InteractionType =
  | "message_sent"
  | "flashcard_flipped"
  | "flashcard_saved"
  | "roadmap_step_completed"
  | "mindmap_node_added"
  | "pomodoro_completed"
  | "note_created";

export interface PageTrackingRecord {
  id: string;
  user_id: string;
  page_name: string;
  conversation_id: string | null;
  content_title: string | null;
  content_subject: string | null;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export async function createPageTrackingRecord(
  userId: string,
  pageName: string,
  conversationId?: string | null,
  contentTitle?: string | null,
  contentSubject?: string | null
): Promise<PageTrackingRecord> {
  const { data, error } = await supabase
    .from("page_tracking")
    .insert({
      user_id: userId,
      page_name: pageName,
      conversation_id: conversationId || null,
      content_title: contentTitle || null,
      content_subject: contentSubject || null,
      duration_seconds: 0,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function finalizePageTracking(
  recordId: string,
  durationSeconds: number
): Promise<void> {
  const { error } = await supabase
    .from("page_tracking")
    .update({
      duration_seconds: durationSeconds,
      ended_at: new Date().toISOString(),
    })
    .eq("id", recordId);
  if (error) throw error;
}

export async function batchInsertInteractions(
  interactions: {
    user_id: string;
    interaction_type: InteractionType;
    conversation_id?: string | null;
    subject?: string | null;
    metadata?: Record<string, unknown>;
  }[]
): Promise<void> {
  if (interactions.length === 0) return;
  const rows = interactions.map((i) => ({
    user_id: i.user_id,
    interaction_type: i.interaction_type,
    conversation_id: i.conversation_id || null,
    subject: i.subject || null,
    metadata: i.metadata || {},
  }));
  const { error } = await supabase.from("user_interactions").insert(rows);
  if (error) throw error;
}

export async function insertInteraction(
  userId: string,
  interactionType: InteractionType,
  conversationId?: string | null,
  subject?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from("user_interactions").insert({
    user_id: userId,
    interaction_type: interactionType,
    conversation_id: conversationId || null,
    subject: subject || null,
    metadata: metadata || {},
  });
  if (error) throw error;
}
```

**Step 2: Create analytics DB functions**

Create `lib/db/analytics.ts`:

```typescript
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

  // Parallel queries
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

  // Total study minutes from page tracking
  const totalStudyMinutes = Math.round(
    pages.reduce((sum, p) => sum + p.duration_seconds, 0) / 60
  );

  // Total completed pomodoros
  const completedPomodoros = pomodoros.filter((p) => p.status === "completed");
  const totalPomodoros = completedPomodoros.length;

  // Interaction counts
  const totalMessages = interactions.filter(
    (i) => i.interaction_type === "message_sent"
  ).length;
  const totalFlashcards = interactions.filter(
    (i) =>
      i.interaction_type === "flashcard_saved" ||
      i.interaction_type === "flashcard_flipped"
  ).length;

  // Subject breakdown (minutes per subject from page tracking)
  const subjectBreakdown: Record<string, number> = {};
  for (const p of pages) {
    const subject = p.content_subject || "Genel";
    subjectBreakdown[subject] =
      (subjectBreakdown[subject] || 0) + Math.round(p.duration_seconds / 60);
  }

  // Daily study hours
  const dailyMap: Record<string, number> = {};
  for (const p of pages) {
    const date = new Date(p.started_at).toISOString().split("T")[0];
    dailyMap[date] = (dailyMap[date] || 0) + p.duration_seconds;
  }
  const dailyStudyHours = Object.entries(dailyMap).map(([date, seconds]) => ({
    date,
    hours: Math.round((seconds / 3600) * 10) / 10,
  }));

  // Heatmap (last 28 days)
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

  // Recent sessions (last 10 pomodoros)
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
```

**Step 3: Verify build**

```bash
cd C:/Users/kutayy/Desktop/odaklio && npx tsc --noEmit --pretty 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add lib/db/tracking.ts lib/db/analytics.ts && git commit -m "feat: add tracking and analytics database functions"
```

---

## Task 4: Create PomodoroProvider

**Files:**
- Create: `app/providers/PomodoroProvider.tsx`

**Step 1: Create the PomodoroProvider**

Create `app/providers/PomodoroProvider.tsx`:

```typescript
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";
import { useConversation } from "./ConversationProvider";
import {
  createPomodoroSession,
  completePomodoroSession,
  cancelPomodoroSession,
  getTodayPomodoros,
} from "@/lib/db/pomodoro";

interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

interface PomodoroContextType {
  isRunning: boolean;
  isPaused: boolean;
  mode: "work" | "break";
  timeLeft: number; // seconds
  totalTime: number; // seconds
  settings: PomodoroSettings;
  completedPomodoros: number;
  currentSubject: string | null;
  currentPage: string;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  reset: () => Promise<void>;
  skip: () => Promise<void>;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  setCurrentPage: (page: string) => void;
  setCurrentSubject: (subject: string | null) => void;
}

const defaultSettings: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
};

const PomodoroContext = createContext<PomodoroContextType>({
  isRunning: false,
  isPaused: false,
  mode: "work",
  timeLeft: 25 * 60,
  totalTime: 25 * 60,
  settings: defaultSettings,
  completedPomodoros: 0,
  currentSubject: null,
  currentPage: "focus",
  start: async () => {},
  pause: () => {},
  resume: () => {},
  reset: async () => {},
  skip: async () => {},
  updateSettings: () => {},
  setCurrentPage: () => {},
  setCurrentSubject: () => {},
});

export function usePomodoro() {
  return useContext(PomodoroContext);
}

export default function PomodoroProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const { activeConversationId, activeConversationType } = useConversation();

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("odaklio-pomodoro-settings");
      if (saved) {
        try { return JSON.parse(saved); } catch { /* use default */ }
      }
    }
    return defaultSettings;
  });
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);
  const [totalTime, setTotalTime] = useState(settings.workMinutes * 60);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState("focus");
  const [pomodoroCount, setPomodoroCount] = useState(0); // count within cycle for long break

  const sessionIdRef = useRef<string | null>(null);
  const elapsedRef = useRef(0);

  // Load today's completed count on mount
  useEffect(() => {
    if (user) {
      getTodayPomodoros(user.id)
        .then(setCompletedPomodoros)
        .catch(console.error);
    }
  }, [user?.id]);

  // Persist settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "odaklio-pomodoro-settings",
        JSON.stringify(settings)
      );
    }
  }, [settings]);

  // Timer interval
  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => {
      elapsedRef.current += 1;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused, mode]);

  const handleTimerComplete = useCallback(async () => {
    if (!user) return;

    // Complete current session in DB
    if (sessionIdRef.current) {
      try {
        await completePomodoroSession(sessionIdRef.current, elapsedRef.current);
      } catch (e) {
        console.error("Failed to complete pomodoro session:", e);
      }
      sessionIdRef.current = null;
    }

    if (mode === "work") {
      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);
      setCompletedPomodoros((prev) => prev + 1);

      // Switch to break
      const isLongBreak = newCount % 4 === 0;
      const breakMinutes = isLongBreak
        ? settings.longBreakMinutes
        : settings.shortBreakMinutes;
      setMode("break");
      setTimeLeft(breakMinutes * 60);
      setTotalTime(breakMinutes * 60);
      elapsedRef.current = 0;

      // Auto-start break session
      try {
        const session = await createPomodoroSession(
          user.id,
          "break",
          breakMinutes,
          currentSubject,
          activeConversationId,
          currentPage
        );
        sessionIdRef.current = session.id;
      } catch (e) {
        console.error("Failed to create break session:", e);
      }
    } else {
      // Break complete, switch to work
      setMode("work");
      setTimeLeft(settings.workMinutes * 60);
      setTotalTime(settings.workMinutes * 60);
      elapsedRef.current = 0;
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [
    user,
    mode,
    pomodoroCount,
    settings,
    currentSubject,
    activeConversationId,
    currentPage,
  ]);

  const start = useCallback(async () => {
    if (!user) return;
    const minutes =
      mode === "work"
        ? settings.workMinutes
        : settings.shortBreakMinutes;
    setTimeLeft(minutes * 60);
    setTotalTime(minutes * 60);
    elapsedRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);

    try {
      const session = await createPomodoroSession(
        user.id,
        mode,
        minutes,
        currentSubject,
        activeConversationId,
        currentPage
      );
      sessionIdRef.current = session.id;
    } catch (e) {
      console.error("Failed to create pomodoro session:", e);
    }
  }, [user, mode, settings, currentSubject, activeConversationId, currentPage]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback(async () => {
    if (sessionIdRef.current) {
      try {
        await cancelPomodoroSession(sessionIdRef.current, elapsedRef.current);
      } catch (e) {
        console.error("Failed to cancel pomodoro session:", e);
      }
      sessionIdRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
    setMode("work");
    setTimeLeft(settings.workMinutes * 60);
    setTotalTime(settings.workMinutes * 60);
    elapsedRef.current = 0;
  }, [settings]);

  const skip = useCallback(async () => {
    if (mode === "break") {
      if (sessionIdRef.current) {
        try {
          await completePomodoroSession(
            sessionIdRef.current,
            elapsedRef.current
          );
        } catch (e) {
          console.error("Failed to complete break session:", e);
        }
        sessionIdRef.current = null;
      }
      setMode("work");
      setTimeLeft(settings.workMinutes * 60);
      setTotalTime(settings.workMinutes * 60);
      elapsedRef.current = 0;
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [mode, settings]);

  const updateSettings = useCallback(
    (newSettings: Partial<PomodoroSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        if (!isRunning) {
          if (mode === "work") {
            setTimeLeft(updated.workMinutes * 60);
            setTotalTime(updated.workMinutes * 60);
          }
        }
        return updated;
      });
    },
    [isRunning, mode]
  );

  // Auto-detect subject from conversation context
  useEffect(() => {
    if (!isRunning) return; // only update while running
    // Subject detection will be handled by page components calling setCurrentSubject
  }, [activeConversationId, activeConversationType, isRunning]);

  return (
    <PomodoroContext.Provider
      value={{
        isRunning,
        isPaused,
        mode,
        timeLeft,
        totalTime,
        settings,
        completedPomodoros,
        currentSubject,
        currentPage,
        start,
        pause,
        resume,
        reset,
        skip,
        updateSettings,
        setCurrentPage,
        setCurrentSubject,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}
```

**Step 2: Verify build**

```bash
cd C:/Users/kutayy/Desktop/odaklio && npx tsc --noEmit --pretty 2>&1 | head -20
```

**Step 3: Commit**

```bash
git add app/providers/PomodoroProvider.tsx && git commit -m "feat: add PomodoroProvider with timer logic and DB persistence"
```

---

## Task 5: Create PageTrackingProvider

**Files:**
- Create: `app/providers/PageTrackingProvider.tsx`

**Step 1: Create the PageTrackingProvider**

Create `app/providers/PageTrackingProvider.tsx`:

```typescript
"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";
import {
  createPageTrackingRecord,
  finalizePageTracking,
  insertInteraction,
  batchInsertInteractions,
  InteractionType,
} from "@/lib/db/tracking";

interface PageTrackingContextType {
  trackPageChange: (
    pageName: string,
    conversationId?: string | null,
    contentTitle?: string | null,
    contentSubject?: string | null
  ) => void;
  trackInteraction: (
    type: InteractionType,
    conversationId?: string | null,
    subject?: string | null,
    metadata?: Record<string, unknown>
  ) => void;
}

const PageTrackingContext = createContext<PageTrackingContextType>({
  trackPageChange: () => {},
  trackInteraction: () => {},
});

export function usePageTracking() {
  return useContext(PageTrackingContext);
}

export default function PageTrackingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const currentRecordIdRef = useRef<string | null>(null);
  const pageStartRef = useRef<number>(Date.now());
  const currentPageRef = useRef<string>("");
  const isVisibleRef = useRef(true);
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedRef = useRef(0);

  // Interaction batching
  const pendingInteractionsRef = useRef<
    {
      user_id: string;
      interaction_type: InteractionType;
      conversation_id?: string | null;
      subject?: string | null;
      metadata?: Record<string, unknown>;
    }[]
  >([]);

  const flushInteractions = useCallback(async () => {
    if (pendingInteractionsRef.current.length === 0) return;
    const batch = [...pendingInteractionsRef.current];
    pendingInteractionsRef.current = [];
    try {
      await batchInsertInteractions(batch);
    } catch (e) {
      console.error("Failed to flush interactions:", e);
      // Put back on failure
      pendingInteractionsRef.current.unshift(...batch);
    }
  }, []);

  const finalizeCurrentPage = useCallback(async () => {
    if (!currentRecordIdRef.current) return;
    const elapsed = Math.round(
      (Date.now() - pageStartRef.current - totalPausedRef.current) / 1000
    );
    if (elapsed < 2) {
      // Skip very short visits
      currentRecordIdRef.current = null;
      return;
    }
    try {
      await finalizePageTracking(currentRecordIdRef.current, elapsed);
    } catch (e) {
      console.error("Failed to finalize page tracking:", e);
    }
    currentRecordIdRef.current = null;
  }, []);

  const trackPageChange = useCallback(
    async (
      pageName: string,
      conversationId?: string | null,
      contentTitle?: string | null,
      contentSubject?: string | null
    ) => {
      if (!user) return;
      if (pageName === currentPageRef.current) return; // same page, skip

      // Finalize previous page
      await finalizeCurrentPage();
      await flushInteractions();

      // Start tracking new page
      currentPageRef.current = pageName;
      pageStartRef.current = Date.now();
      totalPausedRef.current = 0;

      try {
        const record = await createPageTrackingRecord(
          user.id,
          pageName,
          conversationId,
          contentTitle,
          contentSubject
        );
        currentRecordIdRef.current = record.id;
      } catch (e) {
        console.error("Failed to create page tracking record:", e);
      }
    },
    [user, finalizeCurrentPage, flushInteractions]
  );

  const trackInteraction = useCallback(
    (
      type: InteractionType,
      conversationId?: string | null,
      subject?: string | null,
      metadata?: Record<string, unknown>
    ) => {
      if (!user) return;
      pendingInteractionsRef.current.push({
        user_id: user.id,
        interaction_type: type,
        conversation_id: conversationId,
        subject,
        metadata,
      });
    },
    [user]
  );

  // Flush interactions every 30 seconds
  useEffect(() => {
    const interval = setInterval(flushInteractions, 30000);
    return () => clearInterval(interval);
  }, [flushInteractions]);

  // Visibility change handler (pause when tab hidden)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        isVisibleRef.current = false;
        pausedAtRef.current = Date.now();
      } else {
        isVisibleRef.current = true;
        if (pausedAtRef.current) {
          totalPausedRef.current += Date.now() - pausedAtRef.current;
          pausedAtRef.current = null;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Flush on page unload
  useEffect(() => {
    const handleUnload = () => {
      // Use sendBeacon for reliable delivery
      finalizeCurrentPage();
      flushInteractions();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [finalizeCurrentPage, flushInteractions]);

  return (
    <PageTrackingContext.Provider value={{ trackPageChange, trackInteraction }}>
      {children}
    </PageTrackingContext.Provider>
  );
}
```

**Step 2: Verify build**

```bash
cd C:/Users/kutayy/Desktop/odaklio && npx tsc --noEmit --pretty 2>&1 | head -20
```

**Step 3: Commit**

```bash
git add app/providers/PageTrackingProvider.tsx && git commit -m "feat: add PageTrackingProvider with visibility tracking and interaction batching"
```

---

## Task 6: Wire Providers into Layout

**Files:**
- Modify: `app/layout.tsx`

**Step 1: Add providers to layout**

Import and wrap the new providers in `app/layout.tsx`. The provider nesting order should be:

```
ThemeProvider > AuthProvider > ConversationProvider > PomodoroProvider > PageTrackingProvider > {children}
```

Add imports:
```typescript
import PomodoroProvider from "./providers/PomodoroProvider";
import PageTrackingProvider from "./providers/PageTrackingProvider";
```

Wrap children:
```typescript
<ConversationProvider>
  <PomodoroProvider>
    <PageTrackingProvider>
      {children}
    </PageTrackingProvider>
  </PomodoroProvider>
</ConversationProvider>
```

**Step 2: Verify the app loads**

```bash
cd C:/Users/kutayy/Desktop/odaklio && npm run dev &
# Wait for it to start, then check for errors
```

**Step 3: Commit**

```bash
git add app/layout.tsx && git commit -m "feat: wire PomodoroProvider and PageTrackingProvider into layout"
```

---

## Task 7: Update PomodoroPopup Component

**Files:**
- Modify: `app/components/tools/PomodoroPopup.tsx`

**Step 1: Refactor PomodoroPopup to use PomodoroProvider**

Replace all local timer state (isRunning, minutes, seconds, mode) with `usePomodoro()` hook. The component should:

1. Remove all local timer state and useEffect timer logic
2. Import and use `usePomodoro()` for all state and actions
3. Add a settings section with 3 number inputs (work, short break, long break minutes)
4. Add a session history section showing last 5 sessions (from `getRecentSessions`)
5. Show current auto-detected subject
6. Keep the existing SVG circular progress UI but calculate from `timeLeft / totalTime`

Key changes:
- `const { isRunning, isPaused, mode, timeLeft, totalTime, settings, completedPomodoros, currentSubject, start, pause, resume, reset, skip, updateSettings } = usePomodoro();`
- `const minutes = Math.floor(timeLeft / 60);`
- `const seconds = timeLeft % 60;`
- `const progress = ((totalTime - timeLeft) / totalTime) * 100;`
- Play button calls `isRunning ? (isPaused ? resume() : pause()) : start()`
- Reset button calls `reset()`
- Add settings toggle section below timer
- Add `getRecentSessions` call in useEffect for session history

**Step 2: Verify the timer works in the popup**

Open the app, navigate to Tools, click Pomodoro, verify:
- Timer starts/stops/resets
- Mode switches on completion
- Settings can be changed

**Step 3: Commit**

```bash
git add app/components/tools/PomodoroPopup.tsx && git commit -m "feat: connect PomodoroPopup to PomodoroProvider with settings and history"
```

---

## Task 8: Update LeftPanel PomodoroMini

**Files:**
- Modify: `app/components/layout/LeftPanel.tsx`

**Step 1: Refactor PomodoroMini section**

In `LeftPanel.tsx`, find the `PomodoroMini` function/section and:

1. Remove all local timer state
2. Import and use `usePomodoro()` hook
3. Show real `completedPomodoros` instead of hardcoded `2`
4. Keep the daily goal of 4 or make it configurable later
5. Show `currentSubject` label below the timer
6. Add a small settings icon button that opens a dropdown for duration settings
7. Timer controls (play/pause/reset) use provider actions

Key calculation:
- `const minutes = Math.floor(timeLeft / 60);`
- `const seconds = timeLeft % 60;`
- `const progress = ((totalTime - timeLeft) / totalTime) * 100;`
- `const goalProgress = (completedPomodoros / dailyGoal) * 100;`

**Step 2: Verify sidebar timer works**

Open app, verify sidebar shows timer with real count and controls work.

**Step 3: Commit**

```bash
git add app/components/layout/LeftPanel.tsx && git commit -m "feat: connect LeftPanel PomodoroMini to PomodoroProvider"
```

---

## Task 9: Update MiniSidebar

**Files:**
- Modify: `app/components/layout/MiniSidebar.tsx`

**Step 1: Connect MiniSidebar to PomodoroProvider**

1. Import `usePomodoro()`
2. Replace local `pomodoroRunning` and `pomodoroTime` with provider state
3. The running indicator should show `timeLeft` formatted as MM:SS
4. Clicking the button still toggles the PomodoroPopup

Key:
```typescript
const { isRunning, timeLeft } = usePomodoro();
const pomodoroMinutes = Math.floor(timeLeft / 60);
const pomodoroSeconds = timeLeft % 60;
```

**Step 2: Verify mini sidebar shows timer**

Open app in focus mode, verify mini sidebar shows running timer.

**Step 3: Commit**

```bash
git add app/components/layout/MiniSidebar.tsx && git commit -m "feat: connect MiniSidebar to PomodoroProvider"
```

---

## Task 10: Add Page Tracking to Dashboard

**Files:**
- Modify: `app/components/dashboard/Dashboard.tsx`

**Step 1: Add page tracking calls**

1. Import `usePageTracking()` and `usePomodoro()`
2. When `activePage` changes, call `trackPageChange(activePage, conversationId, title, subject)`
3. When `activePage` changes, also call `setCurrentPage(activePage)` on PomodoroProvider
4. Auto-detect subject from conversation context:
   - For chat: use conversation title
   - For roadmap: use conversation title
   - For flashcard: use conversation title
   - Call `setCurrentSubject(detectedSubject)` on PomodoroProvider

Add a useEffect:
```typescript
const { trackPageChange } = usePageTracking();
const { setCurrentPage, setCurrentSubject } = usePomodoro();

useEffect(() => {
  trackPageChange(activePage, activeConversationId, conversationTitle, null);
  setCurrentPage(activePage);
}, [activePage, activeConversationId]);
```

**Step 2: Verify page tracking records are created**

Navigate between pages, check `page_tracking` table in Supabase for new records.

**Step 3: Commit**

```bash
git add app/components/dashboard/Dashboard.tsx && git commit -m "feat: add page tracking and subject detection to Dashboard"
```

---

## Task 11: Add Interaction Tracking Hooks

**Files:**
- Modify: `app/providers/ConversationProvider.tsx`

**Step 1: Add interaction tracking to existing functions**

1. Import `usePageTracking` is not possible here (provider ordering), so import `insertInteraction` directly from `lib/db/tracking`
2. In `saveUserMessage()` - after successful save, call `insertInteraction(user.id, 'message_sent', conversationId)`
3. In flashcard-related functions - call `insertInteraction(user.id, 'flashcard_saved', conversationId)`
4. In roadmap step completion - call `insertInteraction(user.id, 'roadmap_step_completed', conversationId)`
5. In mindmap node creation - call `insertInteraction(user.id, 'mindmap_node_added', conversationId)`
6. In note creation functions - call `insertInteraction(user.id, 'note_created')`

These should be fire-and-forget (don't await, catch errors silently):
```typescript
insertInteraction(user.id, 'message_sent', activeConversationId).catch(console.error);
```

**Step 2: Verify interactions are recorded**

Send a chat message, check `user_interactions` table in Supabase.

**Step 3: Commit**

```bash
git add app/providers/ConversationProvider.tsx && git commit -m "feat: add interaction tracking to ConversationProvider"
```

---

## Task 12: Rewrite AnalysisPage with Real Data

**Files:**
- Modify: `app/components/pages/AnalysisPage.tsx`

**Step 1: Replace mock data with real analytics**

This is the largest single change. The existing AnalysisPage structure/UI should be kept, but all hardcoded data replaced with real data from `getAnalyticsSummary()` and `getLatestDailyReport()`.

1. Import `useAuth`, `getAnalyticsSummary`, `getLatestDailyReport`, `getStreakDays` from analytics
2. Add `useState` for period selection ('week' | 'month' | 'all') - map to days (7, 30, 365)
3. Add `useEffect` to load data on mount and when period changes
4. Add loading state while data fetches
5. Replace each section's hardcoded data:

**Quick Stats:**
- Total study time: `summary.totalStudyMinutes` formatted as hours
- Completed pomodoros: `summary.totalPomodoros`
- Chat count: `summary.totalMessages`
- Flashcard count: `summary.totalFlashcards`

**Weekly Activity Chart:**
- Use `summary.dailyStudyHours` array
- Generate day labels from dates

**Activity Heatmap:**
- Use `summary.heatmapData` array

**Subject Progress:**
- Use `summary.subjectBreakdown` object
- Calculate percentages relative to max

**Recent Sessions:**
- Use `summary.recentSessions` array

**Streak:**
- Use streak from `getStreakDays()`

**LLM Report Section (new):**
- Show `report.llm_analysis` text
- Show `report.llm_recommendations` as bullet list
- Show report date
- If no report exists, show "Henuz rapor olusturulmadi" message

6. Keep all existing CSS classes and styling patterns
7. Period selector buttons should actually change the data

**Step 2: Verify analytics page loads with real data**

Open Analysis page, verify it shows real data (may be empty initially - that's ok, show zeros and "no data" states).

**Step 3: Commit**

```bash
git add app/components/pages/AnalysisPage.tsx && git commit -m "feat: replace mock analytics with real data from Supabase"
```

---

## Task 13: Deploy Daily Report Edge Function

**Files:**
- Supabase Edge Function: `daily-report`

**Step 1: Create and deploy the Edge Function**

Use `mcp__supabase__deploy_edge_function` to deploy:

Function name: `daily-report`
verify_jwt: false (called by cron, not user)

The Edge Function should:
1. Accept POST with `{ user_id: string }` body OR run for all users if no body
2. Query today's `page_tracking`, `pomodoro_sessions`, and `user_interactions` for the user
3. Calculate totals: study minutes, pomodoro count, subject breakdown, page usage, interaction counts
4. Calculate streak (consecutive days with >0 study minutes)
5. Build a prompt for Gemini with the stats, requesting Turkish analysis and 3-5 recommendations
6. Call Gemini API (`gemini-2.0-flash`) with the prompt
7. Upsert into `daily_reports` table

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const geminiKey = Deno.env.get("GEMINI_API_KEY")!;

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let userIds: string[] = [];

    // Check if specific user requested
    try {
      const body = await req.json();
      if (body.user_id) userIds = [body.user_id];
    } catch {
      // No body - run for all active users today
    }

    if (userIds.length === 0) {
      // Get all users who had activity today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: activeUsers } = await supabase
        .from("page_tracking")
        .select("user_id")
        .gte("started_at", today.toISOString());

      const uniqueIds = new Set((activeUsers || []).map(u => u.user_id));
      userIds = [...uniqueIds];
    }

    const results = [];

    for (const userId of userIds) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();
      const todayDate = today.toISOString().split("T")[0];

      // Fetch today's data
      const [pageRes, pomodoroRes, interactionRes] = await Promise.all([
        supabase.from("page_tracking").select("*").eq("user_id", userId).gte("started_at", todayISO),
        supabase.from("pomodoro_sessions").select("*").eq("user_id", userId).eq("session_type", "work").eq("status", "completed").gte("started_at", todayISO),
        supabase.from("user_interactions").select("*").eq("user_id", userId).gte("created_at", todayISO),
      ]);

      const pages = pageRes.data || [];
      const pomodoros = pomodoroRes.data || [];
      const interactions = interactionRes.data || [];

      const totalStudyMinutes = Math.round(pages.reduce((s, p) => s + (p.duration_seconds || 0), 0) / 60);
      const totalPomodoros = pomodoros.length;

      // Subject breakdown
      const subjects: Record<string, number> = {};
      for (const p of pages) {
        const sub = p.content_subject || "Genel";
        subjects[sub] = (subjects[sub] || 0) + Math.round((p.duration_seconds || 0) / 60);
      }

      // Pages used
      const pagesUsed: Record<string, number> = {};
      for (const p of pages) {
        pagesUsed[p.page_name] = (pagesUsed[p.page_name] || 0) + (p.duration_seconds || 0);
      }

      // Interaction counts
      const intCounts: Record<string, number> = {};
      for (const i of interactions) {
        intCounts[i.interaction_type] = (intCounts[i.interaction_type] || 0) + 1;
      }

      // Calculate streak
      const { data: recentReports } = await supabase
        .from("daily_reports")
        .select("report_date, total_study_minutes")
        .eq("user_id", userId)
        .order("report_date", { ascending: false })
        .limit(60);

      let streak = totalStudyMinutes > 0 ? 1 : 0;
      if (recentReports && streak > 0) {
        for (let i = 0; i < recentReports.length; i++) {
          const rd = new Date(recentReports[i].report_date);
          const expected = new Date(today);
          expected.setDate(expected.getDate() - (i + 1));
          if (rd.toISOString().split("T")[0] === expected.toISOString().split("T")[0] && recentReports[i].total_study_minutes > 0) {
            streak++;
          } else {
            break;
          }
        }
      }

      // Generate LLM analysis
      let llmAnalysis = "";
      let llmRecommendations: string[] = [];

      if (totalStudyMinutes > 0) {
        const prompt = `Sen bir egitim danismanisin. Asagidaki ogrencinin bugunki calisma verilerini analiz et.

Toplam calisma suresi: ${totalStudyMinutes} dakika
Tamamlanan pomodoro: ${totalPomodoros}
Calistigi konular: ${JSON.stringify(subjects)}
Kullandigi sayfalar: ${JSON.stringify(pagesUsed)}
Etkilesimler: ${JSON.stringify(intCounts)}
Seri gun sayisi: ${streak}

Lutfen:
1. Kisa ve motive edici bir analiz yaz (2-3 cumle)
2. 3-5 somut oneri ver (JSON array olarak)

Yaniti su formatta ver:
ANALIZ: [analiz metni]
ONERILER: ["oneri1", "oneri2", "oneri3"]`;

        try {
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          );
          const geminiData = await geminiRes.json();
          const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

          const analysisMatch = text.match(/ANALIZ:\s*(.*?)(?=ONERILER:|$)/s);
          if (analysisMatch) llmAnalysis = analysisMatch[1].trim();

          const recMatch = text.match(/ONERILER:\s*(\[.*?\])/s);
          if (recMatch) {
            try { llmRecommendations = JSON.parse(recMatch[1]); } catch { /* skip */ }
          }
        } catch (e) {
          console.error("Gemini API error:", e);
          llmAnalysis = `Bugun ${totalStudyMinutes} dakika calistin ve ${totalPomodoros} pomodoro tamamladin.`;
        }
      }

      // Upsert daily report
      const { error: upsertError } = await supabase
        .from("daily_reports")
        .upsert({
          user_id: userId,
          report_date: todayDate,
          total_study_minutes: totalStudyMinutes,
          total_pomodoros: totalPomodoros,
          subjects_studied: subjects,
          pages_used: pagesUsed,
          interaction_counts: intCounts,
          llm_analysis: llmAnalysis,
          llm_recommendations: llmRecommendations,
          streak_days: streak,
        }, { onConflict: "user_id,report_date" });

      if (upsertError) throw upsertError;
      results.push({ userId, success: true });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

**Step 2: Set the GEMINI_API_KEY secret**

The Edge Function needs `GEMINI_API_KEY` as a Supabase secret. Check if the user has it configured already in their Supabase project settings.

**Step 3: Test the Edge Function**

Invoke it manually via the Supabase dashboard or via curl to verify it works.

**Step 4: Commit** (no local files to commit for Edge Functions)

---

## Task 14: Add API Route for On-Demand Report Generation

**Files:**
- Create: `app/api/daily-report/route.ts`

**Step 1: Create the API route**

Create `app/api/daily-report/route.ts` that calls the Edge Function on demand when user clicks "Generate Report" in AnalysisPage:

```typescript
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    const res = await fetch(`${projectUrl}/functions/v1/daily-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ user_id: session.user.id }),
    });

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}
```

**Step 2: Verify build**

```bash
cd C:/Users/kutayy/Desktop/odaklio && npx tsc --noEmit --pretty 2>&1 | head -20
```

**Step 3: Commit**

```bash
git add app/api/daily-report/route.ts && git commit -m "feat: add API route for on-demand daily report generation"
```

---

## Task 15: Integration Testing & Polish

**Files:**
- Various (fixes only)

**Step 1: End-to-end verification**

1. Start the app: `npm run dev`
2. Login to the app
3. Navigate to different pages - verify `page_tracking` records in Supabase
4. Start a Pomodoro in sidebar - verify `pomodoro_sessions` record created with status 'active'
5. Complete or cancel the Pomodoro - verify record updated
6. Start a Pomodoro from Tools page popup - verify same behavior
7. Send a chat message - verify `user_interactions` record
8. Open Analysis page - verify real data displays (or proper empty states)
9. Click "Generate Report" if the Edge Function is deployed - verify `daily_reports` record

**Step 2: Fix any issues found**

Address any build errors, runtime errors, or data issues.

**Step 3: Final commit**

```bash
git add -A && git commit -m "fix: integration fixes for pomodoro and analytics system"
```

---

## Summary

| Task | Description | New Files | Modified Files |
|------|-------------|-----------|----------------|
| 1 | Database migration | - | Supabase migration |
| 2 | Pomodoro DB functions | `lib/db/pomodoro.ts` | - |
| 3 | Tracking & Analytics DB | `lib/db/tracking.ts`, `lib/db/analytics.ts` | - |
| 4 | PomodoroProvider | `app/providers/PomodoroProvider.tsx` | - |
| 5 | PageTrackingProvider | `app/providers/PageTrackingProvider.tsx` | - |
| 6 | Wire providers | - | `app/layout.tsx` |
| 7 | PomodoroPopup | - | `app/components/tools/PomodoroPopup.tsx` |
| 8 | LeftPanel PomodoroMini | - | `app/components/layout/LeftPanel.tsx` |
| 9 | MiniSidebar | - | `app/components/layout/MiniSidebar.tsx` |
| 10 | Dashboard tracking | - | `app/components/dashboard/Dashboard.tsx` |
| 11 | Interaction tracking | - | `app/providers/ConversationProvider.tsx` |
| 12 | AnalysisPage real data | - | `app/components/pages/AnalysisPage.tsx` |
| 13 | Edge Function | Supabase Edge Function | - |
| 14 | API route for reports | `app/api/daily-report/route.ts` | - |
| 15 | Integration testing | - | Various fixes |
