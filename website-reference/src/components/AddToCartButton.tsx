"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Check, BookOpen, CloudUpload, Gift } from "lucide-react";
import { addToCart, isInCart, CART_EVENT } from "@/lib/cart";
import { formatEtb, PACKAGE_PRICE_ETB, getPackage } from "@/data/packages";
import { getPackageResolved } from "@/lib/catalog";
import {
  isPackageOwned,
  clearOwnershipCache,
  isFreeForRegistered,
  IS_FREE_MODE,
  FREE_FOR_REGISTERED_PACKAGE_IDS,
} from "@/lib/ownership";
import { isPackagePurchasable } from "@/data/content-availability";
import { supabase } from "@/lib/supabase";
import ComingSoonModal from "@/components/ComingSoonModal";

const FREE_SET = new Set<string>(FREE_FOR_REGISTERED_PACKAGE_IDS);

type Props = {
  packageId: string;
  variant?: "primary" | "ghost" | "compact";
  className?: string;
  hideIfAccessible?: boolean;
};

export default function AddToCartButton({
  packageId,
  variant = "primary",
  className = "",
  hideIfAccessible = false,
}: Props) {
  const pathname = usePathname();
  const [inCart, setInCart] = useState(false);
  const [owned, setOwned] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [soonOpen, setSoonOpen] = useState(false);
  const pkg = getPackageResolved(packageId) || getPackage(packageId);
  const price = pkg?.priceEtb ?? PACKAGE_PRICE_ETB;
  const openHref = pkg?.href || "/learning";
  const purchasable = isPackagePurchasable(packageId);
  const freeForRegistered = IS_FREE_MODE || isFreeForRegistered(packageId);

  useEffect(() => {
    const syncCart = () => setInCart(isInCart(packageId));
    syncCart();

    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        if (!cancelled) {
          setSignedIn(false);
          setOwned(false);
        }
        return;
      }
      if (!cancelled) setSignedIn(true);
      const has = await isPackageOwned(packageId);
      if (!cancelled) setOwned(has);
    })();

    window.addEventListener(CART_EVENT, syncCart);
    window.addEventListener("storage", syncCart);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      clearOwnershipCache();
      const uid = session?.user?.id;
      setSignedIn(!!uid);
      if (!uid) {
        setOwned(false);
        return;
      }
      void isPackageOwned(packageId).then((has) => {
        if (!cancelled) setOwned(has);
      });
    });

    return () => {
      cancelled = true;
      window.removeEventListener(CART_EVENT, syncCart);
      window.removeEventListener("storage", syncCart);
      subscription.unsubscribe();
    };
  }, [packageId]);

  function onAdd() {
    if (freeForRegistered) return;
    if (!purchasable) {
      setSoonOpen(true);
      return;
    }
    if (owned) return;
    addToCart(packageId);
    setInCart(true);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  /* Free for registered: never show cart */
  if (freeForRegistered) {
    if (owned || signedIn) {
      if (hideIfAccessible || variant === "ghost") return null;
      return (
        <div className={`flex flex-wrap items-center gap-2 ${className}`}>
          <Link
            href={openHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Materials</span>
          </Link>
        </div>
      );
    }

    if (hideIfAccessible || variant === "ghost") return null;

    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname || "/learning")}`}
        className={`inline-flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-bold shadow-sm transition-all active:scale-[0.98] ${className}`}
      >
        <BookOpen className="w-4 h-4" />
        <span>Sign in to Open</span>
      </Link>
    );
  }

  if (owned) {
    if (hideIfAccessible || variant === "ghost") return null;
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <Link
          href={openHref}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-sm font-bold shadow-sm transition-all active:scale-[0.98]"
        >
          <BookOpen className="w-4 h-4" />
          <span>Open Materials</span>
        </Link>
      </div>
    );
  }

  if (!purchasable) {
    return (
      <>
        <button
          type="button"
          onClick={() => setSoonOpen(true)}
          className={`inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 bg-white/[0.04] text-slate-300 text-sm font-semibold hover:bg-white/[0.08] transition-all ${className}`}
        >
          <CloudUpload className="w-4 h-4 text-cyan-300" />
          <span>Coming soon</span>
        </button>
        <ComingSoonModal open={soonOpen} onClose={() => setSoonOpen(false)} hubName={pkg?.name} />
      </>
    );
  }

  if (inCart) {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold">
          <Check className="w-4 h-4" />
          {justAdded ? "Added" : "In cart"}
        </span>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
        >
          View Cart
        </Link>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={onAdd}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold shadow-sm transition-all active:scale-95 ${className}`}
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        {formatEtb(price)}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={onAdd}
        className={`inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 text-sm font-bold hover:bg-cyan-500/20 hover:border-cyan-400/70 transition-all duration-200 active:scale-[0.98] ${className}`}
      >
        <ShoppingBag className="w-4 h-4 text-cyan-300" />
        <span>Add to Cart · {formatEtb(price)}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className={`btn-primary w-full ${className}`}
    >
      <ShoppingBag className="w-4 h-4" />
      <span>Add to Cart · {formatEtb(price)}</span>
    </button>
  );
}
