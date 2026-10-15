# STATUS (read this first, then stop re-reading finished work)

Newest entry on top. Each agent adds an entry at the end of its session. Details of older work live in the docs named below; do NOT re-audit items marked DONE.

## 2026-10-14 (Claude, review session)

### DONE (do not re-check)
- Entrance Questions: data file, 4 routes, home + academy cards, ownership (free for registered), content-availability, nav-parent, admin tree. Statically reviewed: imports, props, icon names, scope path `entrance/{stream}/{subject}/{year}` all consistent.
- Grade 9-12: independent cards, subject images (every file in GRADE_IMAGE_FILES exists on disk), Exam tips removed from Grade 12.
- Account deletion (`POST /api/account/delete`, `/delete-account`), real Supabase-only auth, privacy wording (commits of 2026-10-11).
- Open GitHub issues: none.

### NOT DONE
- `npm run build` has never been run on the Entrance Questions + Grade changes (no type check yet). Needs an environment where npm works (Codespaces or Vercel preview). Fix any type errors it reports.
- Click-through test: Home -> Entrance Questions -> Natural -> Physics -> 2016; Home -> Grade 12.
- Upload a test exam in Admin > Entrance Questions > ... > 2016 > Exams and confirm it shows on the public year page.
- Optional: Entrance card in `src/app/learning/LearningContent.tsx` and `src/lib/academic-levels.ts`; update "Grade 9-12" wording in `src/lib/student-knowledge-base.ts`; remove unused `GRADE_9_12_PACKAGE` / `packageImages["grade-9-12"]` in `src/data/packages.ts`.
- Storage: freshman/special PDFs still moving from Supabase Storage to Appwrite (see `docs/STORAGE-MIGRATION.md`).

### Environment notes
- Owner works from a phone and has GitHub Codespaces.
- Claude cloud sandbox: can clone this repo and read files, but npm registry returns 403 there, so no install/build/tsc. Do not retry.

### Where the detail is
- `docs/HANDOFF-entrance-questions.md` (design decisions, gotchas)
- `docs/AGENT-NOTES.md` (flashcards, Android shell, free resources rules)
- `docs/GAMES-ROADMAP.md` (Tower Defense = exams, Tower Climb = question banks)
- `docs/STORAGE-MIGRATION.md`
