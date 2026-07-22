# LUMEN - TODO

| Campo | Valor |
|---|---|
| Version | 1.0 |
| Ultima actualizacion | 2026-07-22 |
| Ultimo responsable | Claude (IA) - LUMEN Product Bible v1.0: Sprint 1 (Fundamentos del Producto) + Sprint 2 (Landing Premium) + Sprint 3 (Mi Espacio, laboratorio de identidad visual) |
| Revisado por | Pendiente de revision del usuario |
| Estado | En desarrollo activo |

## Leyenda de estado

- `[ ]` Pendiente, no empezado.
- `[~]` Parcialmente implementado o implementado en codigo pero bloqueado por configuracion/infraestructura (no requiere mas desarrollo para esa parte).
- `[BLOQUEADO: motivo]` No se puede avanzar hasta que se resuelva algo externo (una accion en Vercel/Supabase/Resend, una definicion previa, etc.).
- `[DECISION]` Requiere que el usuario decida algo de producto/negocio (precio, texto legal, identidad visual, contenido real) antes de que una IA pueda actuar.
- `[NO TOCAR SIN PEDIDO EXPLICITO]` No se debe empezar sin confirmacion directa del usuario en esa conversacion puntual, aunque tecnicamente se pudiera.

Reglas generales de trabajo (multi-tenant, TypeScript, rediseño, Mercado Pago, deuda tecnica) estan en `PROJECT_STATUS.md` → "Restricciones del proyecto". Leerlas antes de tocar cualquier tarea de esta lista.

## Proxima prioridad

Lista corta y curada de lo que tiene sentido atacar primero, no el backlog completo (eso esta mas abajo por area).

1. `[BLOQUEADO: verificar dominio espaciolumen.com en Resend]` Habilitar envio real de emails (turnos, recordatorios, contacto) a cualquier destinatario. El codigo ya esta listo; falta la verificacion del dominio y actualizar `EMAIL_FROM`/`CONTACT_EMAIL`/`EMAIL_REPLY_TO` en Vercel.
2. `[~]` Sincronizacion de Google Calendar completa en codigo (creacion, actualizacion al reprogramar y borrado al cancelar). Falta probarlo en produccion con una cuenta de Google real conectada (ver checklist de pruebas manuales pendientes).
3. `[ ]` Confirmar si `NEXT_PUBLIC_WHATSAPP_URL` tiene un numero real cargado en Vercel (si quedo con el valor por defecto, el boton de WhatsApp de la landing no lleva a ningun lado).
4. `[~]` Auditar cobertura de `AdminConfirmButton` en las acciones destructivas del panel admin (ya se usa en varios lugares, falta confirmar que no queden borrados sin confirmacion).
5. `[~]` Completar carrito de compras (plan LUM-003): LUM-003.1 (quitar item), LUM-003.2 (editar cantidad) y LUM-003.3 (subtotal/total) completadas; falta finalizar compra (ver seccion "Usuarios / Mi Cuenta").

## Design System y Branding

Fuente de verdad: `LUMEN Product Bible v1.0` (documento de producto entregado por chat, prioridad por encima del codigo existente ante cualquier conflicto).

