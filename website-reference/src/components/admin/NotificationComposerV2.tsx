"use client";

/**
 * Notifications v2, slices R3-b2 to R3-b4 (sessions R3-C, R3-D, R3-E). `[~]` NOT compiled, not opened in a browser.
 *
 * The composer for the admin Notifications tab. Three categories only (owner order 2026-10-15):
 *   Admin announcement -> students read it inside Notifications (no navigation)
 *   New material release -> opens the subject or hub picked with the path selector
 *   Contest -> opens the Contest (trophy) screen; the server forces the url to /competitions
 * Steps: 1 Category, 2 Write (block editor + gold preview), 3 Destination, 4 Audience (chips with live counts,
 * or one student), 5 When (send now, or schedule in Ethiopia time).
 * Send now: POST /api/notifications/send (v2 mode). Schedule / edit: the database functions
 * admin_schedule_notification_v2 / admin_update_scheduled_notification_v2 (admin's own session).
 * Scheduling works for groups of students only (the scheduler has no single-student target).
 * Editing a waiting row (`editRow`) loads it into the form; saving updates that row.
 */

import { useEffect, useRef, useState } from "react";
import { AlertCircle, BookOpen, CheckCircle2, Clock, Megaphone, Send, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  isNotificationCategory,
  previewFromContent,
  sanitizeContent,
  type NotificationCategory,
} from "@/lib/notification-v2";
import {
  contentToEditor,
  editorToContent,
  newEditorBlock,
  type EditorBlock,
} from "@/lib/notification-authoring";
import {
  NOTIFICATION_PATH_TREE,
  findNotificationPath,
  type NotificationPathNode,
} from "@/lib/notification-paths";
import { NotificationBlockEditor, NotificationPreview } from "./NotificationBlockEditor";
import NotificationAudiencePicker from "./NotificationAudiencePicker";
import {
  formatEat,
  friendlyScheduleError,
  type ScheduledRowV2,
} from "./ScheduledNotificationsPanel";

const EAT_OFFSET = "+03:00";

const CATEGORIES: {
  id: NotificationCategory;
  label: string;
  hint: string;
  Icon: typeof Megaphone;
}[] = [
  {
    id: "admin",
    label: "Admin announcement",
    hint: "Students read it inside Notifications. It does not take them anywhere.",
    Icon: Megaphone,
  },
  {
    id: "material",
    label: "New material release",
    hint: "Opens the subject or hub you pick below.",
    Icon: BookOpen,
  },
  {
    id: "contest",
    label: "Contest",
    hint: "Opens the Contest (trophy) screen. Nothing to choose.",
    Icon: Trophy,
  },
];

function childrenAfter(trail: string[]): NotificationPathNode[] {
  let level = NOTIFICATION_PATH_TREE;
  for (const id of trail) {
    const node = level.find((n) => n.id === id);
    if (!node || !node.children) return [];
    level = node.children;
  }
  return level;
}

/** The deepest chosen node that has a public path. */
function pathFromTrail(trail: string[]): string | null {
  let level = NOTIFICATION_PATH_TREE;
  let path: string | null = null;
  for (const id of trail) {
    const node = level.find((n) => n.id === id);
    if (!node) break;
    if (node.path) path = node.path;
    level = node.children ?? [];
  }
  return path;
}

/** Picker trail (node ids) that ends on the node with this public path, or null. */
function trailForPath(
  path: string,
  nodes: NotificationPathNode[] = NOTIFICATION_PATH_TREE,
  trail: string[] = []
): string[] | null {
  for (const node of nodes) {
    const next = [...trail, node.id];
    if (node.path === path) return next;
    if (node.children) {
      const found = trailForPath(path, node.children, next);
      if (found) return found;
    }
  }
  return null;
}

/** ISO instant -> the value of a datetime-local input in Ethiopia time (UTC+3). */
function toEatInput(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  return new Date(t + 3 * 60 * 60 * 1000).toISOString().slice(0, 16);
}

function initialBlocks(): EditorBlock[] {
  return [newEditorBlock("title"), newEditorBlock("p")];
}

