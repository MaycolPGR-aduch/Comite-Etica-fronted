"use client";

import Link from "next/link";

import { useBandejaEvaluador } from "@/hooks";
import { DataTable } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const estadoClassMap: Record<string, string> = {
  "En progreso": "bg-sky-100 text-sky-800",
  Completada: "bg-green-100 text-green-800",
  "Conflicto de interes": "bg-amber-100 text-amber-800",
};

export default function BandejaEvaluadorPage() {
  const { data = [], isLoading } = useBandejaEvaluador();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bandeja del evaluador</CardTitle>
        <p className="text-sm text-muted-foreground">
          Evaluaciones asignadas al usuario autenticado.
        </p>
      </CardHeader>
      <CardContent>
        <DataTable
          data={data}
          loading={isLoading}
          getRowId={(row) => row.id}
          searchAccessor={(row) => [
            row.id,
            row.expedienteId,
            row.expedienteTitulo ?? "",
            row.investigadorNombre ?? "",
          ]}
          searchPlaceholder="Buscar por nombre, expediente o título"
          dateAccessor={(row) => row.fechaEnvio ?? null}
          dateLabel="Fecha de envío"
          columns={[
            { key: "id", header: "Evaluacion", cell: (row) => `#${row.id}` },
            { key: "expediente", header: "Expediente", cell: (row) => `#${row.expedienteId}` },
            {
              key: "expedienteTitulo",
              header: "Titulo del expediente",
              cell: (row) => row.expedienteTitulo ?? "Sin titulo",
            },
            {
              key: "estado",
              header: "Estado",
              cell: (row) => (
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                    estadoClassMap[row.estado] ?? "bg-muted text-muted-foreground"
                  }`}
                >
                  {row.estado}
                </span>
              ),
            },
            {
              key: "fecha",
              header: "Fecha",
              cell: (row) =>
                new Date(row.createdAt).toLocaleDateString(),
            },
            {
              key: "accion",
              header: "Accion",
              cell: (row) => (
                <Link
                  className="text-primary hover:underline"
                  href={`/evaluador/evaluacion/${row.id}`}
                >
                  Abrir evaluacion
                </Link>
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
