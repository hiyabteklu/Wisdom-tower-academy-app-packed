-- Run once in Supabase SQL Editor if profiles table already exists.
-- Auth metadata still stores completion even if these columns are missing;
-- adding them enables admin filters and reporting.

alter table public.profiles
  add column if not exists phone text,
  add column if not exists school_name text,
  add column if not exists town_region text,
  add column if not exists stream text,
  add column if not exists hear_about text,
  add column if not exists account_intent text,
  add column if not exists profile_completed boolean default false;

-- Optional index for admin "incomplete" lists
create index if not exists profiles_profile_completed_idx
  on public.profiles (profile_completed);
