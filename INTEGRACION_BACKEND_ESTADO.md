# Estado de Integración Frontend ↔ Backend

Fecha de actualización: 2026-05-07  
Backend base URL: `https://comite-backend.onrender.com/api/v1`

## 1. Endpoints implementados en frontend

### 1.1 Autenticación y sesión

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| POST | `/auth/login` | Implementado | Login real por `application/x-www-form-urlencoded` (username/password). |
| GET | `/users/me` | Implementado | Obtiene perfil del usuario autenticado (usado en login y vista "Mi perfil"). |
| POST | `/auth/register` | Implementado | Registro de usuario desde formulario de creación de cuenta. |

### 1.2 Expedientes (módulo investigador, Fase 2)

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/expedientes/` | Implementado | Lista expedientes del usuario (con mapeo de estado a etiquetas UI). |
| POST | `/expedientes/` | Implementado | Crea expediente en estado borrador (RF-06). |
| GET | `/expedientes/{id}` | Implementado | Obtiene detalle de expediente. |
| GET | `/expedientes/{id}/bitacora` | Implementado | Recupera eventos de bitácora para timeline. |
| GET | `/expedientes/{id}/historial` | Implementado | Recupera historial de estados para timeline. |
| POST | `/expedientes/{id}/documentos` | Implementado | Registra metadatos de documentos (RF-08, alcance actual). |
| POST | `/expedientes/{id}/enviar` | Implementado | Envía expediente formalmente tras crear borrador y registrar documentos. |

### 1.3 Users (módulo administrador)

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/users/` | Implementado | Lista usuarios para administración en `/admin/usuarios`. |
| GET | `/users/{id}` | Implementado | Obtiene detalle puntual al abrir edición de usuario. |
| PUT | `/users/{id}` | Implementado | Actualiza rol y estado activo/inactivo desde modal de edición. |
| DELETE | `/users/{id}` | Implementado | Desactiva usuario (soft delete) desde listado administrativo. |

### 1.4 Evaluación (Fase 3)

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/evaluacion/` | Implementado | Servicio y hook para listado general por rol (`useEvaluaciones`). |
| POST | `/evaluacion/` | Implementado | Servicio y hook para crear evaluación desde expediente (`useCrearEvaluacion`). |
| GET | `/evaluacion/mis-evaluaciones` | Implementado | Bandeja del evaluador conectada a backend (`/evaluador/bandeja`). |
| GET | `/evaluacion/{id}` | Implementado | Contexto de pantalla de evaluación por `evaluacion_id`. |
| PUT | `/evaluacion/{id}` | Implementado | Envío final de evaluación (`completa=true`). |
| POST | `/evaluacion/{id}/conflicto` | Implementado | Acción de declarar conflicto de interés desde UI de evaluación. |
| POST | `/evaluacion/{id}/guardar-parcial` | Implementado | Guardado parcial de avance en formulario de evaluación. |

## 2. Endpoints backend aún no integrados en frontend

### 2.1 Evaluación

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| Ninguno | - | Completado | Todos los endpoints de evaluación definidos en README fueron integrados. |

### 2.2 Dictamen

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/dictamen/` | Pendiente | Listado de dictámenes. |
| POST | `/dictamen/` | Pendiente | Generación de dictamen. |
| GET | `/dictamen/{id}` | Pendiente | Detalle de dictamen. |
| PUT | `/dictamen/{id}` | Pendiente | Edición de dictamen. |
| GET | `/dictamen/expediente/{id}` | Pendiente | Obtiene dictamen por expediente. |
| POST | `/dictamen/{id}/firmar` | Pendiente | Firma de dictamen. |

