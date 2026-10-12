# HANDOFF.md — READ THIS FIRST

> Shared memory for every AI agent (Claude, AI Studio, Codex, anyone) on this project.
> The owner is NOT a coder and is on a free plan with a small quota. Agents get cut off without warning. Live status lives in **`STATUS.md`** (owner decisions, checklist and active roadmap, session log). This file holds the stable plan, rules and specs.
> **PHASE CHANGE 2026-10-12:** the owner reports that everything previously planned is tested and working, the app is installed on their device and its current design is approved. The ONLY active work is the UI polishing roadmap (`STATUS.md` section B1, items U1 to U5). It is PLANNED, NOT IMPLEMENTED, and the owner wants documentation and planning only until they give the next instruction. See section 5.
> **This repository is PUBLIC. Never write passwords, API secrets, keystores, student emails/names, or the owner's personal data anywhere in the repo.**

---

## 0. MANDATORY AGENT PROTOCOL (follow exactly)

This section is the single source of agent rules. `CLAUDE.md` and `AGENTS.md` only point here.

**At the start of every session**
1. Read this file, then `STATUS.md` (section A decisions, section B1 active roadmap), then `docs/BUILD_PITFALLS.md` BEFORE writing any code, `docs/EDITING_LARGE_FILES.md` before touching a big file, and the newest `docs/SESSION_*.md` files (newest first; the log inside `STATUS.md` stops at 2026-10-11). Read when the task needs them: `docs/NATIVE_CONTENT_PLAN.md`, `NATIVE_APP_BRIEF.md`, `ARCHITECTURE.md`, `docs/SUPABASE_NOTES.md`, `docs/CONTENT_SHAPES.md`, `WEBSITE_CHANGES.md`, `docs/PENDING_PATCHES.md`. Section 2 says which documents are current and which are historical.
2. Do NOT ask the owner to re-explain anything written here or in `STATUS.md`. Ask only what is listed in section 8 or is genuinely new.
3. Work only on items of `STATUS.md` section B1, one task at a time, and only after the owner says which one to start. As of 2026-10-12 the owner asked to stop after documentation and planning: do not implement UI changes until told.

