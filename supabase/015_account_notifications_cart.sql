alter table public.profiles
  add column if not exists phone text,
  add column if not exists updated_at timestamptz;

create table if not exists public.catalog_cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.catalog_products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.catalog_cart_items enable row level security;

drop policy if exists "Users can read own cart items" on public.catalog_cart_items;
create policy "Users can read own cart items"
on public.catalog_cart_items for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can manage own cart items" on public.catalog_cart_items;
create policy "Users can manage own cart items"
on public.catalog_cart_items for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  body text,
  href text,
  notification_type text not null default 'general',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.user_notifications enable row level security;

drop policy if exists "Users can read own notifications" on public.user_notifications;
create policy "Users can read own notifications"
on public.user_notifications for select
using (user_id is null or auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can manage notifications" on public.user_notifications;
create policy "Admins can manage notifications"
on public.user_notifications for all
using (public.is_admin())
with check (public.is_admin());

create table if not exists public.user_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  subject text not null,
  body text,
  message_type text not null default 'general',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.user_messages enable row level security;

drop policy if exists "Users can read own messages" on public.user_messages;
create policy "Users can read own messages"
on public.user_messages for select
using (user_id is null or auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can manage messages" on public.user_messages;
create policy "Admins can manage messages"
on public.user_messages for all
using (public.is_admin())
with check (public.is_admin());
