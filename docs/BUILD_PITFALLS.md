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
9. **Rule (i) – Gradle Kotlin scripts (`*.gradle.kts`):** never write a fully qualified `java.xxx` name (e.g. `java.io.File`, `java.net.URI`) inside a build script: `java` there is the project's `java` extension. Use `import java.io.File` at the top of the file and write `File(...)`.

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

### 2026-10-10 – Phase D: Bottom Navigation Bounce-Back & `priceEtb` Cleanup

#### Problem 1: Bottom Navigation tab switching bounce-back & blinking
* **Cause:** Bottom navigation tabs (Home, Learning, Packages, Account, Settings) are native Jetpack Compose screens. When a user tapped a tab in `AliveBottomNav`, `navigateTo(item.url, index)` triggered a background WebView `loadUrl(...)`. Subsequent web routing callbacks (`handleOnPageReady`, `onPageStarted`, `onPageCommitVisible`, `onPageFinished`, `doUpdateVisitedHistory`, `onRouteChanged`) called `selectedIndex = tabIndexForUrl(...)`, which overwrote the active tab whenever Next.js executed client-side redirects or loaded cached paths.
* **Fix:**
  1. Made `selectedIndex` in Compose the authoritative single source of truth for native tab selection.
  2. In `AliveBottomNav.onItemSelected`, updated `selectedIndex = index` immediately without triggering background WebView URL loads.
  3. Guarded all WebView URL listeners (`handleOnPageReady`, `onRouteChanged`, `onPageStarted`, `onPageCommitVisible`, `onPageFinished`, `doUpdateVisitedHistory`) with `if (activeStudyUrl != null)`. Web events never mutate `selectedIndex` while the user is browsing native Compose screens.
* **DO NOT:** **Never allow background WebView page lifecycle callbacks to mutate native Jetpack Compose tab indices (`selectedIndex`). Keep native navigation state decoupled from web navigation.**

#### Problem 2: Unresolved reference `priceEtb` in `AcademyRepository.kt`
* **Cause:** When moving to 100% free academic access, `priceEtb` was removed from `NativePackage` in `PackagesData.kt`. However, `AcademyRepository.kt` lines 48 & 51 still attempted to access `existing.priceEtb` and `existing.copy(priceEtb = price)`.
* **Fix:** Replaced the price parsing block in `AcademyRepository.kt` to filter by active status (`if (active) map[id] = existing else map.remove(id)`) without referencing `priceEtb`. Grepped `app/src` to guarantee 0 remaining references to `priceEtb`.
* **DO NOT:** **When removing a data model field, always grep the entire codebase (`app/src`) to verify all repositories, serializers, and UI components are updated simultaneously.**
### 2026-10-10 – Run #13 failed (`:app:compileReleaseKotlin`)

#### Problem 1: Unresolved reference 'handleGlobalNav' in `MainActivity.kt` (line 3705)
* **Cause:** `handleGlobalNav` was declared inside the inner `AndroidView` body of `Scaffold`'s content lambda (around line 2827). When the drawer slide-out menu composable (`AnimatedVisibility` at line 3492) attempted to invoke `handleGlobalNav(link.url)` in `overflowMenuLinks.forEach`, it was outside the lexical scope of `handleGlobalNav`.
* **Fix:** Hoisted `handleGlobalNav` up to the top level of `MainScreen` (before `Scaffold`), making it universally accessible to both the main content tabs and the drawer navigation menu without duplicate routers.
* **DO NOT:** **Never define global or shared navigation lambdas/handlers inside nested view composable closures (`AndroidView`, inner `Box`). Declare them at the root composable scope so all sub-views, side sheets, and drawers can access them.**

#### Problem 2: Unresolved reference 'Sparkles' in `AccountScreen.kt` and 'Brain' in `GuidesScreen.kt`
* **Cause:** `Sparkles` and `Brain` were copied from web icon sets (Lucide React / Feather from the Next.js website reference) and imported as `androidx.compose.material.icons.filled.Sparkles` and `androidx.compose.material.icons.filled.Brain`. Neither exists in Android Jetpack Compose Material Icons (core or extended).
* **Fix:** Removed the invalid icon imports (`Sparkles` from `AccountScreen.kt` and `Brain` from `GuidesScreen.kt`), which were unused imports in both files. When sparkle or brain icons are needed in UI, Compose Material equivalents like `Icons.Filled.AutoAwesome` (for sparkles) and `Icons.Filled.Psychology` (for brain) from `material-icons-extended` must be used.
* **DO NOT:** **Never import Lucide/web icon names into Jetpack Compose. Always verify the exact name exists in `androidx.compose.material.icons` before importing.**

#### Problem 3: Argument type mismatch for `items(faqItems)` and missing `component1()`/`component2()` destructuring in `DrawerScreens.kt` (lines 543)
* **Cause:** `DrawerScreens.kt` invoked `items(faqItems) { (q, a) -> ... }` in `LazyColumn`, but did not import `androidx.compose.foundation.lazy.items`. Without this extension function, Kotlin resolved `items` to the overload taking `count: Int`, causing type mismatch (`actual 'List<Pair<String, String>>', expected 'Int'`) and complaining that `Int` cannot be destructured into `(q, a)`.
* **Fix:** Added `import androidx.compose.foundation.lazy.items` to `DrawerScreens.kt`.
* **DO NOT:** **When passing a List or Collection to `items(...)` in a `LazyColumn` or `LazyRow`, always import `androidx.compose.foundation.lazy.items`. Do not assume it is part of `LazyColumn` or wildcard foundation imports.**

