import type { ConsolidacionResultado, Dictamen, Evaluacion } from "@/types";

import { dictamenService } from "./dictamen.service";
import { evaluacionService } from "./evaluacion.service";
import { expedientesService } from "./expedientes.service";

const toComparativaEvaluacion = (
  evaluacion: Awaited<ReturnType<typeof evaluacionService.list>>[number],
): Evaluacion => ({
  id: evaluacion.id,
  expedienteId: evaluacion.expedienteId,
  evaluadorId: evaluacion.evaluadorId,
  riesgo: evaluacion.nivelRiesgo ?? "Medio",
  recomendacion: evaluacion.recommendation ?? "Aprobar con observaciones",
  secciones: [],
  estado: evaluacion.completa ? "Enviada" : "Borrador",
  updatedAt: evaluacion.createdAt,
});

export const consolidacionService = {
  async getComparativa(expedienteId: string): Promise<ConsolidacionResultado> {
    const [{ expediente }, evaluaciones, dictamenes] = await Promise.all([
      expedientesService.getById(expedienteId),
      evaluacionService.list(),
      dictamenService.listByExpediente(expedienteId),
    ]);

    const evaluacionesExpediente = evaluaciones
      .filter((item) => item.expedienteId === expedienteId)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 2)
      .map(toComparativaEvaluacion);

    const [evaluacion1, evaluacion2] = evaluacionesExpediente;

    if (!evaluacion1 || !evaluacion2) {
      throw new Error("No hay dos evaluaciones para consolidar este expediente.");
    }

    const coincidencias: string[] = [];
    const discrepancias: string[] = [];

    if (evaluacion1.riesgo === evaluacion2.riesgo) {
      coincidencias.push(`Nivel de riesgo: ${evaluacion1.riesgo}`);
    } else {
      discrepancias.push(`Riesgo: ${evaluacion1.riesgo} vs ${evaluacion2.riesgo}`);
    }

    if (evaluacion1.recomendacion === evaluacion2.recomendacion) {
      coincidencias.push(`Recomendación: ${evaluacion1.recomendacion}`);
    } else {
      discrepancias.push(
        `Recomendación: ${evaluacion1.recomendacion} vs ${evaluacion2.recomendacion}`,
      );
    }

    return {
      expediente,
      evaluacion1,
      evaluacion2,
      coincidencias,
      discrepancias,
      dictamen: dictamenes[0],
    };
  },

  async listDictamenes(): Promise<Dictamen[]> {
    return dictamenService.list();
  },

  async getDictamenById(dictamenId: string): Promise<Dictamen> {
    return dictamenService.getById(dictamenId);
  },

  async getDictamenesByExpediente(expedienteId: string): Promise<Dictamen[]> {
    return dictamenService.listByExpediente(expedienteId);
  },

  async generarDictamen(payload: {
    expedienteId: string;
    decisionFinal: Dictamen["decisionFinal"];
    resumen: string;
  }): Promise<Dictamen> {
    return dictamenService.create({
      expedienteId: payload.expedienteId,
      contenido: payload.resumen,
      decisionFinal: payload.decisionFinal,
    });
  },

  async actualizarDictamen(
    dictamenId: string,
    payload: { contenido?: string; firmado?: boolean },
  ): Promise<Dictamen> {
    return dictamenService.update(dictamenId, payload);
  },

  async firmarDictamen(dictamenId: string): Promise<{ message: string; numero?: string }> {
    return dictamenService.firmar(dictamenId);
  },
};
