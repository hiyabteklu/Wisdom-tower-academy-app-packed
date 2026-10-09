/**
 * Admin access grants — whitelist emails for packages without payment.
 * Dual-writes access_grants + enrollments so ownership.ts always sees them.
 * package_id "__all__" = full catalog access for that email.
 */
import { supabase } from "@/lib/supabase";
import { academyPackages } from "@/data/packages";
import { clearOwnershipCache } from "@/lib/ownership";

export const ALL_PACKAGES_ID = "__all__";

export type AccessGrant = {
  id: string;
  email: string;
  packageId: string;
  packageName: string | null;
  userId: string | null;
  source: string;
  note: string | null;
  grantedBy: string | null;
  createdAt: string;
};

function normEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function packageLabel(packageId: string): string {
  if (packageId === ALL_PACKAGES_ID) return "All packages";
  return academyPackages.find((p) => p.id === packageId)?.name || packageId;
}

function rowToGrant(row: Record<string, unknown>): AccessGrant {
  return {
    id: String(row.id),
    email: String(row.email),
    packageId: String(row.package_id),
    packageName: row.package_name != null ? String(row.package_name) : null,
    userId: row.user_id != null ? String(row.user_id) : null,
    source: String(row.source || "whitelist"),
    note: row.note != null ? String(row.note) : null,
    grantedBy: row.granted_by != null ? String(row.granted_by) : null,
    createdAt: String(row.created_at),
  };
}

/** Look up auth user id from profiles by email (best-effort). */
async function findUserIdByEmail(email: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();
    return data?.id ? String(data.id) : null;
  } catch {
    return null;
  }
}

/** Mirror grant into enrollments so listMyEnrollments / ownership keep working. */
async function mirrorEnrollment(opts: {
  email: string;
  packageId: string;
  packageName: string;
  userId: string | null;
  grantedBy: string | null;
  note: string | null;
  source: string;
}) {
  const payload: Record<string, unknown> = {
    email: opts.email,
    package_id: opts.packageId,
    package_name: opts.packageName,
    user_id: opts.userId,
    source: opts.source,
    granted_by: opts.grantedBy,
    note: opts.note,
  };

  // Prefer user_id conflict when we have one
  if (opts.userId) {
    const { error } = await supabase.from("enrollments").upsert(payload, {
      onConflict: "user_id,package_id",
    });
    if (error) {
      // Fallback: insert-ish by email path
      await supabase.from("enrollments").upsert(payload);
    }
    return;
  }

  // No user yet — email-only row
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .ilike("email", opts.email)
    .eq("package_id", opts.packageId)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from("enrollments")
      .update(payload)
      .eq("id", existing.id);
  } else {
    await supabase.from("enrollments").insert(payload);
  }
}

async function removeMirroredEnrollment(email: string, packageId: string) {
  // Only remove whitelist-sourced rows when possible
  const { data } = await supabase
    .from("enrollments")
    .select("id, source")
    .ilike("email", email)
    .eq("package_id", packageId);

  for (const row of data || []) {
    const source = String((row as { source?: string }).source || "");
    if (
      !source ||
      source === "whitelist" ||
      source === "admin" ||
      source === "beta" ||
      source === "comp"
    ) {
      await supabase.from("enrollments").delete().eq("id", row.id);
    }
  }
}

export async function listAccessGrants(): Promise<{
  grants: AccessGrant[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from("access_grants")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) return { grants: [], error: error.message };
    return {
      grants: (data || []).map((r) => rowToGrant(r as Record<string, unknown>)),
    };
  } catch (e) {
    return {
      grants: [],
      error: e instanceof Error ? e.message : "Failed to load grants",
    };
  }
}

