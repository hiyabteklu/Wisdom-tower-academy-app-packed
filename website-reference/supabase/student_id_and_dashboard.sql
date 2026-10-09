-- =============================================================================
-- Wisdom Tower Academy — Student Digital ID & Progress Analytics Migration
-- SAFE & IDEMPOTENT (Additive only — no data loss, no deletion of existing records)
--
-- Instructions:
-- 1. Open your Supabase Project Dashboard (https://supabase.com/dashboard)
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Open or paste the contents of this file (supabase/student_id_and_dashboard.sql)
-- 4. Click "Run" (or Ctrl+Enter / Cmd+Enter)
-- =============================================================================

-- 1. Create incremental Student ID sequence (00001 - 20000 range)
create sequence if not exists public.student_id_seq
  start with 1042
  increment by 1
  minvalue 1
  maxvalue 20000
  cycle;

-- 2. Add Student ID, Expiration (1 Year), and Analytics Columns to public.profiles
alter table public.profiles
  add column if not exists student_id_number text,
  add column if not exists id_issued_at timestamptz default now(),
  add column if not exists id_expires_at timestamptz default (now() + interval '1 year'),
  add column if not exists active_academic_scope text default 'freshman',
  add column if not exists student_folio_number text;

-- 3. Function to format incremental student IDs (e.g. WTA-01042)
create or replace function public.generate_next_student_id()
returns text as $$
declare
  seq_val bigint;
begin
  seq_val := nextval('public.student_id_seq');
  return 'WTA-' || lpad(seq_val::text, 5, '0');
end;
$$ language plpgsql;

-- 4. Trigger to auto-assign Student ID upon profile insert if not provided
create or replace function public.auto_assign_student_id_trigger()
returns trigger as $$
begin
  if new.student_id_number is null or trim(new.student_id_number) = '' then
    new.student_id_number := public.generate_next_student_id();
  end if;

  if new.id_issued_at is null then
    new.id_issued_at := coalesce(new.created_at, now());
  end if;

  if new.id_expires_at is null then
    new.id_expires_at := new.id_issued_at + interval '1 year';
  end if;

  if new.student_folio_number is null then
    new.student_folio_number := 'REG-' || to_char(coalesce(new.created_at, now()), 'YYYY') || '/' || right(new.student_id_number, 5);
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_auto_assign_student_id on public.profiles;
create trigger trg_auto_assign_student_id
  before insert on public.profiles
  for each row
  execute function public.auto_assign_student_id_trigger();

-- 5. Backfill existing profile rows that do not have a student_id_number
do $$
declare
  r record;
begin
  for r in select id, created_at from public.profiles where student_id_number is null or trim(student_id_number) = '' loop
    update public.profiles
    set
      student_id_number = public.generate_next_student_id(),
      id_issued_at = coalesce(r.created_at, now()),
      id_expires_at = coalesce(r.created_at, now()) + interval '1 year',
      student_folio_number = 'REG-' || to_char(coalesce(r.created_at, now()), 'YYYY') || '/' || right(public.generate_next_student_id(), 5)
    where id = r.id;
  end loop;
end $$;

-- 6. Indexes for ultra-fast student ID verification and lookups
create index if not exists idx_profiles_student_id_number on public.profiles(student_id_number);
create index if not exists idx_profiles_active_academic_scope on public.profiles(active_academic_scope);

-- 7. Informative comments
comment on column public.profiles.student_id_number is 'Official auto-generated 5-digit incremental student ID (00001-20000)';
comment on column public.profiles.id_issued_at is 'Initial date student credential was issued';
comment on column public.profiles.id_expires_at is 'Expiration timestamp strictly set to 1 year following registration';
comment on column public.profiles.active_academic_scope is 'Customized or default analytical academic scope (freshman, grade-12, etc.)';
