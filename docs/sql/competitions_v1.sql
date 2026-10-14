-- competitions_v1.sql  (stage C1 + C2 SQL, repo copy)
-- SOURCE: copied VERBATIM on 2026-10-14 from supabase_migrations.schema_migrations of the LIVE project
-- ("Wisdom tower academy"). These 4 migrations are ALREADY APPLIED. Do NOT run this file again on live:
-- the `create table` / `create function` statements would fail. Use it to READ the contract or to rebuild a
-- fresh/branch database. To change live, write a NEW migration (e.g. competitions_v1_e_...) and append it here.
-- Order: a (tables+RLS) -> b (triggers+helpers) -> c (student RPCs) -> d (admin RPCs + privileges).
-- Applied versions: 20261014132254, 20261014132307, 20261014132332, 20261014132347.
-- Needs existing: private.is_admin(), public.profiles, public.learning_resources, public.enrollments, public.access_grants.
-- Functional tests of these functions were NOT run/seen yet (see docs/COMPETITION_STATUS.md).

-- ===== a: competitions_v1_a_tables_rls (20261014132254) =====
create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  description text,
  audience text not null default 'all',
  package_id text,
  requires_package boolean not null default false,
  source_resource_id uuid references public.learning_resources(id) on delete set null,
  published boolean not null default false,
  countdown_state text not null default 'running'
    check (countdown_state in ('running','paused','cancelled')),
  starts_at timestamptz not null,
  duration_min integer not null check (duration_min between 1 and 600),
  ends_at timestamptz not null,
  points integer not null default 0 check (points >= 0),
  prize_title text,
  prize_details text,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.competition_questions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  position integer not null check (position > 0),
  prompt text not null check (length(trim(prompt)) > 0),
  choices jsonb not null check (jsonb_typeof(choices) = 'array' and jsonb_array_length(choices) between 2 and 8),
  unique (competition_id, position)
);

create table public.competition_answer_keys (
  question_id uuid primary key references public.competition_questions(id) on delete cascade,
  correct integer not null check (correct >= 0),
  solution text not null check (length(trim(solution)) > 0)
);

create table public.competition_entries (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('ranked','practice')),
  started_at timestamptz not null default now(),
  deadline_at timestamptz,
  submitted_at timestamptz,
  answers jsonb not null default '{}'::jsonb check (jsonb_typeof(answers) = 'object'),
  status text not null default 'in_progress' check (status in ('in_progress','submitted','auto_submitted')),
  correct_count integer,
  total_count integer,
  score integer,
  time_taken_ms integer,
  disqualified boolean not null default false,
  disqualified_reason text,
  created_at timestamptz not null default now(),
  check (mode = 'practice' or deadline_at is not null)
);
create unique index competition_entries_one_ranked
  on public.competition_entries (competition_id, user_id) where mode = 'ranked';
create index competition_entries_leaderboard
  on public.competition_entries (competition_id, score desc, time_taken_ms asc, submitted_at asc)
  where mode = 'ranked' and status <> 'in_progress' and not disqualified;
create index competition_entries_user on public.competition_entries (user_id, competition_id);
create index competition_entries_overdue on public.competition_entries (deadline_at)
  where mode = 'ranked' and status = 'in_progress';

create table public.competition_flags (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.competition_entries(id) on delete cascade,
  kind text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index competition_flags_entry on public.competition_flags (entry_id);

create table public.competition_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  competition_id uuid not null references public.competitions(id) on delete cascade,
  points integer not null,
  reason text not null default 'participation',
  created_at timestamptz not null default now(),
  unique (user_id, competition_id, reason)
);
create index competition_points_user on public.competition_points (user_id);

create table public.competition_seen (
  user_id uuid not null references auth.users(id) on delete cascade,
  competition_id uuid not null references public.competitions(id) on delete cascade,
  seen_at timestamptz not null default now(),
  primary key (user_id, competition_id)
);

