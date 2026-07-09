# LUMEN — Arquitectura de información

Este documento forma parte de la documentación fundacional de LUMEN, junto a `PROJECT_STATUS.md`, `TODO_LUMEN.md`, `docs/PRODUCT_PRINCIPLES.md` y `docs/AI_WORKFLOW.md`.

No es un documento técnico ni de implementación. Es una especificación funcional y de producto: define cómo se organiza LUMEN desde el punto de vista del usuario, qué responsabilidad tiene cada pantalla y cómo debe comportarse la navegación.

Su objetivo es que cualquier persona o IA que participe del proyecto —Claude, Codex, ChatGPT, futuros desarrolladores, futuros diseñadores o quien realice el Figma— entienda exactamente cómo debe organizarse la navegación de LUMEN, sin necesidad de leer código.

Este documento describe la arquitectura de información objetivo de LUMEN. Es la referencia a usar para futuras decisiones de navegación, para el trabajo de diseño y para la integración del Figma. Si en algún punto la implementación actual no coincide con lo descripto acá, esa diferencia debe tratarse como una tarea pendiente (ver `TODO_LUMEN.md`), no como una razón para cambiar este documento.

## Estado de implementación

Este documento describe la arquitectura objetivo de LUMEN.

No representa necesariamente la implementación actual del proyecto.

El estado real del código se documenta en:

- PROJECT_STATUS.md
- TODO_LUMEN.md

Las diferencias entre la arquitectura objetivo y la implementación actual deberán resolverse mediante tareas incrementales, respetando el flujo de trabajo definido para el proyecto.

## Filosofía

LUMEN debe separar con claridad dos cosas que suelen mezclarse en plataformas mal organizadas:

1. La **experiencia** del usuario: su actividad, su historial, lo que hace dentro de LUMEN (turnos, cursos, recursos, pedidos, mensajes).
2. La **administración** de su cuenta: sus datos personales, su facturación, sus preferencias.

El usuario nunca debería sentir que todo está mezclado dentro de una única página gigante. Cada pantalla debe tener una responsabilidad clara, de modo que la persona sepa, en todo momento, dónde está y para qué sirve ese lugar.

Esta separación es la base de todas las decisiones de navegación que siguen.

## Navegación pública

La navegación principal, visible para cualquier visitante, queda formada por:

- **Inicio** — Presenta LUMEN, comunica la propuesta general y orienta hacia los tres caminos principales: consultas, cursos y catálogo.
- **Consultas** — Punto de entrada para reservar una consulta profesional: elegir especialista y luego horario disponible.
- **Cursos** — Punto de entrada al catálogo de cursos asincrónicos disponibles para inscripción.
- **Catálogo** — Punto de entrada a productos físicos y recursos digitales que LUMEN ofrece fuera de las consultas y los cursos.
- **Contacto** — Vía de comunicación directa con LUMEN para consultas generales, dudas o soporte que no encajan en los otros caminos.

Estas cinco entradas representan los caminos centrales del producto. La navegación pública no debe crecer con secciones adicionales sin una razón clara: agregar una entrada nueva compite por atención con estos caminos principales.

## Menú del avatar (usuario logueado)

Cuando el usuario inició sesión, el menú superior derecho (avatar) reemplaza el acceso genérico de login y concentra el acceso a su actividad y a su cuenta:

```
Mi Espacio
Mi Perfil
────────────────
Carrito
Mis pedidos
Facturación
────────────────
Configuración
Cerrar sesión
```

Responsabilidad de cada opción:

- **Mi Espacio** — Dashboard del usuario. Resume su actividad dentro de LUMEN (turnos, cursos, recursos, certificados, mensajes, notificaciones) y permite acceder rápidamente a lo importante.
- **Mi Perfil** — Página con la información personal del usuario (identidad, contacto, credenciales).
- **Carrito** — Página que representa la compra en curso, antes de confirmarse.
- **Mis pedidos** — Historial de todas las compras ya realizadas, digitales y físicas.
- **Facturación** — Datos fiscales, comprobantes y facturas.
- **Configuración** — Preferencias del usuario sobre cómo usa la plataforma.
- **Cerrar sesión** — Finaliza la sesión activa.

Los separadores agrupan las opciones por tipo: actividad y cuenta personal arriba, historial de compras y facturación en el medio, preferencias y salida abajo. Este agrupamiento no es decorativo: refleja la separación entre experiencia y administración descripta en la filosofía de este documento.

