"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  BookOpen,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  getCartPackages,
  removeFromCart,
  CART_EVENT,
} from "@/lib/cart";
import { formatEtb, type AcademyPackage } from "@/data/packages";
import { IS_FREE_MODE } from "@/lib/ownership";
import { Gift, LogIn } from "lucide-react";

const SELECT_KEY = "wt_cart_checkout_ids";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<AcademyPackage[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  function sync() {
    const pkgs = getCartPackages();
    setItems(pkgs);
    setSelected((prev) => {
      const next = new Set<string>();
      for (const p of pkgs) {
        // Keep previous selection if still in cart; otherwise select new items by default
        if (prev.size === 0 || prev.has(p.id)) next.add(p.id);
      }
      // If cart grew with new ids while some were selected, select new ones too
      if (prev.size > 0) {
        for (const p of pkgs) {
          if (!prev.has(p.id) && !Array.from(prev).every((id) => pkgs.some((x) => x.id === id))) {
            // new item: select it
            next.add(p.id);
          }
        }
      }
      if (next.size === 0 && pkgs.length > 0) {
        pkgs.forEach((p) => next.add(p.id));
      }
      return next;
    });
    setReady(true);
  }

  useEffect(() => {
    sync();
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const selectedPackages = useMemo(
    () => items.filter((p) => selected.has(p.id)),
    [items, selected]
  );
  const total = selectedPackages.reduce((sum, p) => sum + p.priceEtb, 0);
  const allSelected = items.length > 0 && selected.size === items.length;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(items.map((p) => p.id)));
  }

  function proceed() {
    if (selectedPackages.length === 0) return;
    const ids = selectedPackages.map((p) => p.id);
    try {
      sessionStorage.setItem(SELECT_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
    if (ids.length === 1) {
      router.push(`/checkout/${ids[0]}`);
      return;
    }
    router.push(`/checkout/multi?ids=${encodeURIComponent(ids.join(","))}`);
  }

  if (IS_FREE_MODE) {
    return (
      <div className="relative min-h-[70vh] flex items-center justify-center">
        <div className="relative max-w-lg mx-auto px-4 py-16 text-center">
          <div className="rounded-3xl border border-white/10 bg-wisdom-card p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
              <Gift className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-black text-white mb-3">
              All Content is Unlocked
            </h1>
            <p className="text-sm text-wisdom-muted leading-relaxed mb-6">
              All learning tracks, books, notes, questions, and model exams
              are open for registered students. No cart, checkout, or payment is required.
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
                <span>Browse Tracks</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[70vh]">
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400/90 mb-1">
              Cart
            </p>
            <h1 className="font-display text-3xl font-extrabold text-white tracking-tight">
              Your cart
            </h1>
            <p className="mt-1 text-sm text-wisdom-muted">
              {!ready
                ? "…"
                : items.length === 0
                  ? "Empty"
                  : `${items.length} package${items.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <Link
            href="/learning"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
          >
            <BookOpen className="w-4 h-4" />
            My Learning
          </Link>
        </div>

        {!ready ? null : items.length === 0 ? (
          <div className="rounded-3xl border border-white/12 bg-wisdom-card p-10 text-center">
            <ShoppingBag className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="font-semibold text-white mb-2">Cart is empty</p>
            <p className="text-sm text-wisdom-muted mb-6">
              Add packages from Academy. Prices start from {formatEtb(250)}.
            </p>
            <Link
              href="/packages"
              className="inline-flex px-4 py-2.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-semibold"
            >
              Browse packages
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={toggleAll}
                className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
              >
                {allSelected ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {allSelected ? "Deselect all" : "Select all"}
              </button>
              <p className="text-xs text-wisdom-muted">
                {selected.size} of {items.length} selected
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              {items.map((pkg) => {
                const on = selected.has(pkg.id);
                return (
                  <li
                    key={pkg.id}
                    className={`flex gap-3 rounded-2xl border p-3 sm:p-4 transition-colors ${
                      on
                        ? "border-amber-400/35 bg-wisdom-card"
                        : "border-white/10 bg-wisdom-card/70 opacity-80"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(pkg.id)}
                      className="shrink-0 mt-1 text-amber-300"
                      aria-label={on ? `Deselect ${pkg.name}` : `Select ${pkg.name}`}
                    >
                      {on ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5 text-wisdom-muted" />
                      )}
                    </button>
                    <div
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-cover bg-center shrink-0 border border-white/10"
                      style={{ backgroundImage: `url(${pkg.image})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{pkg.name}</p>
                      <p className="text-xs text-wisdom-muted truncate">{pkg.shortName}</p>
                      <p className="text-sm font-bold text-amber-300 mt-1">
                        {formatEtb(pkg.priceEtb)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(pkg.id)}
                      className="p-2 rounded-lg text-wisdom-muted hover:text-rose-400 hover:bg-rose-500/10 self-start"
                      aria-label={`Remove ${pkg.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="card-modern p-5 sm:p-6 shadow-xl">
              <div className="flex justify-between items-baseline text-sm mb-1.5">
                <span className="text-wisdom-muted font-medium">Selected total</span>
                <span className="font-black text-amber-300 text-xl tracking-tight">{formatEtb(total)}</span>
              </div>
              <p className="text-xs text-wisdom-muted mb-5 leading-relaxed">
                Tick only the packages you want to pay for now. One transfer covers the selected
                total.
              </p>
              <button
                type="button"
                disabled={selectedPackages.length === 0}
                onClick={proceed}
                className="btn-accent flex items-center justify-center gap-2 w-full py-3.5 text-sm disabled:opacity-40 disabled:pointer-events-none"
              >
                Proceed to payment · {formatEtb(total)}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
