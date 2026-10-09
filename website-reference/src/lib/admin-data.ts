/**
 * Admin dashboard data helpers (client-side via anon key + RLS for authenticated).
 */
import { supabase } from "@/lib/supabase";
import type { ManualOrder, OrderStatus } from "@/lib/orders";

export type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone?: string | null;
  avatar_url: string | null;
  avatar_preset?: string | null;
  education_level?: string | null;
  school_name?: string | null;
  town_region?: string | null;
  stream?: string | null;
  student_id_number?: string | null;
  student_folio_number?: string | null;
  target_exam?: string | null;
  created_at: string;
  updated_at: string | null;
};

export type InquiryRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  service: string | null;
  message: string;
  status: string;
  admin_notes: string | null;
};

export type EnrollmentRow = {
  id: string;
  package_id: string;
  package_name: string;
  email: string | null;
  user_id: string | null;
  created_at: string;
};

export type TalentApplicationRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  category: string | null;
  service: string | null;
  letter_of_interest: string | null;
  portfolio_url: string | null;
  experience: string | null;
  availability: string | null;
  hours_per_week: string | null;
  heard_about: string | null;
  requirements_confirmed: boolean | null;
  status: string;
  admin_notes: string | null;
};

export type DayCount = { day: string; label: string; orders: number; verified: number; revenue: number };

export type AdminStats = {
  users: number;
  ordersTotal: number;
  ordersPending: number;
  ordersVerified: number;
  ordersRejected: number;
  revenueVerifiedEtb: number;
  pipelineEtb: number;
  conversionPct: number;
  avgOrderEtb: number;
  enrollments: number;
  inquiriesNew: number;
  inquiriesTotal: number;
  explanationsCached: number;
  academicResults: number;
  todayOrdersCount: number;
  todayVerifiedCount: number;
  todayRevenueEtb: number;
  urgentPendingOrdersCount: number;
  byPackage: { name: string; count: number; revenue: number }[];
  byStatus: { status: OrderStatus; count: number }[];
  byMethod: { method: string; count: number; totalEtb: number }[];
  byStream: { stream: string; count: number }[];
  byEducationLevel: { level: string; count: number }[];
  last7Days: DayCount[];
  recentOrders: ManualOrder[];
  recentUsers: ProfileRow[];
  recentInquiries: InquiryRow[];
  recentEnrollments: EnrollmentRow[];
};

export type DigitalAdminStats = {
  users: number;
  inquiriesTotal: number;
  inquiriesNew: number;
  talentTotal: number;
  talentNew: number;
  byCategory: { label: string; count: number }[];
  byService: { label: string; count: number }[];
  byTalentStatus: { label: string; count: number }[];
  last7DaysInquiries: { day: string; label: string; count: number }[];
  last7DaysTalent: { day: string; label: string; count: number }[];
  recentInquiries: InquiryRow[];
  recentTalent: TalentApplicationRow[];
  recentUsers: ProfileRow[];
};

function orderFromRow(row: Record<string, unknown>): ManualOrder {
  return {
    id: String(row.id),
    packageId: String(row.package_id),
    packageName: String(row.package_name),
    amountEtb: Number(row.amount_etb),
    status: row.status as OrderStatus,
    paymentMethod: row.payment_method as ManualOrder["paymentMethod"],
    studentName: String(row.student_name),
    phone: String(row.phone),
    email: row.email ? String(row.email) : undefined,
    transactionRef: String(row.transaction_ref),
    note: row.note ? String(row.note) : undefined,
    receiptUrl: row.receipt_url ? String(row.receipt_url) : undefined,
    createdAt: String(row.created_at),
    userId: row.user_id ? String(row.user_id) : null,
    verifiedAt: row.verified_at ? String(row.verified_at) : null,
    verifiedBy: row.verified_by ? String(row.verified_by) : null,
  };
}

