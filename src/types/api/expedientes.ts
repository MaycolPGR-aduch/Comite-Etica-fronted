export interface ExpedienteResponseDto {
  id: number;
  titulo_protocolo: string;
  tipo_tramite: string | null;
  facultad: string | null;
  prioridad: string;
  codigo_unico: string | null;
  investigador_id: number;
  estado: string;
  fecha_envio: string | null;
  created_at: string;
}

export interface ExpedienteCreateRequestDto {
  titulo_protocolo: string;
  tipo_tramite?: string | null;
  facultad?: string | null;
  prioridad?: string | null;
}

export interface ExpedienteUpdateRequestDto {
  titulo_protocolo?: string | null;
  estado?: string | null;
}

export interface ExpedienteEnviarResponseDto {
  message: string;
  codigo: string;
}

export interface BitacoraEventoDto {
  id: number;
  accion: string;
  detalle: string;
  created_at: string;
}

export interface HistorialEstadoDto {
  id: number;
  expediente_id: number;
  estado_anterior: string | null;
  estado_nuevo: string;
  observaciones: string | null;
  created_at: string;
}

export interface DocumentoResponseDto {
  id: number;
  expediente_id: number;
  nombre_archivo: string;
  tipo_documento: string;
  es_obligatorio: boolean;
  validado: boolean;
  version: number;
  ruta_archivo?: string | null;
  created_at: string;
}

export interface ExpedienteSubsanacionResponseDto {
  mensaje: string;
  expediente_id: number;
  estado: string;
  fecha_subsanacion: string;
}
