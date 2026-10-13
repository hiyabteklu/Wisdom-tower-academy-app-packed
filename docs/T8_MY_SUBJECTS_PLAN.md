# T8. "My Subjects": the student picks what they study; Status and progress count only that

> Written 2026-10-14 by Claude (chat). PLAN ONLY: nothing is implemented. Repo is PUBLIC: no secrets, no student or owner personal data.
> Same rules as `docs/UI_POLISH_TASKS.md` (global constraints G1 to G9) and `HANDOFF.md` section 0 apply to whoever implements this. The owner starts it by naming "T8". Do only T8.

## 1. Owner words (2026-10-14, copied as written; copy into `docs/UI_POLISH_TASKS.md` section 4 and `STATUS.md` section A when those files are next resent)
"for freshman there should be a subject picker, cuz the freshman list is 20+ subjects... but students take 6-7 per semester. there should be subject picker setting so users can adjust to their proper subjects and the progress tracker (your status) should be showing only what the student selected."
"for other packages the same, students should see only status and progress of what they applied for. example Electrical and computer engineering student attempts and reading time in freshman doesn't count to their progress or status. this should be decided by their choice on the settings"

## 2. Goal
(1) In Settings, a "My Subjects" picker: the student chooses which package(s) they study and, inside each, which subjects. (2) "Your status" (and any other progress/total shown to the student) counts ONLY activity in the chosen subjects. Example: an ECE student who once read Freshman notes does not see that reading time or those question attempts in their status.

## 3. Facts (verified, not guessed)
- **Progress is stored per resource, with no subject on it.** `StudentProgressReader.kt` reads `learning_progress` rows as `ProgressRow(resourceId, progressPct, totalSeconds, focusSeconds, lastOpenedAt, quizAttempted, quizCorrect)`. `NativeStatusModel.computeStatus(rows, track)` adds up ALL rows. So today every package and subject counts.
- **Every resource knows its subject.** Read-only check of `public.learning_resources` (published rows, 2026-10-14): each row has `package_id` and `scope_path`, and the subject is the LAST segment of `scope_path`:
  | package_id | scope_path shape | distinct subjects | rows |
  |---|---|---|---|
  | `freshman` | `freshman/<slug>` | 21 | 158 |
  | `ece-y3-sem-1` | `ece/sem-1/<slug>` | 13 | 211 |
  | `grade-9` / `grade-10` / `grade-11` / `grade-12` | `grade/<n>/<slug>` | 7 / 7 / 7 / 8 | 7 / 7 / 7 / 8 |
  Remedial, UAT, GAT, COC, Exit Exam, Entrance: no rows yet, so they cannot have progress and need no picker entry yet.
- **ECE quirk (see `docs/CONTENT_SHAPES.md`):** Semester 2 ECE courses also carry `package_id = ece-y3-sem-1` and `scope_path = ece/sem-1/<slug>`. So for ECE the subject key is the course slug, never the package id alone.
- **Real names and lists already exist in the app** (`ui/packages/PackagesData.kt`, copied from the website): `FRESHMAN_SUBJECTS` (21), `FRESHMAN_NATURAL_IDS`, `FRESHMAN_SOCIAL_IDS`, `FRESHMAN_SEM1_IDS`, `FRESHMAN_SEM2_IDS`, `ECE_SEM1_COURSES`, `ECE_SEM2_COURSES`, `GRADE_9_SUBJECTS` to `GRADE_12_SUBJECTS`. Use them; invent no names (G4).
- `learning_progress` has own-rows-only security (`auth.uid() = user_id`); `learning_resources` is readable with the public key for published rows (`docs/CONTENT_SHAPES.md`, `docs/SUPABASE_NOTES.md`).
- `public.profiles` already has `active_academic_scope` (default `freshman`, not used by any screen) and `app_preferences` (jsonb). Either could later carry the choice to a new phone and to the website without a database change. Not needed for the first version.
- The Status screen picks its benchmark track from the profile (`resolveStatusTrack(educationLevel, stream)` in `NativeStatusModel.kt`); that part is independent of this task.