function buildLast7Days(orders: ManualOrder[]): DayCount[] {
  const days: DayCount[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    const dayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === key);
    const verifiedOrders = dayOrders.filter((o) => o.status === "verified");
    const dayRevenue = verifiedOrders.reduce((sum, o) => sum + (o.amountEtb || 0), 0);
    days.push({
      day: key,
      label,
      orders: dayOrders.length,
      verified: verifiedOrders.length,
      revenue: dayRevenue,
    });
  }
  return days;
}

function buildLast7DayCounts(
  rows: { created_at: string }[]
): { day: string; label: string; count: number }[] {
  const days: { day: string; label: string; count: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(undefined, { weekday: "short" });
    const count = rows.filter((r) => r.created_at.slice(0, 10) === key).length;
    days.push({ day: key, label, count });
  }
  return days;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const empty: AdminStats = {
    users: 0,
    ordersTotal: 0,
    ordersPending: 0,
    ordersVerified: 0,
    ordersRejected: 0,
    revenueVerifiedEtb: 0,
    pipelineEtb: 0,
    conversionPct: 0,
    avgOrderEtb: 0,
    enrollments: 0,
    inquiriesNew: 0,
    inquiriesTotal: 0,
    explanationsCached: 0,
    academicResults: 0,
    todayOrdersCount: 0,
    todayVerifiedCount: 0,
    todayRevenueEtb: 0,
    urgentPendingOrdersCount: 0,
    byPackage: [],
    byStatus: [],
    byMethod: [],
    byStream: [],
    byEducationLevel: [],
    last7Days: buildLast7Days([]),
    recentOrders: [],
    recentUsers: [],
    recentInquiries: [],
    recentEnrollments: [],
  };

  try {
    const [
      profilesRes,
      ordersRes,
      enrollRes,
      inquiriesRes,
      explainRes,
      academicRes,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, education_level, school_name, stream, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("enrollments")
        .select("id, package_id, package_name, email, user_id, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("question_explanations").select("question_id", { count: "exact", head: true }),
      supabase.from("academic_results").select("id", { count: "exact", head: true }),
    ]);

    const profiles = (profilesRes.data || []) as ProfileRow[];
    const orders = (ordersRes.data || []).map((r) =>
      orderFromRow(r as Record<string, unknown>)
    );
    const enrollments = (enrollRes.data || []) as EnrollmentRow[];
    const inquiries = (inquiriesRes.data || []) as InquiryRow[];

    const pending = orders.filter((o) => o.status === "pending_verification");
    const verified = orders.filter((o) => o.status === "verified");
    const rejected = orders.filter((o) => o.status === "rejected");

    const revenueVerifiedEtb = verified.reduce((s, o) => s + (o.amountEtb || 0), 0);
    const pipelineEtb = pending.reduce((s, o) => s + (o.amountEtb || 0), 0);
    const conversionPct =
      orders.length > 0 ? Math.round((verified.length / orders.length) * 1000) / 10 : 0;
    const avgOrderEtb =
      verified.length > 0 ? Math.round(revenueVerifiedEtb / verified.length) : 0;

    const nowIso = new Date().toISOString().slice(0, 10);
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const urgentPendingOrdersCount = pending.filter(
      (o) => new Date(o.createdAt).getTime() < twoHoursAgo
    ).length;
    const todayOrders = orders.filter((o) => o.createdAt.slice(0, 10) === nowIso);
    const todayVerified = todayOrders.filter((o) => o.status === "verified");
    const todayRevenueEtb = todayVerified.reduce((s, o) => s + (o.amountEtb || 0), 0);

    const pkgMap = new Map<string, { count: number; revenue: number }>();
    for (const o of orders) {
      const cur = pkgMap.get(o.packageName) || { count: 0, revenue: 0 };
      cur.count += 1;
      if (o.status === "verified") {
        cur.revenue += o.amountEtb || 0;
      }
      pkgMap.set(o.packageName, cur);
    }
    const byPackage = Array.from(pkgMap.entries())
      .map(([name, val]) => ({ name, count: val.count, revenue: val.revenue }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const methodMap = new Map<string, { count: number; totalEtb: number }>();
    for (const o of orders) {
      const m = o.paymentMethod || "unknown";
      const cur = methodMap.get(m) || { count: 0, totalEtb: 0 };
      cur.count += 1;
      if (o.status === "verified") {
        cur.totalEtb += o.amountEtb || 0;
      }
      methodMap.set(m, cur);
    }
    const byMethod = Array.from(methodMap.entries())
      .map(([method, val]) => ({ method, count: val.count, totalEtb: val.totalEtb }))
      .sort((a, b) => b.count - a.count);

    const streamMap = new Map<string, number>();
    for (const p of profiles) {
      const s = p.stream
        ? p.stream.toLowerCase().includes("nat")
          ? "Natural Science"
          : p.stream.toLowerCase().includes("soc")
            ? "Social Science"
            : p.stream
        : "Unspecified";
      streamMap.set(s, (streamMap.get(s) || 0) + 1);
    }
    const byStream = Array.from(streamMap.entries())
      .map(([stream, count]) => ({ stream, count }))
      .sort((a, b) => b.count - a.count);

    const eduMap = new Map<string, number>();
    for (const p of profiles) {
      const lvl = p.education_level ? p.education_level.replace(/_/g, " ") : "Not set";
      eduMap.set(lvl, (eduMap.get(lvl) || 0) + 1);
    }
    const byEducationLevel = Array.from(eduMap.entries())
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const statusKeys: OrderStatus[] = [
      "pending_verification",
      "verified",
      "rejected",
      "pending_payment",
    ];
    const byStatus = statusKeys.map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    }));

    return {
      users: profiles.length,
      ordersTotal: orders.length,
      ordersPending: pending.length,
      ordersVerified: verified.length,
      ordersRejected: rejected.length,
      revenueVerifiedEtb,
      pipelineEtb,
      conversionPct,
      avgOrderEtb,
      enrollments: enrollments.length,
      inquiriesNew: inquiries.filter((i) => i.status === "new").length,
      inquiriesTotal: inquiries.length,
      explanationsCached: explainRes.count ?? 0,
      academicResults: academicRes.count ?? 0,
      todayOrdersCount: todayOrders.length,
      todayVerifiedCount: todayVerified.length,
      todayRevenueEtb,
      urgentPendingOrdersCount,
      byPackage,
      byStatus,
      byMethod,
      byStream,
      byEducationLevel,
      last7Days: buildLast7Days(orders),
      recentOrders: orders.slice(0, 10),
      recentUsers: profiles.slice(0, 10),
      recentInquiries: inquiries.slice(0, 8),
      recentEnrollments: enrollments.slice(0, 8),
    };
  } catch (e) {
    console.warn("[admin-stats]", e);
    return empty;
  }
}

