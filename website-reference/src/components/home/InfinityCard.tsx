"use client";

const GLYPHS = [
  { s: "π", x: 12, y: 18, d: 0, size: "1.1rem" },
  { s: "∑", x: 78, y: 22, d: 1.2, size: "1rem" },
  { s: "∫", x: 22, y: 72, d: 2.1, size: "1.15rem" },
  { s: "√", x: 85, y: 68, d: 0.6, size: "1rem" },
  { s: "Δ", x: 8, y: 48, d: 3.4, size: "0.95rem" },
  { s: "φ", x: 90, y: 42, d: 1.8, size: "1.05rem" },
  { s: "∇", x: 48, y: 12, d: 2.8, size: "0.9rem" },
  { s: "∂", x: 55, y: 82, d: 0.9, size: "1rem" },
  { s: "∞", x: 35, y: 28, d: 4.2, size: "0.85rem" },
  { s: "≈", x: 68, y: 55, d: 3.1, size: "0.9rem" },
  { s: "≠", x: 18, y: 38, d: 5.0, size: "0.85rem" },
  { s: "λ", x: 72, y: 15, d: 2.4, size: "0.95rem" },
  { s: "θ", x: 42, y: 65, d: 1.5, size: "0.9rem" },
  { s: "ℏ", x: 88, y: 30, d: 4.6, size: "0.85rem" },
  { s: "Ω", x: 28, y: 85, d: 3.7, size: "0.95rem" },
];

export default function InfinityCard({ visible, delay }: { visible: boolean; delay: number }) {
  return (
    <div
      className={`stat-card infinity-card group relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-wisdom-card p-6 md:p-8 text-center reveal-item w-full h-full min-h-[12.5rem] md:min-h-[14rem] flex flex-col hide-on-app ${visible ? "is-visible" : ""}`}
      style={{ transitionDelay: visible ? `${delay}ms` : undefined }}
    >
      <div className="infinity-field" aria-hidden />
      <div className="infinity-aurora" aria-hidden />

      <div className="infinity-glyphs" aria-hidden>
        {GLYPHS.map((g) => (
          <span
            key={`${g.s}-${g.x}-${g.y}`}
            className="infinity-glyph"
            style={{
              left: `${g.x}%`,
              top: `${g.y}%`,
              fontSize: g.size,
              animationDelay: `${g.d}s`,
            }}
          >
            {g.s}
          </span>
        ))}
      </div>

      <div className="infinity-orbit infinity-orbit-a" aria-hidden />
      <div className="infinity-orbit infinity-orbit-b" aria-hidden />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 py-4">
        <div className="infinity-stage">
          <div className="infinity-spin">
            <span className="infinity-symbol" aria-hidden>
              ∞
            </span>
            <span className="infinity-symbol infinity-symbol-ghost" aria-hidden>
              ∞
            </span>
          </div>
        </div>
        <div
          className="mt-2 text-xs sm:text-sm text-wisdom-cyan font-semibold uppercase tracking-[0.2em]"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.35)",
          }}
        >
          Possibilities
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-cyan-400/20" />
    </div>
  );
}
