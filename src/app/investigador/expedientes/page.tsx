"use client";

import Link from "next/link";

import { useExpedientes } from "@/hooks";
import { EXPEDIENTE_STATUSES, type Expediente, type ExpedienteStatus } from "@/types";
import { DataTable, StatusBadge, StatusLegend } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ESTADOS_CON_SUBSANACION = new Set<ExpedienteStatus>([
  "Observado por admisibilidad",
  "Observado",
]);

export default function MisExpedientesPage() {
  const { data = [], isLoading } = useExpedientes();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle>Mis expedientes</CardTitle>
        <StatusLegend />
      </CardHeader>
      <CardContent>
        <DataTable<Expediente>
          data={data}
          loading={isLoading}
          getRowId={(row) => row.id}
          searchAccessor={(row) => [row.codigo, row.titulo, row.tipoTramite, row.facultad, row.estado]}
          searchPlaceholder="Buscar por código, título, tipo o facultad"
          statusAccessor={(row) => row.estado}
          statusOptions={[...EXPEDIENTE_STATUSES]}
          dateAccessor={(row) => row.fechaRegistro}
          columns={[
            {
              key: "codigo",
              header: "Codigo",
              cell: (row) => (
                <Link className="text-primary hover:underline" href={`/investigador/expedientes/${row.id}`}>
                  {row.codigo}
                </Link>
              ),
            },
            { key: "titulo", header: "Titulo", cell: (row) => row.titulo },
            { key: "tipo", header: "Tipo", cell: (row) => row.tipoTramite },
            { key: "estado", header: "Estado", cell: (row) => <StatusBadge status={row.estado} /> },
            {
              key: "fecha",
              header: "Fecha de creación",
              cell: (row) => new Date(row.fechaRegistro).toLocaleDateString(),
            },
            {
              key: "acciones",
              header: "Acciones",
              cell: (row) => (
                <div className="flex flex-col gap-1 text-sm">
                  <Link href={`/investigador/expedientes/${row.id}`} className="text-primary hover:underline">
                    Ver detalle
                  </Link>
                  {ESTADOS_CON_SUBSANACION.has(row.estado) ? (
                    <Link
                      href={`/investigador/expedientes/${row.id}/subsanacion`}
                      className="text-primary hover:underline"
                    >
                      Subsanar
                    </Link>
                  ) : null}
                </div>
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
