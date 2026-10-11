# HANDOFF.md — READ THIS FIRST

> Shared memory for every AI agent (Claude, AI Studio, Codex, anyone) on this project.
> The owner is NOT a coder and is on a free plan with a small quota. Agents get cut off without warning. Live status lives in **`STATUS.md`** (owner decisions, checklist, session log). This file holds the stable plan, rules and specs.
> **This repository is PUBLIC. Never write passwords, API secrets, keystores, student emails/names, or the owner's personal data anywhere in the repo.**

---

## 0. MANDATORY AGENT PROTOCOL (follow exactly)

**At the start of every session**
1. Read this file, then `STATUS.md`, `NATIVE_APP_BRIEF.md`, `ARCHITECTURE.md`, `docs/BUILD_PITFALLS.md`, `WEBSITE_CHANGES.md`, `docs/PENDING_PATCHES.md`, `docs/EDITING_LARGE_FILES.md`. (Read `docs/BUILD_PITFALLS.md` BEFORE writing any code.)
2. Do NOT ask the owner to re-explain anything written here or in `STATUS.md`. Ask only what is listed in section 8 or is genuinely new.
3. Take the first unchecked item in `STATUS.md` section B unless the owner says otherwise. Work on ONE task at a time.

**While working**
4. If the task is big, first add a line `IN PROGRESS: <task>` to the `STATUS.md` session log, so a cut-off is visible to the next agent.
5. One small commit per task; commit message says what and why. Update the `STATUS.md` checklist in the same commit as the code.
6. When the owner states a decision, preference or complaint, copy it into `STATUS.md` section A in their words with the date. Never drop earlier ones.
7. You usually cannot build or run the app. Mark code `[~]` (written, not compiled/tested) until CI is green AND the owner has tested it. Never claim more.

**Big files (rule 10, owner rule 2026-10-11)**
10. NEVER tell the owner "this file is too big for my tools". The chat tools can only replace whole files, so for a huge file (`MainActivity.kt` about 245 KB, `STATUS.md` about 38 KB) you write a small **patch script** in `scripts/` (exact anchors, safe to run twice, tested on a copy), log it in `docs/PENDING_PATCHES.md`, and tell the owner to run GitHub > Actions > Apply pending patches. Full steps, script template and the list of existing scripts: **`docs/EDITING_LARGE_FILES.md`**. Small and medium files are simply resent whole.

**Before you stop, or when quota is nearly gone**
8. Write the final session-log entry in `STATUS.md`: what you did (commit ids), what is left, what the owner should test, what you were unsure about. **Log first, everything else after.**
9. Append only. Fix mistakes by adding a correction line.

**Owner communication rules**
- Plain, non-technical language. Short. Lead with the answer.
- Verified fact vs guess: label guesses "hypothesis".
- Quota is small: use targeted code search instead of reading huge files (`MainActivity.kt` is very large); do not re-read what these docs already say.

---

## 1. Goal

A real **native Android app** (Kotlin + Jetpack Compose) for Wisdom Tower Academy using the **same accounts, database, storage and content as the live website**, so the owner adds/edits content once and both website and app update. UI, thumbnails and permanent screen designs are packed in the app for speed. Reason: the first WebView-only app had many malfunctions, depended on connection, and risked Google Play rejection.

## 3. Repositories & stack (verified)

| Repo | Role |
|---|---|
| `hiyabteklu/Wisdom-tower-academy` | Website: Next.js 15 + React 19 + Tailwind on Vercel. Source of truth. |
| `hiyabteklu/Wisdom-tower-academy-app-packed` | THIS Android app (Kotlin, Compose). Branch `main`. Has `website-reference/` (read-only snapshot of the website, refreshed by Action "Sync website reference"). |
| `hiyabteklu/Wisdom-tower-academy-app` | Old WebView-only app. Legacy, ignore. |

