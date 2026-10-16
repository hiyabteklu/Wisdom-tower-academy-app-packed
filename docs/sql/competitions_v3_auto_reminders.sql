-- competition_auto_reminders (applied live 2026-10-16, owner order). Copy of the migration.
-- Two rows in scheduled_notifications per published, running contest with a single resolvable audience:
-- "starts in 1 hour" and "is open". created_by = 'auto-reminder'. The existing dispatcher sends them.

create or replace function private.sync_competition_reminders(c public.competitions)
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_token text := lower(trim(coalesce(c.audience, '')));
  v_scope text := null;
  v_pkg text := null;
  v_start_txt text;
  v_end_txt text;
begin
  delete from public.scheduled_notifications
   where competition_id = c.id and created_by = 'auto-reminder' and status = 'pending';

  if not c.published or c.countdown_state is distinct from 'running' then return; end if;
  if v_token = '' or position(',' in v_token) > 0 or v_token = 'owner-test' then return; end if;

  if v_token = 'all' then
    v_scope := 'all';
  elsif exists (select 1 from public.profiles p where lower(coalesce(p.active_academic_scope, 'freshman')) = v_token) then
    v_scope := v_token;
  elsif exists (select 1 from public.enrollments en where lower(en.package_id) = v_token)
     or exists (select 1 from public.access_grants ag where lower(ag.package_id) = v_token) then
    v_scope := 'all';
    v_pkg := v_token;
  else
    return;
  end if;

  v_start_txt := to_char(c.starts_at at time zone 'Africa/Addis_Ababa', 'Mon DD, HH12:MI AM') || ' (Ethiopia time)';
  v_end_txt := to_char(c.ends_at at time zone 'Africa/Addis_Ababa', 'Mon DD, HH12:MI AM') || ' (Ethiopia time)';

  if c.starts_at - interval '1 hour' > now() then
    insert into public.scheduled_notifications
      (title, body, audience_scope, package_id, competition_id, url, send_at, status, created_by)
    values ('Competition starts in 1 hour', c.title || ' starts at ' || v_start_txt || '.',
            v_scope, v_pkg, c.id, '/competitions', c.starts_at - interval '1 hour', 'pending', 'auto-reminder');
  end if;

  if now() < c.starts_at + interval '2 minutes' and now() < c.ends_at then
    insert into public.scheduled_notifications
      (title, body, audience_scope, package_id, competition_id, url, send_at, status, created_by)
    values ('Competition is open', c.title || ' is open now. You can join until ' || v_end_txt || '.',
            v_scope, v_pkg, c.id, '/competitions', c.starts_at, 'pending', 'auto-reminder');
  end if;
end
$fn$;

create or replace function private.competitions_reminders_after_write()
returns trigger language plpgsql security definer set search_path = '' as $fn$
begin
  perform private.sync_competition_reminders(new);
  return null;
end
$fn$;

create or replace function private.competitions_reminders_before_delete()
returns trigger language plpgsql security definer set search_path = '' as $fn$
begin
  delete from public.scheduled_notifications
   where competition_id = old.id and created_by = 'auto-reminder' and status in ('pending', 'sending');
  return old;
end
$fn$;

revoke all on function private.sync_competition_reminders(public.competitions) from public, anon, authenticated;
revoke all on function private.competitions_reminders_after_write() from public, anon, authenticated;
revoke all on function private.competitions_reminders_before_delete() from public, anon, authenticated;

drop trigger if exists competitions_reminders_after_write on public.competitions;
create trigger competitions_reminders_after_write
  after insert or update of published, starts_at, ends_at, audience, title, package_id, requires_package, countdown_state
  on public.competitions for each row execute function private.competitions_reminders_after_write();

drop trigger if exists competitions_reminders_before_delete on public.competitions;
create trigger competitions_reminders_before_delete
  before delete on public.competitions for each row execute function private.competitions_reminders_before_delete();