### Tecnico
- `[x]` Sprint 1 — Fundamentos del Producto: **completado** (2026-07-21). Rampas cromaticas oficiales + capa semantica, sistema tipografico de dos voces (Neulis marca / Source Sans 3 producto), tokens de motion/elevation, iconografia Lucide detras de `AppIcon`, accesibilidad base (skip-link + foco unificado), correccion de copy compartido. Detalle completo en `PROJECT_STATUS.md` → "Identidad visual y Design System".
- `[x]` Sprint 2 — Landing Premium: **completado** (2026-07-21). Recorrido oficial de 8 pasos, hero sin fotografia (patron de marca), FAQ nueva, chips de credencial, WhatsApp flotante. Detalle en `PROJECT_STATUS.md`.
- `[ ]` Retirar `--aqua`/`--sage`/`--sand` del resto de la aplicacion (admin, aula/cursos, turnos — calendario y selector de horarios —, checkout). Quedaron fuera del alcance de Sprint 1/2 a proposito; identificar el alcance exacto la proxima vez que se trabaje sobre cada una de esas pantallas.
- `[DECISION]` Las secciones "Cursos destacados" y "Recursos destacados" se sacaron de la landing porque no forman parte del recorrido de 8 pasos que define la Product Bible. Confirmar si esto es definitivo o si se agregan de vuelta (la Bible permite secciones nuevas solo "con justificacion extremadamente solida" — evaluar si mostrar contenido real de cursos/catalogo en la landing la amerita).
- `[ ]` Cuando existan testimonios reales (con consentimiento), agregar la seccion "Testimonios" entre "Como funciona" y "FAQ" — el lugar ya esta definido en el recorrido oficial, solo falta el contenido.
- `[ ]` Verificacion manual pendiente: durante el QA de este sprint, dos comportamientos CSS estandar (`:focus-visible` con transicion en el skip-link, y el selector `[open]` del acordeon de FAQ) no se pudieron confirmar visualmente por una limitacion del navegador de pruebas automatizado de esta sesion (el CSS compilado es correcto y ambos usan patrones nativos bien establecidos). Confirmar con Tab real y con un click real en una FAQ antes de dar el sprint por cerrado al 100%.
- `[ ]` `npm audit` reporta 4 vulnerabilidades altas preexistentes (brace-expansion vía eslint/typescript-estree, js-yaml, sharp/next transitivo) — no relacionadas con este sprint (no las introdujo `lucide-react`). Arreglarlas de raiz requeriria actualizar Next.js con cambios incompatibles; evaluar en una tarea aparte, no forzarlo sin pedido explicito.
- `[x]` Sprint 3 — Mi Espacio (laboratorio de identidad visual): **completado** (2026-07-22). Segunda interpretacion visual guiada por el Manual de Marca del estudio (no por el Product Bible), sin tocar la Landing. Rutas reales por dominio, paleta con Turquesa como principal y Lavanda como color de progreso, shell rediseñado. Detalle completo en `docs/SPRINT_3_MI_ESPACIO.md`.
- `[ ]` Sumar Neulis Cursive (u otra fuente script oficial del estudio) cuando este disponible, exclusivamente para microcopys emocionales — no sustituir por una fuente de terceros (decision explicita del usuario en Sprint 3).
- `[ ]` Confirmar en un navegador real (no el navegador de pruebas automatizado) que el esqueleto de `loading.js` no queda superpuesto al contenido real en ninguna pagina del shell de cuenta (`/mi-cuenta`, `/mis-turnos`, etc. y tambien `/mi-perfil`, `/carrito`, que ya tenian el mismo patron antes de este sprint). Ver `docs/SPRINT_3_MI_ESPACIO.md` seccion 8.
- `[ ]` Evaluar, solo si el usuario valida la direccion visual de Mi Espacio frente a la Landing, extender el mismo lenguaje (bloques de color, recorrido de progreso, checklist de bienvenida) a Cursos, Catalogo, Consultas y Checkout.
- `[ ]` Evaluar sumar accesos directos a `/mis-turnos`, `/mis-cursos` y `/mis-recursos` en el dropdown de usuario de `SiteNav.js` (hoy solo tiene "Mi Espacio" generico) — quedo fuera de Sprint 3 para no exceder el alcance acordado.
- `[ ]` Sprint 4 (a definir por el usuario): candidatos naturales segun el Product Bible y el resultado de Sprint 3 son Cursos, Consultas/Agenda, Catalogo, o extender el lenguaje visual validado al resto del producto — no arrancar sin autorizacion explicita.
- `[ ]` **Sprint 8 — Motion System & Microinteracciones** (registrado 2026-07-22, **no implementar todavia**; ajustar el numero si para ese momento ya se definieron los sprints 4-7 de contenido de producto). Objetivo: definir e implementar un sistema coherente de transiciones y microinteracciones para toda la plataforma, alineado con una identidad suave, cercana, organica y tranquila, construido sobre los tokens de motion ya existentes (`--motion-fast/base/slow`, `--ease-out/--ease-in-out`) en vez de crear un sistema paralelo.
  - Alcance futuro: hover de tarjetas de cursos, profesionales, recursos y catalogo; animaciones de botones; navegacion y estados activos; tabs; sidebars; modales; acordeones; formularios; aparicion de secciones de la Landing; barras y recorridos de progreso; estados de carga; confirmaciones de acciones; iconos y elementos del navbar; comportamiento desktop y mobile; soporte completo de `prefers-reduced-motion`.
  - Patron de tarjeta de curso a registrar especificamente: portada visual, bordes redondeados, categoria pequeña, titulo, metadata, tarjeta completa clickeable, hover con escala y elevacion muy sutil, transicion aproximada de 180-220ms, sin rebotes ni desplazamientos exagerados.

