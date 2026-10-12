# WEBSITE_CHANGES.md

Changes needed in `hiyabteklu/Wisdom-tower-academy` (never edit the website from this repo; apply these there). Written 2026-10-11.

## 1. Remove the fake local login (root cause of the auth mismatch)

**File:** `src/lib/auth-service.ts`

**Problem.** When Supabase login/sign-up fails or is slow, the site silently falls back to a local-only account: `wta_<timestamp>` user id, empty `access_token`, and the password stored in localStorage as plain base64. The app (and any server call) then sees a "logged in" user that Supabase has never heard of, so tokens, RLS and shared sessions can't work.

**Do first (before deploying):**
1. In the Supabase dashboard check Authentication → Providers → Email: is "Confirm email" ON? If yes, new users have no session until they confirm, and today the fallback is what lets them in. The new flow must show "check your email" instead.
2. Find existing local-only users (ids starting with `wta_`). They have no Supabase account and will need to re-register.

**Change `loginScholar`:** delete step 2 ("Check local scholar directory") and the code after it. After the Supabase attempt fails, return:

```ts
return {
  success: false,
  code: "invalid_credentials",
  message: "Incorrect email/phone or password. Please try again.",
};
```

(Capture `error` from `signInWithPassword` and map `Email not confirmed` to a clear message.)

**Change `registerScholar`:** remove the `wta_` id, `saveLocalScholarAccount`, and the unconditional `persistScholarSession`. Use the real result of `supabase.auth.signUp`:

```ts
const { data, error } = await supabase.auth.signUp({
  email: authEmail,
  password,
  options: { data: { full_name: fullName.trim() || "Student Scholar", education_level: educationLevel, phone: phoneNum } },
});
if (error || !data.user) {
  return { success: false, code: error?.message?.includes("registered") ? "user_already_exists" : "generic_error", message: error?.message ?? "Could not create the account." };
}
if (!data.session) {
  // email confirmation is on: do NOT create a local session
  return { success: true, user: data.user, message: "Check your email to confirm your account, then sign in." };
}
persistScholarSession({ id: data.user.id, email: data.user.email ?? authEmail, fullName: fullName.trim() || "Student Scholar", educationLevel, phone: phoneNum }, {
  access_token: data.session.access_token, refresh_token: data.session.refresh_token,
  expires_at: data.session.expires_at, expires_in: data.session.expires_in,
});
applyDefaultPackagesForLevel(educationLevel);
return { success: true, user: data.user };
```

**Change `persistScholarSession`:** if `hasValidRealToken` is false, `return` without writing anything (no 30-day fake session, no empty tokens).

**Reason:** one real Supabase identity per user, so the Android app can sign in with the same account, refresh tokens, and read RLS-protected rows.

## 2. Routes the app expects but the website does not have

The app calls these; both currently 404:
- `GET /api/content/catalog` (the app call was removed on 2026-10-11, add the route only if you want a server-driven catalog)
- `GET /api/account/profile?userId=` (called from `AuthStateManager.fetchFullProfile`; if added, it must verify the `Authorization: Bearer <supabase access token>` header server-side and ignore the `userId` query param)

## 3. Secure `GET /api/notifications`

The app currently sends `?userId=...&email=...` with no token. Anyone who guesses an id or email could read that user's notifications. The route should read the user from the Bearer token (`supabase.auth.getUser(token)`) and ignore the query params.

## 4. Account deletion (Google Play REQUIRES this, it blocks the Play Store release)

Added 2026-10-11. Google Play rule: an app that lets people create an account must (a) let them delete the account from inside the app and (b) have a public web page for deletion requests, whose link is entered in Play Console. A code search of both repos (app and website) on 2026-10-11 found NO account deletion anywhere.

**Needed on the website:**
1. Route `POST /api/account/delete`. Read the user from the `Authorization: Bearer <supabase access token>` header with `supabase.auth.getUser(token)` (ignore any user id in the body). Require a body like `{ "confirm": "DELETE" }`. Then, with the service-role key (Vercel env only, never in the app): delete the user's rows in every table keyed by the user id (at least `profiles`, `learning_progress`, `academic_results`, device/notification tokens; list the real tables in the Supabase dashboard first), delete the user's files in Appwrite (for example an uploaded avatar), then call `supabase.auth.admin.deleteUser(userId)`. Return `{ success: true }`.
2. Public page `/delete-account` (no login needed to read it): says what is deleted, what is kept (if anything) and for how long; a button for signed-in users that calls the route; and a contact way (e-mail or the `/contact` form) for people who cannot sign in. This page's address is what goes into Play Console.
3. Update `/privacy` so it lists the data really collected (see `PLAY_STORE_CHECKLIST.md` section 3C) and mentions deletion.

**Owner decision needed first:** is any record kept after deletion (for legal or money reasons)? If nothing is kept, say so on the page.

**App side (after the route exists):** a "Delete my account" button in Settings > Security that asks for confirmation, calls the route with the current token, then signs out and clears local data. Not written yet, because it must not call a route that does not exist.

## 5. Privacy page (`src/app/privacy/page.tsx`): the third-party list does not match what the code does

Added 2026-10-12 (found while comparing the app's Privacy text with the website page; the app copies the website text word for word, so the app's Privacy screen has the same gaps). This is the concrete list behind item 3 of section 4 and `PLAY_STORE_CHECKLIST.md` section 5 point 3.

**Verified in the website source (`website-reference/`):**
- Section 05 "Third-Party Sub-processors" names **Google Gemini AI** as the only AI processor for "Explain with AI". But `src/app/api/explain/route.ts`, `src/app/api/ai/explain/route.ts` and `src/app/api/ai/tutor/route.ts` also send the question text to **Groq** (`api.groq.com`), and the tutor route tries Gemini first and then Groq. Groq is not named anywhere on the page.
- The same section lists "Supabase ... encrypted receipt asset storage" and "Google Cloud Platform & Vercel", but the project also uses **Appwrite** for file storage (PDFs and other files) and **Firebase Cloud Messaging** for push notifications (see `HANDOFF.md` section 3 and `PLAY_STORE_CHECKLIST.md` section 3C). Neither is named.

**Hypothesis (check before editing):** Section 02 D ("Device, Cache & Network Telemetry") only talks about browser data. If the Android app stores a push-notification token (Firebase) against the account, add "device push-notification token" there. Whether the token is saved in a database table was not checked here.

**Owner decisions needed:**
1. Add Groq, Appwrite and Firebase (and what each one receives) to section 05, and a line about the Android app's push token to section 02 D.
2. The page (and the Terms, section 05 and 06) describe paid packages, payment methods, receipts and refunds. The app is free for now and has no purchase buttons (owner decision 2026-10-11), but the website still sells (or will sell) packages, so this wording is probably right for the website. Say whether the app screens should keep showing it unchanged (current behaviour: yes, a word-for-word copy) or whether Google Play review is likely to want a shorter app-specific policy. Hypothesis: one policy URL for both is fine as long as it lists everything the app collects.
3. After the website page is changed, copy the new text into `ui/drawer/LegalContent.kt` (the file says: change the website first, then copy).

**Not a problem:** the app's Privacy and Terms screens were compared section by section with the two website pages on 2026-10-12 and match them (version 3.2, 28 September 2026).
