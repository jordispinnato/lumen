# LUMEN - Project Status

| Campo | Valor |
|---|---|
| Version | 1.0 |
| Ultima actualizacion | 2026-07-22 |
| Ultimo responsable | Codex (IA) - UI Refinements (Pre Sprint 4) + plan tecnico de implementacion de perfil |
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

- C:\Dev\Lumen

Nota de entorno local (2026-07-09):

- El repo fue clonado limpio fuera de OneDrive.
- OneDrive ya no debe usarse como ruta activa de desarrollo.
- La carpeta vieja queda solo como backup temporal/no usar.
- Nuevas sesiones de Claude Code, Codex y VS Code deben abrirse en `C:\Dev\Lumen`.

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

### Identidad visual y Design System

`docs/PRODUCT_BIBLE.md` **es la fuente oficial de decisiones de producto de LUMEN** (versionada el 2026-07-22, consolidando la `LUMEN Product Bible v1.0` y la Auditoria Integral de Producto que antes solo existian por chat, mas la decision de modelo de negocio sobre propiedad de cursos). Define vision, filosofia, identidad, modelo de negocio, Cursos, Consultas, Catalogo, Mi Espacio, experiencia de usuario, branding, arquitectura funcional y roadmap. Tiene prioridad sobre el codigo existente ante cualquier conflicto, y por encima de `docs/PRODUCT_PRINCIPLES.md` (que queda enfocado en principios de diseno, UX y experiencia, sin duplicar lo ya cubierto por la Bible). Ver `docs/PRODUCT_BIBLE.md` → "Pendientes de validacion" por las contradicciones detectadas entre esta Bible, el Manual de Marca del estudio y la implementacion real de Sprint 3, todavia sin resolver.

Estado de implementacion (sesiones de branding + Sprint 1 "Fundamentos del Producto" + Sprint 2 "Landing Premium", 2026-07-21):

- **Paleta oficial** (`#3C8C98` turquesa, `#11383F` petroleo, `#F7F2EB` marfil, `#BA9CEF` lavanda) integrada como tokens en `app/globals.css` desde una sesion anterior (color de navbar/footer/botones/landing). Esta sesion sumo las **4 rampas tonales oficiales** (5 tintes por color, del PDF de paleta del estudio) y una **capa semantica** (`--color-success-*`, `--color-warning-*`, `--color-danger-*`, `--color-info-*`), todas con contraste AA verificado.
- **Logo e isotipo** oficiales integrados como componentes SVG (`app/components/LumenIsotipo.js`, `LumenLogotipo.js`) en navbar, footer, login y registro; favicon, iconos PWA, `og-image.png` y `browserconfig.xml` regenerados desde el isotipo oficial (sesion anterior).
- **Tipografia de dos voces** (definicion nueva de esta sesion, reemplaza el uso de una sola fuente para todo): **Neulis** (marca, los 18 pesos ya en el repo) reservada a Display/H1/H2/H3 y **Source Sans 3** (nueva, via `next/font/google`, sin dependencia npm) como voz de producto para body/UI/formularios/botones. Escala tipografica oficial aplicada a elementos compartidos (`h1`-`h3`, `.eyebrow`, `.lead`, botones).
- **Iconografia**: `lucide-react` instalado (unica dependencia npm nueva del sprint) y encapsulado detras de un unico componente `app/components/AppIcon.js` — ningun otro archivo debe importar `lucide-react` directamente.
- **Motion y elevation system**: tokens `--motion-fast/base/slow`, `--ease-out/--ease-in-out`, `--shadow-resting/floating/layer` en `app/globals.css`, con `prefers-reduced-motion` respetado a nivel de tokens.
- **Accesibilidad base**: skip-link ("Saltar al contenido principal") + anillo de foco oficial turquesa unificado en toda la UI compartida.
- Tokens legacy `--aqua`/`--sage`/`--sand` retirados de la UI compartida y de la landing; **siguen en uso** en CSS especifico de admin, aula, turnos (calendario/reserva) y checkout — fuera del alcance de estos sprints, documentado como backlog.

