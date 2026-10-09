# Future Vision — Pure Native Jetpack Compose App

**Status (Sep 2026):** This document describes the **long-term target**, not what is shipping today.

The **current production Android app** is the WebView shell in:

→ **https://github.com/hiyabteklu/Wisdom-tower-academy-app**

See that repo’s `ARCHITECTURE.md` for the live architecture.

---

## Why a pure native rewrite is still desirable later

- Faster cold start and smoother 60 fps interactions
- Full offline-first data layer (Room + encrypted files)
- Tighter control over ownership gating without relying on WebView cookies
- Better Play Store review scores for “native feel”

## Target architecture (when we build it)

```
app/
  data/
    api/          # Supabase client (supabase-kt or ktor)
    local/        # Room + EncryptedSharedPreferences + private encrypted storage
    repository/   # Single source of truth
    model/        # Domain models matching website schema
  ui/
    theme/        # Navy/cyan Material 3
    navigation/
    screens/
      auth/
      home/
      packages/
      subjects/
      viewer/     # Notes, PDF, Flashcards, Quiz
      downloads/
  MainActivity.kt
```

### Hard rules (same as today)

1. Never invent subjects, packages, or content.
2. If a package/subject has no published rows in Supabase → honest empty / “Coming soon”.
3. Only the public anon key on the client. Never embed service-role keys.
4. All ownership checks go through `enrollments` (and verified `orders`).
5. Offline files stay in private / encrypted storage. `FLAG_SECURE` on.

Until the pure native app is ready and feature-complete, the WebView shell in `Wisdom-tower-academy-app` is the official Android client.
