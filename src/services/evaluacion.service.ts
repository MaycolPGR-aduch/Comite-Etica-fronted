import axios from "axios";

import { api } from "@/lib/api";
import type {
  Evaluacion,
  EvaluacionCreateRequestDto,
  EvaluacionResponseDto,
  EvaluacionUpdateRequestDto,
  Expediente,
  ExpedienteResponseDto,
  MessageResponseDto,
  Recommendation,
  RiskLevel,
} from "@/types";

export interface EvaluacionPayload {
  evaluacionId: string;
  riesgo: RiskLevel;
  recomendacion: Recommendation;
  secciones: Array<{ seccion: string; observacion: string }>;
  enviar: boolean;
}

export interface EvaluacionBandejaItem {
  id: string;
  expedienteId: string;
  evaluadorId: string;
  nivelRiesgo: RiskLevel | null;
  recommendation: Recommendation | null;
  observaciones: string | null;
  completa: boolean;
  conflictoInteres: boolean;
  createdAt: string;
  estado: "Completada" | "En progreso" | "Conflicto de interes";
}

export interface EvaluacionContextoResponse {
  evaluacion: EvaluacionBandejaItem;
  evaluacionActual: Evaluacion;
  expediente: Expediente;
}

const FALLBACK_DOCUMENTS = [
  "Protocolo de investigacion",
  "Consentimiento informado",
  "Carta de presentacion",
  "Instrumentos de recoleccion",
];

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const riskMap: Record<string, RiskLevel> = {
  bajo: "Bajo",
  medio: "Medio",
  alto: "Alto",
};

const recommendationMap: Record<string, Recommendation> = {
  aprobar: "Aprobar",
  aprobar_con_observaciones: "Aprobar con observaciones",
  solicitar_subsanacion: "Solicitar subsanación",
  desaprobar: "Desaprobar",
};

const recommendationToApiMap: Record<Recommendation, string> = {
  Aprobar: "aprobar",
  "Aprobar con observaciones": "aprobar_con_observaciones",
  "Solicitar subsanación": "solicitar_subsanacion",
  Desaprobar: "desaprobar",
};

const riskToApiMap: Record<RiskLevel, string> = {
  Bajo: "bajo",
  Medio: "medio",
  Alto: "alto",
};

const toRiskLevel = (value?: string | null): RiskLevel | null =>
  riskMap[normalize(value)] ?? null;

const toRecommendation = (value?: string | null): Recommendation | null =>
  recommendationMap[normalize(value)] ?? null;

const resolveEstado = (
  completa: boolean,
  conflictoInteres: boolean,
): EvaluacionBandejaItem["estado"] => {
  if (conflictoInteres) return "Conflicto de interes";
  return completa ? "Completada" : "En progreso";
};

const parseSecciones = (observaciones?: string | null) => {
  if (!observaciones) return [];

  return observaciones
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) {
        return { seccion: `Seccion ${index + 1}`, observacion: line };
      }

      return {
        seccion: line.slice(0, separatorIndex).trim(),
        observacion: line.slice(separatorIndex + 1).trim(),
      };
    });
};

const serializeSecciones = (
  secciones: Array<{ seccion: string; observacion: string }>,
): string | null => {
  const content = secciones
    .map((item) => ({
      seccion: item.seccion.trim(),
      observacion: item.observacion.trim(),
    }))
    .filter((item) => item.observacion.length > 0)
    .map((item) => `${item.seccion}: ${item.observacion}`);

  return content.length > 0 ? content.join("\n") : null;
};

const toBandejaItem = (dto: EvaluacionResponseDto): EvaluacionBandejaItem => ({
  id: String(dto.id),
  expedienteId: String(dto.expediente_id),
  evaluadorId: String(dto.evaluador_id),
  nivelRiesgo: toRiskLevel(dto.nivel_riesgo),
  recommendation: toRecommendation(dto.recommendation),
  observaciones: dto.observaciones,
  completa: dto.completa,
  conflictoInteres: dto.conflicto_interes,
  createdAt: dto.created_at,
  estado: resolveEstado(dto.completa, dto.conflicto_interes),
});

const toDomainEvaluacion = (dto: EvaluacionResponseDto): Evaluacion => ({
  id: String(dto.id),
  expedienteId: String(dto.expediente_id),
  evaluadorId: String(dto.evaluador_id),
  riesgo: toRiskLevel(dto.nivel_riesgo) ?? "Medio",
  recomendacion: toRecommendation(dto.recommendation) ?? "Aprobar con observaciones",
  secciones: parseSecciones(dto.observaciones),
  estado: dto.completa ? "Enviada" : "Borrador",
  updatedAt: dto.created_at,
});

