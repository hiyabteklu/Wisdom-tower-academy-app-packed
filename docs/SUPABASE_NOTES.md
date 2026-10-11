# Supabase facts for agents (re-verified and FIXED 2026-10-11)

Repo is PUBLIC: this file holds structure only. No keys, no student data, no exploit details. Re-verify before relying on it (the owner can change the project any time). Agents with Supabase access: read first (`select`, catalog views, advisors). Change policies or data only with the owner's explicit approval, one migration per topic, and test with `set local role anon` / `authenticated` plus a fake JWT inside a rolled-back transaction.

## Project
- One project, name "Wisdom tower academy", ref `amieczmpqrvavzjikbdi`, region eu-central-1, Postgres 17. App and website use this same project (public URL + anon key only). The website server also uses the service-role key (Vercel env only), which bypasses RLS.

## OWNER-APPROVED SECURITY FIX, 2026-10-11 (owner said: "fix them all")
Applied as Supabase migrations (names in the migration history): `admin_helper_private_schema`, `profiles_policies_constraint_autocreate`, `lock_down_admin_and_commerce_tables`, `lock_down_notifications_tokens_cache_business`, `lock_down_storage_buckets`, `leaderboard_view_hide_email_prefix`.
- **Admin concept now exists in the database.** `private.is_admin()` checks the signed-in user's e-mail against table `private.admin_emails` (not reachable through the API). It mirrors the website's admin list (`src/lib/admin.ts`). To add or remove an admin, change that table (SQL editor), AND the website list. If the website's `NEXT_PUBLIC_ADMIN_EMAILS` env var contains more admins than the table, those extra admins lose admin rights in the database until added to the table.
- **Before the fix, any signed-in student (and for some tables any visitor with the public key) could read or change admin-only data** (orders, enrollments, grants, locks, catalog, notifications, device tokens, receipts). Now: students see only their own rows; admin sees all; public content (published resources, active catalog, content locks, broadcast notifications) stays readable by everyone.
- Student rules now: `orders`: may create a PENDING order (status `pending_payment` or `pending_verification`, no verified fields), read their own (by `user_id` or e-mail), and update their own while still pending; only admin approves, rejects or deletes. `enrollments`, `access_grants`, `inquiries`: own rows only. `academic_results`, `learning_progress`, `exam_attempts`: own rows only (leaderboard uses the view below).
- Server-only (no client policy at all; service role only): `ai_explanations`, `api_rate_limits`. `user_device_tokens`: admin only. `question_explanations`: public read, admin write.
- Tables `businesses*` are empty and unused: owner or admin only.
- Storage: `payment-receipts` (public bucket) lets anyone upload but only admin can list, replace or delete; existing receipt links still work. `learning-content` (private, legacy, empty) and `free-resources` writes: admin only; `free-resources` read stays public.
- NOT fixed (needs website code, not SQL): receipt files are still readable by anyone who has the exact link (public bucket). Real fix = private bucket plus signed links in the admin screen.

## `public.profiles`
- Primary key `id` uuid = `auth.users.id` (FK, ON DELETE CASCADE). RLS ON. Policies now: SELECT own row or admin; INSERT own row; UPDATE own row. The two old open read policies and the duplicate insert policy were removed. A PATCH then upsert POST (what the app does) is allowed for the student's own row.
- A trigger on `auth.users` (`on_auth_user_created_profile`, function `public.handle_new_user`, never blocks sign-up) now creates the profile row for every new sign-up. The 16 sign-ups that had no row were backfilled (63 auth users, 63 profiles). Their student id / folio number were assigned by the existing insert trigger.
- The duplicate student-id trigger was dropped (one remains: `trg_auto_assign_student_id`). Both student-id functions now have a fixed `search_path`.
- Columns: `account_intent, active_academic_scope (default 'freshman'), amoled_mode, app_preferences (jsonb), avatar_preset (default 'scholar-cyan'), avatar_url, bio, created_at, daily_study_goal_minutes (default 45), data_saver_mode, education_level, email, first_name, font_size_preference, full_name, hear_about, id, id_expires_at, id_issued_at, last_name, phone, preferred_study_time (default 'evening'), profile_completed, school_name, sound_effects_enabled, stream, student_folio_number, student_id_number, target_exam, target_score, town_region, updated_at`. All 15 columns the app writes exist; the app does not write `email`, `student_id_number` or `student_folio_number`.
- **`education_level` check constraint widened** (it only widens, no row can break): allowed now `Grade 9..12, Remedial, Freshman, 3rd Year (ECE), Other, Exit Exam, GAT` (or null). So the website's and the app's 8 levels all save. (Finding 1 of the earlier note is resolved.)

## Leaderboard (S7)
- RPC `public.get_leaderboard(p_scope_id text, p_limit integer)` is SECURITY DEFINER and callable with the anon key on purpose: the native app can use it through `/rest/v1/rpc/get_leaderboard`. View `public.leaderboard_by_scope` is SECURITY DEFINER on purpose (it reads other students' results, which RLS now hides); the Supabase advisor will keep flagging both. The view's display name is now full name or "Student" (the e-mail prefix fallback was removed so it cannot leak).

## Security advisor after the fix
- Remaining on purpose: the leaderboard view and RPC above; tables with RLS and no policy (`ai_explanations`, `api_rate_limits`, `private.admin_emails`) = server only.
- Still open, owner action in the dashboard (cannot be done from SQL): turn ON "Leaked password protection" (Auth settings). Also not visible from SQL: minimum password length, "Confirm email", rate limits.
- Performance advisor: only small items left (a few unindexed foreign keys, two duplicate indexes, unused indexes); harmless at this size, not changed.

## Things to watch after the fix (hypotheses until tested on the live website)
- Admin panel pages: orders, enrollments, grants, locks, catalog, notifications, free resources. An admin must still be able to read, approve and reject (tested with a simulated admin session: reads work).
- Guest checkout: a not-signed-in visitor can still create a pending order and upload a receipt (policy allows it, not tested on the live site).
- Notifications addressed to one student are only visible to that student (or admin) when the request carries the student's login; the website's `/api/notifications` reads with the public key, so it only returns broadcast ("all") ones. All 7 existing notifications are broadcast.

## Other tables in `public` (all RLS on except the view)
`academic_results, access_grants, ai_explanations, api_rate_limits, business_metrics, business_subscriptions, business_updates, businesses, catalog_items, content_locks, enrollments, exam_attempts, free_resource_items, free_resource_pages, inquiries, learning_progress, learning_resources, notifications, orders, profiles, question_explanations, talent_applications, user_device_tokens` (+ view `leaderboard_by_scope`).

## Not checked / cannot be seen from SQL
- Auth settings (see above). Storage for course files is Appwrite, not Supabase. Note for S7: the website's `/api/content/pdf` proxy serves Appwrite files without checking sign-in or purchase (website code, not Supabase).
