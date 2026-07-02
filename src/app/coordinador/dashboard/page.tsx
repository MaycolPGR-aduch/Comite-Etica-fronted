"use client";

import Link from "next/link";

import { useDashboardCoordinador } from "@/hooks";
import { type Expediente } from "@/types";
import { DataTable, MetricCard, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardCoordinadorPage() {
  const { data, isLoading } = useDashboardCoordinador();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {data?.metricas.map((metric) => (
          <MetricCard key={metric.id} title={metric.titulo} value={metric.valor} />
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Seguimiento de expedientes admitidos</CardTitle>
        </CardHeader>
        <CardContent>
        <DataTable<Expediente>
          data={data?.expedientes ?? []}
          loading={isLoading}
          getRowId={(row) => row.id}
          searchAccessor={(row) => [row.investigadorPrincipal, row.codigo, row.titulo]}
          searchPlaceholder="Buscar por nombre, código o título"
          dateAccessor={(row) => row.fechaEnvio ?? null}
          columns={[
            { key: "codigo", header: "Codigo", cell: (row) => row.codigo },
            { key: "titulo", header: "Titulo", cell: (row) => row.titulo },
              { key: "solicitante", header: "Solicitante", cell: (row) => row.investigadorPrincipal },
              { key: "estado", header: "Estado", cell: (row) => <StatusBadge status={row.estado} /> },
              {
                key: "acciones",
                header: "Acciones",
                cell: (row) => (
                  <div className="flex flex-col gap-1 text-sm">
                    <Link className="text-primary hover:underline" href={`/coordinador/asignacion/${row.id}`}>
                      Asignar evaluadores
                    </Link>
                  </div>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
