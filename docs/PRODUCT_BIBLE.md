# LUMEN — Product Bible v1.0

**Documento oficial de definición de producto de LUMEN.**

## Nota de procedencia de este documento

Este documento **no fue redactado desde cero**. Es la consolidación, en un único archivo versionado, de decisiones de producto que ya existían dispersas en el proyecto:

1. **`LUMEN PRODUCT BIBLE v1.0`** (2 partes, 20 capítulos) — redactada el 2026-07-21 durante una sesión de análisis con el equipo de dirección de producto (Head of Product, Head of Product Design, Design Systems Lead, Senior UX Researcher, Staff Product Engineer, Creative Director), entregada por chat y nunca antes versionada como archivo.
2. **`AUDITORÍA INTEGRAL DE PRODUCTO — LUMEN`** (5 partes, 18 capítulos) — la auditoría previa a la Bible, redactada el mismo día por el mismo equipo, que fundamenta con evidencia de código y de producto cada decisión posterior de la Bible.
3. **La decisión oficial de modelo de negocio sobre propiedad de los cursos**, tomada explícitamente por el usuario el 2026-07-22, previa al Sprint 4.
4. La documentación ya versionada del repositorio: `docs/PRODUCT_PRINCIPLES.md`, `docs/INFORMATION_ARCHITECTURE.md`, `docs/PRODUCT_BACKLOG.md`, `PROJECT_STATUS.md` y `TODO_LUMEN.md`.

El contenido de las fuentes 1 y 2 se reproduce **fielmente**, sin reinterpretar ni resumir, reorganizado bajo la estructura de secciones solicitada. Donde una decisión no fue tomada por ninguna fuente, se indica explícitamente como **"Pendiente de definición"**. Donde se detectó una contradicción funcional o de producto que sigue genuinamente abierta, se documenta en **"Pendientes de validación"** sin resolverla unilateralmente.

A partir de su versionado, `docs/PRODUCT_BIBLE.md` es la **fuente oficial de decisiones de producto de LUMEN**, con prioridad sobre el código existente ante cualquier conflicto, tal como establecía la Bible original.

## Jerarquía oficial de documentación (2026-07-22)

1. **Nivel 1 — Máxima prioridad: la carpeta oficial `branding-lumen/` y el Manual de Marca.** Son la fuente de verdad para todo lo relacionado con identidad visual, branding, colores, tipografía, logotipo, iconografía, espaciados, ilustraciones, motion y sistema visual. Ante cualquier diferencia con esta Bible o con cualquier otro documento, **siempre prevalecen estas dos fuentes**.
2. **Nivel 2 — `docs/PRODUCT_BIBLE.md`** (este documento). Fuente oficial para visión, filosofía, modelo de negocio, principios de producto, experiencia de usuario, arquitectura funcional, módulos y roadmap. Debe respetar siempre las decisiones del Nivel 1; nunca las reemplaza.
3. **Nivel 3 — `docs/PRODUCT_PRINCIPLES.md`.** Enfocado únicamente en UX, interacción, accesibilidad, consistencia y principios generales de diseño. No contiene decisiones de branding ni de negocio.
4. **Nivel 4 — `PROJECT_STATUS.md`.** Únicamente estado del proyecto.
5. **Nivel 5 — `TODO_LUMEN.md`.** Únicamente tareas pendientes.

Como consecuencia de esta jerarquía, las contradicciones de branding/color/tipografía/iconografía que esta Bible había registrado en su primera versión (2026-07-22, antes de esta revisión) quedaron **resueltas automáticamente a favor del Manual de Marca y de la carpeta `branding-lumen/`** (ver "Branding" y el historial al pie de "Pendientes de validación").

---

# Visión

## Qué es LUMEN

LUMEN es **un espacio de cuidado continuo**. Una plataforma donde una persona encuentra acompañamiento profesional real (consultas), herramientas para crecer entre consultas (cursos) y recursos concretos para su día a día (catálogo) — **unidos como un solo proceso, no como tres productos que comparten un login**.

La unidad de valor de LUMEN no es la sesión, ni el curso, ni el producto. Es **el proceso de la persona**. Todo lo demás son medios.

## El problema que resuelve

El cuidado emocional hoy está fragmentado: la terapia vive en un consultorio (o un link perdido en un email), el aprendizaje en plataformas anónimas, las herramientas en tiendas genéricas, y entre una sesión y la siguiente hay dos semanas de nada. LUMEN resuelve **la discontinuidad**: un solo lugar donde el proceso de una persona tiene memoria, dirección y compañía.

## North Star Statement

> **LUMEN existe para que nadie transite solo su proceso.**
> Cada pantalla, cada palabra y cada detalle deben responder una sola pregunta:
> *¿esto acompaña, o solo funciona?*

## La tesis a dos años (visión de negocio)

LUMEN no debe competir como "plataforma de terapia online" (guerra de precios), ni como "plataforma de cursos" (océano rojo absoluto). Su jugada única es la **continuidad del cuidado**: el único lugar donde la consulta, el aprendizaje entre consultas y las herramientas concretas forman *un solo proceso*. La profesional te ve el jueves; te deja un curso corto para el mes; te sugiere el recurso táctil para la ansiedad; todo queda en tu espacio, con tu progreso. Nadie en el mercado hispanohablante cierra ese círculo. Cada decisión se evalúa contra una sola pregunta: *¿fortalece el círculo?*

El riesgo principal a gestionar: que el producto siga acumulando módulos correctos sin cerrar el círculo emocional. Los próximos años se ganan construyendo *significado* — que el usuario sienta que hay alguien del otro lado.

---

# Filosofía

Seis principios. Cada uno con su regla de decisión — la frase que cierra discusiones.

1. **Calma antes que impacto.** La estética de LUMEN es la contención: pocos colores por pantalla, un solo elemento protagonista, silencio visual alrededor de lo importante. *Regla de decisión: si una propuesta visual llama la atención pero agrega tensión, se rechaza.*

2. **La precisión es la confianza.** En salud, el descuido chico se lee como descuido grande. Una tilde faltante, un horario ambiguo, un peso tipográfico arbitrario: todos descuentan del mismo banco. *Regla: ningún detalle es "menor" si el usuario puede verlo.*

3. **Continuidad ante todo.** El producto siempre sabe dónde está el usuario en su proceso y siempre le ofrece el paso siguiente. Ninguna pantalla es un callejón. *Regla: toda pantalla debe poder responder "¿y ahora qué?".*

4. **Humanidad primero.** Donde se pueda mostrar una persona real (profesional con rostro, nombre y matrícula), se muestra. La tecnología va detrás del mostrador. *Regla: ante la duda entre automatizar o humanizar un momento sensible, se humaniza.*

5. **Claridad sobre decoración.** Heredado de los principios existentes del proyecto y ratificado: cada elemento visual debe poder justificar qué comunica. *Regla: lo que no informa ni orienta ni da calidez con propósito, se elimina.*

6. **Nada a medias.** Una funcionalidad incompleta visible es peor que su ausencia. *Regla: se lanza terminado o no se muestra. Sin excepciones, sin "en preparación".*

---

# Principios de producto

Esta sección reproduce fielmente los "Principios de producto" ya definidos en `docs/PRODUCT_PRINCIPLES.md`, documento que sigue siendo la referencia viva y detallada de principios de diseño, UX y experiencia (ver también la sección "Experiencia de Usuario" de este documento).

