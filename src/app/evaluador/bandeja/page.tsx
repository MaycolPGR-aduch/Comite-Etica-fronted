"use client";

import Link from "next/link";

import { useBandejaEvaluador } from "@/hooks";
import type { Expediente } from "@/types";
import { DataTable, StatusBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DEMO_EVALUADOR_ID = "u4";

export default function BandejaEvaluadorPage() {
  const { data = [], isLoading } = useBandejaEvaluador(DEMO_EVALUADOR_ID);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bandeja del evaluador</CardTitle>
        <p className="text-sm text-slate-500">Usuario demo: evaluador1@demo.edu</p>
      </CardHeader>
      <CardContent>
        <DataTable<Expediente>
          data={data}
          loading={isLoading}
          getRowId={(row) => row.id}
          columns={[
            { key: "codigo", header: "Codigo", cell: (row) => row.codigo },
            { key: "titulo", header: "Titulo", cell: (row) => row.titulo },
            { key: "estado", header: "Estado", cell: (row) => <StatusBadge status={row.estado} /> },
            {
              key: "limite",
              header: "Fecha limite",
              cell: (row) =>
                row.fechaLimite ? new Date(row.fechaLimite).toLocaleDateString() : "Sin fecha",
            },
            { key: "prioridad", header: "Prioridad", cell: (row) => row.prioridad },
            {
              key: "accion",
              header: "Accion",
              cell: (row) => (
                <Link className="text-[#0B57B7] hover:underline" href={`/evaluador/evaluacion/${row.id}`}>
                  Evaluar expediente
                </Link>
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
