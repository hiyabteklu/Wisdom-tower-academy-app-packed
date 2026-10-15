import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServiceClient } from "@/lib/supabase-server";
import { createAndPushNotification } from "@/lib/notifications";
import { isNotificationCategory, type NotificationCategory } from "@/lib/notification-v2";
import {
  AudienceEmptyError,
  normalizeAudiences,
  resolveAudienceViaDatabase,
  sendToAudience,
} from "@/lib/notification-audience";

/**
 * POST /api/notifications/dispatch
 *
 * Called once a minute by the database scheduler (pg_cron + pg_net) to send
 * the notifications the admin scheduled in `scheduled_notifications`.
 *
 * SECRET ONLY. The caller must send the header `x-dispatch-secret` with the
 * same value as the server environment variable NOTIFICATION_DISPATCH_SECRET.
 * If that variable is missing or shorter than 16 characters the route refuses
 * every request (fails closed). The secret is never stored in the repository.
 *
 * What one run does:
 *  1. takes up to MAX_ROWS_PER_RUN rows with status "pending" and send_at in the past;
 *  2. claims each one (status "sending", attempts + 1); a row that another run
 *     already claimed is skipped, so one row is never sent twice;
 *  3. works out the audience:
 *       LEGACY row (no category, no audiences): scope = profiles.active_academic_scope, default
 *       "freshman"; package = enrollments or access_grants by user id or e-mail (same rule as the
 *       competition access check);
 *       V2 row (category or audiences set, notifications v2 slice R2): the database function
 *       resolve_notification_audience (registration levels and custom audiences, union), the same
 *       resolver the admin "send now" uses;
 *  4. sends: one broadcast for everybody, or one notification per matching student;
 *  5. marks the row "sent", or puts it back to "pending" (retry on the next run) up to
 *     MAX_ATTEMPTS, then "failed" with last_error.
 *
 * Known gap: a run that dies after step 2 leaves its row in "sending". It is
 * never re-sent on its own (this avoids duplicate pushes); look at it by hand.
 *
 * The claim reads every column (select "*"), so this route also works BEFORE the v2 migration adds the
 * category / content / audiences columns (they are simply absent on the row).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_ROWS_PER_RUN = 10;
const MAX_ATTEMPTS = 3;
const SEND_CHUNK = 10;
const PAGE = 1000;

type DueRow = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  audience_scope: string | null;
  package_id: string | null;
  competition_id: string | null;
  attempts: number;
  // v2 columns (absent before the migration)
  category?: string | null;
  content?: Record<string, unknown> | null;
  audiences?: string[] | null;
};

type RowResult = {
  id: string;
  status: "sent" | "retry" | "failed";
  recipients?: number;
  pushed?: number;
  error?: string;
};

/** The audience is empty or the row can never succeed: do not retry. */
class PermanentError extends Error {}

function checkSecret(req: NextRequest): "ok" | "not_configured" | "denied" {
  const expected = process.env.NOTIFICATION_DISPATCH_SECRET;
  if (!expected || expected.length < 16) return "not_configured";
  const given = req.headers.get("x-dispatch-secret") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return "denied";
  return timingSafeEqual(a, b) ? "ok" : "denied";
}

