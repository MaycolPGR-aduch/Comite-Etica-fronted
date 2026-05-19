# Estado de Integración Frontend ↔ Backend

Fecha de actualización: 2026-05-19  
Backend base URL: `https://comite-backend.onrender.com/api/v1`

## 1. Endpoints implementados en frontend

### 1.1 Autenticación y sesión

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| POST | `/auth/login` | Implementado | Login real por `application/x-www-form-urlencoded` (username/password). |
| GET | `/users/me` | Implementado | Perfil del usuario autenticado (usado en sesión y notificaciones). |
| POST | `/auth/register` | Implementado | Registro de usuario desde formulario. |

### 1.2 Expedientes (módulo investigador)

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/expedientes/` | Implementado | Lista expedientes del usuario. |
| POST | `/expedientes/` | Implementado | Crea borrador con `titulo_protocolo`, `tipo_tramite`, `facultad`, `prioridad`. |
| GET | `/expedientes/{id}` | Implementado | Detalle de expediente. |
| GET | `/expedientes/{id}/bitacora` | Implementado | Timeline de bitácora. |
| GET | `/expedientes/{id}/historial` | Implementado | Historial de estado. |
| GET | `/expedientes/{id}/documentos` | Implementado | Lista real de documentos cargados por expediente. |
| POST | `/expedientes/{id}/documentos` | Implementado | Carga documento (`multipart/form-data`, campo `file`). |
| POST | `/expedientes/{id}/enviar` | Implementado | Envío formal de expediente. |
| POST | `/expedientes/{id}/subsanacion` | Implementado | Registro de subsanación con observaciones consolidadas (string). |

### 1.3 Users (módulo administrador)

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/users/` | Implementado | Listado de usuarios. |
| GET | `/users/{id}` | Implementado | Detalle de usuario. |
| PUT | `/users/{id}` | Implementado | Actualización de rol/estado activo. |
| DELETE | `/users/{id}` | Implementado | Desactivación de usuario. |

### 1.4 Evaluación (módulo evaluador/coordinador)

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/evaluacion/` | Implementado | Listado de evaluaciones. |
| POST | `/evaluacion/` | Implementado | Creación de evaluación. |
| GET | `/evaluacion/mis-evaluaciones` | Implementado | Bandeja del evaluador. |
| GET | `/evaluacion/{id}` | Implementado | Contexto y detalle de evaluación. |
| PUT | `/evaluacion/{id}` | Implementado | Envío final de evaluación. |
| POST | `/evaluacion/{id}/conflicto` | Implementado | Declaración de conflicto. |
| POST | `/evaluacion/{id}/guardar-parcial` | Implementado | Guardado parcial. |
| POST | `/evaluacion/expediente/{expediente_id}/asignar` | Implementado | Asignación manual por `evaluador_id`. |

### 1.5 Dictamen

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/dictamen/` | Implementado | Lista de dictámenes. |
| POST | `/dictamen/` | Implementado | Generación de dictamen. |
| GET | `/dictamen/{id}` | Implementado | Detalle de dictamen. |
| PUT | `/dictamen/{id}` | Implementado | Actualización de dictamen. |
| GET | `/dictamen/expediente/{id}` | Implementado | Dictámenes por expediente. |
| POST | `/dictamen/{id}/firmar` | Implementado | Firma de dictamen. |

### 1.6 Notificaciones

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/notificaciones/` | Implementado | Listado en panel global (filtros todas/no leídas). |
| POST | `/notificaciones/` | Implementado | Creación de notificación desde panel. |
| GET | `/notificaciones/sin-leer` | Implementado | Contador para campana global. |
| GET | `/notificaciones/{id}` | Implementado | Detalle por notificación. |
| PUT | `/notificaciones/{id}` | Implementado | Marcar leída/no leída. |
| POST | `/notificaciones/marcar-todas-leidas` | Implementado | Acción masiva “Marcar todas”. |

### 1.7 IA

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/ia/preanalisis/{id}` | Implementado | Bloque IA en evaluación del evaluador. |
| GET | `/ia/detectar-inconsistencias/{id}` | Implementado | Lista de inconsistencias sugeridas. |
| GET | `/ia/detectar-riesgos/{id}` | Implementado | Nivel/factores de riesgo sugeridos. |
| GET | `/ia/generar-observaciones/{id}` | Implementado | Observaciones sugeridas por IA. |
| GET | `/ia/resumen/{id}` | Implementado | Resumen IA en detalle de expediente. |

### 1.8 Reportes

| Método | Endpoint | Estado | Descripción corta |
|---|---|---|---|
| GET | `/reportes/expedientes-por-estado` | Implementado | Tabla y métricas de expedientes por estado. |
| GET | `/reportes/tiempos-atencion` | Implementado | Tabla de tiempos de atención. |
| GET | `/reportes/carga-evaluadores` | Implementado | Tabla de carga por evaluador. |
| GET | `/reportes/resultados-emitidos` | Implementado | Tabla de resultados emitidos. |
| GET | `/reportes/buscar-expedientes` | Implementado | Búsqueda filtrada por estado/fechas. |
| GET | `/reportes/exportar` | Implementado | Exportación con manejo defensivo de respuesta JSON/archivo. |

## 2. Endpoints backend aún no integrados en frontend

| Módulo | Estado |
|---|---|
| Auth / Users / Expedientes / Evaluación / Dictamen / Notificaciones / IA / Reportes | Completado |

## 3. Observaciones técnicas y funcionales

1. IA responde sin schema fuerte en OpenAPI (`{}` para 200 en todos los endpoints).
   - Frontend usa normalización defensiva y mensaje funcional para permisos (`403`) o payload parcial.
2. En pruebas reales de backend:
   - IA responde datos placeholder/mensajes de integración parcial en algunos endpoints.
3. `reportes/exportar` puede responder mensaje JSON en lugar de binario.
   - Frontend ya soporta ambos escenarios.
4. Subsanación ya usa endpoint real `POST /expedientes/{id}/subsanacion`.
   - El contrato backend actual recibe un único string `observaciones` (no matriz por observación).

## 4. Recomendaciones de siguiente iteración

1. Definir schemas OpenAPI de respuesta para IA y reportes (evita normalización heurística en frontend).
2. Si el negocio requiere trazabilidad granular de subsanación, exponer payload estructurado por observación.
3. Si se requiere descarga formal de dictamen PDF, exponer `archivo_url` estable o endpoint dedicado de descarga.
