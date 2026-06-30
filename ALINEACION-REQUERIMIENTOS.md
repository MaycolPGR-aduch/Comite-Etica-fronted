# Alineación de Requerimientos — Seguimiento

Branch: `feat/alineacion-requerimientos`
Fuente: PDF "REGLA GENERAL DE EVALUACIÓN" (requerimientos nuevos del Comité de Ética UCH).
Contexto: el backend lo desarrolla otro equipo en paralelo; aquí solo se avanza lo que no depende de endpoints nuevos.

## ⏸️ Pausado (2026-06-30) — esperando al backend

Se detectó un bug crítico en el backend (500 en todos los endpoints que serializan `Expediente`, ver sección más abajo) probablemente causado por los cambios que el equipo backend está haciendo en paralelo para estos mismos requerimientos. Se decidió **pausar el avance frontend** hasta que el backend esté estable y haya confirmado los nuevos endpoints/contratos.

**Al retomar, revisar en este orden:**
1. Confirmar que el bug de `500 Internal Server Error` en `/expedientes/*` esté resuelto (sección "🔴 Bug crítico" más abajo) — probar con las credenciales de prueba.
2. Pedir al equipo backend el contrato actualizado de los campos/endpoints nuevos: código de expediente `N-2026`, fecha límite de evaluación, programa de estudios, múltiples autores, nuevos estados (`aprobado_con_observaciones`/`desaprobado`), chat Secretaría.
3. Retomar la sección "Bloqueado — requiere endpoints/definición nueva del backend" punto por punto, alineando el frontend al contrato real (no al supuesto).
4. Revisar también "Auditoría de endpoints — Reportes" (endpoint `/reportes/resumen` sin integrar) y el bug documentado.

## Hecho

- Renombrar "Título del Protocolo" → "Título del Proyecto" y "protocolo" → "proyecto" en todos los textos visibles (sin tocar el contrato `titulo_protocolo` del backend).
- Ocultar campos eliminados: `Resumen` y `Prioridad` (nuevo expediente), `Riesgo` (evaluador). Los valores que aún espera el backend (prioridad) se siguen enviando con default.
- Dos portales de login: `/login` (investigador, sin dropdown de rol) y `/login/staff` (personal administrativo, con dropdown). Header compartido con logo UCH y enlaces (Guía, Acerca, cruce de portal). Toggle de mostrar/ocultar contraseña.
- Sección informativa pública `/guia` (requisitos, documentación por tipo, plantillas oficiales, cómo subir, proceso, FAQ) y `/acerca-comite-etica` actualizada con contenido oficial de la UCH (misión, visión, objetivos, contacto, normativa).
- Perfil de usuario (`ProfileSummary`) rediseñado para los 5 roles: banner con iniciales, badges de rol/estado, secciones estructuradas.
- Modo oscuro, alcance solo área autenticada (login y páginas públicas siempre claras).
- Tablas de expedientes (investigador/expedientes, investigador/dashboard, secretaría/bandeja, coordinador/dashboard): columna "Fecha de creación", filtro por rango de fechas, combobox de filtro por estado, orden descendente por fecha.
- Corrección de advertencia de accesibilidad Radix (`SheetDescription` faltante en notificaciones y menú móvil).

## Hecho (segunda tanda)

- [x] Estados visuales del expediente: se agregaron `"Aprobado con observaciones"` y `"Desaprobado"` a `ExpedienteStatus`/`EXPEDIENTE_STATUSES` (aditivo, no rompe nada existente), colores en `StatusBadge`, y mapeo defensivo en `expedientes.service.ts` (`aprobado_con_observaciones`, `desaprobado`) listo para cuando el backend los emita. Nuevo componente `StatusLegend` (diálogo con leyenda completa de todos los estados) agregado en las 4 tablas de expedientes por rol.
- [x] Registro de usuario: `crear-usuario` ya no muestra selector de rol; el registro queda fijo a `investigador`. El registro de personal administrativo lo gestiona el Administrador desde `/admin/usuarios`.
- [x] "Proyecto Interno": confirmado que el frontend nunca lo implementó como tipo (ni en `Role` ni en `tipoTramite`); no había nada que eliminar.
- [x] Coordinador: quitada la entrada "Consolidacion" de la navegación (`src/lib/navigation.ts`) y el enlace "Consolidar dictamen" del dashboard. La ruta `/coordinador/consolidacion/[id]` se conserva (no se borra) hasta coordinar con backend, según lo acordado. Asignación de evaluador pasó de selección múltiple (checkbox, máx. 2) a selección única (radio, máx. 1) — confirmado que el endpoint real (`/evaluacion/expediente/{id}/asignar`) ya soporta 1 evaluador por llamada; el límite de 2 era solo una regla de negocio del frontend en `asignacion.service.ts`.
- [x] UX: en "Mis expedientes" del investigador, el enlace "Subsanar" ahora solo aparece cuando el estado del expediente realmente lo requiere (`Observado por admisibilidad` / `Observado`), y se quitó el texto fijo "Dictamen disponible cuando sea emitido" que no llevaba a ningún lado (el dictamen ya es visible y descargable desde "Ver detalle").

## Próximos (frontend, sin backend)

