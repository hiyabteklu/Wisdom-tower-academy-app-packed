"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

/**
 * Admin list of scheduled notifications: see the schedule, edit a waiting row, cancel it.
 *
 * 2026-10-15 (notifications v2, slice R3-b4, session R3-E): the old schedule form was removed; scheduling now
 * happens in `NotificationComposerV2` (step 5 "When"). This panel lists with `admin_list_scheduled_notifications_v2`
 * and cancels with `admin_cancel_scheduled_notification` (admin's own session; the database checks admin).
 * Old rows (made before v2, no category) are listed and can be cancelled but not edited.
 * The database scheduler (pg_cron, every minute) calls /api/notifications/dispatch, which sends due rows.
 * All times are shown in Ethiopia time (EAT, UTC+3).
 */

export type ScheduledStatus = "pending" | "sending" | "sent" | "failed" | "cancelled";

export type ScheduledRowV2 = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  send_at: string;
  status: ScheduledStatus;
  category: string | null;
  content: unknown;
  audiences: string[] | null;
  audience_scope: string | null;
  package_id: string | null;
  competition_id: string | null;
  created_at: string;
  sent_at: string | null;
  last_error: string | null;
  attempts: number;
};

export function formatEat(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return (
    d.toLocaleString("en-GB", {
      timeZone: "Africa/Addis_Ababa",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " EAT"
  );
}

export function friendlyScheduleError(message: string): string {
  if (message.includes("admin_only")) {
    return "Only an admin account can do this. Please sign in again as admin.";
  }
  if (message.includes("send_at_must_be_in_future")) return "The send time must be in the future.";
  if (message.includes("title_required")) return "Please enter a title.";
  if (message.includes("body_required")) return "Please enter a message.";
  if (message.includes("url_required_for_material")) return "Pick where this material notice should open.";
  if (message.includes("bad_content") || message.includes("content_too_large")) {
    return "The message content is not valid or is too long.";
  }
  if (message.includes("not_pending_or_not_found")) {
    return "This notification is no longer waiting to be sent.";
  }
  return message || "Something went wrong.";
}

function statusBadge(status: ScheduledStatus): string {
  switch (status) {
    case "pending":
      return "bg-sky-500/15 text-sky-300 border-sky-400/30";
    case "sending":
      return "bg-amber-500/15 text-amber-300 border-amber-400/30";
    case "sent":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
    case "failed":
      return "bg-rose-500/15 text-rose-300 border-rose-400/30";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-400/30";
  }
}

function audienceText(r: ScheduledRowV2): string {
  if (r.audiences && r.audiences.length > 0) {
    return r.audiences.map((a) => (a.startsWith("custom:") ? "custom audience" : a)).join(", ");
  }
  return r.audience_scope ? r.audience_scope : "everyone";
}

export default function ScheduledNotificationsPanel({
  refreshKey = 0,
  onEdit,
}: {
  refreshKey?: number;
  onEdit?: (row: ScheduledRowV2) => void;
}) {
  const [rows, setRows] = useState<ScheduledRowV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_list_scheduled_notifications_v2", {
      p_limit: 50,
    });
    if (error) {
      setFeedback({ type: "error", message: friendlyScheduleError(error.message) });
      setRows([]);
    } else {
      setRows(Array.isArray(data) ? (data as ScheduledRowV2[]) : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  async function handleCancel(id: string) {
    if (!window.confirm("Cancel this scheduled notification? It will not be sent.")) return;
    setFeedback(null);
    const { error } = await supabase.rpc("admin_cancel_scheduled_notification", { p_id: id });
    if (error) {
      setFeedback({ type: "error", message: friendlyScheduleError(error.message) });
    } else {
      setFeedback({ type: "success", message: "Cancelled." });
    }
    void load();
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-[#08101e] p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-300" />
          <span>Scheduled Notifications ({rows.length})</span>
        </h3>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`mb-4 p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-400/30 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-wisdom-muted py-6 text-center">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="text-xs text-wisdom-muted py-6 text-center">Nothing scheduled yet.</p>
      ) : (
        <div className="divide-y divide-white/8">
          {rows.map((r) => (
            <div key={r.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${statusBadge(
                      r.status
                    )}`}
                  >
                    {r.status}
                  </span>
                  {r.category && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-400/30 bg-amber-500/10 text-amber-300 uppercase tracking-wider">
                      {r.category}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">{formatEat(r.send_at)}</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {audienceText(r)}
                    {r.package_id ? ` / package ${r.package_id}` : ""}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{r.title}</h4>
                <p className="text-xs text-wisdom-muted line-clamp-2 mt-0.5">{r.body}</p>
                {r.url && <p className="text-[11px] text-sky-400 mt-1">Link: {r.url}</p>}
                {r.last_error && <p className="text-[11px] text-rose-300 mt-1">{r.last_error}</p>}
              </div>

              {r.status === "pending" && (
                <div className="shrink-0 flex items-center gap-1">
                  {onEdit && r.category && (
                    <button
                      type="button"
                      onClick={() => onEdit(r)}
                      title="Edit"
                      className="p-2 rounded-xl text-slate-500 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleCancel(r.id)}
                    title="Cancel"
                    className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
