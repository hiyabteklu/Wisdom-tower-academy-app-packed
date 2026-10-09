"use client";

import { useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Target,
  CheckCircle2,
  XCircle,
  Activity,
  Calendar,
  LogIn,
  Gauge,
  Clock,
  Layers,
  Flame,
  BookOpen,
  SkipForward,
  Eye,
  ChevronDown,
  Timer,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { getScopeStats, type HubId, type ScopeStats } from "@/lib/content";
import BrandLoader from "@/components/BrandLoader";
import { useCachedQuery } from "@/hooks/useCachedQuery";

export type ResultEntry = {
  id: string;
  title: string;
  date: string;
  total: number;
  correct: number;
  missed: number;
  percent: number;
  notes?: string | null;
};

export type AcademicResultSaverProps = {
  scopeId: string;
  scopeLabel: string;
  accent?: string;
  scopePath?: string;
  hub?: HubId;
};

function formatTime(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function overallGrade(score: number): {
  label: string;
  colorClass: string;
  badgeBorder: string;
  badgeBg: string;
  tone: string;
  message: string;
} {
  if (score >= 85)
    return {
      label: "Extraordinary",
      colorClass: "text-cyan-300",
      badgeBorder: "border-cyan-400/30",
      badgeBg: "bg-cyan-500/10 text-cyan-300",
      tone: "#22d3ee",
      message: "You're mastering this course: keep this standard and push even higher.",
    };
  if (score >= 70)
    return {
      label: "Excellent",
      colorClass: "text-emerald-300",
      badgeBorder: "border-emerald-400/30",
      badgeBg: "bg-emerald-500/10 text-emerald-300",
      tone: "#34d399",
      message: "Strong momentum: stay consistent and you will reach the top tier.",
    };
  if (score >= 55)
    return {
      label: "Good Progress",
      colorClass: "text-amber-300",
      badgeBorder: "border-amber-400/30",
      badgeBg: "bg-amber-500/10 text-amber-300",
      tone: "#fbbf24",
      message: "Steady progress: consistent daily review will lift your score.",
    };
  if (score >= 40)
    return {
      label: "Needs Review",
      colorClass: "text-orange-300",
      badgeBorder: "border-orange-400/30",
      badgeBg: "bg-orange-500/10 text-orange-300",
      tone: "#fb923c",
      message: "Keep practicing: allocate 15 focused minutes each day on this section.",
    };
  if (score > 0)
    return {
      label: "Getting Started",
      colorClass: "text-rose-300",
      badgeBorder: "border-rose-400/30",
      badgeBg: "bg-rose-500/10 text-rose-300",
      tone: "#fb7185",
      message: "Open materials and complete quick drills to establish your baseline.",
    };
  return {
    label: "Ready to Track",
    colorClass: "text-cyan-300",
    badgeBorder: "border-cyan-400/30",
    badgeBg: "bg-cyan-500/10 text-cyan-300",
    tone: "#22d3ee",
    message: "Start learning to record your reading time, quiz scores, and practice progress.",
  };
}

function computeOverallScore(study: ScopeStats | null, examAvg: number, hasAttempts: boolean): number {
  const parts: number[] = [];
  if (study) {
    if (study.avgProgressPct > 0) parts.push(Math.min(100, study.avgProgressPct));
    const focusTotal = study.totalStudySeconds || 0;
    const focusSec = study.totalFocusSeconds || 0;
    if (focusTotal >= 20) parts.push(Math.round(Math.min(100, (focusSec / Math.max(1, focusTotal)) * 100)));
    const flashTotal = study.flashKnow + study.flashLearning + study.flashAgain;
    if (flashTotal > 0) parts.push(Math.round((study.flashKnow / flashTotal) * 100));
    if (study.quizAttempted > 0) parts.push(Math.round((study.quizCorrect / Math.max(1, study.quizAttempted)) * 100));
    if (study.avgExamPercent > 0) parts.push(study.avgExamPercent);
    if (study.streakDays > 0) parts.push(Math.min(100, 40 + study.streakDays * 8));
  }
  if (hasAttempts && examAvg > 0) parts.push(examAvg);
  if (!parts.length) return 0;
  return Math.round(Math.min(100, Math.max(0, parts.reduce((a, b) => a + b, 0) / parts.length)));
}

/**
 * Compact, fluid circular gauge optimized for mobile WebView and responsive displays
 */
function CircularGauge({
  percent,
  size = 96,
  stroke = 7,
  label,
  sublabel,
  colorClass = "text-cyan-400",
  toneOverride,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  label: string;
  sublabel?: string;
  colorClass?: string;
  toneOverride?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = c - (clamped / 100) * c;
  const tone =
    toneOverride ||
    (clamped >= 80 ? "#34d399" : clamped >= 50 ? "#fbbf24" : clamped > 0 ? "#fb7185" : "#64748b");

  return (
    <div className="flex flex-col items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={tone}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
          <span className={`font-display text-lg sm:text-xl font-black tabular-nums tracking-tight ${colorClass}`}>
            {Math.round(clamped * 10) / 10}
            <span className="text-[11px] font-bold text-white/40 ml-0.5">%</span>
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5 text-center leading-tight">
            {label}
          </span>
        </div>
      </div>
      {sublabel && (
        <p className="mt-1 text-[10px] sm:text-[11px] text-slate-400 text-center max-w-[6rem] sm:max-w-[7.5rem] truncate leading-tight">
          {sublabel}
        </p>
      )}
    </div>
  );
}

export default function AcademicResultSaver({
  scopeId,
  scopeLabel,
  accent = "text-cyan-400",
  scopePath,
  hub,
}: AcademicResultSaverProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [showOpened, setShowOpened] = useState(false);
  const [showAttempts, setShowAttempts] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const fetchProgress = useCallback(async (): Promise<{ results: ResultEntry[]; study: ScopeStats | null }> => {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return { results: [], study: null };

    let loadedResults: ResultEntry[] = [];
    try {
      const semMatch = scopeId.match(/^special-([^-]+(?:-[^-]+)*)-(sem-[12])-(.+)$/);
      let query = supabase
        .from("academic_results")
        .select("id, title, total, correct, missed, percent, notes, created_at")
        .eq("user_id", uid);

      if (semMatch) {
        const otherSem = semMatch[2] === "sem-1" ? "sem-2" : "sem-1";
        const altScopeId = `special-${semMatch[1]}-${otherSem}-${semMatch[3]}`;
        query = query.in("scope_id", [scopeId, altScopeId]);
      } else {
        query = query.eq("scope_id", scopeId);
      }

      const { data, error: qErr } = await query
        .order("created_at", { ascending: false })
        .limit(50);

      if (!qErr && data) {
        loadedResults = data.map((row) => ({
          id: row.id,
          title: row.title,
          date: row.created_at,
          total: row.total,
          correct: row.correct,
          missed: row.missed,
          percent: Number(row.percent),
          notes: row.notes,
        }));
      }
    } catch (e) {
      console.error(e);
    }

    let loadedStudy: ScopeStats | null = null;
    if (scopePath) {
      try {
        const { stats, error: sErr } = await getScopeStats({ scopePath, hub });
        if (!sErr && stats) loadedStudy = stats;
      } catch {}
    }

    return { results: loadedResults, study: loadedStudy };
  }, [scopeId, scopePath, hub]);

  const { data: progressData } = useCachedQuery(
    `academic-progress:${scopeId}:${scopePath || ""}:${hub || ""}`,
    fetchProgress,
    {
      initialData: { results: [], study: null },
      scope: "user",
    }
  );

  const results = useMemo(() => progressData?.results || [], [progressData?.results]);
  const study = progressData?.study || null;
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const stats = useMemo(() => {
    if (!results.length)
      return { avg: 0, best: 0, attempts: 0, totalCorrect: 0, totalMissed: 0, trend: 0, latest: 0 };
    const avg = results.reduce((s, r) => s + r.percent, 0) / results.length;
    return {
      avg: Math.round(avg * 10) / 10,
      best: Math.max(...results.map((r) => r.percent)),
      attempts: results.length,
      totalCorrect: results.reduce((s, r) => s + r.correct, 0),
      totalMissed: results.reduce((s, r) => s + r.missed, 0),
      trend: results.length >= 2 ? results[0].percent - results[1].percent : 0,
      latest: results[0].percent,
    };
  }, [results]);

  const isBooks = hub === "books" || hub === "short-notes" || hub === "life-savers";
  const isFlash = hub === "flashcards";
  const isQuizHub = hub === "question-banks" || hub === "exams";
  const isVideo = hub === "videos";
  const isCombined = !hub;

  const effectiveStudy: ScopeStats = useMemo(() => {
    if (study) return study;
    return {
      rows: [],
      totalStudySeconds: 0,
      totalFocusSeconds: 0,
      avgProgressPct: 0,
      avgFocusLabel: "0%",
      quizAttempted: 0,
      quizCorrect: 0,
      quizWrong: 0,
      flashKnow: 0,
      flashAgain: 0,
      flashLearning: 0,
      videoWatchSeconds: 0,
      examScores: [],
      avgExamPercent: 0,
      streakDays: 0,
    };
  }, [study]);

  const hasStudy =
    !!study &&
    (study.totalStudySeconds > 0 ||
      study.quizAttempted > 0 ||
      study.flashKnow + study.flashAgain + study.flashLearning > 0 ||
      study.rows.length > 0);
  const hasAttempts = results.length > 0;
  const hasAnything = hasStudy || hasAttempts;
  const examAvgForScore = effectiveStudy.avgExamPercent > 0 ? effectiveStudy.avgExamPercent : stats.avg;

  const overall = useMemo(() => {
    const score = computeOverallScore(effectiveStudy, examAvgForScore, hasAttempts);
    return { score, ...overallGrade(score) };
  }, [effectiveStudy, examAvgForScore, hasAttempts]);

  const hubLabel =
    hub === "short-notes" ? "short notes" : hub === "life-savers" ? "life savers" : hub ? hub.replace(/-/g, " ") : "all hubs";

  return (
    <section className="relative overflow-hidden w-full max-w-full rounded-2xl sm:rounded-3xl border border-white/[0.08] bg-[#0c1328]/75 backdrop-blur-xl shadow-[0_8px_30px_rgb(0_0_0/0.18)] transition-all">
      {/* Background ambient lighting */}
      <div
        className="absolute top-0 right-1/4 -z-10 w-44 h-44 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden
      />

      {/* Header Bar */}
      <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-white/[0.06] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 shadow-sm">
            <Gauge className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
              Progress <span className={accent}>Tracker</span>
            </h2>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {scopeLabel} · {hubLabel}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 shrink-0">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>{effectiveStudy.streakDays || 0}d streak</span>
        </span>
      </div>

      {/* Main Performance Overview - Always Visible with Complete Architecture */}
      <div className="p-4 sm:p-5 flex items-center gap-4 sm:gap-6 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] via-transparent to-transparent">
        <CircularGauge
          percent={overall.score}
          label="Overall"
          colorClass={overall.colorClass}
          toneOverride={overall.tone}
          size={88}
          stroke={7}
        />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${overall.badgeBorder} ${overall.badgeBg}`}
            >
              {overall.label}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-snug line-clamp-2 sm:line-clamp-none">
            {overall.message}
          </p>
        </div>
      </div>

      {/* Metric Chips Grid - Rendered for all subject levels and hubs with 0 defaults */}
      {isCombined && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 p-3 sm:p-4 border-b border-white/[0.06]">
          <StatChip
            icon={Clock}
            label="Reading time"
            value={effectiveStudy.totalStudySeconds > 0 ? formatTime(effectiveStudy.totalStudySeconds) : "0m"}
            color="text-cyan-300"
          />
          <StatChip
            icon={BookOpen}
            label="Avg progress"
            value={`${Math.round(effectiveStudy.avgProgressPct || 0)}%`}
            color="text-amber-300"
          />
          <StatChip
            icon={Eye}
            label="Avg focus"
            value={
              effectiveStudy.avgFocusLabel && effectiveStudy.avgFocusLabel !== "-"
                ? effectiveStudy.avgFocusLabel
                : effectiveStudy.totalFocusSeconds > 0
                ? `${Math.round((effectiveStudy.totalFocusSeconds / Math.max(1, effectiveStudy.totalStudySeconds)) * 100)}%`
                : "0%"
            }
            color="text-violet-300"
          />
          <StatChip
            icon={Target}
            label="Questions"
            value={String(effectiveStudy.quizAttempted || stats.attempts || 0)}
            color="text-cyan-200"
          />
          <StatChip
            icon={CheckCircle2}
            label="Correct"
            value={String(effectiveStudy.quizCorrect + (hasAttempts ? stats.totalCorrect : 0))}
            color="text-emerald-300"
          />
          <StatChip
            icon={XCircle}
            label="Missed"
            value={String(effectiveStudy.quizWrong + (hasAttempts ? stats.totalMissed : 0))}
            color="text-rose-300"
          />
          <StatChip
            icon={Layers}
            label="Cards known"
            value={String(effectiveStudy.flashKnow || 0)}
            color="text-violet-300"
          />
          <StatChip
            icon={Layers}
            label="Learning"
            value={String(effectiveStudy.flashLearning || 0)}
            color="text-amber-200"
          />
          <StatChip
            icon={Gauge}
            label="Exam avg"
            value={
              effectiveStudy.avgExamPercent > 0
                ? `${effectiveStudy.avgExamPercent}%`
                : stats.avg > 0
                ? `${stats.avg}%`
                : "0%"
            }
            color="text-amber-200"
          />
          <StatChip
            icon={Flame}
            label="Streak"
            value={`${effectiveStudy.streakDays || 0}d`}
            color="text-orange-300"
          />
        </div>
      )}

      {isBooks && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 p-3 sm:p-4 border-b border-white/[0.06]">
          <StatChip
            icon={Clock}
            label="Reading time"
            value={effectiveStudy.totalStudySeconds > 0 ? formatTime(effectiveStudy.totalStudySeconds) : "0m"}
            color="text-cyan-300"
          />
          <StatChip
            icon={BookOpen}
            label="Avg progress"
            value={`${Math.round(effectiveStudy.avgProgressPct || 0)}%`}
            color="text-amber-300"
          />
          <StatChip
            icon={Eye}
            label="Avg focus"
            value={
              effectiveStudy.avgFocusLabel && effectiveStudy.avgFocusLabel !== "-"
                ? effectiveStudy.avgFocusLabel
                : effectiveStudy.totalFocusSeconds > 0
                ? `${Math.round((effectiveStudy.totalFocusSeconds / Math.max(1, effectiveStudy.totalStudySeconds)) * 100)}%`
                : "0%"
            }
            color="text-violet-300"
          />
          <StatChip
            icon={CheckCircle2}
            label="Completed"
            value={String(effectiveStudy.rows.filter((r) => r.progressPct >= 90).length)}
            color="text-emerald-300"
          />
          <StatChip
            icon={Timer}
            label="Focus time"
            value={effectiveStudy.totalFocusSeconds > 0 ? formatTime(effectiveStudy.totalFocusSeconds) : "0m"}
            color="text-cyan-200"
          />
          <StatChip
            icon={Flame}
            label="Streak"
            value={`${effectiveStudy.streakDays || 0}d`}
            color="text-orange-300"
          />
        </div>
      )}

      {isFlash && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 p-3 sm:p-4 border-b border-white/[0.06]">
          <StatChip
            icon={CheckCircle2}
            label="Cards known"
            value={String(effectiveStudy.flashKnow || 0)}
            color="text-emerald-300"
          />
          <StatChip
            icon={Layers}
            label="Learning"
            value={String(effectiveStudy.flashLearning || 0)}
            color="text-amber-200"
          />
          <StatChip
            icon={XCircle}
            label="Again"
            value={String(effectiveStudy.flashAgain || 0)}
            color="text-rose-300"
          />
          <StatChip
            icon={Target}
            label="Reviewed"
            value={String(
              (effectiveStudy.flashKnow || 0) +
                (effectiveStudy.flashLearning || 0) +
                (effectiveStudy.flashAgain || 0)
            )}
            color="text-cyan-200"
          />
          <StatChip
            icon={Gauge}
            label="Mastery"
            value={`${
              effectiveStudy.flashKnow + effectiveStudy.flashLearning + effectiveStudy.flashAgain > 0
                ? Math.round(
                    (effectiveStudy.flashKnow /
                      (effectiveStudy.flashKnow +
                        effectiveStudy.flashLearning +
                        effectiveStudy.flashAgain)) *
                      100
                  )
                : 0
            }%`}
            color="text-violet-300"
          />
          <StatChip
            icon={Flame}
            label="Streak"
            value={`${effectiveStudy.streakDays || 0}d`}
            color="text-orange-300"
          />
        </div>
      )}

      {isQuizHub && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 p-3 sm:p-4 border-b border-white/[0.06]">
          <StatChip
            icon={Target}
            label="Questions"
            value={String(effectiveStudy.quizAttempted || stats.attempts || 0)}
            color="text-cyan-200"
          />
          <StatChip
            icon={CheckCircle2}
            label="Correct"
            value={String(effectiveStudy.quizCorrect + (hasAttempts ? stats.totalCorrect : 0))}
            color="text-emerald-300"
          />
          <StatChip
            icon={XCircle}
            label="Missed"
            value={String(effectiveStudy.quizWrong + (hasAttempts ? stats.totalMissed : 0))}
            color="text-rose-300"
          />
          <StatChip
            icon={Gauge}
            label="Exam avg"
            value={
              effectiveStudy.avgExamPercent > 0
                ? `${effectiveStudy.avgExamPercent}%`
                : stats.avg > 0
                ? `${stats.avg}%`
                : "0%"
            }
            color="text-amber-200"
          />
          <StatChip
            icon={Clock}
            label="Practice time"
            value={effectiveStudy.totalStudySeconds > 0 ? formatTime(effectiveStudy.totalStudySeconds) : "0m"}
            color="text-cyan-300"
          />
          <StatChip
            icon={Flame}
            label="Streak"
            value={`${effectiveStudy.streakDays || 0}d`}
            color="text-orange-300"
          />
        </div>
      )}

      {isVideo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 border-b border-white/[0.06]">
          <StatChip
            icon={Clock}
            label="Watch time"
            value={formatTime(
              effectiveStudy.videoWatchSeconds || effectiveStudy.totalStudySeconds || 0
            )}
            color="text-cyan-300"
          />
          <StatChip
            icon={BookOpen}
            label="Avg progress"
            value={`${Math.round(effectiveStudy.avgProgressPct || 0)}%`}
            color="text-amber-300"
          />
          <StatChip
            icon={CheckCircle2}
            label="Completed"
            value={String(effectiveStudy.rows.filter((r) => r.progressPct >= 90).length)}
            color="text-emerald-300"
          />
          <StatChip
            icon={Flame}
            label="Streak"
            value={`${effectiveStudy.streakDays || 0}d`}
            color="text-orange-300"
          />
        </div>
      )}

      {/* Scored Attempts Gauges - Always Visible for Quizzes/Exams and Combined Subject View */}
      {(isCombined || isQuizHub) && (
        <div className="p-3 sm:p-4 border-b border-white/[0.06] bg-white/[0.01]">
          <div className="flex items-center justify-around gap-2 sm:gap-4">
            <div className="flex-1 flex justify-center p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <CircularGauge
                percent={stats.latest || 0}
                label="Latest"
                sublabel={results[0]?.title || "Latest drill"}
                colorClass={
                  stats.latest >= 80
                    ? "text-emerald-400"
                    : stats.latest >= 50
                    ? "text-amber-400"
                    : "text-cyan-400"
                }
                size={72}
                stroke={5}
              />
            </div>
            <div className="flex-1 flex justify-center p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <CircularGauge
                percent={stats.avg > 0 ? stats.avg : (effectiveStudy.avgExamPercent || 0)}
                label="Average"
                sublabel={stats.attempts > 0 ? `${stats.attempts} tries` : "All drills"}
                colorClass="text-amber-400"
                size={72}
                stroke={5}
              />
            </div>
            <div className="flex-1 flex justify-center p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <CircularGauge
                percent={stats.best || 0}
                label="Best"
                sublabel="Peak score"
                colorClass="text-emerald-400"
                size={72}
                stroke={5}
              />
            </div>
          </div>
        </div>
      )}

      {/* Previously Opened Items Accordion */}
      <div className="border-b border-white/[0.06]">
        <button
          type="button"
          onClick={() => setShowOpened((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-4 sm:px-5 py-3 text-left hover:bg-white/[0.02] transition-colors"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            Recently Opened Items
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.05] text-slate-300">
              {effectiveStudy.rows.length}
            </span>
          </span>
          <span className="w-6 h-6 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                showOpened ? "rotate-180" : ""
              }`}
            />
          </span>
        </button>
        {showOpened && (
          effectiveStudy.rows.length > 0 ? (
            <ul className="px-4 sm:px-5 pb-4 space-y-1.5">
              {effectiveStudy.rows
                .slice()
                .sort((a, b) => b.totalSeconds - a.totalSeconds)
                .slice(0, 8)
                .map((r) => (
                  <li
                    key={r.resourceId}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] px-3 py-2 text-xs transition-colors"
                  >
                    <span className="font-medium text-white/90 truncate flex-1 min-w-0">
                      {r.title}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {formatTime(r.totalSeconds)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 border border-amber-400/20 text-amber-300 shrink-0">
                      {Math.round(r.progressPct)}%
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="px-4 sm:px-5 pb-3.5 text-xs text-slate-400 italic">
              No materials opened yet. Your reading history and progress will appear here automatically when you study.
            </div>
          )
        )}
      </div>

      {/* Scored Attempts Accordion */}
      {(isCombined || isQuizHub) && (
        <div>
          <button
            type="button"
            onClick={() => setShowAttempts((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 sm:px-5 py-3 text-left hover:bg-white/[0.02] transition-colors"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              Exam & Quiz History
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/[0.05] text-slate-300">
                {results.length}
              </span>
            </span>
            <span className="w-6 h-6 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  showAttempts ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>
          {showAttempts && (
            results.length > 0 ? (
              <ul className="px-4 sm:px-5 pb-4 space-y-2">
                {results.map((r) => (
                  <li
                    key={r.id}
                    className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 space-y-1.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs sm:text-sm text-white truncate flex-1 min-w-0">
                        {r.title}
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold tabular-nums border ${
                          r.percent >= 80
                            ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300"
                            : r.percent >= 50
                            ? "bg-amber-500/10 border-amber-400/30 text-amber-300"
                            : "bg-rose-500/10 border-rose-400/30 text-rose-300"
                        }`}
                      >
                        {r.percent}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400/80" /> {r.correct}/
                        {r.total} correct
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-400/80" /> {r.missed} missed
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <SkipForward className="w-3 h-3 text-slate-400" />{" "}
                        {Math.max(0, r.total - r.correct - r.missed)} skipped
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />{" "}
                        {new Date(r.date).toLocaleDateString()}
                      </span>
                    </div>
                    {r.notes && (
                      <p className="text-[11px] text-slate-400/80 line-clamp-2 italic">
                        {r.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 sm:px-5 pb-3.5 text-xs text-slate-400 italic">
                No scored attempts recorded yet. Completed quizzes and exams will record here with worked breakdown.
              </div>
            )
          )}
        </div>
      )}

      {/* Minimal Guest Sign-in Strip */}
      {!user ? (
        <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between gap-3 text-xs">
          <p className="text-slate-400 text-[11px] sm:text-xs">
            Sign in to sync your study progress across devices.
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(pathname || "/learning")}`}
            className="inline-flex items-center gap-1 font-semibold text-cyan-300 hover:text-cyan-200 text-xs shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" /> Sign In
          </Link>
        </div>
      ) : null}
    </section>
  );
}

/**
 * Modern translucent micro-card for key study stats
 */
function StatChip({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] p-2.5 sm:p-3 transition-colors flex flex-col justify-between min-w-0">
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center shrink-0">
          <Icon className={`w-3 h-3 ${color}`} />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 truncate">
          {label}
        </span>
      </div>
      <p className={`font-display text-sm sm:text-base font-bold tabular-nums truncate mt-1.5 ${color}`}>
        {value}
      </p>
    </div>
  );
}
