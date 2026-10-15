"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, RefreshCw, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { EntryFlagsInfo, useEntryFlags } from "./EntryFlagsInfo";

/**
 * Admin panel for competitions (global timed exams).
 *
 * Everything goes through the admin database functions (the database checks
 * that the caller is an admin): admin_publish_competition_from_exam,
 * admin_set_competition_published, admin_set_countdown,
 * admin_start_competition_now, admin_reschedule_competition and
 * admin_disqualify_entry. Contracts: docs/COMPETITION_API_CONTRACT.md in the
 * app repository.
 *
 * All times typed here are Ethiopia time (EAT, UTC+3), whatever the time zone
 * of the computer being used.
 *
 * Questions and answer keys are copied from an existing exam of the exam hub
 * when the contest is created. Every question must have a solution: the
 * database refuses an exam where one is missing.
 *
 * C10: the Entries list also shows the integrity flags the student's app
 * recorded during the ranked exam (EntryFlagsInfo.tsx). They are signals for
 * the admin to look at; nothing is disqualified automatically.
 */

type Competition = {
  id: string;
  title: string;
  audience: string | null;
  package_id: string | null;
  requires_package: boolean;
  published: boolean;
  countdown_state: string;
  starts_at: string;
  duration_min: number;
  ends_at: string | null;
  points: number;
  prize_title: string | null;
  prize_details: string | null;
};

type ExamResource = {
  id: string;
  title: string;
  package_id: string | null;
  durationMin: string | null;
};

type EntryRow = {
  id: string;
  user_id: string;
  status: string;
  score: number | null;
  total_count: number | null;
  time_taken_ms: number | null;
  submitted_at: string | null;
  disqualified: boolean;
  disqualified_reason: string | null;
};

type Phase = "upcoming" | "live" | "ended";

const EAT_OFFSET = "+03:00";
const LOCAL_DT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const BTN =
  "px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50";
const INPUT =
  "w-full px-4 py-2.5 rounded-xl bg-[#050b14] border border-white/12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition-colors";

