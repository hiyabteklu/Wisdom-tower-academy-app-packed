/**
 * Route loading skeleton for /packages.
 * Renders an instant dark-navy placeholder matching the packages catalog layout.
 */
export default function PackagesLoading() {
  return (
    <div
      className="min-h-[80vh] w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 max-w-6xl mx-auto space-y-8 select-none"
      style={{ backgroundColor: "#060B15" }}
      aria-busy="true"
      aria-label="Loading packages"
    >
      {/* Title skeleton */}
      <div className="text-center space-y-3 max-w-md mx-auto">
        <div className="h-8 sm:h-10 w-64 mx-auto rounded-2xl bg-white/[0.08] animate-pulse" />
        <div className="h-4 w-48 mx-auto rounded-xl bg-white/[0.04] animate-pulse" />
      </div>

      {/* Packages catalog grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/[0.06] bg-[#0c1626]/80 overflow-hidden shadow-xl animate-pulse flex flex-col justify-between"
          >
            <div className="aspect-video w-full bg-white/[0.05]" />
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-5 w-3/4 rounded-lg bg-white/[0.08]" />
                <div className="h-3.5 w-full rounded-md bg-white/[0.04]" />
              </div>
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="h-5 w-20 rounded-md bg-white/[0.07]" />
                <div className="h-9 w-24 rounded-xl bg-white/[0.08]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
