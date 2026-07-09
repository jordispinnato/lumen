# LUMEN - Product Backlog

Este documento resume el trabajo pendiente de LUMEN desde una mirada de producto. No reemplaza a `TODO_LUMEN.md`: no lista tareas tecnicas ni detalles de implementacion. Sirve para entender que iniciativas quedan abiertas, cuales ya avanzaron y que depende de decisiones externas.

## Estado general del producto

| Area | Estado | Avance estimado |
|---|---|---:|
| Arquitectura | En progreso | 90% |
| Backend / Supabase | Muy avanzado | 90% |
| UX | En progreso | 65% |
| Branding | Bloqueado por Figma | 20% |
| Turnos | Muy avanzado | 90% |
| Cursos | Muy avanzado | 85% |
| Aula | Muy avanzado | 85% |
| Catalogo | En progreso | 75% |
| Carrito | En progreso | 80% |
| Admin | Muy avanzado | 85% |
| Especialistas | Muy avanzado | 80% |
| Responsive | Pendiente | 60% |
| QA | Pendiente | 40% |
| MVP comercial estimado | En progreso | 65% |

Nota: estos porcentajes son estimaciones de producto para orientar prioridades. No son metricas tecnicas exactas ni reemplazan una auditoria de calidad o avance de implementacion.

## Arquitectura

- Objetivo: Mantener una navegacion clara entre experiencia del usuario, cuenta personal, compras, facturacion y configuracion.
- Estado: En progreso
- Dependencias: Validar si la arquitectura objetivo de `docs/INFORMATION_ARCHITECTURE.md` queda como definicion final de producto.
- Prioridad: Alta
- Breve descripcion: La separacion entre Mi Espacio, Carrito, Mis pedidos, Facturacion y Configuracion ya avanzo. Queda resolver el rol final de Mi Perfil, que hoy existe como pagina futura, y asegurar que la navegacion no mezcle actividad, datos personales y preferencias.

## UX

- Objetivo: Aumentar claridad, confianza y profesionalismo sin hacer un redisenio completo antes del Figma.
- Estado: En progreso
- Dependencias: Figma definitivo para decisiones visuales; revision de tono y textos visibles para ajustes de copy.
- Prioridad: Alta
- Breve descripcion: La experiencia ya tiene los flujos principales, pero quedan textos provisorios, estados vacios, nombres inconsistentes y mensajes que pueden sonar internos. Antes de salir al mercado conviene limpiar copy visible, botones, estados vacios y mensajes de error/exito.

## Catalogo

- Objetivo: Permitir que una persona explore productos fisicos y recursos digitales con informacion suficiente para decidir.
- Estado: En progreso
- Dependencias: Imagenes reales de productos, definicion de disponibilidad/stock, definicion del flujo final de pago.
- Prioridad: Alta
- Breve descripcion: El catalogo funciona y contempla productos fisicos y digitales. Falta cerrar la experiencia comercial: imagenes reales, mensajes no provisorios, claridad sobre disponibilidad, seguimiento de envios y descarga digital asociada a compras aprobadas.

## Carrito

- Objetivo: Representar una compra en curso de forma clara, editable y confiable.
- Estado: En progreso
- Dependencias: Definicion de finalizacion de compra antes de Mercado Pago; decision sobre si se crea pedido manual sin pago online.
- Prioridad: Alta
- Breve descripcion: El usuario ya puede agregar, quitar y cambiar cantidades, y ver totales. Falta el paso de finalizar compra para transformar el carrito en pedidos y dejar claro que ocurre despues.

## Turnos

- Objetivo: Permitir reservar, reprogramar y cancelar consultas profesionales online con claridad y trazabilidad.
- Estado: En progreso
- Dependencias: Precio real por especialista, politicas de cancelacion/reprogramacion, alcance profesional, consentimiento informado, URL real de consulta online, verificacion de email real.
- Prioridad: Alta
- Breve descripcion: El flujo de reserva ya funciona y evita doble reserva. Reprogramacion y cancelacion estan disponibles. Para mercado falta cerrar definiciones de negocio, legales/comunicacionales y pruebas reales de notificaciones y calendario.

## Cursos

