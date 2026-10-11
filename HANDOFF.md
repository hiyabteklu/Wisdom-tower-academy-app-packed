# HANDOFF.md — READ THIS FIRST, UPDATE IT LAST

> This is the single shared memory for every AI agent (Claude, AI Studio, Codex, anyone) that works on this project.
> The owner is NOT a coder and is on a free plan with a small quota. Agents get cut off without warning. This file is how the next agent continues with zero re-explaining.
> **This repository is PUBLIC. Never write passwords, API secrets, keystores, student emails/names, or the owner's personal data in this file or anywhere in the repo.**

---

## 0. MANDATORY AGENT PROTOCOL (follow exactly)

**At the start of every session**
1. Read this whole file, then `NATIVE_APP_BRIEF.md`, `ARCHITECTURE.md`, `docs/BUILD_PITFALLS.md`, and `WEBSITE_CHANGES.md`.
2. Do NOT ask the owner to re-explain anything that is written here. Ask only what is listed in section 8 (Open questions) or genuinely new.
3. Pick the first unchecked item in section 5 (Status) unless the owner says otherwise.
4. **Before starting real work**, add a line to the Session Log (section 10): `IN PROGRESS: <what you are about to do>`. If you are cut off, the next agent sees it.

**While working**
5. One small commit per task, message says what and why. After a commit that changes app code, tell the owner in plain language what to test on the phone.
6. Update section 5 checkboxes in the **same commit** as the code change.
7. When the owner states a decision, preference or complaint, copy it into section 2 (Owner decisions) in their words, with the date. Never drop or rewrite earlier owner decisions.

**Before you finish or when quota is nearly gone**
8. Replace your `IN PROGRESS` line with a final entry: what you did (commit ids), what is still left, what to test, what you were unsure about. **Write the log first, then anything else.**
9. Never delete history. Append only. Fix mistakes by adding a correction line.

**Owner communication rules**
- Plain, non-technical language. Short. Lead with the answer. No jargon dumps.
- Never claim something works unless it was built and tested. You usually cannot run the app: say "written, not tested" when that is the case.
- Be honest about what is verified vs guessed. Label guesses "hypothesis".
- Quota is small: use targeted code search instead of reading huge files (`MainActivity.kt` is very large); never re-read what this file already says.

---

## 1. Goal (one paragraph)

A real **native Android app** (Kotlin + Jetpack Compose) for Wisdom Tower Academy that uses the **same accounts, database, storage and content as the live website**, so the owner adds/edits content once and both website and app update (no separate maintenance). UI, thumbnails and the permanent screen designs are packed in the app for speed. Reason it exists: the first WebView-only app had many malfunctions, depended on connection, and risked rejection in the Google Play review.

## 2. OWNER DECISIONS & RULES (append only, newest last)

- 2026-10-11 — The website is fully working with real users and is the source of truth. The app must use the same Supabase (login + data), Appwrite (storage), Vercel env/API and GitHub as the website.
- 2026-10-11 — "I wanted native app where I add content and modify content in the same place so web & app don't need separate maintenance."
- 2026-10-11 — Every design down to the 6 Learning Hub cards is **permanent**: Books, Short Notes, Flashcards, Question Banks, Exams, Life Savers. All thumbnails/UI are packed in the app on purpose (speed).
- 2026-10-11 — The website's login page design looks good: **mimic the website UI for all design work**; use the website design (login first, then cards/subjects/packages) in the native screens.
- 2026-10-11 — **No fabricated captions, descriptions, numbers or labels.** "The app is trying fake fabricated captions, descriptions etc. I don't want that." Every piece of text/data must come from the website source (`website-reference/` or live data). If it is not available, ask the owner; do not invent.
- 2026-10-11 — Real learning content (inside the 6 cards) needs a signed-in user, on the website too. The app must support real sign-in.
- 2026-10-11 — Keep this document reliable: every agent must read it first and write what it did, what is left, and what the owner said.
- Standing rules from the brief: never edit the website repo from this repo unless the owner explicitly approves (write changes in `WEBSITE_CHANGES.md`); never put secrets in the app; keep the CI build green; keep the WebView shell as fallback.

## 3. Repositories & stack (verified)

| Repo | Role |
|---|---|
| `hiyabteklu/Wisdom-tower-academy` | Website: Next.js 15 + React 19 + Tailwind on Vercel. Source of truth. |
| `hiyabteklu/Wisdom-tower-academy-app-packed` | THIS Android app (Kotlin, Compose). Branch `main`. Contains `website-reference/` (read-only snapshot of the website, refreshed by Action "Sync website reference"). |
| `hiyabteklu/Wisdom-tower-academy-app` | Old WebView-only app. Legacy, ignore. |

