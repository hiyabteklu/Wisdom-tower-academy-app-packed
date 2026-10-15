# SESSION 2026-10-15 C9 leaderboard exposure fix (Claude chat)

> Owner order: "Apply" (after the finding in `docs/SESSION_2026-10-15_C9_security_check.md`). Supabase connector. Database change only; no code changed.

## What I applied (live, migration `revoke_anon_old_leaderboard`)
```sql
revoke select on public.leaderboard_by_scope from anon;
revoke execute on function public.get_leaderboard(text, integer) from public, anon;
grant execute on function public.get_leaderboard(text, integer) to authenticated, service_role;
```

## Verified afterwards (read-only query)
anon can no longer SELECT the view (false) or run `get_leaderboard` (false); signed-in users still can (true, true). I did NOT call the website or see a hub page.

## What the owner should check
- Signed IN: open a hub page (for example Freshman); the leaderboard should still show real ranks ("Live ranks").
- Signed OUT (if the hub opens at all): the leaderboard now shows the sample list ("Top scholars"), because the public key can no longer read it. Hypothesis: the website's `supabase` client sends the signed-in session when there is one; if a signed-in student ALSO sees the sample list, tell the next agent and use the undo below.

## Undo (one statement set)
```sql
grant select on public.leaderboard_by_scope to anon;
grant execute on function public.get_leaderboard(text, integer) to anon;
```

## Not changed
The view is still SECURITY DEFINER (advisor level ERROR) and still returns full names to any signed-in student. Making it show only first name plus initial, or moving to `security_invoker`, needs an owner decision and a website check. Leaked-password protection is still off (owner dashboard setting).
