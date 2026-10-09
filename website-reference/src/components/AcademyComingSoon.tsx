import Link from "next/link";
import CategoryBackButton from "@/components/CategoryBackButton";
import { Construction, MessageCircle } from "lucide-react";

type Props = {
  title: string;
  subtitle: string;
  accentClass: string;
  gradientClass: string;
};

export default function AcademyComingSoon({
  title,
  subtitle,
  accentClass,
  gradientClass,
}: Props) {
  return (
    <div className="relative min-h-[75vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-1/4 w-80 h-80 rounded-full blur-3xl opacity-25 bg-gradient-to-br ${gradientClass}`}
        />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <CategoryBackButton fallback="/academy" />

        <div className="rounded-3xl border border-white/15 bg-wisdom-card shadow-card-3d overflow-hidden animate-fade-up">
          <div className={`px-6 sm:px-8 pt-8 pb-6 border-b border-white/10 bg-gradient-to-br ${gradientClass}`}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wisdom-muted mb-2">
              Academy program
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              <span className={accentClass}>{title}</span>
            </h1>
            <p className="text-wisdom-muted">{subtitle}</p>
          </div>

          <div className="px-6 sm:px-8 py-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-wisdom-dark/60 text-wisdom-muted">
              <Construction className="w-8 h-8" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Coming soon</h2>
            <p className="text-wisdom-muted text-sm max-w-md mx-auto leading-relaxed mb-8">
              We&apos;re building the full {title} experience. Materials and enrollment options will
              appear here shortly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/academy"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-sm font-medium hover:border-white/30 transition-colors"
              >
                Back to Academy
              </Link>
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
    </div>
  );
}