## Prioridad Alta

- `[BLOQUEADO: verificar dominio espaciolumen.com en Resend]` Verificar dominio para envio de emails reales. Variables a actualizar despues:
  - `EMAIL_FROM=LUMEN <contacto@espaciolumen.com>`
  - `CONTACT_EMAIL=lumenadmin.admin@gmail.com`
  - `EMAIL_REPLY_TO=lumenadmin.admin@gmail.com`
- `[NO TOCAR SIN PEDIDO EXPLICITO]` Configurar Mercado Pago Checkout Pro para cursos, consultas y catalogo.
- `[NO TOCAR SIN PEDIDO EXPLICITO]` Conectar webhook de Mercado Pago para marcar compras/pagos como aprobados.
- `[NO TOCAR SIN PEDIDO EXPLICITO]` Tema perfil de Carla Riccio en Supabase (SQL `019_carla_riccio_profile.sql` no commiteado, foto de perfil pendiente, acceso a `/especialista` sin confirmar). Pausado a pedido del usuario el 2026-07-08 — no retomar sin confirmacion explicita.

## Consultas Profesionales

### Tecnico
- `[x]` BOOKING-UX-01 — Modal de reserva + persistencia de seleccion a traves de login/registro: **completado** (2026-07-10).
  - Elegir especialista abre un modal (amplio en desktop, pantalla completa en mobile) con dos pasos internos: calendario/horarios (boton Continuar) y resumen ("Confirmar consulta", con boton "← Cambiar profesional" para cerrar y limpiar fecha/horario/aviso).
  - Un usuario sin sesion puede elegir especialista, fecha y horario antes de autenticarse; recien en el resumen se le ofrece Ingresar o Crear cuenta, ambos con la seleccion codificada en `next` (`especialista`, `fecha`, `slot`, `revisar=1`, via `URLSearchParams` + `encodeURIComponent`).
  - Al volver de login/registro, `/turnos` reabre el modal solo, valida el horario contra los slots frescos de esa carga y, si ya no esta disponible, muestra "Ese horario ya no está disponible. Elegí otro." y vuelve al paso de horarios conservando especialista y fecha. La URL se normaliza con `router.replace` para no reintentar en un reload.
  - Elegir una especialista distinta desde la grilla siempre limpia fecha/horario/resumen previos; cerrar con X/Escape/backdrop conserva la seleccion en memoria.
  - Modal con `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-label` en el boton de cierre, foco inicial en el modal, restauracion de foco al elemento que lo abrio, y bloqueo de scroll del body con cleanup.
  - `/login` y `/registro` tienen ahora un link cruzado permanente entre si, preservando `next`.
  - No se toco `lib/safeRedirect.js`, las rutas server de login/registro/reservar/reprogramar/cancelar, Supabase, Mercado Pago, Google Calendar ni Figma.
  - Reprogramacion (`mode="reschedule"`) sigue el mismo camino sin cambios de logica; no se pudo probar end-to-end en el navegador por falta de credenciales de prueba y un turno real para reprogramar — verificado solo por lectura de codigo.
