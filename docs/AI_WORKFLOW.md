# LUMEN — Flujo de trabajo con IA

Este documento define como colaboran ChatGPT, Claude Code y Codex dentro del proyecto LUMEN. Su objetivo es evitar superposiciones, cambios grandes sin control y decisiones de producto tomadas sin aprobacion del usuario.

## Objetivo

LUMEN puede ser trabajado por distintas IA, pero todas deben usar la misma fuente de verdad y respetar el mismo flujo.

El objetivo de este documento es ordenar:

- Que rol cumple cada IA.
- Que tipo de tareas conviene asignar a cada una.
- Que documentacion debe leer antes de actuar.
- Cuando pedir aprobacion.
- Como evitar pisar cambios de otra IA.
- Como mantener el repo estable, entendible y facil de continuar.

La regla general es simple: pensar, documentar, pedir aprobacion cuando corresponda, implementar de forma incremental y no subir nada sin autorizacion explicita.

## Roles

### ChatGPT

ChatGPT funciona principalmente como CTO, Product Owner y acompanamiento estrategico.

Responsabilidades principales:

- CTO.
- Product Owner.
- Arquitectura.
- Roadmap.
- Revision tecnica.
- Revision UX.
- Priorizacion.

Conviene usar ChatGPT para:

- Ordenar el backlog.
- Definir prioridades.
- Analizar riesgos.
- Comparar alternativas.
- Crear prompts para Claude Code o Codex.
- Revisar si una propuesta respeta la vision de producto.
- Pensar arquitectura antes de implementar.
- Traducir ideas del usuario a tareas concretas.
- Revisar consistencia de UX, copy y producto.

ChatGPT no deberia asumir decisiones finales de negocio. Si una decision afecta producto, precios, politicas, identidad visual, legales o alcance profesional, debe dejarla marcada como decision del usuario.

### Claude Code

Claude Code es el especialista para tareas tecnicas complejas, arquitectura e integraciones.

Especialista en:

- Arquitectura.
- Backend.
- Integraciones.
- Refactors grandes.
- Seguridad.
- OAuth.
- Google Calendar.
- Implementaciones complejas.

Conviene usar Claude Code para:

- Cambios de backend con impacto amplio.
- Flujos con autenticacion, permisos o RLS.
- Integraciones externas.
- Refactors de archivos grandes.
- Reestructuracion de modulos.
- Analisis profundo de seguridad.
- Sincronizacion de eventos o estados entre sistemas.
- Cambios que requieren mirar muchas partes del proyecto a la vez.

Claude Code debe trabajar de forma incremental. Aunque sea fuerte en cambios grandes, no debe reestructurar arquitectura sin aprobacion previa.

### Codex

Codex es el especialista para implementaciones locales, documentacion y mejoras incrementales.

Especialista en:

- CRUD.
- Componentes.
- Documentacion.
- Refactors pequenos.
- Implementaciones locales.
- Mejoras incrementales.

Conviene usar Codex para:

- Crear o actualizar documentos.
- Ajustar formularios.
- Mejorar componentes concretos.
- Agregar acciones simples.
- Corregir textos o estados vacios.
- Hacer cambios chicos en una pantalla.
- Preparar SQL para copiar y pegar.
- Revisar diffs.
- Hacer commits y push cuando el usuario lo autoriza.

Codex debe evitar tomar tareas amplias de arquitectura si antes no fueron definidas por ChatGPT o Claude Code.

## Modelos Claude

### Sonnet

Usar Sonnet para la mayoria de las tareas tecnicas del dia a dia.

Bueno para:

- Implementaciones medianas.
- Refactors controlados.
- Revisar codigo.
- Crear rutas o componentes.
- Trabajar rapido con buen criterio.
- Resolver bugs concretos.

Es la opcion recomendada cuando la tarea es importante pero no requiere razonamiento extremo.

### Opus

Usar Opus para decisiones tecnicas complejas o analisis profundo.

