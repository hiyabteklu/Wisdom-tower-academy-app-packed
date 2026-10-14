# COMPETITION_API_CONTRACT.md — database contract for the app (C3) and the website admin dashboard (C2)

> Source of truth = the LIVE Supabase project ("Wisdom tower academy"). Signatures below were read from the live database on 2026-10-14 (`pg_get_function_arguments`). The SQL source was applied as 4 migrations: `competitions_v1_a_tables_rls`, `competitions_v1_b_triggers_helpers`, `competitions_v1_c_student_rpcs`, `competitions_v1_d_admin_rpcs_privileges`. The exact statements are stored in `supabase_migrations.schema_migrations.statements`; any function body can be dumped with `select pg_get_functiondef('public.<name>(<arg types>)'::regprocedure)`.
> Hypothesis label: behaviour notes marked (read) were read from the live function body; the rest is from names/signatures and the plan, not yet exercised by tests.

## Security facts (verified live 2026-10-14)
- Tables: `competitions`, `competition_questions`, `competition_answer_keys`, `competition_entries`, `competition_flags`, `competition_points`, `competition_seen`. RLS is ON for all 7.
- Policies: admin-only (`private.is_admin()`) for `competitions`, `competition_questions`, `competition_answer_keys`, `competition_flags`. Students can only SELECT their OWN rows of `competition_entries`, `competition_points`, `competition_seen`. So students can never read questions or answer keys directly: everything goes through the RPCs.
- `anon` has NO table privilege and NO function execute right on any competition function. `authenticated` can execute all of them (each RPC checks sign-in itself, admin RPCs check admin).
- Lock triggers enabled: `competitions_before_write`, `competition_questions_lock`, `competition_keys_lock` (started contests are locked).
- No test rows left: `competitions` = 0, `competition_entries` = 0.

## Student RPCs (call with the signed-in user's token)
| RPC | Arguments | Returns |
|---|---|---|
| `competition_server_time()` | none | timestamptz (use to compute the phone clock offset) |
| `list_competitions()` | none | jsonb |
| `mark_competition_seen(p_competition_id uuid)` | | void |
| `start_competition(p_competition_id uuid, p_mode text default 'ranked')` | mode `'ranked'` or `'practice'` | jsonb |
| `save_competition_answers(p_entry_id uuid, p_answers jsonb)` | | jsonb |
| `submit_competition(p_entry_id uuid, p_answers jsonb default null)` | | jsonb |
| `competition_leaderboard(p_competition_id uuid)` | | jsonb |
| `competition_review(p_competition_id uuid, p_entry_id uuid default null)` | only after the window closes (`review_not_open` before) | jsonb |
| `get_my_competition_points()` | none | jsonb |

`competition_leaderboard` (read): returns `{available:false, phase}` until the window is closed. After close: `{available:true, participants, total_questions, top:[{rank,name,score,total,time_taken_ms}] (ranks 1-10), me:{rank,name,score,total,time_taken_ms} or null, disqualified:{reason} or null, prize_title, prize_details, points}`. Ranking order: score desc, time_taken_ms asc, submitted_at asc (answer D). Disqualified and in-progress entries are excluded. Errors raised as exception text: `not_signed_in`, `competition_not_found`, `not_allowed`.

## Admin RPCs (website dashboard calls these; they check `private.is_admin()`)
| RPC | Arguments | Returns |
|---|---|---|
| `admin_publish_competition_from_exam(p_resource_id uuid, p_starts_at timestamptz, p_title text default null, p_audience text default null, p_duration_min int default null, p_points int default 0, p_prize_title text default null, p_prize_details text default null, p_requires_package boolean default false, p_publish boolean default false)` | builds a contest from an existing exam resource in `learning_resources` | uuid (new competition id) |
| `admin_set_competition_published(p_id uuid, p_published boolean)` | | void |
| `admin_reschedule_competition(p_id uuid, p_starts_at timestamptz, p_duration_min int default null)` | | void |
| `admin_set_countdown(p_id uuid, p_state text)` | pause/resume countdown | void |
| `admin_start_competition_now(p_id uuid)` | | void |
| `admin_disqualify_entry(p_entry_id uuid, p_reason text)` | | void |

## Known gaps
- Functional SQL tests (role-switched, rolled back) were drafted by the previous agent but their results were NOT seen by this session: treat behaviour as `[~]` until tests are run and logged.
- Website admin dashboard UI (C2 website part) is not built; it lives in the WEBSITE repo.