export async function fetchDigitalAdminStats(): Promise<DigitalAdminStats> {
  const empty: DigitalAdminStats = {
    users: 0,
    inquiriesTotal: 0,
    inquiriesNew: 0,
    talentTotal: 0,
    talentNew: 0,
    byCategory: [],
    byService: [],
    byTalentStatus: [],
    last7DaysInquiries: buildLast7DayCounts([]),
    last7DaysTalent: buildLast7DayCounts([]),
    recentInquiries: [],
    recentTalent: [],
    recentUsers: [],
  };

  try {
    const [profilesRes, inquiriesRes, talentRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300),
      supabase
        .from("talent_applications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300),
    ]);

    const profiles = (profilesRes.data || []) as ProfileRow[];
    const inquiries = (inquiriesRes.data || []) as InquiryRow[];
    const talent = (talentRes.data || []) as TalentApplicationRow[];

    const catMap = new Map<string, number>();
    for (const t of talent) {
      const k = t.category || "Uncategorized";
      catMap.set(k, (catMap.get(k) || 0) + 1);
    }
    const byCategory = Array.from(catMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const svcMap = new Map<string, number>();
    for (const t of talent) {
      const k = t.service || "General";
      svcMap.set(k, (svcMap.get(k) || 0) + 1);
    }
    const byService = Array.from(svcMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const statusMap = new Map<string, number>();
    for (const t of talent) {
      const k = t.status || "new";
      statusMap.set(k, (statusMap.get(k) || 0) + 1);
    }
    const byTalentStatus = Array.from(statusMap.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    return {
      users: profiles.length,
      inquiriesTotal: inquiries.length,
      inquiriesNew: inquiries.filter((i) => i.status === "new").length,
      talentTotal: talent.length,
      talentNew: talent.filter((t) => t.status === "new").length,
      byCategory,
      byService,
      byTalentStatus,
      last7DaysInquiries: buildLast7DayCounts(inquiries),
      last7DaysTalent: buildLast7DayCounts(talent),
      recentInquiries: inquiries.slice(0, 8),
      recentTalent: talent.slice(0, 8),
      recentUsers: profiles.slice(0, 10),
    };
  } catch (e) {
    console.warn("[digital-admin-stats]", e);
    return empty;
  }
}

export async function listProfiles(): Promise<ProfileRow[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, phone, avatar_url, avatar_preset, education_level, school_name, town_region, stream, student_id_number, student_folio_number, target_exam, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error && data) {
      return data as ProfileRow[];
    }
  } catch (e) {
    console.warn("[profiles rich fetch failed]", e);
  }

  // Graceful fallback if newer columns don't exist yet
  const { data: fallbackData, error: fbError } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (fbError) {
    console.warn("[profiles fallback]", fbError.message);
    return [];
  }
  return (fallbackData || []) as ProfileRow[];
}

