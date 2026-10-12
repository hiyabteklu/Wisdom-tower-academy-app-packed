# Session log 2026-10-12 BQ: T2 (one clean font system)

> Continues `docs/SESSION_2026-10-12_BP.md`. Repo is PUBLIC: no secrets.

- 2026-10-12 | AI Studio Agent | DONE [~]: T2 per owner instruction ("Now implement T2").

  - **STEP 1: SCREEN INVENTORY (Renderer, Font Family, Sizes Before Fix):**
    1. **Flashcards:**
       - *Renderer:* Local packed page in `assets/notes/flashcards.html` loaded inside `FlashcardsScreen.kt` (Android WebView).
       - *Before:* Used `Georgia, "Times New Roman", serif; font-weight: 700; font-style: italic;` with dynamic rem classes (`.s1` 1.6rem, `.s2` 1.3rem, `.s3` 1.1rem).
       - *After:* Standardized on `var(--wt-content-font-family)` (WT Tinos), `var(--wt-content-font-style)` (italic), and `var(--wt-content-size-flashcard)` (**20px / 28px**).
    2. **Quiz & Question Bank (Questions, Options, Solutions, Explain with AI):**
       - *Renderer:* Local packed page in `assets/notes/quiz.html` loaded inside `QuizExamScreen.kt` (Android WebView).
       - *Before:* Question prompt used body sans; options used `0.85rem` sans; solution box (`.solbox`) used `italic 500 .9rem/1.5 Georgia, "Times New Roman", serif`; Explain with AI box (`.aibox`) used `italic 500 .9rem/1.5 Georgia, "Times New Roman", serif`.
       - *After:*
         - Question prompt: WT Tinos Italic at **17px / 26px** (`--wt-content-size-question` / `--wt-content-line-question`).
         - Option choices: WT Tinos Italic at **16px / 24px** (`--wt-content-size-option` / `--wt-content-line-option`); choice letter label (A, B, C, D) remains upright sans.
         - Solution box: WT Tinos Italic at **17px / 26px** (`--wt-content-size-explanation` / `--wt-content-line-explanation`); header label "SOLUTION" remains upright sans.
         - Explain with AI box: WT Tinos Italic at **17px / 26px** (`--wt-content-size-explanation` / `--wt-content-line-explanation`); header label "EXPLAIN WITH AI" remains upright sans.
    3. **Short Notes (Note Reader & Summaries):**
       - *Renderer:* Local packed page in `assets/notes/index.html` loaded inside `NotesReaderScreen.kt` (Android WebView).
       - *Before:* Content body used system sans / WT Jakarta 16px/1.7; AI summary box used 0.9rem sans.
       - *After:*
         - `#note` content text (paragraphs, lists, callouts): WT Tinos Italic at **17px / 26px** (`--wt-content-size-question` / `--wt-content-line-question`).
         - `.sumbox` AI summary body: WT Tinos Italic at **17px / 26px** (`--wt-content-size-explanation` / `--wt-content-line-explanation`).
         - Headings (`.study-h1`, `.study-h2`, `.study-h3`) remain Outfit bold upright.
         - Math formulas (`.katex`) remain KaTeX fonts untouched.
    4. **AI Tutor Answers:**
       - *Renderer:* Local packed page in `assets/notes/tutor.html` loaded inside `NativeTutorScreen.kt` (Android WebView).
       - *Before:* Bot bubble body used default sans font.
       - *After:* `.bub.b .body` uses WT Tinos Italic at **17px / 26px** (`--wt-content-size-explanation` / `--wt-content-line-explanation`).
    5. **Native Notebook (Scratchpad/Notes):**
       - *Renderer:* Native Jetpack Compose in `NativeNotebookScreen.kt`.
       - *Before:* Used hardcoded `FontFamily.Serif` with `FontStyle.Italic` at 14.sp/22.sp.
       - *After:* Uses `ContentQuestionStyle` (Tinos Italic, **17sp / 26sp**).
    6. **PDF Reader:**
       - *Renderer:* Native Compose + Android `PdfRenderer`. Renders book pages as vector/bitmap document pages. Outer controls use Plus Jakarta Sans.
    7. **Hub Cards & Catalog Rows:**
       - Keep Outfit (headings) and Plus Jakarta Sans (labels/metadata) upright as specified.
    8. **Live Website in WebView (Desktop / Fallback):**
       - Does not run locally; documented in `WEBSITE_CHANGES.md` section 6 for owner approval.

  - **STEP 2: FONT ASSETS VERIFICATION:**
    - Confirmed four Tinos `.ttf` font files are present:
      - `tinos_regular.ttf` (400 normal)
      - `tinos_italic.ttf` (400 italic)
      - `tinos_bold.ttf` (700 normal)
      - `tinos_bold_italic.ttf` (700 italic)
    - Located in `app/src/main/res/font/`, `app/src/main/assets/fonts/`, and copied into `app/src/main/assets/notes/fonts/`.

  - **STEP 3: NATIVE COMPOSE TYPOGRAPHY (`Type.kt`):**
    - Added `TinosFontFamily` referencing `R.font.tinos_regular`, `R.font.tinos_italic`, `R.font.tinos_bold`, and `R.font.tinos_bold_italic`.
    - Single global constant switch: `val ContentFontStyle: FontStyle = FontStyle.Italic` (switching to `FontStyle.Normal` is a one-line change to make all content upright).
    - Added `ContentFontFamily: FontFamily = TinosFontFamily`.
    - Added four shared size tokens:
      - `ContentQuestionStyle` (17.sp / line 26.sp)
      - `ContentExplanationStyle` (17.sp / line 26.sp)
      - `ContentOptionStyle` (16.sp / line 24.sp)
      - `ContentFlashcardStyle` (20.sp / line 28.sp)
      - `ContentCaptionStyle` (13.sp / line 18.sp)
    - Updated `NativeNotebookScreen.kt` to use `ContentQuestionStyle`.

  - **STEP 4: LOCAL PACKED PAGES (`assets/notes/`):**
    - `richtext.css`:
      - Added `@font-face` definitions for "WT Tinos" across all 4 weights/styles, referencing both `fonts/` and `../fonts/`.
      - Added CSS tokens under `:root`:
        - `--wt-content-font-family: "WT Tinos", "Times New Roman", Times, serif;`
        - `--wt-content-font-style: italic;` (single global CSS switch; changing to `normal` switches all local web pages to upright).
        - `--wt-content-size-question: 17px;` / `--wt-content-line-question: 26px;`
        - `--wt-content-size-explanation: 17px;` / `--wt-content-line-explanation: 26px;`
        - `--wt-content-size-option: 16px;` / `--wt-content-line-option: 24px;`
        - `--wt-content-size-flashcard: 20px;` / `--wt-content-line-flashcard: 28px;`
        - `--wt-content-size-caption: 13px;` / `--wt-content-line-caption: 18px;`
      - Applied content font to `.study-p`, `.study-list`, `.study-callout`, `.fc-text`, `.prompt`, `.choice .ct`, `.solbox`, `.aibox`, `.bub.b .body`, `#note`.
      - Ensured headings (`.study-h1`, `.study-h2`, `.study-h3`), buttons, pills, chips, badges, labels, and timers remain upright Outfit / Plus Jakarta Sans.
      - KaTeX math formulas remain completely untouched.
    - Updated `flashcards.html`, `quiz.html`, `tutor.html`, and `index.html` to bind directly to these CSS tokens.

  - **STEP 5: WEBSITE CHANGES PROPOSAL (`WEBSITE_CHANGES.md`):**
    - Added Section 6 to `WEBSITE_CHANGES.md` with exact instructions for `globals.css` (Tinos Google Font import + CSS variables), `tailwind.config.ts` (fontFamily extension), `FlashcardViewer.tsx`, `QuizExamViewer.tsx`, and `AiTutor.tsx`.

  - **FILES TOUCHED:**
    - `app/src/main/java/com/wisdomtower/academy/ui/theme/Type.kt`
    - `app/src/main/java/com/wisdomtower/academy/ui/study/NativeNotebookScreen.kt`
    - `app/src/main/assets/notes/richtext.css`
    - `app/src/main/assets/notes/flashcards.html`
    - `app/src/main/assets/notes/quiz.html`
    - `app/src/main/assets/notes/tutor.html`
    - `app/src/main/assets/notes/index.html`
    - `WEBSITE_CHANGES.md` (new Section 6)
    - `STATUS.md` (roadmap update)
    - `docs/UI_POLISH_TASKS.md` (T2 marked [~])

  - **VERIFICATION:**
    - Checked all font files exist and are valid non-empty files in `res/font/` and `assets/fonts/`.
    - Native Compose files verified syntax and balanced braces.
    - Web applet compilation verified via `compile_applet`.
    - Web applet lint verified via `lint_applet`.

  - **LEFT:**
    - Owner tests on phone: verify Tinos Italic appearance and readability across flashcards, question bank, explanations, AI tutor, and notes.
    - Owner decides Open Question 6: keep italic for all learning content or switch to upright body text? (Switching is a one-line change in `Type.kt` and `richtext.css`).
    - Owner approves and applies Section 6 of `WEBSITE_CHANGES.md` to website repo.
    - Owner picks next task (e.g. T3 clean reading mode).

  - **WHAT THE OWNER SHOULD TEST ON THE PHONE:**
    1. Open a **Flashcard deck**: check that card questions and answers display in clean Tinos Italic (20sp), balanced and readable.
    2. Open a **Question Bank / Exam**: check that the question prompt displays in Tinos Italic (17sp), options display in Tinos Italic (16sp), solution explanation displays in Tinos Italic (17sp), and "Explain with AI" answer displays in Tinos Italic (17sp). Choice letter labels (A, B, C, D) and headers stay clean upright sans-serif.
    3. Open a **Short Note**: check that note paragraphs and lists display in Tinos Italic (17sp), math formulas render cleanly via KaTeX, and the AI Summary box displays in Tinos Italic (17sp). Headings stay Outfit bold upright.
    4. Open the **AI Tutor**: check that tutor answers display in clean Tinos Italic (17sp). Buttons, suggestions, and your own messages stay clean sans-serif.
    5. Open the **Notebook tool**: check that sheet contents display in clean Tinos Italic (17sp).
