/**
 * Route loading skeleton for /settings.
 * Renders an instant dark-navy placeholder matching the settings layout.
 */
export default function SettingsLoading() {
  return (
    <div
      className="min-h-[85vh] w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl mx-auto space-y-6 select-none"
      style={{ backgroundColor: "#060B15" }}
      aria-busy="true"
      aria-label="Loading settings"
    >
      {/* Title skeleton */}
      <div className="space-y-2 pb-4 border-b border-white/[0.06]">
        <div className="h-7 sm:h-8 w-44 rounded-xl bg-white/[0.08] animate-pulse" />
        <div className="h-4 w-72 rounded-md bg-white/[0.04] animate-pulse" />
      </div>

      {/* Settings category sections */}
      {[1, 2, 3].map((section) => (
        <div
          key={section}
          className="rounded-3xl border border-white/[0.06] bg-[#0c1626]/80 p-5 sm:p-6 space-y-4 animate-pulse shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.07]" />
            <div className="space-y-1">
              <div className="h-4 w-36 rounded-md bg-white/[0.08]" />
              <div className="h-3 w-52 rounded-md bg-white/[0.04]" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div className="space-y-1">
                  <div className="h-3.5 w-32 rounded-md bg-white/[0.07]" />
                  <div className="h-2.5 w-48 rounded-md bg-white/[0.04]" />
                </div>
                <div className="h-6 w-11 rounded-full bg-white/[0.08]" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
