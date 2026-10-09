# Android App — Current Production Architecture

> **Updated September 2026.**  
> The production Android app is the **WebView shell** in the companion repository.  
> A pure native Jetpack Compose rewrite remains a future goal (see `NATIVE-ANDROID.md`).

## Companion repo (the actual app)

**https://github.com/hiyabteklu/Wisdom-tower-academy-app**

Read its **ARCHITECTURE.md** — it is the single source of truth for how the website and the app work together.

### Quick summary for any AI / developer

1. **Website** (this repo) = source of truth for all content, auth, packages, ownership, progress, flashcards, PDFs, questions, results.
2. **Android app** = native Compose chrome (header + bottom nav) around a WebView that loads `https://wisdom-tower-academy.live`.
3. Once a user opens material while online inside the app:
   - Pages, thumbnails, text, animations, flashcards, questions, progress UI are cached by the WebView / Service Worker.
   - PDFs / books are additionally saved into the app’s private internal storage (`OfflineVault`).
4. Offline: the user can continue studying anything they already opened and still own. Ownership is never bypassed — the website’s session + RLS still decide access.
5. Security: private storage + `FLAG_SECURE` (no screenshots of paid content). No service-role keys in the app.

## Old Capacitor notes

The original Capacitor CLI approach was retired.  
`capacitor.config.ts` in this website repo is kept only for historical reference and can be deleted later.

The current app achieves the same goal (secure shell around the live site + offline PDFs) with a cleaner Compose + WebView implementation.