1. **LUMEN debe ordenar la experiencia.** La plataforma debe ayudar a ordenar tres grandes caminos: Consultas profesionales, Cursos, Catálogo de recursos. Aunque el proyecto crezca, el usuario siempre debe poder entender rápidamente cuál de esos caminos necesita.

2. **La confianza se construye con transparencia.** Antes de que una persona reserve, compre o cargue datos, debe entender qué está solicitando, quién la acompaña, qué pasa después y cuáles son los límites actuales del proceso. Si una función todavía está en preparación, no debe prometer más de lo que realmente hace.

3. **El área privada debe sentirse como un espacio propio.** "Mi Cuenta" o "Mi Espacio" debe ser el lugar donde el usuario entiende su relación con LUMEN: sus turnos, sus cursos, sus recursos, sus pedidos, sus mensajes, sus datos personales, su facturación. Debe sentirse como una plataforma organizada, no como una página suelta.

4. **El panel admin debe priorizar control y orden.** El admin no necesita ser decorativo. Necesita ser claro, predecible y seguro. Las acciones destructivas o sensibles deben pedir confirmación y explicar qué va a pasar.

5. **El panel especialista debe priorizar agenda y seguimiento.** El especialista necesita ver con claridad sus turnos, sus pacientes, el historial de consultas, notas privadas y datos relevantes para seguimiento. La experiencia debe sentirse profesional y reservada, no social ni informal.

6. **Crecer sin perder simplicidad.** LUMEN puede sumar nuevas funciones en el futuro, pero cada incorporación debe responder una pregunta: ¿esto ayuda al usuario a avanzar con más claridad, confianza o autonomía? Si la respuesta no es clara, conviene dejarlo como pendiente antes de sobrecargar la plataforma.

---

# Identidad de LUMEN

## Qué NO es LUMEN

Estas negaciones son vinculantes. Cualquier propuesta futura que empuje hacia alguna de ellas se rechaza por defecto:

- **No es un marketplace de terapeutas.** LUMEN es una marca con un equipo curado. El usuario confía en LUMEN, y LUMEN responde por sus profesionales. Nunca competiremos por volumen de oferta.
- **No es una app de bienestar genérico.** No vendemos meditaciones en cinta transportadora ni frases motivacionales. Detrás de cada interacción hay profesionales matriculados reales.
- **No es una plataforma de cursos.** Los cursos existen para sostener el proceso entre consultas, no para competir con Coursera.
- **No es una red social ni una comunidad.** No habrá foros, likes, ni exposición entre pacientes. La intimidad es un rasgo del producto, no una limitación.
- **No es un producto de urgencias ni de crisis.** LUMEN acompaña procesos; no reemplaza servicios de emergencia, y lo dice con claridad donde corresponde.

## Qué debe sentir el usuario

En orden de prioridad: **calma** (nada grita, nada apura), **confianza** (precisión en cada detalle: una tilde, un horario, una matrícula), **acompañamiento** (siempre hay un próximo paso y alguien del otro lado), **pertenencia** (esto es *mi* espacio, con *mi* proceso).

## Qué no debe sentirse nunca

Nunca burocracia (trámites, formularios fríos, jerga administrativa). Nunca ansiedad inducida (urgencia artificial, contadores agresivos, culpa por inactividad). Nunca frialdad clínica (hospital, expediente, número de paciente). Nunca ruido comercial (pop-ups, ofertas insistentes, dark patterns — prohibidos de forma absoluta). Nunca abandono (pantallas sin salida, promesas incumplidas, funciones a medias).

---

# Modelo de negocio

## Propiedad de los cursos

**Decisión oficial del usuario, registrada el 2026-07-22, previa al Sprint 4.**

LUMEN es propietario de los cursos comercializados en la plataforma.

LUMEN no funciona como un marketplace abierto donde cada profesional publica y vende sus propios cursos.

Los profesionales pueden participar como autores, instructores o especialistas del contenido, pero:

- no son propietarios comerciales del curso;
- no publican cursos de manera autónoma;
- no venden directamente al alumno;
- el cliente compra el curso a LUMEN;
- el precio, la publicación, la experiencia y la comercialización son gestionados por LUMEN.

La arquitectura conceptual refleja que:

- un curso es un producto de LUMEN;
- un curso puede tener uno o varios autores o profesionales asociados;
- un profesional puede participar en varios cursos;
- un profesional también puede ofrecer consultas dentro de la plataforma;
- el perfil público del profesional podrá mostrar los cursos en los que participa;
- la marca principal y propietaria del producto siempre es LUMEN.

### Diferencia entre cursos y consultas

**Cursos:**
- Producto digital propiedad de LUMEN.
- Vendido y administrado por LUMEN.
- Puede incluir uno o varios profesionales como autores o instructores.

**Consultas:**
- Servicio prestado por un profesional dentro de la plataforma.
- El profesional es quien brinda la atención.
- La plataforma organiza la experiencia, la reserva y la relación con el usuario.

### Rol de los profesionales

Los profesionales pueden participar en LUMEN como:

- autores o instructores de cursos;
- prestadores de consultas;
- ambas funciones simultáneamente.

El perfil público de cada profesional podrá mostrar: biografía, especialidad, credenciales, cursos en los que participa y consultas disponibles.

## Posicionamiento (consistente con la Bible original)

LUMEN no es un marketplace abierto de cursos creados y vendidos libremente por terceros. Es una plataforma educativa y de servicios profesionales donde LUMEN selecciona expertos, produce y organiza la experiencia, mantiene el control de calidad y comercializa los productos bajo su propia marca. La marca principal siempre es LUMEN.

Esta decisión es consistente con — y hace explícita — una posición que la Bible original ya sostenía de forma general: "No es un marketplace de terapeutas" (sección "Identidad de LUMEN") y "el catálogo es la tienda del consultorio, no un marketplace" (sección "Catálogo"). La novedad de esta decisión es extender explícitamente el mismo principio de no-marketplace al módulo de Cursos, con las reglas concretas de autoría/propiedad detalladas arriba.

---

# Cursos

**Antes** — la página del curso es una página de decisión, no una ficha técnica: qué vas a lograr (resultado, no índice), el temario completo visible (la transparencia vende), quién lo dicta con rostro y matrícula enlazando a su perfil, para quién es y para quién no, precio sin rodeos. Un curso se compra como se elige un terapeuta: por confianza.

**Durante** — el aula es el templo de la concentración: la voz de producto en medida de lectura perfecta, el video protagonista, navegación anterior/siguiente siempre presente, la posición se recuerda sola (volver al aula = volver exactamente donde estabas, sin buscar), materiales a un click, y el progreso visible pero sereno — la barra acompaña, no presiona. Nada de gamificación ansiosa: ni rachas, ni puntos, ni culpa por pausar. El ritmo lo pone la persona.

**Después** — terminar un curso es un logro emocional y se trata como tal: pantalla de cierre ceremonial (la Celebración oficial, ver "Experiencia de Usuario"), un mensaje que honra el recorrido, y la continuidad inmediata: qué curso sigue, o la invitación a conversar lo aprendido en consulta — el círculo LUMEN cerrándose. Cuando existan certificados, se entregan acá; hasta entonces, este momento no los menciona.

**Cómo debe sentirse aprender en LUMEN:** como leer un buen libro que te prestó tu terapeuta — no como rendir una materia.

### Diagnóstico de partida (para Sprint 4, no decisiones — evidencia de la auditoría de producto)

