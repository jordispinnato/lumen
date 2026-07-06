create table if not exists public.user_notification_reads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null check (item_type in ('notification', 'message')),
  item_id uuid not null,
  read_at timestamptz not null default now(),
  unique (user_id, item_type, item_id)
);

alter table public.user_notification_reads enable row level security;

drop policy if exists "Users can read own notification receipts" on public.user_notification_reads;
create policy "Users can read own notification receipts"
on public.user_notification_reads for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can create own notification receipts" on public.user_notification_reads;
create policy "Users can create own notification receipts"
on public.user_notification_reads for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can manage notification receipts" on public.user_notification_reads;
create policy "Admins can manage notification receipts"
on public.user_notification_reads for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can mark own notifications read" on public.user_notifications;
create policy "Users can mark own notifications read"
on public.user_notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can mark own messages read" on public.user_messages;
create policy "Users can mark own messages read"
on public.user_messages for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists user_notification_reads_user_idx
on public.user_notification_reads(user_id, item_type, item_id);
