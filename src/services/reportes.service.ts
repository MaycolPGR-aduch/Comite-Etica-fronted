import axios from "axios";

import { api } from "@/lib/api";
import type {
  ReporteBusquedaExpediente,
  ReporteCargaEvaluador,
  ReporteExpedientesPorEstado,
  ReporteExportResult,
  ReporteResponseDto,
  ReporteResultadoEmitido,
  ReporteTiempoAtencion,
} from "@/types";

const toRecord = (value: ReporteResponseDto): Record<string, unknown> =>
  value && typeof value === "object" ? value : {};

const toArray = (value: unknown): ReporteResponseDto[] => {
  if (Array.isArray(value)) {
    return value as ReporteResponseDto[];
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidates = [
      record.data,
      record.items,
      record.resultados,
      record.rows,
      record.registros,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as ReporteResponseDto[];
      }
    }
  }

  return [];
};

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toString = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const resolveErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (error.response?.status === 403) {
      return "No tienes permisos para acceder a este reporte.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo completar la consulta de reportes.";
};

const extractJsonFromBlob = async (blob: Blob): Promise<Record<string, unknown>> => {
  const text = await blob.text();
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
};

const downloadBlob = (blob: Blob, filename: string) => {
  if (typeof window === "undefined") return;
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const getFilenameFromContentDisposition = (value?: string, fallback = "reporte.csv") => {
  if (!value) return fallback;
  const match = value.match(/filename\*=UTF-8''([^;]+)|filename=\"?([^\";]+)\"?/i);
  const encoded = match?.[1];
  const plain = match?.[2];
  if (encoded) return decodeURIComponent(encoded);
  if (plain) return plain;
  return fallback;
};

export const reportesService = {
  async getExpedientesPorEstado(): Promise<ReporteExpedientesPorEstado[]> {
    try {
      const response = await api.get<unknown>("/reportes/expedientes-por-estado");
      const payload = response.data as unknown;

      if (payload && typeof payload === "object" && !Array.isArray(payload)) {
        const estadisticas = payload as Record<string, unknown>;
        const porEstado = estadisticas.por_estado;

        if (porEstado && typeof porEstado === "object" && !Array.isArray(porEstado)) {
          return Object.entries(porEstado as Record<string, unknown>).map(([estado, total]) => ({
            estado,
            total: toNumber(total),
          }));
        }
      }

      return toArray(payload).map((item) => {
        const row = toRecord(item);
        return {
          estado: toString(row.estado) || "desconocido",
          total: toNumber(row.total),
        };
      });
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getTiemposAtencion(): Promise<ReporteTiempoAtencion[]> {
    try {
      const response = await api.get<unknown>("/reportes/tiempos-atencion");
      return toArray(response.data).map((item) => {
        const row = toRecord(item);
        return {
          expedienteId: toString(row.expediente_id),
          codigo: toString(row.codigo),
          dias: toNumber(row.dias),
          estado: toString(row.estado) || "desconocido",
        };
      });
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getCargaEvaluadores(): Promise<ReporteCargaEvaluador[]> {
    try {
      const response = await api.get<unknown>("/reportes/carga-evaluadores");
      return toArray(response.data).map((item) => {
        const row = toRecord(item);
        return {
          evaluadorId: toString(row.evaluador_id),
          total: toNumber(row.total_evaluaciones ?? row.total),
        };
      });
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getResultadosEmitidos(): Promise<ReporteResultadoEmitido[]> {
    try {
      const response = await api.get<unknown>("/reportes/resultados-emitidos");
      return toArray(response.data).map((item) => {
        const row = toRecord(item);
        const decision =
          toString(row.tipo) ||
          toString(row.decision) ||
          toString(row.resultado) ||
          toString(row.estado) ||
          "sin_definir";
        const total = toNumber(row.total);

        return { decision, total };
      });
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async buscarExpedientes(filters?: {
    estado?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }): Promise<ReporteBusquedaExpediente[]> {
    try {
      const response = await api.get<unknown>("/reportes/buscar-expedientes", {
        params: {
          estado: filters?.estado || undefined,
          fecha_inicio: filters?.fechaInicio || undefined,
          fecha_fin: filters?.fechaFin || undefined,
        },
      });

      return toArray(response.data).map((item) => {
        const row = toRecord(item);
        return {
          id: toString(row.id),
          codigoUnico: toString(row.codigo_unico),
          tituloProtocolo: toString(row.titulo_protocolo),
          investigadorId: toString(row.investigador_id),
          tipoTramite: toString(row.tipo_tramite),
          facultad: toString(row.facultad),
          estado: toString(row.estado),
          fechaEnvio: toString(row.fecha_envio) || undefined,
          fechaCreacion: toString(row.created_at) || toString(row.fecha_creacion) || undefined,
        };
      });
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async exportar(tipo: string): Promise<ReporteExportResult> {
    try {
      const response = await api.get("/reportes/exportar", {
        params: { tipo },
        responseType: "blob",
      });

      const contentType = String(response.headers["content-type"] || "");
      const contentDisposition = String(response.headers["content-disposition"] || "");
      const blob = response.data as Blob;

      if (contentType.includes("application/json")) {
        const json = await extractJsonFromBlob(blob);
        return {
          mensaje:
            toString(json.message) || "Reporte exportado correctamente.",
          formato: toString(json.formato) || tipo,
        };
      }

      const extension = tipo.toLowerCase() === "xlsx" ? "xlsx" : tipo.toLowerCase() === "pdf" ? "pdf" : "csv";
      const filename = getFilenameFromContentDisposition(contentDisposition, `reporte.${extension}`);
      downloadBlob(blob, filename);

      return {
        mensaje: `Reporte exportado y descargado (${filename}).`,
        formato: tipo,
      };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },
};
