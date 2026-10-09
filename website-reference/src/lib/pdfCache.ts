/**
 * Durable PDF cache:
 * 1. In-memory Map for instant re-renders during the active session.
 * 2. CacheStorage ("wta-pdf-books-v1") so downloaded books remain accessible
 *    completely offline across app restarts without relying on in-memory state alone.
 */

const memoryCache = new Map<string, ArrayBuffer>();
const MAX_MEMORY_ENTRIES = 8;
const PDF_CACHE_NAME = "wta-pdf-books-v1";

export function getCachedPdf(key: string): ArrayBuffer | undefined {
  return memoryCache.get(key);
}

export function setCachedPdf(key: string, data: ArrayBuffer) {
  if (memoryCache.size >= MAX_MEMORY_ENTRIES && !memoryCache.has(key)) {
    const oldest = memoryCache.keys().next().value;
    if (oldest != null) memoryCache.delete(oldest);
  }
  memoryCache.set(key, data);
}

/** Read from persistent CacheStorage if available */
async function getPersistentPdf(url: string): Promise<ArrayBuffer | null> {
  if (typeof window === "undefined" || !("caches" in window)) return null;
  try {
    const cache = await caches.open(PDF_CACHE_NAME);
    const hit = await cache.match(url);
    if (hit && hit.ok) {
      const buf = await hit.arrayBuffer();
      if (buf && buf.byteLength > 0) {
        setCachedPdf(url, buf);
        return buf;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Store in persistent CacheStorage */
async function setPersistentPdf(url: string, res: Response): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;
  try {
    const cache = await caches.open(PDF_CACHE_NAME);
    await cache.put(url, res);
  } catch {
    /* quota */
  }
}

/**
 * Fetch a PDF (or return a cached copy).
 * Optional onProgress(loaded, total) — total may be null when Content-Length is missing.
 */
export async function fetchPdfCached(
  url: string,
  onProgress?: (loaded: number, total: number | null) => void
): Promise<ArrayBuffer> {
  // 1. In-memory hit
  const memHit = getCachedPdf(url);
  if (memHit) {
    onProgress?.(memHit.byteLength, memHit.byteLength);
    return memHit.slice(0);
  }

  // 2. Persistent storage hit
  const diskHit = await getPersistentPdf(url);
  if (diskHit) {
    onProgress?.(diskHit.byteLength, diskHit.byteLength);
    return diskHit.slice(0);
  }

  // 3. Online fetch
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not load PDF (${res.status})`);

    // Clone for persistent CacheStorage storage
    void setPersistentPdf(url, res.clone());

    const contentLength = res.headers.get("Content-Length");
    const total = contentLength ? parseInt(contentLength, 10) : null;
    const body = res.body;

    if (!body || !onProgress) {
      const buf = await res.arrayBuffer();
      setCachedPdf(url, buf);
      onProgress?.(buf.byteLength, buf.byteLength);
      return buf.slice(0);
    }

    const reader = body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.byteLength;
        onProgress(loaded, total && Number.isFinite(total) ? total : null);
      }
    }

    const buf = new Uint8Array(loaded);
    let offset = 0;
    for (const chunk of chunks) {
      buf.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const ab = buf.buffer;
    setCachedPdf(url, ab);
    onProgress(loaded, loaded);
    return ab.slice(0);
  } catch (err) {
    // If online fetch failed, double check persistent cache
    const fallback = await getPersistentPdf(url);
    if (fallback) {
      onProgress?.(fallback.byteLength, fallback.byteLength);
      return fallback.slice(0);
    }
    throw new Error(
      "Offline — open this book once while connected to save it for offline reading."
    );
  }
}
