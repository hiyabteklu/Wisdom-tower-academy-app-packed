import { NextRequest, NextResponse } from "next/server";
import { createAndPushNotification, type NotificationType } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, body: contentBody, type = "general", target = "all", url, createdBy } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { ok: false, error: "Title is required" },
        { status: 400 }
      );
    }

    if (!contentBody || typeof contentBody !== "string" || !contentBody.trim()) {
      return NextResponse.json(
        { ok: false, error: "Message body is required" },
        { status: 400 }
      );
    }

    const validTypes: NotificationType[] = ["material", "admin", "payment", "general"];
    const notifType: NotificationType = validTypes.includes(type) ? type : "general";

    const result = await createAndPushNotification({
      title,
      body: contentBody,
      type: notifType,
      target: target || "all",
      url: url || "/learning",
      createdBy: createdBy || "admin",
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
