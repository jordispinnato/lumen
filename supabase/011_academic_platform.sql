alter table public.courses
add column if not exists description text,
add column if not exists cover_image_path text,
add column if not exists cover_image_url text,
add column if not exists intro_video_url text,
add column if not exists instructor text,
add column if not exists level text,
add column if not exists total_duration text,
add column if not exists category text,
add column if not exists featured boolean not null default false,
add column if not exists display_order integer not null default 100,
add column if not exists learning_outcomes text,
add column if not exists audience text,
add column if not exists requirements text,
add column if not exists faq text;

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);

alter table public.course_modules enable row level security;

drop policy if exists "Published course modules are public" on public.course_modules;
create policy "Published course modules are public"
on public.course_modules for select
using (
  status = 'published'
  and exists (
    select 1
    from public.courses
    where courses.id = course_modules.course_id
      and courses.status = 'published'
  )
);

drop policy if exists "Students can see modules for enrolled courses" on public.course_modules;
create policy "Students can see modules for enrolled courses"
on public.course_modules for select
using (
  exists (
    select 1
    from public.enrollments
    where enrollments.course_id = course_modules.course_id
      and enrollments.user_id = auth.uid()
  )
  or public.is_admin()
);

drop policy if exists "Admins can manage course modules" on public.course_modules;
create policy "Admins can manage course modules"
on public.course_modules for all
using (public.is_admin())
with check (public.is_admin());

alter table public.lessons
add column if not exists module_id uuid references public.course_modules(id) on delete set null,
add column if not exists description text,
add column if not exists duration_minutes integer,
add column if not exists status text not null default 'published' check (status in ('draft', 'published', 'hidden')),
add column if not exists is_preview boolean not null default false,
add column if not exists objectives text;

alter table public.course_materials
add column if not exists lesson_id uuid references public.lessons(id) on delete set null,
add column if not exists material_type text not null default 'file' check (material_type in ('file', 'pdf', 'audio', 'link')),
add column if not exists external_url text,
add column if not exists status text not null default 'published' check (status in ('published', 'hidden'));

alter table public.course_materials
alter column file_path drop not null,
alter column file_name drop not null;

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz,
  last_viewed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

drop policy if exists "Users can read own lesson progress" on public.lesson_progress;
create policy "Users can read own lesson progress"
on public.lesson_progress for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users can create own lesson progress" on public.lesson_progress;
create policy "Users can create own lesson progress"
on public.lesson_progress for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own lesson progress" on public.lesson_progress;
create policy "Users can update own lesson progress"
on public.lesson_progress for update
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

insert into public.course_modules (course_id, title, description, position, status)
select c.id, 'Modulo inicial', 'Contenido inicial del curso.', 1, 'published'
from public.courses c
where not exists (
  select 1
  from public.course_modules m
  where m.course_id = c.id
);

update public.lessons l
set module_id = (
  select m.id
  from public.course_modules m
  where m.course_id = l.course_id
  order by m.position asc, m.created_at asc
  limit 1
)
where l.module_id is null;

insert into storage.buckets (id, name, public)
values ('course-covers', 'course-covers', true)
on conflict (id) do update
set public = true;

drop policy if exists "Public can read course covers" on storage.objects;
create policy "Public can read course covers"
on storage.objects for select
using (bucket_id = 'course-covers');

drop policy if exists "Admins can upload course covers" on storage.objects;
create policy "Admins can upload course covers"
on storage.objects for insert
with check (
  bucket_id = 'course-covers'
  and public.is_admin()
);

drop policy if exists "Admins can update course covers" on storage.objects;
create policy "Admins can update course covers"
on storage.objects for update
using (
  bucket_id = 'course-covers'
  and public.is_admin()
)
with check (
  bucket_id = 'course-covers'
  and public.is_admin()
);

drop policy if exists "Admins can delete course covers" on storage.objects;
create policy "Admins can delete course covers"
on storage.objects for delete
using (
  bucket_id = 'course-covers'
  and public.is_admin()
);
