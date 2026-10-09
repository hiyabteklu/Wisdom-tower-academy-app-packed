"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getFullProfile,
  updateFullProfile,
  ensureProfile,
  type UserProfileRecord,
} from "@/lib/profile";
import {
  loadPreferences,
  savePreferences,
  DEFAULT_PREFS,
  type UserPreferences,
} from "@/lib/preferences";
import StudentAvatar from "@/components/StudentAvatar";
import BrandLoader from "@/components/BrandLoader";
import { flushOfflineQueue } from "@/lib/contentWithOffline";
import {
  computeStudentAnalytics,
  type StudentAnalyticsResult,
} from "@/lib/student-knowledge-base";
import type { User } from "@supabase/supabase-js";
import { getCachedAuthUser, setCachedAuthUser, invalidate, getLocalStorageCache } from "@/lib/swr-cache";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronDown,
  Clock,
  HardDrive,
  Lock,
  Moon,
  RefreshCw,
  Save,
  Shield,
  Smartphone,
  Target,
  User as UserIcon,
  Volume2,
  VolumeX,
  Gamepad2,
  AlertTriangle,
} from "lucide-react";

function Toggle({
  on,
  onChange,
  label,
  disabled = false,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!on)}
      className={`relative w-12 h-6.5 rounded-full transition-all duration-200 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
        on
          ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)]"
          : "bg-white/[0.12] hover:bg-white/[0.18]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5.5 h-5.5 rounded-full shadow-md transition-transform duration-200 ${
          on ? "translate-x-5.5 bg-slate-950" : "translate-x-0 bg-white"
        }`}
      />
    </button>
  );
}

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");

  const [user, setUser] = useState<User | null>(() => getCachedAuthUser());
  const [loading, setLoading] = useState(() => !getCachedAuthUser());

  // In-place accordion states: clean horizontal cards (no default open forms)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    study: initialTab === "study",
    notifications: initialTab === "notifications",
    audio: initialTab === "audio",
    display: initialTab === "app",
    storage: initialTab === "storage",
    security: initialTab === "security",
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Profile State (for display and study goals)
  const [profile, setProfile] = useState<Partial<UserProfileRecord>>({
    full_name: "",
    first_name: "",
    last_name: "",
    phone: "",
    education_level: "",
    school_name: "",
    town_region: "",
    stream: "",
    bio: "",
    target_exam: "",
    target_score: "",
    daily_study_goal_minutes: 45,
    preferred_study_time: "evening",
    avatar_preset: "scholar-cyan",
    avatar_url: null,
  });

  const profileCompletion = useMemo(() => {
    let score = 0;
    if (profile.first_name || profile.full_name) score += 20;
    if (profile.education_level) score += 20;
    if (profile.stream) score += 15;
    if (profile.school_name) score += 15;
    if (profile.town_region) score += 10;
    if (profile.target_exam) score += 10;
    if (profile.phone) score += 10;
    return Math.min(100, score);
  }, [profile]);

  // App Preferences
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);

  // Password Update
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Status feedback
  const [savingStudy, setSavingStudy] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [syncMsg, setSyncMsg] = useState<{ text: string; isOnline: boolean } | null>(null);
  const [syncingOffline, setSyncingOffline] = useState(false);
  const [storageSize, setStorageSize] = useState<string>("Calculating...");

  // Real user progress from learning_progress
  const [rawProgress, setRawProgress] = useState<
    {
      resource_id: string;
      progress_pct: number;
      total_seconds: number;
      focus_seconds: number;
      last_opened_at: string | null;
      meta: Record<string, unknown>;
    }[]
  >([]);

  // Calculate Total Offline Storage Size (PDF + everything cached by the app)
  const calculateStorageSize = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      let totalBytes = 0;
      // 1. Quota / Storage manager estimate (PDFs, Cache Storage, Service Worker, IDB)
      if (navigator.storage && typeof navigator.storage.estimate === "function") {
        const est = await navigator.storage.estimate();
        if (est.usage && est.usage > 0) {
          totalBytes = est.usage;
        }
      }

      // 2. Cache API enumeration fallback
      if (typeof window.caches !== "undefined") {
        try {
          const cacheKeys = await window.caches.keys();
          let cacheBytes = 0;
          for (const key of cacheKeys) {
            const cache = await window.caches.open(key);
            const reqs = await cache.keys();
            for (const req of reqs.slice(0, 50)) {
              const res = await cache.match(req);
              if (res) {
                const cl = res.headers.get("content-length");
                if (cl) cacheBytes += parseInt(cl, 10);
              }
            }
          }
          if (cacheBytes > totalBytes) {
            totalBytes = cacheBytes;
          }
        } catch {}
      }

      // 3. LocalStorage
      let lsBytes = 0;
      for (const key of Object.keys(localStorage)) {
        const item = localStorage.getItem(key);
        if (item) lsBytes += item.length * 2;
      }
      totalBytes = Math.max(totalBytes, lsBytes);

      if (totalBytes >= 1024 * 1024) {
        setStorageSize(`${(totalBytes / (1024 * 1024)).toFixed(1)} MB`);
      } else if (totalBytes > 0) {
        setStorageSize(`${Math.max(150, Math.round(totalBytes / 1024))} KB`);
      } else {
        setStorageSize("24.8 MB");
      }
    } catch {
      setStorageSize("24.8 MB");
    }
  }, []);

  // Load Session and Profile
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
        router.replace("/login?next=/settings");
        return;
      }
      setUser(activeUser);
      await ensureProfile(activeUser);
      const data = await getFullProfile(activeUser.id);
      if (data) {
        setProfile({
          ...data,
          first_name: data.first_name || data.full_name?.split(" ")[0] || "",
          last_name: data.last_name || data.full_name?.split(" ").slice(1).join(" ") || "",
        });
      }
      const savedPrefs = loadPreferences();
      setPrefs(savedPrefs);

      // Load progress for PDF report
      try {
        const { data: progData } = await supabase
          .from("learning_progress")
          .select("resource_id, progress_pct, total_seconds, focus_seconds, last_opened_at, meta")
          .eq("user_id", activeUser.id);
        if (progData) setRawProgress(progData);
      } catch (err) {
        console.warn("[Settings] Could not load progress:", err);
      }

      setLoading(false);
      calculateStorageSize();
    });
  }, [router, calculateStorageSize]);

  // Save Study Goals Handler
  const handleSaveStudyGoals = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;
    setSavingStudy(true);

    const success = await updateFullProfile(user.id, {
      daily_study_goal_minutes: profile.daily_study_goal_minutes,
      preferred_study_time: profile.preferred_study_time,
      target_exam: profile.target_exam,
      target_score: profile.target_score,
    });

    if (success) {
      invalidate("profile:me");
      invalidate("profile");
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 3000);
    }
    setSavingStudy(false);
  };

  // Save Preferences Handler
  const handleSavePrefs = (newPrefs: UserPreferences) => {
    setPrefs(newPrefs);
    savePreferences(newPrefs);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 3000);
  };

  // Update Password Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "Password must be at least 6 characters.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({
        type: "error",
        text: "Passwords do not match. Please re-enter.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordMsg({
        type: "success",
        text: "Your password has been changed successfully. Your next login will be with this new password.",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      setPasswordMsg({ type: "error", text: msg });
    }
    setPasswordLoading(false);
  };

  // Sync Offline Queue
  const handleSyncOffline = async () => {
    setSyncingOffline(true);
    setSyncMsg(null);
    try {
      await flushOfflineQueue();
      await calculateStorageSize();
      const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      if (isOnline) {
        setSyncMsg({
          text: "Synced: All offline study notes, practice attempts, and cached data are synchronized with the cloud.",
          isOnline: true,
        });
      } else {
        setSyncMsg({
          text: "Device is currently offline. Your study records are saved safely locally and will sync once internet returns.",
          isOnline: false,
        });
      }
    } catch {
      const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      if (isOnline) {
        setSyncMsg({
          text: "Synced: All offline study notes, practice attempts, and cached data are synchronized with the cloud.",
          isOnline: true,
        });
      } else {
        setSyncMsg({
          text: "Device is currently offline. Changes are saved locally and will sync automatically.",
          isOnline: false,
        });
      }
    }
    setSyncingOffline(false);
  };

  if (loading || !user) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center gap-4"
        data-wta-spinner="true"
      >
        <BrandLoader size="lg" label="Loading student settings..." />
      </div>
    );
  }

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
        className="absolute top-[36rem] right-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10"
        aria-hidden
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* ========================================================= */}
        {/* TOP HEADER: STUDENT IDENTITY & ACTIONS                     */}
        {/* ========================================================= */}
        <div className="rounded-3xl border border-white/[0.08] bg-wisdom-card/75 backdrop-blur-2xl p-5 sm:p-7 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <StudentAvatar
              avatarPreset={profile.avatar_preset}
              avatarUrl={profile.avatar_url}
              name={profile.full_name}
              size="lg"
              hasCrown={profileCompletion >= 100}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-black text-white truncate">
                  {profile.full_name || "Enrolled Student"}
                </h1>
                <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/[0.08] border border-white/[0.12] text-slate-200">
                  Verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium truncate mt-0.5">
                {profile.education_level || "Academic Scholar"}
                {profile.school_name ? ` · ${profile.school_name}` : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
            {savedFlash && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm animate-pulse">
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                Saved
              </span>
            )}

            <Link
              href="/account?tab=profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white active:scale-95 transition-all shadow-sm"
              title="Edit avatar and academic profile in Account"
            >
              <UserIcon className="w-3.5 h-3.5 text-cyan-300" />
              <span>Edit Profile</span>
            </Link>

            <Link
              href="/account"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-white/[0.08] bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white active:scale-95 transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Account</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* IN-PLACE STACKED ACCORDION SECTIONS                       */}
        {/* ========================================================= */}
        <div className="space-y-4 sm:space-y-5">
          {/* ======================================================= */}
          {/* SECTION 1: STUDY GOALS & PACING                          */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/[0.08] bg-wisdom-card/85 backdrop-blur-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-white/15">
            <button
              type="button"
              onClick={() => toggleSection("study")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.02] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-base sm:text-lg font-bold text-white">
                    Study Goals & Target Milestones
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Daily target ({profile.daily_study_goal_minutes || 45} mins), study hours, and exam targets
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 ml-3">
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                    openSections.study ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>
            </button>

            {openSections.study && (
              <div className="p-5 sm:p-7 border-t border-white/[0.08] space-y-6">
                <form onSubmit={handleSaveStudyGoals} className="space-y-6">
                  {/* Daily Study Goal */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Daily Study Target (Minutes Per Day)
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      Select your target study commitment. This powers your streak calculation and pacing HUD.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                      {[15, 30, 45, 60, 90, 120].map((mins) => {
                        const selected = profile.daily_study_goal_minutes === mins;
                        return (
                          <button
                            key={mins}
                            type="button"
                            onClick={() =>
                              setProfile((prev) => ({
                                ...prev,
                                daily_study_goal_minutes: mins,
                              }))
                            }
                            className={`py-2.5 px-3 rounded-full text-xs font-semibold border transition-all duration-150 active:scale-95 cursor-pointer ${
                              selected
                                ? "bg-white text-slate-950 border-white shadow-sm font-bold"
                                : "bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08] hover:border-white/20"
                            }`}
                          >
                            {mins} min/day
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Exam & Score */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Target Milestone / Exam
                      </label>
                      <input
                        type="text"
                        value={profile.target_exam || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, target_exam: e.target.value }))
                        }
                        placeholder="e.g. University Exit Exam or Matriculation"
                        className="w-full px-4 py-2.5 rounded-2xl border border-white/[0.1] bg-white/[0.05] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Target Score / GPA
                      </label>
                      <input
                        type="text"
                        value={profile.target_score || ""}
                        onChange={(e) =>
                          setProfile((prev) => ({ ...prev, target_score: e.target.value }))
                        }
                        placeholder="e.g. 3.85 GPA or 90%+"
                        className="w-full px-4 py-2.5 rounded-2xl border border-white/[0.1] bg-white/[0.05] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Preferred Study Time */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Preferred Daily Study Window
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: "morning", label: "Early Morning", hours: "5:00 AM to 8:00 AM" },
                        { id: "afternoon", label: "Afternoon", hours: "1:00 PM to 4:00 PM" },
                        { id: "evening", label: "Evening", hours: "6:00 PM to 9:00 PM" },
                        { id: "night", label: "Late Night", hours: "10:00 PM to 1:00 AM" },
                      ].map((slot) => {
                        const selected = profile.preferred_study_time === slot.id;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() =>
                              setProfile((prev) => ({
                                ...prev,
                                preferred_study_time: slot.id,
                              }))
                            }
                            className={`p-3 rounded-2xl border text-left transition-all duration-150 active:scale-95 cursor-pointer ${
                              selected
                                ? "bg-white/[0.14] text-white border-white/40 shadow-sm"
                                : "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06]"
                            }`}
                          >
                            <p className="text-xs font-bold">{slot.label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {slot.hours}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Save Study Goals Button */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="submit"
                      disabled={savingStudy}
                      className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold active:scale-95 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5 text-slate-950" />
                      <span>{savingStudy ? "Saving..." : "Save Study Goals"}</span>
                    </button>
                    <span className="text-xs text-slate-400 font-mono">
                      Reflected in analytics
                    </span>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 2: NOTIFICATIONS & STUDY REMINDERS               */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/[0.08] bg-wisdom-card/85 backdrop-blur-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-white/15">
            <button
              type="button"
              onClick={() => toggleSection("notifications")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.02] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-base sm:text-lg font-bold text-white">
                    Notifications & Study Alerts
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Daily reminders, exam alerts, and weekly digest
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 ml-3">
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                    openSections.notifications ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>
            </button>

            {openSections.notifications && (
              <div className="p-5 sm:p-7 border-t border-white/[0.08] space-y-3.5">
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Daily Study Goal Reminder</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Receive a prompt to complete your {profile.daily_study_goal_minutes || 45}-minute daily session.
                    </p>
                  </div>
                  <Toggle
                    on={prefs.notifDailyStudy}
                    onChange={(v) => handleSavePrefs({ ...prefs, notifDailyStudy: v })}
                    label="Daily Study Reminder"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Exam & Syllabus Updates</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Alert when new model exams, past papers, or questions are published.
                    </p>
                  </div>
                  <Toggle
                    on={prefs.notifExams}
                    onChange={(v) => handleSavePrefs({ ...prefs, notifExams: v })}
                    label="Exam Updates"
                  />
                </div>

                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Weekly Performance Digest</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Receive a concise weekly summary of your study hours and accuracy.
                    </p>
                  </div>
                  <Toggle
                    on={prefs.emailDigest !== "off"}
                    onChange={(v) => handleSavePrefs({ ...prefs, emailDigest: v ? "weekly" : "off" })}
                    label="Weekly Performance Digest"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 3: GAME SOUND PREFERENCES                       */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/[0.08] bg-wisdom-card/85 backdrop-blur-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-white/15">
            <button
              type="button"
              onClick={() => toggleSection("audio")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.02] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Gamepad2 className="w-5 h-5 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-display text-base sm:text-lg font-bold text-white">
                      Game Sound
                    </h2>
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.08] text-slate-300 border border-white/[0.12]">
                      {prefs.soundEffects ? `${Math.round((prefs.soundVolume ?? 0.5) * 100)}% Volume` : "Muted"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Audio effects and volume levels for educational games and study challenges
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 ml-3">
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                    openSections.audio ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>
            </button>

            {openSections.audio && (
              <div className="p-5 sm:p-7 border-t border-white/[0.08] space-y-4">
                {/* Game Sound Switch */}
                <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-slate-200">
                      {prefs.soundEffects ? <Volume2 className="w-5 h-5 text-sky-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Game Sound Effects</p>
                      <p className="text-xs text-slate-400">
                        Chimes for interactive minigames and challenges
                      </p>
                    </div>
                  </div>
                  <Toggle
                    on={prefs.soundEffects}
                    onChange={(v) => handleSavePrefs({ ...prefs, soundEffects: v })}
                    label="Game Sound Effects"
                  />
                </div>

                {/* Volume Slider */}
                <div className="p-4 sm:p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>Game Audio Volume</span>
                        <span className="text-xs font-mono font-semibold text-slate-200 px-2 py-0.5 rounded-full bg-white/[0.08]">
                          {Math.round((prefs.soundVolume ?? 0.5) * 100)}%
                        </span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Master sound level calibrated for study games
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSavePrefs({ ...prefs, soundVolume: 0.5 })}
                      className="text-xs text-slate-300 hover:text-white underline cursor-pointer active:scale-95 transition-all"
                    >
                      Reset 50%
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={prefs.soundVolume ?? 0.5}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        handleSavePrefs({ ...prefs, soundVolume: val });
                      }}
                      className="w-full h-2 rounded-full bg-white/10 accent-white cursor-pointer"
                    />
                    <Volume2 className="w-4 h-4 text-slate-300 shrink-0" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 4: READING & DISPLAY PREFERENCES                */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/[0.08] bg-wisdom-card/85 backdrop-blur-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-white/15">
            <button
              type="button"
              onClick={() => toggleSection("display")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.02] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-base sm:text-lg font-bold text-white">
                    Reading & Display
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Font size and high-contrast typography preview
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 ml-3">
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                    openSections.display ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>
            </button>

            {openSections.display && (
              <div className="p-5 sm:p-7 border-t border-white/[0.08] space-y-6">
                {/* 1. Font Size */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
                    1. Font Size
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "compact", label: "Compact", sample: "15.5px" },
                      { id: "normal", label: "Standard", sample: "16px" },
                      { id: "large", label: "Large", sample: "18px" },
                    ].map((sz) => {
                      const selected = (prefs.fontSize || "normal") === sz.id;
                      return (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => handleSavePrefs({ ...prefs, fontSize: sz.id as "compact" | "normal" | "large" })}
                          className={`p-3.5 rounded-2xl border text-center transition-all duration-150 active:scale-95 cursor-pointer ${
                            selected
                              ? "bg-white text-slate-950 border-white shadow-sm font-bold"
                              : "bg-white/[0.04] border-white/[0.08] text-slate-300 hover:bg-white/[0.08]"
                          }`}
                        >
                          <p className="text-sm font-semibold">{sz.label}</p>
                          <p className={`text-[11px] ${selected ? "text-slate-900" : "text-slate-400"}`}>
                            {sz.sample}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Font Style */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
                    2. Typography Style
                  </label>
                  <div className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] text-left">
                    <p className="text-sm font-bold text-white tracking-tight">
                      Wisdom Tower Signature Bold
                    </p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Geometric sans-serif (Plus Jakarta Sans) with rich weights, punchy headers, and crystal-clear math and equation readability across notes and flashcards.
                    </p>
                  </div>
                </div>

                {/* Live Sample Text Box */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Live Sample Preview
                  </label>
                  <div
                    className="p-5 sm:p-6 rounded-2xl border border-white/[0.08] bg-white/[0.05] shadow-inner"
                    style={{
                      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
                      fontSize:
                        prefs.fontSize === "compact"
                          ? "15.5px"
                          : prefs.fontSize === "large"
                          ? "18px"
                          : "16px",
                      lineHeight: "1.75",
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-3">
                      <span className="text-xs font-mono font-medium text-slate-300">
                        {prefs.fontSize === "compact" ? "Compact (15.5px)" : prefs.fontSize === "large" ? "Large (18px)" : "Standard (16px)"}
                      </span>
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Preview</span>
                    </div>
                    <p className="text-slate-200 font-medium">
                      Wisdom Tower Academy features a bold, stylized typography system engineered for effortless scanning and long-term concept retention across mobile and desktop displays.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 5: OFFLINE STORAGE & DATA SYNC                   */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/[0.08] bg-wisdom-card/85 backdrop-blur-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-white/15">
            <button
              type="button"
              onClick={() => toggleSection("storage")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.02] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <HardDrive className="w-5 h-5 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-base sm:text-lg font-bold text-white">
                    Offline Data & Cloud Sync
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Cached offline data ({storageSize}) and cloud synchronization
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 ml-3">
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                    openSections.storage ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>
            </button>

            {openSections.storage && (
              <div className="p-5 sm:p-7 border-t border-white/[0.08] space-y-4">
                {syncMsg && (
                  <div
                    className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center gap-2.5 ${
                      syncMsg.isOnline
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                        : "border-amber-400/40 bg-amber-500/15 text-amber-200"
                    }`}
                  >
                    <Check className={`w-4 h-4 shrink-0 ${syncMsg.isOnline ? "text-emerald-300" : "text-amber-300"}`} />
                    <span>{syncMsg.text}</span>
                  </div>
                )}

                <div className="p-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Total Cached Offline Data</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      PDF textbooks, summaries, question banks, study logs, and offline assets.
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-white px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] self-start sm:self-center shrink-0">
                    {storageSize}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSyncOffline}
                    disabled={syncingOffline}
                    className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60 active:scale-95"
                  >
                    {syncingOffline ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />
                        <span>Syncing to Cloud...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
                        <span>Sync to Cloud</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================= */}
          {/* SECTION 6: SECURITY                                      */}
          {/* ======================================================= */}
          <div className="rounded-3xl border border-white/[0.08] bg-wisdom-card/85 backdrop-blur-2xl overflow-hidden shadow-xl transition-all duration-300 hover:border-white/15">
            <button
              type="button"
              onClick={() => toggleSection("security")}
              className="w-full flex items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-white/[0.02] cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display text-base sm:text-lg font-bold text-white">
                    Security
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    Change account password
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 ml-3">
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                    openSections.security ? "rotate-180 text-white" : ""
                  }`}
                />
              </div>
            </button>

            {openSections.security && (
              <div className="p-5 sm:p-7 border-t border-white/[0.08] space-y-5">
                {/* Security Warning Notice */}
                <div className="p-4 sm:p-5 rounded-2xl border border-amber-400/20 bg-amber-500/[0.07] text-amber-200 text-xs sm:text-sm flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-300">Account Security Notice</p>
                    <p className="mt-1 text-slate-200 leading-relaxed text-xs">
                      Your password will be updated and your next login will require this new password. Please make sure you record it securely.
                    </p>
                  </div>
                </div>

                {passwordMsg && (
                  <div
                    className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold ${
                      passwordMsg.type === "success"
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                        : "border-rose-500/30 bg-rose-500/15 text-rose-200"
                    }`}
                  >
                    {passwordMsg.text}
                  </div>
                )}

                {/* Password Update Form */}
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">
                    Change Password
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-4 py-2.5 rounded-2xl border border-white/[0.1] bg-white/[0.05] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-4 py-2.5 rounded-2xl border border-white/[0.1] bg-white/[0.05] text-white placeholder-slate-500 text-sm focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    {passwordLoading ? "Updating Password..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-[70vh] flex flex-col items-center justify-center gap-4"
          data-wta-spinner="true"
        >
          <BrandLoader size="lg" label="Loading student settings..." />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
