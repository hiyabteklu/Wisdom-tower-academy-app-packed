"use client";

import {
  Award,
  BookOpen,
  Calculator,
  Clock,
  Target,
  Layers,
  BarChart3,
  Sigma,
  Compass,
  MessageSquare,
  PenLine,
  Lightbulb,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import CollapsibleSection from "@/components/CollapsibleSection";

const pillarCard =
  "rounded-2xl border border-white/12 bg-wisdom-card/80 p-5 sm:p-6 shadow-card-3d transition-all duration-300 hover:border-emerald-400/30";
const tipCard =
  "rounded-xl border border-white/10 bg-wisdom-dark/50 px-4 py-3 text-sm leading-relaxed text-wisdom-muted";
const iconWrap =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-400";

export default function UatIntroduction() {
  return (
    <section className="mb-14 md:mb-16 animate-fade-up">
      {/* Hero intro */}
      <div className="rounded-3xl border border-white/12 bg-wisdom-card overflow-hidden mb-8">
        <div className="bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent px-5 sm:px-8 pt-7 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <span className={iconWrap}>
              <Award className="w-5 h-5" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/90">
              Architecture of the exam
            </p>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
            Introduction to the UAT
          </h2>
          <p className="text-wisdom-muted text-base sm:text-lg leading-relaxed max-w-3xl">
            The University Aptitude Test measures how a student processes new information under
            time constraint: unfamiliar arguments, numerical relationships, dense text. Content
            knowledge varies by school and curriculum. The capacity to reason does not. The UAT
            therefore uses two pillars: Quantitative Reasoning and Verbal Reasoning. Universities
            ask whether a candidate can think fast, precisely, and without external scaffolding.
          </p>
        </div>

        <div className="px-5 sm:px-8 py-6 grid sm:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <span className={iconWrap}>
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <p className="font-semibold text-white text-sm">Time is the gate</p>
              <p className="text-xs text-wisdom-muted mt-1 leading-relaxed">
                Almost every question is solvable given unlimited time. High scores come from
                speed of correct method.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className={iconWrap}>
              <Zap className="w-5 h-5" />
            </span>
            <div>
              <p className="font-semibold text-white text-sm">Automaticity wins</p>
              <p className="text-xs text-wisdom-muted mt-1 leading-relaxed">
                Practice until the pattern is recognized in seconds. Recognition, not slow
                correctness, is the target.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className={iconWrap}>
              <Target className="w-5 h-5" />
            </span>
            <div>
              <p className="font-semibold text-white text-sm">Two pillars only</p>
              <p className="text-xs text-wisdom-muted mt-1 leading-relaxed">
                Quantitative and Verbal. No subject sections. The same skills serve every faculty.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quantitative pillar */}
      <CollapsibleSection
        title="Quantitative Reasoning"
        subtitle="Speed and precision under constraint"
        icon={<Calculator className="w-5 h-5 text-emerald-300" />}
        defaultOpen={true}
        className="mb-6"
      >
        <div className="space-y-5">
          <p className="text-wisdom-muted leading-relaxed text-[0.95rem]">
            Quantitative Reasoning is mathematics stripped of extended derivation and rebuilt as a
            speed-and-precision instrument. Four subdomains target distinct cognitive skills that
            predict first-year performance.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className={pillarCard}>
              <div className="flex items-center gap-3 mb-3">
                <span className={iconWrap}>
                  <Sigma className="w-5 h-5" />
                </span>
                <h3 className="font-display font-bold text-white">Heart of Algebra</h3>
              </div>
              <p className="text-sm text-wisdom-muted leading-relaxed mb-3">
                Translate verbal or numerical situations into constrained relationships and solve
                without transcription or sign errors. Linear equations, inequalities, systems, and
                word problems all reduce to this skill.
              </p>
              <div className={tipCard}>
                <span className="inline-flex items-center gap-1.5 text-emerald-400/90 font-medium text-xs mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Dominant error source
                </span>
                <p>
                  Copying mistakes and sign flips under time pressure: not conceptual gaps. Rewrite
                  cleanly after every distribution step. Pause on every negative multiplier in an
                  inequality.
                </p>
              </div>
            </div>

            <div className={pillarCard}>
              <div className="flex items-center gap-3 mb-3">
                <span className={iconWrap}>
                  <BarChart3 className="w-5 h-5" />
                </span>
                <h3 className="font-display font-bold text-white">Problem Solving & Data</h3>
              </div>
              <p className="text-sm text-wisdom-muted leading-relaxed mb-3">
                Percentages, interest, ratios, work rates, speed-distance, averages, and sequences.
                Breadth of exposure matters more than depth in any single technique.
              </p>
              <div className={tipCard}>
                <span className="inline-flex items-center gap-1.5 text-emerald-400/90 font-medium text-xs mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Execution rules
                </span>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li>Sequential percentage changes: track the running value, never add percentages.</li>
                  <li>Work rates: sum individual rates (1/n), never sum the times.</li>
                  <li>Relative speed: add for opposite directions, subtract for same direction.</li>
                </ul>
              </div>
            </div>

            <div className={pillarCard}>
              <div className="flex items-center gap-3 mb-3">
                <span className={iconWrap}>
                  <Layers className="w-5 h-5" />
                </span>
                <h3 className="font-display font-bold text-white">Advanced Math Transition</h3>
              </div>
              <p className="text-sm text-wisdom-muted leading-relaxed mb-3">
                Exponents, radicals, polynomials, rational expressions, linear-quadratic systems, and
                logarithms. Tests comfort with abstraction rather than pure computation.
              </p>
              <div className={tipCard}>
                <span className="inline-flex items-center gap-1.5 text-emerald-400/90 font-medium text-xs mb-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Structural notes
                </span>
                <p>
                  Factor first. Exclude values that zero a denominator. Logarithm properties are
                  exponent laws in different clothing: internalize the definition and the rules
                  follow.
                </p>
              </div>
            </div>

            <div className={pillarCard}>
              <div className="flex items-center gap-3 mb-3">
                <span className={iconWrap}>
                  <Compass className="w-5 h-5" />
                </span>
                <h3 className="font-display font-bold text-white">Geometry & Combinatorics</h3>
              </div>
              <p className="text-sm text-wisdom-muted leading-relaxed mb-3">
                Basic, coordinate, circle and solid geometry; right-triangle trigonometry;
                permutations, combinations, LCM and HCF.
              </p>
              <div className={tipCard}>
                <span className="inline-flex items-center gap-1.5 text-emerald-400/90 font-medium text-xs mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Recurring traps
                </span>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li>Figures are not drawn to scale: solve from stated values only.</li>
                  <li>Order matters? → permutation. Order does not? → combination. Ask first.</li>
                  <li>LCM for coincidence of cycles; HCF for largest equal groups.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Verbal pillar */}
      <CollapsibleSection
        title="Verbal Reasoning"
        subtitle="Precise meaning under time pressure"
        icon={<BookOpen className="w-5 h-5 text-emerald-300" />}
        defaultOpen={true}
        className="mb-6"
      >
        <div className="space-y-5">
          <p className="text-wisdom-muted leading-relaxed text-[0.95rem]">
            Verbal Reasoning tests extraction of precise meaning and structural correctness of
            language. Vocabulary size alone is insufficient; the ability to locate textual evidence
            and apply grammatical rules under the clock is what separates scores.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className={pillarCard}>
              <div className="flex items-center gap-3 mb-3">
                <span className={iconWrap}>
                  <MessageSquare className="w-5 h-5" />
                </span>
                <h3 className="font-display font-bold text-white">Reading Comprehension</h3>
              </div>
              <p className="text-sm text-wisdom-muted leading-relaxed mb-3">
                Retrievable, precise understanding. Inference, main idea, structure, tone, vocabulary
                in context, and paragraph completion.
              </p>
              <div className={tipCard}>
                <span className="inline-flex items-center gap-1.5 text-emerald-400/90 font-medium text-xs mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hard rules
                </span>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li>Inference answers must follow necessarily from the passage: not merely sound plausible.</li>
                  <li>Main idea is the author’s central claim about the topic, not the topic itself.</li>
                  <li>Tone lives in diction, not in the subject matter.</li>
                  <li>Vocabulary-in-context: substitute the chosen sense back into the sentence.</li>
                </ul>
              </div>
            </div>

            <div className={pillarCard}>
              <div className="flex items-center gap-3 mb-3">
                <span className={iconWrap}>
                  <PenLine className="w-5 h-5" />
                </span>
                <h3 className="font-display font-bold text-white">Writing & Language</h3>
              </div>
              <p className="text-sm text-wisdom-muted leading-relaxed mb-3">
                Analogies, question formation, conditionals, punctuation, synonyms and antonyms.
                Explicit rule knowledge rather than passive comprehension.
              </p>
              <div className={tipCard}>
                <span className="inline-flex items-center gap-1.5 text-emerald-400/90 font-medium text-xs mb-1">
                  <Lightbulb className="w-3.5 h-3.5" /> Method notes
                </span>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li>Analogies: state the exact relationship as a sentence, then test every option against it.</li>
                  <li>Conditionals fail almost always on tense mismatch between clauses.</li>
                  <li>Comma splice is the single most common punctuation error tested.</li>
                  <li>Synonyms require the same shade, formality and intensity: related is not enough.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Key takeaways strip */}
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 px-5 sm:px-6 py-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-emerald-400" />
          <p className="text-sm font-semibold text-emerald-300 tracking-wide">Preparation targets</p>
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-wisdom-muted">
          <li className="flex gap-2">
            <span className="text-emerald-400/80 shrink-0">•</span>
            Automatic pattern recognition under the clock, not slow correctness.
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400/80 shrink-0">•</span>
            Algebra errors are mostly transcription and signs, not concepts.
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400/80 shrink-0">•</span>
            Work rates combine by summing rates; percentage steps track the base.
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400/80 shrink-0">•</span>
            Geometry: stated values only. Permutation vs combination: order first.
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400/80 shrink-0">•</span>
            Inferences require textual necessity. Main idea is the author’s claim.
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400/80 shrink-0">•</span>
            Analogies by exact relational structure; conditionals by tense alignment.
          </li>
        </ul>
      </div>
    </section>
  );
}
