import { api } from "@/lib/api";
import type {
  BitacoraEventoDto,
  Dictamen,
  DocumentoResponseDto,
  Expediente,
  ExpedienteCreateRequestDto,
  ExpedienteEnviarResponseDto,
  ExpedienteResponseDto,
  ExpedienteStatus,
  HistorialEstadoDto,
  HistorialEvento,
  Observacion,
} from "@/types";

import { getAuthUser } from "./auth-session";

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

export interface RegistrarDocumentoPayload {
  nombreArchivo: string;
  tipoDocumento: string;
  esObligatorio?: boolean;
}

const FALLBACK_DOCUMENTS = [
  "Protocolo de investigacion",
  "Consentimiento informado",
  "Carta de presentacion",
  "Instrumentos de recoleccion",
];

const statusMap: Record<string, ExpedienteStatus> = {
  borrador: "Borrador",
  enviado: "Enviado",
  en_revision: "En evaluación",
  subsanacion: "Subsanado",
  aprobado: "Aprobado",
  rechazado: "Desaprobado",
  archivado: "Cerrado",
};

const resolveStatus = (value: string): ExpedienteStatus => {
  const key = value.trim().toLowerCase();
  return statusMap[key] ?? "Enviado";
};

const toDomainExpediente = (dto: ExpedienteResponseDto): Expediente => {
  const sessionUser = getAuthUser();

  return {
    id: String(dto.id),
    codigo: dto.codigo_unico ?? `EXP-${dto.id}`,
    titulo: dto.titulo_protocolo,
    investigadorPrincipal: sessionUser?.nombre ?? `Investigador #${dto.investigador_id}`,
    tipoTramite: "No especificado",
    facultad: "No especificada",
    fechaRegistro: dto.created_at,
    fechaLimite: undefined,
    prioridad: "Media",
    estado: resolveStatus(dto.estado),
    documentos: FALLBACK_DOCUMENTS.map((nombre, index) => ({
      id: `doc-fallback-${dto.id}-${index + 1}`,
      nombre,
      tipo: "Requerido",
      requerido: true,
      cargado: false,
    })),
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

export const expedientesService = {
  async list(status?: ExpedienteStatus): Promise<Expediente[]> {
    const response = await api.get<ExpedienteResponseDto[]>("/expedientes/", {
      params: { skip: 0, limit: 100 },
    });

    const mapped = response.data.map(toDomainExpediente);
    return status ? mapped.filter((item) => item.estado === status) : mapped;
  },

  async getById(id: string): Promise<ExpedienteDetalleResponse> {
    const expedienteId = Number(id);
    if (!Number.isFinite(expedienteId)) {
      throw new Error("El identificador del expediente no es válido.");
    }

    const [expedienteResponse, bitacoraResponse, historialResponse] = await Promise.all([
      api.get<ExpedienteResponseDto>(`/expedientes/${expedienteId}`),
      api.get<BitacoraEventoDto[]>(`/expedientes/${expedienteId}/bitacora`),
      api.get<HistorialEstadoDto[]>(`/expedientes/${expedienteId}/historial`),
    ]);

    const expediente = toDomainExpediente(expedienteResponse.data);

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
      dictamen: undefined,
    };
  },

  async createDraft(payload: NuevoExpedientePayload): Promise<Expediente> {
    const requestBody: ExpedienteCreateRequestDto = {
      titulo_protocolo: payload.titulo,
    };

    const created = await api.post<ExpedienteResponseDto>("/expedientes/", requestBody);
    return toDomainExpediente(created.data);
  },

  async registrarDocumento(
    expedienteId: string,
    payload: RegistrarDocumentoPayload,
  ): Promise<DocumentoResponseDto> {
    const id = Number(expedienteId);
    if (!Number.isFinite(id)) {
      throw new Error("El identificador del expediente no es válido.");
    }

    const response = await api.post<DocumentoResponseDto>(
      `/expedientes/${id}/documentos`,
      null,
      {
        params: {
          nombre_archivo: payload.nombreArchivo,
          tipo_documento: payload.tipoDocumento,
          es_obligatorio: payload.esObligatorio ?? true,
        },
      },
    );

    return response.data;
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
    respuestas: Array<{ observacionId: string; respuesta: string }>,
  ): Promise<{ message: string }> {
    if (respuestas.length === 0) {
      throw new Error("Debe responder al menos una observacion.");
    }

    const response = await this.enviarExpediente(expedienteId);
    return { message: response.message };
  },
};
