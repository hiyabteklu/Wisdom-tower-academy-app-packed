"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Briefcase,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Globe,
  GraduationCap,
  Scale,
  Search,
  ThumbsDown,
  ThumbsUp,
  Layers,
  StickyNote,
  ArrowRight,
  ArrowLeft,
  Clock,
  CheckCircle2,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import {
  departmentCategories,
  departments,
  type Department,
  type DepartmentCategory,
  type DepartmentCategoryId,
} from "@/data/departments";
import {
  listFreeResourceItems,
  type FreeResourceItem,
} from "@/lib/free-resources";
import { simpleMarkdownToHtml } from "@/lib/format-content";

function categoryMeta(id: DepartmentCategoryId): DepartmentCategory {
  return (
    departmentCategories.find((c) => c.id === id) || {
      id,
      label: "Academic Field",
      blurb: "Undergraduate curriculum and career guidance.",
      accent: "text-sky-300",
      border: "hover:border-sky-400/40",
      badge: "border-sky-400/30 bg-sky-500/15 text-sky-200",
      glow: "from-sky-500/20",
    }
  );
}

function AdminNotesBlock({ notes }: { notes: FreeResourceItem[] }) {
  if (!notes.length) return null;
  return (
    <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 space-y-2.5">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
        <StickyNote className="w-3.5 h-3.5" />
        Faculty & Scholar Notes
      </p>
      {notes.map((n) => (
        <div key={n.id} className="space-y-1 pt-1">
          {n.title && <p className="text-xs sm:text-sm font-bold text-white">{n.title}</p>}
          {n.bodyMd && (
            <div
              className="formatted-body text-xs sm:text-sm text-slate-200 leading-relaxed font-reading"
              dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(n.bodyMd) }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * In-Place Expandable Department Card
 * Eliminates full-screen popup window and slide-left drawers for optimal Android WebView experience.
 */
function DepartmentCard({
  dept,
  notes,
  isExpanded,
  onToggle,
}: {
  dept: Department;
  notes: FreeResourceItem[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const cat = categoryMeta(dept.category);

  return (
    <article
      className={`group relative rounded-3xl border transition-all duration-300 shadow-[0_8px_30px_rgb(0_0_0/0.18)] flex flex-col justify-between ${
        isExpanded
          ? "border-cyan-400/40 bg-[#0c1328]/95 ring-1 ring-cyan-400/20"
          : "border-white/[0.08] bg-[#0c1328]/75 hover:bg-[#0f1833]/85 hover:border-white/20 hover:scale-[1.005]"
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${cat.badge}`}
          >
            {cat.label}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
              <Clock className="w-3 h-3 text-cyan-400" />
              {dept.durationYears}
            </span>
            {notes.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                <StickyNote className="w-3 h-3" />
                {notes.length}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
          {dept.name}
        </h3>

        {/* About Snippet */}
        <p className="mt-2 text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-reading">
          {dept.about}
        </p>

        {/* Careers Preview Tags */}
        {!isExpanded && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {dept.careers.slice(0, 3).map((job) => (
              <span
                key={job}
                className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-slate-300 font-medium truncate max-w-[200px]"
              >
                {job}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── INLINE EXPANDED DETAILS (Fully Vertical, No Swipe Left, No Horizontal Tabs) ── */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-white/[0.08] space-y-4 animate-fade-in text-xs sm:text-sm">
          {/* 1. Demands & Modules */}
          <div className="rounded-2xl border border-sky-400/20 bg-sky-500/[0.05] p-3.5 space-y-1">
            <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-300">
              <BookOpen className="w-3.5 h-3.5 text-sky-400" />
              What This Field Demands
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-reading">
              {dept.about}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-2">
            <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-300">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Core Coursework & Modules
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {dept.courses.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-slate-200"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* 2. Career Paths & Roles */}
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.05] p-3.5 space-y-2">
            <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
              Career Paths & Roles
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {dept.careers.map((job) => (
                <div
                  key={job}
                  className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-slate-100 font-medium"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{job}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Market Reality */}
          <div className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.05] p-3.5 space-y-1">
            <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-violet-300">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              Ethiopian Market Reality & Outlook
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-reading">
              {dept.market}
            </p>
          </div>

          {/* 4. Fit & Trade-offs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/[0.05] p-3.5 space-y-2">
              <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                Key Upsides
              </h4>
              <ul className="space-y-1.5">
                {dept.pros.map((p) => (
                  <li key={p} className="text-xs text-slate-200 leading-relaxed flex items-start gap-1.5 font-reading">
                    <span className="text-emerald-400 font-bold shrink-0">+</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-400/25 bg-rose-500/[0.05] p-3.5 space-y-2">
              <h4 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-300">
                <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                Trade-offs
              </h4>
              <ul className="space-y-1.5">
                {dept.cons.map((c) => (
                  <li key={c} className="text-xs text-slate-200 leading-relaxed flex items-start gap-1.5 font-reading">
                    <span className="text-rose-400 font-bold shrink-0">−</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 5. Notes */}
          {notes.length > 0 && (
            <AdminNotesBlock notes={notes} />
          )}
        </div>
      )}

      {/* Action Footer: In-Place Toggle Control with More/Less */}
      <div className="px-5 sm:px-6 pb-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
        <button
          type="button"
          onClick={onToggle}
          className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm active:scale-[0.98] ${
            isExpanded
              ? "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10"
              : "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/30"
          }`}
        >
          {isExpanded ? (
            <>
              <span>Less</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>More</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </article>
  );
}

function DepartmentsContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<DepartmentCategoryId | "all">("all");
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(null);
  const [allNotes, setAllNotes] = useState<FreeResourceItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { items } = await listFreeResourceItems({
        pageSlug: "departments",
        publishedOnly: true,
      });
      if (!cancelled) setAllNotes(items);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync initial ?dept=id param if present
  useEffect(() => {
    const deptParam = searchParams.get("dept");
    if (deptParam) {
      const found = departments.find(
        (d) =>
          d.id.toLowerCase() === deptParam.toLowerCase() ||
          d.shortName?.toLowerCase() === deptParam.toLowerCase()
      );
      if (found) setExpandedDeptId(found.id);
    }
  }, [searchParams]);

  const notesByDept = useMemo(() => {
    const map: Record<string, FreeResourceItem[]> = {};
    for (const n of allNotes) {
      const id = String(n.meta?.departmentId ?? "");
      if (!id) {
        if (!map["_page"]) map["_page"] = [];
        map["_page"].push(n);
        continue;
      }
      if (!map[id]) map[id] = [];
      map[id].push(n);
    }
    return map;
  }, [allNotes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return departments.filter((d) => {
      if (activeCat !== "all" && d.category !== activeCat) return false;
      if (!q) return true;
      const hay = `${d.name} ${d.shortName} ${d.about} ${d.careers.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, activeCat]);

  return (
    <div className="relative min-h-[80vh]">
      {/* Soft Ambient Blurred Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-sky-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-violet-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-8 md:mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/[0.05] border border-white/10 text-cyan-300 mb-3">
            Other resources
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight mb-3">
            <span className="text-white">Department </span>
            <span className="text-cyan-400">Field Guides</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            What competitive undergraduate fields actually demand: real coursework, career roles,
            market demand in Ethiopia, and the trade-offs nobody puts on the official brochure.
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1328]/70 border border-white/10 backdrop-blur-md text-cyan-300 font-semibold shadow-sm text-xs">
              <Scale className="w-3.5 h-3.5 text-cyan-400" />
              {departments.length} Academic Fields & Engineering Streams
            </span>
          </div>
        </header>

        {/* Filter & Search Bar: Control Center Pill Layout */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex flex-1 gap-2 overflow-x-auto pb-1 scrollbar-thin min-w-0">
              <button
                type="button"
                onClick={() => setActiveCat("all")}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 shadow-sm ${
                  activeCat === "all"
                    ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-200 shadow-sm"
                    : "border-white/10 bg-[#0c1328]/70 backdrop-blur-md text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                All Fields
              </button>
              {departmentCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCat(c.id)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 shadow-sm ${
                    activeCat === c.id
                      ? `${c.badge} shadow-sm`
                      : "border-white/10 bg-[#0c1328]/70 backdrop-blur-md text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setSearchOpen((o) => !o)}
              className={`shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all cursor-pointer active:scale-95 shadow-sm ${
                searchOpen || query
                  ? "border-cyan-400/40 bg-cyan-500/20 text-cyan-300 shadow-sm"
                  : "border-white/10 bg-[#0c1328]/70 backdrop-blur-md text-slate-400 hover:border-white/20 hover:text-white"
              }`}
              aria-label="Toggle Search"
              aria-expanded={searchOpen}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {searchOpen && (
            <div className="relative animate-fade-in pt-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search departments, careers, skills..."
                autoFocus
                className="w-full rounded-full border border-white/15 bg-[#0c1328]/90 backdrop-blur-xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 shadow-inner transition-colors"
              />
            </div>
          )}
        </div>

        {/* Grid of Department Cards (In-Place Expandable, Zero Popup Overlays) */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#0c1328]/70 px-6 py-12 text-center">
            <p className="text-white font-bold mb-1 text-sm">No fields match your search</p>
            <p className="text-xs text-slate-400">Try another keyword or select All categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((dept) => (
              <DepartmentCard
                key={dept.id}
                dept={dept}
                notes={[...(notesByDept[dept.id] || []), ...(notesByDept["_page"] || [])]}
                isExpanded={expandedDeptId === dept.id}
                onToggle={() =>
                  setExpandedDeptId((prev) => (prev === dept.id ? null : dept.id))
                }
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs sm:text-sm font-bold text-white transition-all active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-300" />
            <span>Academy Pathways</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
          Loading Department Field Guides...
        </div>
      }
    >
      <DepartmentsContent />
    </Suspense>
  );
}
