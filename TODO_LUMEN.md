# LUMEN - TODO

Ultima actualizacion: 2026-07-08

## Prioridad Alta

- Verificar dominio `espaciolumen.com` en Resend para poder enviar emails reales a pacientes, especialistas y admin.
- Actualizar variables de email luego de verificar dominio:
  - `EMAIL_FROM=LUMEN <contacto@espaciolumen.com>`
  - `CONTACT_EMAIL=lumenadmin.admin@gmail.com`
  - `EMAIL_REPLY_TO=lumenadmin.admin@gmail.com`
- Confirmar si `019_carla_riccio_profile.sql` fue ejecutado en Supabase.
- Cargar foto de perfil de Carla Riccio cuando el usuario la consiga.
- Revisar que Carla pueda entrar a `/especialista` si su usuario ya esta registrado.
- Configurar Mercado Pago Checkout Pro para cursos, consultas y catalogo.
- Conectar webhook de Mercado Pago para marcar compras/pagos como aprobados.

## Consultas Profesionales

- Enviar email automatico al especialista cuando se confirma un turno.
- Enviar recordatorios automaticos por email antes del turno.
- Terminar Google Calendar:
  - especialista conecta cuenta,
  - reserva crea evento,
  - reprogramacion actualiza evento,
  - cancelacion actualiza/cancela evento.
- Agregar video de presentacion del especialista junto a foto de perfil.
- Mejorar disponibilidad/calendario si se detectan fricciones de uso.
- Definir precio real por especialista.
- Definir URL real de consulta online o logica por especialista.

## Cursos

- Mejorar edicion rapida de cursos, modulos, lecciones y materiales en admin.
- Agregar confirmacion antes de eliminar cursos/modulos/lecciones/materiales.
- Revisar progreso, certificados y completado de cursos.
- Preparar certificados descargables.

## Catalogo

- Completar flujo real de compra de productos fisicos y digitales.
- Para productos digitales:
  - subir archivo en admin,
  - habilitar descarga luego de compra aprobada.
- Para productos fisicos:
  - confirmar datos de envio,
  - estado de pedido,
  - codigo de seguimiento,
  - notificaciones de pedido.
- Agregar imagenes reales de productos.

## Usuarios / Mi Cuenta

- Mejorar configuracion de cuenta:
  - telefono,
  - cambio de email con confirmacion,
  - cambio de contrasena con confirmacion.
- Completar carrito de compras.
- Completar wishlist/lista de deseos si se decide usar.
- Mejorar notificaciones estilo dropdown con contenido completo.
- Revisar responsive en todas las pantallas para evitar textos fuera de recuadro.

## Admin

- Mejorar manejo de usuarios:
  - detalle interno por usuario,
  - cursos habilitados,
  - pedidos,
  - turnos,
  - recursos digitales,
  - modificar roles,
  - agregar/quitar accesos.
- Confirmaciones antes de eliminar registros.
- Mejorar filtros y busquedas.
- Separar vistas internas donde el admin se vuelva demasiado largo.

## Facturacion

- Mantener flujo opcional post-pago:
  - preguntar si necesita factura,
  - datos fiscales,
  - estado de factura.
- Admin: facturas solicitadas.
- Futuro:
  - integrar AFIP/ARCA o generador de comprobantes.

## Legales

- Revisar politica de privacidad y terminos con abogado.
- Completar datos legales reales:
  - razon social/persona responsable,
  - CUIT,
  - domicilio legal,
  - email legal.

## Infraestructura

- Verificar dominio en Resend.
- Definir casillas reales:
  - contacto@espaciolumen.com
  - turnos@espaciolumen.com
  - notificaciones@espaciolumen.com
- Configurar DNS de email si se usa servicio de correo externo.
- Revisar Supabase RLS de tablas nuevas despues de cada modulo.
- Mantener SQLs versionados y pasados al usuario por chat.

## UX / Diseno

- Revisar todo mobile.
- Unificar botones, tarjetas y estados vacios.
- Evitar texto comprimido o vertical en pantallas angostas.
- Mejorar landing con contenido real cuando este definido.
- Reemplazar textos provisorios.
- Reemplazar imagenes provisorias.

## Pendiente De Producto

- Definir nombre final de marca/dominio si `espaciolumen.com` sera permanente.
- Definir identidad visual final:
  - colores,
  - tipografias,
  - logo,
  - tono de comunicacion.
- Definir precios finales.
- Definir politicas de cancelacion/reprogramacion.
- Definir alcance profesional y consentimiento informado para consultas.
