# Session log 2026-10-12 BD: reset-password e-mail setup is BLOCKED (waiting for Resend domain verification)

> Continues `docs/SESSION_2026-10-12_BB.md` (native password reset, N13) and `docs/SESSION_2026-10-12_BC.md`. Repo is PUBLIC: no secrets. NEVER write the Resend API key (or any key) in this repo.

- 2026-10-12 | OWNER REQUEST: "read the handoff and status and continue. The Supabase reset-password e-mail setup and the Resend API key: Resend asked me to verify my domain at name.com. Verification is pending, so the DNS records are not confirmed yet. Skip this task for now, continue with the others until verification is approved there. Just document it."

## BLOCKED TASK: reset-password e-mails (owner-only, dashboards)

**Why it is needed.** The native reset screen (N13, `ForgotPasswordScreen.kt`) asks Supabase to e-mail a reset link + code. Supabase's built-in mail sender is only meant for testing (very low limit, and as far as known it only delivers to addresses of the Supabase project team, so ordinary students would get nothing: hypothesis, standard Supabase behaviour, not tested here). Real students need a custom SMTP sender. The owner chose **Resend** for it.

**State on 2026-10-12 (from the owner's screenshots, no secrets copied):**
- Resend account exists and an API key was created (the owner has it; it is shown only once in Resend and must be stored safely by the owner).
- Resend asked to verify the domain `wisdom-tower-academy.live` (registrar: name.com). The DNS records Resend lists must be added at name.com. **Status: verification PENDING.** Until it is approved, Resend will not send from `noreply@wisdom-tower-academy.live`.
- Supabase Dashboard > Authentication > Emails > **SMTP Settings** form is FILLED but NOT SAVED (the Password field is empty): custom SMTP switch on; sender e-mail `noreply@wisdom-tower-academy.live`; sender name `Wisdom Tower Academy`; host `smtp.resend.com`; port `465`; minimum interval per user `30` seconds; username `resend`.
- Supabase Dashboard > Authentication > Emails > **Templates** > "Reset Password": NOT edited yet.

**WHAT THE OWNER DOES ONCE RESEND SHOWS THE DOMAIN AS "Verified" (in this order):**
1. Supabase > Authentication > Emails > SMTP Settings: Password = the Resend API key (paste it only there), then **Save changes**. (Other fields as listed above. Supabase says the e-mail rate limit becomes 30 per hour after enabling custom SMTP; it can be raised in Authentication > Rate Limits.)
2. Supabase > Authentication > Emails > Templates > "Reset Password": keep the existing `{{ .ConfirmationURL }}` link and ADD one line, for example `Your reset code: {{ .Token }}`. Save.
3. Phone test with a REAL e-mail account (see TEST below).

**WHAT THE NEXT AGENT DOES WHEN THE OWNER SAYS "VERIFIED / DONE":** nothing in code is expected, but (a) check that the code field in `ForgotPasswordScreen.kt` accepts the length of the code Supabase sends (Authentication > Providers > Email has an "Email OTP length" setting, 6 or 8 digits; hypothesis: the screen does not hard-code a length: confirm by reading the file), (b) help the owner with the phone test, (c) if the e-mail reaches the inbox but the code is rejected, re-check the two Supabase calls in `SupabasePasswordResetClient.kt` (still unrun, see BB notes).

**TEST (after the steps above):** Phone, signed out > Account > "Forgot password?" > a real e-mail > "Send Reset Link": the mail arrives from "Wisdom Tower Academy <noreply@wisdom-tower-academy.live>" (check the spam folder once) and contains the link AND the code; enter the code + new password twice > "Password updated!" > sign in with the new password. Wrong code: "Invalid or expired reset code. Please request a new one." Phone-number accounts (`p<digits>@phone.wisdomtower.app`) cannot receive mail: same as the website.

**Until then (what keeps working / what does not):** the website's own "forgot password" page and the native screen both depend on the same Supabase mail sender, so neither is reliable for students until this is done. Sign-in, sign-up and everything else are unaffected. Do NOT turn custom SMTP on with an empty password or before verification: mails would fail to send for everyone.

**Security note:** the API key appeared (partly cut off) in a screenshot the owner sent in chat. It never goes in this repo, `.env.example`, the app or any log. If the owner is unsure who saw the full key, they can delete it in Resend > API Keys and create a new one before step 1 (free, 1 minute).

- 2026-10-12 | LEFT (unchanged, not blocked): P14 / P15 patches to run (AY / AZ); CI result for `7dc27881` (N13b) to check; STATUS S4 (d) rest (`GuidesData.kt`, settings/home wording), (e), (f); N7 / N8 / N9b / N10 / N11 per `docs/NATIVE_CONTENT_PLAN.md`.
