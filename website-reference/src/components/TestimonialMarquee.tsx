const quotes = [
  {
    name: "Lidya A.",
    text: "UAT stopped feeling impossible: the mocks and weekly plan actually stuck.",
  },
  {
    name: "Bereket N.",
    text: "Grade 11 physics finally made sense. I went from guessing to explaining topics to friends.",
  },
  {
    name: "Selam T.",
    text: "The freshman chemistry notes saved my first semester. Clear, short, and exam-focused.",
  },
  {
    name: "Abel M.",
    text: "COC practice felt real. I walked into the assessment calm instead of panicked.",
  },
];

export default function TestimonialMarquee() {
  const loop = [...quotes, ...quotes];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-wisdom-dark/40 py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-gradient-to-r from-wisdom-dark to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-gradient-to-l from-wisdom-dark to-transparent" />

      <div className="testimonial-marquee flex w-max gap-6">
        {loop.map((q, i) => (
          <blockquote
            key={`${q.name}-${i}`}
            className="shrink-0 max-w-[min(320px,70vw)] rounded-2xl border border-white/10 bg-wisdom-card/90 px-5 py-4 shadow-lg"
          >
            <p className="text-sm text-white/90 leading-relaxed">&ldquo;{q.text}&rdquo;</p>
            <footer className="mt-3 text-xs font-semibold text-amber-400/90">- {q.name}</footer>
          </blockquote>
        ))}
      </div>
    </div>
  );
}
