export interface EvaluacionCreateRequestDto {
  expediente_id: number;
}

export interface EvaluacionAsignarRequestDto {
  evaluador_id: number;
}

export interface CriterioEvaluacionInputDto {
  key: string;
  puntaje: number;
  observacion?: string | null;
}

export interface EvaluacionUpdateRequestDto {
  recommendation?: string | null;
  observaciones?: string | null;
  completa?: boolean | null;
  criterios?: CriterioEvaluacionInputDto[] | null;
}

export interface CriterioEvaluacionResponseDto {
  criterio_key: string;
  puntaje: number;
  observacion?: string | null;
}

export interface EvaluacionResponseDto {
  id: number;
  expediente_id: number;
  evaluador_id: number;
  recommendation?: string | null;
  observaciones: string | null;
  completa: boolean;
  conflicto_interes: boolean;
  titulo_protocolo?: string | null;
  criterios?: CriterioEvaluacionResponseDto[];
  puntaje_total?: number | null;
  resultado?: string | null;
  created_at: string;
}

export interface CriterioRubricaItemDto {
  key: string;
  nombre: string;
  descripcion: string;
  puntaje_max: number;
}

export interface RubricaResponseDto {
  criterios: CriterioRubricaItemDto[];
  puntaje_total_max: number;
  umbrales: Record<string, string>;
}

export interface MessageResponseDto {
  message: string;
}
