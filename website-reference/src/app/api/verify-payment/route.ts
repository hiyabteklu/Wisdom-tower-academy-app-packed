import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  isVerifyEtConfigured,
  mapPaymentMethodToBank,
  verifyTransaction,
} from "@/lib/verify-et";
import type { PaymentMethodId } from "@/data/packages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type Body = {
  orderId?: string;
  packageId?: string;
  packageIds?: string[];
  packageName?: string;
  amountEtb?: number;
  paymentMethod?: PaymentMethodId;
  transactionRef?: string;
  studentName?: string;
  phone?: string;
  email?: string;
  note?: string;
  userId?: string | null;
  dryRun?: boolean;
};

export async function POST(req: NextRequest) {
  if (!isVerifyEtConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Automatic verification is not configured yet. Upload a receipt or enter details for manual review.",
        code: "NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const method = body.paymentMethod;
  const ref = (body.transactionRef || "").trim();
  const amountEtb = Number(body.amountEtb);
  const orderId = (body.orderId || "").trim();

  if (!method || !ref) {
    return NextResponse.json(
      { ok: false, error: "paymentMethod and transactionRef are required" },
      { status: 400 }
    );
  }

  if (!mapPaymentMethodToBank(method)) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "This bank is not supported for automatic verification. Use Telebirr, CBE, or Abyssinia, or upload a receipt.",
        code: "UNSUPPORTED_BANK",
      },
      { status: 400 }
    );
  }

  const result = await verifyTransaction({
    method,
    reference: ref,
    expectedAmountEtb: Number.isFinite(amountEtb) ? amountEtb : undefined,
    idempotencyKey: orderId ? `order-${orderId}` : undefined,
  });

  if (body.dryRun) {
    return NextResponse.json({
      ok: result.ok,
      verified: result.verified,
      pending: result.pending,
      amount: result.amount,
      requestId: result.requestId,
      message: result.message,
      error: result.error,
    });
  }

  if (orderId && body.packageId && body.packageName && Number.isFinite(amountEtb)) {
    const db = adminClient();
    const status = result.verified ? "verified" : "pending_verification";
    const now = new Date().toISOString();

    const row: Record<string, unknown> = {
      id: orderId,
      user_id: body.userId || null,
      package_id: body.packageId,
      package_name: body.packageName,
      amount_etb: amountEtb,
      status,
      payment_method: method,
      student_name: body.studentName || "",
      phone: body.phone || "",
      email: body.email || null,
      transaction_ref: ref,
      note: [
        body.note || "",
        result.requestId ? `verify.et requestId=${result.requestId}` : "",
        result.amount != null ? `verify.et amount=${result.amount}` : "",
        result.verified ? "auto-verified by Verify.ET" : "",
        result.error ? `verify.et: ${result.error}` : "",
      ]
        .filter(Boolean)
        .join(" | ") || null,
      created_at: now,
    };

    if (result.verified) {
      row.verified_at = now;
      row.verified_by = "verify.et";
    }

    if (db) {
      const { error } = await db.from("orders").upsert(row, { onConflict: "id" });
      if (error) {
        console.warn("[verify-payment] order upsert", error.message);
      }

      if (result.verified) {
        const ids =
          Array.isArray(body.packageIds) && body.packageIds.length > 0
            ? body.packageIds
            : body.packageId
              ? [body.packageId]
              : [];
        for (const pid of ids) {
          const enroll: Record<string, unknown> = {
            order_id: orderId,
            package_id: pid,
            package_name: body.packageName,
            email: body.email || null,
            user_id: body.userId || null,
          };
          const { error: enrErr } = await db.from("enrollments").upsert(enroll, {
            ignoreDuplicates: true,
          });
          if (enrErr) console.warn("[verify-payment] enrollment", enrErr.message);
        }
      }
    }
  }

  return NextResponse.json({
    ok: result.ok,
    verified: result.verified,
    pending: result.pending,
    amount: result.amount,
    requestId: result.requestId,
    message: result.message,
    error: result.error,
    status: result.verified ? "verified" : "pending_verification",
  });
}

export async function GET() {
  return NextResponse.json({
    configured: isVerifyEtConfigured(),
    banks: ["telebirr", "cbe", "abyssinia"],
  });
}
