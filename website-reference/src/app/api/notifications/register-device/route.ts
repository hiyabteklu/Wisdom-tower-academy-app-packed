import { NextRequest, NextResponse } from "next/server";
import { registerDeviceToken, unregisterDeviceToken } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { token, userId, platform = "android", deviceName, action } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid FCM registration token" },
        { status: 400 }
      );
    }

    if (action === "unregister") {
      await unregisterDeviceToken(token);
      return NextResponse.json({
        ok: true,
        message: "Device token unregistered successfully",
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
        { ok: false, error: res.error || "Failed to register token" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Device registered for push notifications",
      platform,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing token parameter" }, { status: 400 });
  }
  await unregisterDeviceToken(token);
  return NextResponse.json({ ok: true, message: "Device unregistered" });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
