-- =============================================================================
-- Wisdom Tower Academy — Advanced Account & Profile Settings Migration
-- SAFE & IDEMPOTENT (Additive only — no data loss, no deletion of existing rows)
--
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Open or paste the contents of this file (supabase/advanced_account_settings.sql)
-- 4. Click "Run" (or Ctrl+Enter / Cmd+Enter)
-- =============================================================================

-- 1. Ensure public.profiles table exists
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz default now()
);

-- 2. Add all advanced academic & app-preference columns safely
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists phone text,
  add column if not exists education_level text,
  add column if not exists school_name text,
  add column if not exists town_region text,
  add column if not exists stream text,
  add column if not exists hear_about text,
  add column if not exists account_intent text,
  add column if not exists profile_completed boolean default false,
  -- Advanced Profile & Academic Goals
  add column if not exists bio text,
  add column if not exists target_exam text,
  add column if not exists target_score text,
  add column if not exists daily_study_goal_minutes integer default 45,
  add column if not exists preferred_study_time text default 'evening',
  add column if not exists avatar_preset text default 'scholar-cyan',
  -- Webview & App Preferences
  add column if not exists amoled_mode boolean default false,
  add column if not exists font_size_preference text default 'normal',
  add column if not exists data_saver_mode boolean default false,
  add column if not exists sound_effects_enabled boolean default true,
  add column if not exists app_preferences jsonb default '{}'::jsonb;

-- 3. Ensure email column can be null for phone-based identity signups
do $$
begin
  alter table public.profiles alter column email drop not null;
exception
  when others then null;
end $$;

-- 4. Indexes for rapid lookups and query optimization
create index if not exists profiles_education_level_idx on public.profiles (education_level);
create index if not exists profiles_phone_idx on public.profiles (phone);
create index if not exists profiles_stream_idx on public.profiles (stream);
create index if not exists profiles_profile_completed_idx on public.profiles (profile_completed);

-- 5. Row-Level Security (RLS) Setup
alter table public.profiles enable row level security;

-- Allow users to read their own complete profile
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

-- Allow users to update their own profile fields
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Allow users to insert their own profile on signup
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Allow public read of basic leaderboard profile info
drop policy if exists "Public read profiles basic" on public.profiles;
create policy "Public read profiles basic" on public.profiles
  for select using (true);

-- 6. Informational comments for schema documentation
comment on table public.profiles is 'Student academic identity, study goals, and webview app preferences';
comment on column public.profiles.bio is 'Student academic motto or personal bio';
comment on column public.profiles.target_exam is 'Target exam milestone (e.g. Matriculation 2026, Freshman 4.0, Exit Exam, GAT)';
comment on column public.profiles.daily_study_goal_minutes is 'Daily target study minutes for habit tracking';
comment on column public.profiles.avatar_preset is 'Identifier of chosen academic avatar preset';
comment on column public.profiles.amoled_mode is 'True-black background flag for mobile OLED/AMOLED webview';