#### Problem 4: Unresolved reference 'AnimatedVisibility' in `DrawerScreens.kt` (line 562)
* **Cause:** `DrawerScreens.kt` used `AnimatedVisibility(visible = open)` to expand/collapse FAQ answers without importing `androidx.compose.animation.AnimatedVisibility`.
* **Fix:** Added `import androidx.compose.animation.AnimatedVisibility` to `DrawerScreens.kt`.
* **DO NOT:** **Always import `androidx.compose.animation.AnimatedVisibility` explicitly when animating visibility in Compose composables.**

### 2026-10-11 – CI failed after `b6e4e33` (`:app:compileReleaseKotlin`)

#### Problem: Unresolved reference 'clickable' in `PdfReaderScreen.kt` (line 143)
* **Cause:** `Modifier.clickable { ... }` was used in the Retry button of `PdfReaderScreen.kt` without `import androidx.compose.foundation.clickable`. `clickable` is an extension function on `Modifier`, so it is NOT found without its own import, even when other `androidx.compose.foundation.*` imports are present. Kotlin printed only this one error, so the rest of the file (and the other two files of that commit, `HubItemListScreen.kt`, `BookFileStore.kt`) compiled.
* **Fix:** Added `import androidx.compose.foundation.clickable` (commit `f95656c6`). Rule (e) grep: all 15 files in `app/src` that use `.clickable` now import it.
* **DO NOT:** **Every Modifier extension (`clickable`, `background`, `border`, `padding`, `size`, `fillMaxWidth`, `aspectRatio`, `clip` ...) needs its own import. After writing a composable file, check each `Modifier.xxx` you used against the import list before committing.**

### 2026-10-11 – CI failed after `1245519` (N6 part 3, `app/build.gradle.kts` script compilation, BEFORE any Kotlin app code compiled)

#### Problem: `Unresolved reference 'io'` / `'net'` in `build.gradle.kts` lines 172-179 (task `fetchKatex`)
* **Cause:** the new task wrote `java.io.File(outDir, name)` and `java.net.URI(...)`. Inside a Gradle Kotlin build script the bare name `java` is the project's `java` extension (accessor), not the root package, so `java.io` / `java.net` do not resolve. The other 4 errors (`TRY_CALL`, `Cannot infer type for 'T'/'R'` on `.use { }`) were knock-on errors of the same two lines. The build stopped at "Configure project :app" in 12 s, so NONE of the Kotlin code since `f95656c6` (N6 parts 1 and 2: `NotesReaderScreen`, notes page) was compiled by that run.
* **Fix:** `import java.io.File` and `import java.net.URI` at the top of the script and `File(...)` / `URI(...)` in the task (commit `8f38297c`). `import java.util.Base64` already worked because imports are resolved before the script body.
* **DO NOT:** **Rule (i): never write a fully qualified `java.*` name inside a `*.gradle.kts` file; import it. Also: a red build that stops at "Configure project" means the app code was not compiled at all, so the next green/red run is the first test of everything committed since the last good build.**

### 2026-10-12 – Run #291 failed (`:app:compileReleaseKotlin`)

#### Problem: `No value passed for parameter 'onClick'` / `Argument type mismatch` in `QuizExamScreen.kt` (line 208)
* **Cause:** `ScreenBackButton` is defined as `internal fun ScreenBackButton(onClick: () -> Unit, modifier: Modifier = Modifier)`. In Kotlin, trailing lambda syntax (`Foo { ... }`) only binds to the *last* parameter of the function. Because the last parameter was `modifier: Modifier = Modifier`, calling `ScreenBackButton { ... }` passed the lambda to `modifier` instead of `onClick`, leaving `onClick` without a value and causing a type mismatch on `modifier`.
* **Fix:** Called `ScreenBackButton(onClick = { ... })` explicitly with named parameter syntax so `onClick` receives the lambda cleanly.
* **DO NOT:** **Never use trailing lambda syntax on a composable or function where the lambda is NOT the last parameter, especially when trailing parameters have defaults (`modifier: Modifier = Modifier`). Always pass `onClick = { ... }` explicitly.**

### 2026-10-12 – Run #295 failed (`compileReleaseJavaWithJavac`)

#### Problem: Empty values in `.env.example` breaking `BuildConfig.java` syntax
* **Cause:** Commit `ccbc7799e194572b2fa6c8921c2fa6e4182e069d` inadvertently stripped the values of the 6 public keys in `.env.example`, leaving them empty (`NEXT_PUBLIC_APPWRITE_BUCKET_ID=`, etc.). The `secrets-gradle-plugin` transforms every entry in `.env.example` into a `BuildConfig` field. Empty entries generate invalid Java syntax (`public static final String NEXT_PUBLIC_APPWRITE_BUCKET_ID = ;`), causing `compileReleaseJavaWithJavac` to fail with syntax errors (identical to Run #7 and Run #285).
* **Fix:** Restored the 6 public non-empty keys and live values in `.env.example`.
* **DO NOT:** **Rule (h) & Rule 12: Never empty out `.env.example` keys or push empty values. `.env.example` must strictly preserve the 6 public, non-empty live keys (`NEXT_PUBLIC_*`).**
