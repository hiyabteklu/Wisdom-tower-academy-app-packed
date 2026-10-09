/** Shared email/phone identity helpers for signup + login */

export function looksLikeEmail(value: string) {
  return value.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function normalizePhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("0") && d.length === 10) d = "251" + d.slice(1);
  if ((d.startsWith("9") || d.startsWith("7")) && d.length === 9) d = "251" + d;
  return d;
}

/**
 * Supabase requires a syntactically valid email. Phone-only accounts use a
 * stable synthetic address on a real-looking domain (not .local — rejected).
 */
export function phoneToAuthEmail(phoneE164Digits: string): string {
  return `p${phoneE164Digits}@phone.wisdomtower.app`;
}

export function authEmailFromIdentifier(identifier: string): {
  email: string;
  phone: string | null;
  displayContact: string;
} {
  const trimmed = identifier.trim();
  if (looksLikeEmail(trimmed)) {
    return { email: trimmed.toLowerCase(), phone: null, displayContact: trimmed.toLowerCase() };
  }
  const phone = normalizePhone(trimmed);
  if (phone.length < 9) {
    throw new Error("Enter a valid email or Ethiopian phone (e.g. 09xxxxxxxx).");
  }
  return {
    email: phoneToAuthEmail(phone),
    phone,
    displayContact: trimmed,
  };
}
