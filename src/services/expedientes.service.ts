import axios from "axios";

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
  resumen: string;
}

export type ModalidadExpediente = "pregrado" | "postgrado" | "interno";

export interface PlantillaInfo {
  key: string;
  accion: "descargar" | "ver";
  label: string;
}

export interface DocumentoRequerido {
  tipo: string;
  label: string;
  indicaciones: string[];
  plantilla: PlantillaInfo | null;
}

export interface GuiaNombres {
  key: string;
  label: string;
  texto: string;
}

export interface CatalogosExpediente {
  modalidad: ModalidadExpediente | null;
  programas_estudios: string[];
  ciclos: string[];
  niveles_posgrado: string[];
  documentos_requeridos: Record<string, DocumentoRequerido[]>;
  guia_nombres: GuiaNombres;
  cambio_titulo: {
    ciclos: string[];
    documento: DocumentoRequerido;
  };
}

export interface CambioTituloPayload {
  proyectoOrigenId: string;
  programaEstudios: string;
  ciclo: string;
  tituloNuevo: string;
  autores: AutorPayload[];
}

export interface ProyectoElegibleCambioTitulo {
  id: string;
  codigo: string | null;
  titulo: string;
  estado: string;
  programaEstudios: string | null;
  ciclo: string | null;
  autores: AutorPayload[];
}

/** URL pública de una plantilla/guía del comité. */
export const plantillaUrl = (key: string, modo: "ver" | "descargar") => {
  const base = api.defaults.baseURL ?? "";
  return `${base}/plantillas/${key}?modo=${modo}`;
};

export interface AutorPayload {
  apellidos_nombres: string;
  codigo_estudiante?: string;
  correo?: string;
  telefono?: string;
}

export interface NuevoExpedienteDinamicoPayload {
  titulo: string;
  programaEstudios: string;
  ciclo?: string;
  nivelPosgrado?: string;
  autores: AutorPayload[];
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

// Formato exacto que admite cada tipo de documento (validación estricta por casillero).
const PDF_MIMES = ["application/pdf"];
const WORD_MIMES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const IMAGE_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export interface DocumentFormat {
  label: string;
  extensions: string[];
  mimeTypes: string[];
}

export const DOCUMENT_FORMATS: Record<string, DocumentFormat> = {
  proyecto_pdf: { label: "PDF", extensions: [".pdf"], mimeTypes: PDF_MIMES },
  proyecto_word: { label: "Word (.doc, .docx)", extensions: [".doc", ".docx"], mimeTypes: WORD_MIMES },
  solicitud_evaluacion: { label: "PDF", extensions: [".pdf"], mimeTypes: PDF_MIMES },
  carta_aprobacion: { label: "PDF", extensions: [".pdf"], mimeTypes: PDF_MIMES },
  boleta_pago: {
    label: "PDF o imagen (JPG/PNG)",
    extensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    mimeTypes: [...PDF_MIMES, ...IMAGE_MIMES],
  },
};

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
  aprobado_observaciones: "Aprobado con observaciones",
  no_aprobado: "No aprobado",
  observado: "Observado",
  archivado: "Cerrado",
};

const terminalStatuses = new Set<ExpedienteStatus>([
  "Aprobado",
  "Aprobado con observaciones",
  "No aprobado",
  "Cerrado",
]);
const derivableWorkflowStatuses = new Set<ExpedienteStatus>([
  "Admitido",
  "Asignado",
  "En evaluación",
  "Evaluaciones completas",
  "En deliberación",
]);

