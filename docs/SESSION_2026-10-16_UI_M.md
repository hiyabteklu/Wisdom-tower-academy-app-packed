# SESSION 2026-10-16 UI_M: avatar picker and stream picker removed, university picker added

> Repo is PUBLIC: no secrets, no student data.

## Owner request (2026-10-16, after the gauge change, UI_L)
"Remove the avatar picker since it's not used. Remove the academic track picker and use university picker for university students (from the list of 45+ universities; for students who pick ECE, Remedial, Freshman), and if not university (grades 9-12) or Other, show them a manual input of their school name."

## What was changed (one file: `app/src/main/java/com/wisdomtower/academy/ui/account/AccountScreen.kt`, whole file resent)
- Step 1 is now "Legal Identity" (first and last name only). The avatar picker, avatar tiles, avatar disc, the 8 presets and `AvatarPresetOption` are gone.
- Step 2 is now "Academic Level & Institution". The stream / academic track pills are gone.
  - Level "Remedial", "Freshman" or "3rd Year (ECE)" (`UNIVERSITY_LEVELS`): a UNIVERSITY field that opens a searchable, scrollable list (max 260 dp tall) of the 45 universities in `UNIVERSITY_OPTIONS`. The names and their order are copied from `app/src/main/assets/data/universities.json` (read; 45 entries).
  - Level Grade 9 to 12 or "Other": a typed "School Name" field.
  - Both write the same `schoolName` column as before.
  - Switching between a university level and a school level CLEARS the institution (a university name does not belong to a Grade 10 student). Switching between two university levels keeps it.
  - A saved name that is not in the list (old typed value) still shows in the picker until the student chooses another.
- Score: stream was worth 15 and no longer exists, so the institution is now worth 30 (name 20, level 20, institution 30, region 10, target exam 10, phone 10 = 100). This is MY choice, not the owner's: the website scored the stream.
- Saving no longer sets `stream` or `avatarPreset`: `profile.copy(...)` leaves whatever is stored in those columns as it is (nothing is erased in the database).
- Removed now-unused imports and the public vals `ACADEMIC_STREAM_OPTIONS`, `AVATAR_PRESETS_LIST`, `AvatarPresetOption` (grep of `app/src` before the edit: used only in this file).

## Evidence and limits
- `[~]` WRITTEN, NOT compiled by me, CI NOT seen, not seen on a device. UI_L (gauge) CI also not seen.
- Hypothesis: the nested vertical scroll (list inside the page's LazyColumn) works because the list has a bounded height; check on the phone that scrolling the list does not scroll the page instead.
- Not checked: whether anything else (server, website, `MySubjectsSection`, `NativeStatusModel`) READS `stream` to decide packages or content. The app code was not read for that; if a screen needs a stream for new students it will now be empty.
- Competition board not edited (UI change).

## Owner test
Account > Academic Level & Institution: tap Freshman, open University, search "jim", pick one, Save. Then tap Grade 10: the university clears and a School Name field appears. The gauge percent should follow.
