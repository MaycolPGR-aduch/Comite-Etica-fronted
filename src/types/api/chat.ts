export interface MensajeChatCreateRequestDto {
  texto: string;
}

export interface MensajeChatResponseDto {
  id: number;
  solicitante_id: number;
  autor_id: number;
  texto: string;
  leido: boolean;
  es_de_secretaria: boolean;
  created_at: string;
}

export interface ConversacionResumenDto {
  solicitante_id: number;
  nombre: string;
  rol: string;
  email: string;
  codigo_estudiante?: string | null;
  ultimo_mensaje: string;
  ultima_fecha: string;
  no_leidos: number;
}

export interface SolicitanteChatItemDto {
  id: number;
  nombre: string;
  rol: string;
  email: string;
  codigo_estudiante?: string | null;
}

export interface ChatNoLeidosDto {
  no_leidos: number;
}
