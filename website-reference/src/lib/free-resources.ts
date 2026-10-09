/** Free resource pages + individual items (success stories, scholarships, admin notes). */

import {
  supabase,
  cleanCorruptAuthTokens,
  getAnonSupabaseClient,
} from "@/lib/supabase";

export type FreeResourceSlug =
  | "success-stories"
  | "study-techniques"
  | "campus-life"
  | "universities"
  | "departments"
  | "scholarships";

export type FreeResourceItemKind =
  | "success_story"
  | "university"
  | "scholarship"
  | "department"
  | "tip"
  | "general";

/** Full admin tabs: stories, scholarships, plus additive notes for hard-coded pages. */
export const FREE_RESOURCE_SLUGS: FreeResourceSlug[] = [
  "success-stories",
  "scholarships",
  "universities",
  "departments",
  "campus-life",
  "study-techniques",
];

export const ALL_FREE_RESOURCE_SLUGS: FreeResourceSlug[] = [
  "success-stories",
  "study-techniques",
  "campus-life",
  "universities",
  "departments",
  "scholarships",
];

/** Pages whose public body stays hard-coded; admin only manages additive notes. */
export const NOTE_ONLY_SLUGS: FreeResourceSlug[] = [
  "universities",
  "departments",
  "campus-life",
  "study-techniques",
];

export const FREE_RESOURCE_LABELS: Record<FreeResourceSlug, string> = {
  "success-stories": "Success Stories",
  "study-techniques": "Study Techniques notes",
  "campus-life": "Campus Life notes",
  universities: "University notes",
  departments: "Department notes",
  scholarships: "Scholarships",
};

export const PAGE_ITEM_KIND: Partial<Record<FreeResourceSlug, FreeResourceItemKind>> = {
  "success-stories": "success_story",
  scholarships: "scholarship",
  universities: "university",
  departments: "department",
  "campus-life": "general",
  "study-techniques": "tip",
};

export const EDITORIAL_SLUGS: FreeResourceSlug[] = [];

export type FreeResourcePage = {
  id: string;
  slug: FreeResourceSlug;
  title: string;
  subtitle: string | null;
  bodyMd: string;
  meta: Record<string, unknown>;
  coverPath: string | null;
  published: boolean;
  sortOrder: number;
  updatedAt: string;
};

