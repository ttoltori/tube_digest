-- TubeDigest AI - Supabase Schema
-- Run this in your Supabase SQL Editor

-- ================================================
-- PROFILES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  avatar_url TEXT,
  youtube_access_token TEXT,
  youtube_refresh_token TEXT,
  settings JSONB DEFAULT '{
    "keywords": [],
    "languages": ["ko", "en"],
    "summaryLength": "short",
    "notifications": {
      "morningDigest": true,
      "keywordAlerts": true,
      "weeklyReport": false
    },
    "channelWeights": {
      "aiTech": 40,
      "economy": 30,
      "education": 20,
      "other": 10
    }
  }'::jsonb,
  total_time_saved_minutes INTEGER DEFAULT 0,
  total_summaries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- VIDEOS TABLE (cached YouTube video data)
-- ================================================
CREATE TABLE IF NOT EXISTS public.videos (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  channel_title TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  thumbnail TEXT,
  published_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  view_count BIGINT DEFAULT 0,
  language TEXT DEFAULT 'ko',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- SUMMARIES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT REFERENCES public.videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_ko TEXT NOT NULL,
  key_points TEXT[] NOT NULL DEFAULT '{}',
  reading_time TEXT DEFAULT '30초',
  length_type TEXT DEFAULT 'short' CHECK (length_type IN ('short', 'medium', 'long')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_id, length_type)
);

-- ================================================
-- KEYWORDS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS public.keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  match_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, keyword)
);

-- ================================================
-- ROW LEVEL SECURITY
-- ================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Videos policies (public read, authenticated write)
CREATE POLICY "Anyone can view videos"
  ON public.videos FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert videos"
  ON public.videos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update videos"
  ON public.videos FOR UPDATE USING (auth.role() = 'authenticated');

-- Summaries policies
CREATE POLICY "Users can view own summaries"
  ON public.summaries FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own summaries"
  ON public.summaries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Keywords policies
CREATE POLICY "Users can view own keywords"
  ON public.keywords FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own keywords"
  ON public.keywords FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own keywords"
  ON public.keywords FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own keywords"
  ON public.keywords FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- TRIGGER: Auto-create profile on user signup
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- TRIGGER: Update profile updated_at
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