create table public.scheduled_notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  audience_scope text,
  package_id text,
  competition_id uuid references public.competitions(id) on delete set null,
  url text,
  send_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending','sent','cancelled','failed')),
  created_by text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index scheduled_notifications_due on public.scheduled_notifications (send_at) where status = 'pending';

alter table public.competitions enable row level security;
alter table public.competition_questions enable row level security;
alter table public.competition_answer_keys enable row level security;
alter table public.competition_entries enable row level security;
alter table public.competition_flags enable row level security;
alter table public.competition_points enable row level security;
alter table public.competition_seen enable row level security;
alter table public.scheduled_notifications enable row level security;

create policy comp_admin_all on public.competitions for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy compq_admin_all on public.competition_questions for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy compk_admin_all on public.competition_answer_keys for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy compf_admin_all on public.competition_flags for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy sched_admin_all on public.scheduled_notifications for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));
create policy compe_select_own on public.competition_entries for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy compp_select_own on public.competition_points for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy comps_select_own on public.competition_seen for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.competitions, public.competition_questions, public.competition_answer_keys,
  public.competition_entries, public.competition_flags, public.competition_points,
  public.competition_seen, public.scheduled_notifications from anon, authenticated;
grant select, insert, update, delete on public.competitions, public.competition_questions,
  public.competition_answer_keys, public.competition_flags, public.scheduled_notifications to authenticated;
grant select on public.competition_entries, public.competition_points, public.competition_seen to authenticated;

-- ===== b: competitions_v1_b_triggers_helpers (20261014132307) =====
create function private.competitions_before_write() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.ends_at := new.starts_at + (new.duration_min * interval '1 minute');
  new.updated_at := now();
  if tg_op = 'UPDATE' then
    if old.starts_at <= now()
       and (new.starts_at is distinct from old.starts_at or new.duration_min is distinct from old.duration_min) then
      raise exception 'competition_locked: times cannot change after the start';
    end if;
  end if;
  return new;
end $$;
create trigger competitions_before_write before insert or update on public.competitions
  for each row execute function private.competitions_before_write();

create function private.lock_after_start() returns trigger
language plpgsql security definer set search_path = '' as $$
declare v_cid uuid; v_start timestamptz;
begin
  if tg_table_name = 'competition_questions' then
    v_cid := case when tg_op = 'DELETE' then old.competition_id else new.competition_id end;
  else
    select q.competition_id into v_cid from public.competition_questions q
     where q.id = case when tg_op = 'DELETE' then old.question_id else new.question_id end;
  end if;
  if v_cid is not null then
    select c.starts_at into v_start from public.competitions c where c.id = v_cid;
    if v_start is not null and v_start <= now() then
      raise exception 'competition_locked: questions cannot change after the start';
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end $$;
create trigger competition_questions_lock before insert or update or delete on public.competition_questions
  for each row execute function private.lock_after_start();
create trigger competition_keys_lock before insert or update or delete on public.competition_answer_keys
  for each row execute function private.lock_after_start();

create function private.competition_phase(p_c public.competitions) returns text
language sql stable set search_path = '' as $$
  select case
    when p_c.countdown_state = 'cancelled' then 'cancelled'
    when p_c.countdown_state = 'paused' and now() < p_c.starts_at then 'paused'
    when now() < p_c.starts_at then 'upcoming'
    when now() < p_c.ends_at then 'live'
    else 'closed' end;
$$;

