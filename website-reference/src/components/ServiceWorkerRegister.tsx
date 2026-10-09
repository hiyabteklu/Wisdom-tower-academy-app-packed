"use client";

import { useEffect } from "react";

/**
 * Registers the offline Service Worker and precaches the current page URL
 * so content the user opens is available offline later.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Precache current route whenever the user lands on a page
        const notify = () => {
          const urls = [window.location.href, window.location.pathname];
          reg.active?.postMessage({ type: "PRECACHE_URLS", urls });
          navigator.serviceWorker.controller?.postMessage({
            type: "PRECACHE_URLS",
            urls,
          });
        };

        if (reg.active) notify();
        else {
          reg.addEventListener("updatefound", () => {
            const sw = reg.installing;
            sw?.addEventListener("statechange", () => {
              if (sw.state === "activated") notify();
            });
          });
        }

        // Also precache on client navigations (App Router)
        const onNav = () => {
          setTimeout(notify, 500);
        };
        window.addEventListener("popstate", onNav);
        return () => window.removeEventListener("popstate", onNav);
      } catch (e) {
        console.warn("[WTA] Service worker registration failed", e);
      }
    };

    register();
  }, []);

  return null;
}
