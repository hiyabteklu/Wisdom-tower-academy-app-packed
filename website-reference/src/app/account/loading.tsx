/**
 * Route loading skeleton for /account.
 * Renders an instant dark-navy placeholder matching the Student ID & Account layout.
 */
export default function AccountLoading() {
  return (
    <div
      className="min-h-[85vh] w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl mx-auto space-y-8 select-none"
      style={{ backgroundColor: "#060B15" }}
      aria-busy="true"
      aria-label="Loading account and student card"
    >
      {/* Student ID Card Skeleton */}
      <div className="max-w-md mx-auto aspect-[1.58/1] rounded-3xl border border-white/[0.08] bg-[#0c1626]/80 p-6 shadow-2xl flex flex-col justify-between animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/[0.08]" />
            <div className="h-4 w-24 rounded-md bg-white/[0.06]" />
          </div>
          <div className="h-5 w-16 rounded-full bg-white/[0.06]" />
        </div>

        <div className="flex items-center gap-4 my-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/[0.08] shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-3/4 rounded-lg bg-white/[0.09]" />
            <div className="h-3.5 w-1/2 rounded-md bg-white/[0.05]" />
            <div className="h-3 w-2/3 rounded-md bg-white/[0.04]" />
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
          <div className="h-3 w-24 rounded-md bg-white/[0.05]" />
          <div className="h-3.5 w-28 rounded-md bg-white/[0.07]" />
        </div>
      </div>

      {/* Floating pill toolbar skeleton */}
      <div className="max-w-xl mx-auto h-12 rounded-full border border-white/[0.06] bg-[#0c1626]/80 p-2 flex items-center justify-between animate-pulse">
        <div className="h-8 w-28 rounded-full bg-white/[0.06]" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 rounded-full bg-white/[0.06]" />
          <div className="h-8 w-24 rounded-full bg-white/[0.06]" />
        </div>
      </div>

      {/* Content panel placeholder */}
      <div className="rounded-3xl border border-white/[0.06] bg-[#0c1626]/80 p-6 space-y-4 animate-pulse">
        <div className="h-5 w-40 rounded-lg bg-white/[0.08]" />
        <div className="h-3.5 w-3/4 rounded-md bg-white/[0.04]" />
        <div className="h-24 w-full rounded-2xl bg-white/[0.03]" />
      </div>
    </div>
  );
}