Bueno para:

- Arquitectura.
- Seguridad.
- Refactors grandes.
- Flujos sensibles.
- Auditorias tecnicas.
- Integraciones complejas.
- Analizar riesgos antes de tocar codigo.

Conviene usarlo cuando una mala decision podria generar deuda tecnica importante o romper flujos centrales.

### Fable

Usar Fable para tareas de redaccion, claridad, tono y documentacion.

Bueno para:

- Copy.
- Documentos de producto.
- Principios de marca.
- Textos de UX.
- Explicaciones para usuarios.
- Reescritura de mensajes.
- Documentacion no tecnica.

No deberia ser la primera opcion para implementar logica compleja.

## Nivel de pensamiento

### Baja

Usar pensamiento bajo cuando la tarea es pequena, clara y de bajo riesgo.

Ejemplos:

- Cambiar una frase.
- Agregar una linea a TODO.
- Crear un documento simple.
- Corregir un typo.
- Ajustar un placeholder.

### Media

Usar pensamiento medio para tareas con algo de contexto, pero sin alto riesgo.

Ejemplos:

- Agregar una accion CRUD simple.
- Ajustar una pantalla.
- Revisar un flujo corto.
- Crear un formulario sencillo.
- Actualizar documentacion relacionada a una tarea.

### Alta

Usar pensamiento alto cuando la tarea toca varias partes o puede romper flujos existentes.

Ejemplos:

- Cambios en auth.
- Cambios en admin.
- Cambios en reservas.
- Cambios en compras.
- Cambios en notificaciones.
- Refactors de componentes compartidos.
- Ajustes que afectan mobile y desktop.

### Extremadamente alta

Usar pensamiento extremadamente alto solo para tareas criticas.

Ejemplos:

- Seguridad.
- RLS.
- OAuth.
- Google Calendar.
- Mercado Pago.
- Cambios de arquitectura.
- Migraciones de base de datos sensibles.
- Flujos que afectan pagos, turnos, datos personales o permisos.

En este nivel, la IA debe analizar antes de implementar y explicar impacto, riesgos y plan.

## Documentacion obligatoria

La documentacion a leer depende del tipo de tarea. Si hay duda, leer mas contexto antes de tocar archivos.

### Siempre

- `PROJECT_STATUS.md`
- `TODO_LUMEN.md`
- `docs/AI_WORKFLOW.md`

### Producto

- `PROJECT_STATUS.md`
- `TODO_LUMEN.md`
- `docs/PRODUCT_PRINCIPLES.md`

### UX y copy

- `PROJECT_STATUS.md`
- `TODO_LUMEN.md`
- `docs/PRODUCT_PRINCIPLES.md`
- `docs/UX_TEXT_INVENTORY.md`

### Arquitectura o refactors grandes

- `PROJECT_STATUS.md`
- `TODO_LUMEN.md`
- Documentacion tecnica relacionada si existe.
- Archivos del dominio afectado.
- Diffs recientes si hay trabajo de otra IA.

### Admin

- `PROJECT_STATUS.md`
- `TODO_LUMEN.md`
- Archivos relacionados con `/admin`.
- Rutas server action o route handlers relacionadas.

### Consultas profesionales

- `PROJECT_STATUS.md`
- `TODO_LUMEN.md`
- Archivos relacionados con `/turnos`.
- Archivos relacionados con `/especialista`.
- Migraciones Supabase relacionadas.
- Integraciones de email y Google Calendar si corresponde.

### Cursos y aula

- `PROJECT_STATUS.md`
- `TODO_LUMEN.md`
- Archivos relacionados con `/cursos`.
- Archivos relacionados con `/aula`.
- Tablas de cursos, modulos, lecciones, materiales e inscripciones.

### Catalogo, carrito y compras

