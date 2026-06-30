## Observaciones para backend (actualizado 2026-06-30)

1. Lectura de documentos por expediente
- Resuelto: ya existe `GET /expedientes/{expediente_id}/documentos` y frontend quedó alineado.

2. OpenAPI de IA sin contrato de respuesta tipado
- Todos los endpoints `GET /ia/*` exponen response schema `{}` en 200.
- Impacto frontend: se aplicó normalización defensiva, pero sería ideal publicar schemas estables.

3. OpenAPI de reportes — actualizado 2026-06-30
- **Resuelto parcialmente**: 4 de 6 endpoints ya tienen schema tipado en el OpenAPI publicado (verificado contra `https://comite-backend.onrender.com/api/v1/openapi.json`): `expedientes-por-estado` (`EstadisticasExpediente`), `tiempos-atencion` (`ReporteTiempoAtencion`), `carga-evaluadores` (`ReporteCargaEvaluadores`), `resultados-emitidos` (`ReporteResultados`). El frontend ya consume estos 4 correctamente (campos verificados 1 a 1).
- **Pendiente**: `GET /reportes/buscar-expedientes` y `GET /reportes/exportar` siguen con schema `{}` sin tipar.
- **Endpoint nuevo no integrado**: existe `GET /reportes/resumen` (`ReporteGeneralResponse`) que devuelve un reporte consolidado (expedientes, evaluadores, tiempos_atencion, carga_evaluadores, resultados, fecha_generacion, archivo_url) en una sola llamada. El frontend todavía NO lo consume; actualmente arma una vista equivalente con 4 llamadas separadas. Evaluar si conviene migrar `ReportesDashboard` a este endpoint para reducir round-trips.

4. Exportación de reportes
- `GET /reportes/exportar` puede responder JSON (`message/formato`) en vez de archivo binario.
- Recomendación: estandarizar respuesta por formato o documentar explícitamente ambos comportamientos.

5. Subsanación
- Resuelto parcialmente: existe `POST /expedientes/{expediente_id}/subsanacion` y frontend lo consume.
- Observación: el payload actual es un único campo `observaciones` (texto consolidado), no estructura por observación.

6. **🔴 BUG CRÍTICO — `500 Internal Server Error` en TODOS los endpoints que serializan `Expediente`, confirmado con sesión real (reportado y reproducido 2026-06-30)**

   Reportado inicialmente como un error de CORS en la pantalla de reportes del Coordinador, pero al reproducirlo con credenciales de prueba reales se confirmó que es un **500 genuino del servidor**, mucho más amplio de lo que el síntoma original sugería.

   **Reproducción (con `curl`, login real vía `/auth/login`, contra `https://comite-backend.onrender.com`):**

   | Endpoint | Resultado |
   |---|---|
   | `GET /expedientes/` (lista) | ❌ 500 |
   | `GET /expedientes/{id}` (detalle) — probado con los 9 expedientes existentes (ids 1-9) | ❌ 500 en TODOS |
   | `GET /expedientes/{id}/documentos` | ❌ 500 |
   | `GET /expedientes/{id}/bitacora` | ✅ 200 |
   | `GET /expedientes/{id}/historial` | ✅ 200 |
   | `GET /evaluacion/` (lista) | ❌ 500 |
   | `GET /reportes/buscar-expedientes` | ❌ 500 |
   | `GET /reportes/tiempos-atencion` | ❌ 500 |
   | `GET /reportes/expedientes-por-estado`, `/carga-evaluadores`, `/resultados-emitidos` | ✅ 200 (no serializan `Expediente` individual, son agregados) |
   | `GET /users/`, `/notificaciones/`, `/dictamen/` | ✅ 200 |

   Probado igual con cuenta de rol `investigador` y `coordinador` — el error ocurre para ambos roles por igual, **no es específico de un rol ni de un registro puntual**: fallan los 9 expedientes existentes, tanto en lista como en detalle.

   **Importante — por qué no se detectó antes**: el error solo ocurre con un token de sesión **válido**. Con request sin token o con token inválido, la ruta responde `401` antes de llegar a la lógica que falla, por eso pruebas previas sin autenticación no lo mostraban. En el navegador, la respuesta 500 no incluye headers CORS (la excepción no controlada salta el middleware), por lo que Chrome lo reporta como "bloqueado por política CORS" en vez de mostrar el 500 real — un mensaje engañoso.

   **Diagnóstico de causa probable**: el patrón (fallan TODOS los expedientes, lista y detalle, pero `bitacora`/`historial` — tablas separadas — funcionan bien) es típico de un error de **validación de Pydantic al serializar la respuesta** (`ExpedienteResponseDto`): un campo nuevo no-nulo que no coincide con datos existentes en `NULL`, un tipo cambiado, o un campo eliminado/renombrado en el modelo. Coincide en tiempo con los requerimientos nuevos de alineación que el equipo backend está implementando en paralelo (código de expediente `N-2026`, fecha límite de evaluación, nuevos estados `aprobado_con_observaciones`/`desaprobado`, programa de estudios) — es probable que un cambio reciente al modelo `Expediente` haya roto la serialización para los registros existentes.

   **Impacto real**: esto rompe **todo el flujo de expedientes en producción/staging**, no solo reportes: "Mis expedientes" (investigador), dashboards (investigador/coordinador), bandeja de secretaría, asignación de evaluador, evaluación — todas las pantallas que listan o muestran detalle de expedientes están afectadas.

   **Recomendación urgente**: revisar logs del servidor (Render) en una request real a `GET /expedientes/{id}`, buscando un `pydantic.ValidationError` o `ResponseValidationError` al serializar `ExpedienteResponseDto` o `DocumentoResponseDto`. Probablemente ligado a un cambio reciente del modelo de Expediente.

   **Mitigación aplicada en frontend mientras se corrige** (no soluciona la causa, solo evita fallos silenciosos):
   - `reportes.service.ts`: mensaje de error más claro cuando `error.response` es `undefined` (fallo de red/CORS) en vez de "Network Error".
   - `reportes-dashboard.tsx`: la tabla "Búsqueda filtrada de expedientes" ahora muestra un `Alert` cuando falla (antes fallaba en silencio).
