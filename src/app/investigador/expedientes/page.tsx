"use client";

import Link from "next/link";

import { useEliminarExpediente, useExpedientes } from "@/hooks";
import { type Expediente } from "@/types";
import { DataTable, StatusBadge, useConfirm } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

export default function MisExpedientesPage() {
  const { data = [], isLoading } = useExpedientes();
  const eliminarMutation = useEliminarExpediente();
  const confirm = useConfirm();

  const handleEliminar = async (row: Expediente) => {
    const ok = await confirm({
      title: "Eliminar proyecto",
      description: `Se eliminará el borrador "${row.titulo}". Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      variant: "destructive",
    });
    if (!ok) return;

    try {
      await eliminarMutation.mutateAsync(row.id);
      toast.success("Proyecto eliminado", "El borrador se eliminó correctamente.");
    } catch (error) {
      toast.error(
        "No se pudo eliminar",
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mis proyectos</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable<Expediente>
          data={data}
          loading={isLoading}
          getRowId={(row) => row.id}
          searchAccessor={(row) => [row.codigo, row.titulo, row.tipoTramite, row.facultad, row.estado]}
          searchPlaceholder="Buscar por código, título, tipo o facultad"
          dateAccessor={(row) => row.fechaEnvio ?? null}
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
            {
              key: "fechaEnvio",
              header: "Fecha de envío",
              cell: (row) =>
                row.fechaEnvio ? new Date(row.fechaEnvio).toLocaleDateString("es-PE") : "—",
            },
            { key: "estado", header: "Estado", cell: (row) => <StatusBadge status={row.estado} /> },
            {
              key: "acciones",
              header: "Acciones",
              cell: (row) => (
                <div className="flex flex-col items-start gap-1 text-sm">
                  <Link href={`/investigador/expedientes/${row.id}`} className="text-primary hover:underline">
                    Ver detalle
                  </Link>
                  <Link
                    href={`/investigador/expedientes/${row.id}/subsanacion`}
                    className="text-primary hover:underline"
                  >
                    Subsanar
                  </Link>
                  {row.estado === "Borrador" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto px-0 text-destructive hover:text-destructive"
                      onClick={() => handleEliminar(row)}
                      disabled={eliminarMutation.isPending}
                    >
                      Eliminar
                    </Button>
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
