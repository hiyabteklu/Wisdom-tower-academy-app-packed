# Handoff: Home redesign + Entrance Questions

Any agent can pick this up. Tick items as they are finished and keep this file current.

## Request (from the owner)
1. Home page: remove the combined "Grade 9-12" card. Show Grade 9, 10, 11, 12 as separate top-level cards like Freshman / COC.
2. New package "Entrance Questions" (thumbnail `public/images/Entrance questions.jpeg`). Click -> two cards: Natural Science (`public/images/natural.jpeg`) and Social Science (`public/images/social.jpeg`).
   - Natural subjects: English, Mathematics, Scholastic Aptitude Test (SAT), Physics, Chemistry, Biology
   - Social subjects: English, Mathematics, Scholastic Aptitude Test (SAT), Geography, History, Economics
   - Each subject lists years 2014-2019. Exams per year come from Supabase (admin writes them).
3. Grade 9-12 subject cards use the photos in `public/images/Grade 9..12/`.
4. Remove the "Exam tips" subject from Grade 12.
5. Fix every related reference (back navigation, ownership, admin, locks).

Repo: `hiyabteklu/Wisdom-tower-academy`, branch `main` (Next.js 15 app router, Supabase, Appwrite files).

## Design decisions
- Route tree: `/academy/entrance-questions` -> `/[stream]` -> `/[subject]` -> `/[year]`.
- Year page = `HubContentView` with hub `exams`, package id `entrance-questions`.
- Supabase `learning_resources.scope_path` = `entrance/{stream}/{subject}/{year}` (e.g. `entrance/natural/physics/2016`), `package_id` = `entrance-questions`, `hub` = `exams`. No SQL migration needed (no constraint on scope_path).
- Grade routes `/academy/grades/{9..12}` are unchanged. Only the combined `/academy/grades` list page is retired (redirects to `/academy`).
- Entrance package is free for signed-in users (same as grades). It is intentionally NOT added to `academyPackages` so it never appears as a sellable item in catalog/cart. Ownership is granted via `FREE_FOR_REGISTERED_PACKAGE_IDS` in `src/lib/ownership.ts`.
- Subject image file names differ in extension per grade; see `GRADE_IMAGE_FILES` in `src/data/grade-subjects.ts`.

## Status: all code changes pushed to `main`, NOT build-tested

- [x] `src/data/entrance-questions.ts` (streams, subjects, years, scope helper)
- [x] Pages `src/app/academy/entrance-questions/{page.tsx,[stream]/page.tsx,[stream]/[subject]/page.tsx,[stream]/[subject]/[year]/page.tsx}`
- [x] `src/data/grade-subjects.ts`: subject images + removed `exam-tips`
- [x] `src/components/GradeStreamsPanel.tsx`: shows subject images (icon fallback)
- [x] Empty folders `public/images/Remedial`, `Grade 9..12` (with `.gitkeep`)
- [x] `src/components/home/LandingPathways.tsx` and `src/app/academy/page.tsx`: 4 independent grade cards + Entrance Questions card (order: ECE, Freshman, G9-12, Entrance, COC, UAT, GAT, Exit, Remedial = 12 cards)
- [x] `src/lib/ownership.ts`: `entrance-questions` free for registered users (also in `IS_FREE_MODE`)
- [x] `src/data/admin-nav.ts`: Entrance Questions branch (stream > subject > year > Exams)
- [x] `src/lib/nav-parent.ts`: parents/labels for entrance + grade roots
- [x] `src/data/content-availability.ts`: unlock/lock rules for entrance path
- [x] `src/app/academy/grades/page.tsx`: redirects to `/academy`
- [x] `src/app/academy/grades/[grade]/page.tsx`: back target `/learning`

## Still to do (next agent)
- [ ] Run `npm run build` (and fix any type errors; note `eslint` is ignored in builds). Click through: Home -> Entrance Questions -> Natural -> Physics -> 2016, and Home -> Grade 12 (no Exam tips, images show).
- [ ] Upload a test exam via Admin > Content library > Entrance Questions > ... > 2016 > Exams (published) and confirm it appears on `/academy/entrance-questions/natural/physics/2016`.
- [ ] Optional: thumbnails for entrance subjects (currently icons), add an Entrance card to `AVAILABLE_COURSES` in `src/app/learning/LearningContent.tsx` and to `src/lib/academic-levels.ts` defaults.
- [ ] Optional: `src/lib/student-knowledge-base.ts` still describes "Grade 9-12" as one package; update wording.
- [ ] Optional: the home/academy cards for grades use the old package images (`public/images/packages/grade-N_*.jpeg`); swap if new art is wanted.
- [ ] Old Supabase rows with `scope_path = grade/12/exam-tips` are orphaned (harmless). Delete if wanted.
- [ ] `GRADE_9_12_PACKAGE` and `packageImages["grade-9-12"]` in `src/data/packages.ts` are now unused by the UI; safe to leave or remove.

## Gotchas
- `public/images/Entrance questions.jpeg` has a space and capital E: use `/images/Entrance%20questions.jpeg`. Same for `Grade%209` etc.
- GitHub code search is unreliable for this repo; browse the tree when hunting references.
- Next 15: `params` is a Promise in server pages.
- `src/app/academy/page.tsx` was rewritten: unused imports (`SafeCoverImage`, `SPECIAL_PACKAGES_HUB_IMAGE`, `Shield`, `Compass`) and the commented-out games block were dropped.
