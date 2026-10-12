# UI POLISH TASKS (T1 to T6) — PROMPT PACK FOR AI STUDIO

> Written 2026-10-12 by Claude (chat) after the owner tested U1 on the installed app. This file is the LIVE task list for the UI polishing phase. It REPLACES `STATUS.md` section B1 (items U1 to U5) until `STATUS.md` is next rewritten (mapping at the bottom). Repo is PUBLIC: no secrets, no student or owner personal data.
> **How the owner uses it:** the owner tells you "do T<number>". Do ONLY that task. Do not start the next one. The owner tests on a phone, reports, and Claude (chat) reviews your work.
> **Roles:** Claude (chat) plans, writes these notes, reviews what you did and keeps status. You (AI Studio) implement. Claude writes big code only when something goes wrong.

---

## 0. READ FIRST (in this order, every session)
1. `HANDOFF.md` (rules, section 0 is mandatory) 2. this file 3. `docs/BUILD_PITFALLS.md` 4. `docs/EDITING_LARGE_FILES.md` before touching `MainActivity.kt` 5. the newest `docs/SESSION_*.md` (newest: `docs/SESSION_2026-10-12_BO.md`).
Do not ask the owner to repeat anything written here. The owner is NOT a coder: plain, short language, lead with the answer.

## 1. GLOBAL CONSTRAINTS (apply to EVERY task; these exist because past agents fell into these pitfalls)

