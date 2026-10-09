"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Clock, XCircle, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { listMyOrders, type ManualOrder } from "@/lib/orders";
import { requestNotificationPermissionGently } from "@/lib/fcm-client";
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { getCachedAuthUser } from "@/lib/swr-cache";

type Notice = {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  kind: "verified" | "pending" | "rejected" | "material" | "admin";
};

function orderToNotice(o: ManualOrder): Notice | null {
  if (o.status === "verified") {
    return {
      id: `ord-${o.id}-ok`,
      title: "Package unlocked",
      body: `${o.packageName || o.packageId} is ready in My Learning.`,
      href: "/learning",
      createdAt: o.verifiedAt || o.createdAt,
      kind: "verified",
    };
  }
  if (o.status === "pending_verification" || o.status === "pending_payment") {
    return {
      id: `ord-${o.id}-wait`,
      title: "Payment pending",
      body: `${o.packageName || o.packageId}: waiting for verification.`,
      href: "/orders",
      createdAt: o.createdAt,
      kind: "pending",
    };
  }
  if (o.status === "rejected") {
    return {
      id: `ord-${o.id}-no`,
      title: "Payment needs attention",
      body: `${o.packageName || o.packageId} could not be verified.`,
      href: "/orders",
      createdAt: o.verifiedAt || o.createdAt,
      kind: "rejected",
    };
  }
  return null;
}

const READ_KEY = "wt_notice_read_v1";

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

export default function NotificationBell({
  size = "md",
}: {
  size?: "md" | "lg";
}) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => readReadIds());
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getCachedAuthUser()));
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotices = useCallback(async (): Promise<Notice[]> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    setLoggedIn(Boolean(user));

    const combined: Notice[] = [];

    // 1. System announcements & material notifications
    try {
      const q = new URLSearchParams();
      if (user?.id) q.set("userId", user.id);
      if (user?.email) q.set("email", user.email);
      const res = await fetch(`/api/notifications?${q.toString()}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.notifications)) {
        data.notifications.slice(0, 10).forEach((n: { id: string; title: string; body: string; url?: string; createdAt: string; type?: string }) => {
          combined.push({
            id: n.id,
            title: n.title,
            body: n.body,
            href: n.url || "/learning",
            createdAt: n.createdAt,
            kind: n.type === "material" ? "material" : "admin",
          });
        });
      }
    } catch {
      /* ignore */
    }

    // 2. Orders
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

    combined.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return combined.slice(0, 12);
  }, []);

  const { data: notices = [], refresh } = useCachedQuery<Notice[]>(
    "notifications:bell",
    fetchNotices,
    {
      scope: "user",
      enabled: loggedIn,
    }
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setLoggedIn(Boolean(session?.user));
      void refresh();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
    };
  }, [open]);

  if (!loggedIn) return null;

  const unread = notices.filter((n) => !readIds.has(n.id)).length;
  const icon = size === "lg" ? 22 : 18;

  function markAllRead() {
    const next = new Set(readIds);
    notices.forEach((n) => next.add(n.id));
    setReadIds(next);
    writeReadIds(next);
  }

  function markRead(id: string) {
    const next = new Set(readIds);
    next.add(id);
    setReadIds(next);
    writeReadIds(next);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) {
            markAllRead();
            void requestNotificationPermissionGently();
          }
        }}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        title="Notifications"
        className={`relative p-2 rounded-full border transition-all ${
          open
            ? "border-amber-400/40 bg-amber-500/10 text-amber-300"
            : "border-transparent text-wisdom-muted hover:text-white hover:bg-white/5 hover:border-white/10"
        }`}
      >
        <Bell style={{ width: icon, height: icon }} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 rounded-full bg-amber-400 text-[9px] font-bold text-wisdom-dark flex items-center justify-center leading-none ring-2 ring-wisdom-dark">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed z-[70] w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl border border-white/12 bg-[#0a0f1a] shadow-2xl overflow-hidden
            left-1/2 -translate-x-1/2 top-[4.25rem]
            sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:translate-x-0"
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Notifications</p>
            <button
              type="button"
              onClick={markAllRead}
              className="text-[11px] text-wisdom-muted hover:text-amber-300"
            >
              Mark all read
            </button>
          </div>
          {notices.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-wisdom-muted">No notifications yet</p>
          ) : (
            <ul className="max-h-[min(20rem,50vh)] overflow-y-auto">
              {notices.map((n) => {
                const Icon =
                  n.kind === "material"
                    ? BookOpen
                    : n.kind === "admin"
                      ? Bell
                      : n.kind === "verified"
                        ? CheckCircle2
                        : n.kind === "rejected"
                          ? XCircle
                          : Clock;
                const color =
                  n.kind === "material"
                    ? "text-sky-400"
                    : n.kind === "admin"
                      ? "text-cyan-300"
                      : n.kind === "verified"
                        ? "text-emerald-400"
                        : n.kind === "rejected"
                          ? "text-rose-400"
                          : "text-amber-400";
                return (
                  <li key={n.id} className="border-b border-white/5 last:border-0">
                    <Link
                      href={n.href}
                      onClick={() => {
                        markRead(n.id);
                        setOpen(false);
                      }}
                      className="flex gap-3 px-4 py-3 hover:bg-white/5 transition"
                    >
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${color}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">{n.title}</p>
                        <p className="text-xs text-wisdom-muted leading-relaxed">{n.body}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="border-t border-white/10 px-4 py-2">
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-cyan-300 hover:underline"
            >
              View all orders
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
