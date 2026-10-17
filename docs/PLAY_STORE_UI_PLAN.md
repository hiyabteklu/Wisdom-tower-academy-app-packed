# PLAY_STORE_UI_PLAN.md — what must be done before publishing (owner order 2026-10-17)

> Owner: "The priority is the app now. We are preparing to publish on the Play Store. Push the plans into the handoff first, then we start one at a time." Owner is on the free plan: follow `docs/AGENT_QUOTA_PROTOCOL.md` (ONE slice per chat, push in ONE commit with a session log). Say "do S<n>" = do that slice; no number = do the next open slice in the table (section 3).
> Based on a code review on 2026-10-17 (no device screenshots were seen). Numbers below are from grep counts on `main` and may drift.
> Repo is public: no secrets, no personal data.

## 1. Already done (2026-10-17, patch waiting for the owner to run)
`scripts/patch_ux_consistency_fixes.py` (log: `docs/SESSION_2026-10-17_UX_CONSISTENCY.md`): ECE cover in Learning = Home cover; shared Sign in pill (`ui/auth/SignInPill.kt`) on signed-out screens; accurate same-password error. **Owner action: Actions > Apply pending patches > script `patch_ux_consistency_fixes.py`, branch `fix/ux-consistency`, wait for green build, test, merge.** Do not start S3/S4 before this is merged (they touch the same files).

## 2. The slices (do in this order)

### Release risks (not UI, do first)
- **S1. Exact-alarm permission.** `AndroidManifest.xml` declares `SCHEDULE_EXACT_ALARM` (and `RECEIVE_BOOT_COMPLETED`); `data/reminders/PlannerReminderScheduler.kt` (about line 88) uses `canScheduleExactAlarms()` / `setExactAndAllowWhileIdle`. Play restricts this permission to alarm and calendar apps and Android 14+ denies it by default, so review can flag it. Plan: switch planner reminders to inexact alarms (`setAndAllowWhileIdle`, or WorkManager if a dependency is already present; NO new dependency without owner OK), remove the permission and the receiver action for `SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED`, keep boot rescheduling. Then fix `PLAY_STORE_CHECKLIST.md` section 3C (permissions list must match the manifest). Test: set a planner reminder 2 minutes ahead, lock the phone, it still fires within a few minutes; reboot, reminders still scheduled. **DONE 2026-10-17, see `docs/SESSION_2026-10-17_S1_EXACT_ALARM.md`.**
- **S2. Account deletion check.** `PLAY_STORE_CHECKLIST.md` section 5 item 1 says it is missing, but `data/auth/AccountDeletionClient.kt` and `ui/settings/AccountDeletionSection.kt` exist. Verify it end to end (delete a test account; sign in again must fail), confirm the public web page/link Play Console asks for exists and is on the privacy page, then update section 5 of the checklist. Needs the owner for the website side (`WEBSITE_CHANGES.md` section 4).
- **S0 (owner only, start NOW, longest wait).** Closed test: 12 testers, 14 continuous days (checklist 3B). Also use Play's automatic pre-launch report (crashes, accessibility). Store pictures and texts (checklist 3E) and release signing secrets (checklist 1) still to be done by the owner.

### UI improvements
- **S3. Accessibility (TalkBack).** About 86 icons have `contentDescription = null` versus about 41 labelled; no clickable declares a role (0 uses of `Role.Button` / `semantics`). Plan: first the shared pieces (`OpenCard`, `SignInPill`, round back buttons `ScreenBackButton`, bottom nav, message cards) get `Role.Button` + a spoken label; decorative icons stay null; then the icon-only buttons in the top bar (bell, trophy, menu). Minimum touch target 48dp. Acceptance: with TalkBack on, every control on Home, Learning, Packages, Account, Settings is announced with a name and "button".
- **S4. Text size.** About 53 places use 8 to 10 sp. Raise anything the student has to read to 12 sp or more (labels can be 11 sp), then check with the phone font size set to Large and Largest: no clipped or overlapping text, long titles ellipsize. Respect `UI_POLISH_TASKS.md` G1 to G9 (no invented text, forbidden files).
- **S5. One Sign in look.** Home (`HomeScreen.kt`), Learning guest banner (`LearningScreen.kt`) and Notifications (`NotificationsScreen.kt`) each have their own sign-in button style. Move them to `SignInPill` (keep their Sign Up buttons). Pure refactor, no text changes.
- **S6. Shared loading / error / empty card.** Screens build their own message cards (`MessageCard` in `HubItemListScreen.kt`, `StPanel` in `NativeStatusScreen.kt`, plain `Text` in `CompetitionsHubScreen.kt`, notifications). Make one shared composable (message, optional Retry, optional Sign in pill) and use it on the hub list, status, competitions, notifications first. Keep the glass look.
- **S7. Light mode decision.** `ui/theme/Theme.kt` follows `isSystemInDarkTheme()` but the screens look built for the dark navy only. Ask the owner: lock to dark on purpose (simplest, recommended) or support light. If locked, make `Theme.kt` always dark and check the system bars and the splash.
- **S8. Tablets and landscape.** No window-size handling. Cap content width (about 600 to 720 dp, centered) on list screens, test a 10-inch tablet and landscape on the phone. Play also rates tablet quality.
- **S9. Language.** Only one `stringResource` use; all text is hardcoded English (fine for the English launch). Decide with the owner: English only now (recommended), Amharic later needs a string extraction slice first. Do not start translating without that decision.
- **S10. Full device pass.** Many file headers still say "NOT compiled / not tested on a device" (the owner rule `docs/OWNER_RULE_WRITTEN_IS_DONE.md` says to treat pushed code as done, so only report what really fails). Walk each tab on a real phone: back gesture, keyboard covering fields (`adjustResize`), offline, rotation, first run signed out, sign in / sign out. Collect owner screenshots for a visual critique of the main screens.

## 3. Status table (update it in the same commit as each slice)
| Slice | What | Status |
|---|---|---|
| patch | ECE cover, Sign in pill, password error | written, waiting for the owner to run the Action and merge |
| S1 | Exact alarm permission | DONE 2026-10-17 (log `docs/SESSION_2026-10-17_S1_EXACT_ALARM.md`) |
| S2 | Account deletion verify | open |
| S0 | Closed test / store assets / signing (owner) | open |
| S3 | Accessibility | open |
| S4 | Text size | open |
| S5 | One Sign in look | open |
| S6 | Shared message card | open |
| S7 | Light mode decision | open (needs owner answer) |
| S8 | Tablets / landscape | open |
| S9 | Language decision | open (needs owner answer) |
| S10 | Device pass + screenshots | open |

## 4. Rules for every slice
Inspect the code first, make focused changes, keep the approved design, no new dependencies or hosts, no secrets. Big files (`MainActivity.kt`, `LearningScreen.kt` and others over about 30 KB) are edited with a patch script (`docs/EDITING_LARGE_FILES.md`). Write the session log `docs/SESSION_*.md` and update the table above in the same commit. Tell the owner in plain words what to test and what is next.
