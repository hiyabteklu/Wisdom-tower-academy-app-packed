import Link from "next/link";
import CategoryBackButton from "@/components/CategoryBackButton";
import BranchLeaderboard from "@/components/BranchLeaderboard";
import CollapsibleProgress from "@/components/CollapsibleProgress";
import ResourceHubGrid from "@/components/ResourceHubGrid";
import { FileCheck2, ShieldAlert } from "lucide-react";

export default function ExitExamPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-fuchsia-500/25 via-purple-500/10 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-16">
        <CategoryBackButton fallback="/learning" />

        {/* Header: Pathway name + icon only */}
        <div className="mb-6 sm:mb-8 animate-fade-up">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-400 shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Exit Exam
              </h1>
            </div>
          </div>
        </div>

        {/* Leaderboard + Progress Tracker side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-10">
          <div>
            <BranchLeaderboard branchName="Exit Exam" accent="text-fuchsia-400" />
          </div>
          <div>
            <CollapsibleProgress
              scopeId="exit-exam"
              scopeLabel="Exit Exam"
              accent="text-fuchsia-400"
              defaultOpen={true}
            />
          </div>
        </div>

        {/* Courses / Learning Hubs */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-wisdom-muted">
            Learning Hubs
          </p>
          {/* Games commented out until fully functional
          <Link
            href="/academy/exit-exam/tower-defense"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Academic Tower Defense</span>
          </Link>
          */}
        </div>

        <ResourceHubGrid basePath="/academy/exit-exam" />
      </div>
    </div>
  );
}
