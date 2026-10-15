import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Trash2 } from "lucide-react";
import DeleteAccountPanel from "./DeleteAccountPanel";

export const metadata: Metadata = {
  title: "Delete Your Account · Wisdom Tower Academy",
  description:
    "How to permanently delete your Wisdom Tower Academy account and what happens to your data.",
};

export default function DeleteAccountPage() {
  return (
    <div className="relative min-h-[85vh] py-14 md:py-24">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="border-b border-white/10 pb-8 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-400/20 mb-3">
            <Trash2 className="w-3.5 h-3.5" />
            Account Deletion
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Delete your account
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            This page is for students of Wisdom Tower Academy (website and Android app) who want
            their account and personal data removed.
          </p>
        </header>

        <div className="mb-10">
          <DeleteAccountPanel />
        </div>

        <div className="space-y-8 text-sm sm:text-[15px] leading-relaxed text-slate-300">
          <section>
            <h2 className="text-xl font-display font-bold text-white mb-3">What is deleted</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Your sign-in account (e-mail or phone login) and your profile: name, phone, school, avatar choice, study settings and Student ID.</li>
              <li>Your learning progress, reading and quiz or exam attempts, and saved academic results (so also your leaderboard entries).</li>
              <li>Course enrollments and access grants linked to your account, and your notification device tokens.</li>
              <li>Payment orders that were never verified (pending or rejected), together with their receipt images.</li>
              <li>Contact-form messages and talent applications sent with your account e-mail.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-3">What is kept</h2>
            <p>
              Records of verified payments (package, amount, payment method, transaction reference and
              the name and phone given at checkout) are kept for five years, as required by Ethiopian
              tax and commercial bookkeeping rules described in section 9 of our{" "}
              <Link href="/privacy" className="text-cyan-300 hover:underline">Privacy Policy</Link>.
              After deletion they are no longer connected to any sign-in account. Nothing else is kept.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-3">Before you delete</h2>
            <p>
              You will lose access to every package and all progress tied to this account. Deletion
              cannot be undone.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-300" />
              Cannot sign in?
            </h2>
            <p>
              Send your request from the e-mail address you registered with (or tell us the phone number you
              used) to{" "}
              <a href="mailto:support@wisdomtower.tech?subject=Account%20deletion%20request" className="text-cyan-300 hover:underline">
                support@wisdomtower.tech
              </a>
              , or use the <Link href="/contact" className="text-cyan-300 hover:underline">contact page</Link>. We may
              ask you to confirm that the account is yours.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
