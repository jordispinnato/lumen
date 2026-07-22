# LUMEN - Profile Implementation Plan

Documento tecnico para aprobar el diseno de implementacion de perfil antes de crear migraciones, buckets o cambios funcionales.

## Objetivo

Definir la estructura minima necesaria para convertir `/mi-perfil` en una pantalla funcional de administracion de identidad personal, sin cambiar autenticacion, sin modificar la arquitectura general del proyecto y sin crear estructuras innecesarias.

Este documento no implementa migraciones ni crea buckets. Solo describe el diseno recomendado.

## Estado actual

### Tabla `profiles`

La tabla base se crea en `supabase/schema.sql`:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('student', 'admin', 'professional')),
  created_at timestamptz not null default now()
);
```

Migraciones posteriores agregan:

- `email text` en `supabase/004_admin_policies.sql`.
- `phone text` y `updated_at timestamptz` en `supabase/015_account_notifications_cart.sql`.
- El constraint de `role` se amplia a `student`, `admin`, `specialist`, `professional` en `supabase/012_profile_specialist_role.sql`.

Estado efectivo esperado:

| Columna | Uso actual |
|---|---|
| `id` | Relacion 1:1 con `auth.users`. |
| `full_name` | Nombre visible basico. |
| `email` | Copia operativa del email de Auth para consultas/admin. |
| `phone` | Telefono editable desde `/configuracion`. |
| `role` | Rol de usuario. |
| `created_at` | Fecha de creacion. |
| `updated_at` | Fecha de ultima actualizacion. |

### Uso actual en la app

- `app/layout.js` usa `profiles.full_name`, `email` y `role` para header, avatar con iniciales, admin y especialista.
- Las paginas privadas usan `full_name`, `email` y `role` para `AccountDashboardShell`.
- `/configuracion` permite editar `full_name` y `phone`.
- `/mi-perfil` existe, pero hoy es placeholder.
- No hay foto de perfil real para usuarios; los avatares se generan con iniciales.

## Columnas faltantes

Para soportar el alcance pedido faltan:

| Necesidad | Columna recomendada | Tipo | Notas |
|---|---|---|---|
| Foto de perfil publica dentro de la app | `avatar_url` | `text` | URL publica o firmable del avatar actual. |
| Ruta interna del archivo | `avatar_path` | `text` | Necesaria para reemplazar/eliminar el archivo viejo. |
| Nombre de usuario | `username` | `text` | Unico, normalizado, sin `@` guardado. |
| Nombre | `first_name` | `text` | Permite separar identidad sin depender de `full_name`. |
| Apellido | `last_name` | `text` | Igual que arriba. |
| Nombre visible opcional | `display_name` | `text` | Si existe, puede alimentar header/perfiles publicos. |
| Pais | `country` | `text` | Texto simple al inicio; catalogo ISO puede esperar. |
| Biografia | `bio` | `text` | Validar maximo 500 caracteres en UI y backend. |
| Instagram | `instagram_url` | `text` | Guardar URL completa validada. |
| Facebook | `facebook_url` | `text` | Guardar URL completa validada. |
| Notificaciones por correo | `email_notifications_enabled` | `boolean` | Default `true`. |
| Recordatorios de cursos | `course_reminders_enabled` | `boolean` | Default `true`. |
| Recordatorios de consultas | `appointment_reminders_enabled` | `boolean` | Default `true`. |

## Extender `profiles` vs. tablas auxiliares

### Recomendacion

Extender `profiles` para esta etapa.

Motivos:

- La relacion sigue siendo 1:1 con `auth.users`.
- Los datos pedidos son identidad basica, no historial ni registros repetibles.
- Evita joins innecesarios en header, dropdown, Mi Espacio y paginas privadas.
- Mantiene bajo el costo de actualizar avatar/nombre visible en toda la app.
- Es coherente con el uso actual de `profiles` como fuente de datos personales basicos.

### Cuando convendria una tabla auxiliar

Crear tablas auxiliares solo si aparece alguno de estos casos:

- Preferencias numerosas, versionadas o por canal especifico.
- Redes sociales repetibles o configurables por tipo.
- Configuracion publica distinta de perfil privado.
- Historial/auditoria de cambios de perfil.
- Perfiles publicos con reglas de visibilidad mas complejas.

Si eso ocurre, una tabla como `profile_preferences` o `public_profile_settings` podria tener sentido. Para el alcance actual seria sobredimensionado.

## Username

### Formato recomendado

Guardar el username sin `@`.

Ejemplos:

- `jordi`
- `laura.psicologia`
- `martingarcia`

La UI puede mostrarlo como `@jordi`, pero la base deberia guardar `jordi`.

### Validaciones recomendadas

- Longitud minima: 3 caracteres.
- Longitud maxima: 30 caracteres.
- Caracteres permitidos: letras minusculas, numeros, punto y guion bajo.
- Regex sugerida: `^[a-z0-9._]{3,30}$`.
- No permitir punto inicial/final ni puntos consecutivos si se quiere una regla mas prolija para perfiles publicos.
- Normalizar a minusculas antes de guardar.
- Unicidad con indice unico sobre `username`.

### Constraint recomendado

En una migracion futura:

```sql
alter table public.profiles
  add column if not exists username text;

