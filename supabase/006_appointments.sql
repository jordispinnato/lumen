create table if not exists public.appointment_specialists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default 'Psicologia',
  focus text,
  session text not null default 'Consulta online de 50 minutos',
  price integer not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.appointment_slots (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.appointment_specialists(id) on delete cascade,
  slot_date date not null,
  slot_time time not null,
  status text not null default 'available' check (status in ('available', 'booked', 'blocked')),
  created_at timestamptz not null default now(),
  unique (specialist_id, slot_date, slot_time)
);

alter table public.appointment_specialists enable row level security;
alter table public.appointment_slots enable row level security;

drop policy if exists "Active appointment specialists are public" on public.appointment_specialists;
create policy "Active appointment specialists are public"
on public.appointment_specialists for select
using (status = 'active' or public.is_admin());

drop policy if exists "Available appointment slots are public" on public.appointment_slots;
create policy "Available appointment slots are public"
on public.appointment_slots for select
using (status = 'available' or public.is_admin());

drop policy if exists "Admins can manage appointment specialists" on public.appointment_specialists;
create policy "Admins can manage appointment specialists"
on public.appointment_specialists for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage appointment slots" on public.appointment_slots;
create policy "Admins can manage appointment slots"
on public.appointment_slots for all
using (public.is_admin())
with check (public.is_admin());
