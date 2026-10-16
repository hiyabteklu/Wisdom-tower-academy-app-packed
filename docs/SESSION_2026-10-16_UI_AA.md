# SESSION 2026-10-16 UI_AA: M11 slice 2 (rules page motion + motion plan status table)

> Repo is PUBLIC: no secrets, no student data. Continues `docs/SESSION_2026-10-16_UI_Z.md` and `docs/UI_MOTION_PLAN.md`. Owner said: read the handoff and status and continue. One small slice (`docs/AGENT_QUOTA_PROTOCOL.md`).

## What I read (evidence)
`HANDOFF.md`, `docs/ADMIN_MOBILE_PLAN.md`, `docs/COMPETITION_STATUS.md`, `docs/SESSION_2026-10-16_C9_owner_orders.md`, `docs/SESSION_2026-10-15_ADMIN_O.md`, `docs/SESSION_2026-10-16_UI_Z.md`, `docs/UI_MOTION_PLAN.md`, `ui/theme/WisdomReveal.kt`, `ui/competition/CompetitionRulesScreen.kt`, and the commit list of `main` for 2026-10-16.

## Where the project stands (read from the files, not re-verified on a device)
- Competition: C1 DONE-VERIFIED; C2 to C8 written (website admin panels and app screens); owner orders of 2026-10-16 executed (old leaderboard locked from signed-out users, test contests deleted). Still open: real-send push test (owner sends it from the website admin to his own user), C9 and C10 leftovers.
- Admin mobile redesign: slices A0 to A16 pushed (last log `SESSION_2026-10-15_ADMIN_O.md`); only the owner's phone pass A17 is open.
- UI motion (third live task): M1 to M10 written and applied, M11 consistency pass in progress. Section 7 of the plan still said NOT STARTED; fixed in this commit.

## Changed
1. `ui/competition/CompetitionRulesScreen.kt` (whole file resent, only these changes): import of `wisdomReveal`; the title, the questions-and-minutes line, the red warning card and the note now rise in once (stagger 0 to 3). Cancel and Start are NOT animated (controls of the attempt stay instant). Keys include the contest title, so each contest plays its own entrance once per app session. Header comment line added. Texts and logic unchanged.
2. `docs/UI_MOTION_PLAN.md` section 7: status table now lists M1 to M11 with the evidence I could see (merged PR numbers and commit ids from the commit list). Rest of the file unchanged.

## Evidence and limits
- `[~]` Code read only. NOT compiled by me, CI NOT seen, not seen on a device. Same call shape as the other screens that use `wisdomReveal(key, index)`.
- The merged PR numbers come from the commit list; I did not open the diffs or the CI runs. M4's exact commits were not looked up.

## Still open for M11
1. Drawer screens (About, Contact, FAQ, Privacy, Terms): patch script job (their own `when` block in `MainActivity.kt`).
2. Trophy shimmer while a contest is live (needs a live-contest signal in the top bar).
3. Dialogs in other files (hub gate dialog etc.) never read.
4. Review screen frame and Account points card (Kotlin): no motion of their own yet.
5. Home, Learning, Packages: confirm on the phone that cards rise once and tabs fade through.

## Phone check for this slice
Trophy, join a contest that is live (or open the rules page for a ranked attempt): the title, the info line, the red warning card and the note rise in one after another; Cancel and Start are there at once. Open it a second time in the same app session: no replay. Phone set to Remove animations: everything shows instantly.

## Next
M11 slice 3 (owner's pick): drawer screens push layer (patch script), or review frame and points card, or trophy shimmer.