create unique index if not exists profiles_username_unique
on public.profiles (username)
where username is not null;
```

Tambien conviene agregar un `check` para formato, o validar en backend si se prefiere mantener SQL mas simple.

## Avatar

### Estructura recomendada

Agregar en `profiles`:

```sql
avatar_path text
avatar_url text
```

Uso:

- `avatar_path`: path interno en Supabase Storage, por ejemplo `user-id/avatar-1700000000000.png`.
- `avatar_url`: URL que consume la UI para mostrar la imagen.

Mantener ambas columnas evita tener que reconstruir path desde URL cuando se reemplaza o elimina la imagen.

### Render recomendado

El avatar debe ser circular por CSS:

- `border-radius: 999px`.
- `object-fit: cover`.
- `object-position: center`.

No hace falta implementar crop avanzado en esta etapa. Un crop centrado mediante CSS cubre el objetivo sin agregar dependencias ni complejidad.

Si en el futuro se necesita crop manual, deberia evaluarse como mejora separada.

## Bucket recomendado

Crear un bucket nuevo:

```text
profile-avatars
```

Recomendacion inicial:

- Bucket publico: `true`.
- Archivos permitidos: `image/png`, `image/jpeg`, `image/webp`.
- Tamano maximo sugerido: 2 MB.
- Path por usuario: `${userId}/avatar-${timestamp}.${extension}`.

Motivos para bucket publico:

- El avatar se muestra en header, dropdown, Mi Espacio y potenciales perfiles publicos.
- Evita generar URLs firmadas en cada render del layout.
- Es consistente con `professional-photos`, que ya es publico para fotos profesionales.

Si mas adelante se decide que los avatares no deben ser publicos, se puede cambiar a bucket privado con signed URLs, pero eso agregaria complejidad en cada render.

## Politicas RLS necesarias

### `profiles`

Ya existen politicas base:

- El usuario puede leer su propio perfil.
- El usuario puede editar su propio perfil.
- Admin puede leer perfiles.

Para las nuevas columnas, esas politicas alcanzan si se mantienen en la misma tabla.

Recomendacion:

- Mantener `select` propio por `auth.uid() = id`.
- Mantener `update` propio por `auth.uid() = id`.
- Mantener admin read.
- No permitir que un usuario edite `role`, `email` ni campos administrativos desde la pantalla de perfil.

Importante: aunque RLS permita `update` de la fila propia, el route handler debe filtrar explicitamente que columnas se actualizan. No confiar en el formulario.

### Storage `profile-avatars`

Politicas recomendadas:

1. Lectura publica de avatares:

```sql
bucket_id = 'profile-avatars'
```

2. Insert propio:

```sql
bucket_id = 'profile-avatars'
and auth.uid()::text = (storage.foldername(name))[1]
```

3. Update propio:

```sql
bucket_id = 'profile-avatars'
and auth.uid()::text = (storage.foldername(name))[1]
```

4. Delete propio:

```sql
bucket_id = 'profile-avatars'
and auth.uid()::text = (storage.foldername(name))[1]
```

5. Admin puede gestionar todo el bucket:

```sql
bucket_id = 'profile-avatars'
and public.is_admin()
```

La politica de escritura debe validar que cada usuario solo escriba dentro de su carpeta.

## Cambios minimos de base de datos

Migracion futura sugerida, aun no aprobada:

```sql
alter table public.profiles
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists display_name text,
  add column if not exists username text,
  add column if not exists country text,
  add column if not exists bio text,
  add column if not exists instagram_url text,
  add column if not exists facebook_url text,
  add column if not exists avatar_path text,
  add column if not exists avatar_url text,
  add column if not exists email_notifications_enabled boolean not null default true,
  add column if not exists course_reminders_enabled boolean not null default true,
  add column if not exists appointment_reminders_enabled boolean not null default true;

