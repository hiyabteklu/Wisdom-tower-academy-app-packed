# SESSION 2026-10-16 UI_N: UI motion plan written and pushed

> Repo is PUBLIC: no secrets, no student data.

## Owner request (2026-10-16)
Look at the packed app repo, read the handoff and status, and push a UI polish plan: (1) bottom nav pill motion is not smooth / iOS like, flickers; (2) Home, Packages and other pages feel static, cards should appear and scroll with a phenomenal effect (Other resources is the good example); (3) opening cards and switching pages should feel amazing; (4) Account expand / pills are good, Settings forms open instantly (bad). Plan ALL sections, not only what was listed. The owner is not a coder.

## What was done
- Read `HANDOFF.md`, `CLAUDE.md`, `docs/OWNER_RULE_WRITTEN_IS_DONE.md`, `docs/UI_POLISH_TASKS.md`, `docs/BUILD_PITFALLS.md`, session logs 2026-10-13 F and 2026-10-16 UI_M, `scripts/patch_floating_nav.py`, `scripts/patch_t9_resources_motion.py`, `SettingsScreen.kt`, `WisdomComponents.kt`.
- Wrote `docs/UI_MOTION_PLAN.md` (root causes, motion language, area inventory, slices M1 to M11, phone checklist). Added a pointer paragraph to `CLAUDE.md`.
- No app code changed. Competition board not edited (UI plan).

## Causes found
- Settings: `SettingsAccordionCard` uses a plain `if (isExpanded)`; no animation, chevron never rotates (verified in code).
- Bottom nav (from the patch script): five width animations plus a second label expand animation on the same width, plus a 70 ms delay then a full page switch inside the 420 ms slide (verified in script text; the live function was NOT read; hypothesis for the flash).
- Pages: no shared motion kit exists; good motion lives only in sign-in, Other resources and onboarding.

## NOT read (hypotheses until the slice starts)
Live `AliveBottomNav` and the tab-switch site in `MainActivity.kt`, `AccountScreen.kt`, Home, Packages, Package detail, Learning, drawer, competition and study screens.

## Next
Owner says "do M1" (motion kit + Settings accordions, the smallest visible win). M2 (nav pill) and M3 (tab transition) follow. Nothing blocks them.

## UNSURE
- The motion values in the plan are starting points and will need tuning on the phone.
- Whether `animateItem()` is available depends on the Compose version in use (BOM 2024.09.00 per BUILD_PITFALLS); the agent checks before using it.
