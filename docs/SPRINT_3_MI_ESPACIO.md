# Sprint 3 — Mi Espacio: Laboratorio de Identidad Visual

| Campo | Valor |
|---|---|
| Fecha | 2026-07-22 |
| Responsable | Claude (IA) |
| Alcance | Exclusivamente `Mi Espacio` (rutas `/mi-cuenta`, `/mis-turnos`, `/mis-cursos`, `/mis-recursos`, `/mis-notificaciones`, `/mis-mensajes`, `/mis-certificados` y el shell compartido) |
| Estado | Implementado, pendiente de validacion visual del usuario |

## 1. Objetivo del sprint

Este sprint no fue "implementar features de Mi Espacio": fue una **segunda interpretacion visual de LUMEN**, deliberadamente distinta de la Landing (que sigue siendo la primera interpretacion, guiada por el Product Bible, y que **no se toco** en este sprint). El objetivo es que el usuario pueda comparar "Landing actual VS Mi Espacio nuevo" y decidir que direccion representa mejor la esencia de LUMEN antes de extenderla al resto del producto.

Se combinaron tres fuentes con el mismo peso, segun el brief del sprint:

1. **Product Bible v1.0** — filosofia, accesibilidad, arquitectura de componentes.
2. **Manual de Marca** (PDF del estudio, 20 paginas, estudiado completo antes de escribir codigo).
3. **Propuesta de arquitectura de Mi Espacio** (analisis previo de este mismo asistente, "3 zonas": Lo proximo / Mi proceso / Mi historial y mis cosas).
4. Codigo y sistema de diseño de Sprint 1+2 (tokens, tipografia, `AppIcon`, accesibilidad) — reutilizado, no reinventado.

## 2. Hallazgos del Manual de Marca

El Manual (20 paginas reales — el conteo automatico inicial de 117 era incorrecto por tratarse de un PDF exportado desde una presentacion de Photoshop; se releyo pagina por pagina con un render propio) dejo tres hallazgos que cambian decisiones previas de Sprint 1/2:

- **Jerarquia de color corregida**: Petroleo y Turquesa estan etiquetados *ambos* como "color principal" en el Manual; Lavanda y Marfil como "color secundario". Sprint 1/2 habia tratado a Marfil como el neutro dominante (~70%) y a Turquesa como acento menor. Este sprint le da a Turquesa presencia real (bloques grandes, CTA, navegacion activa) y a Lavanda protagonismo en todo lo relacionado a progreso/evolucion, tal como pidio el usuario.
- **Lenguaje grafico**: formas organicas (blobs, cintas diagonales), circulos de linea superpuestos, patron del isotipo en baja opacidad como textura, listas tipo "icono + titulo + descripcion" en pastilla, y enfasis tipografico mixto (frase clave en un tratamiento distinto dentro de una oracion en sans). Se interpretaron estos principios con CSS (gradientes, formas asimetricas, tokens existentes) — **no se copio ningun mockup ni pieza grafica literal**.
- **Brecha de asset**: el Manual usa "Neulis Cursive" (script real) para enfasis emocionales. No tenemos esos archivos de fuente. **Decision del usuario**: no introducir una fuente script sustituta este sprint; el enfasis se logra con jerarquia, tamaño, peso y color sobre la tipografia ya definida (Neulis + Source Sans 3). Queda como asset pendiente para cuando el estudio entregue los archivos oficiales.

## 3. Arquitectura implementada

Se reemplazo la navegacion por anclas de una sola pagina por **rutas reales por dominio**, siguiendo el mismo patron que ya existia para `/facturacion`, `/configuracion`, `/mi-perfil`, `/carrito` y `/mis-pedidos` (paginas hermanas planas, no anidadas bajo `/mi-cuenta/`, para no romper la convencion ya establecida):

| Ruta | Zona (Fable) | Contenido |
|---|---|---|
| `/mi-cuenta` | Zona 1 — Lo proximo | Saludo, proxima consulta con CTA "Unirte a la consulta" cuando hay turno el mismo dia (`ONLINE_CONSULTATION_URL`), curso a continuar, checklist de bienvenida para cuentas nuevas |
| `/mis-turnos` | Zona 3 | Proximos turnos + historial, reprogramar/cancelar |
| `/mis-cursos` | Zona 2 — Mi proceso | Tabs reales (Todos/En progreso/Completados/Pendientes via `?estado=`), recorrido visual de progreso, grilla de cursos |
| `/mis-recursos` | Zona 3 | Recursos digitales comprados |
| `/mis-notificaciones` | Zona 3 | Listado completo de notificaciones |
| `/mis-mensajes` | Zona 3 | Listado completo de mensajes |
| `/mis-certificados` | Zona 3 | Placeholder (sin cambios funcionales, certificados no existen aun) |