- El recorrido hoy es `/cursos` (listado) → `/cursos/[slug]` (detalle) → checkout → habilitación → `/aula` (cursada) → "finalizado" → certificado inexistente.
- El listado no tiene filtros por categoría o nivel (los campos existen en el esquema y se cargan en admin, pero la UI los descarta), ni ordenamiento.
- El detalle del curso no está construido como página de venta: sin temario expandible, sin bio del instructor enlazada a su perfil, sin FAQ del curso, sin testimonios.
- El tramo de checkout hoy desemboca en `/transferencia`, un flujo manual (mientras Mercado Pago espere autorización explícita).
- El aula es la parte mejor construida del módulo: sidebar con switcher de cursos, progreso por lección, video embebido, materiales con URLs firmadas. Falta reanudación de posición dentro del video, navegación anterior/siguiente, notas del alumno, y un cierre de curso celebratorio (hoy es un texto interno de desarrollo mostrado al usuario).

---

# Consultas

Las cinco fases, definidas de punta a punta:

**1. Reserva.** El flujo modal actual es la base correcta y se conserva: elegir profesional → fecha y horario → confirmar, con la selección sobreviviendo al login. Se le suman tres leyes: el precio y la duración visibles en todo momento; **toda hora se muestra siempre en la zona horaria del usuario, con la zona explícita** (ley desde ya, aunque la expansión internacional llegue después); y la política de cancelación aparece *antes* de confirmar, no escondida en legales.

**2. Confirmación.** Al reservar: pantalla de confirmación serena + email + **"Agregar a mi calendario"** como acción destacada. El turno del usuario debe vivir donde vive su vida, no solo dentro de LUMEN.

**3. Espera** (el tiempo entre reserva y consulta). Recordatorios escalonados (al reservar, el día anterior, una hora antes). En Mi Espacio, la card del turno madura con el tiempo: informativa de lejos, protagonista al acercarse. Opcional y suave, la preparación: "¿Querés anotar algo que te gustaría hablar?" — privado, sin presión.

**4. Consulta.** El acceso es trivial: el botón "Unirse" disponible desde Mi Espacio y desde el email, activo desde 15 minutos antes. La regla: **llegar a la consulta nunca puede requerir buscar nada.**

**5. Post-consulta y seguimiento.** El turno pasa al historial con dignidad (no desaparece); si la profesional sugiere un curso o recurso, la sugerencia aparece en la Zona 1 de Mi Espacio con su nombre y su rostro — el gesto de continuidad más valioso del producto —; y la re-reserva está a un click ("Volver a reservar con Carla"). La métrica reina del negocio (la segunda consulta) se gana en esta fase, no en la primera.

### Diagnóstico de partida (evidencia de la auditoría de producto)

- El núcleo transaccional es sólido: doble reserva imposible, reprogramación y cancelación con trazabilidad, consentimiento con versión, sincronización con Google Calendar del profesional.
- **Zonas horarias: no existen hoy.** `slot_date`/`slot_time` son fecha y hora sin zona; todo el sistema asume implícitamente huso horario argentino. Bloqueante estructural para expansión internacional (decisión de diseño ya tomada arriba: UTC + zona explícita; implementación pendiente).
- El paciente no recibe hoy el link de la consulta en ningún elemento de la UI, ni "agregar a mi calendario" tras reservar. Con los recordatorios por email bloqueados por verificación de dominio en Resend, hoy ningún mecanismo le recuerda al paciente su consulta.
- Política de cancelación: hoy se puede cancelar un turno 5 minutos antes sin fricción ni aviso (política de negocio marcada como `[DECISION]`, ver "Pendientes de definición").

---

# Catálogo

**Decisión de rol:** el catálogo es **la tienda del consultorio, no un marketplace**. Es la vitrina curada de herramientas que las profesionales realmente recomiendan — chica, cuidada y creíble. Renuncia explícita: LUMEN no competirá en volumen, variedad ni precio con el e-commerce genérico; competirá en **prescripción** ("esto lo recomienda tu profesional") que nadie más puede ofrecer.

**Cómo debe sentirse:** como la estantería de recursos de un buen consultorio — pocos objetos, todos con razón de estar. Cada producto con fotografía real obligatoria (**sin foto no se publica** — ley), el porqué terapéutico en una línea ("para qué sirve", no solo "qué es"), y cuando corresponda, la conexión humana: "recomendado por…".

**Convivencia con el resto:** el catálogo nunca interrumpe (cero venta cruzada agresiva dentro de consultas o cursos); aparece solo por invitación contextual legítima — la sugerencia post-consulta, el material complementario de un curso. Búsqueda y filtros crecen cuando el inventario lo pida; la curaduría siempre importará más que el buscador.

### Diagnóstico de partida (evidencia de la auditoría de producto)

El hallazgo mayor: **las cards de producto no tienen fotografía**. El esquema ni siquiera contempla imágenes de producto para el catálogo. Filtros hoy: tres chips (Todos/Físicos/Digitales) y nada más, sin búsqueda por texto ni orden por precio o novedad. "Stock: 12" se expone crudo en vez de "Disponible"/"Últimas unidades".

---

# Mi Espacio

**La decisión madre:** Mi Espacio deja de ser un tablero de métricas y pasa a ser **la sala de estar del proceso del usuario**. Se organiza en tres zonas fijas, con jerarquía descendente inviolable.

**Zona 1 — "Lo próximo" (la protagonista absoluta).** Al entrar, el usuario ve **una sola cosa grande**: la card de su momento más cercano, elegida por esta prioridad:
1. *Consulta hoy o inminente* → card dominante con countdown y el botón **"Unirse a la consulta"** como el elemento más importante de toda la pantalla. Este botón es sagrado: existe siempre que exista consulta online próxima.
2. *Consulta futura* → fecha, hora en la zona horaria del usuario, profesional con foto, y las acciones de gestión en segundo plano.
3. *Sin consulta pero con curso activo* → "Continuá donde quedaste": curso, clase exacta, un click.
4. *Nada activo* → invitación cálida con ilustración de marca: reservar o explorar. Nunca cuatro ceros.

**Zona 2 — "Mi proceso".** Turnos próximos y cursos en progreso, en cards de marca: fotografías de las profesionales, progreso en lavanda (es *del usuario*), números en Neulis. Las métricas frías (promedios, contadores) quedan eliminadas del espacio del paciente: eran información de administrador en la pantalla equivocada.

**Zona 3 — "Mi historial y mis cosas".** Consultas pasadas, recursos adquiridos, actividad — presente pero silencioso, colapsable, sin competir.

**Navegación — decisión definitiva:** el área privada se organiza en **páginas reales por dominio** bajo un mismo shell (el modelo de anclas dentro de una página larga queda retirado). Cada sección tiene URL propia, el sidebar navega de verdad, y el dashboard es el agregador liviano de todas.

