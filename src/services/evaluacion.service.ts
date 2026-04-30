import { evaluacionesMock, expedientesMock, usuariosMock } from "@/mocks";
import type {
  Evaluacion,
  Expediente,
  Recommendation,
  RiskLevel,
} from "@/types";

import { clone, wait } from "./service-utils";

export interface EvaluacionPayload {
  expedienteId: string;
  evaluadorId: string;
  riesgo: RiskLevel;
  recomendacion: Recommendation;
  secciones: Array<{ seccion: string; observacion: string }>;
  enviar: boolean;
}

export const evaluacionService = {
  async getBandejaEvaluador(evaluadorId: string): Promise<Expediente[]> {
    await wait();
    return clone(
      expedientesMock.filter((expediente) =>
        expediente.evaluadoresAsignados.includes(evaluadorId),
      ),
    );
  },

  async getContextoEvaluacion(expedienteId: string): Promise<{
    expediente: Expediente;
    evaluacionActual?: Evaluacion;
  }> {
    await wait();

    const expediente = expedientesMock.find((item) => item.id === expedienteId);

    if (!expediente) {
      throw new Error("Expediente no encontrado.");
    }

    const defaultEvaluador = usuariosMock.find((item) => item.role === "evaluador");
    const evaluacionActual = evaluacionesMock.find(
      (item) =>
        item.expedienteId === expedienteId &&
        item.evaluadorId === (defaultEvaluador?.id ?? ""),
    );

    return clone({ expediente, evaluacionActual });
  },

  async saveEvaluacion(
    payload: EvaluacionPayload,
  ): Promise<{ estado: "Borrador" | "Enviada"; message: string }> {
    await wait();

    return payload.enviar
      ? { estado: "Enviada", message: "Evaluacion enviada correctamente." }
      : { estado: "Borrador", message: "Avance guardado." };
  },
};
