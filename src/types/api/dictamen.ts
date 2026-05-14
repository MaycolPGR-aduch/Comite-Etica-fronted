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
  created_at: string;
}

export interface DictamenFirmarResponseDto {
  message?: string;
  numero?: string;
}
