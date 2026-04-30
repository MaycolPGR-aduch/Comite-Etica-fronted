import type {
  ConfiguracionCatalogos,
  Dictamen,
  Evaluacion,
  Expediente,
  ExpedienteStatus,
  HistorialEvento,
  Metrica,
  Observacion,
  Role,
  Usuario,
} from "@/types";

const now = new Date();
const day = 24 * 60 * 60 * 1000;

const isoDaysAgo = (days: number) => new Date(now.getTime() - days * day).toISOString();
const isoDaysAhead = (days: number) => new Date(now.getTime() + days * day).toISOString();

const baseDocs = [
  "Protocolo de investigacion",
  "Consentimiento informado",
  "Carta de presentacion",
  "Instrumentos de recoleccion",
] as const;

const makeDocuments = (uploadedCount: number) =>
  baseDocs.map((nombre, index) => ({
    id: `${nombre}-${index + 1}`,
    nombre,
    tipo: index === 0 ? "Principal" : "Anexo",
    requerido: true,
    cargado: index < uploadedCount,
    version: index < uploadedCount ? 1 : undefined,
    updatedAt: index < uploadedCount ? isoDaysAgo(index + 1) : undefined,
    url: index < uploadedCount ? `/mock/${index + 1}` : undefined,
  }));

export const usuariosMock: Usuario[] = [
  { id: "u1", nombre: "Ana Lopez", correo: "investigador@demo.edu", role: "investigador" },
  { id: "u2", nombre: "Luis Ramos", correo: "secretaria@demo.edu", role: "secretaria" },
  { id: "u3", nombre: "Carmen Diaz", correo: "coordinador@demo.edu", role: "coordinador" },
  {
    id: "u4",
    nombre: "Jorge Perez",
    correo: "evaluador1@demo.edu",
    role: "evaluador",
    especialidad: "Bioetica",
    cargaTrabajo: 4,
    conflictoInteres: false,
  },
  {
    id: "u5",
    nombre: "Marta Salinas",
    correo: "evaluador2@demo.edu",
    role: "evaluador",
    especialidad: "Salud publica",
    cargaTrabajo: 6,
    conflictoInteres: false,
  },
  {
    id: "u6",
    nombre: "Diego Herrera",
    correo: "evaluador3@demo.edu",
    role: "evaluador",
    especialidad: "Psicologia",
    cargaTrabajo: 2,
    conflictoInteres: true,
  },
  { id: "u7", nombre: "Admin Sistema", correo: "admin@demo.edu", role: "administrador" },
];

const statuses: ExpedienteStatus[] = [
  "Borrador",
  "Enviado",
  "En revisión administrativa",
  "Observado por admisibilidad",
  "Subsanado",
  "Admitido",
  "Asignado",
  "En evaluación",
  "Evaluaciones completas",
  "En deliberación",
  "Observado",
  "Aprobado",
  "Desaprobado",
  "Cerrado",
];