## 4. Design (planner's proposal; the owner can change it after seeing it)
1. **Nothing is deleted or hidden at the source.** All reading time and attempts keep being saved exactly as now. The picker only changes what is COUNTED. Change the picks later and the old numbers come back. Content lists (hubs, packages) are not hidden: the owner asked only for status and progress.
2. **Where the choice is stored (first version):** on the device, per signed-in user id (a small preferences store, no network, works offline). Optional second step, only with the owner's OK: also save it in `profiles.app_preferences` (key such as `my_subjects`) so it follows the student; no migration needed.
3. **Shape of the choice:** for each followed package, the set of subject keys (last segment of `scope_path`). A package with no picked subject is not followed.
4. **Settings screen: a new card "My Subjects"** (same iOS-like pill look as the Account screen, T7; wrapping pills, nothing cut off to the right, no long hidden lists):
   - Row 1, "What are you studying?": pills for the packages that have content: Freshman, ECE Year 3, Grade 9, 10, 11, 12 (multi-select).
   - For each chosen package, a section with ALL its subjects as wrapping pills, a live counter ("6 selected"), and a "Clear" action.
   - Optional "quick fill" pills for Freshman built from the website's own lists (Natural stream, Social stream, Semester 1, Semester 2). They only pre-select; the student can always edit. Do not claim a number of subjects: those lists hold 10 to 13 subjects, the student decides their 6-7.
5. **Counting:** build a map `resource_id -> (package_id, subject key)` from ONE request `learning_resources?select=id,package_id,scope_path&published=eq.true` (public key), cache it on the device with a timestamp so it works offline, refresh when stale. In the Status screen: read the progress rows as today, keep only rows whose resource belongs to a picked subject, then call the unchanged `computeStatus(filteredRows, track)`.
6. **Status screen header:** one short line saying what is counted ("Counting 6 subjects: Freshman") with a "Change" action that opens Settings > My Subjects. When rows exist outside the picks, say plainly that other activity is not counted (no invented numbers).
7. **Before the student picks anything:** see open question A.
8. **Audit step (G3):** grep every place that reads or adds up progress (`StudentProgressReader.fetchAll`, `computeStatus`, Targets, Learning tab, any percentage on hub cards) and list them in the session log with the decision "filter / leave alone / ask owner". Do not change a place that is not listed in the log first.

## 5. Steps for the implementer (one small commit each)
1. Log first: `docs/SESSION_<date>_<letter>.md` with `IN PROGRESS: T8`.
2. Audit (section 4 item 8) and write the table in the log.
3. New file `data/content/MySubjectsStore.kt` (read/write the choice, per user id, with a safe empty default) and `data/content/ResourceScopeIndex.kt` (the id-to-subject map with disk cache). Existing OkHttp client style, no new library, no new host.
4. New file `ui/settings/MySubjectsSection.kt` (the card) and the smallest possible edit to `SettingsScreen.kt` to show it.
5. Edit `NativeStatusScreen.kt` to filter before `computeStatus` and show the header line.
6. Update `STATUS.md` or a session log with the checklist; mark `[~]` until CI is green AND the owner tested.

**Do not:** edit forbidden files (G1); change `computeStatus` or its wording; change what is saved to `learning_progress`; hide content from hubs; add dependencies or network hosts; show 0 or an estimate when data is missing (G4). Before merging use Actions > Build Production AAB & APK > Run workflow on the branch and wait for green.

## 6. Done when (owner tests on the phone)
- Settings has "My Subjects"; picking Freshman shows all 21 subjects as pills that wrap; the counter and Clear work; the choice is still there after closing the app.
- With 6 Freshman subjects picked, "Your status" counts only those: reading time, attempts, accuracy and streak change when a subject is added or removed.
- An ECE student with Freshman activity in the past picks only ECE courses: the Freshman time and attempts no longer appear in the status; picking Freshman again brings them back.
- With no network the status still filters (cached map) or says it cannot, never shows wrong totals.
- Regression: `HANDOFF.md` section 9 list.

## 7. Open questions for the owner (answer in plain words; the implementer must not guess)
A. **Before a student has picked anything**, what should Status show? Options: (1) everything, as today, with one line "Choose your subjects in Settings"; (2) pre-pick the package from the Academic Level they set on the Account screen (Freshman, Grade n, ECE) with all its subjects. Planner's recommendation: (2), because it already matches the student's own profile and fixes the ECE-versus-Freshman problem on day one.
B. **Semester change:** when the student moves to the next semester and changes the picks, last semester's activity stops counting. Is that what you want, or should there be a "past semesters" view? (Not planned unless you ask.)
C. **Several packages at once** (for example Grade 12 plus Entrance prep): show one combined status, or one status per package? Planner's recommendation: one combined status of the picked subjects.
D. **Save the choice on the server too** (profiles.app_preferences) so it follows the student to a new phone? Yes/no.
