import type { Expediente, Observacion } from "@/types";

import { expedientesService } from "./expedientes.service";

export interface RevisionAdministrativaPayload {
  expedienteId: string;
  observaciones: string;
  admitir: boolean;
}

export const revisionAdministrativaService = {
  async getPendientes(): Promise<Expediente[]> {
    const expedientes = await expedientesService.list();

    return expedientes.filter(
      (expediente) =>
        expediente.estado === "Enviado" ||
        expediente.estado === "En revisión administrativa" ||
        expediente.estado === "Subsanado",
    );
  },

  async getObservaciones(): Promise<Observacion[]> {
    return [];
  },

  async registrarRevision(
    payload: RevisionAdministrativaPayload,
  ): Promise<{ estado: string; mensaje: string }> {
    const nextState = payload.admitir ? "en_revision" : "subsanacion";

    const updated = await expedientesService.update(payload.expedienteId, {
      estado: nextState,
    });

    return payload.admitir
      ? {
          estado: updated.estado,
          mensaje:
            "Expediente marcado en revisión administrativa y enviado al flujo del coordinador.",
        }
      : {
          estado: updated.estado,
          mensaje: "Expediente devuelto para subsanación administrativa.",
        };
  },
};
