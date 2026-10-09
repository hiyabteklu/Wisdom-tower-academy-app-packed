import type { SupabaseClient } from "@supabase/supabase-js";

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_HITS = 12; // explanations per IP (or user) per window

/** In-memory fallback when Supabase is not configured */
const memoryBuckets = new Map<string, { count: number; windowStart: number }>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export async function checkRateLimit(
  supabase: SupabaseClient | null,
  bucketKey: string
): Promise<RateLimitResult> {
  const now = Date.now();

  if (!supabase) {
    return memoryRateLimit(bucketKey, now);
  }

  try {
    const { data, error } = await supabase
      .from("api_rate_limits")
      .select("hit_count, window_start")
      .eq("bucket_key", bucketKey)
      .maybeSingle();

    if (error) {
      console.warn("[rate-limit] supabase read failed, using memory:", error.message);
      return memoryRateLimit(bucketKey, now);
    }

    if (!data) {
      await supabase.from("api_rate_limits").upsert({
        bucket_key: bucketKey,
        hit_count: 1,
        window_start: new Date(now).toISOString(),
      });
      return { allowed: true, remaining: MAX_HITS - 1, resetAt: now + WINDOW_MS };
    }

    const windowStart = new Date(data.window_start).getTime();
    if (now - windowStart > WINDOW_MS) {
      await supabase
        .from("api_rate_limits")
        .update({
          hit_count: 1,
          window_start: new Date(now).toISOString(),
        })
        .eq("bucket_key", bucketKey);
      return { allowed: true, remaining: MAX_HITS - 1, resetAt: now + WINDOW_MS };
    }

    if (data.hit_count >= MAX_HITS) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: windowStart + WINDOW_MS,
      };
    }

    await supabase
      .from("api_rate_limits")
      .update({ hit_count: data.hit_count + 1 })
      .eq("bucket_key", bucketKey);

    return {
      allowed: true,
      remaining: MAX_HITS - data.hit_count - 1,
      resetAt: windowStart + WINDOW_MS,
    };
  } catch (e) {
    console.warn("[rate-limit] exception, using memory:", e);
    return memoryRateLimit(bucketKey, now);
  }
}

function memoryRateLimit(bucketKey: string, now: number): RateLimitResult {
  const existing = memoryBuckets.get(bucketKey);
  if (!existing || now - existing.windowStart > WINDOW_MS) {
    memoryBuckets.set(bucketKey, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_HITS - 1, resetAt: now + WINDOW_MS };
  }
  if (existing.count >= MAX_HITS) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.windowStart + WINDOW_MS,
    };
  }
  existing.count += 1;
  return {
    allowed: true,
    remaining: MAX_HITS - existing.count,
    resetAt: existing.windowStart + WINDOW_MS,
  };
}
