import axios from "axios";

import { api } from "@/lib/api";
import type {
  Dictamen,
  DictamenCreateRequestDto,
  DictamenFirmarResponseDto,
  DictamenResponseDto,
  DictamenUpdateRequestDto,
} from "@/types";

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const tipoToDecisionFinal = (tipo?: string | null): Dictamen["decisionFinal"] => {
  const normalized = normalize(tipo);
  if (normalized === "aprobado") return "Aprobado";
  if (normalized === "desaprobado") return "Desaprobado";
  return "Observado";
};

const decisionFinalToTipo = (decisionFinal: Dictamen["decisionFinal"]): string => {
  if (decisionFinal === "Aprobado") return "aprobado";
  if (decisionFinal === "Desaprobado") return "desaprobado";
  return "observado";
};

export const toDomainDictamen = (dto: DictamenResponseDto): Dictamen => ({
  id: String(dto.id),
  expedienteId: String(dto.expediente_id),
  numero: dto.numero_dictamen ?? undefined,
  tipo: dto.tipo_dictamen ?? undefined,
  decisionFinal: tipoToDecisionFinal(dto.tipo_dictamen),
  resumen: dto.contenido,
  firmado: dto.firmado,
  fecha: dto.created_at,
  url: undefined,
});

const resolveErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
  }

  if (error instanceof Error) return error.message;

  return "No se pudo completar la operación de dictamen.";
};

export const dictamenService = {
  async list(skip = 0, limit = 100): Promise<Dictamen[]> {
    try {
      const response = await api.get<DictamenResponseDto[]>("/dictamen/", {
        params: { skip, limit },
      });
      return response.data.map(toDomainDictamen);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async create(payload: {
    expedienteId: string;
    contenido: string;
    decisionFinal: Dictamen["decisionFinal"];
  }): Promise<Dictamen> {
    const expedienteId = Number(payload.expedienteId);
    if (!Number.isFinite(expedienteId)) {
      throw new Error("El identificador del expediente no es válido.");
    }

    const body: DictamenCreateRequestDto = {
      expediente_id: expedienteId,
      contenido: payload.contenido,
    };

    try {
      const response = await api.post<DictamenResponseDto>("/dictamen/", body, {
        params: { tipo_dictamen: decisionFinalToTipo(payload.decisionFinal) },
      });
      return toDomainDictamen(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getById(dictamenId: string): Promise<Dictamen> {
    const id = Number(dictamenId);
    if (!Number.isFinite(id)) {
      throw new Error("El identificador del dictamen no es válido.");
    }

    try {
      const response = await api.get<DictamenResponseDto>(`/dictamen/${id}`);
      return toDomainDictamen(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async update(
    dictamenId: string,
    payload: { contenido?: string; firmado?: boolean },
  ): Promise<Dictamen> {
    const id = Number(dictamenId);
    if (!Number.isFinite(id)) {
      throw new Error("El identificador del dictamen no es válido.");
    }

    const body: DictamenUpdateRequestDto = {
      contenido: payload.contenido ?? null,
      firmado: payload.firmado ?? null,
    };

    try {
      const response = await api.put<DictamenResponseDto>(`/dictamen/${id}`, body);
      return toDomainDictamen(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async listByExpediente(expedienteId: string): Promise<Dictamen[]> {
    const id = Number(expedienteId);
    if (!Number.isFinite(id)) {
      throw new Error("El identificador del expediente no es válido.");
    }

    try {
      const response = await api.get<DictamenResponseDto[]>(`/dictamen/expediente/${id}`);
      return response.data.map(toDomainDictamen);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async firmar(dictamenId: string): Promise<{ message: string; numero?: string }> {
    const id = Number(dictamenId);
    if (!Number.isFinite(id)) {
      throw new Error("El identificador del dictamen no es válido.");
    }

    try {
      const response = await api.post<DictamenFirmarResponseDto>(`/dictamen/${id}/firmar`);
      return {
        message: response.data.message ?? "Dictamen firmado exitosamente.",
        numero: response.data.numero,
      };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },
};
