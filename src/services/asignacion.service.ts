import { expedientesMock, usuariosMock } from "@/mocks";
import type { Expediente, Usuario } from "@/types";

import { clone, wait } from "./service-utils";

export interface AsignacionPayload {
  expedienteId: string;
  evaluadorIds: [string, string];
}

export const asignacionService = {
  async getEvaluadoresDisponibles(): Promise<Usuario[]> {
    await wait();
    return clone(usuariosMock.filter((usuario) => usuario.role === "evaluador"));
  },

  async getExpedienteParaAsignacion(id: string): Promise<Expediente> {
    await wait();
    const expediente = expedientesMock.find((item) => item.id === id);

    if (!expediente) {
      throw new Error("Expediente no encontrado.");
    }

    return clone(expediente);
  },

  async asignarEvaluadores(payload: AsignacionPayload): Promise<{ message: string }> {
    await wait();

    if (payload.evaluadorIds.length !== 2) {
      throw new Error("Debe asignar exactamente 2 evaluadores.");
    }

    const evaluadores = usuariosMock.filter((usuario) =>
      payload.evaluadorIds.includes(usuario.id),
    );

    if (evaluadores.length !== 2) {
      throw new Error("Debe seleccionar evaluadores validos.");
    }

    if (evaluadores.some((evaluador) => evaluador.conflictoInteres)) {
      throw new Error("Un evaluador seleccionado tiene conflicto de interes.");
    }

    return { message: "Evaluadores asignados correctamente." };
  },
};
