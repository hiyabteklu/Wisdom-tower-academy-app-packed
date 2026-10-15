-- C8 slice 2 (session AA, 2026-10-15): scheduled notifications, database part. Copy of the 2 migrations applied live
-- to project amieczmpqrvavzjikbdi: c8_extensions_pg_cron_pg_net and c8_scheduled_notifications_columns_and_admin_rpcs.
-- NOTE: the table public.scheduled_notifications ALREADY existed (created empty by competitions_v1_a, with the
-- policy sched_admin_all = private.is_admin()), with column audience_scope (null = everybody) and no attempts or
-- last_error. This migration ADDS columns and RPCs; it does not recreate the table.
-- NOT done here: the pg_cron dispatcher job (slice 4, needs the website dispatch endpoint and the owner's secret).

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

alter table public.scheduled_notifications
  add column if not exists attempts integer not null default 0,
  add column if not exists last_error text;

alter table public.scheduled_notifications drop constraint if exists scheduled_notifications_status_check;
alter table public.scheduled_notifications add constraint scheduled_notifications_status_check
  check (status = any (array['pending','sending','sent','failed','cancelled']));

create index if not exists scheduled_notifications_due_idx
  on public.scheduled_notifications (status, send_at);

create or replace function public.admin_schedule_notification(
  p_title text,
  p_body text,
  p_send_at timestamptz,
  p_url text default null,
  p_audience_scope text default null,
  p_package_id text default null,
  p_competition_id uuid default null
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare v_id uuid;
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  if p_title is null or length(trim(p_title)) = 0 then raise exception 'title_required'; end if;
  if p_body is null or length(trim(p_body)) = 0 then raise exception 'body_required'; end if;
  if p_send_at is null or p_send_at <= now() then raise exception 'send_at_must_be_in_future'; end if;
  insert into public.scheduled_notifications
    (title, body, url, send_at, audience_scope, package_id, competition_id, created_by)
  values
    (trim(p_title), trim(p_body), nullif(trim(coalesce(p_url, '')), ''), p_send_at,
     nullif(trim(coalesce(p_audience_scope, '')), ''),
     nullif(trim(coalesce(p_package_id, '')), ''), p_competition_id,
     (select auth.jwt() ->> 'email'))
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.admin_update_scheduled_notification(
  p_id uuid,
  p_title text,
  p_body text,
  p_send_at timestamptz,
  p_url text default null,
  p_audience_scope text default null,
  p_package_id text default null
) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  if p_title is null or length(trim(p_title)) = 0 then raise exception 'title_required'; end if;
  if p_body is null or length(trim(p_body)) = 0 then raise exception 'body_required'; end if;
  if p_send_at is null or p_send_at <= now() then raise exception 'send_at_must_be_in_future'; end if;
  update public.scheduled_notifications set
    title = trim(p_title),
    body = trim(p_body),
    url = nullif(trim(coalesce(p_url, '')), ''),
    send_at = p_send_at,
    audience_scope = nullif(trim(coalesce(p_audience_scope, '')), ''),
    package_id = nullif(trim(coalesce(p_package_id, '')), '')
  where id = p_id and status = 'pending';
  if not found then raise exception 'not_pending_or_not_found'; end if;
end $$;

create or replace function public.admin_cancel_scheduled_notification(p_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  update public.scheduled_notifications set status = 'cancelled'
  where id = p_id and status = 'pending';
  if not found then raise exception 'not_pending_or_not_found'; end if;
end $$;

create or replace function public.admin_list_scheduled_notifications(p_limit integer default 50)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  return coalesce((
    select jsonb_agg(to_jsonb(s) order by s.send_at desc)
    from (
      select id, title, body, url, send_at, status, audience_scope, package_id, competition_id,
             created_by, created_at, sent_at, last_error, attempts
      from public.scheduled_notifications
      order by send_at desc
      limit greatest(1, least(coalesce(p_limit, 50), 200))
    ) s
  ), '[]'::jsonb);
end $$;

revoke all on function public.admin_schedule_notification(text, text, timestamptz, text, text, text, uuid) from public, anon;
revoke all on function public.admin_update_scheduled_notification(uuid, text, text, timestamptz, text, text, text) from public, anon;
revoke all on function public.admin_cancel_scheduled_notification(uuid) from public, anon;
revoke all on function public.admin_list_scheduled_notifications(integer) from public, anon;
grant execute on function public.admin_schedule_notification(text, text, timestamptz, text, text, text, uuid) to authenticated;
grant execute on function public.admin_update_scheduled_notification(uuid, text, text, timestamptz, text, text, text) to authenticated;
grant execute on function public.admin_cancel_scheduled_notification(uuid) to authenticated;
grant execute on function public.admin_list_scheduled_notifications(integer) to authenticated;