const toDomainExpediente = (dto: ExpedienteResponseDto): Expediente => ({
  id: String(dto.id),
  codigo: dto.codigo_unico ?? `EXP-${dto.id}`,
  titulo: dto.titulo_protocolo,
  investigadorPrincipal: `Investigador #${dto.investigador_id}`,
  tipoTramite: "No especificado",
  facultad: "No especificada",
  fechaRegistro: dto.created_at,
  fechaLimite: undefined,
  prioridad: "Media",
  estado: "En evaluación",
  documentos: FALLBACK_DOCUMENTS.map((nombre, index) => ({
    id: `doc-eval-${dto.id}-${index + 1}`,
    nombre,
    tipo: "Requerido",
    requerido: true,
    cargado: false,
  })),
  observacionesPendientes: 0,
  evaluadoresAsignados: [],
});

const resolveErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo completar la operacion de evaluacion.";
};

export const evaluacionService = {
  async list(skip = 0, limit = 100): Promise<EvaluacionBandejaItem[]> {
    try {
      const response = await api.get<EvaluacionResponseDto[]>("/evaluacion/", {
        params: { skip, limit },
      });

      return response.data.map(toBandejaItem);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async listMisEvaluaciones(): Promise<EvaluacionBandejaItem[]> {
    try {
      const response = await api.get<EvaluacionResponseDto[]>("/evaluacion/mis-evaluaciones");
      return response.data.map(toBandejaItem);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async create(expedienteId: string): Promise<EvaluacionBandejaItem> {
    const parsed = Number(expedienteId);
    if (!Number.isFinite(parsed)) {
      throw new Error("El identificador del expediente no es valido.");
    }

    const payload: EvaluacionCreateRequestDto = { expediente_id: parsed };

    try {
      const response = await api.post<EvaluacionResponseDto>("/evaluacion/", payload);
      return toBandejaItem(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getById(evaluacionId: string): Promise<EvaluacionBandejaItem> {
    const parsed = Number(evaluacionId);
    if (!Number.isFinite(parsed)) {
      throw new Error("El identificador de la evaluacion no es valido.");
    }

    try {
      const response = await api.get<EvaluacionResponseDto>(`/evaluacion/${parsed}`);
      return toBandejaItem(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async update(
    evaluacionId: string,
    payload: EvaluacionUpdateRequestDto,
  ): Promise<EvaluacionBandejaItem> {
    const parsed = Number(evaluacionId);
    if (!Number.isFinite(parsed)) {
      throw new Error("El identificador de la evaluacion no es valido.");
    }

    try {
      const response = await api.put<EvaluacionResponseDto>(`/evaluacion/${parsed}`, payload);
      return toBandejaItem(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async declararConflicto(evaluacionId: string): Promise<MessageResponseDto> {
    const parsed = Number(evaluacionId);
    if (!Number.isFinite(parsed)) {
      throw new Error("El identificador de la evaluacion no es valido.");
    }

    try {
      const response = await api.post<MessageResponseDto>(`/evaluacion/${parsed}/conflicto`);
      return response.data;
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async guardarParcial(
    evaluacionId: string,
    payload: EvaluacionUpdateRequestDto,
  ): Promise<MessageResponseDto> {
    const parsed = Number(evaluacionId);
    if (!Number.isFinite(parsed)) {
      throw new Error("El identificador de la evaluacion no es valido.");
    }

    try {
      const response = await api.post<MessageResponseDto>(
        `/evaluacion/${parsed}/guardar-parcial`,
        payload,
      );
      return response.data;
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getContextoEvaluacion(evaluacionId: string): Promise<EvaluacionContextoResponse> {
    const parsed = Number(evaluacionId);
    if (!Number.isFinite(parsed)) {
      throw new Error("El identificador de la evaluacion no es valido.");
    }

    try {
      const evaluacionResponse = await api.get<EvaluacionResponseDto>(`/evaluacion/${parsed}`);
      const evaluacionDto = evaluacionResponse.data;

      const expedienteResponse = await api.get<ExpedienteResponseDto>(
        `/expedientes/${evaluacionDto.expediente_id}`,
      );

      return {
        evaluacion: toBandejaItem(evaluacionDto),
        evaluacionActual: toDomainEvaluacion(evaluacionDto),
        expediente: toDomainExpediente(expedienteResponse.data),
      };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async saveEvaluacion(
    payload: EvaluacionPayload,
  ): Promise<{ estado: "Borrador" | "Enviada"; message: string }> {
    const requestPayload: EvaluacionUpdateRequestDto = {
      nivel_riesgo: riskToApiMap[payload.riesgo],
      recommendation: recommendationToApiMap[payload.recomendacion],
      observaciones: serializeSecciones(payload.secciones),
      completa: payload.enviar,
    };

    if (payload.enviar) {
      await this.update(payload.evaluacionId, requestPayload);
      return { estado: "Enviada", message: "Evaluacion enviada correctamente." };
    }

    const partialResponse = await this.guardarParcial(payload.evaluacionId, requestPayload);

    return {
      estado: "Borrador",
      message: partialResponse.message || "Guardado parcial exitoso.",
    };
  },
};
