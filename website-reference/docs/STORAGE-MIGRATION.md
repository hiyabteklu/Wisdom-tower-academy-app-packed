# Storage migration — Appwrite for all learning PDFs

**Last updated:** 2026-09-18  
**Status:** Rewire complete in code. Owner uploading ~30 freshman + special PDFs into Appwrite, then linking File IDs in admin.

---

## Goal (this year, no paid Supabase/Vercel)

Keep **Supabase free** for auth, orders, unlocks, and `learning_resources` rows.  
Put **all heavy files (PDFs)** on **Appwrite** (GitHub Student Education plan) so free Supabase **5 GB egress** is not burned by textbook downloads.

Do **not** migrate auth or SQL catalog off Supabase this year.

---

## Architecture (current)

| Data | Where |
|------|--------|
| Users, sessions, payments, package grants | **Supabase** |
| Content metadata (`learning_resources` title, hub, scope, publish) | **Supabase** |
| Progress / exams attempts | **Supabase** |
| PDF bytes (and other uploaded files) | **Appwrite Storage** |
| Website host | **Vercel** (Hobby until paid next year) |
| Android app | WebView shell → live site (`Wisdom-tower-academy-app`) |

File reference in DB:

```text
storage_path = "appwrite:FILE_ID"
```

Implemented in `src/lib/content.ts` (`APPWRITE_PATH_PREFIX`, `uploadLearningFile`, `getSignedContentUrl`).

---

## Code rewire (done 2026-09-18)

`scopeUsesAppwrite()` is true for:

- `grade/...` (Grades 9–12) — already
- `freshman/...` — **now**
- `ece/...` (special packages) — **now**

Admin tree marks all those nodes `useAppwrite: true` (`src/data/admin-nav.ts`).

Admin UI shows **Appwrite File ID** field on Books (and file hubs) for every package — same flow as Grade 9 trial books.

---

## Owner workflow (in progress)

1. Upload each PDF in **Appwrite Console → Storage → bucket → Create file**.  
2. Copy **File ID**.  
3. Admin → correct package → subject → **Books** → Add/Edit item → paste File ID → Save / Publish.  
4. After all links work for students, **delete old copies from Supabase Storage** (`learning-content` bucket) so egress stays low.  
5. Optional: edit old rows that still have a non-`appwrite:` `storage_path` and point them to the new File ID.

Rough volume: **~30 PDFs** on freshman + special packages. Other hubs may be empty; books hubs everywhere are rewired for future uploads.

Large files (> ~4 MB): **must** use Console + paste File ID (Vercel request body limit on `/api/storage/upload`).

---

## What agents must not do

- Do not move auth or `learning_resources` tables to Appwrite without an explicit migration project.  
- Do not re-enable Supabase Storage as the default for `freshman/` or `ece/` scopes.  
- Do not replace working admin forms with placeholders.  
- Do not assume Appwrite replaces “paste SQL on Supabase” for schema — SQL stays on Supabase.

---

## Env (see `.env.example`)

```text
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
APPWRITE_BUCKET_ID=
APPWRITE_API_KEY=
```

---

## Related

- `docs/AGENT-NOTES.md` — broader product rules  
- App repo `ARCHITECTURE.md` — Android shell  
- Admin: Content library panel (`ContentPanel.tsx`)