create function private.competition_access(p_c public.competitions, p_uid uuid) returns text
language plpgsql stable security definer set search_path = '' as $$
declare v_scope text; v_email text;
begin
  if (select private.is_admin()) then return 'ok'; end if;
  select lower(coalesce(p.active_academic_scope, 'freshman')) into v_scope from public.profiles p where p.id = p_uid;
  v_scope := coalesce(v_scope, 'freshman');
  if lower(p_c.audience) <> 'all' and lower(p_c.audience) <> v_scope then return 'audience'; end if;
  if p_c.requires_package then
    v_email := lower(coalesce(auth.jwt() ->> 'email', ''));
    if p_c.package_id is null or (
      not exists (select 1 from public.enrollments en where en.package_id = p_c.package_id
                   and (en.user_id = p_uid or (v_email <> '' and lower(en.email) = v_email)))
      and not exists (select 1 from public.access_grants ag where ag.package_id = p_c.package_id
                   and (ag.user_id = p_uid or (v_email <> '' and lower(ag.email) = v_email)))
    ) then return 'package'; end if;
  end if;
  return 'ok';
end $$;

create function private.score_answers(p_competition_id uuid, p_answers jsonb) returns integer
language sql stable security definer set search_path = '' as $$
  select count(*)::int
    from public.competition_questions q
    join public.competition_answer_keys k on k.question_id = q.id
   where q.competition_id = p_competition_id
     and case when (p_answers ->> q.id::text) ~ '^[0-9]{1,3}$'
              then (p_answers ->> q.id::text)::int = k.correct else false end;
$$;

