-- Activation codes: a code sold outside the app unlocks packages for the student who redeems it.
-- Rows land in public.enrollments (the table the website already reads for ownership).
-- STATUS 2026-10-13: written, NOT applied to Supabase, NOT tested (the owner has not approved the database change yet).
-- Apply as ONE migration named `activation_codes`. Test first inside a transaction that is rolled back.

create table if not exists public.activation_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  package_ids text[] not null,
  package_name text,
  note text,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_email text,
  redeemed_at timestamptz,
  constraint activation_codes_has_package check (cardinality(package_ids) > 0),
  constraint activation_codes_code_format check (code ~ '^[A-Z0-9]{12}$')
);
alter table public.activation_codes enable row level security;
drop policy if exists ac_admin_all on public.activation_codes;
create policy ac_admin_all on public.activation_codes for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
revoke all on public.activation_codes from anon;

-- Failed redeem attempts (server only, no client policy): used to slow down guessing.
create table if not exists public.activation_attempts (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  created_at timestamptz not null default now()
);
create index if not exists activation_attempts_user_time_idx on public.activation_attempts (user_id, created_at);
alter table public.activation_attempts enable row level security;
revoke all on public.activation_attempts from anon, authenticated;

-- Admin helper (SQL editor only, not reachable through the API): makes codes like WTK4-9QX2-M7PA.
create or replace function private.generate_activation_codes(
  p_package_ids text[],
  p_package_name text default null,
  p_count integer default 1,
  p_note text default null,
  p_expires_at timestamptz default null
) returns setof text
language plpgsql security definer set search_path = public, pg_temp
as $f$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_raw bytea;
  v_code text;
  v_made integer := 0;
  v_tries integer := 0;
  v_rows integer;
  k integer;
begin
  if p_package_ids is null or cardinality(p_package_ids) = 0 then
    raise exception 'package ids required';
  end if;
  if p_count < 1 or p_count > 500 then
    raise exception 'count must be between 1 and 500';
  end if;
  while v_made < p_count loop
    v_tries := v_tries + 1;
    if v_tries > p_count * 5 + 20 then
      raise exception 'could not generate unique codes';
    end if;
    v_raw := uuid_send(gen_random_uuid());
    v_code := 'WT';
    foreach k in array array[0,1,2,3,4,5,9,10,11,12] loop
      v_code := v_code || substr(v_alphabet, (get_byte(v_raw, k) % 32) + 1, 1);
    end loop;
    insert into public.activation_codes (code, package_ids, package_name, note, expires_at)
    values (v_code, p_package_ids, p_package_name, p_note, p_expires_at)
    on conflict (code) do nothing;
    get diagnostics v_rows = row_count;
    if v_rows = 1 then
      v_made := v_made + 1;
      return next substr(v_code, 1, 4) || '-' || substr(v_code, 5, 4) || '-' || substr(v_code, 9, 4);
    end if;
  end loop;
end
$f$;
revoke all on function private.generate_activation_codes(text[], text, integer, text, timestamptz) from public, anon, authenticated;

-- Student side: called by the app with the student's own login.
create or replace function public.redeem_activation_code(p_code text)
returns jsonb
language plpgsql security definer set search_path = public, pg_temp
as $f$
declare
  v_uid uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_row public.activation_codes%rowtype;
  v_pkg text;
  v_fails integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not_signed_in');
  end if;

  select count(*) into v_fails from public.activation_attempts
   where user_id = v_uid and created_at > now() - interval '1 hour';
  if v_fails >= 8 then
    return jsonb_build_object('ok', false, 'error', 'too_many_attempts');
  end if;

  select * into v_row from public.activation_codes where code = v_code for update;
  if not found then
    insert into public.activation_attempts (user_id) values (v_uid);
    return jsonb_build_object('ok', false, 'error', 'invalid_code');
  end if;

  if v_row.redeemed_at is not null then
    if v_row.redeemed_by = v_uid then
      return jsonb_build_object('ok', true, 'already', true,
        'package_ids', to_jsonb(v_row.package_ids), 'package_name', v_row.package_name);
    end if;
    insert into public.activation_attempts (user_id) values (v_uid);
    return jsonb_build_object('ok', false, 'error', 'already_used');
  end if;

  if v_row.expires_at is not null and v_row.expires_at < now() then
    insert into public.activation_attempts (user_id) values (v_uid);
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;

  update public.activation_codes
     set redeemed_by = v_uid, redeemed_email = nullif(v_email, ''), redeemed_at = now()
   where id = v_row.id;

  foreach v_pkg in array v_row.package_ids loop
    insert into public.enrollments (user_id, email, package_id, package_name, source, granted_by, note)
    values (v_uid, nullif(v_email, ''), v_pkg, v_row.package_name, 'activation_code', 'activation_code', 'code ' || v_row.id::text)
    on conflict do nothing;
  end loop;

  return jsonb_build_object('ok', true, 'already', false,
    'package_ids', to_jsonb(v_row.package_ids), 'package_name', v_row.package_name);
end
$f$;
revoke all on function public.redeem_activation_code(text) from public, anon;
grant execute on function public.redeem_activation_code(text) to authenticated;

-- ADMIN USAGE (Supabase SQL editor, runs as the project owner):
--   select * from private.generate_activation_codes(array['grade-12'], 'Grade 12', 20, 'batch 1');
--   select * from private.generate_activation_codes(array['ece-y3-sem-1','ece-y3-sem-2'], 'ECE Year 3', 5, 'ece batch');
--   select * from private.generate_activation_codes(array['__all__'], 'All packages', 1, 'vip');
-- Package ids are the website's: freshman, grade-9 .. grade-12, entrance-questions, uat, coc, remedial,
-- ece-y3-sem-1, ece-y3-sem-2, and '__all__' (every package).
-- See which codes are used:  select code, package_name, redeemed_email, redeemed_at from public.activation_codes order by created_at desc;
