"use client";

import Link from "next/link";

import { useBandejaSecretaria } from "@/hooks";
import type { Expediente } from "@/types";
import { DataTable, MetricCard, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BandejaSecretariaPage() {
  const { data, isLoading } = useBandejaSecretaria();

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data?.metricas.map((metric) => (
          <MetricCard key={metric.id} title={metric.titulo} value={metric.valor} />
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Expedientes recibidos</CardTitle>
        </CardHeader>
        <CardContent>
        <DataTable<Expediente>
          data={data?.expedientes ?? []}
          loading={isLoading}
          getRowId={(row) => row.id}
          searchAccessor={(row) => [row.codigo, row.titulo, row.facultad, row.estado]}
          searchPlaceholder="Buscar por código, título o facultad"
          columns={[
            { key: "codigo", header: "Codigo", cell: (row) => row.codigo },
            { key: "titulo", header: "Titulo", cell: (row) => row.titulo },
              { key: "facultad", header: "Facultad", cell: (row) => row.facultad },
              { key: "estado", header: "Estado", cell: (row) => <StatusBadge status={row.estado} /> },
              {
                key: "acciones",
                header: "Acciones",
                cell: (row) => (
                  <Link className="text-primary hover:underline" href={`/secretaria/revision/${row.id}`}>
                    Revisar expediente
                  </Link>
                ),
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