export default function NotificationComposerV2({
  onSent,
  onScheduled,
  editRow,
  onEditDone,
}: {
  onSent?: () => void;
  onScheduled?: () => void;
  editRow?: ScheduledRowV2 | null;
  onEditDone?: () => void;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [category, setCategory] = useState<NotificationCategory>("admin");
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<EditorBlock[]>(initialBlocks);
  const [trail, setTrail] = useState<string[]>([]);
  const [mode, setMode] = useState<"groups" | "user">("groups");
  const [groups, setGroups] = useState<string[]>([]);
  const [groupCount, setGroupCount] = useState<number | null>(null);
  const [targetUser, setTargetUser] = useState("");
  const [when, setWhen] = useState<"now" | "later">("now");
  const [sendAtLocal, setSendAtLocal] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const editing = Boolean(editRow);
  const pickedPath = category === "material" ? pathFromTrail(trail) : null;
  const pickedChoice = pickedPath ? findNotificationPath(pickedPath) : undefined;

  // Load a waiting row into the form when the admin presses Edit.
  useEffect(() => {
    if (!editRow) return;
    setCategory(isNotificationCategory(editRow.category) ? editRow.category : "admin");
    setTitle(editRow.title);
    const parsed = editRow.content ? sanitizeContent(editRow.content) : null;
    setBlocks(
      parsed && parsed.ok ? contentToEditor(parsed.content) : [newEditorBlock("p", editRow.body)]
    );
    setTrail(editRow.url ? trailForPath(editRow.url) ?? [] : []);
    setMode("groups");
    setGroups(editRow.audiences ?? []);
    setWhen("later");
    setSendAtLocal(toEatInput(editRow.send_at));
    setFeedback(null);
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [editRow]);

  function setLevel(depth: number, id: string) {
    const next = trail.slice(0, depth);
    if (id) next.push(id);
    setTrail(next);
  }

  function resetForm() {
    setTitle("");
    setBlocks(initialBlocks());
    setSendAtLocal("");
  }

  async function handleSubmit() {
    setFeedback(null);
    const content = editorToContent(blocks);
    if (!title.trim()) {
      setFeedback({ ok: false, message: "Write the notification title first." });
      return;
    }
    if (!content) {
      setFeedback({ ok: false, message: "Write the message (add a paragraph with some text)." });
      return;
    }
    if (category === "material" && !pickedPath) {
      setFeedback({ ok: false, message: "Pick where this material notice should open." });
      return;
    }
    const later = when === "later" || editing;
    if (later && mode === "user") {
      setFeedback({
        ok: false,
        message: "Scheduling works for groups of students. Use Send now for one student.",
      });
      return;
    }
    if (mode === "user" && !targetUser.trim()) {
      setFeedback({ ok: false, message: "Enter the student's user id." });
      return;
    }

    let sendAtIso = "";
    if (later) {
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(sendAtLocal)) {
        setFeedback({ ok: false, message: "Pick the date and time to send (Ethiopia time)." });
        return;
      }
      const sendAt = new Date(`${sendAtLocal}:00${EAT_OFFSET}`);
      if (Number.isNaN(sendAt.getTime()) || sendAt.getTime() <= Date.now() + 60_000) {
        setFeedback({
          ok: false,
          message: "Pick a time at least one minute from now (Ethiopia time).",
        });
        return;
      }
      sendAtIso = sendAt.toISOString();
    } else if (mode === "groups") {
      const who =
        groups.length === 0
          ? "EVERY student"
          : groupCount === null
          ? "the selected groups"
          : `${groupCount} student(s)`;
      if (!window.confirm(`Send this to ${who} now? This cannot be undone.`)) return;
    }

    setSending(true);
    try {
      if (later) {
        const preview = previewFromContent(content) || title.trim();
        const common = {
          p_title: title.trim(),
          p_body: preview,
          p_send_at: sendAtIso,
          p_category: category,
          p_content: content,
          p_url: category === "material" ? pickedPath : null,
          p_audiences: groups.length > 0 ? groups : null,
        };
        const { error } = editRow
          ? await supabase.rpc("admin_update_scheduled_notification_v2", { p_id: editRow.id, ...common })
          : await supabase.rpc("admin_schedule_notification_v2", common);
        if (error) {
          setFeedback({ ok: false, message: friendlyScheduleError(error.message) });
          return;
        }
        setFeedback({
          ok: true,
          message: `${editing ? "Changes saved. " : "Scheduled. "}It goes out at ${formatEat(
            sendAtIso
          )} (within a minute after that).`,
        });
        resetForm();
        setWhen("now");
        onScheduled?.();
        onEditDone?.();
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setFeedback({ ok: false, message: "Your admin session has expired. Please sign in again." });
        return;
      }

      const payload: Record<string, unknown> = {
        title: title.trim(),
        category,
        content,
      };
      if (category === "material" && pickedPath) payload.url = pickedPath;
      if (mode === "user") payload.target = targetUser.trim();
      else payload.audiences = groups;

      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setFeedback({ ok: false, message: data.error || "Failed to send the notification." });
        return;
      }

      const recipients = typeof data.recipients === "number" ? data.recipients : 0;
      const pushed = typeof data.pushed === "number" ? data.pushed : null;
      setFeedback({
        ok: true,
        message:
          "Sent. " +
          (data.broadcast ? "Everyone can see it. " : recipients > 0 ? `Students reached: ${recipients}. ` : "") +
          (pushed !== null ? `Push sent to ${pushed} device(s).` : ""),
      });
      resetForm();
      onSent?.();
    } catch (err: unknown) {
      setFeedback({ ok: false, message: err instanceof Error ? err.message : "Network error" });
    } finally {
      setSending(false);
    }
  }

  const levels: NotificationPathNode[][] = [];
  if (category === "material") {
    for (let depth = 0; depth <= trail.length; depth += 1) {
      const options = childrenAfter(trail.slice(0, depth));
      if (options.length === 0) break;
      levels.push(options);
    }
  }

  const later = when === "later" || editing;

  return (
    <div
      ref={rootRef}
      className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1626] to-[#070e1a] p-5 sm:p-7 shadow-xl space-y-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white">
            {editing ? "Edit scheduled notification" : "New notification"}
          </h3>
          <p className="text-[11px] text-wisdom-muted">
            1 Category, 2 Write, 3 Destination, 4 Audience, 5 When, then send.
          </p>
        </div>
        {editing && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setWhen("now");
              setFeedback(null);
              onEditDone?.();
            }}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-300 border border-white/15 hover:bg-white/10 cursor-pointer"
          >
            Stop editing
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-2.5 ${
            feedback.ok
              ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-400/30 text-rose-300"
          }`}
        >
          {feedback.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 1 Category */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-300">1. Category</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CATEGORIES.map(({ id, label, hint, Icon }) => {
            const active = category === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCategory(id)}
                className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  active
                    ? "border-amber-300/70 bg-amber-300/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]"
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 ${active ? "text-amber-300" : "text-slate-400"}`} />
                <span className="block text-sm font-bold text-white">{label}</span>
                <span className="block text-[11px] text-wisdom-muted mt-1 leading-relaxed">{hint}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2 Write */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-300">2. Write</p>
        <div className="space-y-1.5">
          <label className="text-[11px] text-slate-400">
            Notification title (shown on the phone and in the list) <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            maxLength={140}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Exam schedule update"
            className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-300/60 transition-colors"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <NotificationBlockEditor value={blocks} onChange={setBlocks} />
          <div>
            <p className="text-[11px] text-slate-400 mb-2">Live preview (reading view)</p>
            <NotificationPreview blocks={blocks} />
          </div>
        </div>
      </div>

      {/* 3 Destination */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-300">3. Destination</p>
        {category === "admin" && (
          <p className="text-xs text-wisdom-muted">
            None. A tap opens the full-screen reading view inside Notifications.
          </p>
        )}
        {category === "contest" && (
          <p className="text-xs text-wisdom-muted">
            Automatic: a tap opens the Contest (trophy) screen.
          </p>
        )}
        {category === "material" && (
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {levels.map((options, depth) => (
                <select
                  key={depth}
                  value={trail[depth] ?? ""}
                  onChange={(e) => setLevel(depth, e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white focus:outline-none focus:border-amber-300/60"
                >
                  <option value="">
                    {depth === 0 ? "Choose a group…" : "Choose (optional, deeper)…"}
                  </option>
                  {options.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              This opens:{" "}
              {pickedChoice ? (
                <>
                  <span className="text-amber-300">{pickedChoice.crumbs.join(" › ")}</span>{" "}
                  <span className="font-mono text-slate-500">({pickedChoice.path})</span>
                </>
              ) : (
                <span className="text-slate-500">nothing picked yet (choose at least a subject or course)</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* 4 Audience */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-300">4. Audience</p>
        <div className="flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-white">
            <input
              type="radio"
              name="v2audience"
              checked={mode === "groups"}
              onChange={() => setMode("groups")}
              className="accent-amber-300"
            />
            <span>Groups of students</span>
          </label>
          {!later && (
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-white">
              <input
                type="radio"
                name="v2audience"
                checked={mode === "user"}
                onChange={() => setMode("user")}
                className="accent-amber-300"
              />
              <span>One student (user id)</span>
            </label>
          )}
        </div>
        {mode === "groups" || later ? (
          <NotificationAudiencePicker
            value={groups}
            onChange={setGroups}
            onCountChange={setGroupCount}
          />
        ) : (
          <input
            type="text"
            value={targetUser}
            onChange={(e) => setTargetUser(e.target.value)}
            placeholder="Student user id (UUID)"
            className="w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-300/60"
          />
        )}
      </div>

      {/* 5 When */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-300">5. When</p>
        {!editing && (
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-white">
              <input
                type="radio"
                name="v2when"
                checked={when === "now"}
                onChange={() => setWhen("now")}
                className="accent-amber-300"
              />
              <span>Send now</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-white">
              <input
                type="radio"
                name="v2when"
                checked={when === "later"}
                onChange={() => {
                  setWhen("later");
                  setMode("groups");
                }}
                className="accent-amber-300"
              />
              <span>Schedule for later</span>
            </label>
          </div>
        )}
        {later && (
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">Send at (Ethiopia time)</label>
            <input
              type="datetime-local"
              value={sendAtLocal}
              onChange={(e) => setSendAtLocal(e.target.value)}
              className="w-full sm:w-72 px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white focus:outline-none focus:border-amber-300/60"
            />
            <p className="text-[11px] text-slate-500">
              Checked every minute. Whatever the time zone of this computer, the time typed here is Ethiopia time.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={sending}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-300 hover:bg-amber-200 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
        >
          {later ? <Clock className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          <span>
            {sending
              ? "Working..."
              : editing
              ? "Save changes"
              : later
              ? "Schedule"
              : "Send now"}
          </span>
        </button>
      </div>
    </div>
  );
}
