export type Role =
  | "investigador"
  | "secretaria"
  | "coordinador"
  | "evaluador"
  | "administrador";

export const EXPEDIENTE_STATUSES = [
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
] as const;

export type ExpedienteStatus = (typeof EXPEDIENTE_STATUSES)[number];

export type Priority = "Alta" | "Media" | "Baja";

export type RiskLevel = "Bajo" | "Medio" | "Alto";

export type Recommendation =
  | "Aprobar"
  | "Aprobar con observaciones"
  | "Solicitar subsanación"
  | "Desaprobar";

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  role: Role;
  especialidad?: string;
  cargaTrabajo?: number;
  conflictoInteres?: boolean;
}

export interface Documento {
  id: string;
  nombre: string;
  tipo: string;
  requerido: boolean;
  cargado: boolean;
  version?: number;
  updatedAt?: string;
  url?: string;
}

export interface Observacion {
  id: string;
  expedienteId: string;
  origen: "Administrativa" | "Ética";
  seccion: string;
  comentario: string;
  estado: "Pendiente" | "Respondida";
  respuesta?: string;
  createdAt: string;
}

export interface HistorialEvento {
  id: string;
  expedienteId: string;
  titulo: string;
  descripcion: string;
  actor: string;
  fecha: string;
}

export interface EvaluacionSeccion {
  seccion: string;
  observacion: string;
}

export interface Evaluacion {
  id: string;
  expedienteId: string;
  evaluadorId: string;
  riesgo: RiskLevel;
  recomendacion: Recommendation;
  secciones: EvaluacionSeccion[];
  estado: "Borrador" | "Enviada";
  updatedAt: string;
}

export interface Dictamen {
  expedienteId: string;
  decisionFinal: "Aprobado" | "Desaprobado" | "Observado";
  resumen: string;
  fecha: string;
  url: string;
}

export interface Expediente {
  id: string;
  codigo: string;
  titulo: string;
  investigadorPrincipal: string;
  tipoTramite: string;
  facultad: string;
  fechaRegistro: string;
  fechaLimite?: string;
  prioridad: Priority;
  estado: ExpedienteStatus;
  riesgo?: RiskLevel;
  documentos: Documento[];
  observacionesPendientes: number;
  evaluadoresAsignados: string[];
}

export interface Metrica {
  id: string;
  titulo: string;
  valor: number;
  variacion?: string;
  descripcion?: string;
}

export interface LoginPayload {
  correo: string;
  role: Role;
}

export interface LoginResult {
  usuario: Usuario;
  redirectTo: string;
}

export interface ConfiguracionCatalogos {
  tiposTramite: string[];
  documentosRequeridos: string[];
  estados: ExpedienteStatus[];
  plantillasNotificacion: string[];
}

export interface ConsolidacionResultado {
  expediente: Expediente;
  evaluacion1: Evaluacion;
  evaluacion2: Evaluacion;
  coincidencias: string[];
  discrepancias: string[];
  dictamen?: Dictamen;
}