- `[ ]` ACCESSIBILITY-001 — Implementar focus trap para el Booking Modal: hoy Tab/Shift+Tab puede mover el foco de teclado a elementos detras del modal (aunque no son clickeables por el backdrop). Mejora futura, no bloqueante.
- `[~]` Google Calendar: actualizar el evento al reprogramar y borrarlo al cancelar **ya implementado** (2026-07-08). Se agrego `google_calendar_event_id` a `appointment_bookings` (migracion `020_appointment_calendar_event_id.sql`, pendiente de correr en Supabase), y `lib/googleCalendar.js` ahora tiene `updateGoogleCalendarEvent()` y `deleteGoogleCalendarEvent()`. Si se reprograma a otro especialista, se borra el evento viejo y se crea uno nuevo. Todo el flujo de Calendar sigue siendo best-effort (try/catch despues del cambio local, nunca bloquea la reprogramacion/cancelacion). Falta: correr la migracion en Supabase y probar con una cuenta real conectada.
- `[ ]` Agregar video de presentacion del especialista junto a la foto de perfil.
- `[ ]` Mejorar disponibilidad/calendario si se detectan fricciones de uso reales.

### Producto
- `[DECISION]` Precio real por especialista.
- `[DECISION]` URL real de consulta online o logica de URL por especialista.
- `[DECISION]` Politicas de cancelacion/reprogramacion.
- `[DECISION]` Alcance profesional y consentimiento informado para consultas.

## Cursos

### Tecnico
- `[ ]` Mejorar edicion rapida de cursos, modulos, lecciones y materiales en admin.
- `[~]` Confirmacion antes de eliminar cursos/modulos/lecciones/materiales (depende de la auditoria de cobertura de `AdminConfirmButton`, ver "Proxima prioridad").
- `[~]` Progreso de cursos: `lesson_progress` ya trackea avance y ultima leccion vista. Falta certificados.
- `[ ]` Certificados descargables: hoy es solo un placeholder visual en Mi Cuenta ("Certificados en preparacion"), sin tabla en la base ni logica.

## Catalogo

### Tecnico
- `[~]` Productos digitales: subir archivo en admin y habilitar descarga post-compra con link firmado **ya estan implementados**. Falta que exista un flujo de pago real para que una orden llegue a estado `paid` fuera de pruebas manuales.
- `[~]` Productos fisicos: se piden datos de envio y el pedido guarda estado (`catalog_orders`), incluida columna de codigo de seguimiento. Falta confirmar si el admin expone edicion de ese codigo y si se notifica al cliente por email en cada cambio de estado.
- `[~]` Transferencia bancaria manual (`app/transferencia/page.js`): alcance minimo resuelto. Ya no promete enviar comprobantes desde un formulario sin backend; indica transferir y enviar comprobante por `/contacto`.
- `[BLOQUEADO: Mercado Pago Checkout, no tocar sin pedido explicito]` Flujo real de pago para productos fisicos y digitales.

### Producto
- `[DECISION]` Imagenes reales de productos.

## Arquitectura de navegacion

Ver `docs/INFORMATION_ARCHITECTURE.md` para la especificacion completa (arquitectura objetivo, no necesariamente el estado actual del codigo en su totalidad).