**Sprint 3 — Mi Espacio (2026-07-22)**: segunda interpretacion visual de LUMEN, esta vez guiada por el `Manual de Marca` del estudio (PDF de 20 paginas, estudiado completo) en vez del Product Bible, y sin tocar la Landing (que sigue siendo la primera interpretacion, para comparar). Detalle completo de hallazgos, decisiones de diseño, comparativa y backlog en `docs/SPRINT_3_MI_ESPACIO.md`. Resumen:

- El Manual define a Turquesa como color principal (no solo acento) y a Lavanda/Marfil como secundarios — correccion respecto a como se habia aplicado la paleta en Sprint 1/2. Este sprint le da a Turquesa bloques grandes y a Lavanda el rol de "progreso/evolucion".
- Se reemplazo la navegacion por anclas de Mi Espacio por rutas reales por dominio (ver seccion "Mi Cuenta / Mi Espacio" mas abajo), siguiendo el mismo patron ya usado por `/facturacion`, `/configuracion`, `/mi-perfil`.
- Brecha de asset identificada y no resuelta a proposito: el Manual usa una tipografia script ("Neulis Cursive") que no esta entre los archivos disponibles. Por decision del usuario, no se sustituyo por una fuente de terceros; los enfasis emocionales se logran con jerarquia/color/peso sobre la tipografia ya definida.

**UI Refinements (Pre Sprint 4) — completado (2026-07-22)**: ajustes incrementales previos al Sprint 4, sin cambios de arquitectura, autenticacion ni Supabase. Se quitaron el isotipo del header superior publico manteniendo el logotipo textual, se ajustaron los botones de carrito y notificaciones para usar fondo Marfil y centrado consistente, se reemplazo el icono del boton flotante de WhatsApp por el PNG oficial provisto por el usuario, y se priorizo "Mi Espacio" como primera opcion del menu mobile/PWA para usuarios autenticados. La implementacion funcional de `/mi-perfil` no se improviso porque requiere extender `profiles` y crear un bucket/politicas de Storage; el diseno tecnico previo quedo documentado en `docs/PROFILE_IMPLEMENTATION_PLAN.md`.

### Funcionalidades publicas

- Landing (`/`) reconstruida (2026-07-21) siguiendo el recorrido oficial de la Product Bible: Hero → Franja de confianza → Tres caminos → Equipo profesional → Como funciona → FAQ → CTA final. Sin seccion de Testimonios todavia (no hay testimonios reales; el criterio del propio documento es no mostrarla hasta tenerlos, no inventarlos ni ocultarla con placeholder).
  - Hero sin fotografia (no existe sesion de fotos real todavia): usa el patron oficial de circulos de la carpeta de branding del estudio en vez de una foto de stock o inventada.
  - Ya no muestra "Cursos destacados" ni "Recursos destacados" (esas secciones no forman parte del recorrido de 8 pasos definido en la Product Bible); su contenido se sigue pudiendo ver desde las cards de "Tres caminos" y desde el navbar. **Decision documentada para revision**, no un descarte definitivo — ver `TODO_LUMEN.md`.
  - Seccion de preguntas frecuentes nueva, con copy honesto (no inventa politica de precio ni de cancelacion, que siguen siendo `[DECISION]`).
- Navbar con:
  - Quienes somos
  - Cursos
  - Catalogo
  - Consultas profesionales
  - Contacto
- Pagina `/quienes-somos`.
- Pagina `/contacto` con formulario, con gestion de esos mensajes desde el admin (estados: nuevo, en revision, respondido, archivado).
- Boton de WhatsApp: ahora flotante y persistente (esquina inferior derecha, visible en todo momento del scroll, 2026-07-21). Usa `NEXT_PUBLIC_WHATSAPP_URL`; falta confirmar si tiene un numero real cargado en Vercel.
- Paginas legales:
  - `/terminos-condiciones`
  - `/politica-privacidad`

