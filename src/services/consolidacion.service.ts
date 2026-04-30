import { dictamenesMock, evaluacionesMock, expedientesMock } from "@/mocks";
import type { ConsolidacionResultado, Dictamen } from "@/types";

import { clone, wait } from "./service-utils";

export const consolidacionService = {
  async getComparativa(expedienteId: string): Promise<ConsolidacionResultado> {
    await wait();

    const expediente = expedientesMock.find((item) => item.id === expedienteId);
    if (!expediente) {
      throw new Error("Expediente no encontrado.");
    }

    const evaluaciones = evaluacionesMock.filter((item) => item.expedienteId === expedienteId);
    const [evaluacion1, evaluacion2] = evaluaciones;

    if (!evaluacion1 || !evaluacion2) {
      throw new Error("No hay dos evaluaciones completas para comparar.");
    }

    const coincidencias: string[] = [];
    const discrepancias: string[] = [];

    if (evaluacion1.riesgo === evaluacion2.riesgo) {
      coincidencias.push(`Nivel de riesgo: ${evaluacion1.riesgo}`);
    } else {
      discrepancias.push(`Riesgo: ${evaluacion1.riesgo} vs ${evaluacion2.riesgo}`);
    }

    if (evaluacion1.recomendacion === evaluacion2.recomendacion) {
      coincidencias.push(`Recomendacion: ${evaluacion1.recomendacion}`);
    } else {
      discrepancias.push(
        `Recomendacion: ${evaluacion1.recomendacion} vs ${evaluacion2.recomendacion}`,
      );
    }

    const dictamen = dictamenesMock.find((item) => item.expedienteId === expedienteId);

    return clone({
      expediente,
      evaluacion1,
      evaluacion2,
      coincidencias,
      discrepancias,
      dictamen,
    });
  },

  async generarDictamenMock(
    expedienteId: string,
    decisionFinal: Dictamen["decisionFinal"],
    resumen: string,
  ): Promise<Dictamen> {
    await wait();

    return {
      expedienteId,
      decisionFinal,
      resumen,
      fecha: new Date().toISOString(),
      url: `/mock/dictamen-${expedienteId}.pdf`,
    };
  },
};
