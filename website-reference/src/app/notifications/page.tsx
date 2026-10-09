"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  BookOpen,
  Info,
  Layers,
  CheckCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { listMyOrders, type ManualOrder } from "@/lib/orders";
import type { NotificationItem } from "@/lib/notifications";
import BrandLoader from "@/components/BrandLoader";
import { useCachedQuery } from "@/hooks/useCachedQuery";

type UnifiedNotice = {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  category: "material" | "admin" | "order" | "general";
  statusKind?: "verified" | "pending" | "rejected";
};

const READ_KEY = "wt_notice_read_v2";

function readReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(READ_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function writeReadIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

function orderToNotice(o: ManualOrder): UnifiedNotice | null {
  if (o.status === "verified") {
    return {
      id: `ord-${o.id}-ok`,
      title: "Enrollment Confirmed",
      body: `${o.packageName || o.packageId} is unlocked and ready in My Learning.`,
      href: "/learning",
      createdAt: o.verifiedAt || o.createdAt,
      category: "order",
      statusKind: "verified",
    };
  }
  if (o.status === "pending_verification" || o.status === "pending_payment") {
    return {
      id: `ord-${o.id}-wait`,
      title: "Order Pending Verification",
      body: `${o.packageName || o.packageId}: receipt under review.`,
      href: "/orders",
      createdAt: o.createdAt,
      category: "order",
      statusKind: "pending",
    };
  }
  if (o.status === "rejected") {
    return {
      id: `ord-${o.id}-no`,
      title: "Payment Needs Attention",
      body: `${o.packageName || o.packageId} could not be verified.`,
      href: "/orders",
      createdAt: o.verifiedAt || o.createdAt,
      category: "order",
      statusKind: "rejected",
    };
  }
  return null;
}

async function fetchNotificationsList(): Promise<UnifiedNotice[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const combined: UnifiedNotice[] = [];

  // 1. Fetch system & push notifications from API
  try {
    const q = new URLSearchParams();
    if (user?.id) q.set("userId", user.id);
    if (user?.email) q.set("email", user.email);

    const res = await fetch(`/api/notifications?${q.toString()}`);
    const data = await res.json();
    if (data.ok && Array.isArray(data.notifications)) {
      data.notifications.forEach((n: NotificationItem) => {
        combined.push({
          id: n.id,
          title: n.title,
          body: n.body,
          href: n.url || "/learning",
          createdAt: n.createdAt,
          category: n.type === "material" ? "material" : n.type === "admin" ? "admin" : "general",
        });
      });
    }
  } catch {
    /* ignore */
  }

  // 2. Fetch order notices if signed in
  if (user) {
    try {
      const orders = await listMyOrders();
      orders.forEach((o) => {
        const n = orderToNotice(o);
        if (n) combined.push(n);
      });
    } catch {
      /* ignore */
    }
  }

  // Sort newest first
  combined.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return combined;
}

export default function NotificationsPage() {
  const [readIds, setReadIds] = useState<Set<string>>(() => readReadIds());
  const [loggedIn, setLoggedIn] = useState(false);
  const [filter, setFilter] = useState<"all" | "material" | "admin" | "order">("all");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoggedIn(Boolean(session?.user));
    });
  }, []);

  const {
    data: notices = [],
    isLoading,
    refresh,
  } = useCachedQuery<UnifiedNotice[]>("notifications:list", fetchNotificationsList, {
    scope: "user",
  });

  const markAllRead = () => {
    const all = new Set(readIds);
    notices.forEach((n) => all.add(n.id));
    setReadIds(all);
    writeReadIds(all);
  };

  const markItemRead = (id: string) => {
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    writeReadIds(next);
  };

  const filteredNotices = useMemo(() => {
    if (filter === "all") return notices;
    return notices.filter((n) => n.category === filter);
  }, [notices, filter]);

  const unreadCount = useMemo(() => {
    return notices.filter((n) => !readIds.has(n.id)).length;
  }, [notices, readIds]);

  return (
    <div className="min-h-[75vh] max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12" data-scroll-zoom-skip>
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-wisdom-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Account</span>
        </Link>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-500/20 to-blue-600/10 text-sky-300 shadow-lg shadow-sky-500/10">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-wisdom-dark">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Notifications
            </h1>
            <p className="text-xs sm:text-sm text-wisdom-muted mt-0.5">
              Material updates, academic announcements, and study alerts.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === "all"
              ? "bg-sky-500 text-slate-950 shadow-md"
              : "border border-white/10 bg-white/5 text-slate-300 hover:text-white"
          }`}
        >
          All ({notices.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter("material")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === "material"
              ? "bg-sky-500 text-slate-950 shadow-md"
              : "border border-white/10 bg-white/5 text-slate-300 hover:text-white"
          }`}
        >
          Material Releases
        </button>

        <button
          type="button"
          onClick={() => setFilter("admin")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === "admin"
              ? "bg-sky-500 text-slate-950 shadow-md"
              : "border border-white/10 bg-white/5 text-slate-300 hover:text-white"
          }`}
        >
          Announcements
        </button>

        <button
          type="button"
          onClick={() => setFilter("order")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === "order"
              ? "bg-sky-500 text-slate-950 shadow-md"
              : "border border-white/10 bg-white/5 text-slate-300 hover:text-white"
          }`}
        >
          Orders & Access
        </button>
      </div>

      {/* Guest Notice */}
      {!loggedIn && !isLoading && (
        <div className="mb-6 rounded-2xl border border-sky-400/30 bg-gradient-to-r from-sky-950/40 to-[#070e1c] p-5 text-center">
          <p className="text-sm font-bold text-white mb-1">Scholar Notifications</p>
          <p className="text-xs text-wisdom-muted mb-4">
            Sign in to receive targeted study reminders and see your enrollment updates.
          </p>
          <Link
            href="/login?next=/notifications"
            className="inline-flex rounded-xl bg-sky-400 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-sky-300 shadow-md"
          >
            Sign In to Account
          </Link>
        </div>
      )}

      {isLoading && (
        <div className="space-y-3 py-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-white/10 bg-[#070d18] animate-pulse space-y-2.5"
            >
              <div className="h-4 w-1/3 bg-white/10 rounded" />
              <div className="h-3 w-2/3 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredNotices.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#091120] px-4 py-16 text-center">
          <Bell className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">No notifications</p>
          <p className="text-xs text-wisdom-muted">
            {filter === "all"
              ? "You're all caught up! New content alerts will appear here."
              : `No alerts found for category "${filter}".`}
          </p>
        </div>
      )}

      {!isLoading && filteredNotices.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#070d18] divide-y divide-white/6 overflow-hidden shadow-xl">
          {filteredNotices.map((n) => {
            const isRead = readIds.has(n.id);

            // Icon & accent
            let Icon = Bell;
            let iconColor = "text-sky-400 bg-sky-500/10 border-sky-400/25";
            let categoryLabel = "General";

            if (n.category === "material") {
              Icon = BookOpen;
              iconColor = "text-sky-300 bg-sky-500/15 border-sky-400/30";
              categoryLabel = "Material Release";
            } else if (n.category === "admin") {
              Icon = Info;
              iconColor = "text-amber-300 bg-amber-500/15 border-amber-400/30";
              categoryLabel = "Announcement";
            } else if (n.category === "order") {
              if (n.statusKind === "verified") {
                Icon = CheckCircle2;
                iconColor = "text-emerald-400 bg-emerald-500/15 border-emerald-400/30";
                categoryLabel = "Unlocked";
              } else if (n.statusKind === "rejected") {
                Icon = XCircle;
                iconColor = "text-rose-400 bg-rose-500/15 border-rose-400/30";
                categoryLabel = "Action Required";
              } else {
                Icon = Clock;
                iconColor = "text-amber-300 bg-amber-500/15 border-amber-400/30";
                categoryLabel = "Pending";
              }
            }

            return (
              <Link
                key={n.id}
                href={n.href}
                onClick={() => markItemRead(n.id)}
                className={`flex items-start gap-3.5 p-4 sm:p-5 transition-colors group ${
                  isRead ? "hover:bg-white/[0.03]" : "bg-sky-500/[0.04] hover:bg-sky-500/[0.08]"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconColor} mt-0.5`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {categoryLabel}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      • {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                    {!isRead && (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                    )}
                  </div>

                  <h3
                    className={`text-sm font-bold transition-colors leading-snug ${
                      isRead ? "text-slate-200" : "text-white group-hover:text-sky-300"
                    }`}
                  >
                    {n.title}
                  </h3>

                  <p className="text-xs text-wisdom-muted mt-1 leading-relaxed">
                    {n.body}
                  </p>
                </div>

                <div className="shrink-0 self-center">
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
