"use client";

import BrandLogo from "@/components/BrandLogo";
import BrandLoader from "@/components/BrandLoader";
import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ACADEMIC_LEVEL_OPTIONS } from "@/lib/academic-levels";
import { loginScholar, registerScholar } from "@/lib/auth-service";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  GraduationCap,
  ChevronDown,
  Check,
} from "lucide-react";

function LoginForm() {
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

  const requestedMode = searchParams.get("mode");
  const initialIdentifier = searchParams.get("identifier") || "";
  const existingNotice = searchParams.get("existing") === "1";

  const [mode, setMode] = useState<"signin" | "signup">(
    requestedMode === "signup" ? "signup" : "signin"
  );
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [educationLevel, setEducationLevel] = useState("Freshman");
  const [customEducationLevel, setCustomEducationLevel] = useState("");
  const [levelPickerOpen, setLevelPickerOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{
    type: "info" | "error" | "success";
    text: string;
    action?: { label: string; href?: string; onAction?: () => void };
  } | null>(
    existingNotice
      ? {
          type: "info",
          text: "An account with this email or phone already exists. Please enter your password to sign in.",
        }
      : null
  );

  // Auto redirect if already signed in
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled && session?.user) {
        router.replace(next.startsWith("/") ? next : "/account");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);

    const id = identifier.trim();
    if (!id) {
      setNotice({
        type: "error",
        text: "Please enter your email or phone number.",
      });
      return;
    }

    // SIGN IN FLOW
    if (mode === "signin") {
      if (!password) {
        setNotice({
          type: "error",
          text: "Please enter your password.",
        });
        return;
      }

      setLoading(true);
      try {
        const result = await loginScholar(id, password);
        if (result.success) {
          const targetUrl = next.startsWith("/") ? next : "/account";
          if (typeof window !== "undefined") {
            window.location.href = targetUrl;
          } else {
            router.replace(targetUrl);
          }
          return;
        }

        setLoading(false);
        if (result.code === "user_not_found") {
          setNotice({
            type: "info",
            text: "No account found with this email or phone.",
            action: {
              label: "Create a free account",
              onAction: () => {
                setMode("signup");
                setNotice(null);
              },
            },
          });
        } else if (result.code === "invalid_credentials") {
          setNotice({
            type: "error",
            text: "Incorrect password. Please verify and try again.",
          });
        } else {
          setNotice({
            type: "error",
            text: result.message || "Sign in could not be completed. Please try again.",
          });
        }
      } catch {
        setLoading(false);
        setNotice({
          type: "error",
          text: "Sign in error. Please try again.",
        });
      }
      return;
    }

    // SIGN UP FLOW
    if (mode === "signup") {
      if (!fullName.trim()) {
        setNotice({
          type: "error",
          text: "Please enter your full legal name.",
        });
        return;
      }
      if (password.length < 6) {
        setNotice({
          type: "error",
          text: "Password must be at least 6 characters.",
        });
        return;
      }
      if (password !== confirmPassword) {
        setNotice({
          type: "error",
          text: "Passwords do not match.",
        });
        return;
      }
      if (!agreedToTerms) {
        setNotice({
          type: "error",
          text: "Please accept the Terms of Service to continue.",
        });
        return;
      }

      const finalLevel =
        educationLevel === "Other"
          ? customEducationLevel.trim() || "Other"
          : educationLevel;

      setLoading(true);
      try {
        const regResult = await registerScholar({
          fullName: fullName.trim(),
          identifier: id,
          password,
          educationLevel: finalLevel,
        });

        setLoading(false);
        if (regResult.success) {
          const targetUrl = next.startsWith("/") ? next : "/account";
          if (typeof window !== "undefined") {
            window.location.href = targetUrl;
          } else {
            router.replace(targetUrl);
          }
          return;
        }

        if (regResult.code === "user_already_exists") {
          setMode("signin");
          setNotice({
            type: "info",
            text: "An account with this email or phone already exists. Please enter your password to sign in.",
          });
          return;
        }

        setNotice({
          type: "error",
          text: regResult.message || "Account creation could not be completed.",
        });
      } catch {
        setLoading(false);
        setNotice({
          type: "error",
          text: "Registration error. Please try again.",
        });
      }
    }
  }

  const inputClass =
    "w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/90 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-sm font-medium transition-all shadow-inner";
  const labelClass =
    "block text-xs font-bold uppercase tracking-wider text-slate-200 mb-1.5";

  return (
    <div className="min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-10 pb-44 overflow-y-auto">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <BrandLogo size={60} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            Wisdom Tower Academy
          </h1>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-white/20 bg-gradient-to-b from-[#131f38] via-[#0e172a] to-[#0a101d] p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative overflow-hidden">
          {/* Top radiant highlight */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-sky-300 to-cyan-400" />

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-white/15 mb-6 gap-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setNotice(null);
              }}
              className={`py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "signin"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setNotice(null);
              }}
              className={`py-2.5 px-4 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                mode === "signup"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name for Signup */}
            {mode === "signup" && (
              <div>
                <label className={labelClass}>Full Legal Name</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Abebe Bikila"
                    autoFocus={mode === "signup"}
                  />
                </div>
              </div>
            )}

            {/* Email or Phone */}
            <div>
              <label className={labelClass}>Email or Phone Number</label>
              <div className="relative">
                {identifier.includes("@") ? (
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                ) : (
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                )}
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={inputClass}
                  placeholder="name@email.com or 09xxxxxxxx"
                  autoFocus={mode === "signin"}
                />
              </div>
            </div>

            {/* Academic Level for Signup */}
            {mode === "signup" && (
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>Academic Level</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setLevelPickerOpen((prev) => !prev)}
                      className="w-full pl-11 pr-10 py-3.5 rounded-xl bg-slate-950/90 border border-white/20 text-white text-left text-sm font-medium transition-all shadow-inner hover:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 flex items-center justify-between cursor-pointer"
                    >
                      <span className="truncate">{educationLevel || "Select Academic Level"}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                          levelPickerOpen ? "rotate-180 text-cyan-300" : ""
                        }`}
                      />
                    </button>
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />

                    {levelPickerOpen && (
                      <div className="absolute z-30 mt-1.5 w-full rounded-2xl border border-white/20 bg-[#0c1527] shadow-[0_15px_35px_rgba(0,0,0,0.85)] py-1.5 max-h-60 overflow-y-auto backdrop-blur-xl">
                        {ACADEMIC_LEVEL_OPTIONS.map((opt) => {
                          const isSelected = educationLevel === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setEducationLevel(opt);
                                setLevelPickerOpen(false);
                              }}
                              className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium flex items-center justify-between transition-colors ${
                                isSelected
                                  ? "bg-cyan-500/20 text-cyan-300"
                                  : "text-slate-200 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <Check className="w-4 h-4 text-cyan-300 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
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
            )}

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Password
                </label>
                {mode === "signin" && (
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
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

            {/* Confirm Password for Signup */}
            {mode === "signup" && (
              <div>
                <label className={labelClass}>Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            {/* Terms Agreement Checkbox - only shown on signup */}
            {mode === "signup" && (
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
            )}

            {/* Minimal Smart Notice (No bright red boxes) */}
            {notice && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 leading-relaxed text-center">
                <span>{notice.text}</span>
                {notice.action && (
                  <div className="mt-1.5">
                    {notice.action.onAction ? (
                      <button
                        type="button"
                        onClick={notice.action.onAction}
                        className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium cursor-pointer"
                      >
                        {notice.action.label} →
                      </button>
                    ) : notice.action.href ? (
                      <Link
                        href={notice.action.href}
                        className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-medium"
                      >
                        {notice.action.label} →
                      </Link>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading || (mode === "signup" && !agreedToTerms)}
              className="w-full py-3.5 px-6 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2 transition-all cursor-pointer bg-cyan-400 text-slate-950 hover:bg-cyan-300 active:scale-[0.98] disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  {mode === "signin" ? "Signing In..." : "Creating Account..."}
                </span>
              ) : (
                <>
                  <span>{mode === "signin" ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Minimal Navigation Notice for Seamless Switching */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            {mode === "signin" ? (
              <p className="text-xs sm:text-sm text-slate-400">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setNotice(null);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-semibold ml-1 cursor-pointer"
                >
                  Create a free account
                </button>
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setNotice(null);
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 font-semibold ml-1 cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-[100dvh] flex items-start sm:items-center justify-center px-4 py-10 pb-44 overflow-y-auto"
          data-wta-spinner="true"
        >
          <BrandLoader size="md" label="Loading portal..." />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