export type FreeResourceItem = {
  id: string;
  pageSlug: FreeResourceSlug;
  kind: FreeResourceItemKind;
  title: string;
  subtitle: string | null;
  bodyMd: string;
  imagePath: string | null;
  gallery?: string[];
  externalUrl: string | null;
  deadline: string | null;
  meta: Record<string, unknown>;
  sortOrder: number;
  featured: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type FreeResourcePageInput = {
  id?: string;
  slug: FreeResourceSlug;
  title: string;
  subtitle?: string | null;
  bodyMd?: string;
  meta?: Record<string, unknown>;
  coverPath?: string | null;
  published?: boolean;
  sortOrder?: number;
  updatedBy?: string | null;
};

export type FreeResourceItemInput = {
  id?: string;
  pageSlug: FreeResourceSlug;
  kind: FreeResourceItemKind;
  title: string;
  subtitle?: string | null;
  bodyMd?: string;
  imagePath?: string | null;
  externalUrl?: string | null;
  deadline?: string | null;
  meta?: Record<string, unknown>;
  sortOrder?: number;
  featured?: boolean;
  published?: boolean;
};

function parseMeta(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function rowToPage(row: Record<string, unknown>): FreeResourcePage {
  return {
    id: String(row.id),
    slug: row.slug as FreeResourceSlug,
    title: String(row.title ?? ""),
    subtitle: row.subtitle != null ? String(row.subtitle) : null,
    bodyMd: String(row.body_md ?? ""),
    meta: parseMeta(row.meta),
    coverPath: row.cover_path ? String(row.cover_path) : null,
    published: Boolean(row.published),
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
    updatedAt: String(row.updated_at ?? ""),
  };
}

function rowToItem(row: Record<string, unknown>): FreeResourceItem {
  return {
    id: String(row.id),
    pageSlug: row.page_slug as FreeResourceSlug,
    kind: (row.kind as FreeResourceItemKind) || "general",
    title: String(row.title ?? ""),
    subtitle: row.subtitle != null ? String(row.subtitle) : null,
    bodyMd: String(row.body_md ?? ""),
    imagePath: row.image_path != null ? String(row.image_path) : null,
    externalUrl: row.external_url != null ? String(row.external_url) : null,
    deadline: row.deadline != null ? String(row.deadline) : null,
    meta: parseMeta(row.meta),
    sortOrder: typeof row.sort_order === "number" ? row.sort_order : 0,
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export async function listFreeResourcePages(): Promise<{
  items: FreeResourcePage[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("free_resource_pages")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) return { items: [], error: error.message };
    return { items: (data || []).map((r) => rowToPage(r as Record<string, unknown>)) };
  } catch (e) {
    return { items: [], error: e instanceof Error ? e.message : "Failed" };
  }
}

const FREE_CACHE_PREFIX = "wta_free_items_v1_";

function readCachedFreeItems(slug: string): FreeResourceItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${FREE_CACHE_PREFIX}${slug}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCachedFreeItems(slug: string, items: FreeResourceItem[]): void {
  if (typeof window === "undefined" || !items.length) return;
  try {
    localStorage.setItem(`${FREE_CACHE_PREFIX}${slug}`, JSON.stringify(items));
  } catch {}
}

export async function getFreeResourcePage(
  slug: FreeResourceSlug,
  opts?: { publishedOnly?: boolean }
): Promise<{ item?: FreeResourcePage; error?: string }> {
  try {
    let q = supabase.from("free_resource_pages").select("*").eq("slug", slug);
    if (opts?.publishedOnly) q = q.eq("published", true);
    let { data, error } = await q.maybeSingle();

    if (error) {
      cleanCorruptAuthTokens();
      try {
        const anon = getAnonSupabaseClient();
        let retryQ = anon.from("free_resource_pages").select("*").eq("slug", slug);
        if (opts?.publishedOnly) retryQ = retryQ.eq("published", true);
        const retryRes = await retryQ.maybeSingle();
        if (retryRes.data) {
          data = retryRes.data;
          error = null;
        }
      } catch {
        /* ignore */
      }
    }

    if (error) {
      return { error: "Unable to load page" };
    }
    if (!data) return {};
    return { item: rowToPage(data as Record<string, unknown>) };
  } catch (e) {
    cleanCorruptAuthTokens();
    return { error: "Unable to load page" };
  }
}

export async function upsertFreeResourcePage(
  input: FreeResourcePageInput
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const payload: Record<string, unknown> = {
    slug: input.slug,
    title: input.title.trim(),
    subtitle: input.subtitle ?? null,
    body_md: input.bodyMd ?? "",
    meta: input.meta ?? {},
    cover_path: input.coverPath ?? null,
    published: input.published ?? false,
    sort_order: input.sortOrder ?? 0,
    updated_by: input.updatedBy ?? null,
    updated_at: new Date().toISOString(),
  };
  if (input.id) payload.id = input.id;

  const { data, error } = await supabase
    .from("free_resource_pages")
    .upsert(payload, { onConflict: "slug" })
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id ? String(data.id) : undefined };
}

export async function listFreeResourceItems(opts: {
  pageSlug: FreeResourceSlug;
  publishedOnly?: boolean;
  kind?: FreeResourceItemKind;
}): Promise<{ items: FreeResourceItem[]; error?: string }> {
  try {
    let q = supabase
      .from("free_resource_items")
      .select("*")
      .eq("page_slug", opts.pageSlug)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (opts.publishedOnly) q = q.eq("published", true);
    if (opts.kind) q = q.eq("kind", opts.kind);
    let { data, error } = await q;

    if (error) {
      cleanCorruptAuthTokens();
      const cached = readCachedFreeItems(opts.pageSlug);
      if (cached.length) return { items: cached };

      // Retry once using isolated anonymous client without broken tokens
      try {
        const anon = getAnonSupabaseClient();
        let retryQ = anon
          .from("free_resource_items")
          .select("*")
          .eq("page_slug", opts.pageSlug)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false });
        if (opts.publishedOnly) retryQ = retryQ.eq("published", true);
        if (opts.kind) retryQ = retryQ.eq("kind", opts.kind);
        const retryRes = await retryQ;
        if (retryRes.data && retryRes.data.length > 0) {
          const mapped = retryRes.data.map((r) => rowToItem(r as Record<string, unknown>));
          writeCachedFreeItems(opts.pageSlug, mapped);
          return { items: mapped };
        }
      } catch {
        /* ignore */
      }

      return {
        items: [],
        error: "Unable to load items right now.",
      };
    }

    const items = (data || []).map((r) => rowToItem(r as Record<string, unknown>));
    if (items.length > 0) {
      writeCachedFreeItems(opts.pageSlug, items);
    } else {
      // If server returned 0 items, check if cache has items
      const cached = readCachedFreeItems(opts.pageSlug);
      if (cached.length) return { items: cached };
    }
    return { items };
  } catch (e) {
    cleanCorruptAuthTokens();
    const cached = readCachedFreeItems(opts.pageSlug);
    if (cached.length) return { items: cached };

    return {
      items: [],
      error: "Unable to load items right now.",
    };
  }
}

