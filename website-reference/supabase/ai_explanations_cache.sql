-- ============================================================
-- AI explanations + summaries cache (shared across users)
-- Run in Supabase → SQL Editor
-- Safe to re-run.
-- ============================================================

create table if not exists public.ai_explanations (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references public.learning_resources(id) on delete set null,
  context_key text not null,
  mode text,
  model text,
  prompt text,
  explanation text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add columns if table already existed with older shape
alter table public.ai_explanations
  add column if not exists mode text,
  add column if not exists model text,
  add column if not exists updated_at timestamptz default now();

-- One row per request fingerprint (hash)
create unique index if not exists ai_explanations_context_key_uidx
  on public.ai_explanations (context_key);

create index if not exists ai_explanations_resource_idx
  on public.ai_explanations (resource_id);

alter table public.ai_explanations enable row level security;

-- Service role bypasses RLS; keep policies permissive for authenticated reads if needed
drop policy if exists "ai_explanations_read" on public.ai_explanations;
create policy "ai_explanations_read" on public.ai_explanations
  for select to authenticated using (true);

drop policy if exists "ai_explanations_write" on public.ai_explanations;
create policy "ai_explanations_write" on public.ai_explanations
  for insert to authenticated with check (true);

drop policy if exists "ai_explanations_update" on public.ai_explanations;
create policy "ai_explanations_update" on public.ai_explanations
  for update to authenticated using (true) with check (true);

-- Optional: also keep question_explanations for the legacy /api/explain route
create table if not exists public.question_explanations (
  question_id text primary key,
  explanation text not null,
  subject text,
  difficulty text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.question_explanations enable row level security;

drop policy if exists "question_explanations_read" on public.question_explanations;
create policy "question_explanations_read" on public.question_explanations
  for select to authenticated using (true);

drop policy if exists "question_explanations_write" on public.question_explanations;
create policy "question_explanations_write" on public.question_explanations
  for all to authenticated using (true) with check (true);
