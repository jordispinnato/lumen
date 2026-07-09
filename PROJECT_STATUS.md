# LUMEN - Project Status

| Campo | Valor |
|---|---|
| Version | 1.0 |
| Ultima actualizacion | 2026-07-08 |
| Ultimo responsable | Claude (IA) - sincronizacion Google Calendar en reprogramar/cancelar |
| Revisado por | Pendiente de revision del usuario |
| Estado | En desarrollo activo |

## Fuente de verdad

- `PROJECT_STATUS.md` describe el estado actual del proyecto.
- `TODO_LUMEN.md` contiene el backlog (tareas pendientes, bloqueadas y decisiones de producto).
- Si hay una diferencia entre lo que dice la documentacion y lo que hace el codigo, la IA debe avisar al usuario antes de modificar nada.

## Flujo de trabajo

Analizar
↓
Leer PROJECT_STATUS.md
↓
Leer TODO_LUMEN.md
↓
Informar impacto
↓
Esperar confirmacion cuando corresponda
↓
Implementar
↓
Probar
↓
Actualizar documentacion
↓
Commit
↓
Push

**Ninguna IA debe hacer commit ni push sin autorizacion explicita del usuario.**

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

## Restricciones del proyecto

Reglas de trabajo vigentes para cualquier IA o persona que modifique este repo. No son sugerencias: si un cambio propuesto choca con alguna de estas reglas, hay que pedir confirmacion explicita al usuario antes de tocar nada.

- No implementar multi-tenant.
- No migrar a TypeScript.
- No rediseñar la UI hasta recibir el Figma definitivo.
- No implementar Mercado Pago Checkout sin pedido explicito del usuario.
- Priorizar cambios incrementales, seguros y verificables por sobre reescrituras grandes.
- Si se detecta deuda tecnica, proponerla como tarea en `TODO_LUMEN.md` antes de resolverla automaticamente.
- Toda modificacion importante debe dejar actualizados `PROJECT_STATUS.md` y `TODO_LUMEN.md` antes de commit/push.

## Stack

- Next.js 15
- Supabase Auth, Database y Storage
- Vercel
- Resend para emails
- Google Calendar OAuth preparado para especialistas
- Mercado Pago pendiente de integracion final (no tocar sin pedido explicito, ver "Restricciones del proyecto")

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
- Los emails de confirmacion de turno, notificacion al especialista y recordatorio automatico **ya estan implementados en el codigo** (no es trabajo de desarrollo pendiente). Hoy dependen exclusivamente de que se verifique el dominio en Resend para poder enviarse a destinatarios reales.

### Funcionalidades publicas

- Landing page moderna.
- Navbar con:
  - Quienes somos
  - Cursos
  - Catalogo
  - Consultas profesionales
  - Contacto
- Pagina `/quienes-somos`.
- Pagina `/contacto` con formulario, con gestion de esos mensajes desde el admin (estados: nuevo, en revision, respondido, archivado).
- Boton de WhatsApp preparado (usa `NEXT_PUBLIC_WHATSAPP_URL`; falta confirmar si tiene un numero real cargado en Vercel).
- Paginas legales:
  - `/terminos-condiciones`
  - `/politica-privacidad`

### Consultas profesionales

- Ruta `/turnos`.
- Nombre visible: Consultas profesionales.
- Primero se elige especialista.
- Luego se ve calendario/horarios disponibles.
- Reservas reales funcionando, con manejo de condicion de carrera para evitar doble reserva del mismo horario.
- Reprogramacion y cancelacion funcionando (con motivo de cancelacion y trazabilidad de quien reprogramo/cancelo).
- Panel especialista disponible en `/especialista`.
- Panel especialista incluye turnos, pacientes, historial y notas clinicas por paciente, con **auditoria de cambios** (se registra cada creacion/edicion/borrado de nota, quien y cuando).
- Google Calendar: el especialista puede conectar su cuenta y, al confirmarse una reserva, se crea el evento correspondiente. Reprogramar y cancelar un turno **ya actualizan/borran** el evento en Google Calendar (implementado 2026-07-08, requiere correr la migracion `020_appointment_calendar_event_id.sql` en Supabase y probar con una cuenta real conectada antes de darlo por verificado en produccion — ver `TODO_LUMEN.md`).
- Email al paciente y especialista preparado a nivel codigo (confirmacion, reprogramacion, recordatorio automatico via cron), pero envio real a terceros requiere dominio verificado en Resend.

### Cursos y aula

- `/cursos` funcionando.
- `/aula` funcionando.
- Cursos habilitados por inscripcion.
- Aula muestra progreso, lecciones, materiales y estados.
- Certificados: la seccion existe en la interfaz de "Mi Cuenta" pero hoy es un placeholder visual ("Certificados en preparacion"), sin tabla en la base de datos ni logica detras.

### Catalogo

- `/catalogo` funcionando.
- Productos fisicos y digitales preparados: carga de archivo digital en admin y descarga post-compra vía link firmado ya implementadas en codigo.
- Envios: se piden los datos de envio al comprar un producto fisico y el pedido guarda estado, pero falta confirmar si el admin expone edicion de codigo de seguimiento y si se notifica al cliente por email en cada cambio de estado.
- El flujo de transferencia bancaria manual (`/transferencia`) tiene un problema conocido: el formulario no envia nada (sin `action`/`method`, boton sin tipo `submit`). Identificado en la auditoria tecnica previa, no corregido todavia.
- Pendiente: flujo de pago real (fisicos y digitales) — depende de Mercado Pago Checkout, que no se toca sin pedido explicito.

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
  - Certificados (placeholder, ver seccion Cursos y aula)
  - Configuracion
