import Link from "next/link";
import { DIGITAL_URL } from "@/lib/digital-url";

export const SOCIAL = {
  telegramGroup: "https://t.me/wisdom_tower1",
  telegramChannel: "https://t.me/wisdom_tower2",
  linkedin: "https://www.linkedin.com/company/wisdom-tower/",
} as const;

function IconTelegram({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function IconLinkedIn({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const linkBtn =
  "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-wisdom-muted transition-all duration-200 hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300";

export default function Footer() {
  return (
    <footer
      className="relative z-10 mt-auto border-t border-white/8 bg-wisdom-navy/95 backdrop-blur-md site-footer"
      data-site-footer="true"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-wisdom-dark text-[10px]">
                WTA
              </div>
              <span className="font-semibold text-lg text-white">Wisdom Tower Academy</span>
            </div>
            <p className="text-wisdom-muted text-sm max-w-md leading-relaxed">
              Grades 9–12, Freshman, UAT, GAT, COC & Exit Exam pathways: learn and unlock packages
              on Academy.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <a
                href={SOCIAL.telegramGroup}
                target="_blank"
                rel="noopener noreferrer"
                className={linkBtn}
                aria-label="Telegram group"
              >
                <IconTelegram />
              </a>
              <a
                href={SOCIAL.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={linkBtn}
                aria-label="LinkedIn"
              >
                <IconLinkedIn />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Academy</h4>
            <ul className="space-y-2.5 text-sm text-wisdom-muted">
              <li>
                <Link href="/academy" className="hover:text-amber-300 transition-colors">
                  Pathways
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-amber-300 transition-colors">
                  Packages
                </Link>
              </li>
              <li>
                <Link href="/learning" className="hover:text-amber-300 transition-colors">
                  My Learning
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-300 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-300 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-300 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-300 transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white">Also from Wisdom Tower</h4>
            <p className="text-sm text-wisdom-muted leading-relaxed mb-3">
              Need design, web, or marketing services?
            </p>
            <a
              href={DIGITAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-semibold text-wisdom-cyan hover:underline"
            >
              Open Wisdom Digital →
            </a>
            <Link
              href="/contact"
              className="mt-4 block text-sm font-medium text-wisdom-muted hover:text-amber-300"
            >
              Academy support →
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-wisdom-muted">
          <p>© {new Date().getFullYear()} Wisdom Tower Academy. All rights reserved.</p>
          <div className="flex flex-wrap gap-3 text-xs">
            <Link href="/privacy" className="hover:text-amber-300">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-amber-300">
              Terms
            </Link>
            <a
              href={DIGITAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-wisdom-cyan transition-colors"
            >
              Digital services
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
