import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { authEmailFromIdentifier } from "@/lib/authIdentity";
import { applyDefaultPackagesForLevel } from "@/lib/academic-levels";
import type { User } from "@supabase/supabase-js";

export interface ScholarAccount {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  educationLevel: string;
  passwordHash: string; // Base64 encoded simple hash for local credential verification
  createdAt: string;
}

const STORAGE_SCHOLARS_KEY = "wt_scholar_directory_v2";
const STORAGE_AUTH_SESSION_KEY = "wt-academy-auth-v1";

function hashPassword(pwd: string): string {
  if (typeof window === "undefined") return pwd;
  try {
    return btoa(unescape(encodeURIComponent(pwd)));
  } catch {
    return pwd;
  }
}

export function getLocalScholarAccounts(): ScholarAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_SCHOLARS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalScholarAccount(account: ScholarAccount) {
  if (typeof window === "undefined") return;
  try {
    const existing = getLocalScholarAccounts().filter(
      (a) => a.email !== account.email && (!a.phone || a.phone !== account.phone)
    );
    existing.push(account);
    window.localStorage.setItem(STORAGE_SCHOLARS_KEY, JSON.stringify(existing));
  } catch {
    /* ignore */
  }
}

export function findLocalScholar(
  identifier: string
): ScholarAccount | undefined {
  const accounts = getLocalScholarAccounts();
  const trimmed = identifier.trim().toLowerCase();
  const digitsOnly = identifier.replace(/\D/g, "");

  let parsedEmail = trimmed;
  let parsedPhone: string | null = null;
  try {
    const res = authEmailFromIdentifier(identifier);
    parsedEmail = res.email.toLowerCase();
    parsedPhone = res.phone;
  } catch {
    /* fallback to raw trimmed */
  }

  // 1. Check existing accounts in directory
  const found = accounts.find((a) => {
    const aEmail = a.email.toLowerCase();
    const aPhoneDigits = (a.phone || "").replace(/\D/g, "");
    if (aEmail === parsedEmail || aEmail === trimmed) return true;
    if (parsedPhone && a.phone && a.phone === parsedPhone) return true;
    if (digitsOnly.length >= 9 && aPhoneDigits.length >= 9) {
      if (aPhoneDigits.endsWith(digitsOnly.slice(-9)) || digitsOnly.endsWith(aPhoneDigits.slice(-9))) {
        return true;
      }
    }
    return false;
  });

  if (found) return found;

  // 2. Fallback: Check existing session in localStorage
  if (typeof window !== "undefined") {
    try {
      const rawSession = window.localStorage.getItem(STORAGE_AUTH_SESSION_KEY);
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        const u = parsed?.user;
        if (u && (u.email || u.phone)) {
          const uEmail = (u.email || "").toLowerCase();
          const uPhone = (u.phone || u.user_metadata?.phone || "").replace(/\D/g, "");
          const matchesEmail = uEmail && (uEmail === parsedEmail || uEmail === trimmed);
          const matchesPhone = digitsOnly.length >= 9 && uPhone && (uPhone.endsWith(digitsOnly.slice(-9)) || digitsOnly.endsWith(uPhone.slice(-9)));

          if (matchesEmail || matchesPhone) {
            const recovered: ScholarAccount = {
              id: u.id || `wta_${Date.now()}`,
              email: u.email || parsedEmail,
              phone: u.phone || parsedPhone,
              fullName: u.user_metadata?.full_name || "Student Scholar",
              educationLevel: u.user_metadata?.education_level || "Freshman",
              passwordHash: "", // Will allow login or set on first entry
              createdAt: u.created_at || new Date().toISOString(),
            };
            saveLocalScholarAccount(recovered);
            return recovered;
          }
        }
      }
    } catch {
      /* ignore */
    }
  }

  return undefined;
}

/**
 * Creates and writes a Supabase-compatible session directly to localStorage
 * so that supabase.auth.getSession(), AccountPage, Settings, and Learning immediately recognize the active session.
 */
