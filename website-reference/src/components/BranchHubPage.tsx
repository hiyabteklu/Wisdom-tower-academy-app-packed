import Link from "next/link";
import CategoryBackButton from "@/components/CategoryBackButton";
import BranchLeaderboard from "@/components/BranchLeaderboard";
import AcademicResultSaver from "@/components/AcademicResultSaver";
import PackageOfferBanner from "@/components/PackageOfferBanner";
import { Construction, MessageCircle } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  accentClass: string;
  gradientClass: string;
  scopeId: string;
  /** Sellable package id e.g. uat, gat, coc, exit-exam */
  packageId?: string;
};

export default function BranchHubPage({
  title,
  subtitle,
  accentClass,
  gradientClass,
  scopeId,
  packageId,
}: Props) {
  return (
    <div className="relative min-h-[75vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br ${gradientClass}`}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-8 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-2">
            Academic branch
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            <span className={accentClass}>{title}</span>
          </h1>
          <p className="text-wisdom-muted">{subtitle}</p>
        </div>

        {packageId && (
          <div className="mb-8">
            <PackageOfferBanner packageId={packageId} />
          </div>
        )}

        <BranchLeaderboard branchName={title} accent={accentClass} />

        <div className="mb-10">
          <AcademicResultSaver scopeId={scopeId} scopeLabel={title} accent={accentClass} />
        </div>

        <div className="rounded-3xl border border-white/15 bg-wisdom-card shadow-card-3d overflow-hidden">
          <div
            className={`px-6 sm:px-8 pt-8 pb-6 border-b border-white/10 bg-gradient-to-br ${gradientClass}`}
          >
            <h2 className="font-display text-xl font-bold">Learning materials</h2>
            <p className="text-sm text-wisdom-muted mt-1">Practice sets and guides for {title}</p>
          </div>
          <div className="px-6 sm:px-8 py-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-wisdom-dark/60 text-wisdom-muted">
              <Construction className="w-7 h-7" />
            </div>
            <p className="text-wisdom-muted text-sm max-w-md mx-auto leading-relaxed mb-6">
              Full {title} content is coming soon. Use Result Saver above to track every practice
              attempt.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-wisdom-dark text-sm font-semibold hover:bg-amber-400 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
