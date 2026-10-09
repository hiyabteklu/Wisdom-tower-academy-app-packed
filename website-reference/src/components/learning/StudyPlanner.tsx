"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Plus,
  Trash2,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  X,
  Edit2,
  Calendar,
} from "lucide-react";

export type StudyBlock = {
  id: string;
  day: number; // 0 = Mon, 1 = Tue, ... 6 = Sun
  startTime: string; // "09:15" (24-hour format HH:MM)
  endTime: string; // "10:45" (24-hour format HH:MM)
  title: string;
  color: string;
  category?: string;
};

const STORAGE_KEY = "wt_study_planner_v3";
const HOUR_HEIGHT = 38; // Compact px per hour (fits comfortably in mobile view)

const DAYS = [
  { short: "Mon", full: "Monday" },
  { short: "Tue", full: "Tuesday" },
  { short: "Wed", full: "Wednesday" },
  { short: "Thu", full: "Thursday" },
  { short: "Fri", full: "Friday" },
  { short: "Sat", full: "Saturday" },
  { short: "Sun", full: "Sunday" },
] as const;

// 24 Hours from 12 AM to 11 PM
const HOURS_24 = Array.from({ length: 24 }, (_, i) => {
  const ampm = i >= 12 ? "PM" : "AM";
  const displayH = i % 12 === 0 ? 12 : i % 12;
  return {
    hour: i,
    label: `${displayH} ${ampm}`,
    timeStr: `${String(i).padStart(2, "0")}:00`,
  };
});

const PALETTES = [
  {
    id: "cyan",
    name: "Cyan",
    classes: "bg-cyan-500/20 border-cyan-400/80 text-cyan-100 hover:bg-cyan-500/30",
    badge: "bg-cyan-400 text-slate-950",
  },
  {
    id: "amber",
    name: "Gold",
    classes: "bg-amber-500/20 border-amber-400/80 text-amber-100 hover:bg-amber-500/30",
    badge: "bg-amber-400 text-slate-950",
  },
  {
    id: "emerald",
    name: "Emerald",
    classes: "bg-emerald-500/20 border-emerald-400/80 text-emerald-100 hover:bg-emerald-500/30",
    badge: "bg-emerald-400 text-slate-950",
  },
  {
    id: "violet",
    name: "Purple",
    classes: "bg-violet-500/20 border-violet-400/80 text-violet-100 hover:bg-violet-500/30",
    badge: "bg-violet-400 text-slate-950",
  },
  {
    id: "rose",
    name: "Rose",
    classes: "bg-rose-500/20 border-rose-400/80 text-rose-100 hover:bg-rose-500/30",
    badge: "bg-rose-400 text-slate-950",
  },
  {
    id: "sky",
    name: "Sky",
    classes: "bg-sky-500/20 border-sky-400/80 text-sky-100 hover:bg-sky-500/30",
    badge: "bg-sky-400 text-slate-950",
  },
];

