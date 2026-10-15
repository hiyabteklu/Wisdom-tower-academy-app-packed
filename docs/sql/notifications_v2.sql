-- Notifications v2, slice R1 (docs/NOTIFICATIONS_V2_PLAN.md section 4).
-- STATUS: WRITTEN, NOT APPLIED to the live project, NOT TESTED (the SQL tool call was cancelled twice in session AX).
-- Project "Wisdom tower academy" (ref amieczmpqrvavzjikbdi). Verified before writing (read-only, 2026-10-15):
--   * scheduled_notifications has no category/content/audiences columns yet; notification_audiences does not exist.
--   * notifications has NO type check constraint, so type 'contest' needs no change there.
--   * enrollments and access_grants both have user_id + package_id; private.is_admin() reads the e-mail from the JWT.
-- How to apply: run docs/sql/notifications_v2_test.sql FIRST (it rolls back), read its RESULTS line, then apply this file as ONE migration named notifications_v2.
-- DO NOT call the *_v2 schedule functions from the website until slice R2 (dispatch route reads category/content/audiences) is deployed:
-- the OLD dispatch route ignores the new columns and would send a targeted notice to everybody.
-- Audience entries (text[]): 'all' (or empty/null array) = everybody; a registration level label (case-insensitive, trimmed,
-- compared with profiles.education_level); 'custom:<uuid>' = a row of notification_audiences. The result is the UNION, one id each.
-- Design note vs the plan: one SQL resolver (public.resolve_notification_audience, service_role only) is the single source of truth
-- for counts AND dispatch, so "now" and "later" cannot disagree. Plan item list-v2 added: admin_list_scheduled_notifications_v2.

alter table public.scheduled_notifications
  add column if not exists category text,
  add column if not exists content jsonb,
  add column if not exists audiences text[];

alter table public.scheduled_notifications
  add constraint scheduled_notifications_category_check
  check (category is null or category in ('admin','material','contest'));

create table public.notification_audiences (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  match_levels text[] not null default '{}',
  match_package_ids text[] not null default '{}',
  created_by text,
  created_at timestamptz not null default now(),
  constraint notification_audiences_label_key unique (label),
  constraint notification_audiences_label_len check (length(btrim(label)) between 1 and 60)
);
alter table public.notification_audiences enable row level security;
create policy aud_admin_all on public.notification_audiences
  for all using ((select private.is_admin())) with check ((select private.is_admin()));

create or replace function private.notification_v2_clean(
  p_title text, p_body text, p_category text, p_content jsonb, p_url text, p_audiences text[])
returns jsonb language plpgsql immutable set search_path = '' as $fn$
declare
  v_cat text := lower(btrim(coalesce(p_category, '')));
  v_url text := nullif(btrim(coalesce(p_url, '')), '');
  v_aud text[];
begin
  if p_title is null or length(btrim(p_title)) = 0 then raise exception 'title_required'; end if;
  if length(btrim(p_title)) > 140 then raise exception 'title_too_long'; end if;
  if p_body is null or length(btrim(p_body)) = 0 then raise exception 'body_required'; end if;
  if length(btrim(p_body)) > 500 then raise exception 'body_too_long'; end if;
  if v_cat not in ('admin','material','contest') then raise exception 'bad_category'; end if;
  if p_content is not null then
    if jsonb_typeof(p_content) <> 'object'
       or (p_content->>'v') is distinct from '1'
       or jsonb_typeof(p_content->'blocks') is distinct from 'array' then
      raise exception 'bad_content';
    end if;
    if length(p_content::text) > 20000 then raise exception 'content_too_large'; end if;
  end if;
  if v_cat = 'contest' then
    v_url := '/competitions';
  elsif v_cat = 'admin' then
    v_url := null;
  else
    if v_url is null then raise exception 'url_required_for_material'; end if;
    if left(v_url, 1) <> '/' then raise exception 'url_must_start_with_slash'; end if;
  end if;
  select coalesce(array_agg(distinct btrim(x)) filter (where btrim(x) <> ''), '{}')
    into v_aud from unnest(coalesce(p_audiences, '{}'::text[])) as x;
  if cardinality(v_aud) > 20 then raise exception 'too_many_audiences'; end if;
  return jsonb_build_object('title', btrim(p_title), 'body', btrim(p_body),
    'category', v_cat, 'url', v_url, 'audiences', to_jsonb(v_aud));
end $fn$;

