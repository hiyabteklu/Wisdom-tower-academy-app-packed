import { NextRequest, NextResponse } from "next/server";
import {
  listNotificationsForUser,
  listAllNotificationsForAdmin,
  deleteNotification,
} from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId") || undefined;
    const email = searchParams.get("email") || undefined;
    const isAdmin = searchParams.get("admin") === "true";

    if (isAdmin) {
      const items = await listAllNotificationsForAdmin();
      return NextResponse.json({ ok: true, notifications: items });
    }

    const items = await listNotificationsForUser(userId, email);
    return NextResponse.json({ ok: true, notifications: items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load notifications";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Missing notification id" }, { status: 400 });
    }

    const ok = await deleteNotification(id);
    return NextResponse.json({ ok });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete notification";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
