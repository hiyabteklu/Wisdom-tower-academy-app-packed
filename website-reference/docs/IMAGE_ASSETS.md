# Image & logo storage (GitHub + Vercel free + Supabase free)

## Where each kind of file goes

| Asset type | Put it here | Why |
|------------|-------------|-----|
| **Site logo, bank logos, package cards, freshman thumbs, service icons** | `public/images/...` in this GitHub repo | Served by Vercel CDN, zero Supabase storage cost, works offline in build |
| **Payment receipts (user uploads)** | Supabase Storage bucket `payment-receipts` | Already wired in code; private user content |
| **User avatars** | Usually from Google/OAuth; optional later: Supabase `avatars` bucket | Not required now |
| **Hundreds of large course photos later** | Prefer Supabase Storage bucket `media` **or** external CDN | Avoid bloating the Git repo past ~1 GB soft limit |

**Rule of thumb on free tiers**
- Keep **static marketing/UI images** in `public/` (optimize to WebP/JPEG, aim <200 KB each).
- Keep **user-generated files** in Supabase Storage.
- Do **not** commit raw 5–10 MB photos for every card.

---

## Folder map (replace placeholders by same filename)

```
public/
  images/
    brand/
      logo.svg
      logo-mark.svg
      og-cover.jpg
    banks/
      telebirr.png
      …
    packages/
      grade-9.jpg
      …
      freshman.jpg
    freshman/
      math-natural.jpg       ← 16:9 (was mathematics.jpg)
      math-social.jpg        ← NEW
      physical-fitness.jpg   ← NEW
      english-1.jpg
      physics.jpg
      psychology.jpg
      logic.jpg
      geography.jpg
      anthropology.jpg
      civics.jpg
      economics.jpg
      emerging-technology.jpg
      entrepreneurship.jpg
      global-trends.jpg
      history.jpg
      inclusiveness.jpg
      chemistry.jpg
      biology.jpg
      cpp-programming.jpg
      applied-math-1.jpg
      english-2.jpg
    services/
      …
    digital/
      …
```

URLs in the site: `/images/...` → `public/images/...`.

---

## Supabase Storage (already used)

| Bucket | Purpose |
|--------|---------|
| `payment-receipts` | Order payment screenshots/PDFs |
| `learning-content` | PDFs / files for books hub |

See also `supabase/freshman_subject_rename.sql` for scope_path migration.