const resolveStatus = (value: string): ExpedienteStatus => {
  const key = value.trim().toLowerCase();
  return statusMap[key] ?? "Enviado";
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

const resolveApiErrorDetail = (data: unknown): string | null => {
  if (!data) return null;
  if (typeof data === "string") return data;

  if (typeof data === "object" && "detail" in data) {
    const detail = (data as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
  }

  return null;
};

const resolveDocumentoActionLabel = (mode: DocumentoActionMode) =>
  mode === "preview" ? "previsualizar" : "descargar";

const resolveDocumentoActionErrorMessage = (
  error: unknown,
  mode: DocumentoActionMode,
): string => {
  const actionLabel = resolveDocumentoActionLabel(mode);

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const detail = resolveApiErrorDetail(error.response?.data);

    if (status === 401) {
      return `Tu sesión ha expirado. Debes iniciar sesión nuevamente para ${actionLabel} este documento.`;
    }

    if (status === 403) {
      return "No tienes permisos para acceder a este documento.";
    }

    if (status === 404) {
      return "El documento no fue encontrado en el servidor. Si fue cargado anteriormente, es probable que el archivo ya no esté disponible y debas volver a subirlo.";
    }

    if (status === 400) {
      return detail ?? "El documento no tiene una ruta de archivo válida para su descarga.";
    }

    if (detail) {
      return detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return `No se pudo ${actionLabel} el documento en este momento.`;
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
    investigadorPrincipal:
      dto.investigador_nombre ?? sessionUser?.nombre ?? `Investigador #${dto.investigador_id}`,
    tipoTramite: dto.tipo_tramite ?? "No especificado",
    facultad: dto.facultad ?? "No especificada",
    fechaRegistro: dto.created_at,
    fechaEnvio: dto.fecha_envio ?? undefined,
    fechaLimite: undefined,
    estado: resolveStatus(dto.estado),
    documentos: resolveDocumentos(documentos),
    observacionesPendientes: 0,
    evaluadoresAsignados: [],
    evaluacionRubricaUrl: dto.evaluacion_rubrica_url ?? null,
    evaluacionDictamenUrl: dto.evaluacion_dictamen_url ?? null,
    evaluacionResultado: dto.evaluacion_resultado ?? null,
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

const deriveStatusFromDictamen = (decisionFinal: Dictamen["decisionFinal"]): ExpedienteStatus => {
  if (decisionFinal === "Aprobado") return "Aprobado";
  return "Observado";
};

const deriveWithWorkflowStatus = (
  expedientes: Expediente[],
  evaluaciones: EvaluacionResponseDto[],
  dictamenes: Dictamen[],
): Expediente[] => {
  const evaluacionesByExpedienteId = evaluaciones.reduce<Record<string, EvaluacionResponseDto[]>>(
    (acc, item) => {
      const key = String(item.expediente_id);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {},
  );

  const latestDictamenByExpediente = dictamenes.reduce<Record<string, Dictamen>>((acc, item) => {
    const current = acc[item.expedienteId];
    if (!current || new Date(item.fecha).getTime() > new Date(current.fecha).getTime()) {
      acc[item.expedienteId] = item;
    }
    return acc;
  }, {});

  return expedientes.map((expediente) => {
    const dictamen = latestDictamenByExpediente[expediente.id];
    if (dictamen) {
      return { ...expediente, estado: deriveStatusFromDictamen(dictamen.decisionFinal) };
    }

    if (terminalStatuses.has(expediente.estado)) {
      return expediente;
    }

    if (!derivableWorkflowStatuses.has(expediente.estado)) {
      return expediente;
    }

    const evaluacionesExpediente = evaluacionesByExpedienteId[expediente.id] ?? [];
    if (evaluacionesExpediente.length === 0) {
      return expediente;
    }

    const enviadasSinConflicto = evaluacionesExpediente.filter(
      (item) => item.completa && !item.conflicto_interes,
    ).length;

    if (enviadasSinConflicto >= 2) {
      return { ...expediente, estado: "Evaluaciones completas" };
    }

    const tieneEvaluacionActiva = evaluacionesExpediente.some((item) => !item.conflicto_interes);
    if (tieneEvaluacionActiva) {
      return { ...expediente, estado: "En evaluación" };
    }

    return { ...expediente, estado: "Asignado" };
  });
};

const enrichWithDerivedStatus = async (expedientes: Expediente[]): Promise<Expediente[]> => {
  try {
    const [evaluacionesResponse, dictamenes] = await Promise.all([
      api.get<EvaluacionResponseDto[]>("/evaluacion/", {
        params: { skip: 0, limit: 500 },
      }),
      dictamenService.list(0, 500).catch(() => []),
    ]);

    return deriveWithWorkflowStatus(expedientes, evaluacionesResponse.data, dictamenes);
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

  async getCatalogos(): Promise<CatalogosExpediente> {
    const response = await api.get<CatalogosExpediente>("/expedientes/catalogos");
    return response.data;
  },

  async createExpedienteDinamico(
    payload: NuevoExpedienteDinamicoPayload,
  ): Promise<{ id: string; codigo: string }> {
    const requestBody = {
      titulo_protocolo: payload.titulo,
      programa_estudios: payload.programaEstudios,
      ciclo: payload.ciclo || null,
      nivel_posgrado: payload.nivelPosgrado || null,
      autores: payload.autores,
    };

    const created = await api.post<ExpedienteResponseDto>("/expedientes/", requestBody);
    return {
      id: String(created.data.id),
      codigo: created.data.codigo_unico ?? `EXP-${created.data.id}`,
    };
  },

  async getProyectosElegiblesCambioTitulo(): Promise<ProyectoElegibleCambioTitulo[]> {
    const response = await api.get<
      Array<{
        id: number;
        codigo: string | null;
        titulo: string;
        estado: string;
        programa_estudios: string | null;
        ciclo: string | null;
        autores: Array<{ apellidos_nombres: string; codigo_estudiante?: string; correo?: string }>;
      }>
    >("/expedientes/elegibles-cambio-titulo");
    return response.data.map((p) => ({
      id: String(p.id),
      codigo: p.codigo,
      titulo: p.titulo,
      estado: p.estado,
      programaEstudios: p.programa_estudios,
      ciclo: p.ciclo,
      autores: (p.autores ?? []).map((a) => ({
        apellidos_nombres: a.apellidos_nombres,
        codigo_estudiante: a.codigo_estudiante ?? "",
        correo: a.correo ?? "",
      })),
    }));
  },

  async createCambioTitulo(
    payload: CambioTituloPayload,
  ): Promise<{ id: string; codigo: string }> {
    const requestBody = {
      proyecto_origen_id: Number(payload.proyectoOrigenId),
      programa_estudios: payload.programaEstudios,
      ciclo: payload.ciclo,
      titulo_nuevo: payload.tituloNuevo,
      autores: payload.autores,
    };
    const created = await api.post<ExpedienteResponseDto>("/expedientes/cambio-titulo", requestBody);
    return {
      id: String(created.data.id),
      codigo: created.data.codigo_unico ?? `EXP-${created.data.id}`,
    };
  },

  async deleteExpediente(id: string): Promise<void> {
    const expedienteId = Number(id);
    if (!Number.isFinite(expedienteId)) {
      throw new Error("El identificador del proyecto no es válido.");
    }
    try {
      await api.delete(`/expedientes/${expedienteId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const detail = error.response?.data?.detail;
        if (typeof detail === "string") throw new Error(detail);
      }
      throw new Error("No se pudo eliminar el proyecto.");
    }
  },

  async createDraft(payload: NuevoExpedientePayload): Promise<Expediente> {
    const requestBody: ExpedienteCreateRequestDto = {
      titulo_protocolo: payload.titulo,
      tipo_tramite: payload.tipoTramite.trim() || null,
      facultad: payload.facultad.trim() || null,
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

  validateDocumento(
    file: File,
    options?: { extensions?: readonly string[]; mimeTypes?: readonly string[] },
  ): string | null {
    const allowedExtensions: readonly string[] = options?.extensions ?? DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS;
    const allowedMimeTypes: readonly string[] = options?.mimeTypes ?? DOCUMENT_UPLOAD_ACCEPTED_MIME_TYPES;

    const lowerName = file.name.toLowerCase();
    const hasAllowedExtension = allowedExtensions.some((extension) =>
      lowerName.endsWith(extension),
    );

    if (!hasAllowedExtension) {
      return `Formato no permitido. Use: ${allowedExtensions.join(", ")}.`;
    }

    if (file.type && !allowedMimeTypes.includes(file.type)) {
      return "El tipo de archivo no coincide con el formato requerido.";
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

    let response;
    try {
      response = await axios.get<Blob>(
        `/api/v1/expedientes/${parsedExpedienteId}/documentos/${parsedDocumentoId}/${endpoint}`,
        {
          responseType: "blob",
          withCredentials: true,
        },
      );
    } catch (error) {
      throw new Error(resolveDocumentoActionErrorMessage(error, mode));
    }

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
