# Comite de Etica Frontend

Frontend del Sistema Web para la Gestion y Evaluacion de Protocolos del Comite de Etica de una universidad.

## Estado actual

- Aplicacion funcional con Next.js App Router y TypeScript estricto.
- Arquitectura separada por capas: vistas, componentes, hooks, servicios, tipos y mocks.
- Integracion real con el backend ya habilitada en los modulos principales: autenticacion, usuarios, expedientes, evaluacion (rubrica de 20 pts con 3 estados), dictamen, notificaciones, chat, IA y reportes.
- Evaluacion con rubrica oficial de 7 criterios: 1 solo evaluador por expediente, resultado automatico (Aprobado / Aprobado con observaciones / No aprobado) y dictamen derivado sin consolidacion del coordinador.
- Chat directo solicitante ↔ secretaria (polling, sin WebSockets): vista "Consultas" para estudiantes/investigadores y bandeja "Chat" para secretaria con nombre y codigo del estudiante.
- Descarga de documentos de evaluacion segun resultado: rubrica PDF y/o dictamen PDF, visibles para el solicitante y el evaluador.
- La configuracion institucional sigue basada en mock porque no depende de endpoints estables.
- Las tablas principales incluyen busqueda local y filtro por fecha de envio.

## Stack

- Next.js 16 con App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Axios
- Lucide React

## Objetivo funcional

Cubrir el flujo completo del expediente etico:

1. Registro del expediente (formulario dinamico por modalidad)
2. Revision administrativa
3. Asignacion de 1 evaluador
4. Evaluacion etica con rubrica (20 pts, 7 criterios)
5. Dictamen automatico segun el puntaje (3 estados)
6. Subsanacion y reenvio
7. Cambio de titulo (solo proyectos aprobados)

## Roles implementados

- Estudiante de pregrado / Estudiante de postgrado / Investigador (solicitantes, misma vista)
- Secretaria tecnica
- Coordinador
- Evaluador
- Administrador

## Rutas principales

### Publicas

- `/login`
- `/crear-usuario`
- `/crear-usuario/exito`
- `/recuperar-contrasena`
- `/recuperar-contrasena/verificacion`
- `/recuperar-contrasena/nueva-clave`
- `/recuperar-contrasena/completado`
- `/acerca-comite-etica`

### Privadas por rol

#### Investigador (y estudiantes)

- `/investigador/dashboard`
- `/investigador/expedientes`
- `/investigador/expedientes/nuevo`
- `/investigador/expedientes/[id]`
- `/investigador/expedientes/[id]/subsanacion`
- `/investigador/cambio-titulo`
- `/investigador/consultas` (chat con secretaria)

#### Secretaria

- `/secretaria/bandeja`
- `/secretaria/revision/[id]`
- `/secretaria/chat` (bandeja de conversaciones con solicitantes)

#### Coordinador

- `/coordinador/dashboard`
- `/coordinador/asignacion/[id]`

> La vista de consolidacion se elimino: con la rubrica el dictamen es automatico y el
> coordinador solo ve el estado final del expediente.

#### Evaluador

- `/evaluador/bandeja`
- `/evaluador/evaluacion/[id]`

#### Administrador

- `/admin/configuracion`
- `/admin/usuarios`
- `/admin/reportes`
- `/admin/perfil`

## Arquitectura del proyecto

```txt
src/
├── app/
│   ├── api/
│   ├── admin/
│   ├── coordinador/
│   ├── evaluador/
│   ├── investigador/
│   ├── secretaria/
│   └── ...
├── components/
│   ├── layout/
│   ├── shared/
│   └── ui/
├── hooks/
├── lib/
├── mocks/
├── services/
├── types/
└── styles/
```

## Capa de datos

La app sigue una estrategia mock-first, pero con migracion progresiva a REST real donde ya existe OpenAPI.

### Regla principal

- Toda lectura y escritura de datos pasa por `src/services`.
- Las vistas no consumen el backend directamente.
- Los tipos de dominio viven en `src/types`.
- Los mocks siguen centralizados en `src/mocks`.

### Servicios existentes

- `auth.service.ts`
- `chat.service.ts`
- `expedientes.service.ts`
- `revision-administrativa.service.ts`
- `asignacion.service.ts`
- `evaluacion.service.ts`
- `dashboard.service.ts`
- `configuracion.service.ts`
- `dictamen.service.ts`
- `notifications.service.ts`
- `reportes.service.ts`
- `ia.service.ts`
- `users.service.ts`

### Hooks

- `src/hooks/use-comite-query.ts` centraliza TanStack Query para desacoplar UI y servicios.
- Las mutaciones invalidan cache por modulo y mantienen la UI sincronizada.

