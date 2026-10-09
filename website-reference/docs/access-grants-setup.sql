-- ============================================================
-- Wisdom Tower Academy — Access grants (email whitelist)
-- Admin grants package access without payment (beta / comps).
-- Run in Supabase → SQL Editor → paste → Run
-- ============================================================

-- 1) Dedicated grants table (source of truth for admin whitelist)
create table if not exists public.access_grants (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  package_id text not null,
  package_name text,
  user_id uuid references auth.users(id) on delete set null,
  source text not null default 'whitelist'
    check (source in ('whitelist', 'admin', 'beta', 'comp')),
  note text,
  granted_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Normalize uniqueness: one grant per email+package
create unique index if not exists access_grants_email_pkg_uidx
  on public.access_grants (lower(email), package_id);

create index if not exists access_grants_email_idx
  on public.access_grants (lower(email));

create index if not exists access_grants_user_idx
  on public.access_grants (user_id);

alter table public.access_grants enable row level security;

drop policy if exists "access_grants_select" on public.access_grants;
create policy "access_grants_select" on public.access_grants
  for select using (
    auth.role() = 'authenticated'
    or (
      auth.jwt() ->> 'email' is not null
      and lower(email) = lower(auth.jwt() ->> 'email')
    )
  );

drop policy if exists "access_grants_write_auth" on public.access_grants;
create policy "access_grants_write_auth" on public.access_grants
  for all to authenticated
  using (true)
  with check (true);

-- 2) Enrich enrollments for dual-write / audit
alter table public.enrollments add column if not exists source text default 'purchase';
alter table public.enrollments add column if not exists granted_by text;
alter table public.enrollments add column if not exists note text;
alter table public.enrollments add column if not exists order_id text;

-- Email-level uniqueness helps pre-signup grants (user_id may be null)
create unique index if not exists enrollments_email_pkg_uidx
  on public.enrollments (lower(email), package_id)
  where email is not null;

select 'access_grants ready' as status;