function format12Hour(timeStr: string): string {
  if (!timeStr) return "";
  const [hStr, mStr] = timeStr.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr || "0", 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = String(m).padStart(2, "0");
  return `${displayH}:${displayM} ${ampm}`;
}

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(totalM: number): string {
  const clamped = Math.max(0, Math.min(24 * 60 - 1, totalM));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function todayIndex(d = new Date()) {
  return (d.getDay() + 6) % 7; // Monday = 0, Sunday = 6
}

function loadSavedBlocks(): StudyBlock[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("wt_study_planner_v2");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StudyBlock[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function StudyPlanner() {
  const [blocks, setBlocks] = useState<StudyBlock[]>([]);
  const [ready, setReady] = useState(false);
  const [mobileDayFilter, setMobileDayFilter] = useState<number | "all">("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Modal editor state (minute-precise)
  const [editingBlock, setEditingBlock] = useState<StudyBlock | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftDay, setDraftDay] = useState(0);
  const [draftStart, setDraftStart] = useState("09:00");
  const [draftEnd, setDraftEnd] = useState("10:30");
  const [draftColor, setDraftColor] = useState(PALETTES[0].classes);

  // Current time position tracker
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Initialize blocks
  useEffect(() => {
    const loaded = loadSavedBlocks();
    if (loaded.length === 0) {
      const starter: StudyBlock[] = [
        { id: "b1", day: 0, startTime: "08:30", endTime: "10:00", title: "Math - Calculus I", color: PALETTES[0].classes },
        { id: "b2", day: 0, startTime: "14:15", endTime: "15:45", title: "Physics - Mechanics", color: PALETTES[1].classes },
        { id: "b3", day: 1, startTime: "09:00", endTime: "10:30", title: "Chemistry - Kinetics", color: PALETTES[2].classes },
        { id: "b4", day: 2, startTime: "10:30", endTime: "12:00", title: "Biology - Genetics", color: PALETTES[3].classes },
        { id: "b5", day: 3, startTime: "15:00", endTime: "16:30", title: "Logic & Critical Thinking", color: PALETTES[4].classes },
        { id: "b6", day: 4, startTime: "08:30", endTime: "10:00", title: "Freshman English II", color: PALETTES[5].classes },
        { id: "b7", day: 5, startTime: "16:00", endTime: "17:30", title: "Exit Exam Drill", color: PALETTES[1].classes },
      ];
      setBlocks(starter);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(starter));
    } else {
      setBlocks(loaded);
    }
    setReady(true);
  }, []);

  const persistBlocks = useCallback((next: StudyBlock[]) => {
    setBlocks(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  // Open modal to create a new session
  const handleOpenAdd = (defaultDay = 0, defaultStartHour = 9) => {
    setEditingBlock(null);
    setDraftTitle("");
    setDraftDay(defaultDay);
    const startStr = `${String(defaultStartHour).padStart(2, "0")}:00`;
    const endHour = (defaultStartHour + 1) % 24;
    const endStr = `${String(endHour).padStart(2, "0")}:30`;
    setDraftStart(startStr);
    setDraftEnd(endStr);
    setDraftColor(PALETTES[blocks.length % PALETTES.length].classes);
    setIsModalOpen(true);
  };

  // Open modal to edit existing session
  const handleOpenEdit = (block: StudyBlock) => {
    setEditingBlock(block);
    setDraftTitle(block.title);
    setDraftDay(block.day);
    setDraftStart(block.startTime);
    setDraftEnd(block.endTime);
    setDraftColor(block.color);
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const title = draftTitle.trim() || "Study Session";

    let startM = timeToMinutes(draftStart);
    let endM = timeToMinutes(draftEnd);
    if (endM <= startM) {
      endM = Math.min(24 * 60 - 1, startM + 60);
    }

    const cleanStart = minutesToTime(startM);
    const cleanEnd = minutesToTime(endM);

    if (editingBlock) {
      const updated = blocks.map((b) =>
        b.id === editingBlock.id
          ? {
              ...b,
              title,
              day: draftDay,
              startTime: cleanStart,
              endTime: cleanEnd,
              color: draftColor,
            }
          : b
      );
      persistBlocks(updated);
    } else {
      const newBlock: StudyBlock = {
        id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        day: draftDay,
        startTime: cleanStart,
        endTime: cleanEnd,
        color: draftColor,
      };
      persistBlocks([...blocks, newBlock]);
    }

    setIsModalOpen(false);
    setEditingBlock(null);
  };

  const handleDeleteBlock = (id: string) => {
    persistBlocks(blocks.filter((b) => b.id !== id));
    setIsModalOpen(false);
    setEditingBlock(null);
  };

  // Quick adjust duration buttons (+15m, +30m, +45m, +60m, +90m)
  const handleSetDuration = (durationMinutes: number) => {
    const startM = timeToMinutes(draftStart);
    const newEndM = startM + durationMinutes;
    setDraftEnd(minutesToTime(newEndM));
  };

  // Auto-scroll helper to specific times of day
  const scrollToHour = (targetHour: number) => {
    if (scrollContainerRef.current) {
      const targetY = targetHour * HOUR_HEIGHT - 30;
      scrollContainerRef.current.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth",
      });
    }
  };

  // Scroll to current hour on initial load
  useEffect(() => {
    if (ready) {
      const currentH = Math.max(6, Math.min(20, new Date().getHours() - 1));
      setTimeout(() => scrollToHour(currentH), 150);
    }
  }, [ready]);

  // Active days to display (either all 7 or a single focused day on mobile)
  const visibleDays = useMemo(() => {
    if (mobileDayFilter === "all") {
      return DAYS.map((d, i) => ({ ...d, dayIndex: i }));
    }
    return [
      {
        ...DAYS[mobileDayFilter],
        dayIndex: mobileDayFilter,
      },
    ];
  }, [mobileDayFilter]);

  const today = todayIndex();

  if (!ready) return null;

  return (
    <div className="space-y-4 font-sans select-none">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & QUICK TIME JUMPERS                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
              24-Hour Weekly Timetable
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
              Minute-Accurate
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Vertical 24 hours (12 AM – 11 PM) · Tap any time slot to set or adjust a block
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Jump Buttons (Morning / Afternoon / Evening / Now) */}
          <div className="flex items-center rounded-full bg-white/[0.04] p-1 border border-white/10 text-xs backdrop-blur-xl">
            <button
              type="button"
              onClick={() => scrollToHour(7)}
              className="px-3 py-1 rounded-full text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              title="Jump to Morning (7 AM)"
            >
              <Sun className="w-3 h-3 text-amber-300" />
              <span className="hidden sm:inline">Morning</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToHour(13)}
              className="px-3 py-1 rounded-full text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              title="Jump to Afternoon (1 PM)"
            >
              <Sunset className="w-3 h-3 text-orange-300" />
              <span className="hidden sm:inline">Afternoon</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToHour(19)}
              className="px-3 py-1 rounded-full text-[11px] font-medium text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
              title="Jump to Evening (7 PM)"
            >
              <Moon className="w-3 h-3 text-violet-300" />
              <span className="hidden sm:inline">Evening</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToHour(Math.floor(currentTimeMinutes / 60))}
              className="px-3 py-1 rounded-full text-[11px] font-bold text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer"
              title="Jump to Current Time"
            >
              Now
            </button>
          </div>

          {/* Add Block Button */}
          <button
            type="button"
            onClick={() => handleOpenAdd(typeof mobileDayFilter === "number" ? mobileDayFilter : today)}
            className="px-4 py-2 rounded-full bg-white text-slate-950 hover:bg-slate-200 font-semibold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-950" />
            <span>Add Block</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. DAY SELECTOR CHIPS (Mobile filter & Quick day switcher)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <button
          type="button"
          onClick={() => setMobileDayFilter("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border active:scale-95 cursor-pointer ${
            mobileDayFilter === "all"
              ? "bg-white text-slate-950 border-white shadow-sm font-semibold"
              : "bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]"
          }`}
        >
          Full Week
        </button>

        {DAYS.map((d, i) => {
          const isSelected = mobileDayFilter === i;
          const isToday = i === today;
          const count = blocks.filter((b) => b.day === i).length;
          return (
            <button
              key={d.short}
              type="button"
              onClick={() => setMobileDayFilter(i)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 border active:scale-95 cursor-pointer ${
                isSelected
                  ? "bg-white text-slate-950 border-white shadow-sm font-semibold"
                  : "bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]"
              }`}
            >
              <span>{d.short}</span>
              {isToday && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? "bg-slate-950" : "bg-cyan-400"
                  }`}
                />
              )}
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-slate-900/30 text-slate-950" : "bg-white/10 text-slate-300"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. VISUALLY CLEAN 24-HOUR TIMETABLE GRID                     */}
      {/* Vertical 24 hours AM-PM (sticky left) & Days (sticky top)     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="relative rounded-2xl border border-white/15 bg-[#070e1c] shadow-2xl overflow-auto max-h-[580px] scrollbar-thin"
        style={{
          scrollBehavior: "smooth",
        }}
      >
        <div
          className="relative grid"
          style={{
            minWidth: mobileDayFilter === "all" ? "100%" : "100%",
            gridTemplateColumns: `38px repeat(${visibleDays.length}, minmax(${
              mobileDayFilter === "all" ? "42px" : "120px"
            }, 1fr))`,
          }}
        >
          {/* Top-Left Corner: Time Label (Sticky Top & Left) */}
          <div className="sticky top-0 left-0 z-30 bg-[#0b1528] border-b border-r border-white/15 p-1 text-center text-[9px] font-mono font-bold text-slate-400 flex items-center justify-center">
            GMT+3
          </div>

          {/* Sticky Day Headers Row */}
          {visibleDays.map((d) => {
            const isToday = d.dayIndex === today;
            const dayBlocks = blocks.filter((b) => b.day === d.dayIndex);
            return (
              <div
                key={d.short}
                className={`sticky top-0 z-20 py-1.5 px-1 text-center border-b border-r border-white/15 backdrop-blur-md transition-colors ${
                  isToday ? "bg-[#0e213d] text-cyan-300" : "bg-[#0b1528]/95 text-white"
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="font-display font-bold text-xs">
                    {d.short}
                  </span>
                  {isToday && (
                    <span className="hidden sm:inline px-1 py-0.2 rounded text-[8px] font-black uppercase tracking-wider bg-cyan-400 text-slate-950">
                      Today
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 font-mono mt-0.2">
                  {dayBlocks.length}
                </p>
              </div>
            );
          })}

          {/* Vertical 24-Hour Time Rail (Left Column - Sticky Left) */}
          <div className="sticky left-0 z-10 bg-[#070e1c]/95 border-r border-white/15">
            {HOURS_24.map((h) => (
              <div
                key={h.hour}
                style={{ height: `${HOUR_HEIGHT}px` }}
                className="relative border-b border-white/8 px-1 text-right flex items-center justify-end"
              >
                <span className="font-mono text-[9px] font-bold text-slate-400 leading-none">
                  {h.label}
                </span>
              </div>
            ))}
          </div>

          {/* Day Columns with Hour Rows and Minute-Accurate Block Overlays */}
          {visibleDays.map((d) => {
            const dayBlocks = blocks.filter((b) => b.day === d.dayIndex);
            const isToday = d.dayIndex === today;

            return (
              <div
                key={d.dayIndex}
                className={`relative border-r border-white/10 ${
                  isToday ? "bg-cyan-500/[0.02]" : "bg-transparent"
                }`}
                style={{ height: `${24 * HOUR_HEIGHT}px` }}
              >
                {/* 24-Hour Background Grid Lines & Click-to-Add Targets */}
                {HOURS_24.map((h) => (
                  <div
                    key={h.hour}
                    onClick={() => handleOpenAdd(d.dayIndex, h.hour)}
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    className="relative border-b border-white/8 hover:bg-cyan-500/[0.06] transition-colors cursor-pointer group"
                    title={`Click to add study session on ${d.full} at ${h.label}`}
                  >
                    {/* Subtle 30-minute dotted midline */}
                    <div className="absolute top-1/2 left-0 right-0 border-t border-white/[0.04] border-dashed pointer-events-none" />

                    {/* Faint hover add cue */}
                    <div className="hidden group-hover:flex items-center gap-1 absolute top-1 left-1 text-[9px] text-cyan-400 font-bold opacity-70 pointer-events-none">
                      <Plus className="w-2.5 h-2.5" />
                    </div>
                  </div>
                ))}

                {/* Live Current Time Line (Red/Cyan Horizontal Rule) */}
                {isToday && (
                  <div
                    style={{
                      top: `${(currentTimeMinutes / 60) * HOUR_HEIGHT}px`,
                    }}
                    className="absolute left-0 right-0 z-10 pointer-events-none flex items-center"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 -ml-0.5 ring-2 ring-rose-500/20" />
                    <div className="h-[1.5px] w-full bg-rose-400/80 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  </div>
                )}

                {/* Clean Study Blocks: ONLY the title given for the task is visible */}
                {dayBlocks.map((b) => {
                  const startM = timeToMinutes(b.startTime);
                  const endM = timeToMinutes(b.endTime);
                  const durationM = Math.max(15, endM - startM);
                  const topPx = (startM / 60) * HOUR_HEIGHT;
                  const heightPx = Math.max(18, (durationM / 60) * HOUR_HEIGHT);

                  return (
                    <div
                      key={b.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(b);
                      }}
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                      }}
                      className={`absolute left-0.5 right-0.5 rounded-md border px-1 py-0.5 overflow-hidden shadow-sm transition-all duration-150 hover:scale-[1.01] hover:z-20 cursor-pointer flex items-center justify-start ${b.color}`}
                      title={`${b.title} (${format12Hour(b.startTime)} – ${format12Hour(b.endTime)})`}
                    >
                      <p className="font-bold text-[10px] sm:text-xs truncate text-white leading-tight w-full pointer-events-none">
                        {b.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. MODAL DRAWER: MINUTE-PRECISE BLOCK SETTING & ADJUSTMENT     */}
      {/* ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-white/20 bg-gradient-to-b from-[#0d182b] to-[#08101e] p-5 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-display text-base sm:text-lg font-bold text-white">
                    {editingBlock ? "Edit Study Session" : "Schedule Study Block"}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Set subject & exact start/finish clock times
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4">
              {/* Title / Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Subject or Session Title
                </label>
                <input
                  type="text"
                  required
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="e.g. Mathematics - Calculus Integration"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/20 bg-slate-950/80 text-white text-xs sm:text-sm focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-medium"
                />
              </div>

              {/* Day of the Week Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Day of the Week
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS.map((d, i) => (
                    <button
                      key={d.short}
                      type="button"
                      onClick={() => setDraftDay(i)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        draftDay === i
                          ? "bg-cyan-400 text-slate-950 border-cyan-400 font-black shadow-md shadow-cyan-400/25"
                          : "bg-slate-950/60 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {d.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute-Accurate Start & End Time Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    Start Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={draftStart}
                    onChange={(e) => setDraftStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/20 bg-slate-950/80 text-white text-sm font-mono focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-cyan-300 font-mono mt-1 block">
                    {format12Hour(draftStart)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    End Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={draftEnd}
                    onChange={(e) => setDraftEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-white/20 bg-slate-950/80 text-white text-sm font-mono focus:border-cyan-400 focus:outline-none"
                  />
                  <span className="text-[10px] text-cyan-300 font-mono mt-1 block">
                    {format12Hour(draftEnd)}
                  </span>
                </div>
              </div>

              {/* Fast Duration Chips (+30m, +45m, +60m, +90m, +120m) */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 mb-1.5">
                  Quick Duration Helpers (From Start Time)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[30, 45, 60, 90, 120].map((mins) => {
                    const currentDur = timeToMinutes(draftEnd) - timeToMinutes(draftStart);
                    const isActive = currentDur === mins;
                    return (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => handleSetDuration(mins)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition-colors ${
                          isActive
                            ? "bg-amber-400 text-slate-950 border-amber-400"
                            : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        +{mins}m
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Color Tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {PALETTES.map((p) => {
                    const isSelected = draftColor === p.classes;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setDraftColor(p.classes)}
                        className={`w-7 h-7 rounded-xl border-2 transition-all flex items-center justify-center ${
                          p.badge
                        } ${isSelected ? "ring-2 ring-white scale-110" : "opacity-75 hover:opacity-100"}`}
                        title={p.name}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-950" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                {editingBlock ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteBlock(editingBlock.id)}
                    className="px-4 py-2 rounded-full text-xs font-semibold border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-white/15 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-200 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    {editingBlock ? "Save" : "Create"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
