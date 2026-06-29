import axios from "axios";

import { api } from "@/lib/api";
import type {
  CriterioEvaluacionResponseDto,
  CriterioEvaluado,
  DocumentoResponseDto,
  Evaluacion,
  EvaluacionAsignarRequestDto,
  EvaluacionCreateRequestDto,
  EvaluacionResponseDto,
  EvaluacionUpdateRequestDto,
  Expediente,
  ExpedienteResponseDto,
  MessageResponseDto,
  Recommendation,
  ResultadoEvaluacion,
  RubricaCriterio,
  RubricaResponseDto,
  UserResponseDto,
} from "@/types";

/** Catálogo de la rúbrica oficial mapeado a dominio. */
export interface RubricaCatalogo {
  criterios: RubricaCriterio[];
  puntajeTotalMax: number;
  umbrales: Record<string, string>;
}

export interface GuardarRubricaPayload {
  evaluacionId: string;
  criterios: CriterioEvaluado[];
  observaciones?: string;
  enviar: boolean;
}

export interface GuardarRubricaResult {
  resultado: ResultadoEvaluacion | null;
  puntajeTotal: number | null;
  estado: "Borrador" | "Enviada";
}

export interface EvaluacionBandejaItem {
  id: string;
  expedienteId: string;
  expedienteTitulo?: string;
  investigadorNombre?: string | null;
  fechaEnvio?: string | null;
  evaluadorId: string;
  recommendation: Recommendation | null;
  observaciones: string | null;
  completa: boolean;
  conflictoInteres: boolean;
  criterios: CriterioEvaluado[];
  puntajeTotal: number | null;
  resultado: ResultadoEvaluacion | null;
  createdAt: string;
  estado: "Completada" | "En progreso" | "Conflicto de interes";
}

export interface EvaluacionContextoResponse {
  evaluacion: EvaluacionBandejaItem;
  evaluacionActual: Evaluacion;
  expediente: Expediente;
  investigador?: {
    id: string;
    nombre: string;
    correo: string;
  };
}

const API_BASE_URL = api.defaults.baseURL ?? "https://comite-backend.onrender.com/api/v1";
const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "https://comite-backend.onrender.com";
  }
})();

