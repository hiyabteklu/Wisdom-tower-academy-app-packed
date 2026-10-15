-- C10 slice 1 (session C10-A, 2026-10-15): student RPC to record an integrity flag.
-- Applied live as migration `c10_report_competition_flag`.
-- Flags are only RECORDED. Nothing disqualifies automatically; an admin reviews them (owner decision Q9).
-- competition_flags already existed (RLS: admin only). Students could not write to it before.

create or replace function public.report_competition_flag(p_entry_id uuid, p_kind text, p_detail jsonb default '{}'::jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_entry public.competition_entries%rowtype;
begin
  if v_uid is null then
    raise exception 'not_signed_in';
  end if;
  if p_kind is null or p_kind not in ('app_background','app_foreground','overlay_open','copy_attempt','other') then
    raise exception 'bad_kind';
  end if;
  if p_detail is null or jsonb_typeof(p_detail) <> 'object' or length(p_detail::text) > 1000 then
    raise exception 'bad_detail';
  end if;

  select * into v_entry from public.competition_entries where id = p_entry_id;
  if not found or v_entry.user_id <> v_uid then
    raise exception 'entry_not_found';
  end if;

  -- only a RANKED attempt that is still running; anything else is ignored quietly
  if v_entry.mode <> 'ranked' or v_entry.status <> 'in_progress' then
    return false;
  end if;

  -- cap per attempt so nobody can fill the table
  if (select count(*) from public.competition_flags where entry_id = p_entry_id) >= 200 then
    return false;
  end if;

  insert into public.competition_flags(entry_id, kind, detail)
  values (p_entry_id, p_kind, p_detail);
  return true;
end;
$$;

revoke all on function public.report_competition_flag(uuid, text, jsonb) from public, anon;
grant execute on function public.report_competition_flag(uuid, text, jsonb) to authenticated, service_role;