export function persistScholarSession(
  account: {
    id: string;
    email: string;
    fullName: string;
    educationLevel: string;
    phone?: string | null;
  },
  realTokens?: {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    expires_in?: number;
  }
) {
  if (typeof window === "undefined") return;

  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = realTokens?.expires_at ?? nowSec + 60 * 60 * 24 * 30; // 30 days

  // Use real JWT token from Supabase Auth if available.
  // CRITICAL: NEVER invent synthetic HMAC signatures (e.g. btoa("sig_...")) as that triggers
  // PostgREST 401 "No suitable key or wrong key type" on every database query.
  const hasValidRealToken =
    typeof realTokens?.access_token === "string" &&
    realTokens.access_token.split(".").length === 3 &&
    !realTokens.access_token.includes("sig_") &&
    !realTokens.access_token.includes("c2lnX");

  const accessToken = hasValidRealToken ? realTokens!.access_token! : "";
  const refreshToken = realTokens?.refresh_token || "";

  const sessionPayload = {
    access_token: accessToken,
    token_type: "bearer",
    expires_in: realTokens?.expires_in ?? 60 * 60 * 24 * 30,
    expires_at: expSec,
    refresh_token: refreshToken,
    user: {
      id: account.id,
      aud: "authenticated",
      role: "authenticated",
      email: account.email,
      phone: account.phone || "",
      user_metadata: {
        full_name: account.fullName,
        education_level: account.educationLevel,
        phone: account.phone || null,
      },
      app_metadata: { provider: "email" },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };

  try {
    window.localStorage.setItem(
      STORAGE_AUTH_SESSION_KEY,
      JSON.stringify(sessionPayload)
    );
    // Cache profile for getFullProfile fallback
    const profileKey = `wt_profile_${account.id}`;
    const cachedProfile = {
      id: account.id,
      email: account.email,
      full_name: account.fullName,
      phone: account.phone || null,
      education_level: account.educationLevel,
      daily_study_goal_minutes: 45,
      preferred_study_time: "evening",
      avatar_preset: "scholar-cyan",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    window.localStorage.setItem(profileKey, JSON.stringify(cachedProfile));

    // Only set session in Supabase if we have a real, cryptographically valid token
    if (hasValidRealToken) {
      try {
        supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .catch(() => {});
      } catch {
        /* ignore */
      }
    }

    // Notify all app listeners
    window.dispatchEvent(new Event("storage"));
  } catch {
    /* ignore */
  }
}

export type AuthResult = {
  success: boolean;
  user?: Partial<User>;
  code?: "user_already_exists" | "invalid_credentials" | "user_not_found" | "generic_error";
  message?: string;
};

/**
 * Perform scholar login with dual Supabase + resilient local fallback
 */
export async function loginScholar(
  identifier: string,
  password: string
): Promise<AuthResult> {
  const cleanId = identifier.trim();
  if (!cleanId || !password) {
    return {
      success: false,
      code: "invalid_credentials",
      message: "Please enter your email or phone number and password.",
    };
  }

  let authEmail = cleanId;
  let phoneNum: string | null = null;
  try {
    const parsed = authEmailFromIdentifier(cleanId);
    authEmail = parsed.email;
    phoneNum = parsed.phone;
  } catch (e) {
    return {
      success: false,
      code: "invalid_credentials",
      message: e instanceof Error ? e.message : "Invalid email or phone number.",
    };
  }

  // 1. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      });

      if (!error && data?.session?.user) {
        // Also sync to local account directory
        const user = data.session.user;
        const education =
          (user.user_metadata?.education_level as string) || "Freshman";
        persistScholarSession(
          {
            id: user.id,
            email: user.email || authEmail,
            fullName:
              (user.user_metadata?.full_name as string) || "Student Scholar",
            educationLevel: education,
            phone: phoneNum || (user.user_metadata?.phone as string) || null,
          },
          {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            expires_in: data.session.expires_in,
          }
        );
        return { success: true, user: user as unknown as Partial<User> };
      }
    } catch {
      /* Fallback to local scholar directory */
    }
  }

  // 2. Check local scholar directory
  const localScholar = findLocalScholar(cleanId);
  if (!localScholar) {
    return {
      success: false,
      code: "user_not_found",
      message: "No account found with this email or phone number.",
    };
  }

  const hashed = hashPassword(password);
  if (!localScholar.passwordHash) {
    localScholar.passwordHash = hashed;
    saveLocalScholarAccount(localScholar);
  } else if (
    localScholar.passwordHash !== hashed &&
    localScholar.passwordHash !== password
  ) {
    return {
      success: false,
      code: "invalid_credentials",
      message: "Incorrect password. Please try again.",
    };
  }

  // Credentials matched!
  persistScholarSession({
    id: localScholar.id,
    email: localScholar.email,
    fullName: localScholar.fullName,
    educationLevel: localScholar.educationLevel,
    phone: localScholar.phone,
  });

  return {
    success: true,
    user: {
      id: localScholar.id,
      email: localScholar.email,
      user_metadata: {
        full_name: localScholar.fullName,
        education_level: localScholar.educationLevel,
        phone: localScholar.phone,
      },
    },
  };
}

