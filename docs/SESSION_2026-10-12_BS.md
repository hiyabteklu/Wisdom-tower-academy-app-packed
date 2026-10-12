# Session log 2026-10-12 BS: Fix Run #291 compile error in QuizExamScreen.kt

> Continues `docs/SESSION_2026-10-12_BR.md`. Repo is PUBLIC: no secrets.

- 2026-10-12 | AI Studio Agent | DONE [~]: Fixed `:app:compileReleaseKotlin` failure in `QuizExamScreen.kt:208`.

  - **ROOT CAUSE OF RUN #291, #292, #293 FAILURE:**
    - Error in GitHub Actions build log:
      ```
      e: file:///home/runner/.../QuizExamScreen.kt:208:17 No value passed for parameter 'onClick'.
      e: file:///home/runner/.../QuizExamScreen.kt:208:34 Argument type mismatch: actual type is 'Function0<Unit>', but 'Modifier' was expected.
      ```
    - `ScreenBackButton` is declared as:
      `internal fun ScreenBackButton(onClick: () -> Unit, modifier: Modifier = Modifier)`
    - In Kotlin, trailing lambda syntax `ScreenBackButton { ... }` binds to the *last* parameter (`modifier: Modifier = Modifier`). Because `modifier` expects a `Modifier`, Kotlin passed the lambda to `modifier` and left `onClick` with no value.
    - Runs #292 and #293 were subsequent commits layered on top of commit `8c73b0d`, so they failed on the exact same line.

  - **WHAT WAS DONE:**
    1. In `app/src/main/java/com/wisdomtower/academy/ui/study/QuizExamScreen.kt` line 208:
       - Changed `ScreenBackButton { ... }` to `ScreenBackButton(onClick = { ... })`.
       - Explicit parameter passing ensures `onClick` correctly receives the lambda.
    2. Updated `docs/BUILD_PITFALLS.md` with the new failure log entry and prevention rule:
       - "Never use trailing lambda syntax on a composable or function where the lambda is NOT the last parameter, especially when trailing parameters have defaults (`modifier: Modifier = Modifier`). Always pass `onClick = { ... }` explicitly."
    3. Checked all 86 Kotlin files across the project:
       - Confirmed 0 other instances of `ScreenBackButton { ... }`.
       - Confirmed all 86 files have perfectly balanced braces (`diff = 0`).
    4. Verified web applet compilation (`compile_applet`) and TypeScript checks (`lint_applet` / `tsc --noEmit`) pass cleanly.

  - **FILES TOUCHED:**
    - `app/src/main/java/com/wisdomtower/academy/ui/study/QuizExamScreen.kt`
    - `docs/BUILD_PITFALLS.md`
    - `docs/SESSION_2026-10-12_BS.md`
