-- ============================================================
-- VivaGen AI Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. interviews table
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  candidate_name TEXT NOT NULL,
  role TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  language TEXT NOT NULL,
  description TEXT,
  total_score NUMERIC DEFAULT 0,
  max_score NUMERIC DEFAULT 0,
  percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. interview_questions table
CREATE TABLE IF NOT EXISTS public.interview_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  type TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 10),
  score INTEGER CHECK (score BETWEEN 0 AND 10),
  notes TEXT,
  order_index INTEGER NOT NULL
);

-- 3. interview_summary table
CREATE TABLE IF NOT EXISTS public.interview_summary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES public.interviews(id) ON DELETE CASCADE NOT NULL UNIQUE,
  summary TEXT,
  strengths JSONB DEFAULT '[]',
  weaknesses JSONB DEFAULT '[]',
  recommendation TEXT CHECK (recommendation IN ('Strong Hire', 'Hire', 'Maybe', 'Reject')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. usage_tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- Format: 'YYYY-MM'
  interviews_used INTEGER DEFAULT 0,
  UNIQUE(user_id, month)
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- interviews: users can only see and modify their own
CREATE POLICY "Users can CRUD own interviews"
  ON public.interviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- interview_questions: access via parent interview
CREATE POLICY "Users can CRUD own interview questions"
  ON public.interview_questions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.interviews
      WHERE interviews.id = interview_questions.interview_id
        AND interviews.user_id = auth.uid()
    )
  );

-- interview_summary: access via parent interview
CREATE POLICY "Users can CRUD own interview summaries"
  ON public.interview_summary FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.interviews
      WHERE interviews.id = interview_summary.interview_id
        AND interviews.user_id = auth.uid()
    )
  );

-- usage_tracking: users can only see their own usage
CREATE POLICY "Users can CRUD own usage tracking"
  ON public.usage_tracking FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
