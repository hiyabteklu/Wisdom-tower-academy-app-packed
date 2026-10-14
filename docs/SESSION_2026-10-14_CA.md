# SESSION 2026-10-14 CA (Claude chat)

## READ THIS: next big task = COMPETITION (trophy + global exams)
Full plan, data model, stages C0 to C9 and open owner questions: **`docs/COMPETITION_PLAN.md`**. Plan only; nothing is built. The owner starts one stage at a time by naming it (start with C0: ask the owner the questions in section 3 of the plan, do not guess).

Owner request (2026-10-14): replace the top-bar refresh button with a native trophy icon (not emoji) for competitions; when the admin publishes a global exam (e.g. the Freshman exam) students see a dot on the trophy, a proper countdown (days, hours, minutes, seconds) to the admin-set time, then a proper native exam page.

Key finding: `learning_resources` rows are publicly readable when published, including the `correct` answers of exams, so contests need their own tables with answer keys hidden and server-side grading (details in the plan section 2 and 5).

## Also done this session
- Bottom nav redesign (floating capsule track in app colors, slim sliding pill, only the active tab shows its label to the right of the icon). Not applied yet: script `scripts/patch_floating_nav.py` (tested on a copy of `MainActivity.kt`, idempotent). Owner runs GitHub > Actions > Apply pending patches with script `patch_floating_nav.py` and branch `feat/floating-nav`, then tests on the phone. Status `[~]` until CI is green and the owner has tested. Add it to the patch list in `docs/PENDING_PATCHES.md` when that file is next updated.
- Open follow-up (owner may ask): let page content extend fully under the floating nav (needs bottom padding on each screen).
- Nothing else changed. No forbidden file was touched.