- Objetivo: Ofrecer cursos asincronicos comprensibles, publicables y accesibles para usuarios inscriptos.
- Estado: En progreso
- Dependencias: Contenido real de cursos, precios finales, imagenes/portadas, definicion de certificados.
- Prioridad: Media
- Breve descripcion: La oferta de cursos y el acceso por inscripcion ya existen. Queda completar contenido real, mejorar la presentacion de cursos publicados y definir si certificados descargables forman parte del MVP.

## Aula

- Objetivo: Dar una experiencia privada de aprendizaje con progreso, lecciones y materiales.
- Estado: En progreso
- Dependencias: Contenido real cargado, decision sobre certificados, revision de textos provisorios.
- Prioridad: Media
- Breve descripcion: El aula muestra cursos, clases, materiales y progreso. La parte de certificados sigue como promesa futura y conviene decidir si se oculta, se comunica mejor o se convierte en funcionalidad real.

## Admin

- Objetivo: Dar al equipo de LUMEN control operativo sobre usuarios, cursos, especialistas, turnos, catalogo, mensajes y facturacion.
- Estado: En progreso
- Dependencias: Priorizacion de operaciones internas, validacion de confirmaciones en acciones sensibles, definicion de datos reales a gestionar.
- Prioridad: Alta
- Breve descripcion: El panel admin ya cubre muchas areas, pero debe sentirse ordenado, seguro y predecible. Antes del lanzamiento conviene revisar acciones destructivas, estados, busquedas/filtros y claridad de los textos internos visibles para el equipo.

## Especialistas

- Objetivo: Dar a cada especialista una vista profesional de agenda, pacientes, historial y seguimiento.
- Estado: En progreso
- Dependencias: Vinculacion real de especialistas, prueba de Google Calendar con cuenta real, definicion del perfil profesional final.
- Prioridad: Alta
- Breve descripcion: El panel de especialista ya incluye agenda, pacientes, historial y notas privadas. Queda validar la experiencia real con especialistas, completar perfiles y revisar mensajes tecnicos que no deberian aparecer como parte de la experiencia diaria.

## Facturacion

- Objetivo: Permitir al usuario cargar datos fiscales y solicitar comprobantes de compras.
- Estado: En progreso
- Dependencias: Datos legales/fiscales reales de LUMEN, definicion de facturacion post-pago, decision futura sobre integracion con comprobantes reales.
- Prioridad: Media
- Breve descripcion: El perfil fiscal y la solicitud de factura ya existen. Falta decidir como se conecta con pagos aprobados y reemplazar mensajes de etapa futura por una comunicacion operativa clara.

## Pagos

- Objetivo: Definir y habilitar el cobro real de cursos, consultas y productos.
- Estado: Bloqueado
- Dependencias: Pedido explicito del usuario para avanzar con Mercado Pago, definicion de precios, politicas comerciales y webhook de aprobacion de pagos.
- Prioridad: Alta
- Breve descripcion: El pago real es una pieza central para vender en mercado. Hoy no debe avanzarse con Mercado Pago sin autorizacion explicita. Mientras tanto, cualquier flujo alternativo debe comunicar con claridad que ocurre despues de una solicitud.

## Branding

- Objetivo: Consolidar identidad visual, tono, contenido real y confianza institucional.
- Estado: Bloqueado
- Dependencias: Figma definitivo, definicion de identidad visual, decision sobre marca/dominio final, imagenes reales y textos finales.
- Prioridad: Media
- Breve descripcion: LUMEN ya tiene una base visual y comunicacional, pero no debe cerrarse identidad desde codigo antes del Figma. Si puede avanzarse la limpieza de textos provisorios que afecten confianza.

## Responsive

- Objetivo: Asegurar que la plataforma sea usable en mobile como experiencia real, no solo visible.
- Estado: Pendiente
- Dependencias: Revision manual en pantallas chicas y definicion de ajustes permitidos antes del Figma.
- Prioridad: Alta
- Breve descripcion: Mobile es critico para consultas, cursos, catalogo y cuenta privada. Hay que revisar que textos, tarjetas, formularios, menus y acciones principales no se compriman ni se vuelvan dificiles de usar.

## QA

- Objetivo: Validar que los flujos principales sean confiables antes de exponerlos a usuarios reales.
- Estado: Pendiente
- Dependencias: Datos reales o de prueba representativos, usuarios con roles, configuracion final de servicios externos, checklist de lanzamiento.
- Prioridad: Alta
- Breve descripcion: Antes de salir al mercado hace falta probar registro/login, reserva, reprogramacion, cancelacion, cursos/aula, catalogo, carrito, pedidos, facturacion, mensajes, notificaciones, admin y especialista.

