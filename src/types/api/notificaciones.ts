export interface NotificacionResponseDto {
  id: number;
  titulo: string;
  mensaje: string;
  expediente_id?: number | null;
  usuario_id: number;
  leida: boolean;
  created_at: string;
}

export interface NotificacionCreateRequestDto {
  titulo: string;
  mensaje: string;
  expediente_id?: number | null;
  usuario_id: number;
}

export interface NotificacionUpdateRequestDto {
  leida?: boolean | null;
}

export interface NotificacionSinLeerResponseDto {
  sin_leer: number;
}

export interface NotificacionMessageResponseDto {
  message: string;
}
