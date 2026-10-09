"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import {
  listOrdersFromDb,
  verifyOrder,
  rejectOrder,
  statusLabel,
  type ManualOrder,
} from "@/lib/orders";
import { formatEtb } from "@/data/packages";
import BrandLoader from "@/components/BrandLoader";
import {
  Shield,
  RefreshCw,
  Check,
  X,
  ArrowLeft,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react";

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState<"pending_verification" | "all" | "verified" | "rejected">(
    "pending_verification"
  );
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email;
      if (!email || !isAdminEmail(email)) {
        router.replace(session ? "/account" : "/login");
        return;
      }
      setAdminEmail(email);
      setReady(true);
    });
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await listOrdersFromDb();
    setOrders(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  async function onVerify(id: string) {
    setBusyId(id);
    const res = await verifyOrder(id, adminEmail);
    setBusyId("");
    if (res.ok) {
      setToast("Verified: student enrolled");
      load();
    } else {
      setToast(res.error || "Verify failed");
    }
  }

  async function onReject(id: string) {
    if (!window.confirm("Reject this payment?")) return;
    setBusyId(id);
    const res = await rejectOrder(id, adminEmail);
    setBusyId("");
    if (res.ok) {
      setToast("Rejected");
      load();
    } else {
      setToast(res.error || "Reject failed");
    }
  }

  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center" data-wta-spinner="true">
        <BrandLoader size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wisdom-dark text-white">
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full border border-wisdom-cyan/40 bg-wisdom-card px-5 py-3 text-sm font-medium text-wisdom-cyan shadow-2xl">
          {toast}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">Admin</p>
              <h1 className="text-2xl font-bold">Payments</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/12 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              ["pending_verification", "Pending"],
              ["verified", "Verified"],
              ["rejected", "Rejected"],
              ["all", "All"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${
                filter === id
                  ? "border-amber-400/50 bg-amber-500/15 text-amber-200"
                  : "border-white/10 text-wisdom-muted hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-wisdom-muted">
            <Shield className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No orders in this filter
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((o) => (
              <li
                key={o.id}
                className="rounded-2xl border border-white/12 bg-wisdom-card p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-white">{o.id}</p>
                    <p className="text-lg font-semibold text-white mt-0.5">{o.packageName}</p>
                    <p className="text-amber-300 font-bold">{formatEtb(o.amountEtb)}</p>
                  </div>
                  <span className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-bold uppercase text-wisdom-muted">
                    {statusLabel(o.status)}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 text-sm text-wisdom-muted mb-4">
                  <p>
                    <span className="text-white/80">{o.studentName}</span>
                  </p>
                  <p className="inline-flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {o.phone}
                  </p>
                  {o.email && (
                    <p className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {o.email}
                    </p>
                  )}
                  <p>
                    Method: <span className="text-white/80">{o.paymentMethod}</span>
                  </p>
                  <p className="sm:col-span-2">
                    Tx ref:{" "}
                    <span className="font-mono text-cyan-300">{o.transactionRef}</span>
                  </p>
                  {o.note && <p className="sm:col-span-2">Note: {o.note}</p>}
                  <p className="text-xs">
                    {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>

                {o.status === "pending_verification" && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => onVerify(o.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-wisdom-dark text-sm font-bold hover:bg-emerald-400 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Approve & enroll
                    </button>
                    <button
                      type="button"
                      disabled={busyId === o.id}
                      onClick={() => onReject(o.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-500/40 text-red-400 text-sm font-semibold hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
