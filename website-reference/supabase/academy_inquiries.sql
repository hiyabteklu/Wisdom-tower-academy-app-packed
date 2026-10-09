-- Academy contact / inquiries (safe to re-run)
-- Run in Supabase SQL Editor on the Academy project.

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  service text,
  message text not null,
  status text not null default 'new'
);

alter table public.inquiries enable row level security;

drop policy if exists "Anyone can insert inquiries" on public.inquiries;
create policy "Anyone can insert inquiries"
  on public.inquiries for insert
  with check (true);

drop policy if exists "Users read own inquiries by email" on public.inquiries;
create policy "Users read own inquiries by email"
  on public.inquiries for select
  to authenticated
  using (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

drop policy if exists "Authenticated read all inquiries" on public.inquiries;
create policy "Authenticated read all inquiries"
  on public.inquiries for select
  to authenticated
  using (true);

drop policy if exists "Authenticated update inquiries" on public.inquiries;
create policy "Authenticated update inquiries"
  on public.inquiries for update
  to authenticated
  using (true)
  with check (true);

create index if not exists inquiries_email_idx on public.inquiries (lower(email));
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
