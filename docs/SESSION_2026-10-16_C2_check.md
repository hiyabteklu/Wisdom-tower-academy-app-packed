# SESSION 2026-10-16 C2 check (Claude chat, read-only): the three open hypotheses of session AT

> Owner order: "Continue". Follows `docs/SESSION_2026-10-16_UI_I.md`. Supabase and GitHub connectors. READ-ONLY SQL on the live project: no data, policy or code changed. Repo is PUBLIC: no emails written here.

## Why
`docs/SESSION_2026-10-15_AT.md` listed three unverified points about the website Competitions admin screen. All three were checkable from here and were still open on the board (C2 row).

## Results (facts from the tool output, 2026-10-16)
1. Admin can read all entries: CLOSED. Policy `compe_select_own` on `competition_entries` is `user_id = auth.uid() OR private.is_admin()` for role `authenticated`, so the admin Entries list is not limited to the admin's own rows. Same pattern on `competition_points`. `competitions`, `competition_questions`, `competition_answer_keys` and `competition_flags` have an admin-only ALL policy (`private.is_admin()`). `competition_seen` is own-rows only.
2. Column names: CLOSED. `competition_entries` has `mode`, `total_count`, `disqualified`, `disqualified_reason`, `status`; `competitions` has `package_id` and `countdown_state` (queried by name in `information_schema.columns`). This confirms the names exist; it does NOT prove every query in `CompetitionsAdminPanel.tsx` uses them correctly (the panel was read in session AT, never run).
3. Email list versus `private.is_admin()`: CLOSED for the default setup. `private.is_admin()` compares the JWT email with `private.admin_emails` (2 rows). Both emails equal the two `DEFAULT_ADMIN_EMAILS` in website `src/lib/admin.ts` (2 of 2 match, checked by a count query, not printed). CAVEAT: the website also adds any emails in the Vercel variable `NEXT_PUBLIC_ADMIN_EMAILS`; I cannot read Vercel. If that variable holds an extra email, that person would see the admin screens but the database would refuse their actions.

## Still open for C2
- The owner opens `/admin?tab=competitions` and runs one contest on an `owner-test` audience (checklist `docs/COMPETITION_ADMIN_CHECKLIST.md`).
- Vercel result of the website commits `1f0e1b7` and `f5f85bc` (not seen from chat).
- After those: C2 can move to DONE-VERIFIED. The board row was NOT edited here (whole-file resend of the 40 KB board avoided); this file is the record.

## Next, in order
1. Owner: phone test of the admin redesign (list in `SESSION_2026-10-16_UI_I.md`), Vercel result.
2. Owner decision on the old website leaderboard exposure (`SESSION_2026-10-15_C9_security_check.md`).
3. Owner: first contest through the admin screen; R7 reader test; then C9 test matrix and C10 leftovers.
