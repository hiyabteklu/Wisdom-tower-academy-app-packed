"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  listMyOrders,
  listLocalOrders,
  statusLabel,
  type ManualOrder,
  type OrderStatus,
} from "@/lib/orders";
import { formatEtb } from "@/data/packages";
import { ClipboardList, ExternalLink, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCachedQuery } from "@/hooks/useCachedQuery";

function statusStyle(status: OrderStatus) {
  switch (status) {
    case "verified":
      return "border-emerald-400/40 bg-emerald-500/15 text-emerald-200";
    case "pending_verification":
      return "border-amber-400/40 bg-amber-500/15 text-amber-200";
    case "rejected":
      return "border-red-400/40 bg-red-500/15 text-red-300";
    default:
      return "border-white/20 bg-white/5 text-wisdom-muted";
  }
}

export default function OrdersPage() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(Boolean(session?.user));
    });
  }, []);

  const fetchOrders = useCallback(async (): Promise<ManualOrder[]> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setLoggedIn(Boolean(session?.user));
    if (session?.user) {
      return await listMyOrders();
    }
    return listLocalOrders();
  }, []);

  const initialLocal = useMemo(() => {
    if (typeof window !== "undefined") return listLocalOrders();
    return [];
  }, []);

  const {
    data: orders = [],
    isLoading,
    isRevalidating,
    refresh,
  } = useCachedQuery<ManualOrder[]>("orders:mine", fetchOrders, {
    initialData: initialLocal,
    scope: "user",
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-16">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white mb-2">My orders</h1>
          <p className="text-sm text-wisdom-muted">
            Payment requests and verification status. After approval, open{" "}
            <Link href="/learning" className="text-cyan-400 hover:underline">
              My Learning
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={() => refresh()}
          disabled={isRevalidating}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRevalidating ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {!loggedIn && (
        <p className="mb-4 text-xs text-wisdom-muted rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Link href="/login" className="text-cyan-400 hover:underline">
            Sign in
          </Link>{" "}
          to see your full order history.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3 py-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/12 bg-wisdom-card/60 p-5 animate-pulse space-y-2.5"
            >
              <div className="h-3.5 w-1/4 bg-white/10 rounded" />
              <div className="h-5 w-1/2 bg-white/10 rounded" />
              <div className="h-4 w-1/6 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-wisdom-card p-10 text-center">
          <ClipboardList className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white font-semibold mb-1">No orders yet</p>
          <Link href="/packages" className="text-sm text-cyan-400 hover:underline">
            Browse packages
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li
              key={o.id}
              className="rounded-2xl border border-white/12 bg-wisdom-card p-4 sm:p-5"
            >
              <div className="flex justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-mono text-xs text-wisdom-muted">{o.id}</p>
                  <p className="font-semibold text-white">{o.packageName}</p>
                  <p className="text-sm text-amber-300">{formatEtb(o.amountEtb)}</p>
                </div>
                <span
                  className={`text-[11px] font-semibold rounded-full border px-2.5 py-1 h-fit ${statusStyle(
                    o.status
                  )}`}
                >
                  {statusLabel(o.status)}
                </span>
              </div>
              <p className="text-xs text-wisdom-muted mt-2">
                {o.paymentMethod.toUpperCase()} · {o.studentName}
                {o.transactionRef ? ` · ${o.transactionRef}` : ""}
              </p>
              <p className="text-[11px] text-wisdom-muted mt-1">
                {new Date(o.createdAt).toLocaleString()}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.status === "verified" && (
                  <Link
                    href="/learning"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:underline"
                  >
                    Open My Learning
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
                {o.receiptUrl && (
                  <a
                    href={o.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:underline"
                  >
                    View receipt
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {o.status === "rejected" && (
                  <Link
                    href={`/checkout/${o.packageId}`}
                    className="text-xs font-semibold text-amber-300 hover:underline"
                  >
                    Submit again
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