const resolveDocumentoUrl = (rutaArchivo?: string | null) => {
  if (!rutaArchivo) return undefined;
  const value = rutaArchivo.trim();
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

const normalize = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const recommendationMap: Record<string, Recommendation> = {
  aprobar: "Aprobar",
  aprobar_con_observaciones: "Aprobar con observaciones",
  solicitar_subsanacion: "Solicitar subsanación",
  desaprobar: "Solicitar subsanación",
};

const toRecommendation = (value?: string | null): Recommendation | null =>
  recommendationMap[normalize(value)] ?? null;

const toResultado = (value?: string | null): ResultadoEvaluacion | null => {
  if (
    value === "aprobado" ||
    value === "aprobado_observaciones" ||
    value === "no_aprobado"
  ) {
    return value;
  }
  return null;
};

const toCriterioEvaluado = (dto: CriterioEvaluacionResponseDto): CriterioEvaluado => ({
  key: dto.criterio_key,
  puntaje: dto.puntaje,
  observacion: dto.observacion ?? "",
});

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

const toBandejaItem = (dto: EvaluacionResponseDto): EvaluacionBandejaItem => ({
  id: String(dto.id),
  expedienteId: String(dto.expediente_id),
  expedienteTitulo: dto.titulo_protocolo ?? undefined,
  investigadorNombre: dto.investigador_nombre ?? null,
  fechaEnvio: dto.expediente_fecha_envio ?? null,
  evaluadorId: String(dto.evaluador_id),
  recommendation: toRecommendation(dto.recommendation),
  observaciones: dto.observaciones,
  completa: dto.completa,
  conflictoInteres: dto.conflicto_interes,
  criterios: (dto.criterios ?? []).map(toCriterioEvaluado),
  puntajeTotal: dto.puntaje_total ?? null,
  resultado: toResultado(dto.resultado),
  createdAt: dto.created_at,
  estado: resolveEstado(dto.completa, dto.conflicto_interes),
});

const toDomainEvaluacion = (dto: EvaluacionResponseDto): Evaluacion => ({
  id: String(dto.id),
  expedienteId: String(dto.expediente_id),
  evaluadorId: String(dto.evaluador_id),
  recomendacion: toRecommendation(dto.recommendation) ?? "Aprobar con observaciones",
  secciones: parseSecciones(dto.observaciones),
  estado: dto.completa ? "Enviada" : "Borrador",
  updatedAt: dto.created_at,
});

const toDomainDocumento = (dto: DocumentoResponseDto): Expediente["documentos"][number] => ({
  id: String(dto.id),
  nombre: dto.nombre_archivo,
  tipo: dto.tipo_documento,
  requerido: dto.es_obligatorio,
  cargado: true,
  version: dto.version,
  updatedAt: dto.created_at,
  url: resolveDocumentoUrl(dto.ruta_archivo),
});

const toDomainExpediente = (
  dto: ExpedienteResponseDto,
  documentos: DocumentoResponseDto[],
  investigadorNombre?: string,
): Expediente => ({
  id: String(dto.id),
  codigo: dto.codigo_unico ?? `EXP-${dto.id}`,
  titulo: dto.titulo_protocolo,
  investigadorPrincipal: investigadorNombre ?? `Investigador #${dto.investigador_id}`,
  tipoTramite: dto.tipo_tramite ?? "No especificado",
  facultad: dto.facultad ?? "No especificada",
  fechaRegistro: dto.created_at,
  fechaEnvio: dto.fecha_envio ?? undefined,
  fechaLimite: undefined,
  estado: "En evaluación",
  documentos: documentos.map(toDomainDocumento),
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

  async asignarEvaluadorManual(
    expedienteId: string,
    evaluadorId: string,
  ): Promise<MessageResponseDto> {
    const parsedExpedienteId = Number(expedienteId);
    if (!Number.isFinite(parsedExpedienteId)) {
      throw new Error("El identificador del expediente no es valido.");
    }

    const parsedEvaluadorId = Number(evaluadorId);
    if (!Number.isFinite(parsedEvaluadorId)) {
      throw new Error("El identificador del evaluador no es valido.");
    }

    const payload: EvaluacionAsignarRequestDto = { evaluador_id: parsedEvaluadorId };

    try {
      const response = await api.post<MessageResponseDto>(
        `/evaluacion/expediente/${parsedExpedienteId}/asignar`,
        payload,
      );

      return {
        message: response.data?.message || "Evaluador asignado correctamente.",
      };
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
      const [expedienteResponse, documentosResponse] = await Promise.all([
        api.get<ExpedienteResponseDto>(`/expedientes/${evaluacionDto.expediente_id}`),
        api
          .get<DocumentoResponseDto[]>(`/expedientes/${evaluacionDto.expediente_id}/documentos`)
          .then((response) => response.data)
          .catch(() => []),
      ]);

      const investigadorResponse = await api
        .get<UserResponseDto>(`/users/${expedienteResponse.data.investigador_id}`)
        .then((response) => response.data)
        .catch(() => null);

      const investigador =
        investigadorResponse && investigadorResponse.id
          ? {
              id: String(investigadorResponse.id),
              nombre: `${investigadorResponse.nombre} ${investigadorResponse.apellido}`.trim(),
              correo: investigadorResponse.email,
            }
          : undefined;

      return {
        evaluacion: toBandejaItem(evaluacionDto),
        evaluacionActual: toDomainEvaluacion(evaluacionDto),
        expediente: toDomainExpediente(
          expedienteResponse.data,
          documentosResponse,
          investigador?.nombre,
        ),
        investigador,
      };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getRubrica(): Promise<RubricaCatalogo> {
    try {
      const response = await api.get<RubricaResponseDto>("/evaluacion/rubrica");
      const data = response.data;

      return {
        criterios: data.criterios.map((item) => ({
          key: item.key,
          nombre: item.nombre,
          descripcion: item.descripcion,
          puntajeMax: item.puntaje_max,
        })),
        puntajeTotalMax: data.puntaje_total_max,
        umbrales: data.umbrales,
      };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async saveRubrica(payload: GuardarRubricaPayload): Promise<GuardarRubricaResult> {
    const observaciones = payload.observaciones?.trim();

    const requestPayload: EvaluacionUpdateRequestDto = {
      observaciones: observaciones ? observaciones : null,
      completa: payload.enviar,
      criterios: payload.criterios.map((item) => {
        const observacion = item.observacion.trim();
        return {
          key: item.key,
          puntaje: item.puntaje,
          observacion: observacion ? observacion : null,
        };
      }),
    };

    const updated = await this.update(payload.evaluacionId, requestPayload);

    return {
      resultado: updated.resultado,
      puntajeTotal: updated.puntajeTotal,
      estado: payload.enviar ? "Enviada" : "Borrador",
    };
  },
};