### Consultas profesionales

- Ruta `/turnos`.
- Nombre visible: Consultas profesionales.
- Primero se elige especialista.
- Al elegir especialista se abre un modal (amplio en desktop, pantalla completa en mobile) con calendario y horarios; ya no hace falta scrollear la pagina para verlos (BOOKING-UX-01, 2026-07-10).
- Dentro del modal: paso "calendario y horarios" con boton Continuar, y paso "Confirmar consulta" (resumen) con boton "← Cambiar profesional" para volver a la grilla.
- Un usuario no autenticado puede elegir especialista, fecha y horario antes de iniciar sesion. Recien en el paso de resumen se le pide Ingresar o Crear cuenta, y ambos enlaces conservan la seleccion (especialista, fecha, horario) via query params en `next`. Al volver de login/registro, el modal se reabre solo y, si el horario elegido ya no esta disponible, se muestra un aviso y se vuelve al paso de horarios sin perder especialista ni fecha.
- `/login` y `/registro` ahora tienen un link cruzado permanente entre si ("¿No tenes cuenta? Crear cuenta" / "¿Ya tenes cuenta? Ingresar"), preservando `next` cuando corresponde.
- Reservas reales funcionando, con manejo de condicion de carrera para evitar doble reserva del mismo horario (logica de reserva/confirmacion sin cambios en esta mejora).
- Reprogramacion y cancelacion funcionando (con motivo de cancelacion y trazabilidad de quien reprogramo/cancelo).
- Panel especialista disponible en `/especialista`.
- Panel especialista incluye turnos, pacientes, historial y notas clinicas por paciente, con **auditoria de cambios** (se registra cada creacion/edicion/borrado de nota, quien y cuando).
- Google Calendar: el especialista puede conectar su cuenta y, al confirmarse una reserva, se crea el evento correspondiente. Reprogramar y cancelar un turno **ya actualizan/borran** el evento en Google Calendar (implementado 2026-07-08, requiere correr la migracion `020_appointment_calendar_event_id.sql` en Supabase y probar con una cuenta real conectada antes de darlo por verificado en produccion — ver `TODO_LUMEN.md`).
- Email al paciente y especialista preparado a nivel codigo (confirmacion, reprogramacion, recordatorio automatico via cron), pero envio real a terceros requiere dominio verificado en Resend.

### Modelo de negocio: propiedad de los cursos

Decision oficial registrada el 2026-07-22, previa al Sprint 4 (documentada en detalle en `docs/PRODUCT_PRINCIPLES.md` → "Modelo de negocio"):

- LUMEN es propietario comercial de los cursos de la plataforma. No es un marketplace abierto donde cada profesional publica y vende sus propios cursos.
- Los profesionales pueden participar como autores, instructores o especialistas de un curso, pero no lo publican de forma autonoma ni lo venden directamente al alumno; el cliente le compra el curso a LUMEN.
- Un curso puede tener uno o varios profesionales asociados, y un profesional puede participar en varios cursos y, ademas, ofrecer consultas dentro de la plataforma.
- Precio, publicacion, comercializacion y experiencia de aprendizaje son gestionados por LUMEN.

**Proximo sprint: Sprint 4 — Cursos.** Los pagos (Mercado Pago Checkout u otro flujo de cobro real) no forman parte de este sprint: quedan reservados para el sprint final del roadmap, sin cambios respecto a la restriccion ya vigente de no tocar Mercado Pago sin pedido explicito (ver "Restricciones del proyecto").

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

Navegacion reorganizada dos veces: separacion inicial de Mi Espacio vs. administracion de cuenta (2026-07-09, etapa 1 de `docs/INFORMATION_ARCHITECTURE.md`), y Sprint 3 (2026-07-22, ver `docs/SPRINT_3_MI_ESPACIO.md`) que reemplazo la navegacion por anclas dentro de `/mi-cuenta` por **rutas reales por dominio**, ademas de un rediseño visual completo guiado por el Manual de Marca.