/**
 * Register scholar with dual Supabase + instant local persistence
 */
export async function registerScholar(params: {
  fullName: string;
  identifier: string;
  password: string;
  educationLevel: string;
}): Promise<AuthResult> {
  const { fullName, identifier, password, educationLevel } = params;
  const cleanId = identifier.trim();

  let authEmail = cleanId;
  let phoneNum: string | null = null;
  try {
    const parsed = authEmailFromIdentifier(cleanId);
    authEmail = parsed.email;
    phoneNum = parsed.phone;
  } catch (e) {
    return {
      success: false,
      code: "invalid_credentials",
      message: e instanceof Error ? e.message : "Invalid email or phone number.",
    };
  }

  // Check if account already exists locally
  const existing = findLocalScholar(cleanId);
  if (existing) {
    return {
      success: false,
      code: "user_already_exists",
      message: "An account with this email or phone number already exists.",
    };
  }

  const scholarId = `wta_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newAccount: ScholarAccount = {
    id: scholarId,
    email: authEmail,
    phone: phoneNum,
    fullName: fullName.trim() || "Student Scholar",
    educationLevel,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  let sessionTokens:
    | {
        access_token?: string;
        refresh_token?: string;
        expires_at?: number;
        expires_in?: number;
      }
    | undefined = undefined;

  // Try server-side or Supabase sign-up in background/best-effort
  if (isSupabaseConfigured()) {
    try {
      await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password,
          fullName: newAccount.fullName,
          educationLevel,
          phone: phoneNum,
        }),
      }).catch(() => null);

      await supabase.auth
        .signUp({
          email: authEmail,
          password,
          options: {
            data: {
              full_name: newAccount.fullName,
              education_level: educationLevel,
              phone: phoneNum,
            },
          },
        })
        .catch(() => null);

      // Attempt immediate sign in to obtain real JWT tokens from Supabase Auth
      const { data: signInData } = await supabase.auth
        .signInWithPassword({
          email: authEmail,
          password,
        })
        .catch(() => ({ data: null }));

      if (signInData?.session?.access_token) {
        sessionTokens = {
          access_token: signInData.session.access_token,
          refresh_token: signInData.session.refresh_token,
          expires_at: signInData.session.expires_at,
          expires_in: signInData.session.expires_in,
        };
      }
    } catch {
      /* ignore */
    }
  }

  // Save scholar account locally
  saveLocalScholarAccount(newAccount);

  // Set active session in localStorage
  persistScholarSession(
    {
      id: newAccount.id,
      email: newAccount.email,
      fullName: newAccount.fullName,
      educationLevel: newAccount.educationLevel,
      phone: newAccount.phone,
    },
    sessionTokens
  );

  // Apply default My Learning packages based on the academic level!
  applyDefaultPackagesForLevel(educationLevel);

  return {
    success: true,
    user: {
      id: newAccount.id,
      email: newAccount.email,
      user_metadata: {
        full_name: newAccount.fullName,
        education_level: newAccount.educationLevel,
        phone: newAccount.phone,
      },
    },
  };
}