- Backend: **Supabase** (login + database; free plan, project "Wisdom tower academy", region eu-central-1), **Appwrite** (file storage), **Firebase** (push), Gemini (AI tutor), Groq (Explain with AI). Secret keys live only in Vercel env vars.
- Public keys allowed in the app (`.env.example`): the 6 `NEXT_PUBLIC_*` values (Supabase URL + anon key, site URL, Appwrite endpoint/project/bucket).
- Single website host to use everywhere: `https://www.wisdom-tower-academy.live` (localStorage is per-origin; mixing hosts loses the login).
- App package: `com.wisdomtower.academy`. Key Kotlin files: `MainActivity.kt` (WebView shell, huge), `data/auth/AuthStateManager.kt`, `data/repository/AcademyRepository.kt`, `ui/*` screens (home, learning, packages, account, settings, guides, study), `StructuralNav.kt`.
- Website auth: `src/lib/supabase.ts` (storage key `wt-academy-auth-v1`, flow implicit), `src/lib/auth-service.ts`, `src/app/login/page.tsx`, phone→email mapping in `src/lib/authIdentity.ts` (`authEmailFromIdentifier`; phone users are stored as `p<digits>@phone...` style emails).

## 4. VERIFIED FINDINGS (2026-10-11, from code + owner screenshots)

1. **The app has no sign-in of its own.** `AuthStateManager` only copies `wt-academy-auth-v1` from the WebView's localStorage through a JS bridge (`syncAuthSession`). The app's "Scholar Sign In" pop-up is simply the website's `/login` page shown inside the app.
2. **Sign-in fails in the app.** Owner report: wrong password shows "No account found with this email or phone"; correct credentials just clear the form (page refresh) and do not sign in. A screenshot shows this "No account found" message for an email that DOES exist in Supabase Auth. So Supabase's password login is failing from inside the app (cause NOT yet found, see section 6 diagnostics).
3. **Website bug (also hits website users):** `auth-service.ts` falls back to a local-only fake login (id `wta_<timestamp>`, empty token, base64 password in localStorage) when Supabase fails, and turns every Supabase failure into "No account found". Fix is written in `WEBSITE_CHANGES.md` section 1 (NOT applied; needs owner approval + Supabase check).
4. After a successful website login the page does `window.location.href = "/account"` (full reload). In the app this looks like the form refreshing and the session is not reliably handed to native.
5. The Learning Hub cards show "Unlock" because the app does not see a signed-in user. Content inside the cards needs sign-in.
6. Native token handling gaps: no refresh, tokens kept in plain SharedPreferences, injection into WebView only if its storage is empty and without `expires_at`/`token_type`.
7. Routes the app called that **do not exist** on the website: `/api/content/catalog` (call removed), `/api/account/profile` (still called by `AuthStateManager.fetchFullProfile`, harmless 404). Existing routes: `api/content/pdf`, `api/content/resources`, `api/notifications` (+`register-device`, `send`), `api/ai`, `api/explain`, `api/fcm-token`, `api/storage`, `api/auth`.
8. `/api/notifications` is called with `?userId=&email=` and no token (insecure). Fix in `WEBSITE_CHANGES.md` section 3.
9. `AcademyRepository.CATALOG_PACKAGES` is a hardcoded seed; `getEnrolledPackages()` returns the same 6 packages for every logged-in user (placeholder, labelled in code). The website itself also stores enrollments locally (`applyDefaultPackagesForLevel`), so there is no server source yet.
10. Supabase facts from owner screenshots: free plan, 17 monthly active users, 34/500 MB database. The Email provider panel shows NO "Confirm email" switch, so that setting is unconfirmed. Phone-style accounts exist (cannot receive email), so confirmation is probably effectively off. There are real accounts plus a few owner test accounts.
11. `WebCacheVault` treats `supabase.co` URLs as dynamic (not cached), so the vault is probably not what breaks login. Unproven either way.

## 5. STATUS CHECKLIST (update in the same commit as the work)