- `/mi-cuenta` (Mi Espacio) protegido por sesion. Ahora es solo la "Zona 1 — Lo proximo": saludo, proxima consulta (con CTA "Unirte a la consulta" cuando el turno es el mismo dia, usando `ONLINE_CONSULTATION_URL`), curso a continuar, y checklist de bienvenida para cuentas sin actividad todavia.
- `/mis-turnos` — proximos turnos + historial, reprogramar/cancelar (antes vivia dentro de `/mi-cuenta#turnos`).
- `/mis-cursos` — cursos con tabs funcionales por estado (Todos/En progreso/Completados/Pendientes, via `?estado=`) y un recorrido visual de progreso (antes `/mi-cuenta#cursos`, con tabs decorativas sin funcion).
- `/mis-recursos` — recursos digitales comprados (antes `/mi-cuenta#recursos`).
- `/mis-notificaciones` y `/mis-mensajes` — listados completos, separados de la preview del dropdown de campana (antes `/mi-cuenta#notificaciones` / `#mensajes`).
- `/mis-certificados` — mismo placeholder de siempre, solo con ruta propia (antes `/mi-cuenta#certificados`).
- El shell compartido (`AccountDashboardShell.js`) se rediseño con la paleta oficial (sidebar solido en petroleo oscuro, iconos `AppIcon` en vez de avatares de letra, estado activo por ruta real) y ahora lo heredan automaticamente `/carrito`, `/mis-pedidos`, `/facturacion` y `/configuracion` sin cambios funcionales en esas paginas.
- `/carrito` — pagina independiente. Agregar, quitar y editar cantidad ya funciona (`catalog_cart_items`), con subtotal por item y total general. Falta finalizar la compra (LUM-003.4 en `TODO_LUMEN.md`).
- `/mis-pedidos` — pagina independiente. Fusiona el antiguo historial combinado (cursos + catalogo) y el historial de pedidos de catalogo en dos bloques: cursos/productos digitales, y productos fisicos/envios.
- `/facturacion` — pagina independiente con perfil fiscal y solicitud de factura (ver seccion Facturacion mas abajo).
- `/configuracion` — pagina independiente y funcional: edicion de nombre y telefono, cambio de email con confirmacion y cambio de contraseña con confirmacion (usando los flujos nativos de Supabase Auth). Antes vivia dentro de `/mi-cuenta`.
- `/mi-perfil` — pagina placeholder ("se implementara en una etapa posterior"). Todavia sin desarrollo real; los datos personales se editan hoy desde `/configuracion`. La implementacion funcional quedo planificada tecnicamente en `docs/PROFILE_IMPLEMENTATION_PLAN.md`, pendiente de aprobacion antes de migrar Supabase.
- Menu del avatar (sitio publico en `SiteNav.js` y shell privado en `AccountDashboardShell.js`) reorganizado: Mi Espacio / Mi Perfil, Carrito / Mis pedidos / Facturacion, Configuracion / Cerrar sesion.
- Dropdown de usuario y campana de notificaciones con preview de notificaciones y mensajes recientes, disponible en todas las paginas privadas.
- Icono de carrito en la barra superior (junto a la campana), visible para usuarios con sesion iniciada en cualquier pagina. Muestra una insignia con la suma de cantidades de `catalog_cart_items` (oculta si el carrito esta vacio) y lleva a `/carrito` al hacer click.
- Lectura de notificaciones persistente mediante `user_notification_reads`.

### Facturacion

- Modelo completo ya implementado: perfil de facturacion por usuario (`billing_profiles`) y solicitud de factura (`invoice_requests`), con RLS.
- El usuario puede cargar sus datos fiscales y solicitar factura de una compra desde `/facturacion` (pagina independiente, ver seccion "Mi Cuenta / Mi Espacio").
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