export async function upsertFreeResourceItem(
  input: FreeResourceItemInput
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const payload: Record<string, unknown> = {
    page_slug: input.pageSlug,
    kind: input.kind,
    title: input.title.trim(),
    subtitle: input.subtitle ?? null,
    body_md: input.bodyMd ?? "",
    image_path: input.imagePath ?? null,
    external_url: input.externalUrl ?? null,
    deadline: input.deadline ?? null,
    meta: input.meta ?? {},
    sort_order: input.sortOrder ?? 0,
    featured: input.featured ?? false,
    published: input.published ?? false,
    updated_at: new Date().toISOString(),
  };
  if (input.id) payload.id = input.id;

  const { data, error } = await supabase
    .from("free_resource_items")
    .upsert(payload)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id ? String(data.id) : undefined };
}

export async function deleteFreeResourceItem(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.from("free_resource_items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function uploadFreeResourceFile(
  path: string,
  file: File
): Promise<{ path?: string; publicUrl?: string; error?: string }> {
  if (file.size > 8 * 1024 * 1024) {
    return { error: "Max file size 8 MB" };
  }
  const { error } = await supabase.storage.from("free-resources").upload(path, file, {
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) return { error: error.message };
  const { data } = supabase.storage.from("free-resources").getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export function freeResourcePublicUrl(storagePath: string | null | undefined): string {
  if (!storagePath) return "";
  if (storagePath.startsWith("http://") || storagePath.startsWith("https://")) return storagePath;
  const { data } = supabase.storage.from("free-resources").getPublicUrl(storagePath);
  return data.publicUrl;
}

/** Published notes for a hard-coded page, optionally filtered by meta key (e.g. universityId). */
export async function listPublishedNotes(opts: {
  pageSlug: FreeResourceSlug;
  metaKey?: string;
  metaValue?: string;
}): Promise<FreeResourceItem[]> {
  const { items } = await listFreeResourceItems({
    pageSlug: opts.pageSlug,
    publishedOnly: true,
  });
  if (!opts.metaKey) return items;
  return items.filter(
    (it) => String(it.meta?.[opts.metaKey!] ?? "") === String(opts.metaValue ?? "")
  );
}