export const expedientesMock: Expediente[] = [
  {
    id: "exp-001",
    codigo: "CE-2026-001",
    titulo: "Efectos del sueno en rendimiento academico",
    investigadorPrincipal: "Ana Lopez",
    tipoTramite: "Nuevo protocolo",
    facultad: "Medicina",
    fechaRegistro: isoDaysAgo(12),
    fechaLimite: isoDaysAhead(8),
    prioridad: "Alta",
    estado: "En evaluación",
    riesgo: "Medio",
    documentos: makeDocuments(4),
    observacionesPendientes: 1,
    evaluadoresAsignados: ["u4", "u5"],
  },
  {
    id: "exp-002",
    codigo: "CE-2026-002",
    titulo: "Estudio de adherencia terapeutica",
    investigadorPrincipal: "Ana Lopez",
    tipoTramite: "Modificacion",
    facultad: "Farmacia",
    fechaRegistro: isoDaysAgo(20),
    fechaLimite: isoDaysAhead(3),
    prioridad: "Media",
    estado: "Observado",
    riesgo: "Alto",
    documentos: makeDocuments(4),
    observacionesPendientes: 3,
    evaluadoresAsignados: ["u4", "u6"],
  },
  {
    id: "exp-003",
    codigo: "CE-2026-003",
    titulo: "Intervencion nutricional en adolescentes",
    investigadorPrincipal: "Ana Lopez",
    tipoTramite: "Renovacion",
    facultad: "Nutricion",
    fechaRegistro: isoDaysAgo(4),
    fechaLimite: isoDaysAhead(15),
    prioridad: "Baja",
    estado: "En revisión administrativa",
    documentos: makeDocuments(3),
    observacionesPendientes: 0,
    evaluadoresAsignados: [],
  },
  {
    id: "exp-004",
    codigo: "CE-2026-004",
    titulo: "Ensayo de bienestar emocional docente",
    investigadorPrincipal: "Ana Lopez",
    tipoTramite: "Nuevo protocolo",
    facultad: "Psicologia",
    fechaRegistro: isoDaysAgo(35),
    fechaLimite: isoDaysAgo(2),
    prioridad: "Alta",
    estado: "Admitido",
    documentos: makeDocuments(4),
    observacionesPendientes: 0,
    evaluadoresAsignados: [],
  },
  {
    id: "exp-005",
    codigo: "CE-2026-005",
    titulo: "Validacion de escala de ansiedad",
    investigadorPrincipal: "Ana Lopez",
    tipoTramite: "Nuevo protocolo",
    facultad: "Psicologia",
    fechaRegistro: isoDaysAgo(45),
    fechaLimite: isoDaysAgo(10),
    prioridad: "Media",
    estado: "Aprobado",
    riesgo: "Bajo",
    documentos: makeDocuments(4),
    observacionesPendientes: 0,
    evaluadoresAsignados: ["u4", "u5"],
  },
  {
    id: "exp-006",
    codigo: "CE-2026-006",
    titulo: "Seguimiento de pacientes cronicos",
    investigadorPrincipal: "Ana Lopez",
    tipoTramite: "Renovacion",
    facultad: "Enfermeria",
    fechaRegistro: isoDaysAgo(5),
    fechaLimite: isoDaysAhead(20),
    prioridad: "Media",
    estado: "Borrador",
    documentos: makeDocuments(1),
    observacionesPendientes: 0,
    evaluadoresAsignados: [],
  },
  {
    id: "exp-007",
    codigo: "CE-2026-007",
    titulo: "Uso de IA en diagnostico temprano",
    investigadorPrincipal: "Ana Lopez",
    tipoTramite: "Nuevo protocolo",
    facultad: "Ingenieria",
    fechaRegistro: isoDaysAgo(18),
    fechaLimite: isoDaysAhead(5),
    prioridad: "Alta",
    estado: "Evaluaciones completas",
    documentos: makeDocuments(4),
    observacionesPendientes: 0,
    evaluadoresAsignados: ["u4", "u5"],
  },
  {
    id: "exp-008",
    codigo: "CE-2026-008",
    titulo: "Estudio sobre burnout estudiantil",
    investigadorPrincipal: "Ana Lopez",
    tipoTramite: "Modificacion",
    facultad: "Educacion",
    fechaRegistro: isoDaysAgo(9),
    fechaLimite: isoDaysAhead(11),
    prioridad: "Baja",
    estado: "Asignado",
    documentos: makeDocuments(4),
    observacionesPendientes: 0,
    evaluadoresAsignados: ["u5", "u6"],
  },
];

export const observacionesMock: Observacion[] = [
  {
    id: "obs-001",
    expedienteId: "exp-002",
    origen: "Ética",
    seccion: "Riesgo y mitigacion",
    comentario: "Detallar procedimiento ante eventos adversos.",
    estado: "Pendiente",
    createdAt: isoDaysAgo(2),
  },
  {
    id: "obs-002",
    expedienteId: "exp-002",
    origen: "Ética",
    seccion: "Consentimiento informado",
    comentario: "Incluir version para participantes menores de edad.",
    estado: "Pendiente",
    createdAt: isoDaysAgo(2),
  },
  {
    id: "obs-003",
    expedienteId: "exp-003",
    origen: "Administrativa",
    seccion: "Anexos",
    comentario: "Falta firma de responsable de laboratorio.",
    estado: "Pendiente",
    createdAt: isoDaysAgo(1),
  },
];