create or replace function public.resolve_notification_audience(p_audiences text[])
returns setof uuid language sql stable security definer set search_path = '' as $fn$
  with a as (
    select nullif(lower(btrim(x)), '') as e from unnest(coalesce(p_audiences, '{}'::text[])) as x
  ),
  flags as (
    select (count(*) = 0 or coalesce(bool_or(e = 'all'), false)) as everyone from a where e is not null
  ),
  levels as (
    select e from a where e is not null and e <> 'all' and e not like 'custom:%'
  ),
  customs as (
    select c.id, c.match_levels, c.match_package_ids from public.notification_audiences c
    where exists (select 1 from a where a.e = 'custom:' || c.id::text)
  )
  select p.id from public.profiles p where (select everyone from flags)
  union
  select p.id from public.profiles p where lower(btrim(p.education_level)) in (select e from levels)
  union
  select p.id from public.profiles p join customs c on exists (
    select 1 from unnest(c.match_levels) l where lower(btrim(l)) = lower(btrim(p.education_level)))
  union
  select p.id from public.profiles p join customs c on exists (
    select 1 from (select user_id, package_id from public.enrollments
                   union select user_id, package_id from public.access_grants) u
    where u.user_id = p.id and u.package_id = any (c.match_package_ids))
$fn$;

create or replace function public.admin_count_notification_audience(p_audiences text[])
returns integer language plpgsql security definer set search_path = '' as $fn$
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  return (select count(*)::int from public.resolve_notification_audience(p_audiences));
end $fn$;

create or replace function public.admin_audience_level_counts()
returns jsonb language plpgsql security definer set search_path = '' as $fn$
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  return jsonb_build_object(
    'total', (select count(*) from public.profiles),
    'no_level', (select count(*) from public.profiles where nullif(btrim(coalesce(education_level, '')), '') is null),
    'levels', coalesce((
      select jsonb_agg(jsonb_build_object('level', s.lvl, 'n', s.n) order by s.n desc, s.lvl)
      from (select min(btrim(education_level)) as lvl, count(*) as n
            from public.profiles
            where nullif(btrim(coalesce(education_level, '')), '') is not null
            group by lower(btrim(education_level))) s
    ), '[]'::jsonb));
end $fn$;

create or replace function public.admin_add_notification_audience(
  p_label text, p_match_levels text[] default '{}', p_match_package_ids text[] default '{}')
returns uuid language plpgsql security definer set search_path = '' as $fn$
declare v_id uuid; v_label text := btrim(coalesce(p_label, '')); v_lv text[]; v_pk text[];
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  if length(v_label) = 0 or length(v_label) > 60 then raise exception 'label_1_to_60_chars'; end if;
  if lower(v_label) in ('all', 'everyone') then raise exception 'label_reserved'; end if;
  select coalesce(array_agg(distinct btrim(x)) filter (where btrim(x) <> ''), '{}')
    into v_lv from unnest(coalesce(p_match_levels, '{}'::text[])) as x;
  select coalesce(array_agg(distinct btrim(x)) filter (where btrim(x) <> ''), '{}')
    into v_pk from unnest(coalesce(p_match_package_ids, '{}'::text[])) as x;
  if cardinality(v_lv) = 0 and cardinality(v_pk) = 0 then raise exception 'needs_a_level_or_package'; end if;
  insert into public.notification_audiences (label, match_levels, match_package_ids, created_by)
  values (v_label, v_lv, v_pk, (select auth.jwt() ->> 'email'))
  returning id into v_id;
  return v_id;
end $fn$;

create or replace function public.admin_delete_notification_audience(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $fn$
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  if exists (select 1 from public.scheduled_notifications s
             where s.status = 'pending' and ('custom:' || p_id::text) = any (coalesce(s.audiences, '{}'::text[]))) then
    raise exception 'in_use_by_pending_schedule';
  end if;
  delete from public.notification_audiences where id = p_id;
  if not found then raise exception 'not_found'; end if;
end $fn$;

create or replace function public.admin_list_notification_audiences()
returns jsonb language plpgsql security definer set search_path = '' as $fn$
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', c.id, 'label', c.label, 'match_levels', c.match_levels,
      'match_package_ids', c.match_package_ids,
      'students', (select count(*) from public.resolve_notification_audience(array['custom:' || c.id::text]))
    ) order by c.label)
    from public.notification_audiences c), '[]'::jsonb);
end $fn$;

