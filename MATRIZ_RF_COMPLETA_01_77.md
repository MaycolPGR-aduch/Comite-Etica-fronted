# Matriz RF Completa (RF-01 a RF-77)

Fecha de corte: 2026-05-13  
Base de contraste: requerimientos de la hoja `RF post flujo del sistema` + estado real del frontend integrado.

> Nota de alcance: la hoja oculta `RF comite de etica` contiene RF de otro dominio (gerencia/finanzas/logistica) y no se considera para este sistema.

| RF | Estado actual | Frontend | Backend requerido | Prioridad de cierre |
|---|---|---|---|---|
| RF-01 | Parcial | Registro de usuario implementado (`/auth/register`) con campos base. | Completar validaciones/campos academicos e institucionales si son obligatorios. | Alta |
| RF-02 | Cumple | Login real integrado (`/auth/login`) con sesion y redireccion por rol. | Mantener politica de seguridad (expiracion/revocacion) documentada. | Media |
| RF-03 | Cumple | Gestion de roles y estado de usuarios en modulo admin (`/users`). | Reglas de negocio de roles y permisos por endpoint consolidadas. | Media |
| RF-04 | Cumple | Control de acceso por rol en frontend (rutas/modulos por perfil). | Confirmar enforcement de permisos en backend para todas las rutas. | Media |
| RF-05 | Pendiente | Existen pantallas de recuperacion, sin flujo backend real conectado. | Endpoints de recuperar/verificar/restablecer contrasena. | Alta |
| RF-06 | Cumple | Creacion de expediente integrada (`POST /expedientes/`). | Mantener contrato estable de creacion. | Baja |
| RF-07 | Parcial | Formulario captura titulo, tipo_tramite, facultad, prioridad. | Ampliar contrato para datos estructurados completos del protocolo. | Alta |
| RF-08 | Parcial | Carga de documentos integrada (`POST /expedientes/{id}/documentos`). | Definir reglas finales de documentos y consulta completa por expediente. | Alta |
| RF-09 | Parcial | Validacion UI por tipo de tramite (checklist basico). | Validacion backend de completitud obligatoria previa a envio. | Alta |
| RF-10 | Parcial | Validacion basica en UI (segun flujo actual). | Validar extension/tamano/nomenclatura en backend (reglas formales). | Alta |
| RF-11 | Cumple | Flujo de borrador funcional (estado inicial borrador). | Mantener estado inicial y reglas de transicion. | Baja |
| RF-12 | Cumple | Envio formal implementado (`POST /expedientes/{id}/enviar`). | Mantener idempotencia y reglas de estado. | Baja |
| RF-13 | Cumple | Codigo unico visible y consumido en frontend. | Mantener generacion automatica estable. | Baja |
| RF-14 | Cumple | Fecha de envio reflejada desde backend. | Mantener registro automatico en backend. | Baja |
| RF-15 | Cumple | Bandeja de secretaria operativa con expedientes pendientes. | Mantener filtros/estados disponibles para secretaria. | Media |
| RF-16 | Parcial | Secretaria revisa expediente, pero checklist usa fallback en parte. | Exponer `GET /expedientes/{id}/documentos` y estado real por documento. | Alta |
| RF-17 | Parcial | Campo de observaciones administrativas en UI. | Endpoint formal para persistir observaciones administrativas estructuradas. | Alta |
| RF-18 | Cumple | Devolucion a subsanacion operativa por cambio de estado. | Mantener reglas de transicion de estado. | Media |
| RF-19 | Cumple | Cambio de estado por admisibilidad implementado en flujo operativo. | Consolidar catalogo de estados oficiales y permisos. | Media |
| RF-20 | Parcial | Reenvio subsanado implementado como workaround operativo. | Endpoint formal de reenvio de subsanacion con trazabilidad. | Alta |
| RF-21 | Parcial | Clasificacion basica por tipo_tramite/facultad. | Campos de clasificacion inicial completa (area, riesgo preliminar, etc.). | Alta |
| RF-22 | Parcial | Prioridad simple (alta/media/baja) en frontend. | Regla de complejidad oficial y persistencia formal. | Media |
| RF-23 | Parcial | Asignacion de evaluadores funcional en frontend (manual operativa). | Reforzar regla backend de exactamente 2 y evitar duplicidades. | Alta |
| RF-24 | Pendiente | No hay motor de sugerencias real. | Endpoint/logica de sugerencia por carga/especialidad/disponibilidad. | Media |
| RF-25 | Cumple | Declaracion de conflicto integrada (`POST /evaluacion/{id}/conflicto`). | Mantener reglas de bloqueo y trazabilidad por conflicto. | Media |
| RF-26 | Parcial | Reasignacion posible de forma operativa, no flujo dedicado completo. | Endpoint/reglas formales de reemplazo de evaluador. | Alta |
| RF-27 | Parcial | Modulo de notificaciones implementado en UI. | Disparadores automaticos backend al asignar expediente. | Alta |
| RF-28 | Parcial | Evaluador accede al expediente y contexto principal. | Lectura completa de anexos/documentos reales por expediente. | Alta |
| RF-29 | Cumple | Formulario de evaluacion operativo por expediente/evaluacion. | Mantener contrato de campos y validaciones. | Media |
| RF-30 | Cumple | Observaciones por seccion soportadas en frontend. | Confirmar persistencia estructurada o formato acordado. | Media |
| RF-31 | Cumple | Recomendacion preliminar implementada. | Mantener enumeraciones oficiales de recomendaciones. | Baja |
| RF-32 | Cumple | Nivel de riesgo integrado en evaluacion. | Mantener catalogo de niveles y validacion. | Baja |
| RF-33 | Cumple | Guardado parcial integrado (`guardar-parcial`). | Mantener endpoint y reglas de consistencia. | Baja |
| RF-34 | Cumple | Envio formal de evaluacion integrado (`PUT /evaluacion/{id}`). | Mantener cierre de evaluacion y reglas de bloqueo. | Baja |
| RF-35 | Pendiente | No hay control de plazo visible/operativo por evaluacion. | Campo de deadline + reglas de vencimiento en backend. | Alta |
| RF-36 | Pendiente | No hay recordatorio automatico por vencimientos. | Scheduler/trigger de notificaciones por plazos. | Media |
| RF-37 | Parcial | Frontend infiere estado por evaluaciones existentes/completas. | Endpoint/estado formal de evaluaciones completas por expediente. | Media |
| RF-38 | Parcial | Vista de consolidacion comparativa basica disponible. | Contrato backend de consolidacion oficial (observaciones fusionadas). | Alta |
| RF-39 | Parcial | Deteccion basica de coincidencias/discrepancias en UI. | Logica formal backend para discrepancias auditables. | Media |
| RF-40 | Pendiente | No existe derivacion colegiada formal en flujo backend. | Endpoint/estado de derivacion a validacion colegiada. | Alta |
| RF-41 | Pendiente | No hay registro formal de deliberacion colegiada. | Endpoint de acuerdos/comentarios/decision colegiada. | Alta |
| RF-42 | Parcial | Coordinador participa via consolidacion/dictamen operativo. | Regla formal de validacion final coordinador/presidente. | Alta |
| RF-43 | Pendiente | No hay modulo/endpoint formal de resolucion de discrepancias. | Endpoint de resolucion y trazabilidad de discrepancias. | Media |
| RF-44 | Cumple | Generacion de dictamen integrada (`POST /dictamen/`). | Mantener reglas de negocio y permisos. | Baja |
| RF-45 | Pendiente | No hay plantillas formales parametrizadas en UI/backend. | Endpoints/plantillas por tipo de resultado. | Media |
| RF-46 | Cumple | Numeracion consumida desde backend (`numero_dictamen`). | Mantener correlativo/identificador estable. | Baja |
| RF-47 | Pendiente | No hay acta/resolucion descargable formal en frontend. | Endpoint de generacion/descarga de documento oficial. | Alta |
| RF-48 | Parcial | UI de notificaciones lista. | Trigger backend para notificar resultado final automaticamente. | Alta |
| RF-49 | Pendiente | Investigador no tiene vista consolidada formal de observaciones finales. | Endpoint de observaciones consolidadas para investigador. | Alta |
| RF-50 | Parcial | Flujo de subsanacion existe de forma operativa. | Endpoint estructurado para responder observaciones especificas. | Alta |
| RF-51 | Parcial | Se puede cargar nueva documentacion, sin control pleno de version. | Versionado formal y consulta de versiones por documento. | Alta |
| RF-52 | Pendiente | Historial de versiones documentales no disponible completo en UI. | Endpoint de historial/versiones de documentos. | Alta |
| RF-53 | Pendiente | No hay matriz formal de subsanacion en frontend/backend. | Endpoint/estructura de matriz de levantamiento. | Media |
| RF-54 | Parcial | Reenvio a revision operativo via envio general. | Endpoint de reenvio de subsanacion con estado formal. | Alta |
| RF-55 | Parcial | Revision de subsanacion posible solo en flujo operativo simplificado. | Flujo formal de evaluador/comite para validar subsanacion. | Alta |
| RF-56 | Pendiente | Cierre por conformidad no automatizado como etapa dedicada. | Endpoint/estado formal de cierre por conformidad. | Alta |
| RF-57 | Cumple | Investigador ve estado actual del expediente en dashboard/detalle. | Mantener consistencia de estados y permisos. | Baja |
| RF-58 | Cumple | Linea de tiempo disponible (bitacora + historial). | Mantener trazabilidad temporal y orden cronologico. | Baja |
| RF-59 | Cumple | Registro de acciones visible por bitacora/historial. | Garantizar cobertura de eventos criticos en auditoria. | Media |
| RF-60 | Parcial | Hay historial parcial por modulo (expediente/evaluacion/dictamen). | Endpoint consolidado completo de trazabilidad integral. | Media |
| RF-61 | Parcial | Busqueda disponible en reportes con filtros base. | Filtros avanzados transversales (codigo, evaluador, tipo, fechas, etc.). | Media |
| RF-62 | Parcial | Infra de notificaciones en frontend implementada. | Trigger automatico backend al recibir expediente. | Alta |
| RF-63 | Parcial | UI soporta notificaciones de observacion. | Trigger backend al observar por admisibilidad. | Alta |
| RF-64 | Parcial | UI soporta notificacion a evaluador asignado. | Trigger backend al asignar evaluador. | Alta |
| RF-65 | Pendiente | No hay alertas reales por plazos proximos. | Job/reglas de vencimientos en backend. | Media |
| RF-66 | Parcial | UI soporta notificacion de resultado final. | Trigger backend al emitir dictamen final. | Alta |
| RF-67 | Cumple | Reporte de expedientes por estado integrado. | Mantener consistencia de datos agregados. | Baja |
| RF-68 | Cumple | Reporte de tiempos de atencion integrado. | Mantener contrato y definicion de metricas. | Baja |
| RF-69 | Cumple | Reporte de carga por evaluador integrado. | Mantener filtros y exactitud de carga. | Baja |
| RF-70 | Cumple | Reporte de resultados emitidos integrado. | Mantener agregados por tipo de decision. | Baja |
| RF-71 | Parcial | Exportacion integrada con manejo defensivo JSON/blob. | Estandarizar respuesta de exportacion por formato. | Media |
| RF-72 | Parcial | Preanalisis IA integrado en UI del evaluador. | Contrato de respuesta estable y salida no placeholder. | Media |
| RF-73 | Parcial | Deteccion IA de inconsistencias integrada. | Schema OpenAPI y logica estable en backend. | Media |
| RF-74 | Parcial | Deteccion IA de riesgos integrada. | Schema OpenAPI y respuesta estable por expediente. | Media |
| RF-75 | Parcial | Observaciones sugeridas IA integradas. | Schema OpenAPI y calidad consistente de respuesta. | Media |
| RF-76 | Parcial | Resumen IA integrado en detalle de expediente. | Contrato tipado y respuesta estable no parcial. | Media |
| RF-77 | Cumple | UI comunica uso no vinculante y caracter preliminar de IA. | Mantener disclaimers y trazabilidad de decisiones humanas. | Baja |

## Resumen ejecutivo

- Cumple: 28 RF
- Parcial: 35 RF
- Pendiente: 14 RF

## Bloques de cierre prioritario sugerido

1. Subsanaciones completas (`RF-50` a `RF-56`).
2. Revision administrativa formal y documentos (`RF-16`, `RF-17`, `RF-20`, `RF-28`).
3. Consolidacion colegiada formal (`RF-40` a `RF-43`).
4. Recuperacion de contrasena (`RF-05`).
5. Notificaciones automaticas por eventos (`RF-62` a `RF-66`).
