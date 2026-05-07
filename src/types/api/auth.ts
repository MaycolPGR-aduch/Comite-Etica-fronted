export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponseDto {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: string;
  activo?: boolean;
  especialidad?: string | null;
  carga_trabajo?: number | null;
  conflicto_interes?: boolean;
  created_at: string;
}
