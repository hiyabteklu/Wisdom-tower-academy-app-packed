import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ACADEMIC_LEVEL_OPTIONS, applyDefaultPackagesForLevel } from "@/lib/academic-levels";

export interface UserProfileRecord {
  id: string;
  email: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  education_level: string | null;
  school_name: string | null;
  town_region: string | null;
  stream: string | null;
  bio: string | null;
  target_exam: string | null;
  target_score: string | null;
  daily_study_goal_minutes: number;
  preferred_study_time: string | null;
  avatar_preset: string | null;
  avatar_url: string | null;
  hear_about?: string | null;
  account_intent?: string | null;
  profile_completed?: boolean;
  amoled_mode?: boolean;
  font_size_preference?: string;
  data_saver_mode?: boolean;
  sound_effects_enabled?: boolean;
  student_id_number?: string | null;
  id_issued_at?: string | null;
  id_expires_at?: string | null;
  active_academic_scope?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AvatarPreset {
  id: string;
  name: string;
  role: string;
  gradient: string;
  border: string;
  glow: string;
  initials: string;
  iconName: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  {
    id: "scholar-cyan",
    name: "Apex Scholar",
    role: "Academic Excellence",
    gradient: "from-cyan-500 via-sky-600 to-blue-700",
    border: "border-cyan-400",
    glow: "shadow-cyan-500/30",
    initials: "AS",
    iconName: "GraduationCap",
  },
  {
    id: "engineer-amber",
    name: "Architect & Engineer",
    role: "Engineering & Tech",
    gradient: "from-amber-400 via-orange-500 to-amber-600",
    border: "border-amber-400",
    glow: "shadow-amber-500/30",
    initials: "AE",
    iconName: "Cpu",
  },
  {
    id: "scientist-emerald",
    name: "Natural Scientist",
    role: "Research & Discovery",
    gradient: "from-emerald-400 via-teal-600 to-cyan-700",
    border: "border-emerald-400",
    glow: "shadow-emerald-500/30",
    initials: "NS",
    iconName: "Atom",
  },
  {
    id: "doctor-rose",
    name: "Medical Pioneer",
    role: "Health & Medicine",
    gradient: "from-rose-500 via-pink-600 to-red-700",
    border: "border-rose-400",
    glow: "shadow-rose-500/30",
    initials: "MP",
    iconName: "HeartPulse",
  },
  {
    id: "coder-violet",
    name: "Software Innovator",
    role: "Computing & AI",
    gradient: "from-purple-500 via-violet-600 to-indigo-700",
    border: "border-purple-400",
    glow: "shadow-purple-500/30",
    initials: "SI",
    iconName: "Code2",
  },
  {
    id: "astronomer-sky",
    name: "Cosmic Explorer",
    role: "Physics & Astronomy",
    gradient: "from-sky-400 via-blue-600 to-indigo-800",
    border: "border-sky-400",
    glow: "shadow-sky-500/30",
    initials: "CE",
    iconName: "Compass",
  },
  {
    id: "lawyer-gold",
    name: "Social Thinker",
    role: "Social Sciences & Law",
    gradient: "from-yellow-400 via-amber-500 to-stone-700",
    border: "border-yellow-400",
    glow: "shadow-yellow-500/30",
    initials: "ST",
    iconName: "Scale",
  },
  {
    id: "visionary-neon",
    name: "Future Leader",
    role: "Leadership & Impact",
    gradient: "from-fuchsia-500 via-pink-500 to-orange-500",
    border: "border-fuchsia-400",
    glow: "shadow-fuchsia-500/30",
    initials: "FL",
    iconName: "Zap",
  },
];

export const ETHIOPIAN_REGIONS = [
  "Addis Ababa",
  "Oromia",
  "Amhara",
  "Tigray",
  "Sidama",
  "Central Ethiopia",
  "South Ethiopia",
  "South West Ethiopia",
  "Dire Dawa",
  "Harari",
  "Somali",
  "Afar",
  "Benishangul-Gumuz",
  "Gambela",
] as const;

export const EDUCATION_LEVELS = ACADEMIC_LEVEL_OPTIONS;

export const ACADEMIC_STREAMS = [
  "Natural Science",
  "Social Science",
  "Electrical & Computer Engineering (ECE)",
  "Software Engineering / Computer Science",
  "Civil / Mechanical Engineering",
  "Medicine / Health Sciences",
  "Accounting & Finance",
  "Economics & Management",
  "Law & Jurisprudence",
  "General / Undeclared",
] as const;

/** Upsert the signed-in user into public.profiles so admin can list registered users */
export async function ensureProfile(user: User) {
  if (!user?.id) return;

  const meta = user.user_metadata || {};
  const firstName = meta.first_name || null;
  const lastName = meta.last_name || null;
  const fullName =
    meta.full_name ||
    meta.name ||
    (firstName && lastName ? `${firstName} ${lastName}` : null) ||
    (user.email && !user.email.endsWith("@phone.wta.local")
      ? user.email.split("@")[0]
      : null);

  const phone = meta.phone || null;
  const educationLevel = meta.education_level || null;
  const email =
    user.email && !user.email.endsWith("@phone.wta.local") ? user.email : null;
  const avatarUrl = meta.avatar_url || meta.picture || null;

  const row: Record<string, unknown> = {
    id: user.id,
    full_name: fullName,
    avatar_url: avatarUrl,
    updated_at: new Date().toISOString(),
  };

  if (email) row.email = email;
  if (phone) row.phone = phone;
  if (firstName) row.first_name = firstName;
  if (lastName) row.last_name = lastName;
  if (educationLevel) row.education_level = educationLevel;

  try {
    const { error } = await supabase.from("profiles").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn("[ensureProfile]", error.message);
    }
  } catch (err) {
    console.warn("[ensureProfile] failed silently:", err);
  }
}

