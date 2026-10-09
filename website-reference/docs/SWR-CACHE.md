# Client SWR Cache Architecture — Wisdom Tower Academy

## Overview
To eliminate blank loading spinners and layout shift when students navigate between pages (`Home` -> `Learning` -> `Packages` -> `Home`) and to provide instantaneous paint inside the Android WebView, a lightweight, zero-dependency SWR (Stale-While-Revalidate) cache is implemented in:
- `src/lib/swr-cache.ts` (storage & invalidation primitives)
- `src/hooks/useCachedQuery.ts` (React consumer hook)

---

## Cache Hierarchy & Read Priority
When a query is mounted, data is resolved in the following priority order:
1. **Layer 1: In-Memory Map** (`memoryCache`)
   - Survives client-side route transitions instantly (0ms latency, synchronous on initial render).
2. **Layer 2: `localStorage`** (`wta-swr:v1:*`)
   - Read in a layout effect to survive full browser reloads and app restarts without hydration mismatch.
3. **Layer 3: `initialData` Fallback**
   - Synchronous static defaults passed by the caller (e.g. `getStaticSellablePackages()`).

### `isLoading` vs `isRevalidating`
- `isLoading` is `true` **ONLY** when there is no data at all from any layer (first-ever visit with no cache and no static fallback).
- When cached or static data is present, `isLoading` is `false` immediately, and `isRevalidating` indicates silent background fetching.
- Deep equality check (`JSON.stringify` or custom `isEqual`): if fresh data matches cached data, state is unchanged to avoid re-renders or DOM repainting.
- Offline/Network error resilience: network errors or `{ rows: [], error: "..." }` never wipe or replace good cached data.

---

## Key Naming Conventions
Cache keys follow a structured, namespaced pattern:

| Scope | Key Pattern | Example | Notes |
|-------|-------------|---------|-------|
| `public` | `pub:<resource>:<id>` | `catalog:sellable` | Shared across users, survives logout. |
| `public` | `pub:leaderboard:<scope>` | `leaderboard:freshman` | Public student scores. |
| `public` | `pub:hub-counts:<path>` | `hub-counts:freshman/mathematics` | Counts of books/notes/exams. |
| `public` | `pub:hub-content:<scope>:<hub>` | `hub-content:freshman/math:books` | Resources inside a hub. |
| `user` | `usr:<userId>:<resource>` | `profile:me` | Scoped to current authenticated user. |
| `user` | `usr:<userId>:orders:mine` | `orders:mine` | Student orders and verification receipts. |
| `user` | `usr:<userId>:notifications:*` | `notifications:list` | Personal student notifications. |

---

## Mutation & Invalidation Rules
Whenever data is mutated, the corresponding cache keys MUST be invalidated via `invalidate(key | prefix)`:

1. **Catalog Mutations (`src/lib/catalog.ts`)**:
   - `upsertCatalogItem()` -> `invalidate("catalog:sellable")`, `invalidate("catalog:all")`
   - `deleteCatalogItem()` -> `invalidate("catalog:sellable")`, `invalidate("catalog:all")`
2. **Order & Purchase Mutations (`src/lib/orders.ts`)**:
   - `createManualOrder()` -> `invalidate("orders:mine")`, `invalidate("notifications:list")`
   - `verifyOrder()` -> `invalidate("orders:mine")`, `invalidate("notifications:list")`, `invalidate("ownership")`
   - `rejectOrder()` -> `invalidate("orders:mine")`, `invalidate("notifications:list")`
3. **Profile Updates (`src/app/settings/page.tsx` & `src/lib/profile.ts`)**:
   - `updateFullProfile()` -> `invalidate("profile:me")`, `invalidate("profile")`

---

## Logout Wipe & Privacy
Security and privacy rules enforced:
- **`clearAllSwrCache()`** is executed on `SIGNED_OUT` auth events (`AuthProvider.tsx`), inside `/logout` (`src/app/logout/page.tsx`), and on account page sign-out (`src/app/account/page.tsx`).
- It purges the entire in-memory Map, in-flight request pool, and all `wta-swr:v1:*` localStorage records.
- User-scoped queries (`scope: "user"`) embed the active user ID (`usr:<userId>:...`), preventing cross-user data leakage on shared devices or after account switching.
- Sensitive credentials (tokens, passwords, payment credentials) are never stored in the SWR cache.

---

## Background & Bridge Revalidation
- **Visibility changes (`visibilitychange`)**: revalidates stale queries when tab is focused.
- **Network reconnection (`online`)**: automatically triggers revalidation.
- **Top Refresh Button & Native Shell (`wta-refresh` CustomEvent)**: triggers immediate forced refresh across all mounted hooks.
- **In-flight Deduplication**: multiple components requesting the same key share a single promise, with a minimum 3-second throttle against refetch storms.
