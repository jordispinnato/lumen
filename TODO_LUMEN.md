# LUMEN - TODO

| Campo | Valor |
|---|---|
| Version | 1.0 |
| Ultima actualizacion | 2026-07-08 |
| Ultimo responsable | Claude (IA) - Fase 0 de documentacion |
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
2. `[ ]` Sincronizar reprogramacion y cancelacion de turnos con Google Calendar (hoy solo la creacion del evento esta conectada; reprogramar/cancelar dejan el evento viejo huerfano). Hay uso real en produccion, conviene priorizarlo.
3. `[ ]` Confirmar si `NEXT_PUBLIC_WHATSAPP_URL` tiene un numero real cargado en Vercel (si quedo con el valor por defecto, el boton de WhatsApp de la landing no lleva a ningun lado).
4. `[~]` Auditar cobertura de `AdminConfirmButton` en las acciones destructivas del panel admin (ya se usa en varios lugares, falta confirmar que no queden borrados sin confirmacion).
5. `[~]` Completar carrito de compras: hoy solo se puede agregar (`catalog_cart_items`); falta sacar item, editar cantidad y finalizar.

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
- `[ ]` Actualizar el evento de Google Calendar cuando se reprograma un turno (`app/turnos/reprogramar/route.js` no llama hoy a la API de Calendar).
- `[ ]` Cancelar/eliminar el evento de Google Calendar cuando se cancela un turno (`app/turnos/cancelar/route.js` no llama hoy a la API de Calendar).
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

## Usuarios / Mi Cuenta

### Tecnico
- `[~]` Completar carrito de compras: agregar funciona, falta sacar item, editar cantidad y finalizar compra.
- `[DECISION]` Completar wishlist/lista de deseos, si se decide usar.
- `[~]` Notificaciones estilo dropdown: ya muestra preview con titulo, cuerpo y fecha en el menu de campana. Confirmar con el usuario si falta algo especifico de "contenido completo" o si ya se considera resuelto.
- `[ ]` Revisar responsive en todas las pantallas para evitar textos fuera de recuadro (bug de layout, no rediseño — no choca con la restriccion de esperar el Figma).

Nota: la mejora de configuracion de cuenta (telefono, cambio de email con confirmacion, cambio de contraseña con confirmacion) que aparecia aca **ya esta implementada** en `app/mi-cuenta/profile/update/route.js` y `app/mi-cuenta/security/*`. Se saca de esta lista; queda documentada como funcionando en `PROJECT_STATUS.md`.

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
- `[BLOQUEADO: depende de definir las casillas reales]` Configurar DNS de email si se usa un servicio de correo externo.
- `[~]` `.env.example` sincronizado con la lista completa de variables de `PROJECT_STATUS.md` y agrupado por categoria. Completado el 2026-07-08.

Nota: "revisar RLS de tablas nuevas despues de cada modulo" y "mantener SQLs versionados y pasados por chat" ya no son tareas de esta lista — son convenciones de trabajo permanentes, documentadas en `PROJECT_STATUS.md` → "Convencion De Trabajo Entre IAs".

## UX / Diseño

### Tecnico (no choca con la restriccion de UI — son bugs de layout, no rediseño)
- `[ ]` Revisar todo mobile.
- `[ ]` Evitar texto comprimido o vertical en pantallas angostas.

### Bloqueadas por identidad visual (esperar Figma)
- `[BLOQUEADO: Figma definitivo pendiente]` Unificar botones, tarjetas y estados vacios.
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
