"use client";

import Link from "next/link";

import { useExpedientes } from "@/hooks";
import { EXPEDIENTE_STATUSES, type Expediente } from "@/types";
import { DataTable, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MisExpedientesPage() {
  const { data = [], isLoading } = useExpedientes();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis expedientes</CardTitle>
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
            { key: "tipo", header: "Tipo", cell: (row) => row.tipoTramite },
            { key: "estado", header: "Estado", cell: (row) => <StatusBadge status={row.estado} /> },
            {
              key: "acciones",
              header: "Acciones",
              cell: (row) => (
                <div className="flex flex-col gap-1 text-sm">
                  <Link href={`/investigador/expedientes/${row.id}`} className="text-[#0B57B7] hover:underline">
                    Ver detalle
                  </Link>
                  <Link
                    href={`/investigador/expedientes/${row.id}/subsanacion`}
                    className="text-[#0B57B7] hover:underline"
                  >
                    Subsanar
                  </Link>
                  <span className="text-slate-500">Dictamen disponible cuando sea emitido</span>
                </div>
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
