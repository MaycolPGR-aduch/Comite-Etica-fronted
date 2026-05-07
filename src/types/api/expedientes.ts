export interface ExpedienteResponseDto {
  id: number;
  titulo_protocolo: string;
  codigo_unico: string | null;
  investigador_id: number;
  estado: string;
  fecha_envio: string | null;
  created_at: string;
}

export interface ExpedienteCreateRequestDto {
  titulo_protocolo: string;
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
  created_at: string;
}
