Nota para backend (la que querías reportar)

POST /expedientes/ actualmente solo acepta titulo_protocolo.
El frontend necesita más metadatos para evitar fallbacks (tipo_tramite, facultad, prioridad, etc.).
POST /expedientes/{id}/documentos en OpenAPI aparece por query params (nombre_archivo, tipo_documento, es_obligatorio) y no como upload binario/form-data con archivo.
No hay endpoint explícito para observaciones del investigador en este flujo; por eso en detalle/subsanación se usan observaciones: [] como fallback de UI.