- `PROJECT_STATUS.md`
- `TODO_LUMEN.md`
- Archivos relacionados con `/catalogo`.
- Archivos relacionados con `/mi-cuenta#carrito`.
- Tablas de productos, pedidos y carrito.
- No tocar Mercado Pago salvo pedido explicito.

### Facturacion

- `PROJECT_STATUS.md`
- `TODO_LUMEN.md`
- Archivos relacionados con facturacion.
- Tablas `billing_profiles` e `invoice_requests`.
- No integrar AFIP/ARCA salvo pedido explicito.

### Infraestructura

- `PROJECT_STATUS.md`
- `TODO_LUMEN.md`
- `.env.example` si aplica.
- Variables de Vercel si el usuario las muestra o las pide.

## Flujo de trabajo

Todas las IA deben seguir este flujo salvo que el usuario pida explicitamente otra cosa.

```text
Analizar

↓

Leer documentación

↓

Informar impacto

↓

Esperar aprobación

↓

Implementar

↓

Build

↓

Lint

↓

Actualizar documentación

↓

Commit

↓

Esperar autorización

↓

Push
```

Notas:

- Si la tarea es solo documentacion, no hace falta build ni lint.
- Si se toca codigo, correr build salvo que el usuario indique otra cosa o exista un bloqueo.
- Si se agregan tablas, columnas o politicas, revisar RLS.
- Si se crea SQL, pasarlo siempre por chat para copiar y pegar.
- Si el push falla porque hay cambios remotos, hacer pull/rebase con cuidado y no pisar trabajo ajeno.

## Reglas

- Nunca hacer push sin autorizacion.
- Nunca asumir decisiones de producto.
- No tocar Mercado Pago salvo pedido explicito del usuario.
- No tocar Figma hasta recibir el diseno oficial.
- Mantener cambios pequenos.
- Un commit por subtarea cuando sea posible.
- No migrar a TypeScript.
- No implementar multi-tenant.
- No redisenar la UI antes del Figma oficial.
- No revertir cambios de otra IA/persona sin confirmacion.
- Si una IA está trabajando sobre un archivo, otra IA no debe tocar ese mismo archivo hasta que la tarea termine o se confirme que no hay conflicto.
- No commitear archivos locales no solicitados.
- No subir SQL con datos personales sin autorizacion explicita.
- Si aparece `output/` sin trackear, ignorarlo salvo pedido explicito.
- Si aparece `supabase/019_carla_riccio_profile.sql`, no tocarlo salvo pedido explicito.
- Si una tarea requiere una decision del usuario, marcarla como `[DECISION]` en `TODO_LUMEN.md`.
- Si una tarea queda bloqueada por infraestructura o configuracion externa, marcarla como `[BLOQUEADO: motivo]`.
- Si una tarea queda implementada pero falta configuracion externa, marcarla como `[~]`.

## Criterios para elegir IA

### Usar ChatGPT cuando la pregunta sea:

- Que conviene hacer.
- En que orden avanzar.
- Como dividir una tarea.
- Que riesgos tiene una idea.
- Como deberia sentirse la experiencia.
- Que prompt pasar a Claude Code o Codex.

### Usar Claude Code cuando la tarea sea:

- Compleja.
- De backend.
- De seguridad.
- De integracion.
- De arquitectura.
- De OAuth o Google Calendar.
- De refactor grande.

### Usar Codex cuando la tarea sea:

- Local.
- Acotada.
- Documental.
- CRUD simple.
- Ajuste incremental.
- Revision de diff.
- Commit y push autorizado.

## Criterio final

Si dos IA trabajan sobre el mismo repo, la prioridad es no romper continuidad.

Antes de tocar:

- Leer documentacion.
- Revisar estado de Git.
- Identificar archivos relacionados.
- Ver si otra IA modifico algo recientemente.

Despues de tocar:

- Mostrar diff.
- Explicar que cambio.
- Decir que se probo.
- Indicar riesgos pendientes.
- Pedir autorizacion antes de push.
