create table if not exists public.billing_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  buyer_type text not null default 'person' check (buyer_type in ('person', 'company')),
  legal_name text not null,
  tax_id text not null,
  tax_condition text not null check (tax_condition in ('consumidor_final', 'monotributo', 'responsable_inscripto', 'exento')),
  billing_email text not null,
  fiscal_address text not null,
  province text not null,
  city text not null,
  postal_code text not null,
  is_default boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoice_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  billing_profile_id uuid references public.billing_profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  catalog_order_id uuid references public.catalog_orders(id) on delete set null,
  purchase_type text not null check (purchase_type in ('course', 'catalog')),
  purchase_title text,
  amount integer not null default 0,
  status text not null default 'requested' check (status in ('requested', 'issued', 'cancelled')),
  invoice_number text,
  invoice_file_url text,
  billing_snapshot jsonb not null default '{}'::jsonb,
  requested_at timestamptz not null default now(),
  issued_at timestamptz,
  updated_at timestamptz not null default now(),
  check (
    (purchase_type = 'course' and order_id is not null and catalog_order_id is null)
    or
    (purchase_type = 'catalog' and catalog_order_id is not null and order_id is null)
  )
);

alter table public.orders
  add column if not exists invoice_status text not null default 'not_requested' check (invoice_status in ('not_requested', 'requested', 'issued')),
  add column if not exists invoice_request_id uuid references public.invoice_requests(id) on delete set null;

alter table public.catalog_orders
  add column if not exists invoice_status text not null default 'not_requested' check (invoice_status in ('not_requested', 'requested', 'issued')),
  add column if not exists invoice_request_id uuid references public.invoice_requests(id) on delete set null;

create unique index if not exists invoice_requests_order_id_unique
on public.invoice_requests(order_id)
where order_id is not null;

create unique index if not exists invoice_requests_catalog_order_id_unique
on public.invoice_requests(catalog_order_id)
where catalog_order_id is not null;

create unique index if not exists billing_profiles_one_default_per_user
on public.billing_profiles(user_id)
where is_default = true;

alter table public.billing_profiles enable row level security;
alter table public.invoice_requests enable row level security;

drop policy if exists "Users can read own billing profiles" on public.billing_profiles;
create policy "Users can read own billing profiles"
on public.billing_profiles for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can create own billing profiles" on public.billing_profiles;
create policy "Users can create own billing profiles"
on public.billing_profiles for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can update own billing profiles" on public.billing_profiles;
create policy "Users can update own billing profiles"
on public.billing_profiles for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can delete billing profiles" on public.billing_profiles;
create policy "Admins can delete billing profiles"
on public.billing_profiles for delete
using (public.is_admin());

drop policy if exists "Users can read own invoice requests" on public.invoice_requests;
create policy "Users can read own invoice requests"
on public.invoice_requests for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can create own invoice requests" on public.invoice_requests;
create policy "Users can create own invoice requests"
on public.invoice_requests for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can update own requested invoice data" on public.invoice_requests;
create policy "Users can update own requested invoice data"
on public.invoice_requests for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can manage invoice requests" on public.invoice_requests;
create policy "Admins can manage invoice requests"
on public.invoice_requests for all
using (public.is_admin())
with check (public.is_admin());
