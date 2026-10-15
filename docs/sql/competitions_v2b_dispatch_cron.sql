-- C8 slice 4 (session AE, 2026-10-15): the once-a-minute dispatcher job, applied live to project amieczmpqrvavzjikbdi.
-- PREREQUISITES (done by the owner/agent, value NOT stored here):
--   1. Vercel env var NOTIFICATION_DISPATCH_SECRET set (Production) and redeployed.
--   2. The SAME value stored in Vault: select vault.create_secret('<value>', 'notification_dispatch_secret');
-- Undo: select cron.unschedule('dispatch-scheduled-notifications');

select cron.schedule(
  'dispatch-scheduled-notifications',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://www.wisdom-tower-academy.live/api/notifications/dispatch',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-dispatch-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'notification_dispatch_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
  $$
);