## Integracion con OpenAPI

### Implementado en frontend

#### Autenticacion

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/users/me`

#### Usuarios

- `GET /api/v1/users/`
- `GET /api/v1/users/{user_id}`
- `PUT /api/v1/users/{user_id}`
- `DELETE /api/v1/users/{user_id}`

#### Expedientes

- `GET /api/v1/expedientes/`
- `POST /api/v1/expedientes/`
- `GET /api/v1/expedientes/{expediente_id}`
- `PUT /api/v1/expedientes/{expediente_id}`
- `POST /api/v1/expedientes/{expediente_id}/enviar`
- `GET /api/v1/expedientes/{expediente_id}/bitacora`
- `GET /api/v1/expedientes/{expediente_id}/historial`
- `GET /api/v1/expedientes/{expediente_id}/documentos`
- `POST /api/v1/expedientes/{expediente_id}/documentos`
- `POST /api/v1/expedientes/{expediente_id}/subsanacion`

#### Descarga de documentos

- `GET /api/v1/expedientes/{expediente_id}/documentos/{documento_id}/preview`
- `GET /api/v1/expedientes/{expediente_id}/documentos/{documento_id}/descargar`
- Estas rutas se exponen como proxy local en Next.js para evitar CORS.

#### Evaluacion (rubrica de 20 pts)

- `GET /api/v1/evaluacion/rubrica` (catalogo de 7 criterios + umbrales)
- `GET /api/v1/evaluacion/`
- `GET /api/v1/evaluacion/mis-evaluaciones`
- `GET /api/v1/evaluacion/{evaluacion_id}`
- `PUT /api/v1/evaluacion/{evaluacion_id}` (criterios + completa → calcula resultado y genera PDFs)
- `GET /api/v1/evaluacion/{evaluacion_id}/descargar-rubrica`
- `GET /api/v1/evaluacion/{evaluacion_id}/descargar-dictamen`
- `POST /api/v1/evaluacion/{evaluacion_id}/conflicto`
- `POST /api/v1/evaluacion/{evaluacion_id}/guardar-parcial`
- `POST /api/v1/evaluacion/expediente/{expediente_id}/asignar` (1 evaluador por expediente)

#### Documentos de evaluacion (lado solicitante)

- `GET /api/v1/expedientes/{expediente_id}/descargar-evaluacion/informe` (rubrica PDF)
- `GET /api/v1/expedientes/{expediente_id}/descargar-evaluacion/dictamen` (dictamen PDF)
- Segun el resultado: aprobado → solo dictamen; aprobado con observaciones → ambos; no aprobado → solo rubrica.

#### Chat solicitante ↔ secretaria

- `GET /api/v1/chat/mios` / `POST /api/v1/chat/mios` / `GET /api/v1/chat/mios/no-leidos` (solicitante)
- `GET /api/v1/chat/conversaciones` (bandeja con nombre, codigo y no-leidos)
- `GET /api/v1/chat/solicitantes` (para iniciar conversacion)
- `GET /api/v1/chat/no-leidos`
- `GET /api/v1/chat/{solicitante_id}` / `POST /api/v1/chat/{solicitante_id}` (secretaria)
- Actualizacion por polling: hilo 4s, bandeja 10s, contadores 20s.

#### Dictamen

- `GET /api/v1/dictamen/`
- `POST /api/v1/dictamen/`
- `GET /api/v1/dictamen/{dictamen_id}`
- `PUT /api/v1/dictamen/{dictamen_id}`
- `GET /api/v1/dictamen/expediente/{expediente_id}`
- `POST /api/v1/dictamen/{dictamen_id}/firmar`

#### Descarga de dictamen firmado

- `GET /api/v1/dictamen/{dictamen_id}/descargar`
- Tambien se consume via proxy local en Next.js para evitar el redirect cross-origin hacia S3.

#### Notificaciones

- `GET /api/v1/notificaciones/`
- `GET /api/v1/notificaciones/sin-leer`
- `GET /api/v1/notificaciones/{notificacion_id}`
- `POST /api/v1/notificaciones/`
- `PUT /api/v1/notificaciones/{notificacion_id}`
- `POST /api/v1/notificaciones/marcar-todas-leidas`

#### IA

- `GET /api/v1/ia/preanalisis/{expediente_id}`
- `GET /api/v1/ia/detectar-inconsistencias/{expediente_id}`
- `GET /api/v1/ia/generar-observaciones/{expediente_id}`
- `GET /api/v1/ia/resumen/{expediente_id}`

#### Reportes

- `GET /api/v1/reportes/expedientes-por-estado`
- `GET /api/v1/reportes/tiempos-atencion`
- `GET /api/v1/reportes/carga-evaluadores`
- `GET /api/v1/reportes/resultados-emitidos`
- `GET /api/v1/reportes/buscar-expedientes`
- `GET /api/v1/reportes/exportar`

### Pendientes de uso en frontend

- `POST /api/v1/auth/login-json`
- `GET /api/v1/reportes/resumen`
- `GET /api/v1/health`
- `GET /`

## Flujo funcional por rol

### Login

- Login unificado por email y contraseña (sin selector de rol).
- Redireccion segun el perfil autenticado; los 3 roles solicitantes comparten la vista de investigador.

### Investigador / Estudiantes

- Dashboard con metricas, proyectos recientes y timeline.
- Nuevo proyecto con formulario dinamico de 3 pasos segun modalidad (pregrado/postgrado/interno).
- Mis proyectos con busqueda y filtro por fecha de envio.
- Detalle con checklist documental, observaciones, historial y descarga de rubrica/dictamen segun resultado.
- Cambio de titulo (solo proyectos aprobados; el N° de acta se deriva del codigo).
- Consultas: chat directo con la secretaria.
- Subsanacion y reenvio.

### Secretaria tecnica

- Bandeja con metricas y expedientes recibidos (filtro por solicitante y fecha).
- Revision administrativa con acciones de admitir o devolver.
- Chat con solicitantes: bandeja de conversaciones con nombre y codigo del estudiante, y puede iniciar conversaciones nuevas.

### Coordinador

- Dashboard con seguimiento operativo.
- Asignacion manual de 1 evaluador por expediente.
- El dictamen es automatico (derivado de la rubrica); el coordinador solo ve el estado final.

### Evaluador

- Bandeja de evaluaciones asignadas.
- Evaluacion con rubrica oficial: 7 criterios, total en vivo sobre 20 y resultado previsto.
- Al enviar se calcula el resultado, se generan los PDFs y puede descargarlos.
- Guardado parcial y declaracion de conflicto.

### Administrador

- Gestion de usuarios.
- Reportes.
- Configuracion institucional basica.

## Componentes compartidos

Los componentes mas reutilizados viven en `src/components/shared`:

- `DataTable` (con filtro opcional por fecha)
- `MetricCard`
- `StatusBadge` (incluye los 3 estados de resultado)
- `Timeline`
- `DocumentChecklist`
- `EmptyState`
- `ReportesDashboard`
- `ChatThread` (hilo de chat compartido por solicitante y secretaria)

## UI y experiencia

- Diseño institucional, limpio y consistente.
- Foco accesible y estados hover/active/disabled claros.
- Tablas con filtros reutilizables y busqueda local.
- Descargas guiadas con mensajes de error legibles.

## Variables de entorno

Existe `NEXT_PUBLIC_API_URL` para apuntar al backend.

Ejemplo:

```env
NEXT_PUBLIC_API_URL=https://comite-backend.onrender.com/api/v1
```

Si no se define, se usa por defecto:

- `https://comite-backend.onrender.com/api/v1`

