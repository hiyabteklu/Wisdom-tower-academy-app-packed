-- ============================================================
-- Payment receipt uploads — run ALL of this in Supabase SQL Editor
-- Fixes: "new row violates row-level security policy" on upload
-- ============================================================

-- 1) Column on orders
alter table public.orders
  add column if not exists receipt_url text;

-- 2) Bucket (public so View receipt links work)
insert into storage.buckets (id, name, public, file_size_limit)
values ('payment-receipts', 'payment-receipts', true, 8388608)
on conflict (id) do update
  set public = true,
      file_size_limit = 8388608;

-- 3) Remove old policies for this bucket (safe to re-run)
drop policy if exists "Anyone upload payment receipts" on storage.objects;
drop policy if exists "Public read payment receipts" on storage.objects;
drop policy if exists "Authenticated manage payment receipts" on storage.objects;
drop policy if exists "payment-receipts insert anon" on storage.objects;
drop policy if exists "payment-receipts insert authenticated" on storage.objects;
drop policy if exists "payment-receipts select public" on storage.objects;
drop policy if exists "payment-receipts update auth" on storage.objects;
drop policy if exists "payment-receipts delete auth" on storage.objects;

-- 4) INSERT — guests (anon) and signed-in users
create policy "payment-receipts insert anon"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'payment-receipts');

create policy "payment-receipts insert authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'payment-receipts');

-- 5) SELECT — public read (admin opens receipt URL)
create policy "payment-receipts select public"
  on storage.objects for select
  to public
  using (bucket_id = 'payment-receipts');

-- 6) Optional cleanup for admins
create policy "payment-receipts update auth"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'payment-receipts');

create policy "payment-receipts delete auth"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'payment-receipts');
