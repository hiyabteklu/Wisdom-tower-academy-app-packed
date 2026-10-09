# AI Explain — setup

## Why Explain showed “offline tip”

Vercel runtime logs showed:

> AI Gateway requires a valid credit card on file to service requests… unlock your free credits.

So the **code is fine**. Gateway free credits are locked until a card is verified (Hobby). You may not be charged if you stay under the free allowance, but a card is still required.

## Two ways to make Explain work ($0 preferred)

### Option A — Groq (no Vercel card) ★ recommended for now

1. Open [https://console.groq.com](https://console.groq.com) → sign up → **API Keys** → create key.
2. Vercel → Project → **Settings → Environment Variables**:
   - Name: `GROQ_API_KEY`
   - Value: your Groq key
   - Environments: Production + Preview
3. **Redeploy**.

The API prefers Groq when `GROQ_API_KEY` is set.

### Option B — Vercel AI Gateway

1. Vercel → **AI** / AI Gateway → add a **credit card** to unlock free monthly credits.
2. Keep `AI_GATEWAY_API_KEY` set (you already did).
3. Redeploy if needed.

## Already configured

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_GATEWAY_API_KEY`
- SQL tables from `docs/supabase-setup.sql`

## Test

https://wisdom-tower-academy.live/academy/quiz-demo  
Answer → Check → **Explain** → real tutor text (not “temporarily unavailable”).

## How the route works

1. Rate limit
2. Supabase cache by `question_id`
3. Generate: **Groq first** (if key), else **AI Gateway**
4. Save cache
5. Fallback message if both fail (quiz still works)
