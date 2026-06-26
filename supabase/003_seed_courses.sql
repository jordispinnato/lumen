insert into public.courses (slug, title, summary, price, status)
values
  (
    'comunicacion-pareja',
    'Comunicación en la pareja',
    'Necesidades, límites y acuerdos para conversaciones más claras.',
    39000,
    'published'
  ),
  (
    'cuidando-cuidador',
    'Cuidando al cuidador',
    'Recursos para reconocer desgaste, ordenar prioridades y sostener procesos.',
    24000,
    'published'
  ),
  (
    'adolescencia-dialogo',
    'Cómo hablar con un hijo adolescente',
    'Claves para abrir conversaciones difíciles sin juicio y con límites claros.',
    14000,
    'published'
  )
on conflict (slug) do update
set
  title = excluded.title,
  summary = excluded.summary,
  price = excluded.price,
  status = excluded.status;

insert into public.lessons (course_id, title, video_url, position)
select id, 'Módulo 1 · Punto de partida', 'https://vimeo.com/example', 1
from public.courses
where slug = 'comunicacion-pareja'
on conflict do nothing;

insert into public.lessons (course_id, title, video_url, position)
select id, 'Módulo 2 · Herramientas de comunicación', 'https://vimeo.com/example', 2
from public.courses
where slug = 'comunicacion-pareja'
on conflict do nothing;

insert into public.lessons (course_id, title, video_url, position)
select id, 'Módulo 1 · Cuidar a quien cuida', 'https://vimeo.com/example', 1
from public.courses
where slug = 'cuidando-cuidador'
on conflict do nothing;

insert into public.lessons (course_id, title, video_url, position)
select id, 'Módulo 1 · Abrir conversaciones', 'https://vimeo.com/example', 1
from public.courses
where slug = 'adolescencia-dialogo'
on conflict do nothing;
