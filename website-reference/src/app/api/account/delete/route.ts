import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase-server";

/**
 * POST /api/account/delete
 *
 * Permanently deletes the signed-in student's account (Google Play requires
 * in-app + web account deletion). The user is read ONLY from the Bearer
 * access token; any user id in the body is ignored. Body: { "confirm": "DELETE" }.
 *
 * What is deleted: sign-in account, profile, learning progress, exam attempts,
 * academic results, enrollments, access grants, device tokens, orders that
 * were never verified (with their receipt images), and contact / talent
 * messages sent with the account e-mail.
 * What is kept: orders with status "verified" (transaction records kept five
 * years, see Privacy Policy section 9). Their user_id becomes null when the
 * auth user is removed (foreign key ON DELETE SET NULL).
 *
 * Runs with the service-role key (server only, never exposed).
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RECEIPT_BUCKET = "payment-receipts";

function bearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

function receiptPath(url: unknown): string | null {
  if (typeof url !== "string") return null;
  const marker = `/${RECEIPT_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index < 0) return null;
  const raw = url.slice(index + marker.length).split("?")[0];
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function POST(req: NextRequest) {
  const admin = createServiceClient();
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "The server is not configured for account deletion." },
      { status: 500 }
    );
  }

  const token = bearerToken(req);
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Please sign in first." },
      { status: 401 }
    );
  }

  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const confirm = (body as { confirm?: unknown } | null)?.confirm;
  if (confirm !== "DELETE") {
    return NextResponse.json(
      { success: false, error: "Confirmation missing. Send { \"confirm\": \"DELETE\" }." },
      { status: 400 }
    );
  }

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json(
      { success: false, error: "Your session has expired. Please sign in again." },
      { status: 401 }
    );
  }

  const userId = userData.user.id;
  const emails = Array.from(
    new Set(
      [userData.user.email, userData.user.email?.toLowerCase()].filter(
        (e): e is string => Boolean(e)
      )
    )
  );

  const failures: string[] = [];
  const step = async (
    name: string,
    run: () => PromiseLike<{ error: { message: string } | null }>
  ) => {
    try {
      const { error } = await run();
      if (error) {
        console.error(`[delete-account] ${name} failed:`, error.message);
        failures.push(name);
      }
    } catch (err) {
      console.error(`[delete-account] ${name} threw:`, err);
      failures.push(name);
    }
  };

  // 1. Receipt images of orders that will be deleted (best effort, not a failure if it does not work).
  try {
    const receipts: string[] = [];
    const byUser = await admin
      .from("orders")
      .select("receipt_url")
      .neq("status", "verified")
      .eq("user_id", userId);
    for (const row of byUser.data ?? []) {
      const p = receiptPath((row as { receipt_url?: unknown }).receipt_url);
      if (p) receipts.push(p);
    }
    if (emails.length > 0) {
      const byEmail = await admin
        .from("orders")
        .select("receipt_url")
        .neq("status", "verified")
        .in("email", emails);
      for (const row of byEmail.data ?? []) {
        const p = receiptPath((row as { receipt_url?: unknown }).receipt_url);
        if (p) receipts.push(p);
      }
    }
    if (receipts.length > 0) {
      await admin.storage.from(RECEIPT_BUCKET).remove(Array.from(new Set(receipts)));
    }
  } catch (err) {
    console.warn("[delete-account] receipt cleanup skipped:", err);
  }

  // 2. Rows keyed by user id or e-mail.
  await step("user_device_tokens", () =>
    admin.from("user_device_tokens").delete().eq("user_id", userId)
  );
  await step("access_grants", () =>
    admin.from("access_grants").delete().eq("user_id", userId)
  );
  await step("orders", () =>
    admin.from("orders").delete().neq("status", "verified").eq("user_id", userId)
  );
  await step("enrollments", () =>
    admin.from("enrollments").delete().eq("user_id", userId)
  );
  await step("academic_results", () =>
    admin.from("academic_results").delete().eq("user_id", userId)
  );
  await step("learning_progress", () =>
    admin.from("learning_progress").delete().eq("user_id", userId)
  );
  await step("exam_attempts", () =>
    admin.from("exam_attempts").delete().eq("user_id", userId)
  );

  if (emails.length > 0) {
    await step("access_grants_email", () =>
      admin.from("access_grants").delete().in("email", emails)
    );
    await step("orders_email", () =>
      admin.from("orders").delete().neq("status", "verified").in("email", emails)
    );
    await step("enrollments_email", () =>
      admin.from("enrollments").delete().in("email", emails)
    );
    await step("inquiries", () =>
      admin.from("inquiries").delete().in("email", emails)
    );
    await step("talent_applications", () =>
      admin.from("talent_applications").delete().in("email", emails)
    );
  }

  await step("profiles", () => admin.from("profiles").delete().eq("id", userId));

  // If anything failed, stop BEFORE deleting the login so the student can retry.
  if (failures.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error:
          "We could not remove all of your data. Your account is still active. Please try again, or contact support.",
      },
      { status: 500 }
    );
  }

  // 3. The sign-in account itself.
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error("[delete-account] auth deleteUser failed:", deleteError.message);
    return NextResponse.json(
      {
        success: false,
        error:
          "We could not remove your sign-in account. Please try again, or contact support.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