function formatEat(iso: string | null): string {
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

function toEatIso(local: string): string | null {
  if (!LOCAL_DT.test(local)) return null;
  const d = new Date(`${local}:00${EAT_OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function friendlyError(message: string): string {
  const m = message || "";
  if (m.includes("admin_only")) return "Only an admin account can do this. Please sign in again as admin.";
  if (m.includes("exam_not_found")) return "That exam was not found in the exam hub.";
  if (m.includes("exam_has_no_questions")) return "That exam has no questions.";
  if (m.includes("start_must_be_in_the_future")) return "The start time must be in the future.";
  if (m.includes("duration_required")) return "This exam has no duration. Please type the duration in minutes.";
  const bad = m.match(/bad_question_at_position_(\d+)/);
  if (bad) {
    return `Question ${bad[1]} of the exam is incomplete (it needs a prompt, 2 to 8 choices, one correct choice and a solution). Fix it in the exam hub and try again.`;
  }
  if (m.includes("competition_not_found")) return "That competition no longer exists.";
  if (m.includes("already_started")) return "The contest already started, so it cannot be paused.";
  if (m.includes("reason_required")) return "Please type the reason.";
  if (m.includes("entry_not_found")) return "That entry was not found.";
  if (m.toLowerCase().includes("lock") || m.toLowerCase().includes("started")) {
    return `The database refused this change (a contest that already started is locked): ${m}`;
  }
  return m || "Something went wrong.";
}

function phaseOf(c: Competition, nowMs: number): Phase {
  const start = new Date(c.starts_at).getTime();
  const end = c.ends_at
    ? new Date(c.ends_at).getTime()
    : start + (c.duration_min || 0) * 60_000;
  if (nowMs < start) return "upcoming";
  if (nowMs < end) return "live";
  return "ended";
}

function badgeClass(kind: string): string {
  switch (kind) {
    case "live":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-400/30";
    case "upcoming":
      return "bg-sky-500/15 text-sky-300 border-sky-400/30";
    case "paused":
      return "bg-amber-500/15 text-amber-300 border-amber-400/30";
    case "cancelled":
      return "bg-rose-500/15 text-rose-300 border-rose-400/30";
    default:
      return "bg-slate-500/15 text-slate-300 border-slate-400/30";
  }
}

function formatTime(ms: number | null): string {
  if (ms == null) return "";
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}

export default function CompetitionsAdminPanel() {
  const [rows, setRows] = useState<Competition[]>([]);
  const [exams, setExams] = useState<ExamResource[]>([]);
  const [nowMs, setNowMs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Create form
  const [resourceId, setResourceId] = useState("");
  const [title, setTitle] = useState("");
  const [startsLocal, setStartsLocal] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [audience, setAudience] = useState("");
  const [points, setPoints] = useState("0");
  const [prizeTitle, setPrizeTitle] = useState("");
  const [prizeDetails, setPrizeDetails] = useState("");
  const [requiresPackage, setRequiresPackage] = useState(false);
  const [publishNow, setPublishNow] = useState(false);

  // Reschedule (inline, one row at a time)
  const [editId, setEditId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editDuration, setEditDuration] = useState("");

  // Entries (one competition at a time)
  const [entriesFor, setEntriesFor] = useState<string | null>(null);
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [entriesLoading, setEntriesLoading] = useState(false);
  const { flags: entryFlags, error: flagsError } = useEntryFlags(entries.map((r) => r.id));

  const load = useCallback(async () => {
    setLoading(true);
    const [compRes, examRes] = await Promise.all([
      supabase
        .from("competitions")
        .select(
          "id,title,audience,package_id,requires_package,published,countdown_state,starts_at,duration_min,ends_at,points,prize_title,prize_details"
        )
        .order("starts_at", { ascending: false })
        .limit(100),
      supabase
        .from("learning_resources")
        .select("id,title,package_id,durationMin:meta->>durationMin")
        .eq("hub", "exams")
        .eq("content_type", "exam")
        .order("title", { ascending: true }),
    ]);
    if (compRes.error) {
      setFeedback({ type: "error", message: friendlyError(compRes.error.message) });
      setRows([]);
    } else {
      setRows((compRes.data ?? []) as unknown as Competition[]);
    }
    if (!examRes.error) {
      setExams((examRes.data ?? []) as unknown as ExamResource[]);
    }
    setNowMs(Date.now());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function run(
    key: string,
    call: () => PromiseLike<{ error: { message: string } | null }>,
    okMessage: string
  ) {
    setBusy(key);
    setFeedback(null);
    const { error } = await call();
    setBusy(null);
    if (error) {
      setFeedback({ type: "error", message: friendlyError(error.message) });
    } else {
      setFeedback({ type: "success", message: okMessage });
    }
    await load();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    if (!resourceId) {
      setFeedback({ type: "error", message: "Please choose an exam from the exam hub." });
      return;
    }
    const startsIso = toEatIso(startsLocal);
    if (!startsIso || new Date(startsIso).getTime() <= Date.now() + 60_000) {
      setFeedback({
        type: "error",
        message: "Pick a start time at least one minute from now (Ethiopia time).",
      });
      return;
    }
    let duration: number | null = null;
    if (durationMin.trim()) {
      if (!/^\d{1,3}$/.test(durationMin.trim()) || Number(durationMin) < 1) {
        setFeedback({ type: "error", message: "Duration must be a whole number of minutes." });
        return;
      }
      duration = Number(durationMin.trim());
    }
    if (!/^\d{1,6}$/.test(points.trim() || "0")) {
      setFeedback({ type: "error", message: "Points must be a whole number (0 or more)." });
      return;
    }

    setBusy("create");
    const { error } = await supabase.rpc("admin_publish_competition_from_exam", {
      p_resource_id: resourceId,
      p_starts_at: startsIso,
      p_title: title.trim() || null,
      p_audience: audience.trim() || null,
      p_duration_min: duration,
      p_points: Number(points.trim() || "0"),
      p_prize_title: prizeTitle.trim() || null,
      p_prize_details: prizeDetails.trim() || null,
      p_requires_package: requiresPackage,
      p_publish: publishNow,
    });
    setBusy(null);
    if (error) {
      setFeedback({ type: "error", message: friendlyError(error.message) });
      return;
    }
    setFeedback({
      type: "success",
      message: publishNow
        ? "Competition created and visible to students."
        : "Competition created as hidden. Use Show to publish it when ready.",
    });
    setResourceId("");
    setTitle("");
    setStartsLocal("");
    setDurationMin("");
    setAudience("");
    setPoints("0");
    setPrizeTitle("");
    setPrizeDetails("");
    setRequiresPackage(false);
    setPublishNow(false);
    await load();
  }

  async function handleReschedule(c: Competition) {
    const startsIso = toEatIso(editStart);
    if (!startsIso || new Date(startsIso).getTime() <= Date.now() + 60_000) {
      setFeedback({
        type: "error",
        message: "Pick a new start at least one minute from now (Ethiopia time).",
      });
      return;
    }
    let duration: number | null = null;
    if (editDuration.trim()) {
      if (!/^\d{1,3}$/.test(editDuration.trim()) || Number(editDuration) < 1) {
        setFeedback({ type: "error", message: "Duration must be a whole number of minutes." });
        return;
      }
      duration = Number(editDuration.trim());
    }
    await run(
      `resched-${c.id}`,
      () =>
        supabase.rpc("admin_reschedule_competition", {
          p_id: c.id,
          p_starts_at: startsIso,
          p_duration_min: duration,
        }),
      "Rescheduled."
    );
    setEditId(null);
  }

  async function openEntries(id: string) {
    if (entriesFor === id) {
      setEntriesFor(null);
      return;
    }
    setEntriesFor(id);
    setEntriesLoading(true);
    setEntries([]);
    const { data, error } = await supabase
      .from("competition_entries")
      .select(
        "id,user_id,status,score,total_count,time_taken_ms,submitted_at,disqualified,disqualified_reason"
      )
      .eq("competition_id", id)
      .eq("mode", "ranked")
      .order("score", { ascending: false, nullsFirst: false })
      .limit(200);
    if (error) {
      setFeedback({ type: "error", message: friendlyError(error.message) });
      setEntriesLoading(false);
      return;
    }
    const list = (data ?? []) as unknown as EntryRow[];
    setEntries(list);
    const ids = Array.from(new Set(list.map((r) => r.user_id)));
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,full_name")
        .in("id", ids);
      const map: Record<string, string> = {};
      for (const p of (profs ?? []) as unknown as { id: string; full_name: string | null }[]) {
        map[p.id] = p.full_name?.trim() || "(no name)";
      }
      setNames(map);
    }
    setEntriesLoading(false);
  }

  async function handleDisqualify(entry: EntryRow) {
    const reason = window.prompt(
      "Reason for disqualifying this entry (the student sees it, and the entry leaves the leaderboard):"
    );
    if (reason === null) return;
    if (!reason.trim()) {
      setFeedback({ type: "error", message: "Please type the reason." });
      return;
    }
    setBusy(`dq-${entry.id}`);
    setFeedback(null);
    const { error } = await supabase.rpc("admin_disqualify_entry", {
      p_entry_id: entry.id,
      p_reason: reason.trim(),
    });
    setBusy(null);
    if (error) {
      setFeedback({ type: "error", message: friendlyError(error.message) });
      return;
    }
    setFeedback({ type: "success", message: "Entry disqualified." });
    if (entriesFor) {
      const id = entriesFor;
      setEntriesFor(null);
      await openEntries(id);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-400/30">
              <Trophy className="w-3.5 h-3.5" />
              Competitions
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Global Timed Exams
          </h2>
          <p className="text-xs sm:text-sm text-wisdom-muted mt-1">
            Create a contest from an exam of the exam hub, then show, pause, start, reschedule or
            cancel it. All times are Ethiopia time.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-2.5 ${
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

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0c1626] to-[#070e1a] p-5 sm:p-7 shadow-xl space-y-5"
      >
        <div className="border-b border-white/8 pb-4">
          <h3 className="text-sm font-bold text-white">Create a Competition</h3>
          <p className="text-[11px] text-wisdom-muted">
            Questions, correct answers and solutions are copied from the chosen exam. Every
            question must have a solution. The contest is created hidden unless you tick
            &quot;Show to students now&quot;.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              Exam from the exam hub <span className="text-rose-400">*</span>
            </label>
            <select
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className={INPUT}
            >
              <option value="">Choose an exam...</option>
              {exams.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.title}
                  {x.package_id ? ` (${x.package_id})` : ""}
                  {x.durationMin ? ` - ${x.durationMin} min` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Title (optional, default: the exam title)
            </label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Starts at (Ethiopia time) <span className="text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              value={startsLocal}
              onChange={(e) => setStartsLocal(e.target.value)}
              className={INPUT}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Duration in minutes (optional, default: the exam&apos;s own)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className={INPUT}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Audience (optional, default: the exam&apos;s package)
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className={INPUT}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Points for the account total</label>
            <input
              type="text"
              inputMode="numeric"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className={INPUT}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Prize title (shown only after the contest ends)
            </label>
            <input
              type="text"
              value={prizeTitle}
              onChange={(e) => setPrizeTitle(e.target.value)}
              className={INPUT}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-300">
              Prize details (shown only after the contest ends)
            </label>
            <textarea
              rows={2}
              value={prizeDetails}
              onChange={(e) => setPrizeDetails(e.target.value)}
              className={`${INPUT} resize-none`}
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-x-6 gap-y-2">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-white">
              <input
                type="checkbox"
                checked={requiresPackage}
                onChange={(e) => setRequiresPackage(e.target.checked)}
                className="accent-sky-400"
              />
              <span>Only students who own the exam&apos;s package may enter</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm text-white">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(e) => setPublishNow(e.target.checked)}
                className="accent-sky-400"
              />
              <span>Show to students now</span>
            </label>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={busy === "create"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Trophy className="w-4 h-4" />
            <span>{busy === "create" ? "Creating..." : "Create competition"}</span>
          </button>
        </div>
      </form>

      {/* List */}
      <div className="rounded-3xl border border-white/10 bg-[#08101e] p-5 sm:p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">All Competitions ({rows.length})</h3>

        {loading ? (
          <p className="text-xs text-wisdom-muted py-6 text-center">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-wisdom-muted py-6 text-center">No competitions yet.</p>
        ) : (
          <div className="divide-y divide-white/8">
            {rows.map((c) => {
              const phase = phaseOf(c, nowMs);
              const cancelled = c.countdown_state === "cancelled";
              const paused = c.countdown_state === "paused";
              const upcoming = phase === "upcoming" && !cancelled;
              return (
                <div key={c.id} className="py-4 space-y-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${badgeClass(
                          cancelled ? "cancelled" : paused ? "paused" : phase
                        )}`}
                      >
                        {cancelled ? "cancelled" : paused ? "paused" : phase}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${badgeClass(
                          c.published ? "live" : "ended"
                        )}`}
                      >
                        {c.published ? "visible" : "hidden"}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        {c.audience ? c.audience : "no audience set"}
                        {c.requires_package ? " / package required" : ""}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{c.title}</h4>
                    <p className="text-xs text-wisdom-muted mt-0.5">
                      {formatEat(c.starts_at)} - {c.duration_min} min
                      {c.ends_at ? ` - ends ${formatEat(c.ends_at)}` : ""} - {c.points} point
                      {c.points === 1 ? "" : "s"}
                    </p>
                    {c.prize_title && (
                      <p className="text-[11px] text-slate-400 mt-0.5">Prize: {c.prize_title}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={BTN}
                      disabled={busy !== null}
                      onClick={() =>
                        void run(
                          `pub-${c.id}`,
                          () =>
                            supabase.rpc("admin_set_competition_published", {
                              p_id: c.id,
                              p_published: !c.published,
                            }),
                          c.published ? "Hidden from students." : "Now visible to students."
                        )
                      }
                    >
                      {c.published ? "Hide" : "Show"}
                    </button>

                    {upcoming && !paused && (
                      <button
                        type="button"
                        className={BTN}
                        disabled={busy !== null}
                        onClick={() =>
                          void run(
                            `pause-${c.id}`,
                            () =>
                              supabase.rpc("admin_set_countdown", { p_id: c.id, p_state: "paused" }),
                            "Countdown paused (students see it as postponed)."
                          )
                        }
                      >
                        Pause countdown
                      </button>
                    )}

                    {paused && !cancelled && (
                      <button
                        type="button"
                        className={BTN}
                        disabled={busy !== null}
                        onClick={() =>
                          void run(
                            `resume-${c.id}`,
                            () =>
                              supabase.rpc("admin_set_countdown", { p_id: c.id, p_state: "running" }),
                            "Countdown running again."
                          )
                        }
                      >
                        Resume countdown
                      </button>
                    )}

                    {upcoming && (
                      <button
                        type="button"
                        className={BTN}
                        disabled={busy !== null}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Start this contest right now? Students can enter immediately."
                            )
                          ) {
                            void run(
                              `start-${c.id}`,
                              () => supabase.rpc("admin_start_competition_now", { p_id: c.id }),
                              "Started now."
                            );
                          }
                        }}
                      >
                        Start now
                      </button>
                    )}

                    {upcoming && (
                      <button
                        type="button"
                        className={BTN}
                        disabled={busy !== null}
                        onClick={() => {
                          setEditId(editId === c.id ? null : c.id);
                          setEditStart("");
                          setEditDuration(String(c.duration_min));
                        }}
                      >
                        Reschedule
                      </button>
                    )}

                    {!cancelled && phase !== "ended" && (
                      <button
                        type="button"
                        className={`${BTN} hover:text-rose-300`}
                        disabled={busy !== null}
                        onClick={() => {
                          if (
                            window.confirm(
                              "Cancel this contest? Students will see it as cancelled."
                            )
                          ) {
                            void run(
                              `cancel-${c.id}`,
                              () =>
                                supabase.rpc("admin_set_countdown", {
                                  p_id: c.id,
                                  p_state: "cancelled",
                                }),
                              "Cancelled."
                            );
                          }
                        }}
                      >
                        Cancel contest
                      </button>
                    )}

                    <button
                      type="button"
                      className={BTN}
                      disabled={busy !== null}
                      onClick={() => void openEntries(c.id)}
                    >
                      {entriesFor === c.id ? "Hide entries" : "Entries"}
                    </button>
                  </div>

                  {editId === c.id && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          New start (Ethiopia time)
                        </label>
                        <input
                          type="datetime-local"
                          value={editStart}
                          onChange={(e) => setEditStart(e.target.value)}
                          className={INPUT}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Duration (minutes)</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={editDuration}
                          onChange={(e) => setEditDuration(e.target.value)}
                          className={INPUT}
                        />
                      </div>
                      <button
                        type="button"
                        className="px-4 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm cursor-pointer disabled:opacity-50"
                        disabled={busy !== null}
                        onClick={() => void handleReschedule(c)}
                      >
                        Save new time
                      </button>
                    </div>
                  )}

                  {entriesFor === c.id && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      {entriesLoading ? (
                        <p className="text-xs text-wisdom-muted">Loading entries...</p>
                      ) : entries.length === 0 ? (
                        <p className="text-xs text-wisdom-muted">No ranked entries yet.</p>
                      ) : (
                        <div className="divide-y divide-white/8">
                          {flagsError && (
                            <p className="text-xs text-rose-300 pb-2">
                              Flags could not be loaded: {flagsError}
                            </p>
                          )}
                          {entries.map((en) => (
                            <div
                              key={en.id}
                              className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                            >
                              <div className="min-w-0 text-xs">
                                <span className="font-bold text-white">
                                  {names[en.user_id] ?? "(unknown)"}
                                </span>
                                <span className="text-slate-400">
                                  {" "}
                                  - {en.status}
                                  {en.score != null && en.total_count != null
                                    ? ` - ${en.score} / ${en.total_count}`
                                    : ""}
                                  {en.time_taken_ms != null ? ` - ${formatTime(en.time_taken_ms)}` : ""}
                                </span>
                                {en.disqualified && (
                                  <span className="block text-rose-300">
                                    Disqualified: {en.disqualified_reason}
                                  </span>
                                )}
                                <EntryFlagsInfo flags={entryFlags[en.id]} />
                              </div>
                              {!en.disqualified && (
                                <button
                                  type="button"
                                  className={`${BTN} hover:text-rose-300`}
                                  disabled={busy !== null}
                                  onClick={() => void handleDisqualify(en)}
                                >
                                  Disqualify
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
