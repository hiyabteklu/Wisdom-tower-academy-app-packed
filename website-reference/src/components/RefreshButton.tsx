"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { clearOwnershipCache } from "@/lib/ownership";

/**
 * Manual refresh: clears ownership cache, reloads progress listeners,
 * and revalidates the current route so tracker/exam results update in place.
 */
export default function RefreshButton({ className = "" }: { className?: string }) {
  const [spin, setSpin] = useState(false);
  const router = useRouter();

  function onClick() {
    setSpin(true);
    try {
      clearOwnershipCache();
    } catch {
      /* ignore */
    }
    try {
      window.dispatchEvent(
        new CustomEvent("wta-refresh", {
          detail: { source: "button", hard: true, at: Date.now() },
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
    window.setTimeout(() => setSpin(false), 1100);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      title="Refresh progress and content"
      aria-label="Refresh"
      className={`inline-flex items-center justify-center rounded-lg border border-white/12 bg-white/5 p-2 text-wisdom-muted hover:text-cyan-200 hover:border-cyan-400/40 transition-colors ${className}`}
    >
      <RefreshCw className={`w-4 h-4 ${spin ? "animate-spin" : ""}`} />
    </button>
  );
}
