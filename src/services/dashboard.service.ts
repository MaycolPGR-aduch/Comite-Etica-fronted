import {
  expedientesMock,
  historialMock,
  metricasCoordinadorMock,
  metricasInvestigadorMock,
  metricasSecretariaMock,
} from "@/mocks";
import type { Expediente, HistorialEvento, Metrica } from "@/types";

import { clone, wait } from "./service-utils";

export const dashboardService = {
  async getInvestigadorDashboard(): Promise<{
    metricas: Metrica[];
    recientes: Expediente[];
    actividad: HistorialEvento[];
  }> {
    await wait();

    const recientes = expedientesMock.slice(0, 5);
    const actividad = historialMock.slice(0, 6);

    return clone({
      metricas: metricasInvestigadorMock,
      recientes,
      actividad,
    });
  },

  async getSecretariaResumen(): Promise<{ metricas: Metrica[]; expedientes: Expediente[] }> {
    await wait();

    const expedientes = expedientesMock.filter(
      (item) =>
        item.estado === "Enviado" ||
        item.estado === "En revisión administrativa" ||
        item.estado === "Observado por admisibilidad" ||
        item.estado === "Subsanado",
    );

    return clone({ metricas: metricasSecretariaMock, expedientes });
  },

  async getCoordinadorDashboard(): Promise<{ metricas: Metrica[]; expedientes: Expediente[] }> {
    await wait();

    const expedientes = expedientesMock.filter((item) =>
      ["Admitido", "Asignado", "En evaluación", "Evaluaciones completas"].includes(item.estado),
    );

    return clone({ metricas: metricasCoordinadorMock, expedientes });
  },
};
