-- ============================================================
-- Wisdom Tower Academy — Leaderboard (from real academic results)
-- Supabase → SQL Editor → paste → Run
-- Safe to re-run (idempotent)
-- ============================================================

-- Ensure profiles can be read for display names on leaderboards
alter table public.profiles enable row level security;

drop policy if exists "Public read profiles basic" on public.profiles;
create policy "Public read profiles basic" on public.profiles
  for select using (true);

-- Optional: allow reading academic_results aggregates for leaderboard
-- (users still only write their own rows)
drop policy if exists "Anyone read academic_results for leaderboard" on public.academic_results;
create policy "Anyone read academic_results for leaderboard" on public.academic_results
  for select using (true);

-- View: best score + attempt count per user per scope (branch)
create or replace view public.leaderboard_by_scope as
select
  ar.scope_id,
  ar.user_id,
  coalesce(
    nullif(trim(p.full_name), ''),
    nullif(split_part(coalesce(p.email, ''), '@', 1), ''),
    'Student'
  ) as display_name,
  max(ar.percent)::numeric(5,1) as best_percent,
  round(avg(ar.percent)::numeric, 1) as avg_percent,
  count(*)::int as attempts,
  -- Score used for ranking: best percent * 10 + bonus for consistency (attempts capped)
  (max(ar.percent) * 10
    + least(count(*), 10) * 2
  )::int as score
from public.academic_results ar
left join public.profiles p on p.id = ar.user_id
group by ar.scope_id, ar.user_id, p.full_name, p.email;

comment on view public.leaderboard_by_scope is
  'Aggregated leaderboard rows per scope_id (e.g. gat, freshman, uat). Rank in the app by score desc.';

-- Grant read access (RLS on base tables still applies for direct table access;
-- views in Postgres use invoker rights for underlying RLS in recent Supabase)
grant select on public.leaderboard_by_scope to anon, authenticated;

-- Helper function: top N for a scope (stable ranking)
create or replace function public.get_leaderboard(p_scope_id text, p_limit int default 10)
returns table (
  rank bigint,
  user_id uuid,
  name text,
  score int,
  best_percent numeric,
  avg_percent numeric,
  attempts int
)
language sql
stable
security definer
set search_path = public
as $$
  select
    row_number() over (order by lbs.score desc, lbs.best_percent desc, lbs.attempts desc) as rank,
    lbs.user_id,
    lbs.display_name as name,
    lbs.score,
    lbs.best_percent,
    lbs.avg_percent,
    lbs.attempts
  from public.leaderboard_by_scope lbs
  where lbs.scope_id = p_scope_id
  order by lbs.score desc, lbs.best_percent desc, lbs.attempts desc
  limit greatest(1, least(coalesce(p_limit, 10), 50));
$$;

grant execute on function public.get_leaderboard(text, int) to anon, authenticated;

select 'Leaderboard setup applied' as status;