- Backend: **Supabase** (login + database; free plan, project "Wisdom tower academy", eu-central-1), **Appwrite** (file storage), **Firebase** (push), Gemini (AI tutor), Groq (Explain with AI). Secret keys live only in Vercel env vars.
- Public keys allowed in the app (`.env.example`): the 6 `NEXT_PUBLIC_*` values. The `secrets-gradle-plugin` turns EVERY key in `.env.example` into a `BuildConfig` field with the same name (e.g. `BuildConfig.NEXT_PUBLIC_SUPABASE_URL`). Never add a secret or an empty value there.
- One website host everywhere: `https://www.wisdom-tower-academy.live` (localStorage is per-origin).
- App package `com.wisdomtower.academy`. Key files: `MainActivity.kt` (WebView shell, huge), `data/auth/AuthStateManager.kt`, `data/auth/SupabaseAuthClient.kt` (new), `data/repository/AcademyRepository.kt`, `ui/*` screens, `StructuralNav.kt`.
- Website auth: `src/lib/supabase.ts` (storage key `wt-academy-auth-v1`), `src/lib/auth-service.ts`, `src/app/login/page.tsx`, `src/lib/authIdentity.ts` (phone users are stored as `p<digits>@phone.wisdomtower.app`; Ethiopian numbers normalised to 251…).

## 4. VERIFIED FINDINGS (2026-10-11, code + owner screenshots)

1. **The app had no sign-in of its own.** `AuthStateManager` only copies `wt-academy-auth-v1` from the WebView's localStorage through a JS bridge (`syncAuthSession`, defined in `MainActivity.kt` for both WebViews). The "Scholar Sign In" pop-up is the website's `/login` page shown inside the app (`openToolOverlay`).
2. **Sign-in fails in the app.** Owner: wrong password shows "No account found with this email or phone"; correct credentials just clear the form. A screenshot shows "No account found" for an email that DOES exist in Supabase Auth, so Supabase's password login fails from inside the app; cause not found.
3. **Website bug (hits website users too):** `auth-service.ts` falls back to a local-only fake login (id `wta_<timestamp>`, empty token, base64 password in localStorage) when Supabase fails, and turns every Supabase failure into "No account found". Fix in `WEBSITE_CHANGES.md` section 1 (NOT applied).
4. After a successful website login the page runs `window.location.href = "/account"` (full reload): in the app this looks like the form refreshing and the session is not reliably handed to native.
5. The Learning Hub cards show "Unlock" because the app does not see a signed-in user.
6. Native token handling gaps (before S2): no refresh, tokens in plain SharedPreferences, injection into WebView only when its storage is empty and without `expires_at`/`token_type`.
7. Routes the app called that do NOT exist on the website: `/api/content/catalog` (call removed), `/api/account/profile` (still called by `AuthStateManager.fetchFullProfile`, harmless 404). Existing routes: `api/content/pdf`, `api/content/resources`, `api/notifications` (+`register-device`, `send`), `api/ai`, `api/explain`, `api/fcm-token`, `api/storage`, `api/auth`.
8. `/api/notifications` is called with `?userId=&email=` and no token (insecure): fix in `WEBSITE_CHANGES.md` section 3.
9. `AcademyRepository.CATALOG_PACKAGES` is a hardcoded seed; `getEnrolledPackages()` returns the same 6 packages for every logged-in user (labelled placeholder). The website also keeps enrollments locally, so no server source exists yet.
10. Supabase (owner screenshots): free plan, 17 monthly active users, 34/500 MB. The Email provider panel shows NO "Confirm email" switch, so that setting is unconfirmed; phone-style accounts exist (cannot receive email), so confirmation is probably effectively off.
11. `WebCacheVault` treats `supabase.co` URLs as dynamic (not cached): probably not what breaks login. Unproven.

## 6. NEXT STEP IN DETAIL

### 6a. S1 diagnostics (optional, cheap)
1. Ask the owner to sign in with the same account on the website in the phone's normal browser (app problem vs password problem).
2. In `MainActivity.kt` find the overlay WebView created by `openToolOverlay` and its `WebViewClient`: anything that intercepts or reloads `/login`, `/account`, or POSTs to `*.supabase.co/auth/v1/token`, and the auto-dismiss logic after auth. Targeted search only.
3. If not found fast, skip: S2 bypasses this path.