## Ejecutar localmente

### Requisitos

- Node.js 20+
- npm 10+

### Instalacion

```bash
npm install
```

### Desarrollo

> **Importante:** usar SIEMPRE el flag `--webpack`. Turbopack (el default de `npm run dev`)
> crashea en bucle en este proyecto ("Next.js package not found") y recarga la pagina sin parar.

```bash
npx next dev --webpack
```

Abrir: [http://localhost:3000](http://localhost:3000)

### Lint

```bash
npm run lint
```

### Build de produccion

```bash
npm run build
npm start
```

## Validacion reciente

- `npm run lint`: OK
- `npm run build`: OK

## Despliegue

### Vercel

1. Conecta el repositorio.
2. Framework detectado: Next.js.
3. Build command: `npm run build`.
4. Output: automatico.

### Servidor Node

1. `npm ci`
2. `npm run build`
3. `npm run start`
4. Exponer puerto 3000 detras de proxy.

## Notas de trabajo

- `context.md` fue consolidado dentro de este README para evitar duplicacion.
- La integracion backend sigue en evolucion, pero el frontend ya consume el contrato principal de OpenAPI.
- La configuracion sigue mock hasta que exista un endpoint estable para catalogos.

## Siguiente fase recomendada

1. Alinear schemas OpenAPI de IA y reportes para reducir parsing defensivo.
2. Consolidar endpoints de busqueda y reportes agregados si el negocio los necesita.
3. Migrar la configuracion mock a REST real cuando el backend la defina.