create function private.finalize_entry(p_entry_id uuid, p_auto boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare e public.competition_entries; v_correct int; v_total int; v_sub timestamptz; v_pts int;
begin
  select * into e from public.competition_entries where id = p_entry_id and status = 'in_progress' for update;
  if not found then return; end if;
  v_sub := case when p_auto then coalesce(e.deadline_at, now()) else now() end;
  v_correct := private.score_answers(e.competition_id, e.answers);
  select count(*) into v_total from public.competition_questions q where q.competition_id = e.competition_id;
  update public.competition_entries set
      status = case when p_auto then 'auto_submitted' else 'submitted' end,
      submitted_at = v_sub, correct_count = v_correct, total_count = v_total, score = v_correct,
      time_taken_ms = greatest(0, round(extract(epoch from (v_sub - e.started_at)) * 1000))::int
   where id = e.id;
  if e.mode = 'ranked' and not e.disqualified then
    select c.points into v_pts from public.competitions c where c.id = e.competition_id;
    if coalesce(v_pts, 0) > 0 then
      insert into public.competition_points (user_id, competition_id, points, reason)
      values (e.user_id, e.competition_id, v_pts, 'participation')
      on conflict (user_id, competition_id, reason) do nothing;
    end if;
  end if;
end $$;

create function private.sweep_overdue_entries(p_competition_id uuid default null) returns integer
language plpgsql security definer set search_path = '' as $$
declare r record; n integer := 0;
begin
  for r in
    select e.id from public.competition_entries e
     where e.mode = 'ranked' and e.status = 'in_progress' and e.deadline_at <= now()
       and (p_competition_id is null or e.competition_id = p_competition_id)
     order by e.deadline_at limit 500 for update skip locked
  loop
    perform private.finalize_entry(r.id, true);
    n := n + 1;
  end loop;
  return n;
end $$;

-- ===== c: competitions_v1_c_student_rpcs (20261014132332) =====
create function public.competition_server_time() returns timestamptz
language sql security definer set search_path = '' as $$ select now(); $$;

create function public.list_competitions() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_list jsonb;
begin
  if v_uid is null then raise exception 'not_signed_in'; end if;
  perform private.sweep_overdue_entries(null);
  select coalesce(jsonb_agg(x.j order by x.starts_at desc), '[]'::jsonb) into v_list
  from (
    select c.starts_at, jsonb_build_object(
      'id', c.id, 'title', c.title, 'description', c.description, 'audience', c.audience,
      'starts_at', c.starts_at, 'ends_at', c.ends_at, 'duration_min', c.duration_min,
      'question_count', (select count(*) from public.competition_questions q where q.competition_id = c.id),
      'countdown_state', c.countdown_state, 'phase', ph.phase,
      'requires_package', c.requires_package, 'can_enter', (acc.a = 'ok'), 'access', acc.a,
      'ranked_entry', (select jsonb_build_object('id', e.id, 'status', e.status,
                          'deadline_at', e.deadline_at, 'disqualified', e.disqualified)
                         from public.competition_entries e
                        where e.competition_id = c.id and e.user_id = v_uid and e.mode = 'ranked'),
      'practice_available', (ph.phase = 'closed'),
      'unseen', not exists (select 1 from public.competition_seen s where s.user_id = v_uid and s.competition_id = c.id),
      'prize_title', case when ph.phase = 'closed' then c.prize_title end,
      'prize_details', case when ph.phase = 'closed' then c.prize_details end,
      'points', case when ph.phase = 'closed' then c.points end
    ) as j
    from public.competitions c
    cross join lateral (select private.competition_phase(c) as phase) ph
    cross join lateral (select private.competition_access(c, v_uid) as a) acc
    where c.published and acc.a <> 'audience'
  ) x;
  return jsonb_build_object('server_now', now(), 'competitions', v_list);
end $$;

create function public.start_competition(p_competition_id uuid, p_mode text default 'ranked') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); c public.competitions; e public.competition_entries; v_phase text; v_acc text; v_qs jsonb;
begin
  if v_uid is null then raise exception 'not_signed_in'; end if;
  if p_mode not in ('ranked','practice') then raise exception 'bad_mode'; end if;
  perform private.sweep_overdue_entries(p_competition_id);
  select * into c from public.competitions where id = p_competition_id and published;
  if not found then raise exception 'competition_not_found'; end if;
  v_acc := private.competition_access(c, v_uid);
  if v_acc <> 'ok' then raise exception 'not_allowed: %', v_acc; end if;
  v_phase := private.competition_phase(c);
  if p_mode = 'ranked' then
    if v_phase <> 'live' then raise exception 'ranked_not_live: phase is %', v_phase; end if;
    insert into public.competition_entries (competition_id, user_id, mode, deadline_at)
    values (c.id, v_uid, 'ranked', c.ends_at)
    on conflict (competition_id, user_id) where mode = 'ranked' do nothing;
    select * into e from public.competition_entries
     where competition_id = c.id and user_id = v_uid and mode = 'ranked';
    if e.disqualified then raise exception 'disqualified: %', coalesce(e.disqualified_reason, ''); end if;
    if e.status <> 'in_progress' then raise exception 'already_submitted'; end if;
    if now() >= e.deadline_at then raise exception 'expired'; end if;
  else
    if v_phase <> 'closed' then raise exception 'practice_not_open: phase is %', v_phase; end if;
    insert into public.competition_entries (competition_id, user_id, mode)
    values (c.id, v_uid, 'practice') returning * into e;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'position', q.position,
           'prompt', q.prompt, 'choices', q.choices) order by q.position), '[]'::jsonb)
    into v_qs from public.competition_questions q where q.competition_id = c.id;
  return jsonb_build_object('server_now', now(), 'entry_id', e.id, 'mode', e.mode,
    'started_at', e.started_at, 'deadline_at', e.deadline_at, 'duration_min', c.duration_min,
    'answers', e.answers, 'questions', v_qs);
end $$;

create function public.save_competition_answers(p_entry_id uuid, p_answers jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); e public.competition_entries;
begin
  if v_uid is null then raise exception 'not_signed_in'; end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' or length(p_answers::text) > 20000 then
    raise exception 'bad_answers';
  end if;
  select * into e from public.competition_entries where id = p_entry_id and user_id = v_uid for update;
  if not found then raise exception 'entry_not_found'; end if;
  if e.status <> 'in_progress' then raise exception 'already_submitted'; end if;
  if e.mode = 'ranked' and now() >= e.deadline_at then raise exception 'deadline_passed'; end if;
  update public.competition_entries set answers = p_answers where id = e.id;
  return jsonb_build_object('saved_at', now());
end $$;

