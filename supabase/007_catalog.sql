create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  product_type text not null check (product_type in ('physical', 'digital')),
  category text not null,
  summary text,
  price integer not null default 0,
  stock integer,
  digital_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now()
);

alter table public.catalog_products enable row level security;

drop policy if exists "Published catalog products are public" on public.catalog_products;
create policy "Published catalog products are public"
on public.catalog_products for select
using (status = 'published' or public.is_admin());

drop policy if exists "Admins can manage catalog products" on public.catalog_products;
create policy "Admins can manage catalog products"
on public.catalog_products for all
using (public.is_admin())
with check (public.is_admin());
