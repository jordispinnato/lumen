alter table public.appointment_bookings
  drop constraint if exists appointment_bookings_status_check;

alter table public.appointment_bookings
  add constraint appointment_bookings_status_check
  check (status in ('confirmed', 'cancelled', 'completed'));

create table if not exists public.specialist_patient_notes (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.appointment_specialists(id) on delete cascade,
  patient_user_id uuid references auth.users(id) on delete set null,
  patient_email text not null,
  patient_name text,
  note text not null,
  note_type text not null default 'general' check (note_type in ('general', 'session', 'follow_up', 'clinical')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.specialist_patient_notes enable row level security;

drop policy if exists "Specialists can view own patient notes" on public.specialist_patient_notes;
create policy "Specialists can view own patient notes"
on public.specialist_patient_notes for select
using (
  exists (
    select 1
    from public.appointment_specialists s
    where s.id = specialist_patient_notes.specialist_id
      and s.user_id = auth.uid()
  )
  or public.is_admin()
);

drop policy if exists "Specialists can create own patient notes" on public.specialist_patient_notes;
create policy "Specialists can create own patient notes"
on public.specialist_patient_notes for insert
with check (
  exists (
    select 1
    from public.appointment_specialists s
    where s.id = specialist_patient_notes.specialist_id
      and s.user_id = auth.uid()
  )
  or public.is_admin()
);

drop policy if exists "Specialists can update own patient notes" on public.specialist_patient_notes;
create policy "Specialists can update own patient notes"
on public.specialist_patient_notes for update
using (
  exists (
    select 1
    from public.appointment_specialists s
    where s.id = specialist_patient_notes.specialist_id
      and s.user_id = auth.uid()
  )
  or public.is_admin()
)
with check (
  exists (
    select 1
    from public.appointment_specialists s
    where s.id = specialist_patient_notes.specialist_id
      and s.user_id = auth.uid()
  )
  or public.is_admin()
);

drop policy if exists "Specialists can update own bookings" on public.appointment_bookings;
create policy "Specialists can update own bookings"
on public.appointment_bookings for update
using (
  exists (
    select 1
    from public.appointment_specialists s
    where s.id = appointment_bookings.specialist_id
      and s.user_id = auth.uid()
  )
  or public.is_admin()
)
with check (
  exists (
    select 1
    from public.appointment_specialists s
    where s.id = appointment_bookings.specialist_id
      and s.user_id = auth.uid()
  )
  or public.is_admin()
);
