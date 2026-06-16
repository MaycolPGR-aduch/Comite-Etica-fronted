# Comite de Etica Frontend

Frontend del Sistema Web para la Gestion y Evaluacion de Protocolos del Comite de Etica de una universidad.

## Estado actual

- Aplicacion funcional con Next.js App Router y TypeScript estricto.
- Arquitectura separada por capas: vistas, componentes, hooks, servicios, tipos y mocks.
- Integracion real con el backend ya habilitada en los modulos principales: autenticacion, usuarios, expedientes, evaluacion, dictamen, notificaciones, IA y reportes.
- La configuracion institucional sigue basada en mock porque no depende de endpoints estables.
- Las descargas de documentos y dictamen usan rutas proxy server-side en Next.js para evitar CORS y redirects directos a S3.
- Las tablas principales de expedientes y evaluaciones ya incluyen busqueda local y filtros reutilizables.
- Validado recientemente con `npm run lint` y `npm run build`.

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

1. Registro del expediente
2. Revision administrativa
3. Asignacion de evaluadores
4. Evaluacion etica
5. Consolidacion y dictamen
6. Subsanacion y reenvio

## Roles implementados

- Investigador
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

#### Investigador

- `/investigador/dashboard`
- `/investigador/expedientes`
- `/investigador/expedientes/nuevo`
- `/investigador/expedientes/[id]`
- `/investigador/expedientes/[id]/subsanacion`

#### Secretaria

- `/secretaria/bandeja`
- `/secretaria/revision/[id]`

#### Coordinador

- `/coordinador/dashboard`
- `/coordinador/asignacion/[id]`
- `/coordinador/consolidacion/[id]`

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
- `expedientes.service.ts`
- `revision-administrativa.service.ts`
- `asignacion.service.ts`
- `evaluacion.service.ts`
- `consolidacion.service.ts`
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

#### Evaluacion

- `GET /api/v1/evaluacion/`
- `GET /api/v1/evaluacion/mis-evaluaciones`
- `GET /api/v1/evaluacion/{evaluacion_id}`
- `PUT /api/v1/evaluacion/{evaluacion_id}`
- `POST /api/v1/evaluacion/{evaluacion_id}/conflicto`
- `POST /api/v1/evaluacion/{evaluacion_id}/guardar-parcial`
- `POST /api/v1/evaluacion/expediente/{expediente_id}/asignar`

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
- `GET /api/v1/ia/detectar-riesgos/{expediente_id}`
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

- Acceso con selector de rol.
- Redireccion segun el perfil autenticado.

### Investigador

- Dashboard con metricas, expedientes recientes y timeline.
- Nuevo expediente con wizard de 4 pasos.
- Mis expedientes con busqueda y filtros.
- Detalle con checklist documental, observaciones, historial y dictamen.
- Subsanacion y reenvio.

### Secretaria tecnica

- Bandeja con metricas y expedientes recibidos.
- Revision administrativa con acciones de admitir o devolver.

### Coordinador

- Dashboard con seguimiento operativo.
- Asignacion manual de exactamente 2 evaluadores.
- Consolidacion comparativa y firma de dictamen.

### Evaluador

- Bandeja de evaluaciones asignadas.
- Evaluacion etica en dos columnas.
- Guardado parcial, envio final y declaracion de conflicto.

### Administrador

- Gestion de usuarios.
- Reportes.
- Configuracion institucional basica.

## Componentes compartidos

Los componentes mas reutilizados viven en `src/components/shared`:

- `DataTable`
- `MetricCard`
- `StatusBadge`
- `Timeline`
- `DocumentChecklist`
- `EmptyState`
- `ReportesDashboard`

## UI y experiencia

- Diseño institucional, limpio y consistente.
- Foco accesible y estados hover/active/disabled claros.
- Tablas con filtros reutilizables y busqueda local.
- Descargas guiadas con mensajes de error legibles.

## Variables de entorno

Existe `NEXT_PUBLIC_API_URL` para apuntar al backend.

Ejemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

Si no se define, se usa:

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

```bash
npm run dev
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
