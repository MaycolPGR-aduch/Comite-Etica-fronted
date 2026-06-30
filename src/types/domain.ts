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
  "Aprobado con observaciones",
  "Desaprobado",
  "Cerrado",
] as const;

export type ExpedienteStatus = (typeof EXPEDIENTE_STATUSES)[number];

export type Priority = "Alta" | "Media" | "Baja";

export type RiskLevel = "Bajo" | "Medio" | "Alto";

export type Recommendation =
  | "Aprobar"
  | "Aprobar con observaciones"
  | "Solicitar subsanación";

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  role: Role;
  activo?: boolean;
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

export interface EvaluacionConsolidacion extends Evaluacion {
  completa: boolean;
  conflictoInteres: boolean;
}

export interface Dictamen {
  id?: string;
  expedienteId: string;
  numero?: string;
  tipo?: string;
  decisionFinal: "Aprobado" | "Observado";
  resumen: string;
  firmado?: boolean;
  fecha: string;
  fechaEmision?: string;
  fechaFirma?: string;
  archivoUrl?: string;
  url?: string;
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
  password: string;
}

export interface LoginResult {
  usuario: Usuario;
  redirectTo: string;
}

export interface RegisterPayload {
  nombres: string;
  apellidos: string;
  correo: string;
  rol: Role;
  password: string;
  especialidad?: string;
  carga_trabajo?: number;
  conflicto_interes?: boolean;
}

export interface ConfiguracionCatalogos {
  tiposTramite: string[];
  documentosRequeridos: string[];
  estados: ExpedienteStatus[];
  plantillasNotificacion: string[];
}

export interface ConsolidacionResultado {
  expediente: Expediente;
  evaluaciones: EvaluacionConsolidacion[];
  evaluacion1?: EvaluacionConsolidacion;
  evaluacion2?: EvaluacionConsolidacion;
  puedeGenerarDictamen: boolean;
  mensajeValidacion?: string;
  coincidencias: string[];
  discrepancias: string[];
  dictamen?: Dictamen;
}

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  expedienteId?: string;
  usuarioId: string;
  leida: boolean;
  createdAt: string;
}

export interface NotificacionCreatePayload {
  titulo: string;
  mensaje: string;
  usuarioId: string;
  expedienteId?: string;
}

export interface NotificacionSinLeer {
  sinLeer: number;
}

export interface IAPreanalisis {
  expedienteId: string;
  titulo: string;
  estado: string;
  resumenIA: string;
  recomendaciones: string[];
  isPlaceholder: boolean;
  mensaje?: string;
}

export interface IAInconsistencias {
  inconsistencias: string[];
  mensaje?: string;
  isPlaceholder: boolean;
}

export interface IARiesgos {
  nivelRiesgo: string;
  factores: string[];
  mensaje?: string;
  isPlaceholder: boolean;
}

export interface IAObservacionesSugeridas {
  observacionesSugeridas: string[];
  mensaje?: string;
  isPlaceholder: boolean;
}

export interface IAResumenExpediente {
  expedienteId: string;
  titulo: string;
  estado: string;
  documentosCount: number;
  resumen: string;
  isPlaceholder: boolean;
}

export interface ReporteExpedientesPorEstado {
  estado: string;
  total: number;
}

export interface ReporteTiempoAtencion {
  expedienteId: string;
  codigo: string;
  dias: number;
  estado: string;
}

export interface ReporteCargaEvaluador {
  evaluadorId: string;
  nombre?: string;
  total: number;
}

export interface ReporteResultadoEmitido {
  decision: string;
  total: number;
}

export interface ReporteBusquedaExpediente {
  id: string;
  codigoUnico: string;
  tituloProtocolo: string;
  investigadorId: string;
  tipoTramite: string;
  facultad: string;
  prioridad: string;
  estado: string;
  fechaEnvio?: string;
  fechaCreacion?: string;
}

export interface ReporteExportResult {
  mensaje: string;
  formato?: string;
}
