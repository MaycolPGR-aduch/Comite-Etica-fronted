import type { Expediente, Usuario } from "@/types";

import { evaluacionService } from "./evaluacion.service";
import { expedientesService } from "./expedientes.service";
import { usersService } from "./users.service";

export interface AsignacionPayload {
  expedienteId: string;
  evaluadorIds: string[];
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
    // Solo puede existir 1 evaluador por expediente (alineación de requerimientos).
    const objetivoTotal = 1;

    const evaluaciones = await evaluacionService.list();
    const asignadas = evaluaciones.filter(
      (item) => item.expedienteId === String(expedienteId),
    );

    const restantes = objetivoTotal - asignadas.length;
    if (restantes <= 0) {
      return { message: "Este expediente ya tiene un evaluador asignado." };
    }

    const evaluadoresAsignadosIds = new Set(asignadas.map((item) => item.evaluadorId));
    const candidatos = Array.from(
      new Set(payload.evaluadorIds.map((value) => String(parseNumericId(value, "evaluador")))),
    ).filter((evaluadorId) => !evaluadoresAsignadosIds.has(evaluadorId));

    if (candidatos.length === 0) {
      return { message: "No hay evaluadores nuevos para asignar." };
    }

    const asignacionesEfectivas = candidatos.slice(0, restantes);

    for (const evaluadorId of asignacionesEfectivas) {
      await evaluacionService.asignarEvaluadorManual(String(expedienteId), evaluadorId);
    }

    return {
      message: "Se asignó el evaluador manualmente.",
    };
  },
};