export const historialMock: HistorialEvento[] = [
  {
    id: "h-1",
    expedienteId: "exp-001",
    titulo: "Expediente asignado",
    descripcion: "Se asignaron dos evaluadores.",
    actor: "Coordinacion",
    fecha: isoDaysAgo(6),
  },
  {
    id: "h-2",
    expedienteId: "exp-001",
    titulo: "Evaluación en progreso",
    descripcion: "Evaluador 1 guardo avance.",
    actor: "Evaluador 1",
    fecha: isoDaysAgo(1),
  },
  {
    id: "h-3",
    expedienteId: "exp-002",
    titulo: "Observado por comite",
    descripcion: "Se solicitan ajustes metodologicos.",
    actor: "Comite",
    fecha: isoDaysAgo(2),
  },
  {
    id: "h-4",
    expedienteId: "exp-003",
    titulo: "Revision administrativa",
    descripcion: "Expediente en validacion documental.",
    actor: "Secretaria tecnica",
    fecha: isoDaysAgo(1),
  },
];

export const evaluacionesMock: Evaluacion[] = [
  {
    id: "ev-1",
    expedienteId: "exp-007",
    evaluadorId: "u4",
    riesgo: "Medio",
    recomendacion: "Aprobar con observaciones",
    secciones: [
      { seccion: "Metodologia", observacion: "Ajustar tamano muestral" },
      { seccion: "Consentimiento", observacion: "Adecuado" },
    ],
    estado: "Enviada",
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "ev-2",
    expedienteId: "exp-007",
    evaluadorId: "u5",
    riesgo: "Bajo",
    recomendacion: "Aprobar",
    secciones: [
      { seccion: "Metodologia", observacion: "Adecuado" },
      { seccion: "Consentimiento", observacion: "Agregar lenguaje simple" },
    ],
    estado: "Enviada",
    updatedAt: isoDaysAgo(1),
  },
  {
    id: "ev-3",
    expedienteId: "exp-001",
    evaluadorId: "u4",
    riesgo: "Medio",
    recomendacion: "Solicitar subsanación",
    secciones: [{ seccion: "Riesgos", observacion: "Mayor detalle en mitigacion" }],
    estado: "Borrador",
    updatedAt: isoDaysAgo(0),
  },
];

export const dictamenesMock: Dictamen[] = [
  {
    expedienteId: "exp-005",
    decisionFinal: "Aprobado",
    resumen: "Protocolo aprobado sin observaciones mayores.",
    fecha: isoDaysAgo(10),
    url: "/mock/dictamen-exp-005.pdf",
  },
];

export const metricasInvestigadorMock: Metrica[] = [
  { id: "m1", titulo: "Expedientes activos", valor: 5, variacion: "+1 este mes" },
  { id: "m2", titulo: "Observaciones pendientes", valor: 4, variacion: "-2 esta semana" },
  { id: "m3", titulo: "Dictamenes disponibles", valor: 2, variacion: "+1" },
  { id: "m4", titulo: "Aprobados", valor: 1, variacion: "20% tasa" },
];

export const metricasSecretariaMock: Metrica[] = [
  { id: "s1", titulo: "Nuevos", valor: 3 },
  { id: "s2", titulo: "Observados", valor: 2 },
  { id: "s3", titulo: "Admitidos", valor: 4 },
  { id: "s4", titulo: "Vencidos", valor: 1 },
];

export const metricasCoordinadorMock: Metrica[] = [
  { id: "c1", titulo: "Admitidos", valor: 4 },
  { id: "c2", titulo: "Pendientes asignacion", valor: 2 },
  { id: "c3", titulo: "En evaluación", valor: 3 },
  { id: "c4", titulo: "Con discrepancias", valor: 1 },
  { id: "c5", titulo: "Proximos a vencer", valor: 2 },
];

export const configuracionMock: ConfiguracionCatalogos = {
  tiposTramite: ["Nuevo protocolo", "Modificacion", "Renovacion"],
  documentosRequeridos: [...baseDocs],
  estados: statuses,
  plantillasNotificacion: [
    "Recepcion de expediente",
    "Observaciones administrativas",
    "Asignacion de evaluadores",
    "Comunicacion de dictamen",
  ],
};

export const redirectByRole: Record<Role, string> = {
  investigador: "/investigador/dashboard",
  secretaria: "/secretaria/bandeja",
  coordinador: "/coordinador/dashboard",
  evaluador: "/evaluador/bandeja",
  administrador: "/admin/configuracion",
};
