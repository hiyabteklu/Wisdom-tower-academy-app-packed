"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { structuralParent, normalizePath } from "@/lib/nav-parent";
import { isAndroidWebView } from "@/lib/native-app";

declare global {
  interface Window {
    __wtaStructuralBack?: () => boolean;
    __wtaHardRefresh?: () => void;
    __wtaInPageBack?: () => boolean;
    __wtaNavigate?: (path: string) => boolean;
  }
}

/**
 * Exposes structural back, navigation hook, and page-ready events for the Android WebView.
 * - window.__wtaNavigate(path): executes router.push(path) and returns true
 * - 'wta-navigate' CustomEvent: { detail: { path, url } } triggers router.push
 * - 'wta-page-ready' CustomEvent: fires after usePathname changes + two requestAnimationFrame calls
 */
export default function StructuralBackBridge() {
  const pathname = usePathname();
  const router = useRouter();

  // 1. Fire 'wta-page-ready' after route change completes + two animation frames for DOM settle
  useEffect(() => {
    let raf1: number | null = null;
    let raf2: number | null = null;

    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        try {
          const detail = {
            path: pathname || "/",
            url: typeof window !== "undefined" ? window.location.href : pathname || "/",
            at: Date.now(),
          };
          window.dispatchEvent(new CustomEvent("wta-page-ready", { detail }));

          // Notify native Android bridge directly if present
          const bridge = (window as any).AndroidBridge || (window as any).Android;
          if (bridge && typeof bridge.onPageReady === "function") {
            bridge.onPageReady(pathname || "/");
          }
        } catch {
          /* ignore */
        }
      });
    });

    return () => {
      if (raf1 !== null) cancelAnimationFrame(raf1);
      if (raf2 !== null) cancelAnimationFrame(raf2);
    };
  }, [pathname]);

  // 2. Setup navigation and back bridges
  useEffect(() => {
    isAndroidWebView();

    // Clean navigation hook called by native Android app shell
    window.__wtaNavigate = (targetPath: string) => {
      try {
        if (typeof targetPath === "string" && targetPath.trim()) {
          router.push(targetPath.trim());
          return true;
        }
      } catch (err) {
        console.warn("[__wtaNavigate] Navigation error:", err);
      }
      return false;
    };

    // Custom event listener for 'wta-navigate' { detail: { path, url } }
    const onWtaNavigateEvent = (e: Event) => {
      try {
        const customEvent = e as CustomEvent<{ path?: string; url?: string }>;
        const dest = customEvent.detail?.path || customEvent.detail?.url;
        if (dest && typeof dest === "string") {
          router.push(dest.trim());
        }
      } catch (err) {
        console.warn("[wta-navigate] Event navigation error:", err);
      }
    };
    window.addEventListener("wta-navigate", onWtaNavigateEvent);

    window.__wtaStructuralBack = () => {
      try {
        // 1. If an opened note/flashcard/item is active in-page, step back to the list level first
        if (typeof window !== "undefined" && window.__wtaInPageBack) {
          const handled = window.__wtaInPageBack();
          if (handled) return true;
        }

        const fullPath =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : pathname || "/";

        const path = normalizePath(pathname || window.location.pathname || "/");

        // Return false ONLY at true root ("/")
        if (path === "/" || path === "") {
          return false;
        }

        // Structural parent evaluation
        const parent = structuralParent(fullPath);
        if (!parent || parent === fullPath || parent === path) {
          if (path !== "/") {
            const upOne = structuralParent(path);
            if (upOne && upOne !== path) {
              router.push(upOne);
              return true;
            }
            router.push("/");
            return true;
          }
          return false;
        }

        router.push(parent);
        return true;
      } catch {
        return false;
      }
    };

    window.__wtaHardRefresh = () => {
      try {
        window.dispatchEvent(
          new CustomEvent("wta-refresh", {
            detail: { source: "hard", hard: true, at: Date.now() },
          })
        );
      } catch {
        /* ignore */
      }
      try {
        router.refresh();
      } catch {
        /* ignore */
      }
    };

    return () => {
      try {
        delete window.__wtaStructuralBack;
        delete window.__wtaHardRefresh;
        delete window.__wtaNavigate;
      } catch {
        /* ignore */
      }
      window.removeEventListener("wta-navigate", onWtaNavigateEvent);
    };
  }, [pathname, router]);

  return null;
}