Cambios de soporte para que el resto del producto siga apuntando correctamente a las rutas nuevas: `SiteNav.js` (dropdown de usuario y campana), `robots.js` (nuevas rutas privadas agregadas al disallow), y los enlaces/redirects que apuntaban a anclas viejas (`app/aula/page.js`, `app/checkout/pendiente/page.js`, `app/turnos/page.js`, `app/turnos/cancelar/route.js`, `app/catalogo/resources/[orderId]/download/route.js`, `app/admin/messages/create/route.js`).

Se extrajo logica compartida (`formatDate`, `formatTime`, `initialsFromName`, `getCourseState/Tone`, `buildCourseCards`, `getEnrollmentsWithProgress`, `ACCOUNT_NAV_ITEMS`) a `app/mi-cuenta/accountShared.js` para que las 7 rutas no dupliquen codigo.

`Billing` (`/facturacion`) y `Security` (`/configuracion`) no cambiaron funcionalmente: solo heredan el shell visual nuevo al compartir `AccountDashboardShell` y `AccountIcon`, tal como pidio el usuario. Lo mismo aplica, como efecto secundario esperado, a `/carrito` y `/mis-pedidos`.

## 4. Decisiones visuales

- **Sidebar** como bloque institucional solido en `--color-azul-900` (petroleo oscuro) con iconos en turquesa — reemplaza el fondo blanco/azul generico anterior. Es el primer elemento "grande de color" que ancla la identidad.
- **Hero de Zona 1** (`.account-hero--home`): fondo petroleo oscuro con dos manchas radiales (lavanda abajo-izquierda, turquesa arriba-derecha) simulando el "blob" organico del Manual sin copiar ninguna pieza — texto en marfil, CTA en turquesa solido.
- **Turquesa con presencia real**: CTA principal, badges de notificacion, estado activo de navegacion, tabs activos de "En progreso"/"Completados".
- **Lavanda para progreso/evolucion**: barra de progreso de cursos, "recorrido" (`.account-journey-path`) — una fila de puntos conectados que se llenan en lavanda a medida que se completan cursos, checklist de bienvenida.
- **Marfil como aire**: fondos de paneles y del shell en `--color-marfil-500`, mas espacio que la grilla de metricas anterior.
- **Iconografia real**: se reemplazaron los avatares de letra (T, C, R, N, M, D, I) por `AppIcon` (Lucide) en toda la navegacion y encabezados de panel — se sumaron `home`, `bell`, `award`, `trending-up`, `video`, `sparkles`, `compass`, `user`, `settings`, `credit-card` al mapa existente.
- **Eliminado**: la grilla de `StatCard` con colores fuera de marca (`tone="blue/purple/green/orange"` con hex literales azul/violeta/verde/naranja genericos), las tabs de cursos decorativas (`<span>` sin funcion), y el override `body:has(.account-app-shell){background:#f4f7fb}`.
- **Tonos de `AccountIcon`** (`is-blue/is-purple/is-green/is-orange`, usados tambien por `/carrito`, `/mis-pedidos` y el panel de especialista) se re-mapearon a tokens de marca en vez de eliminarse, para no tocar el contenido de paginas fuera de alcance.

## 5. Comparativa: Landing vs Mi Espacio

| Aspecto | Landing (Sprint 2) | Mi Espacio (Sprint 3) |
|---|---|---|
| Fuente principal | Product Bible | Manual de Marca + arquitectura de Fable |
| Rol dominante | Marfil (aire, confianza institucional) | Petroleo + Turquesa (bloques solidos) con Lavanda como acento de progreso |
| Composicion | Secciones editoriales alternadas (marfil/blanco) | Bloques de color solido + paneles sobre fondo marfil |
| Iconografia | `AppIcon` en tarjetas y FAQ | `AppIcon` en navegacion, paneles y checklist |
| Elemento organico | Patron de circulos como fondo de hero | Manchas radiales + recorrido de progreso |
| Tipografia emocional | No aplica (landing informativa) | Reservada para futuro (brecha de Neulis Cursive) |

Ambas comparten: mismos tokens de color/tipografia/motion, mismo `AppIcon`, misma base de accesibilidad (skip-link, foco visible, `prefers-reduced-motion`).

## 6. Accesibilidad y responsive

- Todos los elementos decorativos (`.account-hero--home::before`, gradientes) usan `pointer-events:none` y no interfieren con foco/lectura.
- Verificado en 375px (mobile): sin scroll horizontal, sidebar colapsa a menu hamburguesa fijo, sin solapamientos.
- Tabs de cursos y navegacion siguen siendo enlaces reales (`<Link>`), no `<span>` — accesibles por teclado y lectores de pantalla.

