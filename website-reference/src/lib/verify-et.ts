/**
 * Server-side Verify.ET client — Ethiopian bank / Telebirr payment verification.
 * API key must never leave the server.
 *
 * Docs: https://verify.et/docs/api
 */

import type { PaymentMethodId } from "@/data/packages";

const BASE_URL = (process.env.VERIFY_ET_BASE_URL || "https://verify.et").replace(/\/$/, "");

/** Receiver account suffixes required by Verify.ET for CBE (8) and BOA (5). */
export const VERIFY_ACCOUNT_SUFFIX: Partial<Record<PaymentMethodId, string>> = {
  cbe: (process.env.VERIFY_ET_CBE_SUFFIX || "65070654").slice(-8),
  abyssinia: (process.env.VERIFY_ET_BOA_SUFFIX || "958545").slice(-5),
};

export type VerifyEtBank = "cbe" | "telebirr" | "boa" | "dashen" | "awash" | "mpesa" | "cbebirr" | "siinqee";

export function mapPaymentMethodToBank(method: PaymentMethodId): VerifyEtBank | null {
  switch (method) {
    case "cbe":
      return "cbe";
    case "telebirr":
      return "telebirr";
    case "abyssinia":
      return "boa";
    default:
      return null;
  }
}

export type VerifyEtResult = {
  ok: boolean;
  verified: boolean;
  pending?: boolean;
  requestId?: string;
  amount?: number;
  status?: string;
  message?: string;
  raw?: unknown;
  error?: string;
};

type VerifyBody = Record<string, string | number | undefined>;

function buildBody(
  bank: VerifyEtBank,
  reference: string,
  method: PaymentMethodId
): VerifyBody {
  const ref = reference.trim();
  if (bank === "telebirr") {
    return { bank, transactionNumber: ref, reference: ref };
  }
  if (bank === "cbe") {
    const suffix = VERIFY_ACCOUNT_SUFFIX.cbe;
    return {
      bank,
      referenceNumber: ref,
      accountSuffix: suffix,
      suffix,
    };
  }
  if (bank === "boa") {
    const suffix = VERIFY_ACCOUNT_SUFFIX.abyssinia;
    return {
      bank,
      referenceNumber: ref,
      accountSuffix: suffix,
      suffix,
    };
  }
  return { bank, reference: ref };
}

function extractAmount(data: Record<string, unknown>): number | undefined {
  const candidates = [
    data.amount,
    data.verifiedAmount,
    (data.verification as Record<string, unknown> | undefined)?.amount,
    (data.transaction as Record<string, unknown> | undefined)?.amount,
    (data.data as Record<string, unknown> | undefined)?.amount,
  ];
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) return c;
    if (typeof c === "string" && c.trim() && !Number.isNaN(Number(c))) return Number(c);
  }
  return undefined;
}

function extractVerified(data: Record<string, unknown>): boolean {
  const v = data.verification as Record<string, unknown> | undefined;
  if (v?.verified === true) return true;
  if (v?.status === "success") return true;
  if (data.verified === true) return true;
  if (data.status === "success" || data.status === "verified") return true;
  const nested = data.data as Record<string, unknown> | undefined;
  if (nested?.verified === true) return true;
  return false;
}

function extractPending(data: Record<string, unknown>): boolean {
  const v = data.verification as Record<string, unknown> | undefined;
  const ps = String(v?.processingStatus || data.processingStatus || "");
  return ps === "queued" || ps === "running" || ps === "pending";
}

/**
 * Call Verify.ET to confirm a bank/mobile-money transfer.
 * Uses waitMs for a short inline wait; may still return pending.
 */
export async function verifyTransaction(opts: {
  method: PaymentMethodId;
  reference: string;
  expectedAmountEtb?: number;
  idempotencyKey?: string;
}): Promise<VerifyEtResult> {
  const apiKey = process.env.VERIFY_ET_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      verified: false,
      error: "VERIFY_ET_API_KEY is not configured on the server",
    };
  }

  const bank = mapPaymentMethodToBank(opts.method);
  if (!bank) {
    return {
      ok: false,
      verified: false,
      error: "This payment method is not supported for automatic verification. Upload a receipt instead.",
    };
  }

  if (!opts.reference?.trim()) {
    return { ok: false, verified: false, error: "Transaction reference is required" };
  }

  const body = buildBody(bank, opts.reference, opts.method);
  const waitMs = Number(process.env.VERIFY_ET_WAIT_MS || 8000);
  const url = `${BASE_URL}/api/verify?waitMs=${Math.min(Math.max(waitMs, 0), 15000)}`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "Idempotency-Key":
          opts.idempotencyKey ||
          `wta-${opts.method}-${opts.reference.trim().slice(0, 40)}-${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    const data = (json.data as Record<string, unknown>) || json;
    const requestId = String(json.requestId || data.requestId || "") || undefined;
    const message = String(json.message || data.message || "") || undefined;
    const amount = extractAmount(data) ?? extractAmount(json);
    const verified = extractVerified(data) || extractVerified(json);
    const pending = res.status === 202 || extractPending(data) || extractPending(json);

    if (!res.ok && res.status !== 202) {
      return {
        ok: false,
        verified: false,
        requestId,
        message,
        amount,
        raw: json,
        error:
          message ||
          `Verify.ET returned HTTP ${res.status}. Check the reference and try again.`,
      };
    }

    if (pending && !verified) {
      return {
        ok: true,
        verified: false,
        pending: true,
        requestId,
        amount,
        message: message || "Verification is still processing. We will keep your order pending.",
        raw: json,
      };
    }

    if (verified) {
      if (
        opts.expectedAmountEtb != null &&
        amount != null &&
        Math.abs(amount - opts.expectedAmountEtb) > 1
      ) {
        return {
          ok: true,
          verified: false,
          requestId,
          amount,
          message,
          raw: json,
          error: `Payment found (${amount} ETB) but does not match package price (${opts.expectedAmountEtb} ETB). Order stays pending for admin review.`,
        };
      }
      return {
        ok: true,
        verified: true,
        requestId,
        amount,
        status: "success",
        message: message || "Payment verified",
        raw: json,
      };
    }

    return {
      ok: true,
      verified: false,
      requestId,
      amount,
      message,
      raw: json,
      error:
        message ||
        "Could not confirm this transaction. Double-check the reference or upload a receipt.",
    };
  } catch (e) {
    return {
      ok: false,
      verified: false,
      error: e instanceof Error ? e.message : "Network error talking to Verify.ET",
    };
  }
}

export function isVerifyEtConfigured(): boolean {
  return Boolean(process.env.VERIFY_ET_API_KEY);
}
