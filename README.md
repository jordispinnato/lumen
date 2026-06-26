# LUMEN Platform

Base tecnica para convertir la demo de LUMEN en una plataforma real con:

- Next.js
- Vercel
- Supabase Auth + Database
- Mercado Pago Checkout Pro
- Aula privada
- Panel admin

## Primer uso

1. Copiar `.env.example` como `.env.local`.
2. Completar las claves de Supabase y Mercado Pago cuando existan.
3. Instalar dependencias:

```bash
npm install
```

4. Ejecutar en local:

```bash
npm run dev
```

5. Abrir `http://localhost:3000`.

## Base de datos

El archivo `supabase/schema.sql` contiene las tablas iniciales y reglas de seguridad.

Si ya ejecutaste `schema.sql` antes de agregar el registro real, ejecuta tambien
`supabase/002_auth_profile_trigger.sql`.

Para cargar cursos de prueba, ejecuta `supabase/003_seed_courses.sql`.

Para habilitar el panel admin y sus permisos, ejecuta
`supabase/004_admin_policies.sql`.

Desde `/admin` se pueden crear cursos, agregar lecciones/videos y habilitar
cursos a alumnos.

Para habilitar archivos descargables por curso, ejecuta
`supabase/005_course_materials.sql`.

## Deploy

El proyecto esta listo para conectarse a Vercel desde GitHub. El dominio propio se puede agregar despues.
