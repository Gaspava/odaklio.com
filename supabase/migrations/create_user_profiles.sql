-- User Profiles table for LLM-based user profiling
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Learning Style
  learning_modality TEXT, -- "gorsel" | "metinsel" | "interaktif" | "karma"
  preferred_depth TEXT, -- "yuzeysel" | "orta" | "derin"
  preferred_pace TEXT, -- "hizli" | "orta" | "detayli"

  -- Study Habits
  peak_study_hours INTEGER[], -- e.g. {14,15,16,17}
  preferred_session_minutes INTEGER,
  study_consistency TEXT, -- "duzensiz" | "ara_sira" | "orta" | "duzenli" | "gunluk"
  avg_daily_study_minutes INTEGER,

  -- Academic Profile
  subjects_strength JSONB DEFAULT '{}', -- {"Matematik": 85, "Fizik": 60}
  subjects_weakness JSONB DEFAULT '{}', -- {"Turkce": 30}
  subjects_interest JSONB DEFAULT '{}', -- time-weighted engagement
  current_focus_subjects TEXT[], -- top active subjects

  -- Engagement Profile
  preferred_tools JSONB DEFAULT '{}', -- {"chat": 40, "flashcard": 30}
  mentor_preference TEXT, -- "coach" | "psych" | "buddy" | "expert" | null
  completion_rate INTEGER, -- 0-100 pomodoro completion %

  -- Motivation Profile
  motivation_pattern TEXT, -- "kendini_motive_eden" | "tesvige_ihtiyac_duyan" | "rekabetci" | "karma"
  frustration_signals TEXT[], -- detected patterns

  -- LLM Generated Content
  personality_summary TEXT, -- Detailed personality/learning summary
  strengths_text TEXT, -- Narrative about strengths
  weaknesses_text TEXT, -- Narrative about weaknesses
  recommendations TEXT[], -- Actionable recommendations
  overall_assessment TEXT, -- General assessment paragraph

  -- Meta
  profile_version INTEGER DEFAULT 1,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  raw_data_snapshot JSONB DEFAULT '{}', -- aggregated data used for last analysis

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