**While working**
4. If the task is big, first add a line `IN PROGRESS: <task>` to the `STATUS.md` session log (or, because chat tools may not be able to resend `STATUS.md`, to a new `docs/SESSION_*.md` file), so a cut-off is visible to the next agent.
5. One small commit per task; commit message says what and why. Update the checklist in the same commit as the code.
6. When the owner states a decision, preference or complaint, copy it into `STATUS.md` section A in their words with the date (or into `docs/NATIVE_CONTENT_PLAN.md` section 1 when it is about the native content work). Never drop earlier ones.
7. You usually cannot build or run the app. Mark code `[~]` (written, not compiled/tested) until CI is green AND the owner has tested it. Never claim more: say what evidence you have (code read, CI result you actually saw, owner's device report with its date) and label guesses "hypothesis".

**Big files (rule 10, owner rule 2026-10-11)**
10. NEVER tell the owner "this file is too big for my tools". The chat tools can only replace whole files, so for a huge file (`MainActivity.kt` about 245 KB) you write a small **patch script** in `scripts/` (exact anchors, safe to run twice, tested on a copy), log it in `docs/PENDING_PATCHES.md`, and tell the owner to run GitHub > Actions > Apply pending patches. Full steps, script template and the list of existing scripts: **`docs/EDITING_LARGE_FILES.md`**. Small and medium files, including `STATUS.md` (about 30 KB), are simply resent whole.

**Rules for code changes, especially the UI polishing phase (owner, 2026-10-12)**
11. (a) Inspect the relevant code BEFORE changing it; for a screen that comes from the website, audit the WHOLE screen against `website-reference/` (owner complaint 2026-10-11: fixing one string at a time makes errors show up one by one). (b) Make focused changes only. (c) Avoid regressions and preserve working behavior: the app is installed and its behavior is approved. (d) Verify changes where possible (CI, the phone checklist in section 9 for the screens touched) and say plainly what could not be verified. (e) No redesign and no architectural rewrite without a written justification the owner accepts. (f) The approved existing design stays in place except for the improvements the owner explicitly requested. (g) Root cause before fix: for bugs such as U1, find and log the cause first, then propose the fix. (h) Never invent text, numbers, sizes or progress values (owner rule 2026-10-11).

**Before you stop, or when quota is nearly gone**
8. Write the final session-log entry in `STATUS.md` (or a new `docs/SESSION_*.md`): what you did (commit ids), what is left, what the owner should test, what you were unsure about. **Log first, everything else after.**
9. Section A and the session log of `STATUS.md` are append-only; section B is edited in place. Fix mistakes in append-only text by adding a correction line.

**Owner communication rules**
- Plain, non-technical language. Short. Lead with the answer.
- Verified fact vs guess: label guesses "hypothesis".
- Quota is small: use targeted code search instead of reading huge files (`MainActivity.kt` is very large); do not re-read what these docs already say.
- Tools: the owner granted the agent the Supabase connector with read AND write (2026-10-11). Use it for what the agent can do; ask the owner only for things it cannot do (dashboard settings, Vercel env, Appwrite console, workflow files). Respect `docs/SUPABASE_NOTES.md` rules for any change.

---

## 1. Goal

A premium, native-feeling **Android app** (Kotlin + Jetpack Compose) for Wisdom Tower Academy using the **same accounts, database, storage and content as the live website**, so the owner adds/edits content once and both website and app update. UI, thumbnails and permanent screen designs are packed in the app for speed. Reason: the first WebView-only app had many malfunctions, depended on connection, and risked Google Play rejection.

**Money model (owner, 2026-10-11):** free for the next few weeks. Later the app has NO purchase buttons or prices; purchases happen on the website and unlock the app immediately.

## 2. Document map (which file to trust)

**Current**
- `HANDOFF.md` (this file): rules, goal, stack, specs. `STATUS.md`: owner decisions (A), checklist and active roadmap (B), session log (C, ends 2026-10-11).
- `docs/SESSION_*.md`: session logs after 2026-10-11, newest last alphabetically within a day is NOT guaranteed; check dates inside. Latest at the time of writing: `docs/SESSION_2026-10-12_BG.md` (audit of the remaining website-opening paths).
- `docs/NATIVE_CONTENT_PLAN.md` (native learning content: decisions, facts, steps N0 to N11), `docs/CONTENT_SHAPES.md`, `docs/SUPABASE_NOTES.md`, `docs/BUILD_PITFALLS.md`, `docs/EDITING_LARGE_FILES.md`, `docs/APPLY_PATCHES_WORKFLOW.md`, `NATIVE_APP_BRIEF.md`, `ARCHITECTURE.md`, `WEBSITE_CHANGES.md`, `PLAY_STORE_CHECKLIST.md`, `docs/PLAY_STORE_LISTING.md`.
- `docs/PENDING_PATCHES.md`: patch method, owner report of 2026-10-11 and the root causes behind P1 to P10. Its patch STATUS TABLE is OUT OF DATE (it stops at P10 and says P6 is not merged). Authoritative patch status: `docs/SESSION_2026-10-12_BF.md` and `_BG.md`.

**Historical (kept for context; may contradict the current state; not edited on 2026-10-12)**
- `docs/PROGRESS.md` (2026-10-10; still lists things removed later, e.g. the streak/goals chips and the score-logging dialog), `docs/HANDOVER.md`, `docs/FIDELITY_AUDIT.md` (written by a previous agent, may overstate fidelity: re-check, do not trust), `docs/PARITY_AUDIT.md`, `docs/OPEN_QUESTIONS.md`, `docs/WEBSITE_ANALYSIS.md`, `RELEASE_NOTES.txt`.

## 3. Repositories & stack (verified)

| Repo | Role |
|---|---|
| `hiyabteklu/Wisdom-tower-academy` | Website: Next.js 15 + React 19 + Tailwind on Vercel. Source of truth. |
| `hiyabteklu/Wisdom-tower-academy-app-packed` | THIS Android app (Kotlin, Compose). Branch `main`. Has `website-reference/` (read-only snapshot of the website, refreshed by Action "Sync website reference"). |
| `hiyabteklu/Wisdom-tower-academy-app` | Old WebView-only app. Legacy, ignore. |

- Backend: **Supabase** (login + database; free plan, project "Wisdom tower academy", eu-central-1), **Appwrite** (file storage), **Firebase** (push), Gemini (AI tutor), Groq (Explain with AI). Secret keys live only in Vercel env vars.
- Public keys allowed in the app (`.env.example`): the 6 `NEXT_PUBLIC_*` values. The `secrets-gradle-plugin` turns EVERY key in `.env.example` into a `BuildConfig` field with the same name (e.g. `BuildConfig.NEXT_PUBLIC_SUPABASE_URL`). Never add a secret or an empty value there.
- One website host everywhere: `https://www.wisdom-tower-academy.live` (localStorage is per-origin).
- App package `com.wisdomtower.academy`. Key files: `MainActivity.kt` (WebView shell and main screen, huge), `data/auth/AuthStateManager.kt`, `data/auth/SupabaseAuthClient.kt`, `data/repository/AcademyRepository.kt`, `ui/*` screens, `StructuralNav.kt`.
- Website auth: `src/lib/supabase.ts` (storage key `wt-academy-auth-v1`), `src/lib/auth-service.ts`, `src/app/login/page.tsx`, `src/lib/authIdentity.ts` (phone users are stored as `p<digits>@phone.wisdomtower.app`; Ethiopian numbers normalised to 251…).

## 4. HISTORICAL FINDINGS (2026-10-11, code + owner screenshots; kept for context)

Most of these were resolved by native sign-in (S2), the S3 analysis and the S4 audit (see `STATUS.md` B2); they were not re-verified on 2026-10-12.

1. **The app had no sign-in of its own.** `AuthStateManager` only copied `wt-academy-auth-v1` from the WebView's localStorage through a JS bridge (`syncAuthSession`, defined in `MainActivity.kt` for both WebViews). The "Scholar Sign In" pop-up was the website's `/login` page shown inside the app (`openToolOverlay`).
2. **Sign-in failed in the app.** Owner: wrong password showed "No account found with this email or phone"; correct credentials just cleared the form. A screenshot showed "No account found" for an email that DOES exist in Supabase Auth, so Supabase's password login failed from inside the app; cause never found.
3. **Website bug (hits website users too):** `auth-service.ts` falls back to a local-only fake login (id `wta_<timestamp>`, empty token, base64 password in localStorage) when Supabase fails, and turns every Supabase failure into "No account found". Fix in `WEBSITE_CHANGES.md` section 1 (NOT applied, see `STATUS.md` B3).
4. After a successful website login the page runs `window.location.href = "/account"` (full reload): in the app this looked like the form refreshing and the session was not reliably handed to native.
5. The Learning Hub cards showed "Unlock" because the app did not see a signed-in user.
6. Native token handling gaps (before S2): no refresh, tokens in plain SharedPreferences, injection into WebView only when its storage is empty and without `expires_at`/`token_type`.
7. Routes the app called that do NOT exist on the website: `/api/content/catalog` (call removed), `/api/account/profile` (replaced by direct Supabase reads in S8). Existing routes: `api/content/pdf`, `api/content/resources`, `api/notifications` (+`register-device`, `send`), `api/ai`, `api/explain`, `api/fcm-token`, `api/storage`, `api/auth`.
8. `/api/notifications` is called with `?userId=&email=` and no token (insecure): fix in `WEBSITE_CHANGES.md` section 3.
9. `AcademyRepository.CATALOG_PACKAGES` was a hardcoded seed and `getEnrolledPackages()` returned the same 6 packages for every logged-in user (placeholder); the function was removed in S4 (`bc713050`). The website also keeps enrollments locally, so no server source exists yet (see S6/N9b in `STATUS.md` B3).
10. Supabase (owner screenshots): free plan, 17 monthly active users, 34/500 MB. The Email provider panel showed NO "Confirm email" switch, so that setting is unconfirmed; phone-style accounts exist (cannot receive email), so confirmation is probably effectively off.
11. `WebCacheVault` treats `supabase.co` URLs as dynamic (not cached): probably not what broke login. Unproven.

## 5. CURRENT STATE AND ACTIVE PHASE (2026-10-12)

- Owner report: everything previously planned (native sign-in, content and hubs, profile, notifications, routing patches, fake-content audit) is tested and working; the app is installed on the owner's device; the current design is approved. Agents have NOT independently verified this (no build or device access); `STATUS.md` B2 records it as DONE "owner-reported".
- Active phase: UI polishing, `STATUS.md` B1 (U1 drawer/menu tools do not open inside courses and readers; U2 premium native AI Tutor; U3 maximize reading space; U4 book download sizes; U5 accurate download progress). All PLANNED, NOT IMPLEMENTED. The owner will say which item to start.
- Do not mix phases: parked items (website fixes, ownership when free mode ends, website-fallback removal, Play Store, videos/life savers) are in `STATUS.md` B3 and wait for the owner.

## 6. REFERENCE: native sign-in design spec (S2, DONE; copy the same look for any new auth-related screen)

- **Design: copy the website login page** (`website-reference/src/app/login/page.tsx`; owner likes it). Dark navy page; logo + title "Wisdom Tower Academy"; card with cyan top bar, gradient `#131f38 → #0e172a → #0a101d`, white/20 borders, very rounded; two tabs "Sign In" / "Create Account"; fields EMAIL OR PHONE NUMBER (mail/phone icon), PASSWORD (lock icon, show/hide eye, "Forgot password?" link to `/forgot-password`, shown on Sign In only); small notice box with optional action link; big cyan (`#22e0ff`-like cyan-400) button "Sign In →" / "Create Account →" with "Signing In..." / "Creating Account..." while loading; footer "Don't have an account? Create a free account" (and "Already have an account? Sign in"). Create Account adds FULL LEGAL NAME (placeholder "e.g. Abebe Bikila"), ACADEMIC LEVEL dropdown (default Freshman, options from `ACADEMIC_LEVEL_OPTIONS` in `src/lib/academic-levels.ts`, "Other" shows a free-text field), CONFIRM PASSWORD, and a Terms/Privacy checkbox (checked by default on the website). Use the exact texts of that page. Reuse `ui/theme/WisdomComponents.kt`, `Color.kt`, `Type.kt` where they already match. Only use Material icons that exist (see BUILD_PITFALLS).
- **Network**: `SupabaseAuthClient.kt` (password grant, sign-up mirroring the website, refresh). Its `SupabaseAuthResult.Success.sessionJson` is used directly as the WebView localStorage value for `wt-academy-auth-v1` (shape: `access_token, token_type, expires_in, expires_at, refresh_token, user{...}`) and fed to `AuthStateManager.syncAuthSession(...)`.
- **Tokens** are stored encrypted (Android Keystore), refreshed before `expires_at` and on 401; the NEW refresh token is always saved (Supabase rotates them); on refresh failure the user is signed out cleanly. Never invent a local account.
- Old diagnostic idea (S1: find what the overlay WebView of `openToolOverlay` intercepts on `/login`) is obsolete: S2 bypasses that path.

## 7. FAKE-CONTENT AUDIT (S4, DONE per owner; the rule stays in force)

Owner complaint 2026-10-11: the app showed invented captions/descriptions. Rule: compare with the website source, keep what the website has, remove or replace the rest, ask the owner if unavailable. Screens audited (details in `STATUS.md` section C and `docs/SESSION_*.md`): `AccountScreen.kt`, `AcademyRepository.kt`, `PackagesData.kt` / `PackageDetailScreen.kt`, `LearningScreen.kt`, `StudyWorkspaceScreen.kt`. Items that were still open when last logged (`GuidesData.kt`, Home/Settings wording, `docs/FIDELITY_AUDIT.md` re-check) are listed under "confirm if still needed" in `STATUS.md` B3. Any new UI text added in the polishing phase must follow the same rule.

## 8. OPEN QUESTIONS FOR THE OWNER (ask only these)

1. Supabase "Confirm email": on or off? (Not visible in the panel the owner showed.) Needed before applying the website login fix.
2. Approve applying `WEBSITE_CHANGES.md` section 1 to the live website? (Redeploys on Vercel; existing local-only fake accounts would stop working.)
3. ~~Where should real enrollments/packages come from?~~ ANSWERED 2026-10-11: free for now; later purchases happen on the website only (no purchase buttons in the app) and unlock the app immediately. Details in `docs/NATIVE_CONTENT_PLAN.md` section 1 and step N9b.
4. ~~4 or 5 bottom tabs?~~ CLOSED 2026-10-12: the layout installed on the owner's device is approved.
5. Forgot-password end to end (Resend SMTP saved, code length 6 vs 8) and the S4 part 7 questions: see `STATUS.md` B3 "Open owner questions".

## 9. PHONE TEST CHECKLIST (S10: DONE, owner-reported 2026-10-12; now the REGRESSION checklist for the polishing phase)

After each UI change, re-run the parts that touch the changed screens: sign in (email), sign in (phone), wrong password message, sign out, stay signed in after closing the app, cards show "Open", each of the 6 cards opens its hub signed in, PDF opens and downloads offline, notifications list, Account shows the real name, airplane-mode behaviour, tab switching has no blinking, ECE package shows the two semester cover cards and then the 7 courses of the chosen semester. For the polishing items also check: drawer/menu tools open from home, from inside a course and from inside each reader (U1); back navigation still works from every reader and exam; exam timer, submit and close remain reachable (U3).

## 10. NATIVE CONTENT (DONE per owner, 2026-10-12)

Plan, decisions, verified data facts and steps N0 to N11 with their status: **`docs/NATIVE_CONTENT_PLAN.md`**. Short version: `learning_resources` is read directly from Supabase with the public key; native lists, flashcards, PDF viewer, quiz/exam runner; short notes in a LOCAL packed page using the website's own math renderer; no purchase UI in the app; the agent has Supabase read/write access (see rules in `docs/SUPABASE_NOTES.md`). Parked: N7, N8, N9b, N11.
