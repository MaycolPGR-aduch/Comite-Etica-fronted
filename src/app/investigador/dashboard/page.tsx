"use client";

import Link from "next/link";

import { useDashboardInvestigador } from "@/hooks";
import type { Expediente } from "@/types";
import { DataTable, MetricCard, StatusBadge, Timeline } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InvestigadorDashboardPage() {
  const { data, isLoading } = useDashboardInvestigador();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data?.metricas.map((metric) => (
          <MetricCard
            key={metric.id}
            title={metric.titulo}
            value={metric.valor}
            subtitle={metric.variacion}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Expedientes recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable<Expediente>
              data={data?.recientes ?? []}
              loading={isLoading}
              getRowId={(row) => row.id}
              searchAccessor={(row) => [row.codigo, row.titulo, row.estado]}
              searchPlaceholder="Buscar por código, título o estado"
              columns={[
                {
                  key: "codigo",
                  header: "Codigo",
                  cell: (row) => (
                    <Link className="text-[#0B57B7] hover:underline" href={`/investigador/expedientes/${row.id}`}>
                      {row.codigo}
                    </Link>
                  ),
                },
                { key: "titulo", header: "Titulo", cell: (row) => row.titulo },
                {
                  key: "estado",
                  header: "Estado",
                  cell: (row) => <StatusBadge status={row.estado} />,
                },
                {
                  key: "acciones",
                  header: "Acciones",
                  cell: (row) => (
                    <Link
                      className="text-sm text-[#0B57B7] hover:underline"
                      href={`/investigador/expedientes/${row.id}`}
                    >
                      Ver detalle
                    </Link>
                  ),
                },
              ]}
            />
          </CardContent>
        </Card>

        <Timeline events={data?.actividad ?? []} />
      </section>
    </div>
  );
}
