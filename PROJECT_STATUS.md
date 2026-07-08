# LUMEN - Project Status

Ultima actualizacion: 2026-07-08

## Resumen

LUMEN es una plataforma Next.js + Supabase + Vercel para:

- Consultas profesionales online.
- Cursos asincronicos.
- Catalogo de productos fisicos y recursos digitales.
- Area privada de usuarios.
- Panel admin.
- Panel de especialistas.

Dominio principal actual:

- https://espaciolumen.com
- https://www.espaciolumen.com

Repo GitHub:

- https://github.com/jordispinnato/lumen.git

Proyecto local:

- C:\Users\jordi\Documents\Codex\2026-06-26\mi\outputs\lumen-platform

## Stack

- Next.js 15
- Supabase Auth, Database y Storage
- Vercel
- Resend para emails
- Google Calendar OAuth preparado para especialistas
- Mercado Pago pendiente de integracion final

## Estado Actual

### Dominio y deploy

- Vercel conectado al repo `jordispinnato/lumen`.
- Dominio propio comprado y conectado: `espaciolumen.com`.
- `espaciolumen.com` y `www.espaciolumen.com` abren correctamente.
- El dominio viejo `lumen-app-phi.vercel.app` redirige al dominio nuevo.
- `NEXT_PUBLIC_SITE_URL` debe quedar en Vercel como `https://espaciolumen.com`.

### Supabase

- Auth/login/registro funcionando.
- Roles funcionando: `student`, `admin`, `specialist`.
- Admin protegido por rol.
- Tablas principales creadas para cursos, aula, inscripciones, turnos, catalogo, pedidos, notificaciones, carrito, facturacion, mensajes de contacto y lecturas de notificaciones.
- Cada SQL nuevo debe pasarse por chat al usuario para copiar y pegar en Supabase.

### Resend

- Variables configuradas en Vercel para pruebas:
  - `RESEND_API_KEY`
  - `EMAIL_FROM`
  - `EMAIL_REPLY_TO`
  - `CONTACT_EMAIL`
- El envio de prueba llego correctamente cuando `CONTACT_EMAIL` fue el email verificado de Resend.
- Para enviar a especialistas, pacientes y admin sin limites se necesita verificar el dominio propio en Resend.

### Funcionalidades publicas

- Landing page moderna.
- Navbar con:
  - Quienes somos
  - Cursos
  - Catalogo
  - Consultas profesionales
  - Contacto
- Pagina `/quienes-somos`.
- Pagina `/contacto` con formulario.
- Boton de WhatsApp preparado.
- Paginas legales:
  - `/terminos-condiciones`
  - `/politica-privacidad`

### Consultas profesionales

- Ruta `/turnos`.
- Nombre visible: Consultas profesionales.
- Primero se elige especialista.
- Luego se ve calendario/horarios disponibles.
- Reservas reales funcionando.
- Reprogramacion mejorada.
- Panel especialista disponible en `/especialista`.
- Panel especialista incluye turnos, pacientes, historial, notas y Google Calendar preparado.
- Email al paciente y especialista preparado a nivel codigo, pero envio real a terceros requiere dominio verificado en Resend.

### Cursos y aula

- `/cursos` funcionando.
- `/aula` funcionando.
- Cursos habilitados por inscripcion.
- Aula muestra progreso, lecciones, materiales y estados.

### Catalogo

- `/catalogo` funcionando.
- Productos fisicos y digitales preparados.
- Pendiente mejorar descargas reales post-compra y flujo de envios cuando se integre pago.

### Mi Cuenta / Mi Espacio

- `/mi-cuenta` protegido por sesion.
- Dashboard privado con:
  - Inicio
  - Mis turnos
  - Mis cursos
  - Mis recursos
  - Mis pedidos
  - Carrito
  - Notificaciones
  - Mensajes
  - Certificados
  - Configuracion
- Dropdown de usuario y campana de notificaciones.
- Lectura de notificaciones persistente mediante `user_notification_reads`.

### Admin

- `/admin` protegido.
- Admin organizado por secciones.
- Gestion de cursos, modulos, lecciones, materiales, catalogo, usuarios, inscripciones, turnos, especialistas, mensajes, contacto, facturas solicitadas.
- Se pidio que cada cosa sea editable/modificable y con confirmacion al eliminar donde corresponda.

## SQL Ejecutados / Archivos SQL

Archivos presentes:

- `002_auth_profile_trigger.sql`
- `003_seed_courses.sql`
- `004_admin_policies.sql`
- `005_course_materials.sql`
- `006_appointments.sql`
- `007_catalog.sql`
- `008_appointment_bookings.sql`
- `009_catalog_files_orders.sql`
- `010_professional_profiles.sql`
- `011_academic_platform.sql`
- `012_profile_specialist_role.sql`
- `013_specialist_patient_notes.sql`
- `014_operational_improvements.sql`
- `015_account_notifications_cart.sql`
- `016_billing_invoices.sql`
- `017_contact_messages.sql`
- `018_notification_read_receipts.sql`
- `019_carla_riccio_profile.sql`

Nota: confirmar con el usuario si `019_carla_riccio_profile.sql` ya fue ejecutado en Supabase.

## Variables De Vercel Importantes

Publicas:

- `NEXT_PUBLIC_SITE_URL=https://espaciolumen.com`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_BANK_ALIAS`
- `NEXT_PUBLIC_BANK_CBU`
- `NEXT_PUBLIC_WHATSAPP_URL`

Privadas:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `EMAIL_REPLY_TO`
- `CONTACT_EMAIL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALENDAR_REDIRECT_URI`
- `CRON_SECRET`
- `ONLINE_CONSULTATION_URL`

Pendientes:

- Mercado Pago:
  - `MERCADOPAGO_ACCESS_TOKEN`
  - `MERCADOPAGO_WEBHOOK_SECRET`

## Convencion De Trabajo Entre IAs

Antes de hacer cambios:

1. Leer `PROJECT_STATUS.md`.
2. Leer `TODO_LUMEN.md`.
3. Revisar `git status`.
4. No revertir cambios de otra IA/persona.
5. Ignorar `output/` si aparece sin trackear.

Al terminar cambios:

1. Ejecutar build si se toco codigo:
   - `npm.cmd run build`
2. Actualizar `PROJECT_STATUS.md` si cambio el estado real del proyecto.
3. Actualizar `TODO_LUMEN.md` si se completo o agrego algo.
4. Commit claro.
5. Push al repo para que Vercel publique.

## Notas Para Proximos Agentes

- El usuario prefiere explicaciones simples, paso a paso y en espanol.
- Siempre pasar SQL por chat para copiar y pegar.
- No asumir que el usuario ejecuta SQL si no lo confirma.
- Si se agregan env vars, explicar exactamente Key y Value.
- Si se toca Vercel/Supabase/Resend, guiar por pantallas.
- Evitar cambios grandes sin verificar build.
