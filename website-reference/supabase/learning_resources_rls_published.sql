-- ============================================================
-- Wisdom Tower Academy — Published Learning Resources RLS Policy
-- Safe to re-run in Supabase SQL Editor
-- Ensures both anonymous and authenticated students can read published learning materials
-- ============================================================

-- Ensure learning_resources has select policy for both anon and authenticated
drop policy if exists "learning_resources_select_published" on public.learning_resources;
create policy "learning_resources_select_published" on public.learning_resources
  for select to anon, authenticated
  using (published = true);

-- Authenticated users (students / admins) can also read draft items if needed
drop policy if exists "learning_resources_select" on public.learning_resources;
create policy "learning_resources_select" on public.learning_resources
  for select to authenticated
  using (true);
