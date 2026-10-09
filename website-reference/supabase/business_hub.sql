-- Wisdom Tower Business Hub
-- Run in Supabase SQL editor after reviewing RLS for your org.

-- Registered client companies
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  industry text,
  website text,
  city text,
  country text default 'Ethiopia',
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  description text,
  status text not null default 'pending'
    check (status in ('pending', 'reviewing', 'active', 'paused', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Service lines a business requested / subscribed to
create table if not exists public.business_subscriptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  service_id text not null,
  service_name text not null,
  billing text not null default 'monthly',
  status text not null default 'requested'
    check (status in ('requested', 'scoping', 'approved', 'active', 'paused', 'ended')),
  notes text,
  started_at timestamptz,
  created_at timestamptz not null default now()
);

-- Client goals / weekly expectations submitted from dashboard
create table if not exists public.business_updates (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  kind text not null default 'goal'
    check (kind in ('goal', 'draft', 'note', 'feedback')),
  title text not null,
  body text not null,
  week_of date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Snapshot metrics shown on client dashboard (filled by team / integrations later)
create table if not exists public.business_metrics (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  metric_key text not null,
  label text not null,
  value numeric not null default 0,
  unit text,
  period text default '7d',
  recorded_at timestamptz not null default now()
);

create index if not exists businesses_owner_idx on public.businesses(owner_user_id);
create index if not exists business_subscriptions_biz_idx on public.business_subscriptions(business_id);
create index if not exists business_updates_biz_idx on public.business_updates(business_id);
create index if not exists business_metrics_biz_idx on public.business_metrics(business_id);

-- Basic RLS: owners see their business; inserts allowed for authenticated users on create
alter table public.businesses enable row level security;
alter table public.business_subscriptions enable row level security;
alter table public.business_updates enable row level security;
alter table public.business_metrics enable row level security;

create policy "Owners read own businesses"
  on public.businesses for select
  using (auth.uid() = owner_user_id);

create policy "Auth users insert business"
  on public.businesses for insert
  with check (auth.uid() = owner_user_id);

create policy "Owners update own businesses"
  on public.businesses for update
  using (auth.uid() = owner_user_id);

create policy "Owners read subscriptions"
  on public.business_subscriptions for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_user_id = auth.uid()
    )
  );

create policy "Owners insert subscriptions"
  on public.business_subscriptions for insert
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_user_id = auth.uid()
    )
  );

create policy "Owners read updates"
  on public.business_updates for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_user_id = auth.uid()
    )
  );

create policy "Owners insert updates"
  on public.business_updates for insert
  with check (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_user_id = auth.uid()
    )
  );

create policy "Owners read metrics"
  on public.business_metrics for select
  using (
    exists (
      select 1 from public.businesses b
      where b.id = business_id and b.owner_user_id = auth.uid()
    )
  );

-- Optional: allow anon insert for pre-auth registration (review carefully)
-- create policy "Anon can insert pending business"
--   on public.businesses for insert with check (status = 'pending');