## Mi Espacio

Mi Espacio funciona como **Dashboard**. No debe ser un panel administrativo ni una pantalla de configuración: debe mostrar únicamente la actividad del usuario dentro de LUMEN.

El Dashboard resume esa actividad y permite acceder rápidamente a lo importante, sin obligar a la persona a recorrer varias pantallas para entender su situación actual con LUMEN.

Las secciones de Mi Espacio son:

- **Mis turnos** — Consultas profesionales reservadas, próximas y pasadas, con su estado (confirmado, reprogramado, cancelado).
- **Mis cursos** — Cursos en los que el usuario está inscripto, con su progreso y acceso al aula.
- **Mis recursos** — Recursos digitales disponibles para el usuario (por ejemplo, descargas habilitadas por una compra).
- **Certificados** — Certificados obtenidos o en preparación, asociados a los cursos completados.
- **Mensajes** — Comunicaciones que LUMEN envía al usuario (avisos, novedades, respuestas).
- **Notificaciones** — Avisos breves sobre la actividad del usuario dentro de la plataforma (turnos, cursos, pedidos).

Mi Espacio no incluye carrito, pedidos, facturación, datos personales ni configuración: esas responsabilidades pertenecen a páginas independientes, accesibles desde el menú del avatar.

## Mi Perfil

Página independiente, separada de Mi Espacio y de Configuración.

Debe contener únicamente información personal del usuario. Ejemplos:

- Nombre.
- Foto.
- Email.
- Teléfono.
- Contraseña.
- Datos personales.

Mi Perfil no debe mezclarse con Configuración: Mi Perfil responde "quién es el usuario", Configuración responde "cómo prefiere usar la plataforma". Son preguntas distintas y merecen pantallas distintas.

## Carrito

Página independiente. No forma parte de Mi Espacio.

El Carrito representa una compra en curso, no una compra realizada. Por eso no pertenece al historial de actividad del usuario: es un estado transitorio.

Cuando el usuario finaliza la compra, el carrito deja de ser parte de su historial. Lo que queda registrado a partir de ese momento pertenece a Mis pedidos.

## Mis pedidos

Página independiente. Representa el historial de todas las compras realizadas por el usuario, sin importar el tipo de producto.

Dentro de la misma pantalla conviven dos grupos:

### Productos digitales

Ejemplos de acciones disponibles sobre estos pedidos:

- Descargar.
- Acceder al curso.
- Ver recurso.

### Productos físicos

Ejemplos de información disponible sobre estos pedidos:

- Estado.
- Código de seguimiento.
- Historial del pedido.

Ambos grupos pertenecen al mismo historial de pedidos: son dos formas de presentar información dentro de una misma pantalla, no dos secciones separadas. No se deben crear páginas distintas para "compras" y "pedidos": para el usuario son la misma cosa vista desde el mismo lugar.

## Facturación

Página independiente.

Reservada exclusivamente para:

- Facturas.
- Comprobantes.
- Información fiscal.

Facturación no debe mezclarse con Mis pedidos. Mis pedidos responde "qué compré y en qué estado está"; Facturación responde "qué necesito para mi comprobante fiscal". Son necesidades distintas, con momentos de uso distintos.

## Configuración

Página independiente.

Reservada para preferencias del usuario sobre cómo interactúa con LUMEN, no sobre quién es. Ejemplos futuros:

- Idioma.
- Notificaciones.
- Apariencia.
- Seguridad.

Configuración no debe mezclarse con Mi Perfil: los datos personales (nombre, email, teléfono, contraseña, foto) pertenecen a Mi Perfil, no a Configuración.

## Principios de arquitectura

- Cada pantalla tiene una única responsabilidad principal.
- Evitar páginas gigantes que mezclen demasiadas funciones.
- Separar la actividad del usuario (Mi Espacio) de la administración de su cuenta (Mi Perfil, Facturación, Configuración).
- Mantener la navegación simple: los caminos principales deben seguir siendo fáciles de encontrar.
- Priorizar claridad antes que cantidad de opciones: sumar una sección nueva solo si ayuda al usuario a entender mejor dónde está o qué puede hacer.
- Diseñar pensando en el crecimiento futuro: la estructura debe poder incorporar nuevas funciones sin romper la separación entre experiencia y administración.
- Esta arquitectura servirá como base para el futuro trabajo de diseño y para la integración del Figma.