### Done
- [x] Old WebView app built (legacy repo).
- [x] Native Compose screens exist: Home, Packages, Package detail, Learning (6 hub cards), Account, Settings, Guides, Study workspace (built by AI Studio; NOT verified against the real backend).
- [x] Thumbnails/images packed in app assets.
- [x] Books/PDF/flashcards/notes/exams/question banks/AI tutor open via website handoff in WebView.
- [x] 2026-10-11: `.env.example` SITE_URL fixed to `https://www.wisdom-tower-academy.live`; `ARCHITECTURE.md` reconciled with the brief (commit `93271843`).
- [x] 2026-10-11: removed dead `/api/content/catalog` call; labelled enrollments as placeholder (commit `6fc04a5c`).
- [x] 2026-10-11: wrote `WEBSITE_CHANGES.md` (fake-login removal, missing routes, notification security) (commit `80a9cdf3`).
- [x] 2026-10-11: this `HANDOFF.md` + pointers (`CLAUDE.md`, `AGENTS.md`, README).

### Left (do in this order)
- [ ] **S1. Diagnose why sign-in fails inside the app** (section 6a). Owner can first test the same account in the phone's normal Chrome on the website to tell "app problem" from "password problem".
- [ ] **S2. Native sign-in screen** mimicking the website login design (section 6b): email-or-phone + password, Sign In / Create Account tabs, direct Supabase call, encrypted storage, auto refresh, session handed to WebView with full fields.
- [ ] **S3. Learning Hub cards: "Unlock" → "Open"** when signed in; tapping a card opens the website hub with the session.
- [ ] **S4. Fake-content audit** (section 7): remove/replace anything not sourced from the website.
- [ ] **S5. Website fix** `WEBSITE_CHANGES.md` section 1 (only after owner approves and Supabase "Confirm email" is checked), then sections 2 and 3.
- [ ] **S6. Real packages/enrollments source** (decide with owner; website currently stores them locally).
- [ ] **S7. Real data for catalog/thumbnails/resources** read from the same Supabase/Appwrite via safe routes; no duplicated content.
- [ ] **S8. Replace the dead `fetchFullProfile` route call** (add the secure website route or read Supabase directly with the user's token).
- [ ] **S9. Resolve tab count** (brief says 4 tabs, changelog says 5 incl. Settings; screenshot shows 5: Home, Learning, Packages, Account, Settings). Ask owner, then fix the wrong doc.
- [ ] **S10. Phone test round** with the owner, screen by screen (checklist in section 9).
- [ ] **S11. Play Store readiness** (`PLAY_STORE_CHECKLIST.md`): signed AAB via GitHub secrets, privacy policy, data-safety form, make sure the app is clearly more than a website wrapper (native sign-in, navigation, offline vault, notifications).

## 6. NEXT STEP IN DETAIL

### 6a. S1 diagnostics (cheap, in order)
1. Ask the owner to sign in with the same account on the website in the phone's normal browser. If it works there, the app environment breaks it; if not, it's a password/account issue.
2. In `MainActivity.kt` find where the sign-in overlay WebView is created and its `WebViewClient`: look for anything that intercepts or reloads `/login`, `/account`, or POSTs to `*.supabase.co/auth/v1/token`, and for the overlay auto-dismiss logic after auth. Use targeted code search; do not read the whole file.
3. Check overlay settings: `domStorageEnabled`, third-party cookies, mixed content, user-agent, any injected JS that rewrites `fetch`.
4. If the cause is not found fast, skip to S2: a native sign-in avoids the whole fragile pop-up path.

### 6b. S2 native sign-in spec
- **Call Supabase directly** (public values from `.env.example` / BuildConfig): `POST {SUPABASE_URL}/auth/v1/token?grant_type=password`, headers `apikey: {ANON_KEY}` and `Content-Type: application/json`, body `{"email": <mapped email>, "password": <password>}`. Sign-up: `POST {SUPABASE_URL}/auth/v1/signup` with `data` = `{full_name, education_level, phone}` (same metadata the website sends). Refresh: `POST /auth/v1/token?grant_type=refresh_token` with `{refresh_token}`. Supabase rotates refresh tokens, so always save the newest one.
- **Identifier mapping**: replicate `authEmailFromIdentifier` from `src/lib/authIdentity.ts` exactly so phone users map to the same email as on the website.
- **Store tokens** encrypted (EncryptedSharedPreferences / Keystore), not plain prefs. Refresh before expiry and on 401.
- **Hand the session to the WebView** as `localStorage['wt-academy-auth-v1']` with the full Supabase shape: `access_token, token_type: "bearer", expires_in, expires_at, refresh_token, user{id, aud, role, email, phone, user_metadata, app_metadata, created_at}`; overwrite stale values (current code only sets when empty). Dispatch the `wta-auth-change` event.
- **Errors in plain words**, mapped from Supabase: wrong password → "Incorrect password"; unknown user → "No account found"; unconfirmed email → "Please confirm your email"; network → "Check your connection". Never invent a local account.
- **Design: copy the website login page** (`website-reference/src/app/login/page.tsx`; owner likes it). What it looks like: dark navy page; logo + title "Wisdom Tower Academy"; card with cyan top bar, gradient `#131f38 → #0e172a → #0a101d`, white/20 borders, rounded 3xl; two tabs "Sign In" / "Create Account"; labelled fields EMAIL OR PHONE NUMBER (mail/phone icon), PASSWORD (lock icon, show/hide eye, "Forgot password?" link to `/forgot-password`); small notice box with optional action link; big cyan (`cyan-400`) button "Sign In →" / "Create Account →" with spinner text "Signing In..." / "Creating Account..."; footer "Don't have an account? Create a free account". Create Account adds FULL LEGAL NAME, ACADEMIC LEVEL dropdown (default Freshman; options from `ACADEMIC_LEVEL_OPTIONS` in `src/lib/academic-levels.ts`, with "Other" free-text), CONFIRM PASSWORD, and the Terms/Privacy checkbox. Use the exact texts from that page. Reuse the app's existing theme/components (`ui/theme/WisdomComponents.kt`) where they already match.
- After success: close the sign-in screen, update `AuthStateManager`, refresh Learning/Account, no full-page reload.
- Safe to keep the WebView `/login` as a fallback until native sign-in is tested.

## 7. FAKE-CONTENT AUDIT LIST (S4) — suspected, VERIFY against `website-reference/` before removing

Owner complaint: app shows invented captions/descriptions. Check each against the website source. If the website has the same text, keep; if not, remove or replace; if unavailable, ask the owner.
- `ui/account/AccountScreen.kt`: digital Student ID card built by `StudentIdGenerator` (locally generated number?), caption "All books, question banks, flashcards, exams & life savers unlocked", default name "Student Scholar".
- `data/repository/AcademyRepository.kt`: "Free Academic Mode" labels (placeholder).
- `ui/guides/GuidesData.kt`: hand-written guide texts (Study Techniques, Success Stories, Campus Life, Universities, Departments, Scholarships): must equal the website data files.
- `ui/packages/PackagesData.kt` (`CATALOG_PACKAGES`), package descriptions, subject grids.
- `ui/settings/SettingsScreen.kt` descriptions; `ui/learning/LearningScreen.kt` captions and hub texts; `ui/home/HomeScreen.kt` wording vs `website-reference/src/components/home/LandingPage.tsx`.
- Doc `docs/FIDELITY_AUDIT.md` was written by a previous agent and may overstate fidelity; re-check, do not trust.

## 8. OPEN QUESTIONS FOR THE OWNER (ask only these)

1. Supabase "Confirm email": on or off? (Not visible in the dashboard panel the owner showed.) Needed before applying the website login fix.
2. Approve applying `WEBSITE_CHANGES.md` section 1 to the live website? (It redeploys on Vercel; existing local-only fake accounts would stop working.)
3. Where should real enrollments/packages come from (new Supabase table, or keep "all free")?
4. 4 or 5 bottom tabs?

## 9. PHONE TEST CHECKLIST (for S10)

Sign in (email), sign in (phone), wrong password message, sign out, stay signed in after closing the app, cards show "Open", each of the 6 cards opens its hub signed-in, PDF opens and downloads offline, notifications list, Account shows real name, airplane-mode behaviour, tab switching has no blinking.

## 10. SESSION LOG (append only, newest last)

Format: `YYYY-MM-DD | agent/tool | DONE: ... (commits) | LEFT: ... | TEST: ... | NOTES/UNSURE: ...`

- 2026-10-09 | Claude (planning) + AI Studio Agent | DONE: brief written; Phases A0–D native screens, auth bridge, handoffs (see NATIVE_APP_BRIEF.md section 8 log) | NOTES: these were not verified against the real backend.
- 2026-10-11 | Claude (chat, owner on free plan) | DONE: full review of both repos; fixed `.env.example` host + `ARCHITECTURE.md` (`93271843`); removed dead catalog call (`6fc04a5c`); wrote `WEBSITE_CHANGES.md` (`80a9cdf3`); learned owner decisions (section 2); verified findings (section 4); wrote this file | LEFT: S1 onwards in section 5 | TEST: nothing new to test yet (no behaviour change except one removed 404 call) | NOTES/UNSURE: cause of in-app sign-in failure still unknown; code was not built or run.
