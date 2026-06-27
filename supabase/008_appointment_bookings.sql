create table if not exists public.appointment_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  slot_id uuid not null references public.appointment_slots(id) on delete restrict unique,
  specialist_id uuid not null references public.appointment_specialists(id) on delete restrict,
  patient_email text not null,
  patient_name text,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.appointment_bookings enable row level security;

drop policy if exists "Users can read own appointment bookings" on public.appointment_bookings;
create policy "Users can read own appointment bookings"
on public.appointment_bookings for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can create own appointment bookings" on public.appointment_bookings;
create policy "Users can create own appointment bookings"
on public.appointment_bookings for insert
with check (auth.uid() = user_id);

drop policy if exists "Admins can manage appointment bookings" on public.appointment_bookings;
create policy "Admins can manage appointment bookings"
on public.appointment_bookings for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can book available appointment slots" on public.appointment_slots;
create policy "Authenticated users can book available appointment slots"
on public.appointment_slots for update
using (auth.uid() is not null and status = 'available')
with check (auth.uid() is not null and status = 'booked');