create function public.submit_competition(p_entry_id uuid, p_answers jsonb default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); e public.competition_entries;
begin
  if v_uid is null then raise exception 'not_signed_in'; end if;
  select * into e from public.competition_entries where id = p_entry_id and user_id = v_uid for update;
  if not found then raise exception 'entry_not_found'; end if;
  if e.status = 'in_progress' then
    if e.mode = 'ranked' and now() >= e.deadline_at then
      perform private.finalize_entry(e.id, true);
    else
      if p_answers is not null then
        if jsonb_typeof(p_answers) <> 'object' or length(p_answers::text) > 20000 then raise exception 'bad_answers'; end if;
        update public.competition_entries set answers = p_answers where id = e.id;
      end if;
      perform private.finalize_entry(e.id, false);
    end if;
    select * into e from public.competition_entries where id = p_entry_id;
  end if;
  return jsonb_build_object('entry_id', e.id, 'mode', e.mode, 'status', e.status,
    'score', e.score, 'total', e.total_count, 'correct_count', e.correct_count,
    'time_taken_ms', e.time_taken_ms, 'submitted_at', e.submitted_at);
end $$;

create function public.competition_leaderboard(p_competition_id uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); c public.competitions; v_phase text; v_total int;
        v_top jsonb; v_me jsonb; v_n int; v_dq jsonb; v_myentry public.competition_entries;
begin
  if v_uid is null then raise exception 'not_signed_in'; end if;
  select * into c from public.competitions where id = p_competition_id and published;
  if not found then raise exception 'competition_not_found'; end if;
  if private.competition_access(c, v_uid) = 'audience' then raise exception 'not_allowed'; end if;
  v_phase := private.competition_phase(c);
  if v_phase <> 'closed' then
    return jsonb_build_object('available', false, 'phase', v_phase);
  end if;
  perform private.sweep_overdue_entries(c.id);
  select count(*) into v_total from public.competition_questions q where q.competition_id = c.id;
  with ranked as (
    select row_number() over (order by e.score desc, e.time_taken_ms asc, e.submitted_at asc, e.id) as rnk,
           e.user_id, coalesce(nullif(trim(p.full_name), ''), 'Student') as name,
           e.score, e.total_count as total, e.time_taken_ms
      from public.competition_entries e left join public.profiles p on p.id = e.user_id
     where e.competition_id = c.id and e.mode = 'ranked' and e.status <> 'in_progress' and not e.disqualified
  )
  select (select count(*) from ranked),
         (select coalesce(jsonb_agg(jsonb_build_object('rank', t.rnk, 'name', t.name, 'score', t.score,
                  'total', t.total, 'time_taken_ms', t.time_taken_ms) order by t.rnk), '[]'::jsonb)
            from ranked t where t.rnk <= 10),
         (select jsonb_build_object('rank', t.rnk, 'name', t.name, 'score', t.score, 'total', t.total,
                  'time_taken_ms', t.time_taken_ms) from ranked t where t.user_id = v_uid)
    into v_n, v_top, v_me;
  select * into v_myentry from public.competition_entries
   where competition_id = c.id and user_id = v_uid and mode = 'ranked';
  if found and v_myentry.disqualified then
    v_dq := jsonb_build_object('reason', v_myentry.disqualified_reason);
  end if;
  return jsonb_build_object('available', true, 'participants', v_n, 'total_questions', v_total,
    'top', v_top, 'me', v_me, 'disqualified', v_dq,
    'prize_title', c.prize_title, 'prize_details', c.prize_details, 'points', c.points);
end $$;