- Configuracion de cuenta **ya funcionando**: edicion de nombre y telefono, cambio de email con confirmacion y cambio de contraseña con confirmacion (usando los flujos nativos de Supabase Auth).
- Carrito: agregar productos ya funciona (`catalog_cart_items`). Falta sacar un item, editar cantidad y finalizar la compra desde el carrito.
- Dropdown de usuario y campana de notificaciones con preview de notificaciones y mensajes recientes.
- Lectura de notificaciones persistente mediante `user_notification_reads`.

### Facturacion

- Modelo completo ya implementado: perfil de facturacion por usuario (`billing_profiles`) y solicitud de factura (`invoice_requests`), con RLS.
- El usuario puede cargar sus datos fiscales y solicitar factura de una compra desde "Mi Cuenta" (seccion Facturacion).
- El admin puede ver las facturas solicitadas y marcarlas como emitidas.
- Pendiente: evaluar si el pedido de factura se dispara automaticamente tras un pago aprobado, e integracion futura con AFIP/ARCA o un generador de comprobantes real.

### Admin

- `/admin` protegido.
- Admin organizado por secciones.
- Gestion de cursos, modulos, lecciones, materiales, catalogo, usuarios, inscripciones, turnos, especialistas, mensajes, contacto, facturas solicitadas.
- Se pidio que cada cosa sea editable/modificable y con confirmacion al eliminar donde corresponda: existe un componente de confirmacion (`AdminConfirmButton`) y ya se usa en varias acciones destructivas; falta auditar si cubre el 100% de los borrados del panel.
- `app/admin/page.js` es un archivo grande (mas de 2000 lineas) que concentra la mayoria de las vistas del panel. Identificado en la auditoria tecnica como candidato a dividir por dominio (cursos, catalogo, turnos, usuarios, facturacion, mensajes) — no se toco todavia, es un cambio de arquitectura, no de documentacion.

## SQL Ejecutados / Archivos SQL

Archivos presentes en `supabase/`:

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
- `020_appointment_calendar_event_id.sql` (agrega `google_calendar_event_id` a `appointment_bookings`; **pendiente de correr en Supabase**, generado el 2026-07-08)

Se salteo intencionalmente el numero `019`: no se pudo confirmar si ya se uso manualmente en Supabase para el tema del perfil de Carla Riccio (ver nota mas abajo), asi que se prefirio no arriesgar una colision de numeracion.

Ademas existe, fuera de la carpeta `supabase/` y sin numerar, `supabase-specialist-calendar.sql` (crea `specialist_calendar_connections` y columnas relacionadas en `appointment_specialists`). Identificado en la auditoria tecnica como migracion huerfana — sigue sin mover ni renumerar, es un cambio de codigo/estructura, no de documentacion.

Nota: una actualizacion anterior de este documento mencionaba un archivo `019_carla_riccio_profile.sql` como "presente". Ese archivo **no esta commiteado en el repo**. El tema del perfil de Carla Riccio en Supabase queda pausado a pedido del usuario (2026-07-08) — no resolver sin confirmacion explicita.

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

- Mercado Pago (no configurar sin pedido explicito del usuario):
  - `MERCADOPAGO_ACCESS_TOKEN`
  - `MERCADOPAGO_WEBHOOK_SECRET`

Nota: `.env.example` en el repo todavia no lista todas estas variables (le faltan las de Google Calendar, `CONTACT_EMAIL` y `NEXT_PUBLIC_WHATSAPP_URL`). Sincronizarlo esta anotado como tarea pendiente en `TODO_LUMEN.md`.

## Convencion De Trabajo Entre IAs

Antes de hacer cambios:

1. Leer `PROJECT_STATUS.md`, incluyendo "Restricciones del proyecto".
2. Leer `TODO_LUMEN.md`.
3. Revisar `git status` y el codigo relacionado al cambio propuesto.
4. No revertir cambios de otra IA/persona sin revisar primero.
5. Ignorar `output/` si aparece sin trackear.
6. Si hay una contradiccion entre lo que dice la documentacion y lo que hace el codigo, avisar al usuario antes de tocar nada.

Al terminar cambios:

1. Ejecutar build si se toco codigo:
   - `npm.cmd run build`
2. Actualizar `PROJECT_STATUS.md` si cambio el estado real del proyecto.
3. Actualizar `TODO_LUMEN.md` si se completo, bloqueo o agrego algo (usar el sistema de estados definido ahi).
4. Revisar RLS de cualquier tabla nueva antes de darla por terminada.
5. Commit claro.
6. Push al repo para que Vercel publique.

## Notas Para Proximos Agentes

- El usuario prefiere explicaciones simples, paso a paso y en espanol.
- Siempre pasar SQL por chat para copiar y pegar.
- No asumir que el usuario ejecuta SQL si no lo confirma.
- Si se agregan env vars, explicar exactamente Key y Value.
- Si se toca Vercel/Supabase/Resend, guiar por pantallas.
- Evitar cambios grandes sin verificar build.
- Existe una auditoria tecnica completa del proyecto y un plan de refactorizacion por fases (arquitectura, branding centralizado, admin, performance, testing), generados en sesiones de chat anteriores con Claude. No estan commiteados en el repo como archivos — si hace falta retomarlos, pedirle a Claude que los resuma o los regenere.
