"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listOrdersFromDb,
  verifyOrder,
  rejectOrder,
  statusLabel,
  type ManualOrder,
} from "@/lib/orders";
import { notifyApproval, notifyRejection, formatNotifyToast } from "@/lib/notify";
import { formatEtb } from "@/data/packages";
import { downloadCsv } from "@/lib/admin-data";
import BrandLoader from "@/components/BrandLoader";
import {
  Check,
  X,
  RefreshCw,
  Phone,
  Mail,
  CreditCard,
  ExternalLink,
  Search,
  Filter,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  FileText,
  Calendar,
  Eye,
  ShieldCheck,
} from "lucide-react";

type FilterStatus = "pending_verification" | "all" | "verified" | "rejected";

export default function PaymentsPanel({ adminEmail }: { adminEmail: string }) {
  const [orders, setOrders] = useState<ManualOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [toast, setToast] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("pending_verification");
  const [bankFilter, setBankFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Receipt Modal State
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);

  // Reject Modal State
  const [rejectOrderModal, setRejectOrderModal] = useState<ManualOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const list = await listOrdersFromDb();
    setOrders(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // Derived filtered orders
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      // Status match
      if (filterStatus !== "all" && o.status !== filterStatus) return false;

      // Bank match
      if (bankFilter !== "all") {
        const method = (o.paymentMethod || "").toLowerCase();
        if (bankFilter === "telebirr" && !method.includes("telebirr")) return false;
        if (bankFilter === "cbe" && !method.includes("cbe")) return false;
        if (bankFilter === "abyssinia" && !method.includes("abyssinia")) return false;
      }

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          o.id.toLowerCase().includes(q) ||
          o.studentName.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          (o.email || "").toLowerCase().includes(q) ||
          o.transactionRef.toLowerCase().includes(q) ||
          o.packageName.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [orders, filterStatus, bankFilter, searchQuery]);

  const pendingOrders = orders.filter((o) => o.status === "pending_verification");
  const verifiedOrders = orders.filter((o) => o.status === "verified");
  const pendingAmount = pendingOrders.reduce((sum, o) => sum + (o.amountEtb || 0), 0);
  const verifiedAmount = verifiedOrders.reduce((sum, o) => sum + (o.amountEtb || 0), 0);

  async function onVerify(id: string) {
    setBusyId(id);
    const res = await verifyOrder(id, adminEmail);
    if (!res.ok) {
      setBusyId("");
      setToast(res.error || "Verify failed");
      return;
    }
    const n = await notifyApproval(id);
    setBusyId("");
    setToast(formatNotifyToast(n, "Approved"));
    void load();
  }

  async function onConfirmReject() {
    if (!rejectOrderModal) return;
    const orderId = rejectOrderModal.id;
    setBusyId(orderId);
    const res = await rejectOrder(orderId, adminEmail);
    if (!res.ok) {
      setBusyId("");
      setToast(res.error || "Reject failed");
      return;
    }
    const n = await notifyRejection(orderId);
    setBusyId("");
    setRejectOrderModal(null);
    setRejectReason("");
    setToast(formatNotifyToast(n, "Rejected"));
    void load();
  }

  const handleExportCsv = () => {
    if (orders.length === 0) return;
    const headers = [
      "Order ID",
      "Student Name",
      "Phone",
      "Email",
      "Package Name",
      "Amount ETB",
      "Payment Method",
      "Transaction Ref",
      "Status",
      "Created At",
      "Verified At",
      "Verified By",
    ];
    const rows = filtered.map((o) => [
      o.id,
      o.studentName,
      o.phone,
      o.email || "",
      o.packageName,
      o.amountEtb,
      o.paymentMethod || "",
      o.transactionRef,
      o.status,
      o.createdAt ? new Date(o.createdAt).toLocaleString() : "",
      o.verifiedAt ? new Date(o.verifiedAt).toLocaleString() : "",
      o.verifiedBy || "",
    ]);
    downloadCsv(`wisdom_tower_orders_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-amber-400/40 bg-wisdom-card p-4 text-sm font-semibold text-amber-300 shadow-2xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          {toast}
        </div>
      )}

      {/* Header and Quick Stats */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Payment Operations & Order Verification
          </h2>
          <p className="text-xs sm:text-sm text-wisdom-muted mt-0.5">
            Manual bank slip verification, Telebirr & CBE confirmations, and automated student enrollment
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filtered.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/12 text-sm font-semibold text-white/90 hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV ({filtered.length})
          </button>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 text-sm font-semibold hover:bg-amber-500/30 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Financial Pipeline Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-300">
            Pending Verification
          </p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">
            {formatEtb(pendingAmount)}
          </p>
          <p className="text-xs text-amber-200/80 mt-1 font-medium">
            {pendingOrders.length} order{pendingOrders.length === 1 ? "" : "s"} awaiting approval
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Total Verified Revenue
          </p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">
            {formatEtb(verifiedAmount)}
          </p>
          <p className="text-xs text-emerald-200/80 mt-1 font-medium">
            {verifiedOrders.length} confirmed paid orders
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-wisdom-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
            All-Time Orders
          </p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">{orders.length}</p>
          <p className="text-xs text-wisdom-muted mt-1">
            Across Telebirr, CBE, Abyssinia, and other rails
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-wisdom-card/60 p-3.5 rounded-2xl border border-white/8">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-wisdom-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, student, phone, email, or transaction ref..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-wisdom-dark border border-white/10 text-sm text-white placeholder-wisdom-muted focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-wisdom-dark border border-white/10 text-xs font-semibold">
          {(
            [
              ["pending_verification", `Pending (${pendingOrders.length})`],
              ["verified", "Verified"],
              ["rejected", "Rejected"],
              ["all", "All"],
            ] as const
          ).map(([stId, stLabel]) => (
            <button
              key={stId}
              type="button"
              onClick={() => setFilterStatus(stId)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterStatus === stId
                  ? "bg-amber-500 text-wisdom-dark font-bold shadow-sm"
                  : "text-wisdom-muted hover:text-white"
              }`}
            >
              {stLabel}
            </button>
          ))}
        </div>

        {/* Bank Filter */}
        <select
          value={bankFilter}
          onChange={(e) => setBankFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-wisdom-dark border border-white/10 text-xs font-semibold text-white focus:outline-none focus:border-amber-400"
        >
          <option value="all">All Payment Methods</option>
          <option value="telebirr">Telebirr</option>
          <option value="cbe">CBE</option>
          <option value="abyssinia">Bank of Abyssinia</option>
        </select>
      </div>

      {/* Orders List */}
      {loading && orders.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <BrandLoader size="md" label="Loading orders..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-wisdom-muted">
          <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium text-white mb-1">No orders found</p>
          <p className="text-sm">No orders matching the selected status or search filter.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((o) => (
            <div
              key={o.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                o.status === "pending_verification"
                  ? "border-amber-400/40 bg-wisdom-card shadow-lg shadow-amber-950/20"
                  : o.status === "verified"
                    ? "border-white/10 bg-wisdom-card/90"
                    : "border-white/8 bg-wisdom-card/50 opacity-80"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{o.id}</span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        o.status === "verified"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
                          : o.status === "pending_verification"
                            ? "bg-amber-500/15 text-amber-300 border-amber-400/30"
                            : "bg-rose-500/15 text-rose-300 border-rose-400/30"
                      }`}
                    >
                      {statusLabel(o.status)}
                    </span>
                    <span className="text-xs text-wisdom-muted">
                      via <strong className="text-white uppercase">{o.paymentMethod || "Bank"}</strong>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mt-1">{o.packageName}</h3>
                  <p className="text-sm font-extrabold text-amber-300 mt-0.5">
                    {formatEtb(o.amountEtb)}
                  </p>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2">
                  {o.receiptUrl && (
                    <button
                      type="button"
                      onClick={() => setViewReceiptUrl(o.receiptUrl!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 text-xs font-semibold text-cyan-300 hover:bg-white/10 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Receipt
                    </button>
                  )}

                  {o.status === "pending_verification" && (
                    <>
                      <button
                        type="button"
                        onClick={() => onVerify(o.id)}
                        disabled={busyId === o.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-400 disabled:opacity-50 transition-colors shadow-md shadow-emerald-500/20"
                      >
                        <Check className="w-4 h-4" />
                        {busyId === o.id ? "Verifying..." : "Approve & Unlock"}
                      </button>

                      <button
                        type="button"
                        onClick={() => setRejectOrderModal(o)}
                        disabled={busyId === o.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 disabled:opacity-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Student Metadata Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-wisdom-muted py-2.5 border-t border-white/6">
                <div>
                  <span className="text-white/80 font-semibold">{o.studentName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{o.phone}</span>
                </div>
                {o.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-wisdom-muted shrink-0" />
                    <span className="truncate">{o.email}</span>
                  </div>
                )}
              </div>

              {/* Transaction Reference & Timestamp */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-wisdom-muted border-t border-white/6">
                <div>
                  <span>Ref: </span>
                  <span className="font-mono font-bold text-cyan-300 select-all">
                    {o.transactionRef}
                  </span>
                  {o.note && (
                    <span className="text-wisdom-muted ml-2 italic">({o.note})</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Placed {new Date(o.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: RECEIPT LIGHTBOX                                 */}
      {/* ========================================================= */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-xl w-full rounded-3xl border border-white/20 bg-wisdom-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                Payment Receipt Slip
              </h3>
              <button
                type="button"
                onClick={() => setViewReceiptUrl(null)}
                className="p-1.5 rounded-lg text-wisdom-muted hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-black/50 p-2 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewReceiptUrl}
                alt="Payment Receipt"
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewReceiptUrl(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/15"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: REJECT ORDER WITH REASON                         */}
      {/* ========================================================= */}
      {rejectOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-md w-full rounded-3xl border border-rose-400/30 bg-wisdom-card p-6 shadow-2xl space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Reject Payment Order
              </p>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Reject Order {rejectOrderModal.id}
              </h3>
              <p className="text-xs text-wisdom-muted mt-1">
                Student: {rejectOrderModal.studentName} ({formatEtb(rejectOrderModal.amountEtb)})
              </p>
            </div>

            <p className="text-sm text-wisdom-muted leading-relaxed">
              Are you sure you want to reject this payment? The order will be flagged as rejected and the student will be notified if email or SMS is active.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/8">
              <button
                type="button"
                onClick={() => setRejectOrderModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-wisdom-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-400 transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
