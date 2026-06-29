alter table public.appointment_specialists
add column if not exists professional_license text,
add column if not exists short_bio text,
add column if not exists education text,
add column if not exists years_experience integer,
add column if not exists duration_minutes integer,
add column if not exists display_order integer not null default 100,
add column if not exists slug text,
add column if not exists photo_path text,
add column if not exists photo_url text;

create unique index if not exists appointment_specialists_slug_unique
on public.appointment_specialists (slug)
where slug is not null;

insert into storage.buckets (id, name, public)
values ('professional-photos', 'professional-photos', true)
on conflict (id) do update
set public = true;

drop policy if exists "Public can read professional photos" on storage.objects;
create policy "Public can read professional photos"
on storage.objects for select
using (bucket_id = 'professional-photos');

drop policy if exists "Admins can upload professional photos" on storage.objects;
create policy "Admins can upload professional photos"
on storage.objects for insert
with check (
  bucket_id = 'professional-photos'
  and public.is_admin()
);

drop policy if exists "Admins can update professional photos" on storage.objects;
create policy "Admins can update professional photos"
on storage.objects for update
using (
  bucket_id = 'professional-photos'
  and public.is_admin()
)
with check (
  bucket_id = 'professional-photos'
  and public.is_admin()
);

drop policy if exists "Admins can delete professional photos" on storage.objects;
create policy "Admins can delete professional photos"
on storage.objects for delete
using (
  bucket_id = 'professional-photos'
  and public.is_admin()
);
