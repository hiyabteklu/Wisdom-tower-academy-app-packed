import Link from "next/link";
import { Clock, GraduationCap, Lock } from "lucide-react";
import CategoryBackButton from "@/components/CategoryBackButton";

/** Full-page lock state while Freshman is closed (preview opens tomorrow). */
export default function FreshmanLockedPanel({
  showBack = true,
}: {
  showBack?: boolean;
}) {
  return (
    <div className="relative min-h-[70vh]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute top-0 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25 bg-gradient-to-br from-purple-500/25 via-pink-500/10 to-transparent" />
      </div>

      <div className="relative max-w-lg mx-auto px-4 sm:px-6 py-12 md:py-20">
        {showBack && <CategoryBackButton fallback="/academy" />}

        <div className="rounded-3xl border border-purple-400/25 bg-wisdom-card/95 p-8 sm:p-10 text-center shadow-[0_0_40px_-16px_rgba(168,85,247,0.35)]">
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/30 bg-purple-500/15 text-purple-300">
            <Lock className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/10 px-3.5 py-1.5 mb-4">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
              Opening tomorrow
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-3">
            <span className="text-purple-300">Freshman</span> courses
          </h1>
          <p className="text-wisdom-muted text-sm sm:text-base leading-relaxed mb-6">
            This pathway is closed for today. Come back tomorrow to browse subjects and open the
            learning hubs. Meanwhile, registered students can still use ECE Year 3 · Semester 1.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/academy/special-packages/electrical-computer-engineering/sem-1"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-400 transition-colors"
            >
              <GraduationCap className="w-4 h-4" />
              Open ECE Semester 1
            </Link>
            <Link
              href="/academy"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white/85 hover:border-white/30 transition-colors"
            >
              Back to Academy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
