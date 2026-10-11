# NATIVE_CONTENT_PLAN.md — make the learning hubs fully native (no website pages)

> Written 2026-10-11 by Claude (chat, owner on free plan). READ AFTER `HANDOFF.md` and `STATUS.md`. Append-only for decisions; mark steps in section 3 as you go. Repo is PUBLIC: no secrets, no student data.

## 1. Owner decisions (2026-10-11, in the owner's words where possible)

- Goal: the app should go deep into REAL content natively, talking directly to Supabase, and stop opening website pages inside WebViews for the learning hubs.
- Money: "the app/website will stay free for the next few weeks, but it will be paid / no purchase buttons in app, but separate purchase in Website, then unlock the app immediately." => NO purchase UI or prices in the app. Free mode now (`IS_FREE_MODE = true` on the website). Later: access follows what the website records (enrollments / orders / access grants); the app only checks "does this user own this package?" and unlocks. Design the content screens with an `isUnlocked(package)` check from day one (always true while free), never hard-code "unlocked".
- Short notes: render in a clean LOCAL page packed in the app (WebView on `file:///android_asset/...`, NOT the website), using the SAME math renderer the website uses (find it in `website-reference/`, pack the same library version and fonts offline). Cache a whole subject's notes after the first chapter is opened (notes are light) so the subject works offline.
- Access: the owner granted the agent the Supabase connector with read AND write. Use it for anything the agent can do (read data, verify policies, migrations when the owner-approved rules in `docs/SUPABASE_NOTES.md` are respected: one migration per topic, test with `set local role anon/authenticated` in a rolled-back transaction, never touch student data). Ask the owner only for things the agent cannot do (dashboard settings such as Auth options, Vercel env, Appwrite console, GitHub workflow files).
- The owner is on a free plan and gets cut off at any time: write every plan and decision here BEFORE coding; log before you stop.

## 2. Verified facts (from code, 2026-10-11)

- All hub content is rows of `public.learning_resources` (columns used by the website: `id, package_id, scope_path, hub, title, chapter, sort_order, content_type, storage_path, body_md, meta, published, created_at`). `content_type` is one of `pdf, markdown, video_url, quiz, exam, flashcard_deck`. Hub id `references` is the old name of `short-notes` (query both). Published rows are readable with the public anon key (see `docs/SUPABASE_NOTES.md`); the website API `/api/content/resources` is only a wrapper of the same query (filters: `scopePath`, `hub`, `packageId`, published only).
- `scope_path` forms: `freshman/<subjectId>`, `grade/<gradeId>/<subjectId>`, `ece/<sem-1|sem-2>/<courseSlug>`, remedial and entrance have their own. ECE quirks to copy from `website-reference/src/lib/content.ts` `listResources`: for an ECE course also accept the same course under the other semester (`ece/<otherSem>/<slug>`) and `package_id` in (`ece-y3-sem-1`, `ece-y3-sem-2`); if no rows, fall back to `scope_path ilike %<slug>%`; `freshman/math-natural` and `freshman/mathematics` are the same subject.
- PDFs: `storage_path` = `appwrite:<FILE_ID>[|...]`. View URL = `{ENDPOINT}/storage/buckets/{BUCKET}/files/{FILE_ID}/view?project={PROJECT}` (website `/api/content/pdf` proxy does exactly this; role "Any" has READ). Legacy: Supabase storage bucket `learning-content` (signed URL). Needs the Appwrite endpoint, project id, bucket id in the app (check which are `NEXT_PUBLIC_*` in `.env.example`; bucket id may be server-only: if so ask the owner whether to expose it, or use the website proxy for PDFs only).
- Progress and results (own rows only, RLS): `learning_progress` (upsert on `user_id,resource_id`: `progress_pct, last_page, total_seconds, focus_seconds, last_opened_at, meta`), `exam_attempts` (`user_id, resource_id, submitted_at, score, answers, meta{total}`), `academic_results` (`user_id, scope_id, title, total, correct, missed, percent`). Logic to copy: `saveProgress`, `saveExamAttempt`, `getScopeStats` in `website-reference/src/lib/content.ts`.
- NOT yet verified (check with the Supabase connector, read-only, first thing in N1): the real JSON shape of flashcard decks, quizzes and exams (in `body_md`? in `meta`?), the real `scope_path` / `hub` / `package_id` values per package, how many rows per type, which rows are `published`.

## 3. Plan (one step per commit; mark `[~]` written / `[x]` verified by owner; log in a `docs/SESSION_*.md` file)

- [ ] **N0. Data audit** with the Supabase connector (read-only): sample rows per `content_type`, scope_path patterns, counts per package/hub, check anon can read published rows. Record the real shapes in `docs/CONTENT_SHAPES.md`.
- [ ] **N1. Data layer** `data/content/LearningContentRepository.kt` (+ model `LearningResource`): list by (scopePath, hub) with the ECE and math quirks above, direct Supabase REST with the anon key (the signed-in token when present), in-memory + disk cache (JSON file per scope), works offline from cache. No UI yet.
- [ ] **N2. Native hub item list** screen: opens from the 6 hub cards of a course (replaces the website hub page in the WebView); rows sorted by `sort_order`, grouped by chapter; item opens the viewer for its `content_type`. Same card style as `OpenCard` / website design. No fake text: empty state uses website wording (`ResourceHubGrid`/hub page source in `website-reference/`).
- [ ] **N3. Flashcards** native deck viewer (flip, know / learning / again counters like `ProgressMeta.flashcards`), saves to `learning_progress`.
- [ ] **N4. PDF books**: native viewer (Android `PdfRenderer`), download to app storage for offline, remember last page (`learning_progress.last_page`).
- [ ] **N5. Quizzes and exams** (question banks + exams hubs): runner, timer for exams, scoring, solutions, saves `exam_attempts` and `academic_results` exactly like the website.
- [ ] **N6. Short notes**: local page in assets (`assets/notes/index.html` + same math library the website uses + same markdown dialect as `docs`/manual v2.1: `[[term]]`, `==highlight==`, callouts, `$..$`, `$$..$$`, LaTeX `array` tables); native shell passes `body_md` to the page through the JS bridge; whole-subject prefetch cache after the first open.
- [ ] **N7. Videos** (`video_url`): open in the system/YouTube player or ExoPlayer; save watch seconds.
- [ ] **N8. Life Savers hub** (check what content types it holds in N0).
- [ ] **N9. Access check hook**: `isUnlocked(packageId)` reading `content_locks` + ownership (free mode = true now). No purchase UI. Paid flow stays on the website; the app re-checks on resume so a purchase on the website unlocks the app at once.
- [ ] **N10. AI tutor / "Explain with AI"**: keep calling the website routes (`/api/ai`, `/api/explain`; keys stay on the server) from native screens; check what auth they need.
- [ ] **N11. Remove the hub WebView path** once N2 to N8 are tested on a phone. Keep the WebView shell as fallback until then.

## 4. Rules for these steps

- Read `docs/BUILD_PITFALLS.md` before coding. Small commits; keep CI green; mark `[~]` until compiled AND owner-tested.
- The app NEVER stores or shows prices or purchase buttons. No fabricated texts: copy wording from `website-reference/`.
- Never put keys in the repo; only the `NEXT_PUBLIC_*` public values already allowed in `.env.example`.
