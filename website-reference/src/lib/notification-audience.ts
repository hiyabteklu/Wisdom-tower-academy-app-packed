import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createAndPushNotification,
  type NotificationItem,
  type NotificationType,
} from "@/lib/notifications";

/**
 * Notifications v2 audience (plan slice R2). ONE resolver for "send now" and "scheduled":
 * the database function public.resolve_notification_audience (service_role only, created by
 * docs/sql/notifications_v2.sql in the app repo). It needs that migration to be applied.
 *
 * Audience entries (string[]):
 *   "all" or an empty list = everybody (one broadcast row, target "all")
 *   a registration level such as "Grade 9", "Freshman", "3rd Year (ECE)" (case-insensitive, matched
 *     against profiles.education_level)
 *   "custom:<uuid>" = a custom audience of the admin (table notification_audiences)
 * The result is the UNION, one notification per student.
 */

const SEND_CHUNK = 10;
const MAX_AUDIENCES = 20;

/** Nobody matches: retrying cannot help. */
export class AudienceEmptyError extends Error {}

export type ResolvedAudience = { broadcast: boolean; userIds: string[] };

export function normalizeAudiences(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of input) {
    if (typeof item !== "string") continue;
    const value = item.trim();
    if (!value || value.length > 80) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
    if (out.length >= MAX_AUDIENCES) break;
  }
  return out;
}

export async function resolveAudienceViaDatabase(
  client: SupabaseClient,
  audiences: string[]
): Promise<ResolvedAudience> {
  if (audiences.length === 0 || audiences.some((a) => a.toLowerCase() === "all")) {
    return { broadcast: true, userIds: [] };
  }
  const { data, error } = await client.rpc("resolve_notification_audience", {
    p_audiences: audiences,
  });
  if (error) throw new Error(`audience: ${error.message}`);
  const ids: string[] = [];
  if (Array.isArray(data)) {
    for (const row of data as unknown[]) {
      if (typeof row === "string") ids.push(row);
      else if (row && typeof row === "object") {
        const first = Object.values(row as Record<string, unknown>)[0];
        if (typeof first === "string") ids.push(first);
      }
    }
  }
  return { broadcast: false, userIds: Array.from(new Set(ids)) };
}

export type SendToAudienceResult = {
  recipients: number;
  pushed: number;
  /** Only for a broadcast (one row for everybody). */
  notification?: NotificationItem;
  fcm?: { sentCount: number; failureCount: number; skipped?: boolean; reason?: string };
};

/**
 * Creates the notification rows and pushes. A broadcast is ONE row (target "all"); a list of students
 * gets one row each (so every student has their own reading-view link). `url` undefined = automatic
 * (announcement -> /notifications?open=<id>, contest -> /competitions).
 */
export async function sendToAudience(params: {
  audience: ResolvedAudience;
  title: string;
  body: string;
  type: NotificationType;
  url?: string;
  createdBy: string;
  metadata: Record<string, unknown>;
}): Promise<SendToAudienceResult> {
  const common = {
    title: params.title,
    body: params.body,
    type: params.type,
    url: params.url,
    createdBy: params.createdBy,
    metadata: params.metadata,
  };

  if (params.audience.broadcast) {
    const result = await createAndPushNotification({ ...common, target: "all" });
    return {
      recipients: 0,
      pushed: result.fcm.sentCount,
      notification: result.notification,
      fcm: result.fcm,
    };
  }

  const userIds = params.audience.userIds;
  if (userIds.length === 0) throw new AudienceEmptyError("No students match this audience.");

  let pushed = 0;
  let delivered = 0;
  for (let i = 0; i < userIds.length; i += SEND_CHUNK) {
    const chunk = userIds.slice(i, i + SEND_CHUNK);
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