### 6b. S2 native sign-in spec
- **Network**: done in `SupabaseAuthClient.kt` (password grant, sign-up mirroring the website, refresh). Use its `SupabaseAuthResult.Success.sessionJson` directly as the WebView localStorage value for `wt-academy-auth-v1`; it already has the right shape (`access_token, token_type, expires_in, expires_at, refresh_token, user{...}`). Feed the same JSON to `AuthStateManager.syncAuthSession(...)`.
- **Store tokens** encrypted (EncryptedSharedPreferences / Keystore). Refresh before `expires_at` and on 401; always save the NEW refresh token (Supabase rotates them). On refresh failure, sign the user out cleanly.
- **Inject into WebView**: overwrite stale values (the old code only set when empty), then dispatch `wta-auth-change`.
- **Errors** are already plain-language in the client (wrong password, not confirmed, already exists, network). Never invent a local account.
- **Design: copy the website login page** (`website-reference/src/app/login/page.tsx`; owner likes it). Dark navy page; logo + title "Wisdom Tower Academy"; card with cyan top bar, gradient `#131f38 → #0e172a → #0a101d`, white/20 borders, very rounded; two tabs "Sign In" / "Create Account"; fields EMAIL OR PHONE NUMBER (mail/phone icon), PASSWORD (lock icon, show/hide eye, "Forgot password?" link to `/forgot-password`, shown on Sign In only); small notice box with optional action link; big cyan (`#22e0ff`-like cyan-400) button "Sign In →" / "Create Account →" with "Signing In..." / "Creating Account..." while loading; footer "Don't have an account? Create a free account" (and "Already have an account? Sign in"). Create Account adds FULL LEGAL NAME (placeholder "e.g. Abebe Bikila"), ACADEMIC LEVEL dropdown (default Freshman, options from `ACADEMIC_LEVEL_OPTIONS` in `src/lib/academic-levels.ts`, "Other" shows a free-text field), CONFIRM PASSWORD, and a Terms/Privacy checkbox (checked by default on the website). Use the exact texts of that page. Reuse `ui/theme/WisdomComponents.kt`, `Color.kt`, `Type.kt` where they already match. Only use Material icons that exist (see BUILD_PITFALLS).
- After success: close the screen, update `AuthStateManager`, refresh Learning/Account, no page reload. Keep the old web pop-up as fallback until the native one is tested on a phone.

## 7. FAKE-CONTENT AUDIT LIST (S4): suspected, VERIFY against `website-reference/` before removing

Owner complaint: app shows invented captions/descriptions. Compare each with the website source; keep what the website has, remove or replace the rest, ask the owner if unavailable.
- `ui/account/AccountScreen.kt`: digital Student ID card built by `StudentIdGenerator` (locally generated number?), caption "All books, question banks, flashcards, exams & life savers unlocked", default name "Student Scholar".
- `data/repository/AcademyRepository.kt`: "Free Academic Mode" labels (placeholder).
- `ui/guides/GuidesData.kt`: hand-written guide texts (must equal the website data files).
- `ui/packages/PackagesData.kt` (`CATALOG_PACKAGES`), package descriptions, subject grids.
- `ui/settings/SettingsScreen.kt`, `ui/learning/LearningScreen.kt`, `ui/home/HomeScreen.kt` wording vs `website-reference/src/components/home/LandingPage.tsx`.
- `docs/FIDELITY_AUDIT.md` was written by a previous agent and may overstate fidelity: re-check, do not trust.

## 8. OPEN QUESTIONS FOR THE OWNER (ask only these)

1. Supabase "Confirm email": on or off? (Not visible in the panel the owner showed.) Needed before applying the website login fix.
2. Approve applying `WEBSITE_CHANGES.md` section 1 to the live website? (Redeploys on Vercel; existing local-only fake accounts would stop working.)
3. Where should real enrollments/packages come from (new Supabase table, or keep "all free")?
4. 4 or 5 bottom tabs?

## 9. PHONE TEST CHECKLIST (S10)

Sign in (email), sign in (phone), wrong password message, sign out, stay signed in after closing the app, cards show "Open", each of the 6 cards opens its hub signed in, PDF opens and downloads offline, notifications list, Account shows the real name, airplane-mode behaviour, tab switching has no blinking.