### 2.3 Notificaciones

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/notificaciones/` | Pendiente | Listado de notificaciones del usuario. |
| POST | `/notificaciones/` | Pendiente | Creación de notificación. |
| GET | `/notificaciones/sin-leer` | Pendiente | Conteo de no leídas. |
| GET | `/notificaciones/{id}` | Pendiente | Detalle de notificación. |
| PUT | `/notificaciones/{id}` | Pendiente | Marcar leída/no leída. |
| POST | `/notificaciones/marcar-todas-leidas` | Pendiente | Marcar todas como leídas. |

### 2.4 Reportes e IA

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/reportes/expedientes-por-estado` | Pendiente | Dashboard por estado. |
| GET | `/reportes/tiempos-atencion` | Pendiente | Métrica de tiempos de atención. |
| GET | `/reportes/carga-evaluadores` | Pendiente | Carga por evaluador. |
| GET | `/reportes/resultados-emitidos` | Pendiente | Dictámenes por tipo. |
| GET | `/reportes/buscar-expedientes` | Pendiente | Búsqueda filtrada de expedientes. |
| GET | `/reportes/exportar` | Pendiente | Exportación de reporte. |
| GET | `/ia/preanalisis/{id}` | Pendiente | Preanálisis IA del expediente. |
| GET | `/ia/detectar-inconsistencias/{id}` | Pendiente | Detección IA de inconsistencias. |
| GET | `/ia/detectar-riesgos/{id}` | Pendiente | Detección IA de riesgos. |
| GET | `/ia/generar-observaciones/{id}` | Pendiente | Sugerencias IA de observaciones. |
| GET | `/ia/resumen/{id}` | Pendiente | Resumen IA del expediente. |

## 3. Observaciones técnicas y funcionales

1. `POST /expedientes/` (RF-06) actualmente acepta solo `titulo_protocolo`.
   - Frontend conserva campos UI (`tipoTramite`, `facultad`, `resumen`) como datos de formulario, pero backend no los persiste aún.
2. `POST /expedientes/{id}/documentos` (RF-08) está integrado en alcance de metadatos.
   - Se envían `nombre_archivo`, `tipo_documento`, `es_obligatorio`.
   - No hay carga binaria de archivos todavía (faltaría RF-10 / almacenamiento físico).
3. El endpoint de documentos está definido en OpenAPI con parámetros `query`.
   - No está modelado como `multipart/form-data` con archivo.
4. En vistas de detalle se usan fallbacks UI para campos no expuestos aún por backend (`facultad`, `prioridad`, etc.).
5. El flujo actual del wizard quedó alineado así:
   - Crear borrador → Registrar metadatos de documentos → Enviar expediente.
6. Subsanación sigue parcialmente adaptada.
   - El frontend hoy reutiliza envío para reenvío porque no existe endpoint específico para persistir respuestas por observación.
7. Módulo `Users` quedó operativo para administración básica.
   - Se soporta listado, consulta por ID, edición de `rol`/`activo` y desactivación.
   - El backend define `DELETE /users/{id}` con respuesta sin esquema estricto en OpenAPI; frontend maneja solo éxito/error.
8. Módulo `Evaluación` quedó operativo con endpoints reales.
   - La ruta del frontend `/evaluador/evaluacion/[id]` ahora usa `id` como `evaluacion_id`, no como `expediente_id`.
   - `guardar-parcial` y `conflicto` retornan `message` según README; OpenAPI los declara con esquema de respuesta vacío.
   - OpenAPI no declara `recommendation` en `EvaluacionResponse`, pero README sí. Frontend lo maneja como campo opcional para evitar ruptura.
9. Módulo de asignación de coordinador quedó adaptado a lógica automática actual.
   - Se usa `POST /evaluacion/` para asignar evaluadores de forma implícita por backend.
   - No existe endpoint para seleccionar evaluadores manualmente por `evaluador_id`; frontend muestra esta limitación en UI.

## 4. Recomendaciones de siguiente iteración

1. Definir contrato extendido de `ExpedienteCreate` si se requiere persistir campos UI adicionales.
2. Definir endpoint formal de subsanación con payload de respuestas observación por observación.
3. Evolucionar `POST /expedientes/{id}/documentos` a multipart real cuando se implemente carga física.
