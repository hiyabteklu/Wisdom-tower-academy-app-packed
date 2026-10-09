# Android Compose Build Pitfalls & Compiler Prevention Log

> **MANDATORY READING:** Every AI agent, engineer, and contributor **MUST read this document alongside `NATIVE_APP_BRIEF.md` and `ARCHITECTURE.md` before writing or modifying any Jetpack Compose code**.
> You must append a new entry to this document immediately after any failed build.

---

## Hard Rules for Android Compose Engineering

1. **Rule (a) – Verification Before Completion:** Never mark a phase, task, or prompt as "completed" unless the code has actually compiled cleanly in CI / Gradle.
2. **Rule (b) – Screen-by-Screen Cadence:** Build after every screen, committing one screen per commit to isolate failures and maintain a pristine git log.
3. **Rule (c) – Zero Deprecations & Modern APIs:** Do not use deprecated Compose APIs (especially deprecated ripple or gesture APIs). Always use the modern replacement specified by the Compose compiler and official Android Jetpack releases.
4. **Rule (d) – Real Material Icons Only:** Only use icons verified to exist in our Material Icons dependencies (`androidx.compose.material.icons.filled.*` or `androidx.compose.material.icons.automirrored.filled.*`). Never guess or copy web icon names (such as Lucide, Feather, or Heroicons like `BookOpen`).
5. **Rule (e) – Full Project Grep on Fix:** Whenever fixing a compile mistake or deprecation, grep the entire project (`app/src`) for the exact same pattern and fix every occurrence.
6. **Rule (f) – Isolate Release Configuration:** Never touch release signing, ProGuard/R8 release configs, Gradle wrapper 9.3.1, JDK 21, or workflow files to patch or work around UI compilation errors.
7. **Rule (g) – Keep the CI Pipeline Green:** Maintain a green state for the "Build Production AAB & APK" GitHub Actions workflow at all times.

---

## Build Failure Log

### 2026-10-09 – Run #5 failed (`:app:compileReleaseKotlin`)

#### Problem 1: Unresolved reference 'BookOpen'
* **Cause:** `BookOpen` was imported and referenced from web icon conventions (Lucide React from the Next.js website codebase). In Jetpack Compose Material Icons, `BookOpen` does not exist; the Material equivalent is `MenuBook` (`Icons.Default.MenuBook` / `Icons.Filled.MenuBook` or `Icons.AutoMirrored.Filled.MenuBook`).
* **Fix:** Replaced all occurrences of `BookOpen` with `MenuBook` (`import androidx.compose.material.icons.filled.MenuBook` and `Icons.Default.MenuBook`) across `AccountScreen.kt`, `GuidesScreen.kt`, and `PackagesScreen.kt`.
* **DO NOT:** **DO NOT import or guess web icon names (e.g., Lucide icon names like BookOpen) into Android Jetpack Compose code. Always verify the icon exists in Compose Material Icons.**

#### Problem 2: `rememberRipple` is deprecated and treated as a compile error
* **Cause:** `rememberRipple` from `androidx.compose.material.ripple.rememberRipple` is deprecated in modern Compose Material3 and caused compile failure during release Kotlin compilation.
* **Fix:** Replaced every usage of `rememberRipple(...)` with `ripple(...)` from `androidx.compose.material3.ripple` (or used default indication), and removed all imports of `androidx.compose.material.ripple.rememberRipple` across `WisdomComponents.kt`, `AccountScreen.kt`, `GuidesScreen.kt`, `PackageDetailScreen.kt`, `PackagesScreen.kt`, `LearningScreen.kt`, and `SettingsScreen.kt`.
* **DO NOT:** **DO NOT use `rememberRipple(...)` in Compose code. Always use `androidx.compose.material3.ripple(...)` or `LocalIndication`.**
