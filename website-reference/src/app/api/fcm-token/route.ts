import { NextRequest, NextResponse } from "next/server";
import { registerDeviceToken, unregisterDeviceToken } from "@/lib/notifications";

/**
 * POST /api/fcm-token
 * Lightweight, dedicated backend endpoint for registering FCM push notification device tokens.
 * Called quietly by the Android app / Web client on app start or login.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawToken = body.token || body.fcmToken || body.registrationToken;
    const { userId, platform = "android", deviceName, action } = body;

    if (!rawToken || typeof rawToken !== "string" || !rawToken.trim()) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid FCM token" },
        { status: 400 }
      );
    }

    const token = rawToken.trim();

    if (action === "unregister") {
      await unregisterDeviceToken(token);
      return NextResponse.json({
        ok: true,
        message: "FCM token unregistered successfully",
      });
    }

    const res = await registerDeviceToken({
      token,
      userId: userId || null,
      platform: platform === "ios" || platform === "web" ? platform : "android",
      deviceName: deviceName || undefined,
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: res.error || "Failed to register FCM token" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "FCM token registered successfully",
      platform: platform || "android",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { ok: false, error: "Missing token parameter" },
      { status: 400 }
    );
  }
  await unregisterDeviceToken(token);
  return NextResponse.json({ ok: true, message: "FCM token unregistered" });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "Wisdom Tower Academy FCM Token Service",
    status: "active",
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, DELETE, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
