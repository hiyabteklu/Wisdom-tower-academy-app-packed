const DEFAULT_ADMIN_EMAILS = [
  "hiyabteklu720@gmail.com",
  "tekluhiyab504@gmail.com",
];

/** Comma-separated admin emails in NEXT_PUBLIC_ADMIN_EMAILS */
export function getAdminEmails(): string[] {
  const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS || "";
  const list = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (list.length === 0) {
    return DEFAULT_ADMIN_EMAILS;
  }
  return Array.from(new Set([...list, ...DEFAULT_ADMIN_EMAILS]));
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = getAdminEmails();
  return list.includes(email.trim().toLowerCase());
}