**Continuidad y acompañamiento:** primera visita con checklist de bienvenida (tres pasos, desaparece al completarse); recordatorios por email como estándar del servicio; después de cada consulta, el espacio refleja el evento ("¿Cómo estuvo tu consulta con Carla?" — cierre suave, sin encuesta invasiva). Certificados, favoritos y toda función futura **no existen en la interfaz hasta que existan de verdad** (Regla de Oro #1).

**El test de éxito de Mi Espacio:** si el usuario entra y en dos segundos no sabe cuál es su próximo paso, la pantalla está mal. Siempre.

## Estado de implementación

Sprint 3 (2026-07-22, ver `docs/SPRINT_3_MI_ESPACIO.md`) implementó la arquitectura de páginas reales por dominio (`/mi-cuenta`, `/mis-turnos`, `/mis-cursos`, `/mis-recursos`, `/mis-notificaciones`, `/mis-mensajes`, `/mis-certificados`) y la Zona 1 con card de próxima consulta + botón "Unirse a la consulta" + checklist de bienvenida. El tratamiento visual de color usado (sidebar sólido en Petróleo, mayor presencia de Turquesa) sigue la jerarquía de color del Manual de Marca revisada en "Branding" — ya no es una contradicción abierta.

---

# Experiencia de Usuario

## Landing

La landing tiene un solo trabajo: **convertir desconfianza en primera reserva**. Todo lo que no sirva a ese trabajo, sale.

**Decisión estructural previa:** la landing es para visitantes. **Quien tiene sesión activa no la ve**: entra directo a Mi Espacio. El usuario recurrente no necesita que le vendan lo que ya compró.

**La secuencia definitiva (ocho actos, en este orden):**

1. **Hero — la promesa humana.** Fotografía real de una profesional del equipo (luz cálida, fondo en paleta), un titular que promete el resultado y no el mecanismo. Un solo CTA primario ("Reservá tu primera consulta") y uno secundario fantasma ("Conocé al equipo"). Nada más: ni bullets, ni badges, ni ruido.
2. **Franja de confianza inmediata.** Una línea horizontal sobria: profesionales matriculados · consultas online · proceso confidencial. Sin números inflados; cuando existan métricas reales, se suman.
3. **Los tres caminos** (consultas / cursos / recursos). Se mantiene la estructura actual; cada card cierra con su acción propia.
4. **El equipo.** Las profesionales con fotografía unificada, matrícula como chip visible, enfoque en una línea, precio transparente, y acceso al perfil completo.
5. **Cómo funciona** — tres pasos, recoloreados a marca, sin cambios de fondo.
6. **Voces reales.** Dos o tres testimonios (con consentimiento, nombre de pila e inicial). Hasta que existan, esta sección **no se muestra** — jamás testimonios inventados.
7. **Preguntas frecuentes.** Seis respuestas: precio, cómo es la videoconsulta, confidencialidad, cancelaciones, medios de pago, para quién es (y para quién no).
8. **Cierre.** Un solo CTA final, cálido. Cursos y catálogo destacados aparecen solo cuando su contenido real esté a la altura.

WhatsApp: **flotante, discreto, persistente** — disponible en el momento de la duda, no al final del scroll. En móvil, el CTA primario reaparece en forma sutil al superar el hero.

**Emoción objetivo, en orden de aparición:** "acá hay personas serias" → "entiendo exactamente qué ofrecen" → "esta profesional me inspira confianza" → "sé cuánto cuesta y cómo funciona" → "puedo dar el paso".

*Estado de implementación:* Sprint 2 (2026-07-21) implementó la secuencia de 8 actos salvo Voces reales (sin testimonios, correcto — no deben inventarse) y WhatsApp flotante (implementado).

## Admin

Filosofía, no diseño — cuatro principios permanentes:

1. **El admin es un producto, no un backstage.** Sus usuarios (el equipo) merecen el mismo estándar de claridad que los pacientes. Se acepta estética utilitaria; no se acepta confusión.
2. **Datos tabulares en tablas.** Orden, densidad, paginación, acción por fila.
3. **Lo destructivo siempre confirma y siempre explica qué va a pasar.** Sin excepciones.
4. **Evoluciona por dominios.** El monolito actual se irá partiendo por área de negocio a medida que cada dominio crezca — nunca en un big-bang.

El admin comparte con el producto los fundamentos (tipografía de producto, espaciado, componentes) pero no la paleta emocional: puede ser más neutro. La calidez es para pacientes; al equipo se le debe eficiencia.

## Microinteracciones

- **Hover:** un solo lenguaje universal — elevación sutil (2px) + sombra *flotante* + 120ms.
- **Focus:** anillo turquesa oficial, visible siempre por teclado, jamás suprimido.
- **Loading:** menos de ~300ms, nada; más, skeleton (contenido) o spinner-en-botón con texto de acción ("Reservando…"). **Todo submit bloquea el doble envío y comunica progreso** — ley.
- **Success:** toast semántico + el cambio visible en el lugar donde ocurrió.
- **Error:** el campo culpable se marca y recibe el foco; el mensaje vive al lado del campo. Los errores de sistema, en toast persistente. Nunca se pierde lo que el usuario escribió.
- **Warning:** solo antes de acciones irreversibles, en modal de confirmación que dice qué va a pasar.
- **Completion:** el paso completado se marca con transición de 200ms y el sistema ofrece el siguiente.
- **Celebración — la única coreografía grande del producto:** reservada a tres momentos (primera reserva, curso terminado, hito de proceso). Lavanda + patrón de marca + una animación de 600ms, serena, sin confetti estridente. Es memorable porque es escasa: usarla más la mata.

## Empty states

1. **Un vacío es un comienzo, no una carencia.** El estado vacío habla del futuro ("Acá van a vivir tus cursos"), jamás de la ausencia ("No tenés cursos").
2. **Anatomía fija:** ilustración del set de patrones de marca (lavanda o turquesa suave) + título en positivo + una línea de contexto + **una sola acción**. Nunca dos botones en un vacío.
3. **Cada vacío enseña algo.** El primer vacío que ve un usuario nuevo es su onboarding real.
4. **Un vacío jamás se parece a un error.** Nada de grises tristes, iconos de alerta ni tono de disculpa.

## Accesibilidad

**Estándar oficial y vinculante: WCAG 2.1 nivel AA en todo el producto** — público, privado y admin, sin zonas exentas. Es criterio de aceptación de toda tarea, no una mejora aparte.

Compromisos permanentes: contraste verificado (4.5:1 texto, 3:1 componentes) en cada par nuevo; todo el producto operable solo con teclado, con foco visible y sin trampas (los modales atrapan el foco mientras están abiertos y lo devuelven al cerrar); estructura semántica real; formularios con label real, error asociado al campo y anunciado; feedback dinámico anunciado a lectores de pantalla; nada comunicado solo por color; áreas táctiles mínimas de 44px; `prefers-reduced-motion` respetado en el 100% de los casos; verificación anual con lector de pantalla real sobre registrarse→reservar, cursar, comprar.

## Responsive

No diseñamos para anchos de pantalla; diseñamos para **tres situaciones de la vida del usuario**:

- **En la mano (móvil).** El contexto emocional más frecuente. Todo lo esencial alcanzable con el pulgar, una sola columna de atención, el botón "Unirse" imposible de errar, sin zoom forzado en formularios, ninguna función recortada.
- **En el sillón (tablet / ventana media).** El contexto de lectura y cursada tranquila. La medida tipográfica manda sobre la grilla; nunca es "el desktop comprimido".
- **En el escritorio.** El contexto de gestión y decisión. Densidad al servicio de la orientación; el contenido anclado a su contenedor de 1180px con el aire de marfil alrededor como parte del diseño.

La regla transversal: **una funcionalidad que no funciona bien en la mano no está terminada.**

## Copywriting

**La voz:** LUMEN escribe como **una profesional de la salud que te conoce**: cálida sin ser efusiva, precisa sin ser fría, directa sin ser cortante.

**Registro oficial: voseo rioplatense, siempre.** "Reservá", "Elegí", "Podés". Con **todas** las tildes y todas las eñes, en el 100% de las superficies. **Sentence case universal**: solo la primera letra en mayúscula.

**Palabras de LUMEN:** espacio, proceso, acompañar, consulta (nunca "sesión" ni "cita"), profesional (nunca "proveedor"), continuar, tu/tuyo, próximo paso.
**Palabras prohibidas:** "¡Ups!" y toda falsa simpatía ante errores; "usuario" de cara al usuario; jerga técnica visible; urgencia artificial; diminutivos condescendientes; "en preparación"/"próximamente" dentro del producto.

**Cómo se escribe cada momento:**
- Errores — qué pasó + qué puede hacer, sin culpa ni drama.
- Éxitos — confirmar + abrir el siguiente paso.
- Estados vacíos — nunca se disculpan, siempre invitan.
- Mensajes importantes (cancelaciones, cambios de horario, salud) — hecho primero, contexto después, próximo paso siempre; cero adornos.

---

# Branding

## Sistema de marca

### Jerarquía y roles de color (revisado 2026-07-22 a favor del Manual de Marca y `branding-lumen/`)

**Fuente de verdad: `branding-lumen/03. PALETA DE COLORES/Paleta de colores.pdf` y el Manual de Marca.** Ambos documentos clasifican los cuatro colores en dos niveles de jerarquía, no en cuatro roles funcionales aislados como planteaba la primera versión de esta Bible:

- **Color principal:** Petróleo `#11383F` y Turquesa `#3C8C98`, en pie de igualdad.
- **Color secundario:** Marfil `#F7F2EB` y Lavanda `#BA9CEF`.

Esta jerarquía **prevalece** sobre la tabla de roles fijos que la primera versión de esta Bible había definido (que trataba a Turquesa como acento menor y restringía a Petróleo a usos "puntuales"). La corrección concreta:

| Color | Jerarquía | Rol funcional (se mantiene de la Bible original, ya que no contradice al Manual) | Uso ampliado por el Manual/`branding-lumen/` |
|---|---|---|---|
| **Petróleo `#11383F`** | Principal | La institución. La voz seria de LUMEN | Al ser color principal, se habilita su uso en **fondos extensos y sólidos** (no solo "puntuales") — por ejemplo, bloques institucionales completos como el sidebar de Mi Espacio |
| **Turquesa `#3C8C98`** | Principal | La acción y la vida | Al ser color principal en pie de igualdad con Petróleo, se habilita su uso en **grandes bloques, fondos y componentes**, no solo en acentos/bordes/hover |
| **Marfil `#F7F2EB`** | Secundario | El aire. Fondos de página, secciones, formularios, áreas de lectura | Sigue siendo el color de mayor presencia relativa por volumen de superficie, pero ya no es el único fondo posible del área privada — puede convivir con bloques sólidos de los colores principales |
| **Lavanda `#BA9CEF`** | Secundario | **El color del usuario**: progreso, logros, indicadores personales, lo no-leído, celebración. La lavanda jamás pide acciones: las celebra | Sin cambios — el Manual no contradice este rol |

Las variaciones cromáticas oficiales del Manual de Marca (4 tintes por color) son la **única** fuente de tintes: prohibido fabricar transparencias ad-hoc. Semánticos: éxito (familia turquesa profunda), información (familia lavanda clara), advertencia (familia arena cálida derivada del marfil oscuro), error (rojo ladrillo). Los tokens legacy aqua/sage/sand quedan **retirados de la interfaz para siempre**.

### Uso oficial del logo

- **Logotipo horizontal** ("lumen." con el flourish): la firma estándar. Navbar, footer, login, registro, emails, documentos. Siempre en marfil sobre petróleo o en petróleo sobre claros. Altura mínima 20px digital.
- **Isotipo** (el glifo solo): favicon, íconos de app, avatares de sistema, marca de agua sutil, momentos de carga. Nunca acompañado de texto que repita "LUMEN" al lado.
- **Lockup vertical completo**: solo momentos ceremoniales — OpenGraph, splash, certificados, portadas institucionales. Nunca en la UI cotidiana.
- **Colores permitidos del logo**: marfil, petróleo, blanco, negro (imprenta). Las versiones turquesa y lavanda quedan reservadas a piezas de marketing del estudio, **no** a la interfaz.
- **Prohibiciones absolutas**: recolorear fuera de esa lista, aplicar sobre fotografía sin velo de color de marca, deformar, animar el logo (excepción: una única animación oficial de aparición del isotipo para momentos de carga).

## Sistema tipográfico (revisado 2026-07-22 a favor del Manual de Marca y `branding-lumen/`)

**Fuente de verdad: `branding-lumen/02. TIPOGRAFIAS/` (carpetas `Principal` y `Secundaria`) y las páginas de tipografía del Manual de Marca.** El Manual define explícitamente una jerarquía de dos tipografías oficiales, con un nombre y un uso distinto al que planteaba la primera versión de esta Bible:

- **"Neulis cursive" = tipografía primaria.** El Manual la muestra como una caligrafía/script (no la familia geométrica Neulis ya integrada en `app/fonts/neulis`) y la define para **"títulos y/o palabras cortas a resaltar"**, buscando transmitir cercanía y confianza.
- **"Delight" = tipografía secundaria.** El Manual la define explícitamente para **"subtítulos o cuerpos de texto"**, indicando que "se puede leer con mayor facilidad, por lo cual es la tipografía indicada para frases más largas". `branding-lumen/02. TIPOGRAFIAS/Secundaria/` incluye los cortes estáticos completos y una fuente variable (`delight-vf.ttf`).

**Esto revisa la decisión tipográfica de la primera versión de esta Bible, que asignaba el cuerpo de texto a Source Sans 3:** por jerarquía documental, **Delight reemplaza a Source Sans 3 como la voz de producto** (párrafos, interfaz, formularios, listas, tablas, aula, admin). La familia geométrica **Neulis** (los 18 pesos ya integrados) se mantiene como tipografía de encabezados (H1–H3, display, números grandes del espacio personal) — el Manual no contradice este uso, ya que corresponde a la carpeta `branding-lumen/02. TIPOGRAFIAS/Principal/` y es la que efectivamente construye el logotipo oficial.

**"Neulis cursive"** (la caligrafía mostrada en el Manual para títulos/palabras cortas a resaltar) es un asset que **no está disponible** dentro de `branding-lumen/` — la carpeta "Principal" solo contiene la familia geométrica Neulis con sus cortes itálicos, no una tipografía caligráfica separada. Se documenta como asset pendiente, no se sustituye por una fuente de terceros ni se completa el hueco con una suposición (ver "Pendientes de definición").

**Estado de implementación:** el código del producto usa hoy Neulis (encabezados) + Source Sans 3 (cuerpo/producto), decidido e implementado en el Sprint 1 antes de esta revisión documental. Migrar el cuerpo de Source Sans 3 a Delight es un cambio de código y queda registrado en el "Roadmap" — esta revisión es exclusivamente documental, tal como fue pedido.

**Escala oficial** (base 16px; tabla cerrada, no se crean tamaños fuera de ella; la columna "Fuente" se actualiza de Source Sans a Delight por la revisión de este punto):

| Nivel | Fuente | Tamaño | Peso | Interlineado | Tracking | Caso |
|---|---|---|---|---|---|---|
| Display | Neulis | 44→68 fluido | 700 | 1.04 | −0.02em | Solo el hero de la landing |
| H1 | Neulis | 34→46 fluido | 700 | 1.1 | −0.015em | Un único H1 por página |
| H2 | Neulis | 26→32 fluido | 600 | 1.15 | −0.01em | Secciones |
| H3 | Neulis | 22 | 600 | 1.25 | 0 | Cards grandes, subsecciones |
| H4 | Delight | 18 | 600 | 1.35 | 0 | Títulos dentro de componentes |
| Body L | Delight | 18 | 400 | 1.65 | 0 | Leads, bios, descripciones |
| **Body** | Delight | **16** | 400 | 1.6 | 0 | El texto por defecto del producto |
| Lectura larga | Delight | 17 | 400 | 1.7 | 0 | Aula, legales. Medida máxima 70 caracteres |
| UI | Delight | 14 | 500 | 1.45 | 0 | Navegación, menús, metadatos |
| Caption | Delight | 13 | 500 | 1.4 | +0.01em | Fechas, ayudas |
| Overline | Delight | 12 | 600 | 1.3 | +0.08em, MAYÚSCULAS | El único uppercase del sistema junto a las pills |

**Reglas no negociables:** máximo dos pesos por componente; el peso 900 queda reservado a Display; nada visible por debajo de 12px; uppercase solo Overline y pills; ningún párrafo más ancho que 72 caracteres; los pesos se sirven optimizados (formato comprimido y subset latino).

## Iconografía

**Librería oficial: Lucide.** Trazo uniforme, esquinas suavemente redondeadas coherentes con la curva del isotipo, cobertura completa, licencia permisiva. No se mezclan librerías, no se dibujan iconos ad-hoc, no se usan emojis en la interfaz, y las letras-en-círculo quedan prohibidas como iconografía.

**Especificación:** grilla base 24px; tres tamaños oficiales — 16 (inline con texto), 20 (interfaz general, el default), 24 (protagonistas y estados vacíos); grosor de trazo **1.75** en todos los tamaños; el color siempre hereda del texto que acompañan (excepción: iconos de estado semántico usan su color semántico).

**Cuándo usar iconos:** para acelerar el reconocimiento de acciones repetidas, para estados semánticos, para estados vacíos. **Cuándo no:** nunca como decoración de títulos, nunca duplicando lo que el texto ya dice bien, nunca icono-solo sin nombre accesible. El default de LUMEN es **icono + palabra**.

## Motion

El movimiento de LUMEN respira; no rebota, no sorprende, no entretiene.

**Duraciones oficiales (tres, y solo tres):** **120ms** — micro-feedback (hover, press, toggles); **200ms** — el estándar (aparición de menús, toasts, cambios de estado); **320ms** — entradas de escena (modales, paneles, transiciones de contenido).

**Curvas oficiales (dos):** *salida suave* (desacelera al llegar) y *entrada-salida simétrica* (para lo que se mueve de un lugar a otro). Prohibidos: rebotes, elásticos, springs exagerados.

**El patrón de entrada oficial:** aparecer + elevarse 8px, 200–320ms. Es la única coreografía de entrada del producto.

**Cuándo NO animar:** los datos que sostienen decisiones (precios, horarios, disponibilidad) aparecen sin transición. `prefers-reduced-motion` se respeta en el 100% de los casos.

*Nota: un Sprint 8 — Motion System & Microinteracciones queda registrado en `TODO_LUMEN.md` para implementar este capítulo de forma sistemática en toda la plataforma (ver "Roadmap").*

---

# Arquitectura Funcional

## Filosofía de navegación

Reproducido de `docs/INFORMATION_ARCHITECTURE.md` (documento vivo de arquitectura de información — consultarlo para el detalle completo):

LUMEN separa con claridad dos cosas que suelen mezclarse en plataformas mal organizadas: la **experiencia** del usuario (su actividad: turnos, cursos, recursos, pedidos, mensajes) y la **administración** de su cuenta (datos personales, facturación, preferencias). El usuario nunca debería sentir que todo está mezclado dentro de una única página gigante.

## Navegación pública

Cinco entradas centrales: **Inicio, Consultas, Cursos, Catálogo, Contacto.** La navegación pública no debe crecer con secciones adicionales sin una razón clara.

## Menú del avatar (usuario logueado)

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

Cada opción tiene una responsabilidad única y no debe mezclarse con las demás (detalle completo en `docs/INFORMATION_ARCHITECTURE.md`): Mi Espacio (actividad), Mi Perfil (identidad personal, distinto de Configuración), Carrito (compra en curso, transitorio), Mis pedidos (historial de compras ya realizadas, digitales y físicas en una sola pantalla), Facturación (datos fiscales y comprobantes), Configuración (preferencias de uso, no identidad).

## Mi Espacio: páginas reales por dominio

Decisión definitiva (Bible, capítulo "Mi Espacio"): el área privada se organiza en páginas reales por dominio bajo un mismo shell, no en anclas dentro de una única página larga. Implementado en Sprint 3 (2026-07-22): `/mi-cuenta` (hub), `/mis-turnos`, `/mis-cursos`, `/mis-recursos`, `/mis-notificaciones`, `/mis-mensajes`, `/mis-certificados`, como hermanas planas del mismo patrón ya usado por `/facturacion`, `/configuracion`, `/mi-perfil`, `/carrito`, `/mis-pedidos`.

## Design System

Existe **un solo sistema**. Los dialectos de componentes actuales deben converger en él; ninguna pantalla nueva puede usar componentes fuera del sistema desde la aprobación de la Bible original.

**Fundamentos:** Espaciado — escala única de base 4 (4/8/12/16/24/32/48/64); prohibido el píxel arbitrario. Radio — **8px universal**, 999 para pills y avatares, 0 solo para superficies de borde a borde; los modales usan 12px. Sombras — exactamente tres niveles: *reposo*, *flotante*, *capa*. Grilla — contenedor de 1180px, modelo mental de 12 columnas, gutter 24.

**Componentes — la ley de cada uno:** Botón (cuatro variantes: primario/secundario/fantasma/peligro; máximo uno primario por vista; todo submit tiene estado de carga obligatorio), Campo de formulario (error junto al campo que falló), Card (tres niveles de énfasis: plana/elevada/destacada-con-acento-lavanda), Badge/Pill (un solo componente, variantes semánticas + lavanda para lo personal), Tabs (solo existen si funcionan de verdad), Dropdown/Menú (uno solo), Toast (canal oficial de feedback, cuatro tipos semánticos), Modal (**uno solo en todo el producto**, con trampa de foco), Tabla (para datos tabulares — dominio del admin), Skeleton (uno, con el pulso oficial), Empty state (un componente).

### Diagnóstico de partida (evidencia de la auditoría de producto — el problema que este capítulo resuelve)

El código contiene **cuatro dialectos** de componentes que resuelven los mismos problemas sin conocerse entre sí: **Público** (`.button`, `.card`, `.panel`, `.booking-modal`), **ds-\*** (`DesignSystem.js`, botones/cards/modal/empty-state propios), **account-\*** (Mi Espacio: `.account-primary-action`, `.account-panel`, `EmptyState` propio), **admin-\*** (botones propios + `AdminConfirmButton`). El plan de convergencia: (1) capa de tokens semánticos, (2) primitivas en `app/components/ui/` (Button, Input+Field, Select, Badge, Card, Modal único, Tabs reales, Toast, EmptyState fusionado, Icon, Table, Skeleton), (3) orden de migración por dolor — Mi Espacio primero, público segundo, admin al final junto con su split por dominios ya planificado, (4) documentación viva en una ruta interna `/design`.

---

# Roadmap

## Historial de sprints ejecutados

- **Sprint 1 — Fundamentos del Producto** (2026-07-21): rampas cromáticas oficiales + capa semántica, sistema tipográfico de dos voces, tokens de motion/elevation, iconografía Lucide detrás de `AppIcon`, accesibilidad base, corrección de copy compartido.
- **Sprint 2 — Landing Premium** (2026-07-21): recorrido oficial de 8 pasos, hero sin fotografía (patrón de marca, a la espera de sesión fotográfica real), FAQ, chips de credencial, WhatsApp flotante.
- **Sprint 3 — Mi Espacio** (2026-07-22): laboratorio de identidad visual guiado por el Manual de Marca del estudio; páginas reales por dominio; Zona 1 con botón "Unirse a la consulta"; ver `docs/SPRINT_3_MI_ESPACIO.md`. Las decisiones de color de este sprint quedaron confirmadas por la jerarquía documental (ver "Branding").
- **Sprint 4 — Cursos** (próximo, definido el 2026-07-22): ver "Modelo de negocio" para la decisión de propiedad de cursos que lo enmarca. **Los pagos no forman parte de este sprint**: quedan reservados para el sprint final del roadmap.
- **Sprint 8 — Motion System & Microinteracciones** (registrado, no iniciado): sistema de transiciones y microinteracciones para toda la plataforma sobre los tokens de motion ya existentes. El número es provisorio, sujeto a cuántos sprints de contenido de producto (4–7) se definan antes.
- **Revisión de jerarquía documental** (2026-07-22, no es un sprint de producto): versionado de `docs/PRODUCT_BIBLE.md`, definición de la jerarquía Nivel 1–5 de documentación, y resolución de las contradicciones de branding/color/tipografía a favor de `branding-lumen/` y el Manual de Marca. Deja pendiente de implementación (no de definición): migrar el cuerpo de texto del código de Source Sans 3 a Delight, y ocultar `/mis-certificados` mientras la función no exista de verdad (Regla de Oro #1).

## Roadmap priorizado (de la auditoría de producto)

**P0 — Imprescindible:**
1. Sistema tipográfico completo (implementado, Sprint 1).
2. Join de consulta + agregar-a-calendario + destrabar recordatorios (pendiente — ver "Pendientes de definición").
3. Purga de color fuera de paleta en área privada y dropdowns + capa semántica (implementado, Sprint 1/3).
4. Iconografía real Lucide (implementado, Sprint 1).
5. Copy: tildes, ñ, contenido placeholder fuera de producción (implementado, Sprint 1).
6. Eliminar promesas rotas: tabs falsas fuera (implementado, Sprint 3), Certificados oculto (decisión ya tomada por la Regla de Oro #1 — **pendiente de implementación**, no de validación), `/mi-perfil` fuera del menú hasta existir (sigue en el menú como placeholder — pendiente de implementación).
7. Focus trap + skip-link (skip-link implementado Sprint 1; focus trap pendiente).

**P1 — Muy importante:**
8. Mi Espacio reorganizado en 3 zonas + onboarding (implementado, Sprint 3).
9. Landing premium completa (implementado, Sprint 2, salvo fotografía real y testimonios — pendientes de contenido real).
10. Design system consolidado (pendiente, ver "Arquitectura Funcional").
11. Feedback moderno: toasts, `next/image` (pendiente).
12. Catálogo: imágenes de producto, búsqueda y filtro (pendiente).
13. Aula: siguiente/anterior, reanudación, cierre celebratorio (pendiente — candidato natural de Sprint 4).
14. Decisión de zonas horarias (diseño ya decidido en "Consultas"; implementación pendiente).
15. Breakpoint tablet + targets táctiles (pendiente).
16. Auditoría AA formal de área privada y admin (pendiente).

**P2 — Futuro:** split del admin por dominios; certificados reales; notas del alumno en aula; preparación pre-consulta; i18n + multi-moneda; vista semanal de agenda + próxima disponibilidad; programa de ilustración/patrones; dark mode; push notifications; ultrawide art-direction.

## Visión de negocio por horizonte (de la auditoría de producto)

- **Semestre 1 — Craft y el círculo mínimo.** Todo P0 + Mi Espacio nuevo + landing premium. Meta: registro→reserva→consulta sintiéndose cuidado de punta a punta.
- **Semestre 2 — Retención y monetización.** Mercado Pago (cuando el negocio lo autorice) para cursos, consultas y catálogo; paquetes de sesiones; el "plan post-consulta" v1.
- **Semestre 3 — Escala del lado de la oferta.** Onboarding de más profesionales sin tocar la promesa (una sola marca, un solo estándar — no marketplace abierto); zonas horarias implementadas; expansión hispanohablante.
- **Semestre 4 — Diferenciación.** "Programas" (consultas + curso + recursos con arco temporal); certificados reales; exploración B2B solo si los programas demuestran retención.

## Visión a 1, 3 y 5 años (de la Product Bible)

- **A 1 año:** LUMEN es exactamente lo que la landing dice — se reserva sin fricción, se llega a la consulta sin buscar nada, se aprende con gusto, se paga online, y todo el producto lleva la misma marca. El círculo mínimo (consulta → sugerencia → curso/recurso → re-reserva) funciona de punta a punta.
- **A 3 años:** Mi Espacio es la razón por la que la gente vuelve; los planes y paquetes de sesiones son el modo natural de estar en LUMEN; los programas son el producto estrella; LUMEN opera en varios países hispanohablantes con zonas horarias resueltas de raíz.
- **A 5 años:** LUMEN es una marca de confianza en cuidado emocional en español, posiblemente extendida a organizaciones, sin haber traicionado jamás la experiencia individual: sigue sin ser un marketplace, sigue sin vender urgencia, sigue mostrando personas reales con matrícula real, y sigue sintiéndose calmo.

---

# Decisiones oficiales de producto

## Las 25 Reglas de Oro de LUMEN

1. Nunca mostrar funcionalidades incompletas. Se lanza terminado o no se muestra.
2. El usuario siempre debe saber cuál es su próximo paso.
3. La tipografía nunca compite con el contenido: Neulis firma, la voz de producto lee.
4. Si parece interactivo, es interactivo. Prohibido lo decorativo disfrazado de control.
5. Llegar a una consulta nunca requiere buscar nada.
6. Un solo botón primario por pantalla.
7. La lavanda pertenece al usuario: celebra, nunca pide.
8. Toda hora se muestra en la zona horaria de quien la mira, con la zona explícita.
9. Ninguna palabra sale sin tildes, sin eñes o en mayúsculas gritadas.
10. Los errores dicen qué pasó y qué hacer. Sin culpa, sin "¡Ups!", sin jerga.
11. Un estado vacío es una invitación, jamás una disculpa ni un error.
12. Nada de dark patterns: ni urgencia falsa, ni fricción para irse, ni casillas premarcadas. Nunca.
13. Todo submit muestra progreso y bloquea el doble envío.
14. Nunca se pierde lo que el usuario escribió.
15. Lo destructivo siempre confirma y explica qué va a pasar.
16. Contraste AA en todo texto nuevo. Sin excepciones ni "después lo vemos".
17. Todo se puede operar solo con teclado, con foco visible.
18. Ningún control sin nombre accesible. Un icono solo no es un nombre.
19. Máximo dos pesos tipográficos por componente; nada visible bajo 12px.
20. Los datos que sostienen decisiones (precio, hora, disponibilidad) no hacen teatro: aparecen quietos y claros.
21. El movimiento respira: 120/200/320ms, y con motion reducido, silencio total.
22. Sin foto real no se publica: ni producto, ni profesional, ni testimonio inventado.
23. Los tokens son ley: ningún color, espacio, radio o sombra fuera del sistema.
24. Lo que no funciona bien en la mano, no está terminado.
25. Ante cualquier duda, la pregunta que decide: **¿esto acompaña, o solo funciona?**

## Otras decisiones cerradas (consolidadas de toda la Bible)

- **Sistema tipográfico de dos voces**: Neulis (encabezados/marca) + Delight (cuerpo/producto, revisado 2026-07-22 a favor del Manual de Marca — reemplaza a Source Sans 3 en esta definición documental), revocando el uso de Neulis para todo.
- **Iconografía**: Lucide como única librería, detrás de un único componente wrapper.
- **Un solo Design System**: los cuatro dialectos actuales convergen en uno; ninguna pantalla nueva usa componentes fuera de él.
- **Un solo Modal** en todo el producto, con trampa de foco.
- **WCAG 2.1 AA vinculante** en todo el producto, sin zonas exentas, como criterio de aceptación de toda tarea.
- **Cero dark patterns**, de forma absoluta y sin excepción.
- **No marketplace**: ni de terapeutas, ni de cursos, ni de catálogo — LUMEN cura, produce y comercializa bajo su propia marca (ver "Modelo de negocio").
- **Mi Espacio como páginas reales por dominio**, no como anclas de una sola página.
- **Landing exclusiva para visitantes**: con sesión activa, redirección directa a Mi Espacio.

---

# Pendientes de definición

Decisiones que ninguna de las fuentes revisadas (Product Bible, Auditoría, documentación del repositorio) tomó todavía. No deben resolverse sin que el usuario las defina primero.

- Precio real por especialista.
- Políticas de cancelación y reprogramación de consultas.
- Alcance profesional y consentimiento informado para consultas.
- Datos legales reales: razón social/persona responsable, CUIT, domicilio legal, email legal.
- Definir si `espaciolumen.com` es el dominio/marca final y permanente.
- Casillas reales de email (contacto, turnos, notificaciones) y canales de contacto.
- Imágenes reales de especialistas, cursos y productos del catálogo (bloqueante para varias Reglas de Oro: #22).
- Si `/mi-perfil` se desarrolla ahora con datos reales o se mantiene fuera del alcance por ahora.
- Si los certificados de curso forman parte del MVP o quedan para después. La decisión de ocultar la sección mientras no exista de verdad **ya está tomada** (Regla de Oro #1); lo pendiente es solo el alcance y la fecha de implementación (ver "Roadmap").
- Implementación técnica de zonas horarias (la decisión de diseño ya está tomada en "Consultas": UTC + zona explícita; falta implementarla en el esquema, emails, calendario y UI).
- Asset de la tipografía **"Neulis cursive"** (caligrafía/script para títulos y palabras cortas a resaltar, según el Manual de Marca): no está entre los archivos de `branding-lumen/02. TIPOGRAFIAS/Principal/` (que solo contiene la familia geométrica Neulis con sus cortes itálicos). Por decisión explícita del usuario en Sprint 3, no se sustituye por una fuente de terceros mientras tanto.
- Migración de código de Source Sans 3 a Delight como tipografía de cuerpo/producto, para que la implementación real siga la definición ya resuelta en "Branding" (cambio de código, no de documentación — no forma parte de esta revisión).
- Fecha o condición de verificación del dominio propio en Resend, de la que depende el envío real de emails de confirmación, recordatorio y notificación.
- Mercado Pago / flujo de pago real para cursos, consultas y catálogo — explícitamente no se toca sin pedido explícito del usuario, y ahora además reservado para el sprint final del roadmap (ver "Modelo de negocio" y "Roadmap").

---

# Pendientes de validación

Por la jerarquía oficial de documentación (ver el encabezado de este documento), toda contradicción relacionada con branding, colores, tipografía, iconografía o identidad visual se considera **resuelta automáticamente a favor del Manual de Marca y de la carpeta `branding-lumen/`**, y ya no se lista acá — las resoluciones quedan aplicadas directamente en "Branding" y referenciadas en el historial al pie de esta sección.

Esta sección queda reservada exclusivamente para **decisiones funcionales o de producto que realmente sigan abiertas**. A la fecha de esta revisión (2026-07-22), no hay ninguna contradicción funcional o de producto pendiente de validación entre las fuentes revisadas (Product Bible, Auditoría, documentación del repositorio e implementación real). Los desvíos detectados entre esta Bible y el estado actual del código son brechas de implementación ya decididas, no decisiones abiertas — están registrados en "Roadmap" y en `TODO_LUMEN.md`, no acá.

## Historial de contradicciones de branding resueltas (2026-07-22)

Registro de las contradicciones detectadas en la primera versión de esta Bible y su resolución, por transparencia documental — no requieren ninguna acción adicional de validación:

1. **Rol y proporción del color Turquesa.** La primera versión de esta Bible asignaba a Turquesa un rol de acento menor, restringiendo a Petróleo el único fondo institucional y solo de forma "puntual". El Manual de Marca y `branding-lumen/03. PALETA DE COLORES/` clasifican a Turquesa y Petróleo como igual jerarquía ("color principal" ambos). **Resuelto a favor del Manual:** Turquesa puede usarse en grandes bloques, fondos y componentes, no solo en acentos. Ver "Branding".
2. **Color de fondo del área privada.** La primera versión de esta Bible restringía el área privada a fondos en Marfil. Al ser Petróleo un color principal (no solo institucional puntual) según el Manual, el sidebar sólido en Petróleo de Mi Espacio (Sprint 3) es una aplicación legítima de un color principal, no una desviación. **Resuelto a favor del Manual.** Ver "Branding".
3. **Restricción "esperar el Figma" vs. decisiones visuales ya tomadas.** `PROJECT_STATUS.md` y `docs/PRODUCT_PRINCIPLES.md` (regla 6) condicionaban logo, isotipo, tipografía, iconografía, espaciados, sombras y componentes a la llegada de un Figma definitivo. La jerarquía oficial de documentación establece que `branding-lumen/` y el Manual de Marca **son** la fuente de verdad para exactamente esos elementos, con máxima prioridad. **Resuelto:** esos elementos ya tienen fuente oficial (Nivel 1) y no dependen de un Figma futuro; la actualización de esa restricción y esa regla en sus documentos de origen queda para una revisión posterior de esos archivos, fuera del alcance de esta tarea.
4. **Tipografía de cuerpo: Source Sans 3 vs. "Delight".** La primera versión de esta Bible definía Source Sans 3 como voz de producto. El Manual de Marca asigna explícitamente esa función a Delight ("subtítulos o cuerpos de texto... la tipografía indicada para frases más largas"), con sus archivos completos disponibles en `branding-lumen/02. TIPOGRAFIAS/Secundaria/`. **Resuelto a favor del Manual:** Delight reemplaza a Source Sans 3 en la definición oficial. Ver "Branding". La migración de código queda en "Roadmap"/"Pendientes de definición", no es parte de esta revisión documental.
5. **Tipografía "Neulis cursive".** Se confirmó, releyendo la página de tipografía primaria del Manual, que "Neulis cursive" es una caligrafía/script real y distinta de la familia geométrica Neulis, definida para títulos y palabras cortas a resaltar. No hay contradicción entre fuentes: el Manual y `branding-lumen/` coinciden en que existe esta voz, pero su archivo de fuente no fue incluido en la carpeta oficial. **No es una contradicción sino un asset faltante**, movido a "Pendientes de definición".
6. **Sección Certificados visible con función incompleta.** No es una contradicción de branding sino funcional: la Bible (Regla de Oro #1) y la Auditoría ya piden ocultarla hasta que exista de verdad. No hay nada que validar — es una tarea de implementación pendiente, movida a "Roadmap".
