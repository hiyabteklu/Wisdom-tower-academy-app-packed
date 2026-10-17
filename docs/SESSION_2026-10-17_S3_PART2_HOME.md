# SESSION 2026-10-17 — S3 part 2, step 1: Home screen (TalkBack)

- 2026-10-17 | Claude (chat, owner on free plan) | Owner order: continue S3 part 2 from whatever is not done. Checked first: part 1 is DONE (small files on `main`, `scripts/patch_s3_accessibility.py` merged as PR #42 at 07:22 local time).
  **DONE (written, NOT compiled here, CI not seen), commit `84f8aca`:** `ui/home/HomeScreen.kt` resent whole, three edits only:
  1. `ResourceTile` (the 6 "Other resources" tiles): `clickable(..., role = Role.Button)`. Its icons are already decorative (`contentDescription = null`), so TalkBack reads "<title>, button".
  2. "Create a free account" text link: was a bare `clickable` on 12 sp text (tiny target, no role). Now `minimumInteractiveComponentSize().clickable(role = Role.Button)` (48 dp target, same look; the row may be a few dp taller).
  3. Two imports added: `androidx.compose.material3.minimumInteractiveComponentSize`, `androidx.compose.ui.semantics.Role` (same ones `SignInPill.kt` already uses).
  Not changed on purpose: the two icons inside `WisdomSecondaryButton` ("My Learning", "Sign in") are decorative next to a text label; the buttons themselves already have `Role.Button` (part 1). The Home hero text will move to `SignInPill` in slice S5.
- LEFT (S3 part 2, in this order): Learning, Packages, Account, Settings (Settings is 68 KB and Learning/Packages are big: use a patch script, `docs/EDITING_LARGE_FILES.md`). Rule of thumb: plain `.clickable` gets `role = Role.Button`; icon-only buttons get a spoken label; icons beside a text label stay `null`; touch target at least 48 dp. Then the top-bar icon-only buttons are already fine (part 1 note).
- UNSURE: `clickable(interactionSource = ..., indication = null, role = ..., onClick = ...)` uses named arguments, which is valid for the foundation overload. If CI is red, the `e: file:///` line names the spot.
- TEST (TalkBack on): Home signed out: "Create a free account, button" and it is easy to hit; each Other-resources tile reads its title once plus "button"; without TalkBack the screen looks the same.
- NEXT: S3 part 2 step 2 = Learning screen, or say another slice.
