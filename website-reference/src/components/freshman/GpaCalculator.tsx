"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import {
  Calculator,
  Plus,
  Trash2,
  BookOpen,
  Info,
  ChevronDown,
  Check,
} from "lucide-react";
import { freshmanSubjects } from "@/data/freshman";
import {
  GRADE_BANDS,
  LETTER_OPTIONS,
  POINT_OPTIONS,
  bandFromLetter,
  bandFromPercent,
  bandFromPoints,
  intervalLabel,
  type GradeBand,
} from "@/data/gpa-scale";

// Physical Fitness is pass/fail only, excluded from GPA scale
const GPA_FRESHMAN_SUBJECTS = freshmanSubjects.filter(
  (s) => s.id !== "physical-fitness"
);

type InputMode = "letter" | "percent" | "points";

type Row = {
  id: string;
  subjectId: string;
  credits: number;
  mode: InputMode;
  percent: string;
  letter: string;
  points: string;
};

function newRow(subjectId = ""): Row {
  return {
    id: `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    subjectId,
    credits: 3,
    mode: "letter",
    percent: "",
    letter: "A",
    points: "4",
  };
}

function resolveBand(row: Row): GradeBand | null {
  if (row.mode === "percent") {
    const n = parseFloat(row.percent);
    if (Number.isNaN(n) || row.percent.trim() === "") return null;
    return bandFromPercent(n);
  }
  if (row.mode === "letter") {
    return bandFromLetter(row.letter) ?? null;
  }
  const n = parseFloat(row.points);
  if (Number.isNaN(n)) return null;
  return bandFromPoints(n);
}

function subjectName(id: string) {
  return GPA_FRESHMAN_SUBJECTS.find((s) => s.id === id)?.name ?? "-";
}

/** Custom native-designed dark popover subject picker matching website aesthetic */
function NativeSubjectPicker({
  value,
  onChange,
  available,
}: {
  value: string;
  onChange: (val: string) => void;
  available: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const selected = GPA_FRESHMAN_SUBJECTS.find((s) => s.id === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] hover:border-purple-400/40 text-left text-xs text-white transition-all cursor-pointer"
      >
        <span className="truncate flex-1 font-medium">
          {selected ? selected.name : "Select course…"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-wisdom-muted shrink-0 transition-transform ${
            open ? "rotate-180 text-purple-300" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-full min-w-[13rem] sm:min-w-[16rem] max-h-56 overflow-y-auto rounded-xl border border-purple-400/30 bg-[#0d1627] backdrop-blur-2xl shadow-2xl p-1 animate-in fade-in zoom-in-95 duration-150">
          {available.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onChange(s.id);
                setOpen(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                s.id === value
                  ? "bg-purple-500/25 text-purple-200 font-bold"
                  : "text-slate-200 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <span className="truncate">{s.name}</span>
              {s.id === value && (
                <Check className="w-3.5 h-3.5 text-purple-300 shrink-0 ml-1.5" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GpaCalculator() {
  const [rows, setRows] = useState<Row[]>([newRow()]);
  const [showScale, setShowScale] = useState(false);

  const usedIds = useMemo(
    () => new Set(rows.map((r) => r.subjectId).filter(Boolean)),
    [rows]
  );

  const computed = useMemo(() => {
    const lines: {
      row: Row;
      band: GradeBand;
      name: string;
    }[] = [];

    let creditSum = 0;
    let pointCreditSum = 0;

    for (const row of rows) {
      if (!row.subjectId) continue;
      const band = resolveBand(row);
      if (!band) continue;
      const cr = Math.max(0.5, row.credits || 0);
      lines.push({ row, band, name: subjectName(row.subjectId) });
      creditSum += cr;
      pointCreditSum += band.points * cr;
    }

    const gpa = creditSum > 0 ? pointCreditSum / creditSum : null;
    return { lines, creditSum, gpa };
  }, [rows]);

  function update(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function remove(id: string) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  const gpaColor =
    computed.gpa == null
      ? "text-white"
      : computed.gpa >= 3.5
        ? "text-emerald-300"
        : computed.gpa >= 2.5
          ? "text-sky-300"
          : computed.gpa >= 2.0
            ? "text-amber-300"
            : "text-rose-300";

  return (
    <section className="rounded-3xl border border-purple-400/25 bg-gradient-to-br from-purple-500/[0.08] via-wisdom-card to-wisdom-card overflow-hidden shadow-card-3d">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-white/10 bg-gradient-to-r from-purple-500/15 via-transparent to-pink-500/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl border border-purple-400/30 bg-purple-500/15 text-purple-300 shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
                GPA calculator
              </h2>
              <p className="text-[11px] text-wisdom-muted hidden sm:block">
                Add courses and grades; calculated with the official national scale.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowScale((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-300 border border-purple-400/30 rounded-xl px-2.5 py-1.5 hover:bg-purple-500/10 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showScale ? "Hide scale" : "Grade scale"}</span>
          </button>
        </div>
      </div>

      {/* Grade scale reference */}
      {showScale && (
        <div className="px-3 sm:px-6 py-3 border-b border-white/10 overflow-x-auto bg-[#0a1120]">
          <table className="w-full min-w-[28rem] text-left text-xs">
            <thead>
              <tr className="text-wisdom-muted border-b border-white/10">
                <th className="py-1.5 pr-2 font-semibold">Interval %</th>
                <th className="py-1.5 pr-2 font-semibold">Letter</th>
                <th className="py-1.5 pr-2 font-semibold">Points</th>
                <th className="py-1.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {GRADE_BANDS.map((b) => (
                <tr key={b.letter} className="border-b border-white/5 text-white/80">
                  <td className="py-1 pr-2 font-mono text-[11px] text-wisdom-muted">
                    {intervalLabel(b)}
                  </td>
                  <td className="py-1 pr-2 font-bold text-purple-300">{b.letter}</td>
                  <td className="py-1 pr-2 tabular-nums">{b.points.toFixed(2)}</td>
                  <td className="py-1 text-wisdom-muted">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-3 sm:p-5 space-y-3">
        {/* Table column headers */}
        <div className="grid grid-cols-12 gap-1.5 sm:gap-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-wisdom-muted">
          <div className="col-span-6 sm:col-span-5">Course</div>
          <div className="col-span-2 text-center">Cr</div>
          <div className="col-span-3 sm:col-span-3">Grade</div>
          <div className="hidden sm:block sm:col-span-1 text-center">Pts</div>
          <div className="col-span-1 text-right"></div>
        </div>

        {/* Compact, single-row courses on mobile & desktop */}
        <div className="space-y-1.5">
          {rows.map((row) => {
            const band = resolveBand(row);
            const available = GPA_FRESHMAN_SUBJECTS.filter(
              (s) => s.id === row.subjectId || !usedIds.has(s.id)
            );

            return (
              <div
                key={row.id}
                className="grid grid-cols-12 gap-1.5 sm:gap-2 items-center p-1.5 sm:p-2 rounded-xl border border-white/10 bg-wisdom-dark/40 hover:border-white/20 transition-all"
              >
                {/* 1. Subject Picker */}
                <div className="col-span-6 sm:col-span-5 min-w-0">
                  <NativeSubjectPicker
                    value={row.subjectId}
                    onChange={(val) => update(row.id, { subjectId: val })}
                    available={available}
                  />
                </div>

                {/* 2. Credits Input */}
                <div className="col-span-2">
                  <input
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={row.credits}
                    onChange={(e) =>
                      update(row.id, { credits: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="3"
                    className="w-full text-center rounded-xl border border-white/15 bg-white/[0.04] px-1 py-1.5 text-xs text-white font-semibold outline-none focus:border-purple-400/50"
                  />
                </div>

                {/* 3. Grade Input + Mode Toggle */}
                <div className="col-span-3 flex items-center gap-1">
                  {row.mode === "letter" ? (
                    <select
                      value={row.letter}
                      onChange={(e) => update(row.id, { letter: e.target.value })}
                      className="w-full text-center rounded-xl border border-white/15 bg-[#0d1627] px-1 py-1.5 text-xs text-purple-200 font-bold outline-none focus:border-purple-400/50 cursor-pointer"
                    >
                      {LETTER_OPTIONS.map((L) => (
                        <option key={L} value={L}>
                          {L}
                        </option>
                      ))}
                    </select>
                  ) : row.mode === "points" ? (
                    <select
                      value={row.points}
                      onChange={(e) => update(row.id, { points: e.target.value })}
                      className="w-full text-center rounded-xl border border-white/15 bg-[#0d1627] px-1 py-1.5 text-xs text-purple-200 font-bold outline-none focus:border-purple-400/50 cursor-pointer"
                    >
                      {POINT_OPTIONS.map((p) => (
                        <option key={p} value={String(p)}>
                          {p.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      placeholder="%"
                      value={row.percent}
                      onChange={(e) => update(row.id, { percent: e.target.value })}
                      className="w-full text-center rounded-xl border border-white/15 bg-white/[0.04] px-1 py-1.5 text-xs text-white font-semibold outline-none focus:border-purple-400/50"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const nextMode: InputMode =
                        row.mode === "letter"
                          ? "percent"
                          : row.mode === "percent"
                            ? "points"
                            : "letter";
                      update(row.id, { mode: nextMode });
                    }}
                    title={`Grade mode: ${row.mode} (click to toggle)`}
                    className="text-[9px] font-bold text-wisdom-muted hover:text-purple-300 px-1 py-1 rounded border border-white/10 bg-white/[0.04] shrink-0 uppercase"
                  >
                    {row.mode === "letter" ? "L" : row.mode === "percent" ? "%" : "Pt"}
                  </button>
                </div>

                {/* 4. Points display (Desktop) */}
                <div className="hidden sm:flex sm:col-span-1 items-center justify-center">
                  <span className="text-xs font-bold text-purple-300 tabular-nums">
                    {band ? band.points.toFixed(1) : "-"}
                  </span>
                </div>

                {/* 5. Remove Row Button */}
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(row.id)}
                    disabled={rows.length <= 1}
                    className="p-1 rounded-lg text-wisdom-muted hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-20 transition-colors"
                    aria-label="Remove course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Course Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= GPA_FRESHMAN_SUBJECTS.length}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-purple-400/40 text-purple-200 text-xs font-semibold hover:bg-purple-500/10 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add course</span>
          </button>
        </div>

        {/* Results summary */}
        <div className="mt-3 rounded-2xl border border-white/12 bg-wisdom-dark/60 overflow-hidden">
          {computed.lines.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <BookOpen className="w-6 h-6 text-white/15 mx-auto mb-1.5" />
              <p className="text-xs text-wisdom-muted">
                Select courses and enter grades to calculate your semester GPA.
              </p>
            </div>
          ) : (
            <div className="px-4 py-3 bg-gradient-to-r from-purple-500/15 to-transparent flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-wisdom-muted font-bold">
                  Total credits
                </p>
                <p className="text-base font-bold text-white tabular-nums">
                  {computed.creditSum.toFixed(1)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-wisdom-muted font-bold">
                  Semester GPA
                </p>
                <p className={`text-2xl sm:text-3xl font-black tabular-nums ${gpaColor}`}>
                  {computed.gpa != null ? computed.gpa.toFixed(2) : "-"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
