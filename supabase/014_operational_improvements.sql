alter table public.appointment_bookings
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by uuid references auth.users(id) on delete set null,
  add column if not exists cancellation_reason text,
  add column if not exists completed_at timestamptz,
  add column if not exists status_updated_at timestamptz,
  add column if not exists status_updated_by uuid references auth.users(id) on delete set null,
  add column if not exists reminder_sent_at timestamptz;

create table if not exists public.appointment_consents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.appointment_bookings(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  consent_type text not null,
  terms_version text not null,
  accepted_at timestamptz not null default now(),
  user_agent text
);

alter table public.appointment_consents enable row level security;

drop policy if exists "Users can read own appointment consents" on public.appointment_consents;
create policy "Users can read own appointment consents"
on public.appointment_consents for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can create own appointment consents" on public.appointment_consents;
create policy "Users can create own appointment consents"
on public.appointment_consents for insert
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins can manage appointment consents" on public.appointment_consents;
create policy "Admins can manage appointment consents"
on public.appointment_consents for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Specialists can delete own patient notes" on public.specialist_patient_notes;
create policy "Specialists can delete own patient notes"
on public.specialist_patient_notes for delete
using (
  exists (
    select 1
    from public.appointment_specialists s
    where s.id = specialist_patient_notes.specialist_id
      and s.user_id = auth.uid()
  )
  or public.is_admin()
);

create table if not exists public.specialist_patient_note_audit (
  id uuid primary key default gen_random_uuid(),
  note_id uuid,
  specialist_id uuid references public.appointment_specialists(id) on delete set null,
  patient_email text,
  action text not null check (action in ('create', 'update', 'delete')),
  note_snapshot text,
  note_type text,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now()
);

alter table public.specialist_patient_note_audit enable row level security;

drop policy if exists "Specialists can view own note audit" on public.specialist_patient_note_audit;
create policy "Specialists can view own note audit"
on public.specialist_patient_note_audit for select
using (
  exists (
    select 1
    from public.appointment_specialists s
    where s.id = specialist_patient_note_audit.specialist_id
      and s.user_id = auth.uid()
  )
  or public.is_admin()
);

drop policy if exists "Admins can manage note audit" on public.specialist_patient_note_audit;
create policy "Admins can manage note audit"
on public.specialist_patient_note_audit for all
using (public.is_admin())
with check (public.is_admin());

alter table public.catalog_orders
  add column if not exists paid_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists cancelled_at timestamptz,
  add column if not exists tracking_code text,
  add column if not exists admin_notes text,
  add column if not exists payment_provider text default 'manual',
  add column if not exists provider_reference text;

alter table public.orders
  add column if not exists provider_status text,
  add column if not exists updated_at timestamptz;
