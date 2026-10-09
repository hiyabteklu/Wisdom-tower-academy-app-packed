"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Globe,
  Building2,
  Thermometer,
  GraduationCap,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Filter,
  Star,
  ArrowRight,
  ArrowLeft,
  Route,
  Mountain,
  Target,
  BookOpen,
  StickyNote,
  Compass,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";
import {
  universities,
  universitiesIntro,
  regions,
  type University,
  type Region,
} from "@/data/universities";
import {
  listFreeResourceItems,
  type FreeResourceItem,
} from "@/lib/free-resources";
import { simpleMarkdownToHtml } from "@/lib/format-content";

function UniversityNbCard() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="mt-6 max-w-2xl rounded-3xl border border-sky-400/25 bg-[#0c1328]/75 backdrop-blur-xl shadow-[0_8px_30px_rgb(0_0_0/0.18)] overflow-hidden"
      data-wta-intro="nb"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 sm:px-6 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40 cursor-pointer hover:bg-white/[0.02] transition-colors"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/15 text-sky-300 text-xs font-black shadow-sm">
            NB
          </span>
          <span className="text-xs sm:text-sm font-semibold text-white/95">
            Read this before you choose
          </span>
        </span>
        <span className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
          <ChevronDown
            className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-6 border-t border-white/[0.06] pt-4 space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed font-reading">
            {universitiesIntro.paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
            <p className="text-white/80 italic border-l-2 border-sky-400/40 pl-3">
              {universitiesIntro.closing}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminNotesBlock({ notes }: { notes: FreeResourceItem[] }) {
  if (!notes.length) return null;
  return (
    <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4 space-y-2.5">
      <p className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
        <StickyNote className="w-3.5 h-3.5" />
        Scholar & Admin Notes
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
 * In-Place Expandable University Card
 * Eliminates full-screen popup window and slide-left drawers for optimal Android WebView experience.
 */
function UniversityCard({
  uni,
  notes,
  isExpanded,
  onToggle,
}: {
  uni: University;
  notes: FreeResourceItem[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={`group relative rounded-3xl border transition-all duration-300 shadow-[0_8px_30px_rgb(0_0_0/0.18)] flex flex-col justify-between ${
        isExpanded
          ? "border-sky-400/40 bg-[#0c1328]/95 ring-1 ring-sky-400/20"
          : "border-white/[0.08] bg-[#0c1328]/75 hover:bg-[#0f1833]/85 hover:border-white/20 hover:scale-[1.005]"
      }`}
    >
      <div className="p-5 sm:p-6">
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-400/30">
              {uni.abbr}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-300 bg-white/[0.04] border border-white/10">
              <MapPin className="w-3 h-3 text-sky-400" />
              {uni.region}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {uni.featured && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-400/30">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </span>
            )}
            {notes.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                <StickyNote className="w-3 h-3" />
                {notes.length}
              </span>
            )}
          </div>
        </div>

        {/* Title & Location */}
        <h3 className="font-display text-lg sm:text-xl font-bold text-white group-hover:text-sky-300 transition-colors leading-snug">
          {uni.name}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400 truncate">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-sky-400" />
          <span>{uni.location}</span>
        </p>

        {/* Quick Stats Pill Strip */}
        <div className="mt-3.5 flex flex-wrap gap-1.5 text-[11px]">
          {uni.distanceFromAddisKm != null && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-slate-300 font-medium">
              <Route className="w-3 h-3 text-amber-400 shrink-0" />
              {uni.distanceFromAddisKm === 0 ? "In Capital" : `~${uni.distanceFromAddisKm} km`}
            </span>
          )}
          {uni.elevationM != null && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-slate-300 font-medium">
              <Mountain className="w-3 h-3 text-sky-400 shrink-0" />
              ~{uni.elevationM}m
            </span>
          )}
          {uni.founded && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-0.5 text-slate-300 font-medium">
              <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
              Est. {uni.founded}
            </span>
          )}
        </div>

        {/* Known For Tags Preview */}
        {!isExpanded && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(uni.knownFor ?? uni.strengths).slice(0, 3).map((k) => (
              <span
                key={k}
                className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-slate-300 font-medium"
              >
                {k}
              </span>
            ))}
          </div>
        )}

        {/* Student fit snippet */}
        {!isExpanded && uni.studentFit && (
          <p className="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed font-reading">
            {uni.studentFit}
          </p>
        )}
      </div>

      {/* ── INLINE EXPANDED DETAILS (Fully Vertical, No Swipe Left, No Horizontal Tabs) ── */}
      {isExpanded && (
        <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-white/[0.08] space-y-4 animate-fade-in text-xs sm:text-sm">
          {/* 1. Overview & Geography */}
          {uni.campuses && (
            <div className="rounded-2xl border border-sky-400/20 bg-sky-500/[0.05] p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-sky-300 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Campus Geography & Setup</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-reading">
                {uni.campuses}
              </p>
            </div>
          )}

          {uni.climate && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.05] p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>Weather & Climate</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-reading">
                {uni.climate}
              </p>
            </div>
          )}

          {uni.distanceNote && (
            <div className="p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-xs text-slate-300 leading-relaxed font-reading">
              <span className="font-bold text-white mr-1.5">Travel Context:</span>
              {uni.distanceNote}
            </div>
          )}

          {/* 2. Academics & Strengths */}
          {uni.knownFor && uni.knownFor.length > 0 && (
            <div className="rounded-2xl border border-violet-400/20 bg-violet-500/[0.05] p-3.5 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                Prominent Disciplines
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {uni.knownFor.map((k) => (
                  <span
                    key={k}
                    className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-200"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}

          {uni.strengths && uni.strengths.length > 0 && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                Academic Strengths
              </h4>
              <ul className="space-y-1.5">
                {uni.strengths.map((s) => (
                  <li key={s} className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed font-reading">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. Student Fit & Campus Reality */}
          {uni.studentFit && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.05] p-3.5 space-y-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Student Fit
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-reading">
                {uni.studentFit}
              </p>
            </div>
          )}

          {uni.whatToExpect && uni.whatToExpect.length > 0 && (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                Campus Life Reality
              </h4>
              <ul className="space-y-1.5">
                {uni.whatToExpect.map((item) => (
                  <li
                    key={item}
                    className="text-xs text-slate-300 leading-relaxed pl-2.5 border-l-2 border-sky-400/30 font-reading"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {uni.tips && uni.tips.length > 0 && (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.05] p-3.5 space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Insider Tips for Students
              </h4>
              <ul className="space-y-1.5">
                {uni.tips.map((tip) => (
                  <li key={tip} className="text-xs text-slate-200 flex items-start gap-2 leading-relaxed font-reading">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. Notes */}
          {notes.length > 0 && (
            <AdminNotesBlock notes={notes} />
          )}
        </div>
      )}

      {/* Action Footer: Fully Vertical In-Place Toggle Control with proper Website Icon */}
      <div className="px-5 sm:px-6 pb-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={onToggle}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm active:scale-[0.98] ${
            isExpanded
              ? "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10"
              : "bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-400/30"
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

        {uni.website && uni.website !== "#" && (
          <a
            href={uni.website}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-sky-400 hover:text-white transition-all shrink-0 active:scale-95 text-xs font-semibold"
            title="Official Website"
            aria-label="Official Website"
          >
            <Globe className="w-4 h-4" />
            <span>Website</span>
          </a>
        )}
      </div>
    </article>
  );
}

function UniversitiesContent() {
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [region, setRegion] = useState<Region | "all">("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showDetailedOnly, setShowDetailedOnly] = useState(false);
  const [allNotes, setAllNotes] = useState<FreeResourceItem[]>([]);
  const [expandedUniId, setExpandedUniId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { items } = await listFreeResourceItems({
        pageSlug: "universities",
        publishedOnly: true,
      });
      if (!cancelled) setAllNotes(items);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync initial ?uni=id param if present
  useEffect(() => {
    const uniParam = searchParams.get("uni");
    if (uniParam) {
      const found = universities.find(
        (u) =>
          u.id.toLowerCase() === uniParam.toLowerCase() ||
          u.abbr.toLowerCase() === uniParam.toLowerCase()
      );
      if (found) setExpandedUniId(found.id);
    }
  }, [searchParams]);

  const notesByUni = useMemo(() => {
    const map: Record<string, FreeResourceItem[]> = {};
    for (const n of allNotes) {
      const id = String(n.meta?.universityId ?? "");
      if (!id) continue;
      if (!map[id]) map[id] = [];
      map[id].push(n);
    }
    return map;
  }, [allNotes]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return universities.filter((u) => {
      if (showFeaturedOnly && !u.featured) return false;
      if (showDetailedOnly && !u.detailed) return false;
      if (region !== "all" && u.region !== region) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.abbr.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.region.toLowerCase().includes(q) ||
        u.strengths.some((s) => s.toLowerCase().includes(q)) ||
        (u.knownFor?.some((s) => s.toLowerCase().includes(q)) ?? false)
      );
    });
  }, [query, region, showFeaturedOnly, showDetailedOnly]);

  const detailedCount = universities.filter((u) => u.detailed).length;

  return (
    <div className="relative min-h-screen" data-scroll-zoom-skip>
      {/* Soft Ambient Blurred Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-violet-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-amber-500/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-8 md:mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/[0.05] border border-white/10 text-sky-300 mb-3">
            Other resources
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight mb-3">
            <span className="text-white">Ethiopian </span>
            <span className="text-sky-400">Universities Directory</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed font-reading">
            {universitiesIntro.subtitle}. Authentic guides, student fit, climate, and campus realities before you pick.
          </p>
          <UniversityNbCard />

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1328]/70 border border-white/10 backdrop-blur-md text-slate-300 font-semibold shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              {universities.length} Institutions
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1328]/70 border border-white/10 backdrop-blur-md text-slate-300 font-semibold shadow-sm">
              <BookOpen className="w-3.5 h-3.5 text-violet-300" />
              {detailedCount} In-Depth Guides
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0c1328]/70 border border-white/10 backdrop-blur-md text-slate-300 font-semibold shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              All Ethiopian Regions
            </span>
          </div>
        </header>

        {/* Filter and Search Bar: Control Center Style */}
        <div className="mb-8 space-y-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region | "all")}
              className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold border border-white/10 bg-[#0c1328]/85 text-white backdrop-blur-xl focus:outline-none focus:border-sky-400 flex-1 sm:flex-none cursor-pointer transition-all shadow-sm"
            >
              <option value="all">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowFeaturedOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold border transition-all cursor-pointer active:scale-95 shadow-sm ${
                showFeaturedOnly
                  ? "bg-amber-500/20 border-amber-400/40 text-amber-300 shadow-sm"
                  : "bg-[#0c1328]/70 backdrop-blur-md border-white/10 text-slate-300 hover:border-white/20"
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              Featured
            </button>

            <button
              type="button"
              onClick={() => setShowDetailedOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold border transition-all cursor-pointer active:scale-95 shadow-sm ${
                showDetailedOnly
                  ? "bg-violet-500/20 border-violet-400/40 text-violet-300 shadow-sm"
                  : "bg-[#0c1328]/70 backdrop-blur-md border-white/10 text-slate-300 hover:border-white/20"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Detailed Guides
            </button>

            <button
              type="button"
              onClick={() => setSearchOpen((o) => !o)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all cursor-pointer active:scale-95 shadow-sm ${
                searchOpen || query
                  ? "border-sky-400/40 bg-sky-500/20 text-sky-300 shadow-sm"
                  : "border-white/10 bg-[#0c1328]/70 backdrop-blur-md text-slate-300 hover:border-white/20"
              }`}
              aria-label="Toggle Search"
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
                placeholder="Search by university name, abbr (AAU, ASTU...), or city..."
                autoFocus
                className="w-full rounded-full border border-white/15 bg-[#0c1328]/90 backdrop-blur-xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 shadow-inner transition-colors"
              />
            </div>
          )}
        </div>

        {/* Grid of Universities (In-Place Expandable, Zero Popup Overlays) */}
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#0c1328]/70 px-6 py-12 text-center">
            <p className="text-white font-bold mb-1 text-sm">No universities found</p>
            <p className="text-xs text-slate-400">Try adjusting your search terms or clearing the region filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filtered.map((uni) => (
              <UniversityCard
                key={uni.id}
                uni={uni}
                notes={notesByUni[uni.id] || []}
                isExpanded={expandedUniId === uni.id}
                onToggle={() =>
                  setExpandedUniId((prev) => (prev === uni.id ? null : uni.id))
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

export default function UniversitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
          Loading Universities Directory...
        </div>
      }
    >
      <UniversitiesContent />
    </Suspense>
  );
}
