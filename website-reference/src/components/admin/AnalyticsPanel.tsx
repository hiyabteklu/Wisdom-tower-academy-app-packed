"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { fetchAdminStats, type AdminStats } from "@/lib/admin-data";
import { statusLabel } from "@/lib/orders";
import { formatEtb } from "@/data/packages";
import BrandLoader from "@/components/BrandLoader";
import {
  Users,
  CreditCard,
  GraduationCap,
  Inbox,
  Activity,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Percent,
  Wallet,
  Clock,
  AlertCircle,
  Calendar,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Building,
  CheckCircle2,
} from "lucide-react";

function MetricCard({
  label,
  value,
  secondary,
  hint,
  icon: Icon,
  accentColor,
  trend,
}: {
  label: string;
  value: string | number;
  secondary?: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: "emerald" | "amber" | "cyan" | "purple" | "rose" | "sky";
  trend?: string;
}) {
  const colorMap = {
    emerald: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    amber: "border-amber-400/20 bg-amber-500/10 text-amber-300",
    cyan: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
    purple: "border-purple-400/20 bg-purple-500/10 text-purple-300",
    rose: "border-rose-400/20 bg-rose-500/10 text-rose-300",
    sky: "border-sky-400/20 bg-sky-500/10 text-sky-300",
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-wisdom-card p-4 sm:p-5 flex flex-col justify-between hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-wisdom-muted">
            {label}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
              {value}
            </span>
            {secondary && (
              <span className="text-xs font-semibold text-wisdom-muted">{secondary}</span>
            )}
          </div>
        </div>
        <div className={`p-2.5 rounded-xl border shrink-0 ${colorMap[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(hint || trend) && (
        <div className="mt-3 pt-2.5 border-t border-white/6 flex items-center justify-between text-xs text-wisdom-muted">
          <span>{hint}</span>
          {trend && <span className="font-semibold text-emerald-400">{trend}</span>}
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return iso;
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function AnalyticsPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState<"all" | "order" | "enroll" | "inquiry" | "user">("all");
  const [activityOpen, setActivityOpen] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchAdminStats();
    setStats(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activityItems = useMemo(() => {
    if (!stats) return [];
    type ActivityItem = { id: string; text: string; when: string; kind: "order" | "enroll" | "inquiry" | "user"; detail?: string };
    const list: ActivityItem[] = [];

    for (const o of stats.recentOrders) {
      list.push({
        id: `o-${o.id}`,
        kind: "order",
        when: o.createdAt,
        text: `Order ${o.id} · ${o.packageName} · ${o.studentName}`,
        detail: `${statusLabel(o.status)} (${formatEtb(o.amountEtb)}) via ${o.paymentMethod || "bank"}`,
      });
    }
    for (const e of stats.recentEnrollments) {
      list.push({
        id: `e-${e.id}`,
        kind: "enroll",
        when: e.created_at,
        text: `Unlocked · ${e.package_name}`,
        detail: e.email || "Active Enrollment",
      });
    }
    for (const i of stats.recentInquiries) {
      list.push({
        id: `i-${i.id}`,
        kind: "inquiry",
        when: i.created_at,
        text: `Inquiry from ${i.name} (${i.service || "General"})`,
        detail: i.message.slice(0, 90) + (i.message.length > 90 ? "…" : ""),
      });
    }
    for (const u of stats.recentUsers) {
      list.push({
        id: `u-${u.id}`,
        kind: "user",
        when: u.created_at,
        text: `New student registration: ${u.full_name || u.email || "Scholar"}`,
        detail: [u.school_name, u.stream, u.town_region].filter(Boolean).join(" · ") || u.email || "Registered profile",
      });
    }

    list.sort((a, b) => b.when.localeCompare(a.when));
    return list;
  }, [stats]);

  const filteredActivity = useMemo(() => {
    if (activityFilter === "all") return activityItems.slice(0, 16);
    return activityItems.filter((i) => i.kind === activityFilter).slice(0, 16);
  }, [activityItems, activityFilter]);

  if (loading && !stats) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3" data-wta-spinner="true">
        <BrandLoader size="md" label="Loading executive metrics..." />
      </div>
    );
  }

  const s = stats!;
  const maxDayOrders = Math.max(1, ...s.last7Days.map((d) => d.orders));

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/8 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Executive Intelligence & Operational Overview
          </h2>
          <p className="text-xs sm:text-sm text-wisdom-muted mt-0.5">
            Real-time financial telemetry, student enrollment, and platform usage metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/12 text-sm font-semibold hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Today's Pulse Alert Bar (if orders/revenue exist today) */}
      <div className="rounded-2xl border border-cyan-400/20 bg-cyan-950/20 p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
          </span>
          <div>
            <span className="font-bold text-white">Today&apos;s Pulse:</span>{" "}
            <span className="text-cyan-200">
              {s.todayOrdersCount} order{s.todayOrdersCount === 1 ? "" : "s"} placed today
            </span>
            <span className="text-wisdom-muted"> · </span>
            <span className="text-emerald-300 font-semibold">
              {formatEtb(s.todayRevenueEtb)} verified today
            </span>
          </div>
        </div>

        {s.urgentPendingOrdersCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
            <AlertCircle className="w-3.5 h-3.5" />
            {s.urgentPendingOrdersCount} order{s.urgentPendingOrdersCount === 1 ? "" : "s"} awaiting approval &gt; 2 hrs
          </div>
        )}
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <MetricCard
          label="Verified Revenue"
          value={formatEtb(s.revenueVerifiedEtb)}
          hint={`${s.ordersVerified} approved orders`}
          secondary={`avg ${formatEtb(s.avgOrderEtb)}`}
          icon={Wallet}
          accentColor="emerald"
        />
        <MetricCard
          label="Pending Pipeline"
          value={formatEtb(s.pipelineEtb)}
          hint={`${s.ordersPending} pending payment confirmation`}
          icon={Clock}
          accentColor="amber"
        />
        <MetricCard
          label="Registered Scholars"
          value={s.users}
          hint={`${s.enrollments} total unlocked package grants`}
          icon={Users}
          accentColor="purple"
        />
        <MetricCard
          label="Order Conversion"
          value={`${s.conversionPct}%`}
          hint={`${s.ordersTotal} checkouts initiated`}
          icon={Percent}
          accentColor="cyan"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-white/8 bg-wisdom-card/70 p-3.5 sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-wisdom-muted">
            Course Enrollments
          </p>
          <p className="text-xl sm:text-2xl font-bold text-white mt-1 tabular-nums">{s.enrollments}</p>
          <p className="text-[11px] text-wisdom-muted mt-0.5">Active scholar access seats</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-wisdom-card/70 p-3.5 sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-wisdom-muted">
            AI Explanations
          </p>
          <p className="text-xl sm:text-2xl font-bold text-cyan-300 mt-1 tabular-nums">{s.explanationsCached}</p>
          <p className="text-[11px] text-wisdom-muted mt-0.5">Cached tutor explanations</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-wisdom-card/70 p-3.5 sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-wisdom-muted">
            Quiz Submissions
          </p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-300 mt-1 tabular-nums">{s.academicResults}</p>
          <p className="text-[11px] text-wisdom-muted mt-0.5">Completed exam sessions</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-wisdom-card/70 p-3.5 sm:p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-wisdom-muted">
            Inquiries & Support
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">{s.inquiriesTotal}</span>
            {s.inquiriesNew > 0 && (
              <span className="text-xs font-semibold text-amber-400">({s.inquiriesNew} new)</span>
            )}
          </div>
          <p className="text-[11px] text-wisdom-muted mt-0.5">Student support messages</p>
        </div>
      </div>

      {/* Charts & Analytical Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column: Last 7 Days Interactive Order Flow */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-wisdom-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-white">Daily Order & Revenue Velocity</h3>
            </div>
            <span className="text-xs text-wisdom-muted">Last 7 Days</span>
          </div>

          {/* Bar Visualizer */}
          <div className="flex items-end justify-between gap-2 sm:gap-3 h-44 pt-4 border-b border-white/8 pb-3">
            {s.last7Days.map((d) => {
              const heightPct = Math.round((d.orders / maxDayOrders) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="text-[10px] text-wisdom-muted tabular-nums opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatEtb(d.revenue)}
                  </div>
                  <div className="w-full max-w-[42px] h-32 flex flex-col justify-end rounded-lg bg-white/5 p-0.5 overflow-hidden">
                    <div
                      className="w-full rounded-md bg-gradient-to-t from-cyan-600 via-cyan-400 to-amber-300 transition-all duration-500 ease-out"
                      style={{ height: `${Math.max(d.orders ? 10 : 2, heightPct)}%` }}
                      title={`${d.day}: ${d.orders} orders (${d.verified} verified, ${formatEtb(d.revenue)})`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-white tabular-nums">{d.orders}</p>
                    <p className="text-[10px] text-wisdom-muted uppercase tracking-wider">{d.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-wisdom-muted pt-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              <span>Orders placed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span>Verified revenue</span>
            </div>
            <span>Updated in real time</span>
          </div>
        </div>

        {/* Right Column: Payment Method Distribution */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-wisdom-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-white">Payment Rail Share</h3>
            </div>
            <span className="text-xs text-wisdom-muted">{s.ordersTotal} transactions</span>
          </div>

          {s.byMethod.length === 0 ? (
            <p className="text-sm text-wisdom-muted text-center py-10">No orders recorded yet</p>
          ) : (
            <div className="space-y-3.5">
              {s.byMethod.map((m) => {
                const pct = s.ordersTotal > 0 ? Math.round((m.count / s.ordersTotal) * 100) : 0;
                return (
                  <div key={m.method} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white uppercase tracking-wider">
                        {m.method}
                      </span>
                      <span className="text-wisdom-muted">
                        <strong className="text-emerald-300">{formatEtb(m.totalEtb)}</strong> · {m.count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-white/8 text-xs text-wisdom-muted flex items-center justify-between">
            <span>Direct bank transfer & Telebirr integration</span>
            <span className="text-emerald-400 font-semibold">100% Ethiopian Rail</span>
          </div>
        </div>
      </div>

      {/* Academic Demographics & Top Packages Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Top Performing Academic Packages */}
        <div className="rounded-2xl border border-white/10 bg-wisdom-card p-5 space-y-3.5">
          <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-white">Top Packages by Enrollment</h3>
            </div>
            <span className="text-xs text-wisdom-muted">By order volume</span>
          </div>

          {s.byPackage.length === 0 ? (
            <p className="text-sm text-wisdom-muted text-center py-8">No package enrollments yet</p>
          ) : (
            <div className="space-y-3">
              {s.byPackage.map((pkg, idx) => (
                <div key={pkg.name} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/5 text-[11px] font-bold text-wisdom-muted">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-white/90 truncate">{pkg.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-amber-300">{formatEtb(pkg.revenue)}</span>
                    <span className="text-xs text-wisdom-muted block">{pkg.count} orders</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Academic Stream & Education Demographics */}
        <div className="rounded-2xl border border-white/10 bg-wisdom-card p-5 space-y-3.5">
          <div className="flex items-center justify-between gap-3 border-b border-white/8 pb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold text-white">Scholar Stream Demographics</h3>
            </div>
            <span className="text-xs text-wisdom-muted">{s.users} registered</span>
          </div>

          {s.byStream.length === 0 ? (
            <p className="text-sm text-wisdom-muted text-center py-8">No student profiles registered yet</p>
          ) : (
            <div className="space-y-3">
              {s.byStream.map((stream) => {
                const pct = s.users > 0 ? Math.round((stream.count / s.users) * 100) : 0;
                return (
                  <div key={stream.stream} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-white/90">{stream.stream}</span>
                      <span className="text-wisdom-muted">
                        {stream.count} scholars ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Live Operational Ledger & Audit Stream */}
      <div className="rounded-2xl border border-white/10 bg-wisdom-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-white/8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-semibold text-white">Real-Time Operational Audit Feed</h3>
              <p className="text-xs text-wisdom-muted">
                Live stream of student signups, order payments, access grants, and inquiries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/8 text-xs font-semibold">
            {(
              [
                ["all", "All"],
                ["order", "Orders"],
                ["enroll", "Grants"],
                ["inquiry", "Inquiries"],
                ["user", "Scholars"],
              ] as const
            ).map(([filterId, filterLabel]) => (
              <button
                key={filterId}
                type="button"
                onClick={() => setActivityFilter(filterId)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activityFilter === filterId
                    ? "bg-cyan-500 text-wisdom-dark font-bold shadow-sm"
                    : "text-wisdom-muted hover:text-white"
                }`}
              >
                {filterLabel}
              </button>
            ))}
          </div>
        </div>

        {filteredActivity.length === 0 ? (
          <div className="p-8 text-center text-wisdom-muted text-sm">
            No events found in this filter category
          </div>
        ) : (
          <div className="divide-y divide-white/6 max-h-[460px] overflow-y-auto">
            {filteredActivity.map((item) => (
              <div
                key={item.id}
                className="p-3.5 sm:px-5 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 text-sm hover:bg-white/[0.02]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block h-2 w-2 rounded-full shrink-0 ${
                        item.kind === "order"
                          ? "bg-amber-400"
                          : item.kind === "enroll"
                            ? "bg-emerald-400"
                            : item.kind === "inquiry"
                              ? "bg-sky-400"
                              : "bg-purple-400"
                      }`}
                    />
                    <p className="font-semibold text-white/95 truncate">{item.text}</p>
                  </div>
                  {item.detail && (
                    <p className="text-xs text-wisdom-muted mt-0.5 pl-4 truncate">{item.detail}</p>
                  )}
                </div>
                <span className="text-xs text-wisdom-muted shrink-0 tabular-nums">
                  {timeAgo(item.when)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
