import Link from "next/link";
import CategoryBackButton from "@/components/CategoryBackButton";
import QuizPlayer from "@/components/quiz/QuizPlayer";
import { sampleQuestions } from "@/data/sample-questions";

export const metadata = {
  title: "Quiz demo | Wisdom Tower Academy",
  description: "Pilot quiz with official solutions and optional AI explanations",
};

export default function QuizDemoPage() {
  return (
    <div className="relative min-h-[75vh]">
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <CategoryBackButton fallback="/academy" />

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300/80 mb-2">
            Academy · Pilot
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            Quiz demo
          </h1>
          <p className="text-wisdom-muted text-sm leading-relaxed max-w-lg">
            After you check an answer you get two options:{" "}
            <span className="text-emerald-300/90 font-medium">Solution</span> (our premade
            write-up without AI) and{" "}
            <span className="text-cyan-300/90 font-medium">Explain with AI</span> (optional extra
            tutoring when you want more).
          </p>
        </div>

        <QuizPlayer
          questions={sampleQuestions}
          title="Sample bank"
          enableSolution
          enableAiExplain
        />

        <div className="mt-8 text-center">
          <Link
            href="/academy"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
          >
            ← Academy Pathways
          </Link>
        </div>
      </div>
    </div>
  );
}