create or replace function public.admin_schedule_notification_v2(
  p_title text, p_body text, p_send_at timestamptz,
  p_category text default 'admin', p_content jsonb default null, p_url text default null,
  p_audiences text[] default null, p_package_id text default null, p_competition_id uuid default null)
returns uuid language plpgsql security definer set search_path = '' as $fn$
declare v_id uuid; v_c jsonb;
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  if p_send_at is null or p_send_at <= now() then raise exception 'send_at_must_be_in_future'; end if;
  v_c := private.notification_v2_clean(p_title, p_body, p_category, p_content, p_url, p_audiences);
  insert into public.scheduled_notifications
    (title, body, url, send_at, category, content, audiences, package_id, competition_id, created_by)
  values
    (v_c->>'title', v_c->>'body', v_c->>'url', p_send_at, v_c->>'category', p_content,
     case when jsonb_array_length(v_c->'audiences') = 0 then null
          else array(select jsonb_array_elements_text(v_c->'audiences')) end,
     nullif(btrim(coalesce(p_package_id, '')), ''), p_competition_id, (select auth.jwt() ->> 'email'))
  returning id into v_id;
  return v_id;
end $fn$;

create or replace function public.admin_update_scheduled_notification_v2(
  p_id uuid, p_title text, p_body text, p_send_at timestamptz,
  p_category text default 'admin', p_content jsonb default null, p_url text default null,
  p_audiences text[] default null)
returns void language plpgsql security definer set search_path = '' as $fn$
declare v_c jsonb;
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  if p_send_at is null or p_send_at <= now() then raise exception 'send_at_must_be_in_future'; end if;
  v_c := private.notification_v2_clean(p_title, p_body, p_category, p_content, p_url, p_audiences);
  update public.scheduled_notifications set
    title = v_c->>'title', body = v_c->>'body', url = v_c->>'url', send_at = p_send_at,
    category = v_c->>'category', content = p_content,
    audiences = case when jsonb_array_length(v_c->'audiences') = 0 then null
                     else array(select jsonb_array_elements_text(v_c->'audiences')) end
  where id = p_id and status = 'pending';
  if not found then raise exception 'not_pending_or_not_found'; end if;
end $fn$;

create or replace function public.admin_list_scheduled_notifications_v2(p_limit integer default 50)
returns jsonb language plpgsql security definer set search_path = '' as $fn$
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  return coalesce((
    select jsonb_agg(to_jsonb(s) order by s.send_at desc)
    from (
      select id, title, body, url, send_at, status, category, content, audiences,
             audience_scope, package_id, competition_id, created_by, created_at, sent_at, last_error, attempts
      from public.scheduled_notifications
      order by send_at desc
      limit greatest(1, least(coalesce(p_limit, 50), 200))
    ) s), '[]'::jsonb);
end $fn$;

revoke all on function public.resolve_notification_audience(text[]) from public, anon, authenticated;
grant execute on function public.resolve_notification_audience(text[]) to service_role;
revoke all on function public.admin_count_notification_audience(text[]) from public, anon;
revoke all on function public.admin_audience_level_counts() from public, anon;
revoke all on function public.admin_add_notification_audience(text, text[], text[]) from public, anon;
revoke all on function public.admin_delete_notification_audience(uuid) from public, anon;
revoke all on function public.admin_list_notification_audiences() from public, anon;
revoke all on function public.admin_schedule_notification_v2(text, text, timestamptz, text, jsonb, text, text[], text, uuid) from public, anon;
revoke all on function public.admin_update_scheduled_notification_v2(uuid, text, text, timestamptz, text, jsonb, text, text[]) from public, anon;
revoke all on function public.admin_list_scheduled_notifications_v2(integer) from public, anon;
grant execute on function public.admin_count_notification_audience(text[]) to authenticated, service_role;
grant execute on function public.admin_audience_level_counts() to authenticated, service_role;
grant execute on function public.admin_add_notification_audience(text, text[], text[]) to authenticated, service_role;
grant execute on function public.admin_delete_notification_audience(uuid) to authenticated, service_role;
grant execute on function public.admin_list_notification_audiences() to authenticated, service_role;
grant execute on function public.admin_schedule_notification_v2(text, text, timestamptz, text, jsonb, text, text[], text, uuid) to authenticated, service_role;
grant execute on function public.admin_update_scheduled_notification_v2(uuid, text, text, timestamptz, text, jsonb, text, text[]) to authenticated, service_role;
grant execute on function public.admin_list_scheduled_notifications_v2(integer) to authenticated, service_role;