- `[x]` Etapa 1 — Separar actividad del usuario (Mi Espacio) de administracion de cuenta: **completado** (2026-07-09).
  - `/mi-cuenta` (Mi Espacio) queda como Dashboard, solo con Mis turnos, Mis cursos, Mis recursos, Certificados, Mensajes, Notificaciones.
  - Nuevas paginas independientes: `/carrito`, `/mis-pedidos` (fusiona las antiguas secciones "Mis compras" y "Mis pedidos" en dos bloques: cursos/productos digitales y productos fisicos/envios), `/facturacion`.
  - `/configuracion` — nueva pagina independiente con la funcionalidad real que antes vivia en `/mi-cuenta#configuracion` (editar nombre/telefono, cambiar email, cambiar contraseña). No es un placeholder.
  - `/mi-perfil` — placeholder simple ("se implementara en una etapa posterior"), enlazado desde el menu del avatar. Todavia no tiene desarrollo real.
  - Menu del avatar (sitio publico y shell privado) reorganizado: Mi Espacio / Mi Perfil, Carrito / Mis pedidos / Facturacion, Configuracion / Cerrar sesion.
  - Logica compartida (helpers de formato, labels de estado, `EmptyState`, `AccountIcon`, construccion de filas de compra) extraida a `app/mi-cuenta/accountShared.js` para reutilizar entre las paginas nuevas sin duplicar codigo.
- `[x]` Etapa 2 — Reemplazar navegacion por anclas dentro de `/mi-cuenta` por rutas reales por dominio: **completado** (2026-07-22, Sprint 3). `/mi-cuenta#turnos` → `/mis-turnos`, `#cursos` → `/mis-cursos`, `#recursos` → `/mis-recursos`, `#notificaciones` → `/mis-notificaciones`, `#mensajes` → `/mis-mensajes`, `#certificados` → `/mis-certificados`. `/mi-cuenta` queda solo como la pantalla de inicio ("Lo proximo"). Detalle en `docs/SPRINT_3_MI_ESPACIO.md`.
- `[ ]` Etapa futura (no iniciada): desarrollar `/mi-perfil` con datos personales reales (hoy esos datos viven en `/configuracion`, ver arriba). Definir si en ese momento se migran ahi.

## Usuarios / Mi Cuenta

### Tecnico
- `[~]` Completar carrito de compras (plan LUM-003, ver detalle abajo):
  - `[x]` LUM-003.1 — Quitar item del carrito: **completado** (2026-07-09). Ruta `app/catalogo/cart/remove/route.js` + boton "Quitar" en `/carrito`.
  - `[x]` LUM-003.2 — Editar cantidad de un item: **completado** (2026-07-09). Ruta `app/catalogo/cart/update/route.js` + input de cantidad y boton "Actualizar" en `/carrito`. Si la cantidad ingresada es 0 o menor, se comporta igual que "Quitar".
  - `[x]` LUM-003.3 — Mostrar subtotal por item y total del carrito: **completado** (2026-07-09). En `/carrito` cada item muestra precio unitario, cantidad y subtotal, y se agrego el total general del carrito al final de la lista.
  - `[ ]` LUM-003.4 — Finalizar compra (crea pedidos en `catalog_orders` y vacia el carrito, sin Mercado Pago todavia).
  - `[DECISION]` LUM-003.5 (opcional) — columna `checkout_group_id` en `catalog_orders` para preparar Mercado Pago futuro.
- `[DECISION]` Completar wishlist/lista de deseos, si se decide usar.
- `[~]` Notificaciones estilo dropdown: ya muestra preview con titulo, cuerpo y fecha en el menu de campana. Confirmar con el usuario si falta algo especifico de "contenido completo" o si ya se considera resuelto.
- `[ ]` Revisar responsive en todas las pantallas para evitar textos fuera de recuadro (bug de layout, no rediseño — no choca con la restriccion de esperar el Figma).

Nota: la funcionalidad de configuracion de cuenta (telefono, cambio de email con confirmacion, cambio de contraseña con confirmacion) vive ahora en `/configuracion` (antes en `/mi-cuenta#configuracion`), usando las mismas rutas `app/mi-cuenta/profile/update/route.js` y `app/mi-cuenta/security/*`. Ver "Arquitectura de navegacion" arriba.

## Admin

