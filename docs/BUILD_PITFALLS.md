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
8. **Rule (h) – Zero Secrets in BuildConfig / Non-Empty .env.example:** Never add a secret to .env.example or BuildConfig; empty .env.example values break the Java build. Only public, non-empty values may exist in .env.example. All secrets stay strictly on the website server or as GitHub Actions signing secrets read via `System.getenv`.

---

## Build Failure Log

### 2026-10-09 – Run #7 failed (`compileReleaseJavaWithJavac`)

#### Problem: Secrets in `.env.example` and empty values breaking `BuildConfig.java`
* **Cause:** `.env.example` contained server environment variables (`SUPABASE_SERVICE_ROLE_KEY`, `FIREBASE_PRIVATE_KEY`, `GROQ_API_KEY`, `TWILIO_AUTH_TOKEN`, `RESEND_API_KEY`, etc.) from the website. The `secrets-gradle-plugin` transforms every entry in `.env.example` into a `BuildConfig` field. Empty values (`KEY=`) generated invalid Java syntax (`String KEY = ;`), causing `compileReleaseJavaWithJavac` to fail. Even if non-empty, secrets would be compiled into the release APK, creating a security violation.
* **Fix:**
  1. Pruned `.env.example` to strictly the 6 public keys with non-empty live values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APPWRITE_ENDPOINT`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID`, and `NEXT_PUBLIC_APPWRITE_BUCKET_ID`.
  2. Deleted all server secrets and signing keys from `.env.example`. Keystore signing keys remain exclusively in GitHub Actions secrets read via `System.getenv`.
  3. Replaced deprecated `Icons.Filled.MenuBook`, `Icons.Filled.TrendingUp`, and `Icons.Filled.Assignment` with modern `Icons.AutoMirrored.Filled.*` across all UI screens.
  4. Fixed nullable String mismatch warnings in `AuthStateManager.kt` and `AcademyRepository.kt` by introducing safe `optNullableString` parser extensions on `JSONObject`.
* **DO NOT:** **Never add a secret to .env.example or BuildConfig; empty .env.example values break the Java build.**

### 2026-10-09 – Run #5 failed (`:app:compileReleaseKotlin`)

#### Problem 1: Unresolved reference 'BookOpen'
* **Cause:** `BookOpen` was imported and referenced from web icon conventions (Lucide React from the Next.js website codebase). In Jetpack Compose Material Icons, `BookOpen` does not exist; the Material equivalent is `MenuBook` (`Icons.Default.MenuBook` / `Icons.Filled.MenuBook` or `Icons.AutoMirrored.Filled.MenuBook`).
* **Fix:** Replaced all occurrences of `BookOpen` with `MenuBook` (`import androidx.compose.material.icons.filled.MenuBook` and `Icons.Default.MenuBook`) across `AccountScreen.kt`, `GuidesScreen.kt`, and `PackagesScreen.kt`.
* **DO NOT:** **DO NOT import or guess web icon names (e.g., Lucide icon names like BookOpen) into Android Jetpack Compose code. Always verify the icon exists in Compose Material Icons.**

#### Problem 2: `rememberRipple` is deprecated and treated as a compile error
* **Cause:** `rememberRipple` from `androidx.compose.material.ripple.rememberRipple` is deprecated in modern Compose Material3 and caused compile failure during release Kotlin compilation.
* **Fix:** Replaced every usage of `rememberRipple(...)` with `ripple(...)` from `androidx.compose.material3.ripple` (or used default indication), and removed all imports of `androidx.compose.material.ripple.rememberRipple` across `WisdomComponents.kt`, `AccountScreen.kt`, `GuidesScreen.kt`, `PackageDetailScreen.kt`, `PackagesScreen.kt`, `LearningScreen.kt`, and `SettingsScreen.kt`.
* **DO NOT:** **DO NOT use `rememberRipple(...)` in Compose code. Always use `androidx.compose.material3.ripple(...)` or `LocalIndication`.**

### 2026-10-09 – Phase C failed (`:app:compileReleaseKotlin`)

#### Problem: Unresolved references 'packagePath' and 'WisdomOpenButton' in `AccountScreen.kt`
* **Cause:** `AccountScreen.kt` referenced `pass.packagePath` on `EnrolledPackageRecord` (which was not a property on the model) and used `WisdomOpenButton` without importing it from `com.wisdomtower.academy.ui.theme.WisdomOpenButton`.
* **Fix:**
  1. Imported `WisdomOpenButton` from `com.wisdomtower.academy.ui.theme.WisdomOpenButton`.
  2. Imported `CATALOG_PACKAGES` from `com.wisdomtower.academy.ui.packages.CATALOG_PACKAGES` and derived `targetPath` from the existing catalog `path` (matching `href` from `website-reference/src/data/packages.ts`) for enrolled pass navigation.
  3. Grepped the entire `app/src` repository to confirm zero remaining references to `packagePath` or missing `WisdomOpenButton` imports.
* **DO NOT:** **Phase C: AccountScreen used packagePath and WisdomOpenButton that did not exist. Never reference a property or composable you have not defined or grepped for.**

