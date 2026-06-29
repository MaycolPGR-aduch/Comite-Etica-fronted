import type { ConsolidacionResultado, Dictamen, EvaluacionConsolidacion } from "@/types";

import { dictamenService } from "./dictamen.service";
import { evaluacionService } from "./evaluacion.service";
import { expedientesService } from "./expedientes.service";

const toComparativaEvaluacion = (
  evaluacion: Awaited<ReturnType<typeof evaluacionService.list>>[number],
): EvaluacionConsolidacion => ({
  id: evaluacion.id,
  expedienteId: evaluacion.expedienteId,
  evaluadorId: evaluacion.evaluadorId,
  recomendacion: evaluacion.recommendation ?? "Aprobar con observaciones",
  secciones: parseSecciones(evaluacion.observaciones),
  estado: evaluacion.completa ? "Enviada" : "Borrador",
  updatedAt: evaluacion.createdAt,
  completa: evaluacion.completa,
  conflictoInteres: evaluacion.conflictoInteres,
});

const parseSecciones = (observaciones?: string | null) => {
  if (!observaciones) return [];

  return observaciones
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) {
        return { seccion: `Seccion ${index + 1}`, observacion: line };
      }

      return {
        seccion: line.slice(0, separatorIndex).trim(),
        observacion: line.slice(separatorIndex + 1).trim(),
      };
    });
};

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
      );

    // Toma la evaluación más reciente por evaluador para evitar duplicados históricos.
    const latestByEvaluador = new Map<string, (typeof evaluacionesExpediente)[number]>();
    for (const evaluacion of evaluacionesExpediente) {
      if (!latestByEvaluador.has(evaluacion.evaluadorId)) {
        latestByEvaluador.set(evaluacion.evaluadorId, evaluacion);
      }
    }

    const evaluacionesConsolidacion = Array.from(latestByEvaluador.values())
      .map(toComparativaEvaluacion)
      .sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );

    const evaluacionesCompletasSinConflicto = evaluacionesConsolidacion.filter(
      (item) => item.completa && !item.conflictoInteres,
    );
    const [evaluacion1, evaluacion2] = evaluacionesCompletasSinConflicto.slice(0, 2);
    const evaluacionesPendientes = evaluacionesConsolidacion.filter((item) => !item.completa).length;
    const evaluacionesConConflicto = evaluacionesConsolidacion.filter((item) => item.conflictoInteres).length;
    const puedeGenerarDictamen = Boolean(evaluacion1 && evaluacion2);
    const mensajeValidacion = puedeGenerarDictamen
      ? undefined
      : "Se necesitan 2 evaluaciones enviadas y sin conflicto de interés para generar el dictamen.";

    const coincidencias: string[] = [];
    const discrepancias: string[] = [];

    if (evaluacion1 && evaluacion2) {
      if (evaluacion1.recomendacion === evaluacion2.recomendacion) {
        coincidencias.push(`Recomendación: ${evaluacion1.recomendacion}`);
      } else {
        discrepancias.push(
          `Recomendación: ${evaluacion1.recomendacion} vs ${evaluacion2.recomendacion}`,
        );
      }
    } else {
      if (evaluacionesPendientes > 0) {
        discrepancias.push(`Evaluaciones pendientes de envío: ${evaluacionesPendientes}`);
      }
      if (evaluacionesConConflicto > 0) {
        discrepancias.push(`Evaluaciones con conflicto de interés: ${evaluacionesConConflicto}`);
      }
    }

    return {
      expediente,
      evaluaciones: evaluacionesConsolidacion,
      evaluacion1,
      evaluacion2,
      puedeGenerarDictamen,
      mensajeValidacion,
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
