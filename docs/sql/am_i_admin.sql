-- am_i_admin: lets the native app ask "is the signed-in account an admin?" WITHOUT storing any e-mail in the app.
-- Session ADMIN-A, 2026-10-15. STATUS: written, NOT applied, NOT tested.
-- Same pattern as the existing admin RPCs (docs/COMPETITION_API_CONTRACT.md): security definer, empty search_path,
-- anon and public revoked, authenticated granted. It only returns a boolean, it exposes no list of admins.
--
-- How to apply: Supabase dashboard > SQL Editor > paste this file > Run (one migration named am_i_admin).
-- Expected checks after applying (as the owner admin, then as a normal student account):
--   select public.am_i_admin();   -- admin account: true, student account: false
--   anon (no sign-in) must get a permission error, not a value.

create or replace function public.am_i_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select private.is_admin()), false)
$$;

revoke all on function public.am_i_admin() from public, anon;
grant execute on function public.am_i_admin() to authenticated;
