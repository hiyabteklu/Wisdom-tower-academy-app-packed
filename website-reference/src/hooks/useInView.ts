"use client";

import { useEffect, useRef, useState } from "react";

function isElementInViewport(el: HTMLElement, rootMarginBottom = 40) {
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  // Match observer rootMargin roughly: still count as visible if mostly on screen
  return rect.top < vh - rootMarginBottom && rect.bottom > 0;
}

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit & { /** Force visible immediately (above-the-fold) */ eager?: boolean }
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(Boolean(options?.eager));
  const threshold = options?.threshold ?? 0.15;
  const rootMargin = options?.rootMargin ?? "0px 0px -24px 0px";
  const eager = options?.eager ?? false;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setInView(true);
      return;
    }

    if (eager) {
      setInView(true);
      return;
    }

    // Sync check: client navigations often mount already in viewport
    if (isElementInViewport(el)) {
      setInView(true);
      return;
    }

    let done = false;
    const mark = () => {
      if (done) return;
      done = true;
      setInView(true);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          mark();
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);

    // Safety net: never leave content stuck at opacity 0
    const fallback = window.setTimeout(() => {
      if (isElementInViewport(el) || el.getBoundingClientRect().top < window.innerHeight) {
        mark();
      }
    }, 400);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, [threshold, rootMargin, eager]);

  return { ref, inView };
}
