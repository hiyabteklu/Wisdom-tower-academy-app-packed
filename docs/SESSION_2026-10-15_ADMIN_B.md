# SESSION 2026-10-15 ADMIN-B (Claude chat): SQL check, pending-patch audit, admin hypotheses closed (docs only)

> Owner order: "read the handoff and status and continue. Run the SQL editor yourself since you have the Supabase connector and tell me what patches need to run on GitHub pending patches." Read: `HANDOFF.md`, `docs/COMPETITION_STATUS.md`, `docs/PENDING_PATCHES.md`, `docs/SESSION_2026-10-15_R3_F.md`, `docs/SESSION_2026-10-15_ADMIN_A.md`, `docs/sql/am_i_admin.sql`, the newest 20 commits, all 29 pull requests. No code change, no database change in this session.

## 1. `docs/sql/am_i_admin.sql` is ALREADY APPLIED live (read-only SQL, seen)
- Migration `20261015120440 am_i_admin` is the newest migration in `supabase_migrations.schema_migrations` (4 minutes after the ADMIN-A commit).
- Live function body equals the file: `public.am_i_admin()`, boolean, SECURITY DEFINER, empty search_path, calls `private.is_admin()`.
- Grants checked: `authenticated` can execute, `anon` cannot. Nothing left for the owner to paste in the SQL Editor.
- NOT tested: the function result for a real admin login and a student login (the connector runs without a user JWT, so it cannot show the two cases).

## 2. Patch scripts that still need "Apply pending patches" (audit, evidence named)
- Every pull request #1 to #29 shows `merged_at` set (list read). Their scripts are therefore applied: guides_screen, ece_root_route, tutor, calculator, timer, planner, guides_universities_filters (PR #8), notes_targets, status, hub_routing, login_routes, native_notifications, glass_nav, glass_guides, glass_area4, t8_settings (PR #20), notifications_one_place, t9, floating_nav, c4, c5, c8, r6 (PR #28), board_catchup (PR #29).
- CORRECTION to `docs/PENDING_PATCHES.md`: its row for P6 says "RUN, NOT MERGED"; PR #8 (`fix/guides-universities-filters`) was merged 2026-10-12 05:35 UTC.
- `patch_t1_tool_overlay_back.py` and `patch_u1_global_tool_overlays.py` are marked applied locally in the old table (no pull request); not re-checked here.
- ONLY ONE script is pending: `patch_admin_entry.py` (marker `ADMIN-entry`). Proof it is not applied: the folder `app/src/main/java/com/wisdomtower/academy/data/admin/` does not exist on `main`, and no pull request carries it.
- Owner steps: GitHub > Actions > Apply pending patches > Run workflow. Script name WITHOUT `scripts/`: `patch_admin_entry.py`. Branch name: `feature/admin-entry`. Wait for the green build, open the pull request, merge.

## 3. Hypotheses of `docs/SESSION_2026-10-15_AT.md`, checked live (read-only SQL, seen)
- Admin SELECT on `competition_entries`: EXISTS. Policy `compe_select_own` is `user_id = auth.uid() OR private.is_admin()`. The Entries list will show everybody's rows for an admin. CLOSED.
- Column names: `mode`, `total_count`, `status`, `disqualified_reason` exist on `competition_entries`; `package_id`, `countdown_state`, `audience` exist on `competitions`. CLOSED.
- Email list versus database: `private.is_admin()` checks the JWT e-mail against the table `private.admin_emails`; the website page checks `src/lib/admin.ts`. Two lists, so they can drift. STILL OPEN: compare the two lists (not done; the e-mails were not printed here because the repo is public).

## Next, in order
1. Owner runs `patch_admin_entry.py` (section 2).
2. Owner reports the CI result of the R6 merge and the admin-entry branch.
3. Compare the two admin e-mail lists.
4. R7 real-send test to the owner's own user (needs his user id and OK), then R8, C9 and C10 leftovers.
