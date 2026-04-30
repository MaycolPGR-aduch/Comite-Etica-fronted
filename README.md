# Comité de Ética Frontend

Frontend del Sistema Web para la Gestión y Evaluación de Protocolos del Comité de Ética de una universidad.

## Estado del proyecto
Versión inicial navegable completada con datos mock y arquitectura preparada para reemplazar la capa mock por API REST (FastAPI) sin rehacer la UI.

## Stack
- Next.js 16 (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- React Hook Form + Zod
- TanStack Query
- Axios
- Lucide React

## Objetivo funcional
Cubrir el flujo completo del expediente ético:
1. Registro del expediente
2. Revisión administrativa
3. Asignación de evaluadores
4. Evaluación ética
5. Consolidación y dictamen
6. Subsanación y reenvío

## Roles implementados
- Investigador
- Secretaría técnica
- Coordinador
- Evaluador
- Administrador

## Rutas principales
### Públicas (sin autenticación)
- `/login`
- `/crear-usuario`
- `/crear-usuario/exito`
- `/recuperar-contrasena`
- `/recuperar-contrasena/verificacion`
- `/recuperar-contrasena/nueva-clave`
- `/recuperar-contrasena/completado`
- `/acerca-comite-etica`

### Privadas mock por rol (navegación por interfaz)
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
- Admin:
  - `/admin/configuracion`

## Avance implementado
- Layout institucional responsive con sidebar/header por rol.
- Login mock con selector de rol y redirección.
- Flujo visual de crear usuario y recuperación de contraseña.
- Portal informativo público (`acerca-comite-etica`) con objetivo, funciones y FAQ.
- Wizard de nuevo expediente (4 pasos).
- Tabla de expedientes con filtros por estado.
- Detalle de expediente con timeline, documentos y observaciones.
- Revisión administrativa con acciones admitir/devolver.
- Asignación manual de exactamente 2 evaluadores (validaciones mock).
- Evaluación ética en dos columnas + panel IA no vinculante (mock).
- Consolidación comparativa de evaluadores + generación de dictamen mock.
- Configuración básica (tipos, documentos, estados, plantillas).

## Estructura del código
```txt
src/
├── app/
├── components/
│   ├── layout/
│   ├── shared/
│   ├── ui/
├── hooks/
├── lib/
├── mocks/
├── services/
├── types/
└── styles/
```

## Arquitectura de datos (mock-first)
- `src/types`: contratos de dominio (roles, estados, expediente, evaluación, dictamen, etc.).
- `src/mocks`: dataset temporal centralizado.
- `src/services`: capa de acceso a datos (hoy mock; mañana REST).
- `src/hooks`: wrappers React Query para desacoplar vistas de la fuente de datos.

## Ejecutar localmente
### Requisitos
- Node.js 20+
- npm 10+

### Instalación
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

### Build producción
```bash
npm run build
npm start
```

## Despliegue
### Opción 1: Vercel (recomendada)
1. Conecta el repositorio en Vercel.
2. Framework detectado: Next.js.
3. Build command: `npm run build`.
4. Output: automático de Next.js.
5. Deploy.

### Opción 2: servidor Node
1. `npm ci`
2. `npm run build`
3. `npm run start`
4. Exponer puerto 3000 detrás de proxy (Nginx/Caddy).

## Variables de entorno
Existe `src/lib/api.ts` con `NEXT_PUBLIC_API_URL` para futura integración backend.

Ejemplo:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Próxima fase (integración FastAPI)
1. Mantener contratos de `src/types`.
2. Reemplazar implementaciones internas en `src/services` por Axios REST.
3. Conservar `hooks` y páginas sin cambios mayores.
4. Agregar manejo estandarizado de errores HTTP y permisos.

## Notas
- Esta versión no implementa autenticación real.
- Persistencia actual: mock (no base de datos real).
- Se priorizó mantenibilidad y desacoplamiento para migración rápida a backend.