/** Fetch full profile record from public.profiles with localStorage fallback */
export async function getFullProfile(userId: string): Promise<UserProfileRecord | null> {
  if (!userId) return null;
  
  // Try remote database first if available
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      // Sync to local cache
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(`wt_profile_${userId}`, JSON.stringify(data));
        } catch {}
      }
      return data as UserProfileRecord;
    }
  } catch (err) {
    console.warn("[getFullProfile] error:", err);
  }

  // Fallback to local profile cache
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(`wt_profile_${userId}`);
      if (raw) return JSON.parse(raw) as UserProfileRecord;
    } catch {}
  }

  return null;
}

/** Update profile in public.profiles and auth user metadata synchronously */
export async function updateFullProfile(
  userId: string,
  updates: Partial<UserProfileRecord>
): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: "No user authenticated" };

  try {
    const cleanedUpdates: Record<string, unknown> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // If education_level is changed, update My Learning packages accordingly
    if (updates.education_level) {
      applyDefaultPackagesForLevel(updates.education_level);
    }

    // Always update local cache
    if (typeof window !== "undefined") {
      try {
        const existing = await getFullProfile(userId);
        const merged = { ...(existing || { id: userId }), ...cleanedUpdates };
        window.localStorage.setItem(`wt_profile_${userId}`, JSON.stringify(merged));
      } catch {}
    }

    // Update in database table
    try {
      const { error: dbError } = await supabase
        .from("profiles")
        .update(cleanedUpdates)
        .eq("id", userId);

      if (dbError) {
        console.warn("[updateFullProfile] DB error:", dbError.message);
      }
    } catch {}

    // Sync essential metadata to Supabase Auth User object
    const authMeta: Record<string, unknown> = {};
    if (updates.full_name) authMeta.full_name = updates.full_name;
    if (updates.first_name) authMeta.first_name = updates.first_name;
    if (updates.last_name) authMeta.last_name = updates.last_name;
    if (updates.phone) authMeta.phone = updates.phone;
    if (updates.education_level) authMeta.education_level = updates.education_level;
    if (updates.avatar_url) authMeta.avatar_url = updates.avatar_url;
    if (updates.avatar_preset) authMeta.avatar_preset = updates.avatar_preset;
    if (updates.bio) authMeta.bio = updates.bio;
    if (updates.school_name) authMeta.school_name = updates.school_name;
    if (updates.stream) authMeta.stream = updates.stream;
    if (updates.target_exam) authMeta.target_exam = updates.target_exam;

    try {
      await supabase.auth.updateUser({ data: authMeta });
    } catch {}

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Profile update failed",
    };
  }
}
