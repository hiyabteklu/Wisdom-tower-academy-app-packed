# Extending the catalog (subjects, packages, hubs)

**Last updated:** 2026-09-18

## What points where

| Kind of content | Where it lives | Appwrite? |
|-----------------|----------------|-----------|
| Package prices, grants, users | **Supabase** | No |
| Book / file **bytes** (PDF) | **Appwrite** Storage | Yes — `storage_path = appwrite:FILE_ID` |
| Book **title / publish / order** | Supabase `learning_resources` | Path only |
| Short notes (markdown text) | Supabase `body_md` | No file needed |
| Flashcards / quizzes / exams JSON | Supabase `meta` | No file needed |
| Optional video **file** upload | Appwrite | Yes if you upload a file |

**Catalog UI** (what students browse) comes from code data files + admin content rows. It does **not** “point to Appwrite” for titles — only PDF bytes do.

Admin label “Appwrite” means: *if this hub uploads a file, it goes to Appwrite*. JSON/markdown hubs still save into Supabase.

---

## Add a freshman subject

1. Edit `src/data/freshman.ts` — add `{ id, name, description, image }`.
2. Put cover image at `public/images/freshman/{id}.jpg`.
3. Redeploy.
4. Admin → Freshman → new subject → Books → paste Appwrite File IDs as usual.

Admin tree is built from `freshmanSubjects` automatically.

---

## Add a special package (e.g. IT Year 1 S1 + S2)

1. Edit `src/data/special-packages.ts` — copy the ECE block pattern:
   - package `id` / `slug` / `name`
   - each semester: `id`, `packageId` (must match catalog/payment package id), `courses[]`
2. Add course images under `public/images/special-packages/`.
3. Register the `packageId` in your **packages / catalog / payment** tables (same as ECE) so unlock works.
4. Redeploy.
5. Admin → Special packages → new courses → hubs → upload content.

**Scope paths** for special packages today look like `ece/{semesterId}/{courseSlug}`.  
If you add IT, either:

- reuse the same shape with new semester ids, or  
- introduce `it/sem-1/...` — **file uploads still go to Appwrite** (`scopeUsesAppwrite` is true for any non-empty scope).

---

## Add a grade subject

1. `src/data/grade-subjects.ts`
2. Images if needed
3. Admin tree updates from that data

---

## Add a new hub (e.g. rich “Solutions” with markdown + images)

Hubs are listed in `src/data/academy.ts` → `resourceHubs`.

Today’s hubs:

- **books** → PDF file (Appwrite)
- **short-notes** → markdown in DB (Amharic OK; images via `![alt](https://...)` URLs)
- **flashcards / question-banks / exams** → JSON in `meta` (DB)

For **exam solutions with Amharic + images**, preferred approach **without new code**:

1. Use **Short notes** or put markdown (with image URLs) inside exam `solution` fields in JSON.
2. Host images on Appwrite (public file URL) or `/public` and paste the URL in markdown.

To add a **real new hub** (e.g. `solutions`):

1. Add to `ResourceType` / `HubId` in `academy.ts` + `content.ts`.
2. Add entry in `resourceHubs` + `HUB_CONTENT_DEFAULTS` in `admin-nav.ts`.
3. Wire student UI page that renders markdown (reuse `NotesViewer`).
4. Deploy.

Until that is done, **short-notes + image URLs** is the supported rich text path.

---

## Future packages checklist

1. Data file (freshman / special / grade subjects)
2. Package id in payments/catalog
3. Deploy website
4. Appwrite upload PDFs → paste File ID in admin
5. Publish

No storage rewire required — Appwrite is default for all learning scopes.
