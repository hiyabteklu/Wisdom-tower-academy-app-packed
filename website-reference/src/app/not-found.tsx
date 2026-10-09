import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md mx-auto space-y-5">
        <span className="text-6xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-cyan-400 to-sky-400">
          404
        </span>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-wisdom-muted leading-relaxed">
          The curriculum page, exam paper, or learning resource you are looking for doesn&apos;t exist or has moved.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 text-xs px-5 py-2.5"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <Link
            href="/learning"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Learning Hub</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
