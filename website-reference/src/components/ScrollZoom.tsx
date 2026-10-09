"use client";

import { useEffect } from "react";
import { isAndroidWebView } from "@/lib/native-app";

/**
 * Site-wide scroll zoom: GPU-friendly: transform + opacity only.
 * Disabled inside the native app WebView (wta-native-app) and respects reduced-motion.
 * ONLY targets explicit [data-scroll-zoom] elements to prevent any React hydration mismatches.
 */
const SELECTOR = "[data-scroll-zoom]";

function shouldSkip(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === "section" || tag === "main" || tag === "header" || tag === "footer" || tag === "nav") {
    return true;
  }
  if (el.closest("[data-scroll-zoom-skip], .infinity-card, .stat-card")) return true;
  if (
    el.closest(
      ".notes-reading-surface, .study-prose, [data-learning-content], .formatted-body"
    )
  ) {
    return true;
  }
  if (el.closest('main [class*="learning"], main article.study-prose')) return true;
  return tag === "script" || tag === "style" || tag === "link";
}

function markAndObserve(root: ParentNode, observer: IntersectionObserver) {
  const nodes = root.querySelectorAll?.(SELECTOR);
  if (!nodes || nodes.length === 0) return;
  nodes.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    if (shouldSkip(el)) return;
    if (el.dataset.szReady === "1") return;
    el.classList.add("sz-item");
    el.dataset.szReady = "1";
    observer.observe(el);
  });
}

export default function ScrollZoom() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Native app: never attach opacity traps (UA + class)
    if (isAndroidWebView()) {
      document.documentElement.classList.add("wta-native-app");
      document.body?.classList.add("wta-native-app");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    let mo: MutationObserver | null = null;
    let moTimer: ReturnType<typeof setTimeout> | null = null;

    // Delay initialization until after React hydration is completely idle
    const startTimer = setTimeout(() => {
      document.documentElement.classList.add("sz-smooth");

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const el = entry.target as HTMLElement;
            if (entry.isIntersecting) {
              el.classList.add("sz-in");
            } else {
              el.classList.remove("sz-in");
            }
          }
        },
        {
          threshold: [0, 0.08, 0.15],
          rootMargin: "-6% 0px -6% 0px",
        }
      );

      markAndObserve(document, observer);

      mo = new MutationObserver(() => {
        if (moTimer) clearTimeout(moTimer);
        moTimer = setTimeout(() => {
          if (observer) markAndObserve(document, observer);
        }, 300);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }, 600);

    return () => {
      clearTimeout(startTimer);
      if (observer) observer.disconnect();
      if (mo) mo.disconnect();
      if (moTimer) clearTimeout(moTimer);
      document.documentElement.classList.remove("sz-smooth");
    };
  }, []);

  return null;
}
