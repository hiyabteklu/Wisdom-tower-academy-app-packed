"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";
import { ensureProfile, getFullProfile, type UserProfileRecord } from "@/lib/profile";
import { computeStudentId, persistStudentIdIfNeeded, type StudentIdData } from "@/lib/student-id";
import StudentIdCard from "@/components/StudentIdCard";
import ProfileCompletionPanel from "@/components/account/ProfileCompletionPanel";
import BrandLoader from "@/components/BrandLoader";
import { listMyOrders, type ManualOrder } from "@/lib/orders";
import type { User } from "@supabase/supabase-js";
import {
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  LogOut,
  Settings2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { useCachedQuery } from "@/hooks/useCachedQuery";
import { getCachedAuthUser, setCachedAuthUser, clearAllSwrCache } from "@/lib/swr-cache";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(() => getCachedAuthUser());
  const [copiedFolio, setCopiedFolio] = useState(false);

  // User session sync
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      let activeUser = session?.user;
      if (!activeUser && typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("wt-academy-auth-v1");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.user) activeUser = parsed.user;
          }
        } catch {}
      }

      if (!activeUser) {
        router.replace("/login?next=/account");
        return;
      }

      setCachedAuthUser(activeUser);
      setUser(activeUser);
      await ensureProfile(activeUser);
    });
  }, [router]);

  // Fetch full profile with user-scoped SWR caching
  const fetchProfile = useCallback(async (): Promise<UserProfileRecord | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const uid = session?.user?.id || user?.id;
    if (!uid) return null;

    const full = await getFullProfile(uid);
    if (full && !full.student_id_number) {
      const assigned = await persistStudentIdIfNeeded(uid, full.student_id_number);
      full.student_id_number = assigned;
    }
    return full;
  }, [user?.id]);

  const {
    data: profile = null,
    isLoading: isProfileLoading,
    refresh: refreshProfile,
  } = useCachedQuery<UserProfileRecord | null>("profile:me", fetchProfile, {
    scope: "user",
    enabled: Boolean(user?.id),
  });

  // Fetch orders with user-scoped SWR caching
  const { data: orders = [] } = useCachedQuery<ManualOrder[]>(
    "orders:mine",
    listMyOrders,
    {
      scope: "user",
      enabled: Boolean(user?.id),
    }
  );

  const loading = !user && isProfileLoading;

  const displayName = useMemo(() => {
    return (
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Student Scholar"
    );
  }, [profile, user]);

  const idData: StudentIdData = useMemo(() => {
    return computeStudentId(profile || null, user?.created_at);
  }, [profile, user?.created_at]);

  // Check if profile is 100% completed to unlock golden avatar crown
  const profileCompleted = useMemo(() => {
    let score = 0;
    if (profile?.first_name || profile?.full_name) score += 20;
    if (profile?.education_level) score += 20;
    if (profile?.stream) score += 15;
    if (profile?.school_name) score += 15;
    if (profile?.town_region) score += 10;
    if (profile?.target_exam) score += 10;
    if (profile?.phone) score += 10;
    return score >= 100;
  }, [profile]);

  const handleCopyFolio = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(idData.folioNumber);
      setCopiedFolio(true);
      setTimeout(() => setCopiedFolio(false), 2000);
    }
  };

  const handleLogout = async () => {
    clearAllSwrCache();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  if (loading || !user) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center gap-4"
        data-wta-spinner="true"
      >
        <BrandLoader size="lg" label="Loading student command center..." />
      </div>
    );
  }

  const isAdmin = isAdminEmail(user.email);

  return (
    <div className="relative min-h-[90vh] py-8 sm:py-12 md:py-16 overflow-hidden">
      {/* Ambient background glows for soft depth and glass surfaces */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-[42rem] h-[22rem] bg-gradient-to-r from-sky-500/10 via-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden
      />
      <div
        className="absolute top-96 left-1/4 w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none -z-10"
        aria-hidden
      />
      <div
        className="absolute top-[32rem] right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10"
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        {/* ========================================================= */}
        {/* TOP HERO: DIGITAL STUDENT ID & SPACIOUS FLOATING TOOLBAR   */}
        {/* ========================================================= */}
        <section className="flex flex-col items-center gap-7 sm:gap-8">
          {/* Centered Digital Student ID Card */}
          <div className="w-full max-w-md mx-auto">
            <StudentIdCard
              idData={idData}
              studentName={displayName}
              avatarPreset={profile?.avatar_preset}
              avatarUrl={profile?.avatar_url}
              educationLevel={profile?.education_level}
              stream={profile?.stream}
              schoolName={profile?.school_name}
              region={profile?.town_region}
              hasCrown={profileCompleted}
            />
          </div>

          {/* Floating Glassmorphic Pill Control Bar */}
          <div className="w-full max-w-2xl mx-auto rounded-3xl sm:rounded-full border border-white/10 bg-wisdom-card/80 backdrop-blur-2xl p-2.5 sm:p-3 shadow-lg flex flex-wrap items-center justify-between gap-3">
            {/* Folio Pill with Circular Copy Button */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
              <span className="text-[11px] text-slate-400 font-medium">Folio</span>
              <span className="text-xs font-mono font-bold text-white tracking-wider">
                {idData.folioNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyFolio}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-transparent hover:border-cyan-400/30 flex items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer"
                title="Copy Student Folio"
                aria-label="Copy Student Folio"
              >
                {copiedFolio ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Pill Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/learning?tool=analytics"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-cyan-200 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 hover:border-cyan-400/50 shadow-sm transition-all duration-200 active:scale-95"
              >
                <TrendingUp className="w-3.5 h-3.5 text-cyan-300" />
                <span>Your status</span>
              </Link>

              <Link
                href="/learning"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-sm transition-all duration-200 active:scale-95"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Learning Hub</span>
              </Link>

              <Link
                href="/settings"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-slate-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-cyan-400/40 shadow-sm transition-all duration-200 active:scale-95"
              >
                <Settings2 className="w-3.5 h-3.5 text-cyan-300" />
                <span>Preferences</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/[0.08] hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-400/40 transition-all duration-200 active:scale-95 cursor-pointer"
                title="Sign out of your account"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Log Out</span>
              </button>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold text-purple-200 hover:text-white bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 transition-all duration-200 active:scale-95"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* COMPLETE YOUR PROFILE                                     */}
        {/* ========================================================= */}
        <ProfileCompletionPanel
          user={user}
          initialProfile={profile || null}
          onProfileUpdated={(_updated) => {
            void refreshProfile();
          }}
        />
      </div>
    </div>
  );
}