create function public.competition_review(p_competition_id uuid, p_entry_id uuid default null) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); c public.competitions; e public.competition_entries;
begin
  if v_uid is null then raise exception 'not_signed_in'; end if;
  select * into c from public.competitions where id = p_competition_id and published;
  if not found then raise exception 'competition_not_found'; end if;
  if private.competition_access(c, v_uid) = 'audience' then raise exception 'not_allowed'; end if;
  if private.competition_phase(c) <> 'closed' then raise exception 'review_not_open'; end if;
  if p_entry_id is null then
    select * into e from public.competition_entries
     where competition_id = c.id and user_id = v_uid and mode = 'ranked';
  else
    select * into e from public.competition_entries
     where id = p_entry_id and user_id = v_uid and competition_id = c.id;
  end if;
  if not found or e.status = 'in_progress' then raise exception 'entry_not_found'; end if;
  return jsonb_build_object(
    'entry', jsonb_build_object('id', e.id, 'mode', e.mode, 'score', e.score, 'total', e.total_count,
               'time_taken_ms', e.time_taken_ms, 'submitted_at', e.submitted_at),
    'questions', (select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'position', q.position,
        'prompt', q.prompt, 'choices', q.choices, 'correct', k.correct, 'solution', k.solution,
        'chosen', case when (e.answers ->> q.id::text) ~ '^[0-9]{1,3}$' then (e.answers ->> q.id::text)::int end)
        order by q.position), '[]'::jsonb)
      from public.competition_questions q join public.competition_answer_keys k on k.question_id = q.id
     where q.competition_id = c.id));
end $$;

