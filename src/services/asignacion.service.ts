import type { Expediente, Usuario } from "@/types";

import { evaluacionService } from "./evaluacion.service";
import { expedientesService } from "./expedientes.service";
import { usersService } from "./users.service";

export interface AsignacionPayload {
  expedienteId: string;
  cantidad?: number;
}

const parseNumericId = (value: string, entityName: string): number => {
  const direct = Number(value);
  if (Number.isFinite(direct)) {
    return direct;
  }

  const digits = value.match(/\d+/g)?.join("");
  const fallback = Number(digits);

  if (Number.isFinite(fallback)) {
    return fallback;
  }

  throw new Error(`El identificador del ${entityName} no es valido.`);
};

export const asignacionService = {
  async getEvaluadoresDisponibles(): Promise<Usuario[]> {
    const users = await usersService.list();

    return users.filter(
      (usuario) => usuario.role === "evaluador" && (usuario.activo ?? true),
    );
  },

  async getExpedienteParaAsignacion(id: string): Promise<Expediente> {
    const expedienteId = parseNumericId(id, "expediente");
    const detalle = await expedientesService.getById(String(expedienteId));
    return detalle.expediente;
  },

  async asignarEvaluadores(payload: AsignacionPayload): Promise<{ message: string }> {
    const expedienteId = parseNumericId(payload.expedienteId, "expediente");
    const objetivoTotal = 2;

    const evaluaciones = await evaluacionService.list();
    const asignadas = evaluaciones.filter(
      (item) => item.expedienteId === String(expedienteId),
    );

    const restantes = objetivoTotal - asignadas.length;
    const solicitadas = Math.min(payload.cantidad ?? restantes, Math.max(restantes, 0));

    if (restantes <= 0 || solicitadas <= 0) {
      return { message: "Este expediente ya tiene 2 evaluadores asignados." };
    }

    for (let index = 0; index < solicitadas; index += 1) {
      await evaluacionService.create(String(expedienteId));
    }

    return {
      message:
        solicitadas === 1
          ? "Se asigno 1 evaluador automaticamente."
          : `Se asignaron ${solicitadas} evaluadores automaticamente.`,
    };
  },
};
