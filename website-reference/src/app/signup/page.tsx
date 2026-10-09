"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import BrandLoader from "@/components/BrandLoader";
import BrandLogo from "@/components/BrandLogo";
import { ACADEMIC_LEVEL_OPTIONS } from "@/lib/academic-levels";
import { registerScholar } from "@/lib/auth-service";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  Phone,
  ChevronDown,
  Check,
} from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const next =
    rawNext &&
    rawNext.startsWith("/") &&
    !rawNext.startsWith("//") &&
    !rawNext.startsWith("/login") &&
    !rawNext.startsWith("/signup")
      ? rawNext
      : "/account";

  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [educationLevel, setEducationLevel] = useState("Freshman");
  const [customEducationLevel, setCustomEducationLevel] = useState("");
  const [levelOpen, setLevelOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{
    text: string;
    action?: { label: string; href: string };
  } | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);

    if (!agreedToTerms) {
      setNotice({
        text: "Please agree to the Terms of Service and Privacy Policy to continue.",
      });
      return;
    }
    if (password !== confirm) {
      setNotice({ text: "Passwords do not match." });
      return;
    }
    if (password.length < 6) {
      setNotice({ text: "Password must be at least 6 characters." });
      return;
    }
    if (!educationLevel) {
      setNotice({ text: "Please select your academic level." });
      return;
    }

    const finalEducationLevel =
      educationLevel === "Other"
        ? customEducationLevel.trim() || "Other"
        : educationLevel;

    setLoading(true);

    try {
      const result = await registerScholar({
        fullName: fullName.trim(),
        identifier,
        password,
        educationLevel: finalEducationLevel,
      });

      setLoading(false);

      if (result.success) {
        if (typeof window !== "undefined") {
          window.location.href = next;
        } else {
          router.replace(next);
        }
        return;
      }

      if (result.code === "user_already_exists") {
        // Automatically direct user to Login page with their credentials prefilled
        const loginUrl = `/login?identifier=${encodeURIComponent(identifier.trim())}&existing=1&next=${encodeURIComponent(next)}`;
        router.push(loginUrl);
        return;
      }

      setNotice({
        text: result.message || "Could not complete account creation. Please try again.",
      });
    } catch {
      setLoading(false);
      setNotice({
        text: "Could not create account. Please check your details and try again.",
      });
    }
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/15 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 text-sm";
  const labelClass = "block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5";

  return (
    <div className="min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-10 pb-44 overflow-y-auto">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <BrandLogo size={60} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            Wisdom Tower Academy
          </h1>
        </div>

        <div className="rounded-3xl border border-white/20 bg-gradient-to-b from-[#131f38] via-[#0e172a] to-[#0a101d] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400" />

          {/* Minimal Navigation Notice at top */}
          <div className="mb-6 pb-4 border-b border-white/10 text-center">
            <p className="text-xs sm:text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href={`/login?next=${encodeURIComponent(next)}`}
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-semibold ml-1"
              >
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Full Legal Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Abebe Bikila"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Email or Phone Number</label>
              <div className="relative">
                {identifier.includes("@") ? (
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                ) : (
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                )}
                <input
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={inputClass}
                  placeholder="name@email.com or 09xxxxxxxx"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className={`${inputClass} pr-12`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Redesigned Academic Level Picker */}
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Academic Level</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setLevelOpen((o) => !o)}
                    className={`${inputClass} pl-11 pr-10 text-left font-medium flex items-center justify-between cursor-pointer`}
                  >
                    <span className="truncate">{educationLevel || "Select Academic Level"}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                        levelOpen ? "rotate-180 text-cyan-300" : ""
                      }`}
                    />
                  </button>
                  {levelOpen && (
                    <ul className="absolute z-20 mt-1.5 w-full max-h-60 overflow-auto rounded-xl border border-white/20 bg-[#10192a] shadow-2xl py-1.5 backdrop-blur-xl">
                      {ACADEMIC_LEVEL_OPTIONS.map((level) => {
                        const isSelected = educationLevel === level;
                        return (
                          <li key={level}>
                            <button
                              type="button"
                              onClick={() => {
                                setEducationLevel(level);
                                setLevelOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between transition-colors ${
                                isSelected
                                  ? "bg-cyan-500/20 text-cyan-300"
                                  : "text-slate-200 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <span>{level}</span>
                              {isSelected && <Check className="w-4 h-4 text-cyan-300 shrink-0" />}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              {/* If 'Other' is selected, show manual input field */}
              {educationLevel === "Other" && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  <label className={labelClass}>Specify your academic level</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={customEducationLevel}
                      onChange={(e) => setCustomEducationLevel(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Master's, College Diploma, Self-learner..."
                      autoFocus
                    />
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-3 transition-colors">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/40 bg-slate-900 accent-cyan-400"
              />
              <span className="text-xs text-slate-300 leading-relaxed font-normal">
                I agree to the{" "}
                <Link href="/terms" className="text-cyan-300 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-cyan-300 hover:underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {/* Minimal Notice (No bright red boxes) */}
            {notice && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 leading-relaxed text-center">
                <span>{notice.text}</span>
                {notice.action && (
                  <div className="mt-1.5">
                    <Link
                      href={notice.action.href}
                      className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium"
                    >
                      {notice.action.label} →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !agreedToTerms}
              className="w-full py-3.5 px-6 rounded-xl text-sm sm:text-base font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Minimal Navigation Notice at bottom */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-xs sm:text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href={`/login?next=${encodeURIComponent(next)}`}
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-semibold ml-1"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-10 pb-44 overflow-y-auto"
          data-wta-spinner="true"
        >
          <BrandLoader size="md" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
