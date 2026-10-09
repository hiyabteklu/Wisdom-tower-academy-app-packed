/**
 * Sister product: Wisdom Tower Digital.
 * Always prefer the custom domain. Never ship a *.vercel.app link to users.
 */
const CUSTOM = "https://wisdomtower.tech";

function sanitize(raw: string | undefined): string {
  if (!raw) return CUSTOM;
  const cleaned = raw.trim().replace(/\/$/, "");
  if (!cleaned) return CUSTOM;
  // Reject preview / deployment URLs — custom domain only
  if (/vercel\.app/i.test(cleaned) || /localhost/i.test(cleaned)) {
    return CUSTOM;
  }
  try {
    const u = new URL(cleaned);
    if (u.protocol !== "https:" && u.protocol !== "http:") return CUSTOM;
    return u.origin;
  } catch {
    return CUSTOM;
  }
}

export const DIGITAL_URL = sanitize(process.env.NEXT_PUBLIC_DIGITAL_URL);
