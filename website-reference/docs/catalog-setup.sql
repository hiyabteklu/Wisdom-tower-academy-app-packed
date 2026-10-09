-- Run in Supabase SQL Editor (Academy project)
-- Admin Catalog: sellable packages/products

create table if not exists public.catalog_items (
  id text primary key,
  name text not null,
  short_name text not null default '',
  description text not null default '',
  price_etb numeric not null default 0,
  href text not null default '/packages',
  image text not null default '/images/packages/grade-9_67df27.jpeg',
  includes text[] not null default '{}',
  enrolled_label text not null default '',
  group_key text not null default 'branch'
    check (group_key in ('grades', 'branch', 'special', 'custom')),
  active boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists catalog_items_active_idx on public.catalog_items (active, sort_order);
create index if not exists catalog_items_group_idx on public.catalog_items (group_key);

alter table public.catalog_items enable row level security;

drop policy if exists "Public read active catalog" on public.catalog_items;
create policy "Public read active catalog" on public.catalog_items
  for select using (active = true or auth.role() = 'authenticated');

drop policy if exists "Authenticated insert catalog" on public.catalog_items;
create policy "Authenticated insert catalog" on public.catalog_items
  for insert to authenticated with check (true);

drop policy if exists "Authenticated update catalog" on public.catalog_items;
create policy "Authenticated update catalog" on public.catalog_items
  for update to authenticated using (true);

drop policy if exists "Authenticated delete catalog" on public.catalog_items;
create policy "Authenticated delete catalog" on public.catalog_items
  for delete to authenticated using (true);

select 'catalog_items ready' as status;
