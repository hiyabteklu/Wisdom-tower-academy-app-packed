# Session log 2026-10-11: website grades + Entrance Questions redesign ported to the app

> Copy this entry into `STATUS.md` section C (and the checklist) when a tool that can append to that 38 KB file is available. Repo is PUBLIC: no secrets.

Owner request: "look at the commit history of the website, structure change especially around Grade 9-12, Grade 12 ... update the app into that design". Owner note: the images are already in `website-reference` because the website is synced.

## Website changes read (hiyabteklu/Wisdom-tower-academy, `main`, 2026-10-11)
`ce89c43` (Entrance Questions package, standalone Grade 9-12 cards, subject images, Grade 12 Exam tips removed), `7f82254` (Home: 4 independent grade cards + Entrance card), `8c01d44` (Academy page), `7ac8225` (admin nav, back targets), `1cd2424` + `docs/HANDOFF-entrance-questions.md`.

## DONE (all `[~]` written, NOT compiled, NOT tested on a phone)
- `app/build.gradle.kts` (commit `b070a08`): new Gradle task `copyWebsiteImages`, run before every build like `copyBrandAssets`. It copies `website-reference/public/images/Grade 9..12/*`, `natural.jpeg`, `social.jpeg` and `Entrance questions.jpeg` into `app/src/main/assets/images/web/` (`grade-9..12/`, `entrance/` with `Entrance questions.jpeg` renamed `entrance-questions.jpeg`). Reason: nothing packed the synced images into the APK before. Only a Copy task was added; release/signing/proguard untouched. The copied folder is generated at build time (consider adding `app/src/main/assets/images/web/` to `.gitignore`).
- `ui/packages/PackagesData.kt` (`85eccbf`): Grade 12 "Exam tips" removed; `NativeGradeSubject.image` (default null) filled from the website `GRADE_IMAGE_FILES` (extensions copied exactly: e.g. g11-chemistry is .jpg, the other g11 are .jpeg); new package entry `entrance-questions` (group `entrance`, so it is NOT listed in the Packages tab, like the website catalog; texts from `LandingPathways.tsx`).
- `ui/packages/EntranceData.kt` (`85eccbf`, new): streams, subjects, years 2014-2019, from the website `entrance-questions.ts`.
- `ui/packages/PackageDetailScreen.kt` (`b8457f4`): grade subject cards show the photos; heading is "Grade 9" etc. (website `grade.label`), not "Grade 9 Package"; new Entrance Questions drill-down inside the same screen (root "Past Exams / Entrance Questions" with Natural/Social cards, stream page, subject page with "Exam year" and year cards); Back button and the phone back key go up one level first (`BackHandler`).
- `ui/study/StudyWorkspaceScreen.kt` (`b8457f4`): an Entrance year path (`/academy/entrance-questions/{stream}/{subject}/{year}`) opens the website exams page straight away (the year page IS the exams hub on the website), with a single "Exams" card as fallback.
- `ui/home/HomeScreen.kt`: combined "Grade 9-12" card (`/academy/grades`, retired on the website) replaced by Grade 9, 10, 11, 12 cards plus the Entrance Questions card, in the website order (ECE, Freshman, G9, G10, G11, G12, Entrance, COC, UAT, GAT, Exit Exam, Remedial).
- No change in `MainActivity.kt`: `handleGlobalNav` already opens the package page for any path equal to a catalog package path.

## LEFT / NOT DONE
- Packages tab (`PackagesScreen`) still mirrors the website `/packages` catalog (headings "Grades 9-12", "Other branches", "Special packages"); the website did not change that page, and Entrance is not in the website catalog, so it is not listed there. Owner may want it there too.
- Entrance subject cards have no picture (website shows an icon tile; the app's card has no icon slot).
- Learning tab: the website has not yet added Entrance to `AVAILABLE_COURSES` / `academic-levels.ts` (listed as optional in its handoff); native follows the website.
- Grade pages on the website also show a leaderboard and a progress tracker; not ported (unchanged from before).
- Remedial pictures now exist in `website-reference/public/images/Remedial/`; the Remedial cards still use Freshman pictures (STATUS S4 question B). Next agent: check the file names there and switch paths (add a line to `copyWebsiteImages`).

## TEST (owner)
CI build green (also covers everything uncompiled before). If red, copy the error to the next agent and add it to `docs/BUILD_PITFALLS.md`. On a phone: Home shows 12 cards in the website order with no "Grade 9-12"; Grade 12 has 9 subjects (English and SAT included, no Exam tips) with photos; Grade 9, 10, 11 subjects show photos; Entrance Questions > Natural Science > Physics > 2016 opens the website exams page; Back goes year list > subject list > stream list > Home.

## UNSURE
- Not compiled. Smart casts on the local vals `stream`/`subject` inside the card lambdas should compile (they are `val`); first CI run is the proof.
- Hypothesis: the Gradle `from(dir) { into(...) }` form copies into sub folders as intended; if the images are missing in the APK, look at the task output of `copyWebsiteImages`.
- After an Entrance year opens, the top-bar Back goes to the Learning tab (same behaviour as every hub after patch P1), not to the year list.
