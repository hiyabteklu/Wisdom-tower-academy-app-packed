"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPackage, formatEtb } from "@/data/packages";
import { getPackageResolved } from "@/lib/catalog";
import { isPackagePurchasable } from "@/data/content-availability";
import CheckoutForm from "@/components/CheckoutForm";
import { ArrowLeft, ShoppingBag, Gift, BookOpen } from "lucide-react";
import { IS_FREE_MODE } from "@/lib/ownership";

function MultiCheckoutInner() {
  const search = useSearchParams();
  const raw = search.get("ids") || "";
  const ids = useMemo(
    () =>
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((id, i, arr) => arr.indexOf(id) === i),
    [raw]
  );

  const packages = ids
    .map((id) => getPackageResolved(id) || getPackage(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const sellable = packages.filter((p) => isPackagePurchasable(p.id));
  const total = sellable.reduce((s, p) => s + p.priceEtb, 0);

  if (IS_FREE_MODE) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="rounded-3xl border border-white/10 bg-wisdom-card p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
            <Gift className="w-8 h-8" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white mb-3">
            All Packages Unlocked
          </h1>
          <p className="text-sm text-wisdom-muted leading-relaxed mb-6">
            All registered scholars receive full access to all curriculum pathways and materials.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/learning"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 shadow-sm transition-all active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4" />
              <span>Go to My Learning</span>
            </Link>
            <Link
              href="/packages"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Tracks</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (ids.length === 0 || sellable.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white font-semibold mb-2">Nothing to checkout</p>
        <p className="text-sm text-wisdom-muted mb-6">
          Select packages in your cart, then proceed to payment.
        </p>
        <Link href="/cart" className="text-amber-300 text-sm font-semibold hover:underline">
          Back to cart
        </Link>
      </div>
    );
  }

  if (sellable.length === 1) {
    return <CheckoutForm packageId={sellable[0].id} />;
  }

  return (
    <div>
      <div className="max-w-lg mx-auto px-4 pt-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-sm text-wisdom-muted hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Cart
        </Link>
        <div className="rounded-2xl border border-white/12 bg-wisdom-card p-4 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted mb-2">
            Paying for {sellable.length} packages
          </p>
          <ul className="space-y-1.5 mb-3">
            {sellable.map((p) => (
              <li key={p.id} className="flex justify-between text-sm gap-2">
                <span className="text-white/90 truncate">{p.name}</span>
                <span className="text-amber-300 font-semibold shrink-0">{formatEtb(p.priceEtb)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-white/10 pt-2 text-sm">
            <span className="text-wisdom-muted">Total due</span>
            <span className="font-black text-amber-300">{formatEtb(total)}</span>
          </div>
        </div>
      </div>
      <CheckoutForm packageIds={sellable.map((p) => p.id)} />
    </div>
  );
}

export default function MultiCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex items-center justify-center text-wisdom-muted text-sm">
          Loading…
        </div>
      }
    >
      <MultiCheckoutInner />
    </Suspense>
  );
}
