import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Scale,
  FileText,
  AlertCircle,
  GraduationCap,
  CreditCard,
  Lock,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service · Wisdom Tower Academy",
  description:
    "Official institutional terms governing student enrollment, intellectual property, academic integrity, and digital service utilization across Wisdom Tower Academy.",
};

const LAST_REVISED = "28 September 2026";
const EFFECTIVE_DATE = "Academic Year 2026/2027";

export default function TermsPage() {
  return (
    <div className="relative min-h-[85vh] py-14 md:py-24">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[42rem] h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-96 left-1/4 w-72 h-72 bg-sky-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Document Header */}
        <header className="border-b border-white/10 pb-8 mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-400/20">
              <Scale className="w-3.5 h-3.5" />
              Institutional Agreement
            </span>
            <span className="text-xs text-wisdom-muted">
              Effective: {EFFECTIVE_DATE}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Terms of Service & Academic Agreement
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
            These Terms govern your enrollment, access to curriculum materials, digital examination engines,
            and software services provided by Wisdom Tower Academy. By registering an account or accessing any
            academic track, you enter into a legally binding academic compact.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-wisdom-muted">
            <span>Document version: 3.2</span>
            <span>•</span>
            <span>Last revised: {LAST_REVISED}</span>
            <span>•</span>
            <Link href="/privacy" className="text-amber-300 hover:underline">
              Read Companion Privacy Policy →
            </Link>
          </div>
        </header>

        {/* Executive Summary Callout */}
        <div className="mb-12 rounded-2xl border border-amber-400/20 bg-amber-500/[0.04] p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4" />
            Core Academic Compact at a Glance
          </h2>
          <ul className="text-xs sm:text-sm text-slate-300/90 space-y-2 list-disc pl-5">
            <li>
              <strong>Personal Educational License:</strong> Course enrollments, solved exams, and lecture notes are licensed strictly for your individual academic preparation and cannot be redistributed, scraped, or shared.
            </li>
            <li>
              <strong>Academic Integrity:</strong> Wisdom Tower Academy upholds rigorous academic honesty. The platform is designed to develop genuine competence under Ethiopia&apos;s new curriculum framework.
            </li>
            <li>
              <strong>Verified Access:</strong> Tuition fees in Ethiopian Birr (ETB) are verified through domestic payment channels (Telebirr, CBE, Abyssinia, etc.). Verified orders unlock immediate learning hub access.
            </li>
          </ul>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-12 text-slate-300 text-sm sm:text-[15px] leading-relaxed">
          {/* Section 1 */}
          <section id="section-1" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-mono text-amber-300">
                01
              </span>
              Academic Purpose & Acceptance of Terms
            </h2>
            <div className="space-y-3 text-slate-300/90 pl-9">
              <p>
                Wisdom Tower Academy (“the Platform”, “we”, “our”, or “us”) operates a specialized digital education
                infrastructure engineered to support secondary learners (Grades 9–12), remedial foundation candidates,
                university freshman scholars, departmental engineering students, and candidates preparing for national
                standardized examinations (including UAT, GAT, COC, and University Exit Exams).
              </p>
              <p>
                By creating a student profile, logging in via federated credentials (such as Google OAuth), making a tuition payment,
                or accessing downloadable materials, you affirm that you are either at least 18 years of age or possess legal parental
                or guardian consent, and that you unreservedly agree to be bound by these Terms of Service. If you do not accept these
                provisions in their entirety, you are not authorized to utilize the platform.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-mono text-amber-300">
                02
              </span>
              Account Governance & Credential Security
            </h2>
            <div className="space-y-3 text-slate-300/90 pl-9">
              <p>
                Each student account is an individual academic identity. To maintain the pedagogical validity of leaderboards,
                streak counts, and personalized question-bank progress, account credentials must remain exclusive to the registered student.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>True Information:</strong> You agree to provide accurate, up-to-date registration details, including your
                  genuine name, active phone number, and institutional or personal email address.
                </li>
                <li>
                  <strong>Prohibition of Credential Sharing:</strong> Sharing credentials, selling account seats, or distributing
                  authenticated session tokens to unauthorized third parties constitutes a material breach of this Agreement and
                  results in immediate, unrefunded termination of access.
                </li>
                <li>
                  <strong>Multi-Device Authorization:</strong> Students may access their learning portal across their personal
                  mobile phones, tablets, and personal computers, provided usage represents the authentic individual study sessions
                  of the enrolled student. Simultaneous concurrent sessions indicating credential pooling may trigger security holds.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-mono text-amber-300">
                03
              </span>
              Intellectual Property & Limited Educational License
            </h2>
            <div className="space-y-3 text-slate-300/90 pl-9">
              <p>
                All course lectures, modular summary notes, original step-by-step examination solutions, algorithmic question banks,
                flashcard taxonomies, pedagogical software code, graphic artwork, and trademarked branding are the exclusive proprietary
                intellectual property of Wisdom Tower Academy and its contributing academic faculty.
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
                <p className="font-semibold text-white">License Scope Granted to Enrolled Students:</p>
                <p>
                  Upon confirmed payment and activation of a package, Wisdom Tower Academy grants you a personal, non-exclusive,
                  non-transferable, revocable license to view, read, and solve the designated curriculum materials for your own
                  private study and exam revision.
                </p>
              </div>
              <p className="font-semibold text-amber-200">Expressly Prohibited Conduct:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Automated scraping, bulk downloading, or mirroring of curriculum materials via bots or unauthorized web crawlers.</li>
                <li>Re-uploading, republishing, or reselling our notes, question banks, or solutions on external Telegram channels, social platforms, or rival websites.</li>
                <li>Modifying, reverse-engineering, decompiling, or creating derivative works based upon our platform software or proprietary content engines.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-mono text-amber-300">
                04
              </span>
              Academic Integrity & Honor Code
            </h2>
            <div className="space-y-3 text-slate-300/90 pl-9">
              <p>
                Wisdom Tower Academy is built to foster genuine intellectual mastery aligned with the high standards of higher
                education in Ethiopia and internationally. By engaging with our timed practice exams and leaderboard systems, you agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Complete timed diagnostic examinations honestly without manipulating client-side timers or injecting synthetic score submissions.</li>
                <li>Use AI-assisted explanations as a formative learning tutor rather than as a substitute for developing personal problem-solving mastery.</li>
                <li>Refrain from posting examination keys or solutions during ongoing live institutional assessments.</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-mono text-amber-300">
                05
              </span>
              Curriculum Packages, Tuition Fees & Payment Verification
            </h2>
            <div className="space-y-3 text-slate-300/90 pl-9">
              <p>
                To maintain accessible education across Ethiopia, packages are denominated in Ethiopian Birr (ETB) and structured
                modularly so students only pay for the tracks they need.
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong>Domestic Payment Gateways:</strong> Payments are transacted directly via established Ethiopian banking and
                  mobile money institutions, including Telebirr, Commercial Bank of Ethiopia (CBE), Bank of Abyssinia, and Awash Bank.
                </li>
                <li>
                  <strong>Verification Protocols:</strong> Students submit their genuine bank transfer transaction reference (or optional receipt screenshot).
                  Access is provisioned either automatically via our verification microservices or promptly via our academic registrar verification desk.
                </li>
                <li>
                  <strong>Submission of Fraudulent References:</strong> Submitting forged transaction codes, re-used transfer numbers, or falsified receipts
                  constitutes fraud. Such attempts will lead to immediate account suspension, permanent blacklisting, and reporting to relevant financial channels.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-mono text-amber-300">
                06
              </span>
              Digital Fulfillment & Refund Policy
            </h2>
            <div className="space-y-3 text-slate-300/90 pl-9">
              <p>
                Due to the immediate digital fulfillment and direct accessibility of proprietary textbooks, worked solutions, and question banks
                upon verification, enrollments are generally non-refundable once unlocked.
              </p>
              <p>
                <strong>Exceptional Refund Circumstances:</strong> Refunds will be granted under the following documented conditions:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Duplicate payment for the identical package resulting from network timeout during transfer submission.</li>
                <li>Verifiable technical defect on our platform that persistently prevents access to curriculum materials, where our technical team is unable to resolve the issue within 72 hours of written notification.</li>
              </ul>
              <p>
                Refund requests must be lodged within 7 days of the payment date via official support channels, quoting the original Order Reference.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-mono text-amber-300">
                07
              </span>
              Platform Continuity, Offline Resilience & System Availability
            </h2>
            <div className="space-y-3 text-slate-300/90 pl-9">
              <p>
                We understand that reliable study access is vital during examination seasons. Wisdom Tower Academy employs modern Progressive Web App (PWA)
                technologies, edge caching, and localized data stores (IndexedDB) to allow continuous learning during intermittent internet connectivity.
              </p>
              <p>
                While we strive for 99.9% uptime, we do not warrant that digital services will be entirely uninterrupted or immune from third-party
                telecom outages, national infrastructure maintenance, or force majeure events. Scheduled maintenance will be communicated via platform announcements.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-mono text-amber-300">
                08
              </span>
              Educational Outcomes & Warranty Disclaimers
            </h2>
            <div className="space-y-3 text-slate-300/90 pl-9">
              <p>
                Wisdom Tower Academy delivers high-caliber, curriculum-aligned academic instruments, verified exam solutions, and personalized practice engines.
                However, individual performance in national examinations, regional competitions, university admissions, and subsequent grade point averages
                depends upon the student&apos;s personal diligence, study discipline, and exam execution.
              </p>
              <p className="italic text-slate-400">
                The platform is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without express or implied warranties of commercial
                fitness for a particular vocational outcome. Wisdom Tower Academy shall not be liable for incidental, consequential, or indirect damages
                arising out of the use or inability to use our educational tools.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-mono text-amber-300">
                09
              </span>
              Governing Law & Institutional Dispute Resolution
            </h2>
            <div className="space-y-3 text-slate-300/90 pl-9">
              <p>
                These Terms are governed by and construed in conformity with the laws and educational proclamations of the Federal Democratic Republic of Ethiopia.
                Any disputes arising under or in connection with these Terms shall first be submitted to informal dispute resolution via our Academic Affairs Committee.
                If unresolved, disputes shall be subject to the exclusive jurisdiction of the competent courts of Addis Ababa, Ethiopia.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="scroll-mt-20">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white mb-3 flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs font-mono text-amber-300">
                10
              </span>
              Official Academic Contact & Registrars
            </h2>
            <div className="space-y-3 text-slate-300/90 pl-9">
              <p>
                For official legal notices, institutional licensing inquiries, or student advocacy matters regarding these Terms, contact our administrative office:
              </p>
              <div className="rounded-xl border border-white/10 bg-wisdom-card p-4 space-y-1 font-mono text-xs text-slate-300">
                <p className="text-white font-semibold font-sans text-sm mb-1">Wisdom Tower Academy · Legal & Academic Affairs</p>
                <p>Addis Ababa, Ethiopia</p>
                <p>Email: <a href="mailto:support@wisdomtower.tech" className="text-amber-300 hover:underline">support@wisdomtower.tech</a></p>
                <p>Telegram Official: <a href="https://t.me/wisdom_tower2" target="_blank" rel="noopener noreferrer" className="text-cyan-300 hover:underline">@wisdom_tower2</a></p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-wisdom-muted">
          <p>© {new Date().getFullYear()} Wisdom Tower Academy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-amber-300 hover:underline">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/about" className="text-slate-300 hover:underline">
              About the Academy
            </Link>
            <span>•</span>
            <Link href="/contact" className="text-slate-300 hover:underline">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
