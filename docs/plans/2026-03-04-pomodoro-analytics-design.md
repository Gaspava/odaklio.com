# Pomodoro & Analytics System Design

**Date:** 2026-03-04
**Status:** Approved
**Approach:** Monolithic Supabase (Approach 1)

## Overview

Working Pomodoro timer with persistent storage, page/interaction tracking, and LLM-powered daily analytics for odaklio.com.

## User Requirements

- Pomodoro timer works in both sidebar (LeftPanel) and tools section (PomodoroPopup)
- Customizable durations (work, short break, long break)
- Auto-detect subject from current page context
- Track which page user is on and for how long, including content details and interaction counts
- Daily LLM-generated reports with recommendations
- All data stored in Supabase

## Database Schema

### Table 1: `pomodoro_sessions`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| user_id | uuid | NO | - | FK -> auth.users.id |
| conversation_id | uuid | YES | - | FK -> conversations.id |
| subject | text | YES | - | Auto-detected topic |
| session_type | text | NO | - | CHECK ('work', 'break') |
| duration_minutes | integer | NO | - | Configured duration |
| actual_seconds | integer | NO | - | Actual elapsed time |
| status | text | NO | - | CHECK ('completed', 'cancelled', 'paused') |
| started_at | timestamptz | NO | - | |
| ended_at | timestamptz | YES | - | |
| page_context | text | YES | - | Which page user was on |
| metadata | jsonb | YES | '{}' | Extra info |
| created_at | timestamptz | NO | now() | |

### Table 2: `page_tracking`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| user_id | uuid | NO | - | FK -> auth.users.id |
| page_name | text | NO | - | 'chat', 'tools', 'analysis', etc. |
| conversation_id | uuid | YES | - | FK -> conversations.id |
| content_title | text | YES | - | Conversation title, roadmap name |
| content_subject | text | YES | - | Auto-detected subject |
| duration_seconds | integer | NO | - | |
| started_at | timestamptz | NO | - | |
| ended_at | timestamptz | NO | - | |
| created_at | timestamptz | NO | now() | |

### Table 3: `user_interactions`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| user_id | uuid | NO | - | FK -> auth.users.id |
| interaction_type | text | NO | - | CHECK constraint for valid types |
| conversation_id | uuid | YES | - | FK -> conversations.id |
| subject | text | YES | - | |
| metadata | jsonb | YES | '{}' | Type-specific data |
| created_at | timestamptz | NO | now() | |

Interaction types: `message_sent`, `flashcard_flipped`, `flashcard_saved`, `roadmap_step_completed`, `mindmap_node_added`, `pomodoro_completed`, `note_created`

### Table 4: `daily_reports`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NO | gen_random_uuid() | PK |
| user_id | uuid | NO | - | FK -> auth.users.id |
| report_date | date | NO | - | UNIQUE with user_id |
| total_study_minutes | integer | NO | 0 | |
| total_pomodoros | integer | NO | 0 | |
| subjects_studied | jsonb | YES | '{}' | {"Matematik": 45, "Fizik": 30} |
| pages_used | jsonb | YES | '{}' | {"chat": 120, "flashcard": 30} |
| interaction_counts | jsonb | YES | '{}' | {"messages": 15, ...} |
| llm_analysis | text | YES | - | AI-generated analysis text |
| llm_recommendations | jsonb | YES | '[]' | AI recommendations array |
| streak_days | integer | NO | 0 | |
| created_at | timestamptz | NO | now() | |

UNIQUE constraint: (user_id, report_date)

## Pomodoro Timer System

### PomodoroProvider (New React Context)

**State:**
- isRunning, mode ('work' | 'break'), timeLeft, totalTime
- settings: { workMinutes, shortBreakMinutes, longBreakMinutes }
- completedPomodoros (today), currentSessionId, currentSubject

**Actions:**
- start() - start timer, save session to DB
- pause() - pause timer
- resume() - resume timer
- reset() - reset timer, save as cancelled
- skip() - skip break
- updateSettings() - change durations

**Auto behaviors:**
- Work complete -> auto switch to break, save as completed
- Break complete -> auto switch to work
- After 4 pomodoros -> long break
- Page change -> auto update subject

### Subject Auto-Detection

- Chat page -> extract from conversation.title
- Roadmap -> roadmap name + active step
- Flashcard -> flashcard set topic
- Other -> "Genel Calisma"

### UI Integration

- LeftPanel: existing mini timer + settings button + real daily count + subject label
- Tools Page: PomodoroPopup with settings + session history
- MiniSidebar: running indicator (existing behavior)

## Page Tracking System

### PageTrackingProvider (New React Context)

- Auto-tracks page navigation (started_at/ended_at/duration)
- Pauses on tab hidden (visibilitychange API)
- Flushes on beforeunload
- Tracks interactions via trackInteraction(type, metadata)
- Batches interaction writes every 30 seconds

### Integration Points

Hooks into existing functions:
- saveUserMessage() -> trackInteraction('message_sent')
- saveFlashcard() -> trackInteraction('flashcard_saved')
- completeRoadmapStep() -> trackInteraction('roadmap_step_completed')

## Analytics System

### AnalysisPage (Real Data)

Sections (replacing mock data):
1. Quick stats (study time, pomodoros, messages, flashcard accuracy)
2. Weekly activity chart (daily study hours from page_tracking)
3. Activity heatmap (last 28 days)
4. Subject-based progress (time per subject, pomodoro count)
5. Recent sessions (real pomodoro + page tracking data)
6. Streak & achievements (from daily_reports)
7. LLM daily report (analysis + recommendations)

Period selector: Week/Month/All (functional)

### Edge Function: daily-report

- Trigger: Supabase cron (nightly at 23:59) or on-demand
- Workflow:
  1. Collect user's daily data (page_tracking, pomodoro_sessions, user_interactions)
  2. Calculate stats (total time, subject distribution, interaction counts)
  3. Calculate streak (consecutive study days)
  4. Send to Google Gemini API -> get Turkish analysis + recommendations
  5. Save to daily_reports table
- LLM generates motivational analysis with 3-5 concrete recommendations

## Provider Hierarchy

```
RootLayout
└── ThemeProvider
    └── AuthProvider
        └── ConversationProvider
            └── PomodoroProvider
                └── PageTrackingProvider
                    └── {children}
```

## Files to Create/Modify

### New Files:
- `app/providers/PomodoroProvider.tsx`
- `app/providers/PageTrackingProvider.tsx`
- `lib/db/pomodoro.ts` (DB functions for pomodoro)
- `lib/db/tracking.ts` (DB functions for page tracking & interactions)
- `lib/db/analytics.ts` (DB functions for analytics queries)

### Modified Files:
- `app/layout.tsx` (add new providers)
- `app/components/layout/LeftPanel.tsx` (real Pomodoro data + settings)
- `app/components/tools/PomodoroPopup.tsx` (real timer + settings + history)
- `app/components/layout/MiniSidebar.tsx` (connect to PomodoroProvider)
- `app/components/pages/AnalysisPage.tsx` (replace mock data with real)
- `app/components/pages/ToolsPage.tsx` (connect Pomodoro card)
- `lib/db/conversations.ts` (add interaction tracking hooks)

### Supabase:
- Migration: 4 new tables with RLS policies
- Edge Function: `daily-report`
