import axios from "axios";

import { api } from "@/lib/api";
import type {
  Dictamen,
  DictamenCreateRequestDto,
  DictamenResponseDto,
  DictamenUpdateRequestDto,
} from "@/types";

export interface DictamenArchivoResponse {
  blob: Blob;
  fileName: string;
  mimeType: string;
}

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const tipoToDecisionFinal = (tipo?: string | null): Dictamen["decisionFinal"] => {
  const normalized = normalize(tipo);
  if (normalized === "aprobado") return "Aprobado";
  return "Observado";
};

const decisionFinalToTipo = (decisionFinal: Dictamen["decisionFinal"]): string => {
  if (decisionFinal === "Aprobado") return "aprobado";
  return "observado";
};

const API_BASE_URL = api.defaults.baseURL ?? "https://comite-backend.onrender.com/api/v1";
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "https://comite-backend.onrender.com";
  }
})();

const resolveArchivoUrl = (archivoUrl?: string | null) => {
  if (!archivoUrl) return undefined;
  const value = archivoUrl.trim();
  if (!value) return undefined;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  try {
    if (value.startsWith("/")) {
      return new URL(value, API_ORIGIN).toString();
    }
    return new URL(value, API_BASE_URL).toString();
  } catch {
    return undefined;
  }
};

const parseFilenameFromContentDisposition = (contentDisposition?: string) => {
  if (!contentDisposition) return null;

  const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (filenameStarMatch?.[1]) {
    try {
      return decodeURIComponent(filenameStarMatch[1]);
    } catch {
      return filenameStarMatch[1];
    }
  }

  const filenameMatch = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
  return filenameMatch?.[1] ?? null;
};

const toHeaderString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  return undefined;
};

export const toDomainDictamen = (dto: DictamenResponseDto): Dictamen => ({
  id: String(dto.id),
  expedienteId: String(dto.expediente_id),
  numero: dto.numero_dictamen ?? undefined,
  tipo: dto.tipo_dictamen ?? undefined,
  decisionFinal: tipoToDecisionFinal(dto.tipo_dictamen),
  resumen: dto.contenido,
  firmado: dto.firmado,
  fecha: dto.fecha_emision ?? dto.created_at,
  fechaEmision: dto.fecha_emision ?? undefined,
  fechaFirma: dto.fecha_firma ?? undefined,
  archivoUrl: resolveArchivoUrl(dto.archivo_url),
  url: resolveArchivoUrl(dto.archivo_url),
});

const resolveErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    const status = error.response?.status;
    if (status === 401) return "Tu sesión ha expirado. Inicia sesión nuevamente.";
    if (status === 403) return "No tienes permisos para descargar este dictamen.";
    if (status === 404) {
      return "El dictamen no existe o aún no tiene archivo disponible para descarga.";
    }
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
      const response = await api.post<DictamenResponseDto>(`/dictamen/${id}/firmar`);
      return {
        message: "Dictamen firmado exitosamente.",
        numero: response.data.numero_dictamen ?? undefined,
      };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async descargarArchivoDictamen(
    dictamenId: string,
    preferredFileName?: string,
  ): Promise<DictamenArchivoResponse> {
    const id = Number(dictamenId);
    if (!Number.isFinite(id)) {
      throw new Error("El identificador del dictamen no es válido.");
    }

    try {
      const response = await axios.get<Blob>(`/api/v1/dictamen/${id}/descargar`, {
        responseType: "blob",
        withCredentials: true,
      });
      const mimeType = toHeaderString(response.headers["content-type"]) ?? "application/octet-stream";
      const fileNameFromHeader = parseFilenameFromContentDisposition(
        toHeaderString(response.headers["content-disposition"]),
      );
      const fileName = fileNameFromHeader ?? preferredFileName ?? "dictamen-firmado.pdf";
      const blob =
        response.data instanceof Blob
          ? new Blob([response.data], { type: mimeType })
          : new Blob([response.data], { type: mimeType });

      return { blob, fileName, mimeType };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },
};
