"use client";

import { useEffect, useState } from "react";
import { Users, Gift } from "lucide-react";
import { getPackage, formatEtb } from "@/data/packages";
import { isFreeForRegistered, IS_FREE_MODE, FREE_FOR_REGISTERED_PACKAGE_IDS } from "@/lib/ownership";
import { supabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";
import Link from "next/link";
import { usePathname } from "next/navigation";

const FREE_SET = new Set<string>(FREE_FOR_REGISTERED_PACKAGE_IDS);

/** Compact purchase strip for section / grade pages */
export default function PackageOfferBanner({ packageId }: { packageId: string }) {
  const pathname = usePathname();
  const pkg = getPackage(packageId);
  const isFree = IS_FREE_MODE || isFreeForRegistered(packageId);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled) setSignedIn(!!session?.user);
    })();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (!pkg) return null;

  if (isFree && signedIn) {
    return (
      <div className="card-modern border-white/10 bg-wisdom-card/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg backdrop-blur-xl">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">{pkg.name}</h3>
          {pkg.description ? (
            <p className="text-xs sm:text-sm text-wisdom-muted mt-1 leading-relaxed line-clamp-2">
              {pkg.description}
            </p>
          ) : null}
          <p className="text-xs text-cyan-300/90 mt-1.5 font-medium">
            Active session · Learning hubs for this pathway are fully unlocked.
          </p>
        </div>
        <div className="shrink-0 flex items-center">
          <Link
            href="/learning"
            className="btn-cyan px-5 py-2.5 text-xs sm:text-sm"
          >
            Open Learning Hub
          </Link>
        </div>
      </div>
    );
  }

  if (isFree && !signedIn) {
    return (
      <div className="card-modern border-white/10 bg-wisdom-card/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg backdrop-blur-xl">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">{pkg.name}</h3>
          {pkg.description ? (
            <p className="text-xs sm:text-sm text-wisdom-muted mt-1 leading-relaxed line-clamp-2">
              {pkg.description}
            </p>
          ) : null}
          <p className="text-xs text-wisdom-muted mt-1.5">
            Sign in with your student account to open materials for this pathway.
          </p>
        </div>
        <div className="shrink-0 flex items-center">
          <Link
            href={`/login?next=${encodeURIComponent(pathname || "/learning")}`}
            className="btn-cyan px-5 py-2.5 text-xs sm:text-sm"
          >
            Sign In to Open
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card-modern border-white/10 bg-wisdom-card/80 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg backdrop-blur-xl">
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">{pkg.name}</h3>
        {pkg.description ? (
          <p className="text-xs sm:text-sm text-wisdom-muted mt-1 leading-relaxed line-clamp-2">
            {pkg.description}
          </p>
        ) : null}
        <p className="text-base sm:text-lg font-bold text-cyan-300 mt-1.5 tracking-tight">
          {formatEtb(pkg.priceEtb)}
        </p>
      </div>
      <div className="shrink-0 w-full sm:w-auto">
        <AddToCartButton packageId={pkg.id} />
      </div>
    </div>
  );
}
