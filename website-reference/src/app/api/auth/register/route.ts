import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-Side Scholar Account Registration Route
 *
 * Bypasses Supabase default email rate limits (over_email_send_rate_limit)
 * by utilizing the service role key with email_confirm: true.
 * This guarantees instantaneous account creation for Ethiopian students
 * without waiting or hitting external mailer quotas.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, educationLevel, phone } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "Supabase configuration missing." },
        { status: 500 }
      );
    }

    // If Service Role Key is configured, use admin API to create user with email_confirm: true
    if (serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { data: newUser, error: createError } =
        await adminClient.auth.admin.createUser({
          email: email.trim().toLowerCase(),
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName?.trim() || "Student Scholar",
            education_level: educationLevel || "Freshman",
            phone: phone || null,
          },
        });

      if (createError) {
        // If user already registered, provide clear messaging
        if (
          createError.message.toLowerCase().includes("already registered") ||
          createError.message.toLowerCase().includes("already exists") ||
          (createError as unknown as { status: number }).status === 422
        ) {
          return NextResponse.json(
            {
              error:
                "An account with this email/phone already exists. Please switch to Sign In.",
              code: "user_already_exists",
            },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: createError.message },
          { status: 400 }
        );
      }

      // Also ensure profile record is inserted/ready in public.profiles
      try {
        if (newUser.user?.id) {
          await adminClient.from("profiles").upsert(
            {
              id: newUser.user.id,
              full_name: fullName?.trim() || "Student Scholar",
              education_level: educationLevel || "Freshman",
              phone: phone || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        }
      } catch (profileErr) {
        console.warn("[Register Route] Non-fatal profile upsert warning:", profileErr);
      }

      return NextResponse.json({
        success: true,
        message: "Scholar account created and confirmed instantly!",
        userId: newUser.user?.id,
      });
    }

    // Fallback using public anon key if service role is not present
    const anonClient = createClient(supabaseUrl, anonKey || "");
    const { data: fallbackData, error: fallbackError } =
      await anonClient.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName?.trim(),
            education_level: educationLevel,
            phone,
          },
        },
      });

    if (fallbackError) {
      return NextResponse.json(
        { error: fallbackError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Account registered!",
      userId: fallbackData.user?.id,
    });
  } catch (err) {
    console.error("[Register Route] Unexpected error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error." },
      { status: 500 }
    );
  }
}