export async function getStudentDetail(userId: string, email?: string | null) {
  try {
    const queries = [
      supabase
        .from("academic_results")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(25),
      supabase
        .from("enrollments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ];

    const [resultsRes, enrollRes] = await Promise.all(queries);

    let accessGrants: Record<string, unknown>[] = [];
    let orders: Record<string, unknown>[] = [];

    if (email) {
      const emailLower = email.toLowerCase();
      const [grantsRes, ordersRes] = await Promise.all([
        supabase.from("access_grants").select("*").eq("email", emailLower),
        supabase.from("orders").select("*").eq("email", emailLower).order("created_at", { ascending: false }),
      ]);
      if (grantsRes?.data) accessGrants = grantsRes.data;
      if (ordersRes?.data) orders = ordersRes.data;
    }

    return {
      academicResults: resultsRes?.data || [],
      enrollments: enrollRes?.data || [],
      accessGrants,
      orders,
    };
  } catch (e) {
    console.warn("[getStudentDetail]", e);
    return {
      academicResults: [],
      enrollments: [],
      accessGrants: [],
      orders: [],
    };
  }
}

/** Universal CSV downloader for Admin records */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  if (typeof window === "undefined") return;

  const escapeCell = (val: string | number | boolean | null | undefined) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const content = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\r\n");

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function listInquiries(): Promise<InquiryRow[]> {
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.warn("[inquiries]", error.message);
    return [];
  }
  return (data || []) as InquiryRow[];
}

export async function updateInquiryStatus(
  id: string,
  status: string,
  adminNotes?: string
): Promise<{ ok: boolean; error?: string }> {
  const payload: Record<string, unknown> = { status };
  if (adminNotes !== undefined) payload.admin_notes = adminNotes;
  const { error } = await supabase.from("inquiries").update(payload).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function listTalentApplications(): Promise<TalentApplicationRow[]> {
  const { data, error } = await supabase
    .from("talent_applications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) {
    console.warn("[talent_applications]", error.message);
    return [];
  }
  return (data || []) as TalentApplicationRow[];
}

export async function updateTalentApplicationStatus(
  id: string,
  status: string,
  adminNotes?: string
): Promise<{ ok: boolean; error?: string }> {
  const payload: Record<string, unknown> = { status };
  if (adminNotes !== undefined) payload.admin_notes = adminNotes;
  const { error } = await supabase.from("talent_applications").update(payload).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
