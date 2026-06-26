create table if not exists public.course_materials (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  file_path text not null,
  file_name text not null,
  file_type text,
  file_size integer,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.course_materials enable row level security;

drop policy if exists "Admins can manage course materials" on public.course_materials;
create policy "Admins can manage course materials"
on public.course_materials for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Students can see materials for enrolled courses" on public.course_materials;
create policy "Students can see materials for enrolled courses"
on public.course_materials for select
using (
  exists (
    select 1
    from public.enrollments
    where enrollments.course_id = course_materials.course_id
      and enrollments.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('course-materials', 'course-materials', false)
on conflict (id) do nothing;

drop policy if exists "Admins can upload course material files" on storage.objects;
create policy "Admins can upload course material files"
on storage.objects for insert
with check (
  bucket_id = 'course-materials'
  and public.is_admin()
);

drop policy if exists "Admins can read course material files" on storage.objects;
create policy "Admins can read course material files"
on storage.objects for select
using (
  bucket_id = 'course-materials'
  and public.is_admin()
);

drop policy if exists "Admins can update course material files" on storage.objects;
create policy "Admins can update course material files"
on storage.objects for update
using (
  bucket_id = 'course-materials'
  and public.is_admin()
)
with check (
  bucket_id = 'course-materials'
  and public.is_admin()
);

drop policy if exists "Admins can delete course material files" on storage.objects;
create policy "Admins can delete course material files"
on storage.objects for delete
using (
  bucket_id = 'course-materials'
  and public.is_admin()
);
