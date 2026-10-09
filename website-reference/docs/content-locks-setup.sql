-- ============================================================
-- Wisdom Tower Academy — Content locks (admin-controlled)
-- Run in Supabase → SQL Editor → New query → Run
-- ============================================================
-- lock_key examples:
--   package:freshman
--   package:ece-y3-sem-1
--   scope:freshman/math-natural
--   hub:freshman/math-natural:exams
-- modes: open | locked | coming_soon | require_purchase
-- ============================================================

create table if not exists public.content_locks (
  id uuid primary key default gen_random_uuid(),
  lock_key text not null unique,
  mode text not null
    check (mode in ('open', 'locked', 'coming_soon', 'require_purchase')),
  label text,
  note text,
  updated_at timestamptz not null default now(),
  updated_by text
);

create index if not exists content_locks_key_idx on public.content_locks (lock_key);

alter table public.content_locks enable row level security;

drop policy if exists "content_locks_select" on public.content_locks;
create policy "content_locks_select" on public.content_locks
  for select using (true);

drop policy if exists "content_locks_write_auth" on public.content_locks;
create policy "content_locks_write_auth" on public.content_locks
  for all to authenticated
  using (true)
  with check (true);

select 'content_locks ready' as status;
