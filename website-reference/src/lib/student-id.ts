import { supabase } from "@/lib/supabase";
import type { UserProfileRecord } from "@/lib/profile";

export interface StudentIdData {
  idNumber: string; // e.g. "WTA-01428"
  numericId: string; // e.g. "01428"
  folioNumber: string; // e.g. "REG-2026/01428"
  issueDateFull: string; // e.g. "28 September 2026"
  expiryDateFull: string; // e.g. "28 September 2027"
  issueDateISO: string;
  expiryDateISO: string;
  status: "ACTIVE" | "RENEWAL REQUIRED";
  academicTrack: string;
  institutionName: string;
  barcodeValue: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDateFull(d: Date): string {
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Deterministically generates an incremental 5-digit number (00001 - 20000)
 * if not already assigned by the database sequence.
 */
export function generateDeterministicStudentNumber(userId: string, createdAt?: string): string {
  if (!userId) return "01001";

  // Derive stable integer from user UUID characters and creation timestamp
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }

  // Modulo range from 1 to 20000, baseline start at 1042 for established institution feel
  const positive = Math.abs(hash);
  const num = (positive % 19000) + 1001; // between 1001 and 20000
  return num.toString().padStart(5, "0");
}

/**
 * Compute full student ID and registry payload for a given student profile
 */
export function computeStudentId(
  profile: Partial<UserProfileRecord> | null,
  userCreatedAt?: string
): StudentIdData {
  // Use DB student_id_number if stored, else deterministic sequence
  let numeric = "";
  if (profile?.student_id_number) {
    numeric = profile.student_id_number.replace(/\D/g, "").slice(-5).padStart(5, "0");
  }

  if (!numeric || numeric === "00000") {
    numeric = generateDeterministicStudentNumber(profile?.id || "student", userCreatedAt);
  }

  const idNumber = `WTA-${numeric}`;
  const folioNumber = `REG-${new Date().getFullYear()}/${numeric}`;

  // Issue date: profile or user creation timestamp
  const issueDate = profile?.created_at
    ? new Date(profile.created_at)
    : userCreatedAt
    ? new Date(userCreatedAt)
    : new Date();

  // Expiration date: exactly 1 year from registration
  const expiryDate = new Date(issueDate.getTime());
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);

  const now = new Date();
  const isActive = now <= expiryDate;

  return {
    idNumber,
    numericId: numeric,
    folioNumber,
    issueDateFull: formatDateFull(issueDate),
    expiryDateFull: formatDateFull(expiryDate),
    issueDateISO: issueDate.toISOString(),
    expiryDateISO: expiryDate.toISOString(),
    status: isActive ? "ACTIVE" : "RENEWAL REQUIRED",
    academicTrack: profile?.education_level || "Freshman Academic Track",
    institutionName: profile?.school_name || "Wisdom Tower Academy",
    barcodeValue: `*${idNumber}*`,
  };
}

/**
 * Persist auto-generated student ID into Supabase public.profiles if not yet set
 */
export async function persistStudentIdIfNeeded(
  userId: string,
  existingNumber?: string | null
): Promise<string> {
  if (existingNumber && existingNumber.trim().length > 0) {
    return existingNumber;
  }

  const generated = `WTA-${generateDeterministicStudentNumber(userId)}`;

  try {
    await supabase
      .from("profiles")
      .update({
        student_id_number: generated,
        id_issued_at: new Date().toISOString(),
        id_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", userId);
  } catch (err) {
    console.warn("[persistStudentIdIfNeeded] DB update skipped:", err);
  }

  return generated;
}
