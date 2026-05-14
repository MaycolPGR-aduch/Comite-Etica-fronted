## Observaciones para backend (actualizado 2026-05-13)

1. Lectura de documentos por expediente
- Pendiente clave: no existe `GET /expedientes/{expediente_id}/documentos`.
- Impacto frontend: no se puede validar en detalle qué archivos reales están cargados por expediente (solo checklist de UI).

2. OpenAPI de IA sin contrato de respuesta tipado
- Todos los endpoints `GET /ia/*` exponen response schema `{}` en 200.
- Impacto frontend: se aplicó normalización defensiva, pero sería ideal publicar schemas estables.

3. OpenAPI de reportes sin contrato tipado
- Endpoints de `reportes/*` también aparecen con schema `{}`.
- Impacto frontend: parsing defensivo en cliente y mayor riesgo de ruptura ante cambios.

4. Exportación de reportes
- `GET /reportes/exportar` puede responder JSON (`message/formato`) en vez de archivo binario.
- Recomendación: estandarizar respuesta por formato o documentar explícitamente ambos comportamientos.

5. Subsanación
- Falta endpoint formal para registrar respuestas estructuradas por observación.
- Actualmente se usa flujo de reenvío general como workaround en frontend.
