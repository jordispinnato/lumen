alter table public.catalog_products
add column if not exists digital_file_path text,
add column if not exists digital_file_name text,
add column if not exists digital_file_type text,
add column if not exists digital_file_size integer;

create table if not exists public.catalog_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  product_id uuid not null references public.catalog_products(id) on delete restrict,
  product_type text not null check (product_type in ('physical', 'digital')),
  amount integer not null default 0,
  status text not null default 'pending_payment' check (status in ('pending_payment', 'paid', 'cancelled', 'delivered')),
  customer_email text not null,
  customer_name text,
  shipping_phone text,
  shipping_province text,
  shipping_city text,
  shipping_postal_code text,
  shipping_street text,
  shipping_number text,
  shipping_floor_apartment text,
  shipping_notes text,
  created_at timestamptz not null default now()
);

alter table public.catalog_orders enable row level security;

drop policy if exists "Users can read own catalog orders" on public.catalog_orders;
create policy "Users can read own catalog orders"
on public.catalog_orders for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can create own catalog orders" on public.catalog_orders;
create policy "Users can create own catalog orders"
on public.catalog_orders for insert
with check (auth.uid() = user_id);

drop policy if exists "Admins can manage catalog orders" on public.catalog_orders;
create policy "Admins can manage catalog orders"
on public.catalog_orders for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('catalog-digital-files', 'catalog-digital-files', false)
on conflict (id) do nothing;

drop policy if exists "Admins can upload catalog digital files" on storage.objects;
create policy "Admins can upload catalog digital files"
on storage.objects for insert
with check (
  bucket_id = 'catalog-digital-files'
  and public.is_admin()
);

drop policy if exists "Admins can read catalog digital files" on storage.objects;
create policy "Admins can read catalog digital files"
on storage.objects for select
using (
  bucket_id = 'catalog-digital-files'
  and public.is_admin()
);

drop policy if exists "Admins can update catalog digital files" on storage.objects;
create policy "Admins can update catalog digital files"
on storage.objects for update
using (
  bucket_id = 'catalog-digital-files'
  and public.is_admin()
)
with check (
  bucket_id = 'catalog-digital-files'
  and public.is_admin()
);

drop policy if exists "Admins can delete catalog digital files" on storage.objects;
create policy "Admins can delete catalog digital files"
on storage.objects for delete
using (
  bucket_id = 'catalog-digital-files'
  and public.is_admin()
);
