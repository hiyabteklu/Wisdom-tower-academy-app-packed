# Supabase facts for agents (verified 2026-10-11 by reading the live project)

Repo is PUBLIC: this file holds structure only. No keys, no student data, no exploit details. Re-verify before relying on it (the owner can change the project any time). Agents with Supabase access: use read-only queries (`select`, catalog views, advisors); never change policies, constraints or data without the owner's explicit approval.

## Project
- One project, name "Wisdom tower academy", ref `amieczmpqrvavzjikbdi`, region eu-central-1, Postgres 17. The app and the website use this same project (public URL + anon key only).

## `public.profiles` (what the app writes in `SupabaseAccountClient`)
- Primary key `id` uuid = `auth.users.id` (foreign key, ON DELETE CASCADE). Row-level security is ON.
- Columns: `account_intent, active_academic_scope (default 'freshman'), amoled_mode, app_preferences (jsonb), avatar_preset (default 'scholar-cyan'), avatar_url, bio, created_at, daily_study_goal_minutes (default 45), data_saver_mode, education_level, email, first_name, font_size_preference, full_name, hear_about, id, id_expires_at, id_issued_at, last_name, phone, preferred_study_time (default 'evening'), profile_completed, school_name, sound_effects_enabled, stream, student_folio_number, student_id_number, target_exam, target_score, town_region, updated_at`.
- All 15 columns the app writes exist. The app does not write `email`, `student_id_number` or `student_folio_number`.
- Write policies: INSERT and UPDATE only where `auth.uid() = id` (so PATCH then upsert POST is allowed for the student's own row; a zero-row PATCH means no row yet OR a policy refusal).
- Two BEFORE INSERT triggers (`trg_auto_assign_student_id` and `trg_auto_student_id`, same function) assign the student id number on insert. Duplicate, harmless; the number is therefore created on the first insert, not on update.
- There is NO trigger on `auth.users` that creates a profile row: on the day of the check 47 profile rows existed for 63 auth users. So some students have no row until something inserts it; the app's POST path (like the website `ensureProfile`) is needed.

## IMPORTANT finding 1: `education_level` check constraint rejects two website options
- Constraint `profiles_education_level_check` allows only: `Grade 9, Grade 10, Grade 11, Grade 12, Remedial, Freshman, Exit Exam, GAT` (or null).
- The website and the app offer the 8 levels `Grade 9..12, Remedial, Freshman, 3rd Year (ECE), Other` (`academic-levels.ts`). `3rd Year (ECE)` and `Other` are NOT allowed by the database, so a save that contains them is refused as a whole (HTTP 400, check violation). The website hides this because `updateFullProfile` ignores database errors; the app now shows "Could not save to the server..." (log tag `SupabaseAccount` shows the status code).
- `Exit Exam` and `GAT` are allowed by the database but are not in the website's option list.
- Needs an OWNER DECISION (website repo is the source of truth, so do not change the app's list alone): either widen the constraint (migration, owner approval) or change the website list. Add it to `WEBSITE_CHANGES.md` before any change.

## IMPORTANT finding 2: profile read policies (privacy review needed, owner informed in chat)
- `profiles` has more SELECT policies than "own row only". Review them with the owner BEFORE adding any native feature that reads `profiles` for other users, and before storing anything more sensitive in that table. Details deliberately not written in this public repo.

## Leaderboard (S7)
- RPC `public.get_leaderboard(p_scope_id text, p_limit integer)` exists, is SECURITY DEFINER, and `anon` and `authenticated` can both execute it: the native app can call it through `/rest/v1/rpc/get_leaderboard` with only the anon key. (Answers the open question in checklist S7.) View `public.leaderboard_by_scope` also exists (security-definer view, flagged by the Supabase advisor).

## Other tables in `public` (all have RLS on except the view)
`academic_results, access_grants, ai_explanations, api_rate_limits, business_metrics, business_subscriptions, business_updates, businesses, catalog_items, content_locks, enrollments, exam_attempts, free_resource_items, free_resource_pages, inquiries, learning_progress, learning_resources, notifications, orders, profiles, question_explanations, talent_applications, user_device_tokens` (+ view `leaderboard_by_scope`). Policies of these tables were NOT read yet: read them before S6/S7 work.

## Security advisor (2026-10-11), for the owner
- Leaked-password protection is OFF (Auth setting; the owner can switch it on in the dashboard).
- Functions `generate_next_student_id` and `auto_assign_student_id_trigger` have a mutable search_path.
- `get_leaderboard` (security definer) is callable by anon; intended for the leaderboard, keep it read-only.
- View `leaderboard_by_scope` is SECURITY DEFINER.

## Not checked / cannot be seen from SQL
- Auth settings: minimum password length (the app's "at least 6 characters" text is fixed), "Confirm email", rate limits, phone sign-in mapping.
- Storage (Appwrite is used for files, not Supabase storage).
