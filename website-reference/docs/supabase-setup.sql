-- Wisdom Tower Digital — run once in Supabase SQL Editor
-- Dashboard → SQL → New query → paste → Run

-- 1) Academic progress
create table if not exists public.academic_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scope_id text not null,
  title text not null,
  total int not null check (total > 0),
  correct int not null check (correct >= 0),
  missed int not null check (missed >= 0),
  percent numeric(5,1) not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists academic_results_user_scope_idx
  on public.academic_results (user_id, scope_id, created_at desc);

alter table public.academic_results enable row level security;

drop policy if exists "Users read own results" on public.academic_results;
create policy "Users read own results" on public.academic_results
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own results" on public.academic_results;
create policy "Users insert own results" on public.academic_results
  for insert with check (auth.uid() = user_id);

-- 2) Cached AI explanations
create table if not exists public.question_explanations (
  question_id text primary key,
  explanation text not null,
  subject text,
  difficulty text,
  model text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists question_explanations_subject_idx
  on public.question_explanations (subject);

alter table public.question_explanations enable row level security;

drop policy if exists "Anyone can read explanations" on public.question_explanations;
create policy "Anyone can read explanations" on public.question_explanations
  for select using (true);

-- 3) Rate-limit buckets
create table if not exists public.api_rate_limits (
  bucket_key text primary key,
  hit_count int not null default 0,
  window_start timestamptz not null default now()
);

alter table public.api_rate_limits enable row level security;

-- 4) Profiles (for admin user list)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.profiles enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users upsert own profile" on public.profiles;
create policy "Users upsert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Allow authenticated users to read all profiles (admin page filters by email list)
drop policy if exists "Authenticated read profiles" on public.profiles;
create policy "Authenticated read profiles" on public.profiles
  for select to authenticated using (true);

-- 5) Manual payment orders (core for reliability)
create table if not exists public.orders (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  package_id text not null,
  package_name text not null,
  amount_etb int not null,
  status text not null default 'pending_verification'
    check (status in ('pending_payment', 'pending_verification', 'verified', 'rejected')),
  payment_method text not null,
  student_name text not null,
  phone text not null,
  email text,
  transaction_ref text not null,
  note text,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by text
);

create index if not exists orders_status_idx on public.orders (status, created_at desc);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);
create index if not exists orders_email_idx on public.orders (email);

alter table public.orders enable row level security;

-- Anyone can insert an order (guest checkout supported)
drop policy if exists "Anyone insert orders" on public.orders;
create policy "Anyone insert orders" on public.orders
  for insert with check (true);

-- Users can read their own orders (by user_id or matching email)
drop policy if exists "Users read own orders" on public.orders;
create policy "Users read own orders" on public.orders
  for select using (
    auth.uid() = user_id
    or (email is not null and email = auth.jwt() ->> 'email')
  );

-- Authenticated users can read all orders (admin UI filters by isAdminEmail)
drop policy if exists "Authenticated read all orders" on public.orders;
create policy "Authenticated read all orders" on public.orders
  for select to authenticated using (true);

-- Authenticated can update status (admin page only allows admin emails in UI)
drop policy if exists "Authenticated update orders" on public.orders;
create policy "Authenticated update orders" on public.orders
  for update to authenticated using (true);

-- 6) Enrollments (unlocked packages after verification)
create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  order_id text references public.orders(id) on delete set null,
  package_id text not null,
  package_name text not null,
  email text,
  created_at timestamptz not null default now(),
  unique (user_id, package_id)
);

create index if not exists enrollments_user_idx on public.enrollments (user_id);
create index if not exists enrollments_email_idx on public.enrollments (email);

alter table public.enrollments enable row level security;

drop policy if exists "Users read own enrollments" on public.enrollments;
create policy "Users read own enrollments" on public.enrollments
  for select using (
    auth.uid() = user_id
    or (email is not null and email = auth.jwt() ->> 'email')
  );

drop policy if exists "Authenticated read enrollments" on public.enrollments;
create policy "Authenticated read enrollments" on public.enrollments
  for select to authenticated using (true);

drop policy if exists "Authenticated insert enrollments" on public.enrollments;
create policy "Authenticated insert enrollments" on public.enrollments
  for insert to authenticated with check (true);

-- 7) Contact inquiries (used by admin)
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  service text,
  message text not null,
  status text not null default 'new',
  admin_notes text
);

alter table public.inquiries enable row level security;

drop policy if exists "Anyone insert inquiries" on public.inquiries;
create policy "Anyone insert inquiries" on public.inquiries
  for insert with check (true);

drop policy if exists "Authenticated manage inquiries" on public.inquiries;
create policy "Authenticated manage inquiries" on public.inquiries
  for all to authenticated using (true);

-- 8) Talent applications (Digital — Work with us)
create table if not exists public.talent_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  city text,
  category text,
  service text,
  letter_of_interest text,
  portfolio_url text,
  experience text,
  availability text,
  hours_per_week text,
  heard_about text,
  requirements_confirmed boolean default false,
  status text not null default 'new',
  admin_notes text
);

create index if not exists talent_applications_status_idx
  on public.talent_applications (status, created_at desc);

alter table public.talent_applications enable row level security;

drop policy if exists "Anyone insert talent applications" on public.talent_applications;
create policy "Anyone insert talent applications" on public.talent_applications
  for insert with check (true);

drop policy if exists "Authenticated manage talent applications" on public.talent_applications;
create policy "Authenticated manage talent applications" on public.talent_applications
  for all to authenticated using (true);
