"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { parentLabel, structuralParent } from "@/lib/nav-parent";

/**
 * Structural back: always one level up the site tree.
 * Uses structural navigation only (never full chronological history).
 *
 * Pass `fallback` when the parent is not the path's previous segment.
 */
export default function CategoryBackButton({
  fallback,
  label,
}: {
  /** Explicit parent path. If omitted, computed from current URL. */
  fallback?: string;
  label?: string;
}) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const href = structuralParent(pathname, fallback);
  const text =
    label ||
    (href === "/" ? "Home" : parentLabel(href) === "Back" ? "Back" : `Back to ${parentLabel(href)}`);

  // Don't render a self-loop on home
  if (href === pathname || (pathname === "/" && href === "/")) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    // Preserve standard browser actions for modified clicks (e.g. Cmd/Ctrl+Click to open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (typeof window !== "undefined" && window.__wtaInPageBack) {
      const handled = window.__wtaInPageBack();
      if (handled) return;
    }
    router.push(href);
  };

  return (
    <div className="flex items-center gap-2.5 mb-5 sm:mb-7 select-none touch-manipulation">
      <Link
        href={href}
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-[#0c1429]/80 hover:bg-[#111c38] backdrop-blur-xl px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:border-cyan-400/40 transition-all shadow-md active:scale-95 cursor-pointer"
        aria-label={`Go back to ${text}`}
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-cyan-300 -ml-0.5">
          <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
        </span>
        <span className="tracking-tight">{text}</span>
      </Link>
    </div>
  );
}
