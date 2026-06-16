"use client";

import { useMemo, useState } from "react";

import {
  useExportarReporte,
  useReporteBuscarExpedientes,
  useReporteCargaEvaluadores,
  useReporteExpedientesPorEstado,
  useReporteResultadosEmitidos,
  useReporteTiemposAtencion,
} from "@/hooks";
import type {
  ReporteBusquedaExpediente,
  ReporteCargaEvaluador,
  ReporteExpedientesPorEstado,
  ReporteResultadoEmitido,
  ReporteTiempoAtencion,
} from "@/types";
import { DataTable } from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const EXPORT_TYPES = ["csv", "xlsx", "pdf"] as const;

interface ReportesDashboardProps {
  scopeLabel: string;
}

export function ReportesDashboard({ scopeLabel }: ReportesDashboardProps) {
  const [estado, setEstado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [exportType, setExportType] = useState<(typeof EXPORT_TYPES)[number]>("csv");

  const reportesEstado = useReporteExpedientesPorEstado();
  const tiemposAtencion = useReporteTiemposAtencion();
  const cargaEvaluadores = useReporteCargaEvaluadores();
  const resultadosEmitidos = useReporteResultadosEmitidos();
  const busquedaExpedientes = useReporteBuscarExpedientes({
    estado: estado || undefined,
    fechaInicio: fechaInicio || undefined,
    fechaFin: fechaFin || undefined,
  });
  const exportMutation = useExportarReporte();

  const metricas = useMemo(() => {
    const totalExpedientes =
      reportesEstado.data?.reduce((acc, item) => acc + item.total, 0) ?? 0;
    const promedioDias =
      tiemposAtencion.data && tiemposAtencion.data.length > 0
        ? (
            tiemposAtencion.data.reduce((acc, item) => acc + item.dias, 0) /
            tiemposAtencion.data.length
          ).toFixed(1)
        : "0.0";
    const totalEvaluadores = cargaEvaluadores.data?.length ?? 0;
    const totalResultados =
      resultadosEmitidos.data?.reduce((acc, item) => acc + item.total, 0) ?? 0;

    return [
      { id: "rep-total-expedientes", titulo: "Expedientes", valor: totalExpedientes },
      { id: "rep-prom-dias", titulo: "Promedio días", valor: Number(promedioDias) },
      { id: "rep-carga-evaluadores", titulo: "Evaluadores con carga", valor: totalEvaluadores },
      { id: "rep-resultados", titulo: "Resultados emitidos", valor: totalResultados },
    ];
  }, [cargaEvaluadores.data, reportesEstado.data, resultadosEmitidos.data, tiemposAtencion.data]);

  const isAnyLoading =
    reportesEstado.isLoading ||
    tiemposAtencion.isLoading ||
    cargaEvaluadores.isLoading ||
    resultadosEmitidos.isLoading;

  const hasMainError =
    reportesEstado.isError ||
    tiemposAtencion.isError ||
    cargaEvaluadores.isError ||
    resultadosEmitidos.isError;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reportes y analítica ({scopeLabel})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metricas.map((metric) => (
              <MetricCard key={metric.id} title={metric.titulo} value={metric.valor} />
            ))}
          </section>

          {hasMainError ? (
            <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
              <AlertTitle>Error de carga</AlertTitle>
              <AlertDescription>
                {(reportesEstado.error as Error | undefined)?.message ||
                  (tiemposAtencion.error as Error | undefined)?.message ||
                  (cargaEvaluadores.error as Error | undefined)?.message ||
                  (resultadosEmitidos.error as Error | undefined)?.message ||
                  "No se pudieron cargar los reportes principales."}
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expedientes por estado</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<ReporteExpedientesPorEstado>
              data={reportesEstado.data ?? []}
              loading={isAnyLoading}
              getRowId={(row) => `${row.estado}-${row.total}`}
              columns={[
                { key: "estado", header: "Estado", cell: (row) => row.estado },
                { key: "total", header: "Total", cell: (row) => row.total },
              ]}
              emptyTitle="Sin datos de estado"
              emptyDescription="No hay información de expedientes por estado."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Carga por evaluador</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<ReporteCargaEvaluador>
              data={cargaEvaluadores.data ?? []}
              loading={isAnyLoading}
              getRowId={(row) => row.evaluadorId}
              columns={[
                { key: "evaluador", header: "Evaluador ID", cell: (row) => row.evaluadorId },
                { key: "total", header: "Total", cell: (row) => row.total },
              ]}
              emptyTitle="Sin carga registrada"
              emptyDescription="No hay carga de evaluadores para mostrar."
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tiempos de atención</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<ReporteTiempoAtencion>
              data={tiemposAtencion.data ?? []}
              loading={isAnyLoading}
              getRowId={(row) => `${row.expedienteId}-${row.codigo}`}
              columns={[
                { key: "codigo", header: "Código", cell: (row) => row.codigo },
                { key: "dias", header: "Días", cell: (row) => row.dias },
                { key: "estado", header: "Estado", cell: (row) => row.estado },
              ]}
              emptyTitle="Sin tiempos registrados"
              emptyDescription="No hay datos de tiempos de atención."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados emitidos</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<ReporteResultadoEmitido>
              data={resultadosEmitidos.data ?? []}
              loading={isAnyLoading}
              getRowId={(row) => `${row.decision}-${row.total}`}
              columns={[
                { key: "decision", header: "Resultado", cell: (row) => row.decision },
                { key: "total", header: "Total", cell: (row) => row.total },
              ]}
              emptyTitle="Sin resultados"
              emptyDescription="Aún no hay resultados emitidos."
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Búsqueda filtrada de expedientes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              value={estado}
              onChange={(event) => setEstado(event.target.value)}
              placeholder="Estado (opcional)"
              aria-label="Filtro por estado"
            />
            <Input
              type="date"
              value={fechaInicio}
              onChange={(event) => setFechaInicio(event.target.value)}
              aria-label="Fecha inicio"
            />
            <Input
              type="date"
              value={fechaFin}
              onChange={(event) => setFechaFin(event.target.value)}
              aria-label="Fecha fin"
            />
          </div>

          <DataTable<ReporteBusquedaExpediente>
            data={busquedaExpedientes.data ?? []}
            loading={busquedaExpedientes.isLoading}
            getRowId={(row) => row.id}
            searchAccessor={(row) => [
              row.codigoUnico,
              row.tituloProtocolo,
              row.estado,
              row.prioridad,
              row.facultad,
            ]}
            searchPlaceholder="Buscar por código, título, estado o facultad"
            columns={[
              { key: "codigo", header: "Código", cell: (row) => row.codigoUnico || "-" },
              { key: "titulo", header: "Título", cell: (row) => row.tituloProtocolo || "-" },
              { key: "estado", header: "Estado", cell: (row) => row.estado || "-" },
              { key: "prioridad", header: "Prioridad", cell: (row) => row.prioridad || "-" },
              { key: "facultad", header: "Facultad", cell: (row) => row.facultad || "-" },
            ]}
            emptyTitle="Sin expedientes"
            emptyDescription="No hay expedientes para los filtros actuales."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Exportación de reportes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={exportType}
              onChange={(event) => setExportType(event.target.value as (typeof EXPORT_TYPES)[number])}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              aria-label="Formato de exportación"
            >
              {EXPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.toUpperCase()}
                </option>
              ))}
            </select>
            <Button
              onClick={() => exportMutation.mutate(exportType)}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? "Exportando..." : "Exportar"}
            </Button>
          </div>

          {exportMutation.isError ? (
            <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
              <AlertTitle>Error de exportación</AlertTitle>
              <AlertDescription>
                {exportMutation.error instanceof Error
                  ? exportMutation.error.message
                  : "No se pudo exportar el reporte."}
              </AlertDescription>
            </Alert>
          ) : null}

          {exportMutation.isSuccess ? (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
              <AlertTitle>Exportación completada</AlertTitle>
              <AlertDescription>{exportMutation.data.mensaje}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
