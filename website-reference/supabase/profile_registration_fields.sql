-- =============================================================================
-- Academy registration fields (SAFE — additive only)
-- Run in Supabase SQL Editor. Does NOT delete or rewrite existing rows.
-- Existing accounts, paid users, orders, and grants are untouched.
-- =============================================================================

-- Extra columns for the new email/phone registration form
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
  -- Advanced Profile & Webview Settings
  add column if not exists bio text,
  add column if not exists target_exam text,
  add column if not exists target_score text,
  add column if not exists daily_study_goal_minutes integer default 45,
  add column if not exists preferred_study_time text default 'evening',
  add column if not exists avatar_preset text default 'scholar-cyan',
  add column if not exists amoled_mode boolean default false,
  add column if not exists font_size_preference text default 'normal',
  add column if not exists data_saver_mode boolean default false,
  add column if not exists sound_effects_enabled boolean default true,
  add column if not exists app_preferences jsonb default '{}'::jsonb;

-- Optional: constrain education_level to known values (NULL allowed for old users)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_education_level_check'
  ) then
    alter table public.profiles
      add constraint profiles_education_level_check
      check (
        education_level is null
        or education_level in (
          'Grade 9',
          'Grade 10',
          'Grade 11',
          'Grade 12',
          'Remedial',
          'Freshman',
          'Exit Exam',
          'GAT'
        )
      );
  end if;
end $$;

-- Helpful indexes (safe if already present)
create index if not exists profiles_education_level_idx
  on public.profiles (education_level);

create index if not exists profiles_phone_idx
  on public.profiles (phone);

create index if not exists profiles_profile_completed_idx
  on public.profiles (profile_completed);

-- Ensure email column can be null for phone-only signups (no-op if already nullable)
do $$
begin
  alter table public.profiles alter column email drop not null;
exception
  when others then null;
end $$;

-- RLS: keep existing policies; users may update their own extended fields
-- (no policy drops — existing access grants / paid users unaffected)

comment on column public.profiles.first_name is 'Given name from Academy registration';
comment on column public.profiles.last_name is 'Family name from Academy registration';
comment on column public.profiles.phone is 'Phone when user registered with phone instead of email';
comment on column public.profiles.education_level is 'Grade 9–12, Remedial, Freshman, Exit Exam, or GAT';