create unique index if not exists profiles_username_unique
on public.profiles (username)
where username is not null;
```

Checks opcionales recomendados:

```sql
alter table public.profiles
  add constraint profiles_username_format_check
  check (username is null or username ~ '^[a-z0-9._]{3,30}$');

alter table public.profiles
  add constraint profiles_bio_length_check
  check (bio is null or char_length(bio) <= 500);
```

Nota: si se agregan constraints con nombres fijos, la migracion debe contemplar `drop constraint if exists` o verificar existencia antes, para que sea re-ejecutable sin fallar.

## Cambios minimos de backend

### Route handler de perfil

Extender o reemplazar `app/mi-cuenta/profile/update/route.js`.

Responsabilidades:

- Leer sesion con Supabase Auth.
- Validar campos recibidos.
- Normalizar `username`.
- Verificar unicidad de `username` excluyendo el perfil actual.
- Validar `bio` con maximo 500 caracteres.
- Validar URLs de Instagram y Facebook.
- Actualizar solo columnas permitidas.
- Actualizar `auth.user.user_metadata` solo con datos necesarios para fallback rapido: `full_name`, `phone`, `avatar_url`.
- Redirigir con mensaje claro de exito o error.

### Avatar

Puede implementarse en el mismo route handler o en una ruta separada.

Recomendacion para simplicidad:

- Usar el mismo formulario y route handler para perfil + avatar.
- Si llega archivo nuevo:
  - validar tipo y tamano;
  - subir a `profile-avatars`;
  - obtener public URL;
  - eliminar el archivo anterior si existia `avatar_path`;
  - guardar `avatar_path` y `avatar_url`.
- Si llega accion `removeAvatar`:
  - eliminar `avatar_path` si existe;
  - setear `avatar_path = null`, `avatar_url = null`;
  - mantener iniciales en UI.

## Cambios minimos de frontend

### Pantalla recomendada

Implementar la pantalla funcional en `/mi-perfil`, no en `/mi-cuenta`.

Motivo:

- La arquitectura ya separa `Mi Espacio` de identidad personal.
- `/configuracion` hoy contiene seguridad y datos basicos; a futuro puede quedar para preferencias y seguridad.
- `/mi-perfil` ya existe como ruta y placeholder.

### Componentes existentes a reutilizar

- `AccountDashboardShell`.
- `ACCOUNT_RETURN_NAV_ITEM`.
- Clases existentes `account-panel`, `account-settings-card`, `account-profile-grid`, `account-primary-action`, `account-secondary-action`.
- Avatar existente como fallback con iniciales.

### Campos de UI

Secciones sugeridas:

1. Foto de perfil
   - Preview circular.
   - Subir/reemplazar.
   - Eliminar.
   - Fallback con iniciales.

2. Informacion personal
   - Nombre.
   - Apellido.
   - Nombre visible opcional.
   - Telefono.
   - Pais.

3. Nombre de usuario
   - Campo visual con prefijo `@`.
   - Texto de ayuda breve.
   - Error claro si ya existe o no cumple formato.

4. Redes sociales
   - Instagram.
   - Facebook.

5. Biografia
   - Textarea.
   - Maximo 500 caracteres.
   - Contador.
   - Soporte para saltos de linea.

6. Preferencias
   - Recibir notificaciones por correo.
   - Recordatorios de cursos.
   - Recordatorios de consultas.

7. Seguridad
   - Email registrado solo lectura.
   - Boton "Cambiar contraseña" usando el flujo existente en `app/mi-cuenta/security/password/route.js`.
   - No permitir cambiar email desde esta pantalla.

## Actualizacion de avatares en toda la app

Para que la foto se refleje automaticamente en Header, Dropdown, Mi Espacio y demas avatares:

- Incluir `avatar_url` en los selects de `profiles` usados por:
  - `app/layout.js`;
  - `app/mi-cuenta/page.js`;
  - paginas privadas que renderizan `AccountDashboardShell`;
  - `app/mi-cuenta/AccountDashboardShell.js`.
- Pasar una nueva prop opcional, por ejemplo `avatarUrl`.
- Renderizar imagen si existe `avatarUrl`; si no, iniciales.
- Mantener el mismo tamano, forma circular y comportamiento actual.

Esto no requiere cambiar autenticacion. Solo cambia la fuente visual del avatar.

## Validaciones

### Backend obligatorias

- `username`: formato, longitud, unicidad.
- `bio`: maximo 500 caracteres.
- `instagram_url` y `facebook_url`: URL valida o vacio.
- `avatar`: tipo permitido y tamano maximo.
- `first_name`, `last_name`, `display_name`, `country`, `phone`: trim y longitud razonable.

### Frontend recomendadas

- Contador de biografia.
- Mensajes inline o notice superior reutilizando patrones actuales.
- Boton "Guardar cambios" con estado de loading si se convierte a componente cliente.
- Mantener datos escritos si falla la validacion, cuando sea posible.

## Riesgos

| Riesgo | Mitigacion |
|---|---|
| Mostrar avatar publico no deseado | Confirmar que el avatar sera parte de identidad visible dentro de LUMEN. |
| `username` reservado o abusivo | Agregar lista de reservados en backend si se vuelve necesario. |
| RLS demasiado amplia en Storage | Forzar carpeta por `auth.uid()` en politicas. |
| Doble fuente `full_name` vs `first_name`/`last_name` | Mantener `full_name` como campo derivado/compatibilidad durante la transicion. |
| Muchos selects duplicados de perfil | Cambiar incrementalmente; no refactorizar arquitectura en la primera implementacion. |

## Orden recomendado de implementacion

1. Aprobar este diseno.
2. Crear una migracion SQL versionada para columnas, constraints, bucket y politicas.
3. Ejecutar la migracion manualmente en Supabase.
4. Implementar route handler de perfil extendido.
5. Implementar `/mi-perfil` funcional reutilizando el shell actual.
6. Actualizar render de avatar en header, dropdown y shell privado.
7. Ejecutar build/lint.
8. Verificar desktop, mobile y PWA con usuario logueado.

## Decision recomendada

Para el alcance actual conviene extender `profiles` y crear un bucket `profile-avatars`.

No conviene crear tablas auxiliares todavia. Los datos pedidos pertenecen a una unica identidad de usuario y se consumen en muchas superficies globales, especialmente header y shell privado. Mantenerlos en `profiles` reduce complejidad y evita joins innecesarios antes de Sprint 4.
