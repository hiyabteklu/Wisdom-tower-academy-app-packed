/**
 * Root route loading skeleton for Wisdom Tower Academy.
 * Renders an instant dark-navy placeholder to guarantee zero white flash during route transitions.
 */
export default function Loading() {
  return (
    <div
      className="min-h-[75vh] w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-6xl mx-auto space-y-8 select-none"
      style={{ backgroundColor: "#060B15" }}
      aria-busy="true"
      aria-label="Loading content"
    >
      {/* Top headline placeholder */}
      <div className="space-y-3 max-w-xl">
        <div className="h-4 w-28 rounded-full bg-white/[0.06] animate-pulse" />
        <div className="h-8 sm:h-10 w-3/4 rounded-2xl bg-white/[0.08] animate-pulse" />
        <div className="h-4 w-full rounded-xl bg-white/[0.04] animate-pulse" />
      </div>

      {/* Grid skeleton cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/[0.06] bg-[#0c1626]/80 p-4 space-y-3 animate-pulse"
          >
            <div className="aspect-video w-full rounded-xl bg-white/[0.05]" />
            <div className="h-4 w-2/3 rounded-lg bg-white/[0.08]" />
            <div className="h-3 w-1/2 rounded-md bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}