## 7. Asset pendiente (no bloqueante)

**Neulis Cursive**: el Manual de Marca la define como tipografia secundaria para frases y microcopys emocionales. No esta entre los archivos de branding disponibles. Por pedido explicito del usuario, no se sustituyo por ninguna fuente script de terceros; los enfasis se resuelven con jerarquia/color/peso sobre Neulis + Source Sans 3. Cuando el estudio entregue los archivos reales, se puede sumar como una tercera voz tipografica exclusivamente para microcopys, sin tocar navegacion, formularios ni tablas.

## 8. Hallazgo de entorno (no es una regresion de este sprint)

Durante el QA en el navegador embebido se detecto que las paginas del shell de Mi Espacio (`/mi-cuenta`, `/mis-turnos`, etc.) muestran temporalmente el esqueleto de carga (`loading.js`) superpuesto al contenido real en el DOM, incluso despues de que la pagina termina de cargar. Se verifico que:

- No es un bug introducido en este sprint: se reproduce igual en `/mi-perfil`, una pagina que ya existia y que solo cambio una prop.
- No hay errores en consola ni en el servidor.
- El contenido real (verificado leyendo estilos computados) es estructural y visualmente correcto — es la misma clase de limitacion de temporizacion del navegador de pruebas automatizado ya documentada dos veces en Sprint 1/2 (transiciones de `:focus-visible` y de `<details>` no reflejadas via scripts).

Recomendacion: confirmar con un Tab/click real en un navegador real antes de dar por cerrado el sprint al 100% (mismo tipo de verificacion manual ya pendiente de Sprint 1/2).

## 8.1. Correccion post-QA: marca residual junto al logotipo

Durante la validacion del usuario se detecto un pequeño simbolo blanco junto al logotipo "lumen." en el header. Causa raiz: `app/components/LumenIsotipo.js` usaba `viewBox="0 0 1080 1080"` (el artboard cuadrado original del archivo de marca), pero el dibujo real del isotipo solo ocupa una región de `205.9 x 275.9` unidades dentro de ese lienzo (verificado con `getBBox()` en el navegador). Al mostrar el SVG en una caja de 30x30px, el 81% restante del viewBox era espacio vacio, asi que el trazo real se veia como una mancha diminuta en vez de una marca reconocible.

Fix: `viewBox` recortado a `415.95 355.06 245.91 315.95` (bounding box real + margen). No se toco el `path` (el dibujo en si no cambio, solo el encuadre). Afecta a los dos usos compartidos del componente: `app/layout.js` (header y footer del sitio publico, incluida la Landing) y `app/mi-cuenta/AccountDashboardShell.js` (sidebar de Mi Espacio). Verificado: el trazo ahora ocupa ~65-87% de la caja de 30x30px, alineacion vertical con el logotipo sin cambios, sin overflow horizontal en 375px, link del logo sigue apuntando a `/` con su `aria-label`.

## 9. Backlog generado

- `[ ]` Sumar Neulis Cursive (u otra fuente script oficial) cuando el estudio la entregue, exclusivamente para microcopys emocionales.
- `[ ]` Confirmar visualmente en navegador real que `loading.js` no queda superpuesto al contenido real en ninguna pagina del shell de cuenta (ver seccion 8).
- `[ ]` Evaluar extender el lenguaje visual de este sprint (bloques de color, recorrido de progreso, checklist de bienvenida) a Cursos, Catalogo, Consultas y Checkout — **solo si el usuario valida esta direccion frente a la Landing**.
- `[ ]` `/mis-certificados` sigue siendo un placeholder (sin tabla ni logica) — no cambio de alcance en este sprint.
- `[ ]` Revisar si conviene agregar accesos directos a `/mis-turnos`, `/mis-cursos` y `/mis-recursos` en el dropdown de usuario de `SiteNav.js` (hoy solo tiene "Mi Espacio" generico) — no incluido en este sprint para no exceder el alcance acordado.

## 10. QA tecnico

- `npm run build`: OK, 79 rutas generadas, incluyendo las 6 rutas nuevas.
- `npm run lint`: sin errores ni warnings.
- Verificacion funcional en navegador (cuenta de prueba descartable creada para QA): las 7 paginas cargan, protegen por sesion, navegacion activa resalta la ruta correcta, tabs de cursos filtran via `searchParams`, colores computados coinciden con los tokens de marca (sidebar `--color-azul-900`, CTA `--color-turquesa-500`), sin overflow horizontal en 375px.
