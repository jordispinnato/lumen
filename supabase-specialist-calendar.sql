alter table public.appointment_specialists
  add column if not exists user_id uuid references public.profiles(id) on delete set null,
  add column if not exists professional_email text;

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'admin', 'specialist', 'professional'));

update public.profiles
set role = 'specialist'
where role = 'professional';

create unique index if not exists appointment_specialists_user_id_unique
  on public.appointment_specialists(user_id)
  where user_id is not null;

create table if not exists public.specialist_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  specialist_id uuid not null references public.appointment_specialists(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  google_calendar_id text not null default 'primary',
  google_calendar_email text,
  google_calendar_access_token text,
  google_calendar_refresh_token text,
  google_calendar_token_expires_at timestamptz,
  google_calendar_connected_at timestamptz,
  calendar_sync_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (specialist_id),
  unique (user_id)
);

alter table public.specialist_calendar_connections enable row level security;

update public.profiles p
set role = 'specialist'
from public.appointment_specialists s
where s.user_id = p.id
  and coalesce(p.role, 'user') <> 'admin';

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointment_specialists'
      and policyname = 'Specialists can view own professional profile'
  ) then
    create policy "Specialists can view own professional profile"
      on public.appointment_specialists
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointment_bookings'
      and policyname = 'Specialists can view own bookings'
  ) then
    create policy "Specialists can view own bookings"
      on public.appointment_bookings
      for select
      using (
        exists (
          select 1
          from public.appointment_specialists s
          where s.id = appointment_bookings.specialist_id
            and s.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'specialist_calendar_connections'
      and policyname = 'Specialists can view own calendar connection'
  ) then
    create policy "Specialists can view own calendar connection"
      on public.specialist_calendar_connections
      for select
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'specialist_calendar_connections'
      and policyname = 'Specialists can insert own calendar connection'
  ) then
    create policy "Specialists can insert own calendar connection"
      on public.specialist_calendar_connections
      for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'specialist_calendar_connections'
      and policyname = 'Specialists can update own calendar connection'
  ) then
    create policy "Specialists can update own calendar connection"
      on public.specialist_calendar_connections
      for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'specialist_calendar_connections'
      and policyname = 'Admins can manage calendar connections'
  ) then
    create policy "Admins can manage calendar connections"
      on public.specialist_calendar_connections
      for all
      using (
        exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      )
      with check (
        exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'appointment_slots'
      and policyname = 'Specialists can view own booking slots'
  ) then
    create policy "Specialists can view own booking slots"
      on public.appointment_slots
      for select
      using (
        exists (
          select 1
          from public.appointment_specialists s
          where s.id = appointment_slots.specialist_id
            and s.user_id = auth.uid()
        )
      );
  end if;
end $$;
