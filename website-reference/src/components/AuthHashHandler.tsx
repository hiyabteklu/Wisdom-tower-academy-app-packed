"use client";

import { useEffect } from "react";

/**
 * Password recovery / invite links often land on Site URL (homepage) with
 * #access_token=...&type=recovery. Forward them to /reset-password with the
 * hash intact so the reset form can establish the session.
 */
export default function AuthHashHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hash = window.location.hash || "";
    if (!hash || hash.length < 8) return;

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");
    const access = params.get("access_token");
    const path = window.location.pathname || "/";

    // Already on reset-password: leave alone
    if (path.startsWith("/reset-password")) return;

    if (
      access &&
      (type === "recovery" || type === "invite" || type === "magiclink")
    ) {
      window.location.replace(`/reset-password${hash}`);
      return;
    }

    // Query-style recovery on wrong page
    const search = window.location.search || "";
    if (
      search.includes("type=recovery") ||
      (search.includes("token_hash=") && search.includes("type="))
    ) {
      if (!path.startsWith("/reset-password")) {
        window.location.replace(`/reset-password${search}${hash}`);
      }
    }
  }, []);

  return null;
}
