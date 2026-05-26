export interface DictamenCreateRequestDto {
  contenido: string;
  expediente_id: number;
}

export interface DictamenUpdateRequestDto {
  contenido?: string | null;
  firmado?: boolean | null;
}

export interface DictamenResponseDto {
  id: number;
  expediente_id: number;
  numero_dictamen: string | null;
  tipo_dictamen: string | null;
  contenido: string;
  firmado: boolean;
  fecha_emision?: string | null;
  fecha_firma?: string | null;
  archivo_url?: string | null;
  created_at: string;
}

export interface DictamenFirmarResponseDto {
  message?: string;
  numero?: string;
}
