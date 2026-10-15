import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";

/**
 * Admin check for API routes (same rule as /api/notifications/send).
 * The caller must send the signed-in admin's Supabase access token as
 * `Authorization: Bearer <token>` and the e-mail on that token must be an admin e-mail.
 * The identity is read ONLY from the verified token, never from the request body or query.
 */

function bearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

export type AdminCheck =
  | { ok: true; email: string }
  | { ok: false; response: NextResponse };

export async function requireAdmin(req: NextRequest): Promise<AdminCheck> {
  const token = bearerToken(req);
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Please sign in as an admin first." },
        { status: 401 }
      ),
    };
  }

  const verifier = createServiceClient();
  if (!verifier) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "The server is not configured to verify admins." },
        { status: 500 }
      ),
    };
  }

  const { data: userData, error: userError } = await verifier.auth.getUser(token);
  if (userError || !userData.user) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Your session has expired. Please sign in again." },
        { status: 401 }
      ),
    };
  }

  const email = userData.user.email ?? null;
  if (!isAdminEmail(email)) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Only admins can do this." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, email: email as string };
}
