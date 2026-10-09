"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface SafeScrollBoxProps {
  children: React.ReactNode;
  className?: string;
  type?: "table" | "math" | "code" | "general";
  title?: string;
  allowFullscreen?: boolean;
}

/**
 * SafeScrollBox
 *
 * Solves the two classic mobile Android WebView sub-scroller bugs:
 * 1. Zero Vertical Freezing / Lag:
 *    Uses passive touch handling + `touch-action: pan-y`. When the user swipes
 *    vertically, the event is immediately passed to the browser's native window
 *    compositor with ZERO delay or lock.
 * 2. Zero Spring Bounce-Back:
 *    When the user pans horizontally, `scrollLeft` is driven directly on the DOM element.
 *    When their finger lifts, `scrollLeft` stays at that exact position without
 *    triggering Android WebView's rubber-band spring-back.
 * 3. Quick-jump buttons (< and >) and Expand modal for small phone screens.
 */
export default function SafeScrollBox({
  children,
  className = "",
  type = "general",
  title,
  allowFullscreen = true,
}: SafeScrollBoxProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check scroll bounds
  const checkScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // 4px tolerance
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollWidth - (scrollLeft + clientWidth) > 6);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    checkScroll();

    const onScroll = () => checkScroll();
    el.addEventListener("scroll", onScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => checkScroll());
      resizeObserver.observe(el);
      if (el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
    }

    const onWindowResize = () => checkScroll();
    window.addEventListener("resize", onWindowResize, { passive: true });

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onWindowResize);
      resizeObserver?.disconnect();
    };
  }, [checkScroll]);

  // Touch gesture handler: strict disambiguation
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let initialScrollLeft = 0;
    let isHorizontal: boolean | null = null;
    let lastX = 0;
    let lastTime = 0;
    let velocityX = 0;
    let momentumAnimId: number | null = null;

    const stopMomentum = () => {
      if (momentumAnimId != null) {
        cancelAnimationFrame(momentumAnimId);
        momentumAnimId = null;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      stopMomentum();
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
      lastX = t.clientX;
      lastTime = performance.now();
      initialScrollLeft = el.scrollLeft;
      isHorizontal = null;
      velocityX = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);
      const currentX = t.clientX;
      const currentY = t.clientY;
      const dx = currentX - startX;
      const dy = currentY - startY;

      // Track instantaneous velocity
      velocityX = (currentX - lastX) / dt;
      lastX = currentX;
      lastTime = now;

      // Disambiguate on first meaningful move (4px threshold)
      if (isHorizontal === null) {
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        if (Math.abs(dy) >= Math.abs(dx)) {
          // Vertical swipe: let native compositor scroll page smoothly with 0 interference
          isHorizontal = false;
          return;
        } else {
          // Horizontal swipe: we handle scrollLeft smoothly
          isHorizontal = true;
        }
      }

      if (!isHorizontal) return;

      // Perform horizontal scroll without triggering rubber-band overscroll
      const targetScroll = initialScrollLeft - dx;
      const maxScroll = el.scrollWidth - el.clientWidth;
      el.scrollLeft = Math.max(0, Math.min(maxScroll, targetScroll));
    };

    const handleTouchEnd = () => {
      if (isHorizontal && Math.abs(velocityX) > 0.25) {
        // Natural momentum glide
        let currentVx = velocityX * 14;
        const step = () => {
          if (Math.abs(currentVx) < 0.5) {
            momentumAnimId = null;
            checkScroll();
            return;
          }
          el.scrollLeft -= currentVx;
          currentVx *= 0.88; // decay
          momentumAnimId = requestAnimationFrame(step);
        };
        momentumAnimId = requestAnimationFrame(step);
      } else {
        checkScroll();
      }
      isHorizontal = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    el.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      stopMomentum();
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [checkScroll]);

  const scrollByDelta = (delta: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  const hasOverflow = canScrollLeft || canScrollRight;

  return (
    <div
      className={`safe-scroll-outer relative my-3 w-full max-w-full group/scrollbox ${className}`}
      data-scroll-zoom-skip
    >
      {/* Top hint bar on mobile when content overflows */}
      {hasOverflow && (
        <div className="flex items-center justify-between gap-1.5 mb-1 px-1 text-[11px] text-cyan-300/80 font-mono select-none">
          <span className="inline-flex items-center gap-1 font-sans text-slate-400">
            {type === "table" ? "Table (swipe or use arrows):" : "Long equation (swipe to view):"}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollByDelta(-140)}
              disabled={!canScrollLeft}
              className="p-1 rounded-md bg-white/[0.08] hover:bg-white/[0.16] disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all text-slate-200"
              aria-label="Scroll left"
              title="Scroll left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByDelta(140)}
              disabled={!canScrollRight}
              className="p-1 rounded-md bg-white/[0.08] hover:bg-white/[0.16] disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all text-slate-200"
              aria-label="Scroll right"
              title="Scroll right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            {allowFullscreen && (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="p-1 ml-1 rounded-md bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 active:scale-95 transition-all"
                aria-label="Expand full view"
                title="Expand full view"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* The Scrollport */}
      <div
        ref={scrollerRef}
        className="safe-scroll-port w-full max-w-full overflow-x-auto select-text"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y", // Native vertical pan enabled
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(34, 211, 238, 0.45) transparent",
        }}
        data-scroll-zoom-skip
      >
        <div className="safe-scroll-inner inline-block min-w-full w-max text-left">
          {children}
        </div>
      </div>

      {/* Subtle fade edge cue when more content is to the right */}
      {canScrollRight && (
        <div
          className="pointer-events-none absolute right-0 top-6 bottom-0 w-6 bg-gradient-to-l from-[#070c16]/90 via-[#070c16]/40 to-transparent rounded-r-lg"
          aria-hidden
        />
      )}

      {/* Fullscreen Viewer Modal for small mobile screens */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 animate-fade-up"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <p className="text-sm font-semibold text-white">
              {title || (type === "table" ? "Table View" : "Formula View")}
            </p>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
              aria-label="Close full view"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-auto p-2 bg-black/40 rounded-xl border border-white/8">
            <div className="inline-block min-w-full w-max">{children}</div>
          </div>
          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-6 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs active:scale-95 transition-all shadow-lg"
            >
              Done (Return to Notes)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
