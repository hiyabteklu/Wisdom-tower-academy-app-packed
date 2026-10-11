# CONTENT_SHAPES.md — what is REALLY in `learning_resources` (N0 audit, 2026-10-11, via the Supabase connector, read-only)

> Counts change as the owner adds content; re-run the queries in the plan if in doubt. Repo is PUBLIC: no student data here (this table holds course content only).

## Rows (published) by type and hub
| content_type | hub | rows | where the content is |
|---|---|---|---|
| markdown | short-notes | 120 | `body_md` (average about 25 KB per note; all notes together about 3 MB) |
| flashcard_deck | flashcards | 82 | `meta` JSON |
| quiz | question-banks | 71 | `meta` JSON |
| exam | exams | 68 | `meta` JSON (+ `durationMin`) |
| pdf | books | 57 | `storage_path` = `appwrite:<FILE_ID>` |
| (none yet) | videos, life-savers | 0 | no rows exist: do not build screens for them until rows exist; show the website's empty-state wording |
Unpublished: 1 exam (freshman/english-2). Remedial, Entrance Questions: no rows at all yet.

## Rows by package
ECE 211 (all with `package_id = ece-y3-sem-1`), Freshman 158, Grade 9: 7, Grade 10: 7, Grade 11: 7, Grade 12: 8.
**ECE quirk (confirmed in the data):** every ECE row has `scope_path = ece/sem-1/<slug>` and `package_id = ece-y3-sem-1`, EVEN for Semester 2 courses (meng3052, eceg3082, eceg3092, eceg3094, eceg3096, eceg3102, eceg3052). So a native query for `ece/sem-2/<slug>` finds nothing: query `scope_path in (ece/sem-1/<slug>, ece/sem-2/<slug>)` exactly like the website's `listResources`. Course slugs with rows: eceg3051, 3052, 3061, 3071, 3081, 3082, 3092, 3094, 3096, 3101, 3102, econ1011, meng3052. No rows yet for eceg3073 (Electrical Engineering Laboratory III).

## JSON shapes (all copied from real rows)
- **flashcard_deck**: `meta = { "cards": [ { "front": "...", "back": "..." }, ... ] }`; `body_md` empty.
- **quiz**: `meta = { "questions": [ { "prompt": "...", "choices": ["a","b","c","d"], "correct": 2, "solution": "..." }, ... ] }` (20 to 97 questions per bank); `correct` is a 0-based index.
- **exam**: same as quiz plus `meta.durationMin` (a number or numeric string, for example `"40"`); parse it to an Int.
- **IMPORTANT:** `prompt`, `choices` and `solution` (and probably flashcard `front`/`back`) contain the SAME rich text as the notes: inline math `$...$`, the markers `[[term]]` and `==highlight==`, bold `**..**`. Backslashes in the real strings may be doubled. So the local rich-text/math page (plan step N6) is needed by flashcards and quizzes too, not only by notes: build ONE reusable renderer and use it everywhere.
- **markdown** (`short-notes`): `body_md` is the manual v2.1 dialect (headings, `>` callouts, lists, `[[term]]`, `==hl==`, `$..$`, `$$..$$`, LaTeX `\begin{array}` tables).
- **pdf**: `storage_path` like `appwrite:6aad8e8e001bf655ddff` (the id may be followed by `|...`: cut at `|`). Titles are like "Anthropology module", "Communicative English 1", "Math natural , module".
- Hub id `references` is the old name of `short-notes`; the count above merges them. Always query `hub in (short-notes, references)` for notes.

## Security (read from `pg_policies`)
- `learning_resources`: anon and authenticated can SELECT where `published = true` (policy `lr_public_select_published`); only admin can write. The native app can therefore read content with the public key, signed in or not. (The website still demands sign-in in `listResources`; the owner's rule is: real content needs a signed-in user, so the app checks sign-in itself before showing content.)
- `content_locks`: public SELECT (`cl_public_select`). `learning_progress`, `exam_attempts`: ALL only for own rows (`auth.uid() = user_id`). `academic_results`: own rows select / insert / delete.

## Renderers on the website (to copy for N6)
`website-reference/src/components/FormattedBody.tsx` (rich text blocks) and `website-reference/src/components/MathText.tsx` (math). The math library is **KaTeX `^0.16.11`** (`package.json`); there is NO markdown package, so the website has its own markdown-to-React code (find it in the two files above and in `scripts/restore-rich-content.mjs`). Pack the same KaTeX version, its CSS and the font files in `app/src/main/assets/notes/`.