**G1. FORBIDDEN FILES. Never edit, reformat, re-order, add to, delete or "fix" any of these, whatever the reason:**
- `.env.example` (must stay exactly the 6 public, non-empty `NEXT_PUBLIC_*` keys. Every key in it becomes a `BuildConfig` field; an empty or extra key broke the build in run #7 and run #285. Never paste server keys, Vercel values or anything else into it.)
- `.github/**` (workflows), `gradle/**`, `gradlew`, `gradlew.bat`, `gradle.properties`, `build.gradle.kts`, `settings.gradle.kts`, `app/build.gradle.kts`, any ProGuard/R8 file, any signing/keystore setting.
- `app/src/main/AndroidManifest.xml` (unless the task text says so; none of T1 to T6 does).
- `server.js`, `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `metadata.json` (legacy web shell).
- `website-reference/**` (read-only snapshot, refreshed by an Action; never edit).
- `logo.png`, `animation.gif`, `branding/**`, existing images and existing font files. Do not delete or rename any existing file or asset.
- The other repositories (`Wisdom-tower-academy`, `Wisdom-tower-academy-app`). Website changes are only WRITTEN into `WEBSITE_CHANGES.md` for the owner to approve.
- `HANDOFF.md` and `STATUS.md`: only add to them the way their headers allow.
If a task seems to need one of these files: STOP, write it under UNSURE in the session log, ask the owner.

**G2. One task, one change at a time.** Small commits, one clear message each (what and why). Touch only the files the task needs. No "while I am here" cleanups, no refactors, no renames, no new libraries or dependencies, no new network hosts.

**G3. Root cause before fix.** Inspect the real code first (targeted code search; `MainActivity.kt` is huge). Write the cause you found into the session log (label guesses "hypothesis"), then fix. The hypotheses below are leads, not facts.

**G4. No invented text, numbers, sizes, counts or progress values** (owner rule 2026-10-11). Every number on screen comes from real data. If a value is not available: show nothing, never 0, never an estimate, and write the gap in the log.

**G5. Compile safety.** Re-read `docs/BUILD_PITFALLS.md`. Every `Modifier.xxx` needs its own import; only Material icons that really exist (`Icons.Filled.*` / `Icons.AutoMirrored.Filled.*`); no deprecated APIs (`ripple`, not `rememberRipple`); after a fix grep all of `app/src` for the same pattern. `MainActivity.kt` is changed ONLY through a patch script in `scripts/` plus `scripts/pack_mainactivity.py` (HANDOFF rule 10); other files you may resend whole. Keep changes small: a red build wastes the owner's quota.

**G6. Do not redesign.** Colors, layout, cards, spacing and navigation stay as the owner approved. Change only what the task lists.

**G7. Never claim more than you know.** Mark new work `[~]` (written, not compiled/tested) until CI is green AND the owner tested it. Say exactly what evidence you have (code read, CI result you saw, owner report with date).

**G8. Log first.** Before the work: new `docs/SESSION_2026-10-12_<next letter after BO>.md` (or next date) with a line `IN PROGRESS: T<n>`. Before you stop or when quota is low: final entry (commit ids, what is left, what the owner should test, what you are unsure about). If unsure or blocked: stop and ask, do not guess.

**G9. Keep working behavior.** After your change the regression list in `HANDOFF.md` section 9 must still pass. Anything you could not verify, say so.

---

## 2. ORDER AND DEPENDENCIES (owner may change it)
`T1` overlay return/back fix, then `T2` fonts (everything below lays out text, so fonts come early), then `T3` clean reading mode, then `T4` counts and book sizes, then `T5` real download gauge (needs the size source of T4), then `T6` smooth note opening (last: it depends on the final fonts and layout).

---

## T1. Tool overlay: one clear way back, and the phone Back button must close the TOOL first — [~] WRITTEN (session BP, P17)
**Status:** Implemented in `scripts/patch_t1_tool_overlay_back.py` (P17) and tool composables. ScreenBackButton touch target 48dp, top-left on all 7 tools, red close buttons removed. Phone Back closes tool first via local BackHandlers. Awaiting phone test by owner.
**Owner report (2026-10-12, after testing U1):** "The overlay appears from anywhere. But returning to where you were studying is confusing: in the calculator it is a red close button, in the AI Tutor it is a small back arrow, and the phone back button closes the note or exam you were studying instead of the overlaid tool."
**Goal.** (1) Every tool (AI Tutor, Calculator, Timer, Planner, Notebook, Targets, Status) is closed the same way: ONE shared top-left back arrow, same icon, same position, touch target at least 48 dp; remove the red close button and any other close control from the overlay itself. (2) The phone Back button closes the topmost overlay FIRST and leaves the student exactly where they were (same book page, note position, flashcard, exam question, answers and timer state). (3) Back order, top first: tool panels inside a tool (tutor chats panel, tutor history) -> `activeStudyTool` -> drawer screens (About, FAQ, Contact, Privacy, Terms) -> the existing chain (`activeWorkspace` -> `selectedPackage` -> `activeStudyUrl` -> `activeGuideSlug` -> `activeDrawerScreen`).
**Known facts (read from code, not compiled):** U1 is `scripts/patch_u1_global_tool_overlays.py` (P16): overlay state `activeStudyTool` in `MainActivity.kt` at `zIndex(120f)`; its Back handling sits in the big `BackHandler` chain of `MainActivity.kt`. `StudyWorkspaceScreen.kt` has `BackHandler(enabled = view != null && view !is WorkspaceView.Quiz)`; `QuizExamScreen.kt` has `BackHandler(enabled = true)` (always on while the quiz is shown); `NativeTutorScreen.kt` has `BackHandler(enabled = showHistory)`; `LearningScreen.kt` has its own `calculatorOpen` with `BackHandler` and `NativeToolRequests.pendingCalculator` (possibly a second calculator path).
**Hypothesis:** in Compose the most recently registered ENABLED `BackHandler` wins. The one in `MainActivity.kt` is registered first; the workspace and quiz handlers are registered later (deeper in the tree), so they receive Back before the overlay chain does. That would explain "Back closes the note/exam". Verify before fixing.
**Fix direction (choose the smallest that the evidence supports):** put a `BackHandler(enabled = true)` inside the overlay composable itself so it is registered after the screens below it, OR pass a flag so workspace/quiz handlers are disabled while `activeStudyTool != null`. Do not remove the exam's own safety (its dialogs close first). Find out whether the calculator is the website page in a WebView (that would explain the red X) or native, and whether two calculator paths exist; use one path.
**Do not:** reset `activeWorkspace` or the bottom tab when opening or closing a tool; change tool contents or looks other than the back control; touch the exam timer logic (report whether the timer keeps running while a tool is open: just state what it does today).
**Done when (owner tests on the phone):** from inside a book (PDF), a note, flashcards and a running exam: open each of the 7 tools from the drawer; the back arrow is in the same place everywhere and no red close button remains; tap it or press the phone Back: the tool closes and you are on the same page/question as before; from the Home, Packages and Account tabs the same; About/FAQ still close with Back to where you were; second Back press then behaves as before the change.

## T2. One clean font system [~]
**Status:** Implemented [~] (session log `docs/SESSION_2026-10-12_BQ.md`). All four Tinos font files bundled. Central style switch in `Type.kt` and `richtext.css`. Local pages and native notebook updated to unified size tokens. Website changes proposed in `WEBSITE_CHANGES.md` section 6. Ready for phone testing.
**Owner words:** "The website uses random font styles and sizes. I want something clean, readable, similar to the Italics of Times New Roman. Not default. Download and place them there if you can, or tell me what assets you want. Flashcards, explanation, questions, options, Explain with AI etc. all use different things."
**Goal.** One content font and one small size scale used by ALL reading/learning text: flashcards, questions, options, explanations, "Explain with AI" answers, notes, tutor answers.
**Decisions made by the planner (owner can change them after seeing it on the phone):**
- Font: **Tinos** (Google Fonts, Apache 2.0, metric-compatible with Times New Roman, has Italic). Times New Roman itself is a licensed Microsoft font and must not be bundled. Files needed: Regular, Italic, Bold, Bold Italic as `.ttf`, named `tinos_regular.ttf`, `tinos_italic.ttf`, `tinos_bold.ttf`, `tinos_bold_italic.ttf`.
- You usually cannot download binary files. If the font files are not in the repo yet: STOP at step 2, tell the owner exactly these four file names and where they go (`app/src/main/res/font/` for native screens, `app/src/main/assets/fonts/` for local HTML pages), and wait.
- Style: content text (the list above) uses Tinos **Italic** as the owner asked; buttons, bars and headings keep the existing Outfit / Plus Jakarta Sans. Put the italic choice in ONE place (one text-style constant natively, one CSS variable such as `--wt-content-font-style` in the local pages) so switching to upright later is a one-line change. Do not change KaTeX math fonts.
- Size scale (proposal): question and explanation 17 sp / line 26, option 16 / 24, flashcard face 20 / 28, caption 13 / 18. Use the same four tokens everywhere; no other sizes for content text.
**Steps.** 1. Inventory: for each screen above write in the session log the renderer (native Compose, local packed page in `assets/`, or the LIVE website inside a WebView) and the font family and size it uses now. 2. Fonts present? (see above). 3. Native Compose: add `ContentFontFamily` and the four text styles next to `Type.kt`, switch the content screens to them. 4. Local packed pages (`assets/notes/*.html`, `tutor.html`, others found): `@font-face` with the bundled file, one CSS block shared by the pages. 5. Screens that are the LIVE website in a WebView (quiz/exam pages, website flashcards, explain): do NOT edit the website repo; write the exact font/CSS change as a new numbered section in `WEBSITE_CHANGES.md` for owner approval, and say in the log which screens still look different until the owner approves it.
**Do not:** add more than these four font files; change theme colors; change `.env.example` or any Gradle file (font resources need no build change).
**Done when:** the owner sees the same font and consistent sizes on flashcards, questions, options, explanations, Explain with AI and notes in the app, with a list of any screen still pending a website change.

## T3. Clean reading mode (U3) [~]
**Status:** Implemented [~] (session log `docs/SESSION_2026-10-12_BR.md`). Full audit table in log. Single-line carousel pills in exam runner. Slim headers in PDF, notes, flashcards, exams. Essential controls preserved. Ready for phone testing.
**Owner words:** "Reading modes should be clean, most of the screen for content. For example the chapter tag in the image is everywhere; we do not want it like that. We want a clean reading mode." (The owner's screenshot is not available to the planner: find the chapter tag in the code.)
**Goal.** In the PDF reader, notes, flashcards, quiz and exam screens, nothing repeats on every screen or scrolls with the student except what is essential. The chapter tag/title appears at most once (at the start of the content), not pinned.
**Steps.** 1. Audit each screen (`PdfReaderScreen.kt`, `NotesReaderScreen.kt`, `FlashcardsScreen.kt`, `QuizExamScreen.kt`, `StudyWorkspaceScreen.kt` headers, local pages) and put a table in the session log: every bar, header, tag, title = ESSENTIAL or REDUNDANT, with the reason. 2. Remove the REDUNDANT ones. 3. Keep, always reachable: back, exam timer, submit, close, page/position indicator, the hamburger/tools entry. Use at most one slim bar per screen; the chapter name may live inside that bar as one short line.
**Do not:** break the back chain or status-bar handling; remove anything the exam needs to be finished; change content layout inside pages other than freeing space.
**Done when:** on the owner's phone a book, a note, a flashcard set and an exam show clearly more content, and every essential control still works.

## T4. Real counts and book file sizes (U4 plus the counts request)
**Owner words:** "The file size showing (only for books). Also: question bank, exams, flashcards etc. show numbers (counts) as the website does, make it even better here. No blind guessing. Show numbers cleanly."
**Goal.** (a) Each BOOK shows its real file size (for example `12.4 MB`) before downloading. (b) Every place that lists question banks, exams, flashcards, notes (hub cards, hub item rows) shows the real count, in the same wording and rule the website uses.
**Steps.** 1. Find what the website shows and how it gets it (`website-reference/`; copy its wording exactly). 2. Find where each number can come from in the app: counts from the `learning_resources` rows or the stored content (see `docs/CONTENT_SHAPES.md`); size hypothesis: file metadata of the storage file (Appwrite `sizeOriginal`) or the HTTP `Content-Length`. Check which one works without downloading the whole file. 3. Implement with the existing clients only (no new host). Cache values so they also show offline once known. 4. Missing value: show nothing (G4); list in the log which items have no size/count.
**Do not:** show a size for non-book items; show 0 or `~`; add per-item network calls that make list screens slow (batch or reuse what the list already loads).
**Done when:** the owner sees a real size on each book, real counts on the hubs and rows, and nothing shown where data is missing.

## T5. Real circular download gauge (U5) [~]
**Status:** Implemented [~] (session log `docs/SESSION_2026-10-12_BU.md`). One shared composable `DownloadGauge` created. Live percentage filling inside circular gauge, transitions to existing green checkmark when finished, red retry icon on failure, indeterminate spinner with no percent when total unknown (G4). Throttled to whole percentage changes. Ready for phone testing.
**Owner words:** "The download progress for all: a real circular gauge, not big, just as it is the spinning circle there, but instead of spinning indefinitely it shows the real progress and the percent inside the circle until it changes into a check mark."
**Goal.** One shared composable (for example `DownloadGauge(progress: Float?, state)`), the same size as today's spinner, used by EVERY download: books, notes, flashcards, question banks, exams and any other offline download.
**Steps.** 1. Inventory every download path in the code and write in the log which can report real progress (bytes read vs total; or items done vs items total for multi-item downloads). 2. Build the gauge: determinate circle, percent text inside (small, must fit), turns into the EXISTING checkmark when finished, clear failed state with the existing retry behavior. 3. Total unknown: keep the indefinite spinner and show NO percent (G4). 4. Throttle updates (for example only when the whole percent changes) so the list does not recompose on every chunk. Use the progress API version that already exists in the repo (look at the current `CircularProgressIndicator` calls); do not change dependencies.
**Do not:** enlarge the indicator; change what is downloaded or where it is stored; touch the download cache format.
**Done when:** downloading a book and a set of notes/flashcards shows a small circle filling with a live percent, then the check mark; airplane mode mid-download shows the failed state, not a stuck circle.

## T6. Smooth opening of downloaded notes (no blink, no movement)
**Owner words:** "Opening downloaded notes there is a small blink, the text moves slightly, I think when the math is rendered. I want it smooth and as fast as possible, no blink, no moving. Example: the title appeared as one long line and then changed to two lines."
**Goal.** A downloaded note appears once, fully laid out, with no visible movement of the title or text, as fast as possible.
**Steps.** 1. Root cause first (G3): measure with the notes page (`NotesReaderScreen.kt`, `assets/notes/*.html`, the KaTeX loading from N6) which of these causes the shift (hypotheses): math rendered after the first paint and changing line heights; the title laid out before the font loaded (font swap) so it wraps differently; the WebView shown before the page is ready. 2. Fix direction: keep the WebView hidden (same background color, no spinner flash) until the page itself reports ready AFTER fonts are loaded (`document.fonts.ready`) and math is rendered, then reveal in one step; render math synchronously before first paint where possible; give the title a stable layout. 3. Only if step 2 is not enough, propose (do not start) storing pre-rendered note HTML at download time: that changes the stored format and needs the owner's OK.
**Do not:** do this before T2 is done and tested (fonts change the wrapping); add network loads for fonts or math (everything stays local/offline); change how notes look.
**Done when:** the owner opens several downloaded notes with math, on a phone, and sees no blink and no moving title or text.

---

## 3. DROPPED / PARKED
- **DROPPED (owner 2026-10-12): tutor avatar animation** (`animation.gif`, BH item 3 of `docs/SESSION_2026-10-12_BH.md`). "Tutor aviator animation is not necessary." The file stays in the repo and assets, unused; do not delete it.
- **PARKED: rest of U2 (premium native AI Tutor):** BH item 4 second half (true retry), item 6 (lag, only if felt), item 7 (waits for T1). Done earlier: items 1, 2, 4a, 5 (see BI, BJ, BK).
- Everything in `STATUS.md` B3 stays parked.

## 4. OWNER DECISIONS OF 2026-10-12 (copied in the owner's words; append-only)
- Role split: Claude updates status, pushes plans, reviews what AI Studio did; notes in the repo serve as prompts for AI Studio; AI Studio is told not to touch `.env.example` etc.
- U1 test: tools overlay now appears from anywhere; returning is confusing (red close button in calculator, small back arrow in AI Tutor, phone Back closes the note/exam instead of the tool).
- Reading modes: clean, most of the screen for content (chapter tag everywhere is unwanted).
- File size only for books; download progress for all as a real small circular gauge with percent, then the check mark.
- Question bank, exams, flashcards etc.: show real counts cleanly, as on the website, no blind guessing.
- Opening downloaded notes: no blink, no moving text, as fast as possible.
- Fonts: one clean readable font like the italics of Times New Roman; the owner can supply assets.
- Tutor aviator animation: not necessary, omit it.
- Wants 5 to 6 clean tasks; the owner picks one at a time.

## 5. MAPPING TO OLDER IDS
U1 -> done as `[~]`, follow-up is T1. U2 -> parked (animation dropped). U3 -> T3. U4 -> T4. U5 -> T5. New: T2 (fonts), T6 (smooth notes).
