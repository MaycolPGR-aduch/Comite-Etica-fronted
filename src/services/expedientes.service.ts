import { dictamenesMock, expedientesMock, historialMock, observacionesMock } from "@/mocks";
import type {
  Dictamen,
  Expediente,
  ExpedienteStatus,
  HistorialEvento,
  Observacion,
} from "@/types";

import { clone, wait } from "./service-utils";

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

export const expedientesService = {
  async list(status?: ExpedienteStatus): Promise<Expediente[]> {
    await wait();
    const items = status
      ? expedientesMock.filter((expediente) => expediente.estado === status)
      : expedientesMock;
    return clone(items);
  },

  async getById(id: string): Promise<ExpedienteDetalleResponse> {
    await wait();
    const expediente = expedientesMock.find((item) => item.id === id);

    if (!expediente) {
      throw new Error("Expediente no encontrado.");
    }

    const timeline = historialMock.filter((event) => event.expedienteId === id);
    const observaciones = observacionesMock.filter((item) => item.expedienteId === id);
    const dictamen = dictamenesMock.find((item) => item.expedienteId === id);

    return clone({ expediente, timeline, observaciones, dictamen });
  },

  async createDraft(payload: NuevoExpedientePayload): Promise<Expediente> {
    await wait();
    const codigo = `CE-2026-${String(expedientesMock.length + 1).padStart(3, "0")}`;

    const draft: Expediente = {
      id: `exp-${String(expedientesMock.length + 1).padStart(3, "0")}`,
      codigo,
      titulo: payload.titulo,
      investigadorPrincipal: "Ana Lopez",
      tipoTramite: payload.tipoTramite,
      facultad: payload.facultad,
      fechaRegistro: new Date().toISOString(),
      fechaLimite: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
      prioridad: "Media",
      estado: "Borrador",
      documentos: [],
      observacionesPendientes: 0,
      evaluadoresAsignados: [],
    };

    return clone(draft);
  },

  async reenviarSubsanacion(
    expedienteId: string,
    respuestas: Array<{ observacionId: string; respuesta: string }>,
  ): Promise<{ message: string }> {
    await wait();

    if (!expedientesMock.some((item) => item.id === expedienteId)) {
      throw new Error("No se puede reenviar un expediente inexistente.");
    }

    if (respuestas.length === 0) {
      throw new Error("Debe responder al menos una observacion.");
    }

    return { message: "Expediente reenviado para nueva revision." };
  },
};
