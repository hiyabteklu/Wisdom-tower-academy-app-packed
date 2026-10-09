/**
 * Route loading skeleton for /learning.
 * Renders an instant dark-navy placeholder matching the study suite layout.
 */
export default function LearningLoading() {
  return (
    <div
      className="min-h-[80vh] w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-6xl mx-auto space-y-6 select-none"
      style={{ backgroundColor: "#060B15" }}
      aria-busy="true"
      aria-label="Loading learning workspace"
    >
      {/* Top dashboard summary skeleton bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl border border-white/[0.06] bg-[#0c1626]/80 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/[0.08]" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded-lg bg-white/[0.08]" />
            <div className="h-3 w-20 rounded-md bg-white/[0.04]" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-full bg-white/[0.06]" />
          <div className="h-8 w-28 rounded-full bg-white/[0.06]" />
        </div>
      </div>

      {/* Feature deck switcher row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-9 w-24 sm:w-28 rounded-full bg-white/[0.05] border border-white/[0.06] shrink-0 animate-pulse"
          />
        ))}
      </div>

      {/* Grid of study cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/[0.06] bg-[#0c1626]/80 p-5 space-y-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 rounded-md bg-white/[0.06]" />
              <div className="w-8 h-8 rounded-xl bg-white/[0.05]" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-4/5 rounded-lg bg-white/[0.08]" />
              <div className="h-3 w-full rounded-md bg-white/[0.04]" />
            </div>
            <div className="h-9 w-full rounded-xl bg-white/[0.05]" />
          </div>
        ))}
      </div>
    </div>
  );
}
