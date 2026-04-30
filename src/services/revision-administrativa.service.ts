import { expedientesMock, observacionesMock } from "@/mocks";
import type { Expediente, Observacion } from "@/types";

import { clone, wait } from "./service-utils";

export interface RevisionAdministrativaPayload {
  expedienteId: string;
  observaciones: string;
  admitir: boolean;
}

export const revisionAdministrativaService = {
  async getPendientes(): Promise<Expediente[]> {
    await wait();
    return clone(
      expedientesMock.filter(
        (expediente) =>
          expediente.estado === "En revisión administrativa" ||
          expediente.estado === "Subsanado",
      ),
    );
  },

  async getObservaciones(expedienteId: string): Promise<Observacion[]> {
    await wait();
    return clone(observacionesMock.filter((item) => item.expedienteId === expedienteId));
  },

  async registrarRevision(
    payload: RevisionAdministrativaPayload,
  ): Promise<{ estado: string; mensaje: string }> {
    await wait();

    return payload.admitir
      ? { estado: "Admitido", mensaje: "Expediente admitido correctamente." }
      : {
          estado: "Observado por admisibilidad",
          mensaje: "Expediente devuelto para subsanacion administrativa.",
        };
  },
};
