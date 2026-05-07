"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { useExpedienteDetalle } from "@/hooks";
import { DocumentChecklist, EmptyState, StatusBadge, Timeline } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DetalleExpedientePage() {
  const params = useParams<{ id: string }>();
  const expedienteId = String(params.id);
  const { data, isLoading, error } = useExpedienteDetalle(expedienteId);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando detalle...</p>;
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Expediente no disponible"
        description="No se encontro informacion para el expediente seleccionado."
      />
    );
  }

  const { expediente, timeline, observaciones, dictamen } = data;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{expediente.titulo}</CardTitle>
            <p className="text-sm text-slate-500">{expediente.codigo}</p>
          </div>
          <StatusBadge status={expediente.estado} />
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p>
            <strong>Investigador:</strong> {expediente.investigadorPrincipal}
          </p>
          <p>
            <strong>Tipo de tramite:</strong> {expediente.tipoTramite}
          </p>
          <p>
            <strong>Facultad:</strong> {expediente.facultad}
          </p>
          <p>
            <strong>Prioridad:</strong> {expediente.prioridad}
          </p>
          <p>
            <strong>Fecha registro:</strong> {new Date(expediente.fechaRegistro).toLocaleDateString()}
          </p>
          {expediente.fechaLimite ? (
            <p>
              <strong>Fecha limite:</strong> {new Date(expediente.fechaLimite).toLocaleDateString()}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentChecklist documents={expediente.documentos} />

        <Card>
          <CardHeader>
            <CardTitle>Observaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {observaciones.length === 0 ? (
              <p className="text-sm text-slate-500">No hay observaciones activas.</p>
            ) : (
              observaciones.map((observation) => (
                <div key={observation.id} className="rounded-md border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm font-medium">{observation.seccion}</p>
                  <p className="text-sm text-slate-700">{observation.comentario}</p>
                </div>
              ))
            )}

            <Link
              className="inline-block text-sm text-[#0B57B7] hover:underline"
              href={`/investigador/expedientes/${expediente.id}/subsanacion`}
            >
              Ir a subsanacion
            </Link>

            {dictamen ? (
              <a className="block text-sm text-[#0B57B7] hover:underline" href={dictamen.url}>
                Descargar dictamen
              </a>
            ) : (
              <p className="text-sm text-slate-500">Dictamen aún no disponible.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Timeline events={timeline} />
    </div>
  );
}
