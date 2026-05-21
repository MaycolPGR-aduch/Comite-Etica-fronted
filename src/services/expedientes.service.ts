import { api } from "@/lib/api";
import type {
  BitacoraEventoDto,
  Dictamen,
  DocumentoResponseDto,
  EvaluacionResponseDto,
  Expediente,
  ExpedienteCreateRequestDto,
  ExpedienteEnviarResponseDto,
  ExpedienteResponseDto,
  ExpedienteSubsanacionResponseDto,
  ExpedienteStatus,
  ExpedienteUpdateRequestDto,
  HistorialEstadoDto,
  HistorialEvento,
  Observacion,
  Priority,
} from "@/types";

import { getAuthUser } from "./auth-session";
import { dictamenService } from "./dictamen.service";

export interface ExpedienteDetalleResponse {
  expediente: Expediente;
  timeline: HistorialEvento[];
  observaciones: Observacion[];
  dictamen?: Dictamen;
}

export interface NuevoExpedientePayload {
  titulo: string;
  tipoTramite: string;
  facultad: string;
  prioridad: Priority;
  resumen: string;
}

export interface RegistrarDocumentoPayload {
  file: File;
  tipoDocumento: string;
  esObligatorio?: boolean;
}

export interface ReenviarSubsanacionPayload {
  observaciones: string;
}

export type DocumentoActionMode = "preview" | "download";

export interface DescargarDocumentoResponse {
  blob: Blob;
  fileName: string;
  mimeType: string;
}

const FALLBACK_DOCUMENTS = [
  "Protocolo de investigacion",
  "Consentimiento informado",
  "Carta de presentacion",
  "Instrumentos de recoleccion",
];

export const DOCUMENT_UPLOAD_ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
] as const;

export const DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
] as const;

export const DOCUMENT_UPLOAD_MAX_SIZE_BYTES = 10 * 1024 * 1024;

const statusMap: Record<string, ExpedienteStatus> = {
  borrador: "Borrador",
  recibido: "Enviado",
  enviado: "Enviado",
  en_revision: "En revisión administrativa",
  observado_por_admisibilidad: "Observado por admisibilidad",
  subsanacion: "Subsanado",
  admitido: "Admitido",
  asignado: "Asignado",
  en_evaluacion: "En evaluación",
  evaluaciones_completas: "Evaluaciones completas",
  en_deliberacion: "En deliberación",
  aprobado: "Aprobado",
  rechazado: "Desaprobado",
  archivado: "Cerrado",
};

const terminalStatuses = new Set<ExpedienteStatus>(["Aprobado", "Desaprobado", "Cerrado"]);

const priorityMap: Record<string, Priority> = {
  alta: "Alta",
  high: "Alta",
  urgente: "Alta",
  media: "Media",
  medio: "Media",
  normal: "Media",
  baja: "Baja",
  low: "Baja",
};

const resolveStatus = (value: string): ExpedienteStatus => {
  const key = value.trim().toLowerCase();
  return statusMap[key] ?? "Enviado";
};

const resolvePriority = (value?: string | null): Priority => {
  if (!value) return "Media";
  return priorityMap[value.trim().toLowerCase()] ?? "Media";
};

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

const resolveFileExtensionByMimeType = (mimeType?: string | null) => {
  const normalized = mimeType?.toLowerCase() ?? "";

  if (normalized.includes("pdf")) return ".pdf";
  if (normalized.includes("msword")) return ".doc";
  if (normalized.includes("wordprocessingml.document")) return ".docx";
  if (normalized.includes("vnd.ms-excel")) return ".xls";
  if (normalized.includes("spreadsheetml.sheet")) return ".xlsx";
  if (normalized.includes("text/plain")) return ".txt";

  return "";
};

