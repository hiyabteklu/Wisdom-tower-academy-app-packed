import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAndPushNotification, type NotificationType } from "@/lib/notifications";
import { createServiceClient } from "@/lib/supabase-server";
import { isAdminEmail } from "@/lib/admin";
import {
  isNotificationCategory,
  previewFromContent,
  sanitizeContent,
  type NotificationContent,
} from "@/lib/notification-v2";
import {
  AudienceEmptyError,
  normalizeAudiences,
  resolveAudienceViaDatabase,
  sendToAudience,
} from "@/lib/notification-audience";

/**
 * POST /api/notifications/send
 *
 * ADMIN ONLY. The caller must send the signed-in admin's Supabase access
 * token as `Authorization: Bearer <token>` and the e-mail on that token must
 * be an admin e-mail (same rule as the /admin page, see src/lib/admin.ts).
 * Before 2026-10-15 this route had no check at all, so anyone who knew the
 * address could push a message to every device.
 *
 * Two modes:
 *  - LEGACY (no `category` in the body): exactly the old behaviour (type, target, url).
 *  - V2 (notifications v2, slice R2; a `category` is sent): category admin | material | contest,
 *    optional rich `content` ({ v: 1, blocks }), optional `audiences` (string[], see
 *    src/lib/notification-audience.ts; empty = everybody) or a single `target` user.
 *      contest  -> url is always /competitions
 *      material -> `url` is required (the path the admin picked), must start with "/"
 *      admin    -> no url: the app opens the reading view (/notifications?open=<id>)
 *    V2 audiences need the database migration docs/sql/notifications_v2.sql (app repo).
 */

export const maxDuration = 60;

function bearerToken(req: NextRequest): string | null {
  const header = req.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

function fail(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

async function sendV2(params: {
  verifier: SupabaseClient;
  adminEmail: string;
  title: string;
  contentBody: unknown;
  category: unknown;
  content: unknown;
  audiences: unknown;
  target: unknown;
  url: unknown;
}) {
  const { verifier, adminEmail, title, contentBody, category, content, audiences, target, url } = params;

  if (!isNotificationCategory(category)) {
    return fail("Category must be admin, material or contest.");
  }

  let cleanContent: NotificationContent | undefined;
  if (content !== undefined && content !== null) {
    const result = sanitizeContent(content);
    if (!result.ok) return fail(result.error);
    cleanContent = result.content;
  }

  let text = typeof contentBody === "string" ? contentBody.trim() : "";
  if (!text && cleanContent) text = previewFromContent(cleanContent);
  if (!text) return fail("Message body is required");
  if (title.trim().length > 140) return fail("The title is too long (140 characters at most).");
  if (text.length > 500) return fail("The short preview is too long (500 characters at most).");

  let finalUrl: string | undefined;
  if (category === "contest") {
    finalUrl = "/competitions";
  } else if (category === "material") {
    const picked = typeof url === "string" ? url.trim() : "";
    if (!picked.startsWith("/")) return fail("Pick where this material notice should open.");
    finalUrl = picked;
  }

  const audienceList = normalizeAudiences(audiences);
  const metadata: Record<string, unknown> = { category };
  if (cleanContent) metadata.content = cleanContent;
  if (audienceList.length > 0) metadata.audiences = audienceList;

  // One specific student (user id) instead of an audience.
  if (typeof target === "string" && target.trim() && target.trim() !== "all") {
    const single = await createAndPushNotification({
      title,
      body: text,
      type: category,
      target: target.trim(),
      url: finalUrl,
      createdBy: adminEmail,
      metadata,
    });
    return NextResponse.json({
      ok: true,
      recipients: 1,
      pushed: single.fcm.sentCount,
      notification: single.notification,
      fcm: single.fcm,
    });
  }

  const audience = await resolveAudienceViaDatabase(verifier, audienceList);
  try {
    const sent = await sendToAudience({
      audience,
      title,
      body: text,
      type: category,
      url: finalUrl,
      createdBy: adminEmail,
      metadata,
    });
    return NextResponse.json({
      ok: true,
      broadcast: audience.broadcast,
      recipients: sent.recipients,
      pushed: sent.pushed,
      notification: sent.notification,
      fcm: sent.fcm,
    });
  } catch (err: unknown) {
    if (err instanceof AudienceEmptyError) return fail(err.message);
    throw err;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Who is calling? Read ONLY from the access token.
    const token = bearerToken(req);
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Please sign in as an admin first." },
        { status: 401 }
      );
    }

    const verifier = createServiceClient();
    if (!verifier) {
      return NextResponse.json(
        { ok: false, error: "The server is not configured to verify admins." },
        { status: 500 }
      );
    }

    const { data: userData, error: userError } = await verifier.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json(
        { ok: false, error: "Your session has expired. Please sign in again." },
        { status: 401 }
      );
    }

    const adminEmail = userData.user.email ?? null;
    if (!isAdminEmail(adminEmail)) {
      return NextResponse.json(
        { ok: false, error: "Only admins can send notifications." },
        { status: 403 }
      );
    }

    // 2. The request itself.
    const body = await req.json().catch(() => ({}));
    const {
      title,
      body: contentBody,
      type = "general",
      target = "all",
      url,
      category,
      content,
      audiences,
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { ok: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // V2 mode: a category was sent.
    if (category !== undefined && category !== null) {
      return await sendV2({
        verifier,
        adminEmail: adminEmail || "admin",
        title,
        contentBody,
        category,
        content,
        audiences,
        target,
        url,
      });
    }

    // LEGACY mode (unchanged behaviour).
    if (!contentBody || typeof contentBody !== "string" || !contentBody.trim()) {
      return NextResponse.json(
        { ok: false, error: "Message body is required" },
        { status: 400 }
      );
    }

    const validTypes: NotificationType[] = ["material", "admin", "payment", "general", "contest"];
    const notifType: NotificationType = validTypes.includes(type) ? type : "general";

    const result = await createAndPushNotification({
      title,
      body: contentBody,
      type: notifType,
      target: target || "all",
      url: url || "/learning",
      // Taken from the verified token, not from the request body.
      createdBy: adminEmail || "admin",
    });

    return NextResponse.json({
      ok: true,
      notification: result.notification,
      fcm: result.fcm,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to send notification";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
