"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BrandLoader from "@/components/BrandLoader";
import { clearAllSwrCache } from "@/lib/swr-cache";

/** Dedicated sign-out route: works from app menu and deep links */
export default function LogoutPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("Signing out…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        clearAllSwrCache();
        await supabase.auth.signOut({ scope: "local" });
        try {
          localStorage.removeItem("wt-academy-auth-v1");
        } catch {
          /* ignore */
        }
        if (!cancelled) {
          setMsg("Signed out");
          router.replace("/login");
          router.refresh();
        }
      } catch {
        if (!cancelled) {
          setMsg("Signed out");
          router.replace("/login");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
      <BrandLoader size="md" label={msg} />
    </div>
  );
}