## Lanzamiento

- Objetivo: Preparar una salida al mercado ordenada, con promesas alineadas a lo que la plataforma realmente puede hacer.
- Estado: Pendiente
- Dependencias: MVP cerrado, dominio y emails listos, contenido real, decisiones legales/comerciales, pagos definidos o alternativa clara.
- Prioridad: Alta
- Breve descripcion: El lanzamiento no depende solo de codigo. Tambien requiere contenido real, datos de contacto reales, politicas, precios, emails, pruebas de punta a punta y una comunicacion honesta de lo que ya esta disponible.

## MVP

Debe estar listo si o si antes de salir al mercado:

- Navegacion clara entre Inicio, Consultas, Cursos, Catalogo, Contacto y Mi Espacio.
- Registro, login y roles funcionando para usuario, admin y especialista.
- Contacto con canales reales o, como minimo, sin datos provisorios visibles.
- Consultas profesionales con reserva, reprogramacion y cancelacion probadas.
- Politicas basicas de cancelacion/reprogramacion y alcance profesional definidos.
- Especialistas reales cargados con perfil, precio, disponibilidad y datos visibles correctos.
- Emails reales habilitados o una alternativa clara para confirmar comunicaciones.
- Cursos publicados con contenido real suficiente para vender o mostrar.
- Aula funcionando para usuarios inscriptos.
- Catalogo con productos/recursos reales, precios, disponibilidad y mensajes claros.
- Carrito con camino claro para finalizar o solicitar compra.
- Mis pedidos y Facturacion comprensibles para el usuario.
- Admin operativo para gestionar usuarios, cursos, turnos, catalogo, contacto y facturas.
- Panel especialista validado para agenda y seguimiento basico.
- Textos visibles sin placeholders tecnicos ni mensajes internos.
- Revision mobile de los flujos principales.
- Pruebas manuales completas antes de publicar.

## Post MVP

Puede esperar:

- Certificados descargables, salvo que sean parte de la propuesta comercial inicial.
- Video de presentacion de especialistas.
- Wishlist o lista de deseos.
- Integracion avanzada con comprobantes fiscales reales.
- Mejoras profundas del panel admin si el flujo operativo actual alcanza para el lanzamiento.
- Redisenio visual completo basado en Figma.
- Ajustes finos de identidad visual, componentes, iconografia y sistema de estilos.
- Automatizaciones avanzadas de seguimiento de envios o facturacion.
- Mejoras de calendario/disponibilidad si no aparecen fricciones reales en uso.

## Bloqueado

### Mercado Pago

- Pago real de cursos, consultas y catalogo.
- Webhook para marcar compras/pagos como aprobados.
- Flujo final de descarga digital atado a pago aprobado.
- Automatizacion completa de pedidos posteriores al pago.

### Figma

- Redisenio visual completo.
- Unificacion final de botones, tarjetas, estados vacios e iconografia.
- Identidad visual definitiva.
- Revision final de tono visual y jerarquia de pantallas.
- Reemplazo visual completo de assets provisorios.

### Decisiones del usuario

- Marca/dominio final si `espaciolumen.com` queda como definitivo.
- Precios finales de cursos, consultas y productos.
- Politicas de cancelacion y reprogramacion.
- Alcance profesional y consentimiento informado.
- Datos legales reales: responsable, CUIT, domicilio legal y email legal.
- Casillas reales de email y canales de contacto.
- Imagenes reales de productos, cursos y especialistas.
- Si Mi Perfil se desarrolla ahora o se mantiene fuera del MVP.
- Si certificados forman parte del MVP o quedan para despues.

## Próximo sprint

- Nombre: Arquitectura de navegación
- Estado: En progreso
- Objetivo: Separar Mi Espacio de la administración de cuenta, mover Carrito, Mis pedidos y Facturación a páginas independientes, y dejar Mi Espacio como dashboard de actividad.
- Responsable principal: Claude Code

## Sprint siguiente

- Nombre: Copy & Trust
- Objetivo: Eliminar placeholders visibles, textos internos, mensajes provisorios y problemas de tono que afecten confianza, profesionalismo y claridad.
- Ejemplos:
  - contacto@lumen.local
  - "archivo cargado"
  - "cuando conectemos pagos"
  - textos sin tildes
  - mensajes técnicos visibles para usuarios