create function public.mark_competition_seen(p_competition_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not_signed_in'; end if;
  if not exists (select 1 from public.competitions c where c.id = p_competition_id and c.published) then return; end if;
  insert into public.competition_seen (user_id, competition_id) values (v_uid, p_competition_id)
  on conflict (user_id, competition_id) do update set seen_at = now();
end $$;

create function public.get_my_competition_points() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not_signed_in'; end if;
  return jsonb_build_object(
    'total', (select coalesce(sum(p.points), 0) from public.competition_points p where p.user_id = v_uid),
    'items', (select coalesce(jsonb_agg(jsonb_build_object('competition_id', p.competition_id, 'title', c.title,
                'points', p.points, 'created_at', p.created_at) order by p.created_at desc), '[]'::jsonb)
                from public.competition_points p join public.competitions c on c.id = p.competition_id
               where p.user_id = v_uid));
end $$;

-- ===== d: competitions_v1_d_admin_rpcs_privileges (20261014132347) =====
create function public.admin_publish_competition_from_exam(
  p_resource_id uuid, p_starts_at timestamptz, p_title text default null, p_audience text default null,
  p_duration_min integer default null, p_points integer default 0, p_prize_title text default null,
  p_prize_details text default null, p_requires_package boolean default false, p_publish boolean default false
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare r public.learning_resources; v_q jsonb; q jsonb; i int := 0; v_nch int; v_correct numeric;
        v_cid uuid; v_qid uuid; v_dur int;
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  select * into r from public.learning_resources where id = p_resource_id and hub = 'exams' and content_type = 'exam';
  if not found then raise exception 'exam_not_found'; end if;
  v_q := r.meta -> 'questions';
  if jsonb_typeof(v_q) <> 'array' or jsonb_array_length(v_q) = 0 then raise exception 'exam_has_no_questions'; end if;
  if p_starts_at is null or p_starts_at <= now() then raise exception 'start_must_be_in_the_future'; end if;
  for q in select value from jsonb_array_elements(v_q) loop
    i := i + 1;
    v_nch := case when jsonb_typeof(q -> 'choices') = 'array' then jsonb_array_length(q -> 'choices') else 0 end;
    v_correct := case when jsonb_typeof(q -> 'correct') = 'number' then (q ->> 'correct')::numeric else -1 end;
    if coalesce(trim(q ->> 'prompt'), '') = '' or v_nch < 2 or v_nch > 8 or v_correct < 0 or v_correct >= v_nch
       or v_correct <> trunc(v_correct) or coalesce(trim(q ->> 'solution'), '') = '' then
      raise exception 'bad_question_at_position_%', i;
    end if;
  end loop;
  v_dur := coalesce(p_duration_min, case when (r.meta ->> 'durationMin') ~ '^[0-9]{1,3}$' then (r.meta ->> 'durationMin')::int end);
  if v_dur is null then raise exception 'duration_required'; end if;
  insert into public.competitions (title, audience, package_id, requires_package, source_resource_id,
      published, starts_at, duration_min, points, prize_title, prize_details, created_by)
  values (coalesce(nullif(trim(p_title), ''), r.title), lower(coalesce(nullif(trim(p_audience), ''), r.package_id)),
      r.package_id, p_requires_package, r.id, p_publish, p_starts_at, v_dur, coalesce(p_points, 0),
      p_prize_title, p_prize_details, auth.jwt() ->> 'email')
  returning id into v_cid;
  i := 0;
  for q in select value from jsonb_array_elements(v_q) loop
    i := i + 1;
    insert into public.competition_questions (competition_id, position, prompt, choices)
    values (v_cid, i, q ->> 'prompt', q -> 'choices') returning id into v_qid;
    insert into public.competition_answer_keys (question_id, correct, solution)
    values (v_qid, (q ->> 'correct')::int, q ->> 'solution');
  end loop;
  return v_cid;
end $$;

create function public.admin_set_competition_published(p_id uuid, p_published boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  update public.competitions set published = p_published where id = p_id;
  if not found then raise exception 'competition_not_found'; end if;
end $$;

create function public.admin_set_countdown(p_id uuid, p_state text) returns void
language plpgsql security definer set search_path = '' as $$
declare c public.competitions;
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  if p_state not in ('running','paused','cancelled') then raise exception 'bad_state'; end if;
  select * into c from public.competitions where id = p_id;
  if not found then raise exception 'competition_not_found'; end if;
  if p_state = 'paused' and c.starts_at <= now() then raise exception 'already_started'; end if;
  update public.competitions set countdown_state = p_state where id = p_id;
end $$;

create function public.admin_reschedule_competition(p_id uuid, p_starts_at timestamptz, p_duration_min integer default null) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  if p_starts_at is null or p_starts_at <= now() then raise exception 'start_must_be_in_the_future'; end if;
  update public.competitions set starts_at = p_starts_at, duration_min = coalesce(p_duration_min, duration_min) where id = p_id;
  if not found then raise exception 'competition_not_found'; end if;
end $$;

create function public.admin_start_competition_now(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  update public.competitions set starts_at = now(), countdown_state = 'running' where id = p_id;
  if not found then raise exception 'competition_not_found'; end if;
end $$;

create function public.admin_disqualify_entry(p_entry_id uuid, p_reason text) returns void
language plpgsql security definer set search_path = '' as $$
declare e public.competition_entries;
begin
  if not (select private.is_admin()) then raise exception 'admin_only'; end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'reason_required'; end if;
  update public.competition_entries set disqualified = true, disqualified_reason = trim(p_reason)
   where id = p_entry_id returning * into e;
  if not found then raise exception 'entry_not_found'; end if;
  delete from public.competition_points where user_id = e.user_id and competition_id = e.competition_id;
end $$;

do $$
declare r record;
begin
  for r in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.proname in (
              'competition_server_time','list_competitions','start_competition','save_competition_answers',
              'submit_competition','competition_leaderboard','competition_review','mark_competition_seen',
              'get_my_competition_points','admin_publish_competition_from_exam','admin_set_competition_published',
              'admin_set_countdown','admin_reschedule_competition','admin_start_competition_now','admin_disqualify_entry')
  loop
    execute format('revoke all on function %s from public, anon', r.sig);
    execute format('grant execute on function %s to authenticated', r.sig);
  end loop;
  for r in select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'private' and p.proname in (
              'competitions_before_write','lock_after_start','competition_phase','competition_access',
              'score_answers','finalize_entry','sweep_overdue_entries')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', r.sig);
  end loop;
end $$;
