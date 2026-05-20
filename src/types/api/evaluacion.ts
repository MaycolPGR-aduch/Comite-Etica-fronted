export interface EvaluacionCreateRequestDto {
  expediente_id: number;
}

export interface EvaluacionAsignarRequestDto {
  evaluador_id: number;
}

export interface EvaluacionUpdateRequestDto {
  nivel_riesgo?: string | null;
  recommendation?: string | null;
  observaciones?: string | null;
  completa?: boolean | null;
}

export interface EvaluacionResponseDto {
  id: number;
  expediente_id: number;
  evaluador_id: number;
  nivel_riesgo: string | null;
  recommendation?: string | null;
  observaciones: string | null;
  completa: boolean;
  conflicto_interes: boolean;
  titulo_protocolo?: string | null;
  created_at: string;
}

export interface MessageResponseDto {
  message: string;
}