- [ ] Mejoras UX/UI adicionales si se identifican casos puntuales (no se hizo un rediseño general; se priorizaron arreglos concretos de confusión).

## Auditoría de endpoints — Reportes (2026-06-30)

Revisión solicitada para confirmar si los endpoints de `/reportes/*` estaban realmente integrados. Verificado contra el OpenAPI real del backend (`https://comite-backend.onrender.com/api/v1/openapi.json`) y probando los 6 endpoints en vivo (responden 401, no 404/500 — están montados).

- [x] Confirmado: `admin/reportes` y `coordinador/reportes` SÍ renderizan `ReportesDashboard`, conectado a hooks reales → `reportesService` real, sin mocks.
- [x] Confirmado: 4 de 6 endpoints (expedientes-por-estado, tiempos-atencion, carga-evaluadores, resultados-emitidos) ya tienen schema tipado en el backend (mejoró desde la doc de mayo) y el frontend los parsea correctamente, campo por campo.
- [x] **Corregido**: `carga-evaluadores` ya envía `nombre` del evaluador, pero el frontend lo ignoraba y mostraba el ID crudo en la tabla "Carga por evaluador". Se agregó `nombre` a `ReporteCargaEvaluador`, al mapeo en `reportes.service.ts` y a la columna de la tabla (`reportes-dashboard.tsx`).
- [ ] **Pendiente, no implementado aún**: existe un endpoint nuevo `GET /reportes/resumen` (`ReporteGeneralResponse`) que devuelve un reporte consolidado en una sola llamada (expedientes + evaluadores + tiempos + carga + resultados + fecha + `archivo_url`). El frontend sigue armando una vista equivalente con 4 llamadas separadas; evaluar si conviene migrar `ReportesDashboard` a este endpoint.
- [ ] `buscar-expedientes` y `exportar` siguen sin contrato tipado en el backend (`{}`); el frontend ya lo maneja a la defensiva, no es nuevo.

Detalle ampliado en `observaciones-backend.md`.

### 🔴 Bug crítico confirmado: 500 en TODOS los endpoints de `Expediente` (2026-06-30)

El usuario reportó errores de CORS en consola al abrir "Reportes y analítica" como Coordinador. Se reprodujo con credenciales de prueba reales (login real vía `/auth/login`) y se confirmó que es un **500 genuino del servidor, no un problema de CORS ni del frontend**, y mucho más amplio de lo que el síntoma original sugería:

- `GET /expedientes/` (lista) y `GET /expedientes/{id}` (detalle) fallan con 500 para **los 9 expedientes existentes**, con cuentas de investigador Y de coordinador.
- También fallan: `/expedientes/{id}/documentos`, `/evaluacion/` (lista), `/reportes/buscar-expedientes`, `/reportes/tiempos-atencion`.
- Funcionan bien: `/expedientes/{id}/bitacora`, `/expedientes/{id}/historial`, `/users/`, `/notificaciones/`, `/dictamen/`, y los reportes agregados (`expedientes-por-estado`, `carga-evaluadores`, `resultados-emitidos`).
- El error solo aparece con token de sesión **válido** (con 401 nunca se llega a la lógica que falla) — por eso no se detectó en las verificaciones previas sin autenticación. La respuesta 500 no lleva headers CORS, así que el navegador lo reporta engañosamente como "bloqueado por CORS".

**Causa probable**: error de validación de Pydantic al serializar `ExpedienteResponseDto` (campo nuevo no-nulo, tipo cambiado, etc.) — probablemente ligado a los cambios que el backend está haciendo en paralelo para los requerimientos nuevos del expediente (código `N-2026`, fecha límite, nuevos estados, programa de estudios).

**Impacto**: rompe todo el flujo de expedientes, no solo reportes — "Mis expedientes", dashboards, bandeja de secretaría, asignación, evaluación. Requiere atención urgente del equipo backend (revisar logs de Render en una request real a `/expedientes/{id}`). Detalle completo y reproducción en `observaciones-backend.md` punto 6.

Mitigación en frontend mientras se corrige (no soluciona la causa):
- `reportes.service.ts`: mensaje de error más claro cuando `error.response` es `undefined` (fallo de red/CORS) en vez de "Network Error".
- `reportes-dashboard.tsx`: la tabla "Búsqueda filtrada de expedientes" ahora muestra un `Alert` cuando falla (antes fallaba en silencio).

## Parcial — UI lista, cableado final cuando el backend defina el contrato

- [ ] Tipos de investigador (Pregrado / Postgrado / Investigador) con campos dinámicos definidos por backend.
- [ ] Carga de documentos condicional por tipo (ocultar boleta a investigadores).

## Bloqueado — requiere endpoints/definición nueva del backend

- [ ] Nuevo campo de expediente: Programa de estudios (Facultad ya existe).
- [ ] Múltiples autores por expediente (principal + coautores, con correo, para notificaciones).
- [ ] Fecha límite de evaluación (campo nuevo, lo define el Coordinador).
- [ ] Código de expediente formato `N-2026`, incremental, reinicia cada año (lo genera el backend).
- [ ] Chat Estudiante ↔ Secretaría Técnica (endpoints de mensajería nuevos).
- [ ] Resultado automático de evaluación según puntaje (pendiente que el Comité defina los umbrales y el backend implemente la lógica).
