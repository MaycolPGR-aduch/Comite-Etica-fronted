<!-- BEGIN:nextjs-agent-rules -->
# AGENTS.md

## Rol del agente

Actúa como desarrollador frontend senior especializado en Next.js, TypeScript, Tailwind CSS y diseño de interfaces administrativas.

Este proyecto corresponde al frontend del Sistema Web para la Gestión y Evaluación de Protocolos del Comité de Ética de una universidad.

El backend será desarrollado por otro equipo usando FastAPI con Python. Por ahora, el frontend debe trabajar con datos mock, pero debe estar preparado para consumir endpoints REST reales posteriormente.

---

## Stack del proyecto

- Next.js con App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Axios
- Lucide React

---

## Reglas generales

1. No conectar directamente con un backend real mientras no existan endpoints confirmados.
2. Usar datos mock en la carpeta `src/mocks`.
3. Toda lógica de acceso a datos debe pasar por la carpeta `src/services`.
4. No hardcodear datos en las páginas.
5. Crear componentes reutilizables y evitar duplicación.
6. Mantener separación clara entre:
   - vistas
   - componentes
   - servicios
   - tipos
   - mocks
   - utilidades
7. Usar TypeScript de forma estricta.
8. No usar `any` salvo que sea estrictamente necesario y esté justificado.
9. Mantener diseño institucional, profesional, limpio y consistente.
10. Priorizar accesibilidad básica: buen contraste, labels, estados visibles y navegación clara.

---

## Estructura esperada

```txt
src/
├── app/
├── components/
│   ├── layout/
│   ├── shared/
│   ├── expedientes/
│   ├── evaluacion/
│   └── ui/
├── lib/
├── services/
├── mocks/
├── types/
└── styles/
<!-- END:nextjs-agent-rules -->
