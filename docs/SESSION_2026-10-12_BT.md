# Session log 2026-10-12 BT: T4 Real counts and book file sizes

> Continues `docs/SESSION_2026-10-12_BS.md`. Repo is PUBLIC: no secrets.

- 2026-10-12 | AI Studio Agent | DONE [~]: Implemented T4 (Real counts and book file sizes).

  - **GOAL & OWNER REQUIREMENTS (from docs/UI_POLISH_TASKS.md T4):**
    - Owner words: "The file size showing (only for books). Also: question bank, exams, flashcards etc. show numbers (counts) as the website does, make it even better here. No blind guessing. Show numbers cleanly."
    - (a) Each BOOK shows its real file size (e.g. `12.4 MB`) before downloading in `HubItemListScreen.kt`. When saved offline, shows `${size} · Saved offline`.
    - (b) Every place that lists question banks, exams, flashcards, notes (the 6 hub cards in `StudyWorkspaceScreen.kt`, and item rows in `HubItemListScreen.kt`) shows the real count in the exact same wording and rules the website uses (`website-reference/`). Missing counts/sizes show nothing (G4). Zero blind guessing or `~`.

  - **WHAT WAS DONE:**
    1. **Book File Size Probing and Offline Caching (`BookFileStore.kt`):**
       - Implemented `probeFileSize(context, key, url): Long?`: performs a lightweight HTTP HEAD probe on the public Appwrite file URL; if HEAD returns no `Content-Length`, falls back to a 1-byte Range GET (`bytes=0-0`) and reads `Content-Range: bytes 0-0/total`.
       - Implemented `formatBytes(bytes: Long): String`: formats bytes into clean `"XX.X MB"` or `"XX.X KB"`, matching the website's `PdfReader.tsx`.
       - Cached file sizes in memory (`ConcurrentHashMap`) and persistent SharedPreferences (`wt_book_sizes`). Once a file size is probed or downloaded, it persists offline.
       - Returns `null` if the size cannot be determined (strictly adhering to rule G4: show nothing if unknown, never guess).
    2. **Real Book File Sizes in Hub Item List (`HubItemListScreen.kt`):**
       - Added `fileSizeMap` state and background probing inside `LaunchedEffect(current.items, hubId)` when `hubId == "books"`.
       - First checks local cache and saved files synchronously for instantaneous display with 0 network delay.
       - For books not yet probed, runs lightweight probes without downloading the whole file.
       - In `ItemRow`: passed `knownSize: Long?` (only for books; null for all other hubs).
       - Subline renders `listOfNotNull("Chapter $it", sizeText, countText, if (isDownloaded) "Saved offline" else null).joinToString(" · ")`.
       - For books: un-downloaded items show `12.4 MB` (or `Chapter 1 · 12.4 MB`), and downloaded items show `12.4 MB · Saved offline`.
    3. **Real Counts on Hub Cards (`StudyWorkspaceScreen.kt` & `LearningContentRepository.kt`):**
       - `LearningContentRepository.getHubCounts(context, scopePath)` queries `select=hub` from `learning_resources` for the active scope, aggregates counts per hub (`books`, `short-notes`, `flashcards`, `question-banks`, `exams`, `life-savers`), and caches results in persistent local files (`counts_$scopePath`).
       - `StudyWorkspaceScreen` displays real counts in the subtitle of each `OpenCard`:
         - `books`: `"$count book"` / `"$count books"`
         - `short-notes`: `"$count note"` / `"$count notes"`
         - `flashcards`: `"$count deck"` / `"$count decks"`
         - `question-banks`: `"$count bank"` / `"$count banks"`
         - `exams`: `"$count exam"` / `"$count exams"`
         - `life-savers`: `"$count item"` / `"$count items"`
         - Missing or 0 count: subtitle is `null` (shows nothing, G4).
    4. **Real Counts on Hub Items Rows (`HubItemListScreen.kt`):**
       - `itemCount(item)` safely parses `metaJson` (`cards` or `questions` array length).
       - Flashcards show `"$count card"` / `"$count cards"`.
       - Question banks and exams show `"$count question"` / `"$count questions"`.
       - Empty or null count shows nothing (G4).

  - **VERIFICATION:**
    - Confirmed all Kotlin brace balances across modified files:
      - `BookFileStore.kt`: diff = 0
      - `LearningContentRepository.kt`: diff = 0
      - `HubItemListScreen.kt`: diff = 0
      - `StudyWorkspaceScreen.kt`: diff = 0
    - Verified compilation (`compile_applet`) and TypeScript linting (`lint_applet` / `tsc --noEmit`) pass cleanly.

  - **RUN #295 CI ROOT CAUSE & FIX:**
    - GitHub Actions Run #295 failed during `compileReleaseJavaWithJavac`.
    - Cause: `.env.example` had its 6 values stripped to empty (`KEY=`), causing `secrets-gradle-plugin` to generate invalid Java syntax in `BuildConfig.java` (`public static final String KEY = ;`), identical to Run #7 and Run #285.
    - Fix: Restored the 6 non-empty public keys and live values in `.env.example`. Added failure entry to `docs/BUILD_PITFALLS.md`.

  - **FILES TOUCHED:**
    - `.env.example`
    - `app/src/main/java/com/wisdomtower/academy/data/content/BookFileStore.kt`
    - `app/src/main/java/com/wisdomtower/academy/data/content/LearningContentRepository.kt`
    - `app/src/main/java/com/wisdomtower/academy/ui/packages/OpenCard.kt`
    - `app/src/main/java/com/wisdomtower/academy/ui/study/HubItemListScreen.kt`
    - `app/src/main/java/com/wisdomtower/academy/ui/study/StudyWorkspaceScreen.kt`
    - `docs/BUILD_PITFALLS.md`
    - `docs/SESSION_2026-10-12_BT.md`
