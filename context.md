# Contexto General del Proyecto

## 1) Objetivo
Frontend inicial del Sistema Web para la Gestión y Evaluación de Protocolos del Comité de Ética de una universidad.

Esta versión está orientada a ser:
- Navegable end-to-end.
- Basada en mocks.
- Fácil de migrar a backend real (FastAPI) sin rehacer UI.

## 2) Stack y convenciones
- Next.js (App Router)
- TypeScript (strict)
- Tailwind CSS + shadcn/ui
- React Hook Form + Zod
- TanStack Query
- Axios (encapsulado)

Reglas aplicadas:
- No hardcodear datos en páginas.
- Toda lectura/escritura de datos pasa por `src/services`.
- Mocks centralizados en `src/mocks`.
- Tipos de dominio centralizados en `src/types`.

## 3) Estructura principal
- `src/app`: rutas y vistas App Router.
- `src/components/layout`: `AppSidebar`, `AppHeader`, `DashboardLayout`, providers.
- `src/components/shared`: `MetricCard`, `StatusBadge`, `Timeline`, `DocumentChecklist`, `DataTable`, `EmptyState`.
- `src/services`: capa de servicios mock (contrato para futuro backend).
- `src/hooks`: hooks React Query por módulo.
- `src/mocks`: datos mock del dominio.
- `src/types`: contratos TypeScript del dominio.
- `src/lib`: utilidades y navegación por rol.

## 4) Contratos de dominio relevantes
Definidos en `src/types/domain.ts`:
- `Role`: investigador, secretaria, coordinador, evaluador, administrador.
- `ExpedienteStatus`:
  - Borrador
  - Enviado
  - En revisión administrativa
  - Observado por admisibilidad
  - Subsanado
  - Admitido
  - Asignado
  - En evaluación
  - Evaluaciones completas
  - En deliberación
  - Observado
  - Aprobado
  - Desaprobado
  - Cerrado
- Entidades: `Expediente`, `Documento`, `Observacion`, `HistorialEvento`, `Evaluacion`, `Dictamen`, `Metrica`.

## 5) Rutas implementadas (v1)
- `/login`
- Investigador:
  - `/investigador/dashboard`
  - `/investigador/expedientes`
  - `/investigador/expedientes/nuevo`
  - `/investigador/expedientes/[id]`
  - `/investigador/expedientes/[id]/subsanacion`
- Secretaría:
  - `/secretaria/bandeja`
  - `/secretaria/revision/[id]`
- Coordinador:
  - `/coordinador/dashboard`
  - `/coordinador/asignacion/[id]`
  - `/coordinador/consolidacion/[id]`
- Evaluador:
  - `/evaluador/bandeja`
  - `/evaluador/evaluacion/[id]`
- Administrador:
  - `/admin/configuracion`

## 6) Flujo funcional por rol
### Login
- Acceso mock con selección de rol.
- Redirección al dashboard/bandeja según rol.

### Investigador
- Dashboard con métricas + tabla de expedientes recientes + timeline.
- Nuevo expediente con wizard de 4 pasos (datos, documentos, revisión, envío).
- Mis expedientes con filtro por estado y acciones (detalle/subsanación/dictamen mock).
- Detalle de expediente con estado, checklist documental, observaciones e historial.
- Subsanación con respuesta por observación y reenvío mock.

### Secretaría técnica
- Bandeja con métricas de recepción y tabla de expedientes.
- Revisión administrativa con checklist y acciones admitir/devolver para subsanar.

### Coordinador
- Dashboard con métricas operativas.
- Asignación manual de exactamente 2 evaluadores (incluye carga/especialidad/conflicto).
- Consolidación comparando 2 evaluaciones (coincidencias/discrepancias) y dictamen mock.

### Evaluador
- Bandeja de expedientes asignados (estado, límite, prioridad).
- Evaluación ética en layout 2 columnas:
  - Izquierda: resumen/visor mock.
  - Derecha: formulario por secciones + riesgo + recomendación.
- Acciones: guardar avance y enviar evaluación.
- Panel IA mock explícitamente “no vinculante”.

### Administrador
- Configuración básica (solo interfaz):
  - Tipos de trámite
  - Documentos requeridos
  - Estados
  - Plantillas de notificación

## 7) Capa de datos (mock-first)
Servicios implementados en `src/services`:
- `auth.service.ts`
- `expedientes.service.ts`
- `revision-administrativa.service.ts`
- `asignacion.service.ts`
- `evaluacion.service.ts`
- `consolidacion.service.ts`
- `dashboard.service.ts`
- `configuracion.service.ts`

Características:
- Promesas tipadas.
- Latencia simulada.
- Contratos listos para sustituir mocks por llamadas REST.

## 8) UI/tema
- Paleta institucional azul aplicada en `src/app/globals.css`.
- Diseño limpio y consistente con cards/tablas/badges.
- Estados visibles y foco accesible básico.

## 9) Validación ejecutada
- `npm run lint`: OK
- `npm run build`: OK

## 10) Limitaciones actuales (esperadas en v1)
- Sin autenticación/autorización real.
- Sin persistencia real de operaciones (modo mock).
- Sin carga real de archivos (se simula en UI).

## 11) Guía para próxima fase (FastAPI)
Para conectar backend real sin romper la UI:
1. Mantener tipos en `src/types` como contrato base.
2. Reemplazar internals de `src/services` por llamadas Axios/REST.
3. Conservar hooks React Query (`src/hooks`) y componentes/páginas.
4. Mapear respuestas del backend a los tipos del dominio.
5. Agregar manejo consistente de errores HTTP y estados de carga.

## 12) Comandos útiles
- Desarrollo: `npm run dev`
- Lint: `npm run lint`
- Build: `npm run build`
