# Activation codes (owner request 2026-10-13)

> Repo is PUBLIC: no real codes, keys or student data here.

## What the owner wants
The app will be paid. Google Play does not allow in-app prices or a buy button for digital content unless Google Play billing is used, and the owner cannot use Google billing in Ethiopia. So: the app is FREE to install; the student pays OUTSIDE the app (Telebirr, CBE, bank transfer, in person), receives an activation code, and types it in the app. The same purchase also opens the website, because the code adds a row to `public.enrollments`.

## Rules for the app text (Google Play policy risk, owner was told)
- Allowed in the app: "Package required", a lock, "Have an activation code?", "Enter your code", "Activate".
- NOT allowed in the app or the Play listing: prices, "Buy", "Subscribe", "Upgrade", "Pay", cart, and any mention of Telebirr, CBE, bank or Telegram as a way to pay. Explain how to get a code on the Telegram channel, not in the app.
- The app must look the SAME to the reviewer and to real users. Do not hide the code box during review, do not switch features off after review (cloaking can get the whole developer account banned). In Play Console > App content > App access, give the reviewer a working demo account and a demo code.

## How it works
1. `docs/sql/activation_codes.sql` adds `activation_codes`, `activation_attempts`, `private.generate_activation_codes(...)` (admin, SQL editor only) and `public.redeem_activation_code(p_code)` (students, signed in only).
2. The admin generates codes in the Supabase SQL editor and sends them to students after payment.
3. In the app, a closed course shows the "Package required" pop-up. It now has a code box. The app calls `redeem_activation_code` with the student's own login. The server checks the code (exists, not used by someone else, not expired), marks it used and inserts the package rows into `public.enrollments`.
4. `ContentAccess.kt` reads the student's own rows of `enrollments`, `access_grants` and verified `orders` (row level security already limits them to the student) and opens the course.
5. Safety: a code works for one student only (the same student pressing it again gets "already" = success); after 8 wrong or used codes in one hour the server refuses more; students cannot read the code table or the attempts table; anonymous users cannot call the function.

## Files
- `app/src/main/java/com/wisdomtower/academy/data/content/ActivationClient.kt` (new): redeem call and ownership read.
- `.../data/content/ContentAccess.kt`: paid-mode ownership now reads the database (was: always closed). `IS_FREE_MODE` is STILL `true`.
- `.../ui/study/HubGateDialog.kt`: code box inside the "Package required" pop-up only.
- `docs/sql/activation_codes.sql`: the database part.

## STATUS (2026-10-13)
- App code: written on branch `activation-codes`, NOT compiled, NOT tested on a phone, CI not seen. Mark `[~]`.
- SQL: NOT applied to Supabase. The two attempts by the agent to run its test were cancelled (no reason shown), so nothing was changed and nothing was tested.
- Nothing changes for students until `IS_FREE_MODE` is set to `false` in `ContentAccess.kt` AND on the website (`src/lib/ownership.ts`). Do that only when the owner says so, after the SQL is applied and a code has been tested end to end with a TEST account.

## Still open
- Apply the SQL (owner approval) and test: generate one code, redeem with account A (opens), redeem with account B ("already used"), expired code, 9 wrong codes ("too many").
- The website's own gate still shows its old paid UI when free mode is off. The website has no code box yet; students would use the app. Decide if the website needs one.
- Hubs opened through the website pages (not native) read ownership on the website side, which already counts `enrollments`.
- Catalog wording on the website (prices, buy button) is not part of this change.
