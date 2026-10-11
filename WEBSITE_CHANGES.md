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