/** Reads every row of a table (paged), optionally filtered by one column. */
async function readAll(
  client: SupabaseClient,
  table: string,
  columns: string,
  filter?: { column: string; value: string }
): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  for (let from = 0; ; from += PAGE) {
    let query = client.from(table).select(columns).order("id", { ascending: true });
    if (filter) query = query.eq(filter.column, filter.value);
    const { data, error } = await query.range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    const rows = (data ?? []) as unknown as Record<string, unknown>[];
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

/** LEGACY: who should get this notification? broadcast = everybody. */
async function resolveAudience(
  client: SupabaseClient,
  row: DueRow
): Promise<{ broadcast: boolean; userIds: string[] }> {
  let scope = row.audience_scope?.trim().toLowerCase() || null;
  let packageId = row.package_id?.trim() || null;

  // A row tied to a competition falls back to that competition's audience.
  if (row.competition_id && (!scope || !packageId)) {
    const { data: comp, error } = await client
      .from("competitions")
      .select("audience, package_id, requires_package")
      .eq("id", row.competition_id)
      .maybeSingle();
    if (error) throw new Error(`competitions: ${error.message}`);
    if (!comp) throw new PermanentError("The competition of this notification was not found.");
    if (!scope && typeof comp.audience === "string") {
      scope = comp.audience.trim().toLowerCase() || null;
    }
    if (!packageId && comp.requires_package && comp.package_id) {
      packageId = String(comp.package_id);
    }
  }

  if (scope === "all") scope = null;
  if (!scope && !packageId) return { broadcast: true, userIds: [] };

  const profiles = (await readAll(
    client,
    "profiles",
    "id, email, active_academic_scope"
  )) as { id: string; email: string | null; active_academic_scope: string | null }[];

  let matched = profiles.filter(
    (p) => !scope || (p.active_academic_scope ?? "freshman").trim().toLowerCase() === scope
  );

  if (packageId) {
    const grants = [
      ...(await readAll(client, "enrollments", "id, user_id, email", {
        column: "package_id",
        value: packageId,
      })),
      ...(await readAll(client, "access_grants", "id, user_id, email", {
        column: "package_id",
        value: packageId,
      })),
    ] as { user_id: string | null; email: string | null }[];

    const ids = new Set<string>();
    const emails = new Set<string>();
    for (const g of grants) {
      if (g.user_id) ids.add(g.user_id);
      if (g.email) emails.add(g.email.trim().toLowerCase());
    }
    matched = matched.filter(
      (p) => ids.has(p.id) || (!!p.email && emails.has(p.email.trim().toLowerCase()))
    );
  }

  return { broadcast: false, userIds: matched.map((p) => p.id) };
}

/** V2 row: category + rich content + audiences (registration levels, custom audiences). */
async function sendRowV2(
  client: SupabaseClient,
  row: DueRow
): Promise<{ recipients: number; pushed: number }> {
  const category: NotificationCategory = isNotificationCategory(row.category) ? row.category : "admin";
  const audiences = normalizeAudiences(row.audiences ?? []);
  const audience = await resolveAudienceViaDatabase(client, audiences);

  const metadata: Record<string, unknown> = { scheduled_notification_id: row.id, category };
  if (row.content) metadata.content = row.content;
  if (row.competition_id) metadata.competition_id = row.competition_id;
  if (audiences.length > 0) metadata.audiences = audiences;

  // contest -> /competitions and admin -> reading view are chosen automatically (url undefined).
  const url = category === "material" ? row.url ?? undefined : undefined;

  const sent = await sendToAudience({
    audience,
    title: row.title,
    body: row.body,
    type: category,
    url,
    createdBy: "scheduler",
    metadata,
  });
  return { recipients: sent.recipients, pushed: sent.pushed };
}

/** Sends one claimed row. Throws when nothing could be sent. */
async function sendRow(
  client: SupabaseClient,
  row: DueRow
): Promise<{ recipients: number; pushed: number }> {
  if (row.category || (row.audiences && row.audiences.length > 0)) {
    return sendRowV2(client, row);
  }

  // LEGACY path (unchanged behaviour).
  const audience = await resolveAudience(client, row);
  const metadata: Record<string, unknown> = { scheduled_notification_id: row.id };
  if (row.competition_id) metadata.competition_id = row.competition_id;
  // Competition notices use the existing "admin" type for now (the type list is fixed).
  const common = {
    title: row.title,
    body: row.body,
    type: "admin" as const,
    // Explicit default: the automatic reading-view url of v2 must not change old rows.
    url: row.url ?? "/learning",
    createdBy: "scheduler",
    metadata,
  };

  if (audience.broadcast) {
    const result = await createAndPushNotification({ ...common, target: "all" });
    return { recipients: 0, pushed: result.fcm.sentCount };
  }

  if (audience.userIds.length === 0) {
    throw new PermanentError("No students match this audience.");
  }

  let pushed = 0;
  let delivered = 0;
  for (let i = 0; i < audience.userIds.length; i += SEND_CHUNK) {
    const chunk = audience.userIds.slice(i, i + SEND_CHUNK);
    const settled = await Promise.allSettled(
      chunk.map((userId) => createAndPushNotification({ ...common, target: userId }))
    );
    for (const s of settled) {
      if (s.status === "fulfilled") {
        delivered += 1;
        pushed += s.value.fcm.sentCount;
      }
    }
  }
  if (delivered === 0) throw new Error("Could not create any notification.");
  return { recipients: delivered, pushed };
}

export async function POST(req: NextRequest) {
  const secret = checkSecret(req);
  if (secret === "not_configured") {
    return NextResponse.json(
      { ok: false, error: "Dispatch is not configured on the server." },
      { status: 503 }
    );
  }
  if (secret === "denied") {
    return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 401 });
  }

  const client = createServiceClient();
  if (!client) {
    return NextResponse.json(
      { ok: false, error: "The server database client is not configured." },
      { status: 500 }
    );
  }

  try {
    const { data: due, error: dueError } = await client
      .from("scheduled_notifications")
      .select("id, attempts")
      .eq("status", "pending")
      .lte("send_at", new Date().toISOString())
      .order("send_at", { ascending: true })
      .limit(MAX_ROWS_PER_RUN);
    if (dueError) throw new Error(dueError.message);

    const results: RowResult[] = [];

    for (const candidate of (due ?? []) as { id: string; attempts: number }[]) {
      // Claim: only one run can move a row from "pending" to "sending".
      const { data: claimed, error: claimError } = await client
        .from("scheduled_notifications")
        .update({ status: "sending", attempts: (candidate.attempts ?? 0) + 1 })
        .eq("id", candidate.id)
        .eq("status", "pending")
        .select("*");
      if (claimError || !claimed || claimed.length === 0) continue;

      const row = claimed[0] as DueRow;
      try {
        const sent = await sendRow(client, row);
        await client
          .from("scheduled_notifications")
          .update({ status: "sent", sent_at: new Date().toISOString(), last_error: null })
          .eq("id", row.id)
          .eq("status", "sending");
        results.push({ id: row.id, status: "sent", ...sent });
      } catch (err: unknown) {
        const message = (err instanceof Error ? err.message : "Send failed").slice(0, 500);
        const giveUp =
          err instanceof PermanentError ||
          err instanceof AudienceEmptyError ||
          row.attempts >= MAX_ATTEMPTS;
        await client
          .from("scheduled_notifications")
          .update({ status: giveUp ? "failed" : "pending", last_error: message })
          .eq("id", row.id)
          .eq("status", "sending");
        results.push({
          id: row.id,
          status: giveUp ? "failed" : "retry",
          error: message,
        });
      }
    }

    return NextResponse.json({ ok: true, processed: results.length, results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Dispatch failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