export async function grantAccess(opts: {
  email: string;
  /** Specific package id, or ALL_PACKAGES_ID for everything */
  packageId: string;
  grantedBy?: string | null;
  note?: string | null;
  source?: "whitelist" | "admin" | "beta" | "comp";
}): Promise<{ ok: boolean; error?: string; grant?: AccessGrant }> {
  const email = normEmail(opts.email);
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email address" };
  }
  if (!opts.packageId.trim()) {
    return { ok: false, error: "Choose a package" };
  }

  const packageId = opts.packageId.trim();
  const packageName = packageLabel(packageId);
  const source = opts.source || "whitelist";
  const userId = await findUserIdByEmail(email);

  try {
    const { data, error } = await supabase
      .from("access_grants")
      .upsert(
        {
          email,
          package_id: packageId,
          package_name: packageName,
          user_id: userId,
          source,
          note: opts.note?.trim() || null,
          granted_by: opts.grantedBy || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "lower(email),package_id" }
      )
      .select("*")
      .maybeSingle();

    // Some PostgREST setups reject expression onConflict — manual upsert fallback
    if (error) {
      const { data: existing } = await supabase
        .from("access_grants")
        .select("id")
        .ilike("email", email)
        .eq("package_id", packageId)
        .maybeSingle();

      if (existing?.id) {
        const { data: updated, error: updErr } = await supabase
          .from("access_grants")
          .update({
            package_name: packageName,
            user_id: userId,
            source,
            note: opts.note?.trim() || null,
            granted_by: opts.grantedBy || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select("*")
          .maybeSingle();
        if (updErr) return { ok: false, error: updErr.message };

        await mirrorEnrollment({
          email,
          packageId,
          packageName,
          userId,
          grantedBy: opts.grantedBy || null,
          note: opts.note?.trim() || null,
          source,
        });
        clearOwnershipCache();
        return {
          ok: true,
          grant: updated
            ? rowToGrant(updated as Record<string, unknown>)
            : undefined,
        };
      }

      const { data: inserted, error: insErr } = await supabase
        .from("access_grants")
        .insert({
          email,
          package_id: packageId,
          package_name: packageName,
          user_id: userId,
          source,
          note: opts.note?.trim() || null,
          granted_by: opts.grantedBy || null,
        })
        .select("*")
        .maybeSingle();

      if (insErr) return { ok: false, error: insErr.message };

      await mirrorEnrollment({
        email,
        packageId,
        packageName,
        userId,
        grantedBy: opts.grantedBy || null,
        note: opts.note?.trim() || null,
        source,
      });
      clearOwnershipCache();
      return {
        ok: true,
        grant: inserted
          ? rowToGrant(inserted as Record<string, unknown>)
          : undefined,
      };
    }

    await mirrorEnrollment({
      email,
      packageId,
      packageName,
      userId,
      grantedBy: opts.grantedBy || null,
      note: opts.note?.trim() || null,
      source,
    });
    clearOwnershipCache();

    return {
      ok: true,
      grant: data ? rowToGrant(data as Record<string, unknown>) : undefined,
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Grant failed",
    };
  }
}

/** Grant one email access to every known academy package + __all__ sentinel. */
export async function grantAllPackages(opts: {
  email: string;
  grantedBy?: string | null;
  note?: string | null;
}): Promise<{ ok: boolean; error?: string; count?: number }> {
  const email = normEmail(opts.email);
  if (!isValidEmail(email)) {
    return { ok: false, error: "Enter a valid email address" };
  }

  // Sentinel first — ownership treats __all__ as full access
  const allRes = await grantAccess({
    email,
    packageId: ALL_PACKAGES_ID,
    grantedBy: opts.grantedBy,
    note: opts.note || "Beta / full access",
    source: "beta",
  });
  if (!allRes.ok) return { ok: false, error: allRes.error };

  let count = 1;
  for (const pkg of academyPackages) {
    const res = await grantAccess({
      email,
      packageId: pkg.id,
      grantedBy: opts.grantedBy,
      note: opts.note || "Beta / full access",
      source: "beta",
    });
    if (res.ok) count += 1;
  }

  clearOwnershipCache();
  return { ok: true, count };
}

export async function revokeAccess(
  grantId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: row, error: fetchErr } = await supabase
      .from("access_grants")
      .select("*")
      .eq("id", grantId)
      .maybeSingle();

    if (fetchErr) return { ok: false, error: fetchErr.message };
    if (!row) return { ok: false, error: "Grant not found" };

    const email = String(row.email);
    const packageId = String(row.package_id);

    const { error } = await supabase
      .from("access_grants")
      .delete()
      .eq("id", grantId);
    if (error) return { ok: false, error: error.message };

    await removeMirroredEnrollment(email, packageId);

    // If revoking __all__, also strip individual beta mirrors? leave specific grants
    clearOwnershipCache();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Revoke failed",
    };
  }
}

export async function revokeAllForEmail(
  emailRaw: string
): Promise<{ ok: boolean; error?: string; removed?: number }> {
  const email = normEmail(emailRaw);
  try {
    const { data, error } = await supabase
      .from("access_grants")
      .select("id, package_id")
      .ilike("email", email);
    if (error) return { ok: false, error: error.message };

    let removed = 0;
    for (const row of data || []) {
      const res = await revokeAccess(String(row.id));
      if (res.ok) removed += 1;
    }
    return { ok: true, removed };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Revoke failed",
    };
  }
}

/** Grants for the signed-in user (by email / user id). */
export async function listMyAccessGrants(): Promise<AccessGrant[]> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return [];

    const email = session.user.email;
    let q = supabase.from("access_grants").select("*");

    if (email) {
      q = q.or(`user_id.eq.${session.user.id},email.ilike.${email}`);
    } else {
      q = q.eq("user_id", session.user.id);
    }

    const { data, error } = await q;
    if (error) {
      // ilike in or() can be picky — fallback
      const { data: byUser } = await supabase
        .from("access_grants")
        .select("*")
        .eq("user_id", session.user.id);
      const { data: byEmail } = email
        ? await supabase
            .from("access_grants")
            .select("*")
            .ilike("email", email)
        : { data: [] as Record<string, unknown>[] };

      const map = new Map<string, AccessGrant>();
      for (const r of [...(byUser || []), ...(byEmail || [])]) {
        const g = rowToGrant(r as Record<string, unknown>);
        map.set(g.id, g);
      }
      return Array.from(map.values());
    }

    return (data || []).map((r) => rowToGrant(r as Record<string, unknown>));
  } catch {
    return [];
  }
}