### Tecnico
- `[ ]` Mejorar manejo de usuarios: detalle interno por usuario, cursos habilitados, pedidos, turnos, recursos digitales, modificar roles, agregar/quitar accesos.
- `[~]` Confirmaciones antes de eliminar registros (ver "Proxima prioridad" — auditar cobertura, no construir desde cero).
- `[ ]` Mejorar filtros y busquedas.
- `[ ]` Separar vistas internas donde el admin se vuelve demasiado largo (`app/admin/page.js` supera las 2000 lineas). Es un cambio de arquitectura/estructura de codigo, no una tarea chica — coordinarlo antes de arrancar.

## Facturacion

### Tecnico
- `[~]` Flujo de facturacion (perfil fiscal + solicitud de factura + admin) **ya implementado** como autogestion en Mi Cuenta. Falta evaluar si conviene disparar la solicitud automaticamente tras un pago aprobado.
- `[ ]` Futuro: integrar AFIP/ARCA o un generador de comprobantes real (no es prioridad hasta tener pagos reales).

## Legales

### Producto
- `[DECISION]` Revisar politica de privacidad y terminos con abogado.
- `[DECISION]` Completar datos legales reales: razon social/persona responsable, CUIT, domicilio legal, email legal.

## Infraestructura

### Tecnico
- `[DECISION]` Definir casillas reales: `contacto@espaciolumen.com`, `turnos@espaciolumen.com`, `notificaciones@espaciolumen.com`.
- `[DECISION]` Revisar por qué hay 3 proyectos de Vercel conectados al mismo repo (`lumen-app`, `lumen-rptp`, `lumen-project`) y confirmar cuál es el proyecto real asociado a `espaciolumen.com`. No desconectar ni modificar nada sin confirmación explícita del usuario.
- `[BLOQUEADO: depende de definir las casillas reales]` Configurar DNS de email si se usa un servicio de correo externo.
- `[~]` `.env.example` sincronizado con la lista completa de variables de `PROJECT_STATUS.md` y agrupado por categoria. Completado el 2026-07-08.

Nota: "revisar RLS de tablas nuevas despues de cada modulo" y "mantener SQLs versionados y pasados por chat" ya no son tareas de esta lista — son convenciones de trabajo permanentes, documentadas en `PROJECT_STATUS.md` → "Convencion De Trabajo Entre IAs".

## UX / Diseño

### Documentacion
- `[~]` Principios de producto documentados en `docs/PRODUCT_PRINCIPLES.md`. Usar este documento como guía para futuras decisiones de UX, copy, onboarding y diseño cuando llegue el Figma.

### Tecnico (no choca con la restriccion de UI — son bugs de layout, no rediseño)
- `[ ]` Revisar todo mobile.
- `[ ]` Evitar texto comprimido o vertical en pantallas angostas.

### Bloqueadas por identidad visual (esperar Figma)
- `[BLOQUEADO: Figma definitivo pendiente]` Unificar botones, tarjetas y estados vacios.
- `[BLOQUEADO: Figma definitivo pendiente]` Revisar textos visibles usando `docs/UX_TEXT_INVENTORY.md` cuando llegue el Figma y se defina el tono final.
- `[DECISION]` Mejorar landing con contenido real cuando este definido.
- `[DECISION]` Reemplazar textos provisorios.
- `[DECISION]` Reemplazar imagenes provisorias.

## Pendiente De Producto

Todas estas son decisiones del usuario, no tareas tecnicas — ninguna IA deberia intentar resolverlas sin que el usuario las defina primero.

- `[DECISION]` Definir nombre final de marca/dominio si `espaciolumen.com` sera permanente.
- `[DECISION]` Definir identidad visual final: colores, tipografias, logo, tono de comunicacion (Figma).
- `[DECISION]` Definir precios finales.
- `[DECISION]` Definir politicas de cancelacion/reprogramacion (repetido en Consultas Profesionales, resolver una sola vez).
- `[DECISION]` Definir alcance profesional y consentimiento informado para consultas (repetido en Consultas Profesionales, resolver una sola vez).
