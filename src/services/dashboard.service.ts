import type { Expediente, HistorialEvento, Metrica } from "@/types";

import { expedientesService } from "./expedientes.service";

const sortByDateDesc = (items: Expediente[]) =>
  [...items].sort(
    (a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime(),
  );

const toActividad = (expedientes: Expediente[]): HistorialEvento[] =>
  sortByDateDesc(expedientes).slice(0, 6).map((item) => ({
    id: `actividad-exp-${item.id}`,
    expedienteId: item.id,
    titulo: `Estado: ${item.estado}`,
    descripcion: `${item.codigo} - ${item.titulo}`,
    actor: "Sistema",
    fecha: item.fechaRegistro,
  }));

export const dashboardService = {
  async getInvestigadorDashboard(): Promise<{
    metricas: Metrica[];
    recientes: Expediente[];
    actividad: HistorialEvento[];
  }> {
    const expedientes = await expedientesService.list();
    const recientes = sortByDateDesc(expedientes).slice(0, 5);

    const metricas: Metrica[] = [
      { id: "mi-total", titulo: "Mis expedientes", valor: expedientes.length },
      {
        id: "mi-borrador",
        titulo: "Borradores",
        valor: expedientes.filter((item) => item.estado === "Borrador").length,
      },
      {
        id: "mi-revision",
        titulo: "En revisión",
        valor: expedientes.filter((item) => item.estado === "En revisión administrativa").length,
      },
      {
        id: "mi-asignado",
        titulo: "Asignados",
        valor: expedientes.filter((item) => item.estado === "Asignado").length,
      },
    ];

    return {
      metricas,
      recientes,
      actividad: toActividad(expedientes),
    };
  },

  async getSecretariaResumen(): Promise<{ metricas: Metrica[]; expedientes: Expediente[] }> {
    const expedientes = await expedientesService.list();
    const visibles = expedientes.filter(
      (item) =>
        item.estado === "Enviado" ||
        item.estado === "En revisión administrativa" ||
        item.estado === "Subsanado",
    );

    const metricas: Metrica[] = [
      { id: "sec-total", titulo: "Recibidos", valor: visibles.length },
      {
        id: "sec-enviado",
        titulo: "Pendientes de revisión",
        valor: visibles.filter((item) => item.estado === "Enviado").length,
      },
      {
        id: "sec-revision",
        titulo: "En revisión administrativa",
        valor: visibles.filter((item) => item.estado === "En revisión administrativa").length,
      },
      {
        id: "sec-subsanacion",
        titulo: "En subsanación",
        valor: visibles.filter((item) => item.estado === "Subsanado").length,
      },
    ];

    return { metricas, expedientes: sortByDateDesc(visibles) };
  },

  async getCoordinadorDashboard(): Promise<{ metricas: Metrica[]; expedientes: Expediente[] }> {
    const expedientes = await expedientesService.list();
    const visibles = expedientes.filter(
      (item) =>
        item.estado === "En revisión administrativa" ||
        item.estado === "Asignado" ||
        item.estado === "En evaluación" ||
        item.estado === "Evaluaciones completas",
    );

    const metricas: Metrica[] = [
      {
        id: "coord-revision",
        titulo: "En revisión",
        valor: visibles.filter((item) => item.estado === "En revisión administrativa").length,
      },
      {
        id: "coord-asignado",
        titulo: "Asignados",
        valor: visibles.filter((item) => item.estado === "Asignado").length,
      },
      {
        id: "coord-evaluacion",
        titulo: "En evaluación",
        valor: visibles.filter((item) => item.estado === "En evaluación").length,
      },
      {
        id: "coord-completos",
        titulo: "Evaluaciones completas",
        valor: visibles.filter((item) => item.estado === "Evaluaciones completas").length,
      },
      { id: "coord-total", titulo: "Total visibles", valor: visibles.length },
    ];

    return { metricas, expedientes: sortByDateDesc(visibles) };
  },
};
