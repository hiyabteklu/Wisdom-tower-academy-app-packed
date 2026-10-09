"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import BrandLoader from "@/components/BrandLoader";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const establishRecoverySession = async () => {
      try {
        // 1. Try PKCE flow: ?code=...
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setError(error.message || "Invalid or expired reset link. Please request a new one.");
            setCheckingSession(false);
            return;
          }
          // Clean the URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setSessionReady(true);
          setCheckingSession(false);
          return;
        }

        // 2. Try hash fragment flow: #access_token=...&refresh_token=...&type=recovery
        const hash = window.location.hash.substring(1);
        if (hash) {
          const params = new URLSearchParams(hash);
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");
          const type = params.get("type");

          if (accessToken && refreshToken && (type === "recovery" || type === "invite" || !type)) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              setError(error.message || "Invalid or expired reset link. Please request a new one.");
              setCheckingSession(false);
              return;
            }

            // Clean the URL (remove the sensitive hash)
            window.history.replaceState({}, document.title, window.location.pathname);
            setSessionReady(true);
            setCheckingSession(false);
            return;
          }

          // 3. token_hash style (some email templates)
          const tokenHash = params.get("token_hash") || searchParams.get("token_hash");
          if (tokenHash) {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: "recovery",
            });

            if (error) {
              setError(error.message || "Invalid or expired reset link. Please request a new one.");
              setCheckingSession(false);
              return;
            }

            window.history.replaceState({}, document.title, window.location.pathname);
            setSessionReady(true);
            setCheckingSession(false);
            return;
          }
        }

        // 4. Fallback: check if a session already exists (e.g. user refreshed the page)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSessionReady(true);
        } else {
          setError("Reset link is invalid or has expired. Please request a new password reset.");
        }
      } catch (err) {
        console.error("Recovery session error:", err);
        setError("Something went wrong while validating the reset link. Please try again.");
      } finally {
        setCheckingSession(false);
      }
    };

    establishRecoverySession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!sessionReady) {
      setError("No valid recovery session. Please request a new password reset link.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Optional: sign out so they must log in with the new password
    await supabase.auth.signOut();

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 2500);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md text-center">
          <div className="bg-wisdom-card border border-white/5 rounded-2xl p-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Password updated!</h2>
            <p className="text-wisdom-muted mb-4">
              Your password has been successfully changed. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-wisdom-cyan to-wisdom-cyan-dark text-wisdom-dark font-bold text-xl mb-4">
            WT
          </div>
          <h1 className="text-3xl font-bold mb-2">Set new password</h1>
          <p className="text-wisdom-muted">Enter your new password below</p>
        </div>

        <div className="bg-wisdom-card border border-white/5 rounded-2xl p-8 shadow-xl">
          {checkingSession ? (
            <div
              className="flex flex-col items-center justify-center py-8 gap-3"
              data-wta-spinner="true"
            >
              <BrandLoader size="md" label="Validating reset link..." />
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!sessionReady}
                    className="w-full pl-11 pr-12 py-3 rounded-xl bg-wisdom-dark border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors disabled:opacity-50"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-wisdom-muted hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wisdom-muted" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!sessionReady}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-wisdom-dark border border-white/10 focus:border-wisdom-cyan focus:outline-none focus:ring-1 focus:ring-wisdom-cyan transition-colors disabled:opacity-50"
                    placeholder="Repeat your password"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !sessionReady}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-wisdom-cyan text-wisdom-dark font-semibold hover:bg-wisdom-cyan-dark transition-colors disabled:opacity-60"
              >
                {loading ? (
                  "Updating..."
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
            >
              Back to Sign In
            </Link>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all active:scale-95"
            >
              Request new link
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
