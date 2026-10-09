"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getFreeResourcePage,
  listFreeResourceItems,
  freeResourcePublicUrl,
  type FreeResourceItem,
  type FreeResourcePage,
} from "@/lib/free-resources";
import FormattedBody from "@/components/FormattedBody";
import CategoryBackButton from "@/components/CategoryBackButton";
import BrandLoader from "@/components/BrandLoader";
import {
  GraduationCap,
  Calendar,
  Loader2,
  ChevronDown,
  Info,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";

function formatDeadline(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("en-ET", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isDeadlineSoon(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  return diff > 0 && diff < 1000 * 60 * 60 * 24 * 45;
}

function IntroTipsCard({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="mt-6 max-w-2xl rounded-2xl border border-rose-400/25 bg-wisdom-card/90 shadow-card-3d overflow-hidden"
      data-wta-intro="tips"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-400/30 bg-rose-500/15 text-rose-300 text-xs font-extrabold tracking-wide">
            Tips
          </span>
          <span className="text-sm font-semibold text-white/90">
            How to use this page & apply well
          </span>
        </span>
        <ChevronDown
          className={`w-5 h-5 text-rose-300/90 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 border-t border-white/8 pt-4">
            <FormattedBody text={text} className="text-white/90" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScholarshipCard({
  item,
  index,
}: {
  item: FreeResourceItem;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  const provider = String(item.meta?.provider || item.meta?.organization || "");
  const amount = String(item.meta?.amount || item.meta?.award || "");
  const eligibility = String(item.meta?.eligibility || "");
  const level = String(item.meta?.level || item.meta?.degree || "");
  const country = String(item.meta?.country || item.meta?.location || "");
  const body = (item.bodyMd || "").trim();
  const img = item.imagePath ? freeResourcePublicUrl(item.imagePath) : null;
  const deadlineLabel = formatDeadline(item.deadline);
  const soon = isDeadlineSoon(item.deadline);
  const longBody = body.length > 240;

  return (
    <article
      className={`card-modern group flex flex-col transition-all duration-300
        ${
          open
            ? "border-rose-400/40 shadow-xl shadow-rose-950/20"
            : "hover:border-rose-400/30"
        }`}
      style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
    >
      {/* Clean 16:9 or 2.2:1 image container without overlapping text */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[2.4/1] bg-wisdom-navy overflow-hidden">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-500/15 via-wisdom-card to-wisdom-navy">
            <GraduationCap className="w-14 h-14 text-rose-400/30" />
          </div>
        )}
      </div>

      <div className="p-5 sm:p-7 space-y-4 flex-1 flex flex-col">
        {/* Meta badges row */}
        <div className="flex flex-wrap gap-2 items-center">
          {deadlineLabel && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold
                ${
                  soon
                    ? "border-rose-400/40 bg-rose-500/15 text-rose-200"
                    : "border-white/12 bg-white/[0.04] text-wisdom-muted"
                }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Deadline: {deadlineLabel}
            </span>
          )}
          {level && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300">
              {level}
            </span>
          )}
          {country && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-slate-300">
              {country}
            </span>
          )}
        </div>

        {/* Clean headline and provider */}
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-rose-200 transition-colors">
            {item.title}
          </h3>
          {(provider || amount) && (
            <p className="mt-1.5 text-sm sm:text-base text-rose-300/90 font-medium">
              {[provider, amount].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {item.subtitle && (
          <p className="text-sm text-wisdom-muted leading-relaxed">{item.subtitle}</p>
        )}

        {eligibility && (
          <div className="rounded-xl border border-white/8 bg-white/[0.02] px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300/80 mb-1">
              Eligibility
            </p>
            <p className="text-xs sm:text-sm text-wisdom-muted leading-relaxed">{eligibility}</p>
          </div>
        )}

        {body && (
          <div className="border-t border-white/8 pt-4">
            <FormattedBody text={body} clamped={!open && longBody} />
            {longBody && (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-rose-300 hover:text-rose-200 transition-colors"
              >
                {open ? "Show less" : "Read full details"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </div>
        )}

        {item.externalUrl && (
          <div className="pt-2 mt-auto">
            <a
              href={item.externalUrl}
              rel="noopener noreferrer"
              className="btn-primary w-full sm:w-auto text-xs sm:text-sm px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full active:scale-95"
            >
              Apply / Official Page
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

const DEFAULT_INTRO = `Scholarships can change what is possible for secondary and university learners: lower fees, cover materials, or open doors to programs abroad.\n\nThis page collects opportunities relevant for Ethiopian students and the wider region: local awards, national schemes, and international programs that accept applicants from Africa. Each card is practical: who it is for, what it covers, deadlines when we have them, and a direct link to apply or learn more.\n\nHow to use this page\n• Read eligibility notes carefully: many awards are limited by grade, field, gender, or need.\n• Start early. Strong applications need transcripts, recommendations, and a clear personal statement.\n• Keep a simple tracker of deadlines, required documents, and status.\n• Prefer official sites and verified partners.\n\nWe add and update listings over time. If you know of a solid scholarship that is missing, use Contact us and send the official link.`;

export default function ScholarshipsPage() {
  const [page, setPage] = useState<FreeResourcePage | null>(null);
  const [items, setItems] = useState<FreeResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [pageRes, itemsRes] = await Promise.all([
      getFreeResourcePage("scholarships", { publishedOnly: false }),
      listFreeResourceItems({
        pageSlug: "scholarships",
        publishedOnly: true,
        kind: "scholarship",
      }),
    ]);
    if (itemsRes.error) setError(itemsRes.error);
    setPage(pageRes.item ?? null);
    setItems(itemsRes.items);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const title = page?.title?.trim() || "Scholarship Info";
  const subtitle =
    page?.subtitle?.trim() ||
    "Funding options and how to prepare strong applications.";
  const intro = ((page?.bodyMd || "").trim() || DEFAULT_INTRO);

  return (
    <div className="relative min-h-screen" data-scroll-zoom-skip>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[28rem] h-[28rem] bg-rose-500/12 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-96 h-96 bg-fuchsia-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-0 w-72 h-72 bg-pink-600/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <header className="mb-10 md:mb-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-300">
              <GraduationCap className="w-4.5 h-4.5" />
            </span>
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-rose-400/90">
              Free resource
            </p>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3">
            {title.includes(" ") ? (
              <>
                <span className="text-white">
                  {title.split(" ").slice(0, -1).join(" ")}{" "}
                </span>
                <span className="text-rose-400">{title.split(" ").slice(-1)[0]}</span>
              </>
            ) : (
              <span className="text-rose-400">{title}</span>
            )}
          </h1>
          {subtitle && (
            <p className="text-wisdom-muted text-lg max-w-2xl leading-relaxed">{subtitle}</p>
          )}
          {intro && <IntroTipsCard text={intro} />}
          {!loading && items.length > 0 && (
            <p className="mt-5 text-xs font-medium text-wisdom-muted/80">
              {items.length} {items.length === 1 ? "opportunity" : "opportunities"}
            </p>
          )}
        </header>

        {loading && (
          <div className="flex items-center justify-center py-24" data-wta-spinner="true">
            <BrandLoader size="sm" label="Loading scholarships…" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>
              {error.includes("key") || error.includes("crypto") || error.includes("token")
                ? "Unable to load scholarship opportunities right now."
                : `Could not load scholarships: ${error}`}
            </span>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-xs font-semibold text-rose-100 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-3xl border border-white/12 bg-wisdom-card/90 p-8 sm:p-10 text-center">
            <p className="text-sm text-wisdom-muted leading-relaxed max-w-md mx-auto mb-5">
              Individual scholarship cards will appear here as we publish them. Use the guide above
              while preparing applications.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-wisdom-dark hover:bg-amber-400 transition-colors"
            >
              Suggest a scholarship
            </Link>
          </div>
        )}

        {!loading && items.length > 0 && (
          <ul className="space-y-7 md:space-y-8">
            {items.map((item, i) => (
              <li key={item.id}>
                <ScholarshipCard item={item} index={i} />
              </li>
            ))}
          </ul>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-14 card-modern p-6 text-center border-white/10">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-500/10 text-rose-300">
              <Info className="w-5 h-5" />
            </div>
            <p className="text-sm text-wisdom-muted leading-relaxed max-w-md mx-auto">
              Always verify deadlines and requirements on the official page. Requirements change.
              Treat this as a curated guide.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
