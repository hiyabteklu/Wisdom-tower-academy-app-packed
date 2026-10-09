/* Wisdom Tower Academy — Offline Service Worker
 *
 * Preserves user data and offline materials:
 * - Pages HTML: network-first when online, cache fallback offline
 * - Static JS/CSS: network-first when online to prevent hydration mismatch, cache fallback offline
 * - Images/thumbnails: stale-while-revalidate (permanent)
 * - Same-origin /api + supabase/appwrite GETs: cached after first success
 * - Large book PDFs: handled by app OfflineVault
 */

const CACHE_VERSION = "v6";
const PAGE_CACHE = `wta-pages-${CACHE_VERSION}`;
const STATIC_CACHE = `wta-static-${CACHE_VERSION}`;
const IMAGE_CACHE = "wta-images-permanent";
const DATA_CACHE = "wta-data-permanent";

const PRECACHE_URLS = [
  "/",
  "/learning",
  "/packages",
  "/account",
  "/academy",
  "/academy/freshman",
  "/academy/scholarships",
  "/offline",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGE_CACHE);
      await Promise.allSettled(PRECACHE_URLS.map((u) => cache.add(u).catch(() => null)));
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Purge stale page & static caches to prevent React hydration mismatches
      const keys = await caches.keys();
      for (const key of keys) {
        if (
          (key.startsWith("wta-pages-") && key !== PAGE_CACHE) ||
          (key.startsWith("wta-static-") && key !== STATIC_CACHE)
        ) {
          try {
            await caches.delete(key);
          } catch {
            /* ignore */
          }
        }
      }
      await self.clients.claim();
    })()
  );
});

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" && request.headers.get("accept")?.includes("text/html"))
  );
}

function isDevelopmentAsset(url) {
  return (
    url.pathname.includes("hot-update") ||
    url.pathname.includes("_next/webpack-hmr") ||
    url.pathname.includes("__nextjs") ||
    url.searchParams.has("ts")
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff")
  );
}

function isImage(url) {
  return (
    url.pathname.startsWith("/images/") ||
    /\.(png|jpg|jpeg|webp|gif|svg|ico)$/i.test(url.pathname)
  );
}

function isLargeBookPdf(url) {
  return url.pathname.startsWith("/api/content/pdf");
}

function isApiOrData(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase") ||
    url.hostname.includes("appwrite") ||
    url.pathname.includes("/rest/v1/")
  );
}

/** Match request across permanent caches. */
async function matchAny(request) {
  const names = [PAGE_CACHE, STATIC_CACHE, IMAGE_CACHE, DATA_CACHE];
  for (const name of names) {
    try {
      const cache = await caches.open(name);
      const hit = await cache.match(request);
      if (hit) return hit;
    } catch {
      /* ignore */
    }
  }
  // Also try pathname-only for navigations
  try {
    const url = new URL(request.url);
    const pageCache = await caches.open(PAGE_CACHE);
    const hit = await pageCache.match(url.pathname);
    if (hit) return hit;
  } catch {}
  return undefined;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
      try {
        const u = new URL(request.url);
        if (u.origin === self.location.origin) {
          cache.put(u.pathname, response.clone());
        }
      } catch {}
    }
    return response;
  } catch {
    const cached = (await cache.match(request)) || (await matchAny(request));
    if (cached) return cached;
    if (isNavigationRequest(request)) {
      const offline =
        (await cache.match("/offline")) ||
        (await caches.match("/offline")) ||
        (await matchAny(new Request("/offline")));
      if (offline) return offline;
    }
    throw new Error("offline-and-uncached");
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = (await cache.match(request)) || (await matchAny(request));
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  return cached || (await networkPromise) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  // Development assets and HMR updates must never be intercepted
  if (isDevelopmentAsset(url)) {
    return;
  }

  // Books/PDFs stay in the app Offline vault, not SW
  if (isLargeBookPdf(url)) {
    return;
  }

  if (url.origin === self.location.origin) {
    if (isNavigationRequest(request)) {
      event.respondWith(networkFirst(request, PAGE_CACHE));
      return;
    }
    // Static JS and CSS: network-first so code stays in sync with SSR HTML
    if (isStaticAsset(url)) {
      event.respondWith(networkFirst(request, STATIC_CACHE));
      return;
    }
    if (isImage(url)) {
      event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
      return;
    }
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
    return;
  }

  if (isImage(url) || request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  // Supabase / Appwrite GET responses
  if (isApiOrData(url)) {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE));
  }
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "PRECACHE_URLS" || !Array.isArray(data.urls)) return;
  event.waitUntil(
    (async () => {
      const pageCache = await caches.open(PAGE_CACHE);
      for (const u of data.urls) {
        try {
          const res = await fetch(u);
          if (res && res.ok) {
            await pageCache.put(u, res);
          }
        } catch {
          /* ignore */
        }
      }
    })()
  );
});
