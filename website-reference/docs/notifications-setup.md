# Approval notifications (email + SMS)

When an admin clicks **Approve & notify** (or Reject), the app calls `/api/notify-approval`.

## Email — Resend (recommended)

1. Create an account at [resend.com](https://resend.com)
2. Create an API key
3. In **Vercel → Project → Settings → Environment Variables**:

```
RESEND_API_KEY=re_xxxxxxxx
RESEND_FROM=Wisdom Tower <noreply@yourdomain.com>
```

Until you verify a domain, Resend allows sending only to **your own signup email** using:

```
RESEND_FROM=Wisdom Tower <onboarding@resend.dev>
```

## SMS — Africa's Talking (Ethiopia / East Africa)

1. [africastalking.com](https://africastalking.com) → get **username** + **API key**
2. Vercel env:

```
AFRICASTALKING_USERNAME=your_username
AFRICASTALKING_API_KEY=your_key
# optional sender ID if approved:
AFRICASTALKING_FROM=WisdomTower
```

## SMS — Twilio (alternative)

```
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_FROM=+1xxxxxxxx
```

## Optional site URL (links in messages)

```
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

## Behaviour

| Channel | Requirement |
|---------|-------------|
| Email | `RESEND_API_KEY` + order has email |
| SMS | AT or Twilio env + order has phone |

If a provider is not configured, approval still succeeds; toast shows `email skipped` / `SMS skipped`.

Phones like `0900763030` are normalized to `+251900763030` for SMS.
