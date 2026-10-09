import CategoryBackButton from "@/components/CategoryBackButton";
import BranchLeaderboard from "@/components/BranchLeaderboard";
import CollapsibleProgress from "@/components/CollapsibleProgress";
import ResourceHubGrid from "@/components/ResourceHubGrid";
import { Award } from "lucide-react";

export default function UatPage() {
  return (
    <div className="relative min-h-[80vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30 bg-gradient-to-br from-emerald-500/25 via-teal-500/10 to-transparent" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-16">
        <CategoryBackButton fallback="/learning" />

        {/* Header: Pathway name + icon only */}
        <div className="mb-6 sm:mb-8 animate-fade-up">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-500/10 text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                UAT
              </h1>
            </div>
          </div>
        </div>

        {/* Leaderboard + Progress Tracker side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-10">
          <div>
            <BranchLeaderboard branchName="UAT" accent="text-emerald-400" />
          </div>
          <div>
            <CollapsibleProgress
              scopeId="uat"
              scopeLabel="UAT"
              accent="text-emerald-400"
              defaultOpen={true}
            />
          </div>
        </div>

        {/* Learning Hubs */}
        <div className="mb-4">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase text-wisdom-muted">
            Learning Hubs
          </p>
        </div>

        <ResourceHubGrid basePath="/academy/uat" />
      </div>
    </div>
  );
}
