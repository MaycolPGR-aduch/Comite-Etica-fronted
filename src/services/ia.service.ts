import axios from "axios";

import { api } from "@/lib/api";
import type {
  IAInconsistencias,
  IAObservacionesSugeridas,
  IAPreanalisis,
  IARiesgos,
  IAResumenExpediente,
  IAResponseDto,
} from "@/types";

const getString = (obj: Record<string, unknown>, key: string): string | undefined => {
  const value = obj[key];
  return typeof value === "string" ? value : undefined;
};

const getNumber = (obj: Record<string, unknown>, key: string): number | undefined => {
  const value = obj[key];
  return typeof value === "number" ? value : undefined;
};

const getStringArray = (obj: Record<string, unknown>, key: string): string[] => {
  const value = obj[key];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

const asRecord = (value: IAResponseDto): Record<string, unknown> =>
  value && typeof value === "object" ? value : {};

const isPlaceholderMessage = (message?: string): boolean =>
  Boolean(message && /requiere integración|pendiente/i.test(message));

const resolveErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;
    if (status === 403) {
      if (typeof detail === "string") return detail;
      return "No tienes permisos para consultar este análisis IA.";
    }
    if (typeof detail === "string") return detail;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo completar la consulta IA.";
};

export const iaService = {
  async getPreanalisis(expedienteId: string): Promise<IAPreanalisis> {
    try {
      const response = await api.get<IAResponseDto>(`/ia/preanalisis/${expedienteId}`);
      const body = asRecord(response.data);
      const message = getString(body, "mensaje");
      const summary = getString(body, "resumen_ia") ?? "Sin resumen IA disponible.";

      return {
        expedienteId:
          String(getNumber(body, "expediente_id") ?? expedienteId),
        titulo: getString(body, "titulo") ?? "Sin título",
        estado: getString(body, "estado") ?? "desconocido",
        resumenIA: summary,
        recomendaciones: getStringArray(body, "recomendaciones"),
        mensaje: message,
        isPlaceholder: isPlaceholderMessage(message) || isPlaceholderMessage(summary),
      };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getInconsistencias(expedienteId: string): Promise<IAInconsistencias> {
    try {
      const response = await api.get<IAResponseDto>(
        `/ia/detectar-inconsistencias/${expedienteId}`,
      );
      const body = asRecord(response.data);
      const message = getString(body, "mensaje");

      return {
        inconsistencias: getStringArray(body, "inconsistencias"),
        mensaje: message,
        isPlaceholder: isPlaceholderMessage(message),
      };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getRiesgos(expedienteId: string): Promise<IARiesgos> {
    try {
      const response = await api.get<IAResponseDto>(`/ia/detectar-riesgos/${expedienteId}`);
      const body = asRecord(response.data);
      const message = getString(body, "mensaje");
      const nivelRiesgo = getString(body, "nivel_riesgo") ?? "desconocido";

      return {
        nivelRiesgo,
        factores: getStringArray(body, "factores"),
        mensaje: message,
        isPlaceholder:
          nivelRiesgo === "pendiente_analisis" || isPlaceholderMessage(message),
      };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getObservacionesSugeridas(expedienteId: string): Promise<IAObservacionesSugeridas> {
    try {
      const response = await api.get<IAResponseDto>(
        `/ia/generar-observaciones/${expedienteId}`,
      );
      const body = asRecord(response.data);
      const message = getString(body, "mensaje");

      return {
        observacionesSugeridas: getStringArray(body, "observaciones_sugeridas"),
        mensaje: message,
        isPlaceholder: isPlaceholderMessage(message),
      };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getResumen(expedienteId: string): Promise<IAResumenExpediente> {
    try {
      const response = await api.get<IAResponseDto>(`/ia/resumen/${expedienteId}`);
      const body = asRecord(response.data);
      const summary = getString(body, "resumen") ?? "Sin resumen IA disponible.";

      return {
        expedienteId: String(getNumber(body, "expediente_id") ?? expedienteId),
        titulo: getString(body, "titulo") ?? "Sin título",
        estado: getString(body, "estado") ?? "desconocido",
        documentosCount: getNumber(body, "documentos_count") ?? 0,
        resumen: summary,
        isPlaceholder: isPlaceholderMessage(summary),
      };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },
};
