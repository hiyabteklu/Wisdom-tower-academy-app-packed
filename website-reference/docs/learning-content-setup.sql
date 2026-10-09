-- ============================================================
-- Wisdom Tower Academy — Learning content + progress
-- Run in Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Resources (books, short notes, questions, exams, videos, flashcards)
create table if not exists public.learning_resources (
  id uuid primary key default gen_random_uuid(),
  package_id text not null,
  scope_path text not null,
  hub text not null check (hub in (
    'books','short-notes','videos','flashcards','question-banks','exams'
  )),
  title text not null,
  chapter int,
  sort_order int not null default 0,
  content_type text not null check (content_type in (
    'pdf','markdown','video_url','quiz','exam','flashcard_deck'
  )),
  storage_path text,
  body_md text,
  meta jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_resources_scope_idx
  on public.learning_resources (scope_path, hub, sort_order);
create index if not exists learning_resources_package_idx
  on public.learning_resources (package_id);

-- 2) Reading / study progress
create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.learning_resources(id) on delete cascade,
  progress_pct numeric not null default 0,
  last_page int,
  total_seconds int not null default 0,
  focus_seconds int not null default 0,
  last_opened_at timestamptz,
  meta jsonb not null default '{}'::jsonb,
  unique (user_id, resource_id)
);

create index if not exists learning_progress_user_idx
  on public.learning_progress (user_id);

-- 3) Exam attempts
create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.learning_resources(id) on delete cascade,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score numeric,
  answers jsonb not null default '{}'::jsonb,
  meta jsonb not null default '{}'::jsonb
);

-- 4) Optional AI explanation cache
create table if not exists public.ai_explanations (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid references public.learning_resources(id) on delete cascade,
  context_key text not null,
  prompt text,
  explanation text not null,
  created_at timestamptz not null default now(),
  unique (resource_id, context_key)
);

-- 5) RLS
alter table public.learning_resources enable row level security;
alter table public.learning_progress enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.ai_explanations enable row level security;

drop policy if exists "learning_resources_select" on public.learning_resources;
create policy "learning_resources_select" on public.learning_resources
  for select to authenticated
  using (published = true or true);

drop policy if exists "learning_resources_write_auth" on public.learning_resources;
create policy "learning_resources_write_auth" on public.learning_resources
  for all to authenticated
  using (true)
  with check (true);

drop policy if exists "learning_progress_own" on public.learning_progress;
create policy "learning_progress_own" on public.learning_progress
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "exam_attempts_own" on public.exam_attempts;
create policy "exam_attempts_own" on public.exam_attempts
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "ai_explanations_read" on public.ai_explanations;
create policy "ai_explanations_read" on public.ai_explanations
  for select to authenticated using (true);

drop policy if exists "ai_explanations_write" on public.ai_explanations;
create policy "ai_explanations_write" on public.ai_explanations
  for insert to authenticated with check (true);

-- 6) Storage bucket for PDFs / media (private)
insert into storage.buckets (id, name, public)
values ('learning-content', 'learning-content', false)
on conflict (id) do nothing;

drop policy if exists "learning_content_read" on storage.objects;
create policy "learning_content_read" on storage.objects
  for select to authenticated
  using (bucket_id = 'learning-content');

drop policy if exists "learning_content_write" on storage.objects;
create policy "learning_content_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'learning-content');

drop policy if exists "learning_content_update" on storage.objects;
create policy "learning_content_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'learning-content');

drop policy if exists "learning_content_delete" on storage.objects;
create policy "learning_content_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'learning-content');