const resolveMimeTypeByFilename = (fileName?: string | null) => {
  const normalized = fileName?.toLowerCase() ?? "";
  if (normalized.endsWith(".pdf")) return "application/pdf";
  if (normalized.endsWith(".doc")) return "application/msword";
  if (normalized.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (normalized.endsWith(".xls")) return "application/vnd.ms-excel";
  if (normalized.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  if (normalized.endsWith(".txt")) return "text/plain";
  return null;
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

const resolveFileNameFromPreferred = (
  preferredFileName: string | undefined,
  fallbackFileName: string,
) => {
  const clean = preferredFileName?.trim();
  if (!clean) return fallbackFileName;
  return clean;
};

const toDomainDocumento = (dto: DocumentoResponseDto) => ({
  id: String(dto.id),
  nombre: dto.nombre_archivo,
  tipo: dto.tipo_documento,
  requerido: dto.es_obligatorio,
  cargado: true,
  version: dto.version,
  updatedAt: dto.created_at,
  url: resolveDocumentoUrl(dto.ruta_archivo),
});

const resolveDocumentos = (documentos?: DocumentoResponseDto[]) => {
  if (!documentos || documentos.length === 0) {
    return FALLBACK_DOCUMENTS.map((nombre, index) => ({
      id: `doc-fallback-${index + 1}`,
      nombre,
      tipo: "Requerido",
      requerido: true,
      cargado: false,
    }));
  }

  return documentos.map(toDomainDocumento);
};

const toDomainExpediente = (
  dto: ExpedienteResponseDto,
  documentos?: DocumentoResponseDto[],
): Expediente => {
  const sessionUser = getAuthUser();

  return {
    id: String(dto.id),
    codigo: dto.codigo_unico ?? `EXP-${dto.id}`,
    titulo: dto.titulo_protocolo,
    investigadorPrincipal: sessionUser?.nombre ?? `Investigador #${dto.investigador_id}`,
    tipoTramite: dto.tipo_tramite ?? "No especificado",
    facultad: dto.facultad ?? "No especificada",
    fechaRegistro: dto.created_at,
    fechaLimite: undefined,
    prioridad: resolvePriority(dto.prioridad),
    estado: resolveStatus(dto.estado),
    documentos: resolveDocumentos(documentos),
    observacionesPendientes: 0,
    evaluadoresAsignados: [],
  };
};

const toBitacoraEvento = (dto: BitacoraEventoDto): HistorialEvento => ({
  id: `bitacora-${dto.id}`,
  expedienteId: "",
  titulo: dto.accion,
  descripcion: dto.detalle,
  actor: "Sistema",
  fecha: dto.created_at,
});

const toHistorialEvento = (dto: HistorialEstadoDto): HistorialEvento => ({
  id: `historial-${dto.id}`,
  expedienteId: String(dto.expediente_id),
  titulo: `Estado: ${dto.estado_nuevo}`,
  descripcion: dto.observaciones ?? "Cambio de estado registrado.",
  actor: "Sistema",
  fecha: dto.created_at,
});

const sortByDateDesc = (events: HistorialEvento[]) =>
  [...events].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  );

const deriveWithAsignado = (
  expedientes: Expediente[],
  evaluaciones: EvaluacionResponseDto[],
): Expediente[] => {
  const expedienteIdsConEvaluacion = new Set(
    evaluaciones.map((item) => String(item.expediente_id)),
  );

  return expedientes.map((expediente) => {
    if (terminalStatuses.has(expediente.estado)) {
      return expediente;
    }

    if (!expedienteIdsConEvaluacion.has(expediente.id)) {
      return expediente;
    }

    return { ...expediente, estado: "Asignado" };
  });
};

const enrichWithDerivedStatus = async (expedientes: Expediente[]): Promise<Expediente[]> => {
  try {
    const response = await api.get<EvaluacionResponseDto[]>("/evaluacion/", {
      params: { skip: 0, limit: 200 },
    });

    return deriveWithAsignado(expedientes, response.data);
  } catch {
    return expedientes;
  }
};

export const expedientesService = {
  async list(status?: ExpedienteStatus): Promise<Expediente[]> {
    const response = await api.get<ExpedienteResponseDto[]>("/expedientes/", {
      params: { skip: 0, limit: 100 },
    });

    const mapped = response.data.map((item) => toDomainExpediente(item));
    const enriched = await enrichWithDerivedStatus(mapped);
    return status ? enriched.filter((item) => item.estado === status) : enriched;
  },

  async getById(id: string): Promise<ExpedienteDetalleResponse> {
    const expedienteId = Number(id);
    if (!Number.isFinite(expedienteId)) {
      throw new Error("El identificador del expediente no es válido.");
    }

    const [expedienteResponse, bitacoraResponse, historialResponse, dictamenes, documentosResponse] =
      await Promise.all([
      api.get<ExpedienteResponseDto>(`/expedientes/${expedienteId}`),
      api.get<BitacoraEventoDto[]>(`/expedientes/${expedienteId}/bitacora`),
      api.get<HistorialEstadoDto[]>(`/expedientes/${expedienteId}/historial`),
      dictamenService.listByExpediente(String(expedienteId)).catch(() => []),
      api
        .get<DocumentoResponseDto[]>(`/expedientes/${expedienteId}/documentos`)
        .then((response) => response.data)
        .catch(() => null),
      ]);

    const enriched = await enrichWithDerivedStatus([
      toDomainExpediente(expedienteResponse.data, documentosResponse ?? undefined),
    ]);
    const expediente = enriched[0];

    const timeline = sortByDateDesc([
      ...bitacoraResponse.data.map((item) => ({
        ...toBitacoraEvento(item),
        expedienteId: expediente.id,
      })),
      ...historialResponse.data.map(toHistorialEvento),
    ]);

    return {
      expediente,
      timeline,
      observaciones: [],
      dictamen: dictamenes[0],
    };
  },

  async createDraft(payload: NuevoExpedientePayload): Promise<Expediente> {
    const requestBody: ExpedienteCreateRequestDto = {
      titulo_protocolo: payload.titulo,
      tipo_tramite: payload.tipoTramite.trim() || null,
      facultad: payload.facultad.trim() || null,
      prioridad: payload.prioridad.toLowerCase(),
    };

    const created = await api.post<ExpedienteResponseDto>("/expedientes/", requestBody);
    return toDomainExpediente(created.data);
  },

  async update(
    expedienteId: string,
    payload: { tituloProtocolo?: string; estado?: string },
  ): Promise<Expediente> {
    const id = Number(expedienteId);
    if (!Number.isFinite(id)) {
      throw new Error("El identificador del expediente no es válido.");
    }

    const requestBody: ExpedienteUpdateRequestDto = {
      titulo_protocolo: payload.tituloProtocolo ?? null,
      estado: payload.estado ?? null,
    };

    const response = await api.put<ExpedienteResponseDto>(`/expedientes/${id}`, requestBody);
    const enriched = await enrichWithDerivedStatus([toDomainExpediente(response.data)]);
    return enriched[0];
  },

  async registrarDocumento(
    expedienteId: string,
    payload: RegistrarDocumentoPayload,
  ): Promise<DocumentoResponseDto> {
    const id = Number(expedienteId);
    if (!Number.isFinite(id)) {
      throw new Error("El identificador del expediente no es válido.");
    }

    const formData = new FormData();
    formData.append("file", payload.file);

    const response = await api.post<DocumentoResponseDto>(
      `/expedientes/${id}/documentos`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          tipo_documento: payload.tipoDocumento,
          es_obligatorio: payload.esObligatorio ?? true,
        },
      },
    );

    return response.data;
  },

  validateDocumento(file: File): string | null {
    const lowerName = file.name.toLowerCase();
    const hasAllowedExtension = DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS.some((extension) =>
      lowerName.endsWith(extension),
    );

    if (!hasAllowedExtension) {
      return `Formato no permitido. Use: ${DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS.join(", ")}.`;
    }

    if (
      file.type &&
      !DOCUMENT_UPLOAD_ACCEPTED_MIME_TYPES.includes(
        file.type as (typeof DOCUMENT_UPLOAD_ACCEPTED_MIME_TYPES)[number],
      )
    ) {
      return "Tipo MIME no permitido para este endpoint.";
    }

    if (file.size > DOCUMENT_UPLOAD_MAX_SIZE_BYTES) {
      return "El archivo supera el tamaño máximo de 10 MB.";
    }

    return null;
  },

  async enviarExpediente(expedienteId: string): Promise<ExpedienteEnviarResponseDto> {
    const id = Number(expedienteId);
    if (!Number.isFinite(id)) {
      throw new Error("El identificador del expediente no es válido.");
    }

    const response = await api.post<ExpedienteEnviarResponseDto>(`/expedientes/${id}/enviar`);
    return response.data;
  },

  async reenviarSubsanacion(
    expedienteId: string,
    payload: ReenviarSubsanacionPayload,
  ): Promise<{ message: string; estado: string; fechaSubsanacion: string }> {
    const id = Number(expedienteId);
    if (!Number.isFinite(id)) {
      throw new Error("El identificador del expediente no es válido.");
    }

    const observaciones = payload.observaciones.trim();
    if (!observaciones) {
      throw new Error("Debe ingresar observaciones para enviar la subsanación.");
    }

    const body = new URLSearchParams({ observaciones });
    const response = await api.post<ExpedienteSubsanacionResponseDto>(
      `/expedientes/${id}/subsanacion`,
      body,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    return {
      message: response.data.mensaje,
      estado: response.data.estado,
      fechaSubsanacion: response.data.fecha_subsanacion,
    };
  },

  async descargarDocumento(
    expedienteId: string,
    documentoId: string,
    preferredFileName?: string,
    mode: DocumentoActionMode = "download",
  ): Promise<DescargarDocumentoResponse> {
    const parsedExpedienteId = Number(expedienteId);
    if (!Number.isFinite(parsedExpedienteId)) {
      throw new Error("El identificador del expediente no es válido.");
    }

    const parsedDocumentoId = Number(documentoId);
    if (!Number.isFinite(parsedDocumentoId)) {
      throw new Error("El identificador del documento no es válido.");
    }

    const endpoint = mode === "preview" ? "preview" : "descargar";
    const response = await api.get<Blob>(
      `/expedientes/${parsedExpedienteId}/documentos/${parsedDocumentoId}/${endpoint}`,
      { responseType: "blob" },
    );

    const rawMimeType = toHeaderString(response.headers["content-type"]) ?? "application/octet-stream";
    const fileNameFromHeader = parseFilenameFromContentDisposition(
      toHeaderString(response.headers["content-disposition"]),
    );
    const inferredMimeType = resolveMimeTypeByFilename(fileNameFromHeader ?? preferredFileName);
    const mimeType =
      rawMimeType && rawMimeType !== "application/octet-stream"
        ? rawMimeType
        : inferredMimeType ?? rawMimeType;
    const extension = resolveFileExtensionByMimeType(mimeType);
    const fallbackName = `documento-${parsedDocumentoId}${extension || ".bin"}`;
    const fileName = resolveFileNameFromPreferred(
      fileNameFromHeader ?? preferredFileName,
      fallbackName,
    );

    const normalizedBlob =
      response.data instanceof Blob
        ? new Blob([response.data], { type: mimeType })
        : new Blob([response.data], { type: mimeType });

    return {
      blob: normalizedBlob,
      fileName,
      mimeType,
    };
  },
};
