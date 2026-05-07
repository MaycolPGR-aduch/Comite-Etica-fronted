"use client";

import { useParams } from "next/navigation";

import {
  useAsignarEvaluadores,
  useContextoAsignacion,
  useEvaluaciones,
  useEvaluadoresDisponibles,
} from "@/hooks";
import { EmptyState } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AsignacionEvaluadoresPage() {
  const params = useParams<{ id: string }>();
  const expedienteId = String(params.id);

  const { data: expediente, isLoading: loadingExpediente } = useContextoAsignacion(expedienteId);
  const { data: evaluadores = [], isLoading: loadingEvaluadores } = useEvaluadoresDisponibles();
  const { data: evaluaciones = [], isLoading: loadingEvaluaciones } = useEvaluaciones();
  const asignacionMutation = useAsignarEvaluadores();

  if (loadingExpediente || loadingEvaluadores || loadingEvaluaciones) {
    return <p className="text-sm text-slate-500">Cargando datos de asignacion...</p>;
  }

  if (!expediente) {
    return (
      <EmptyState
        title="Expediente no disponible"
        description="No se puede realizar asignacion para este expediente."
      />
    );
  }

  const asignacionesActuales = evaluaciones.filter(
    (item) => item.expedienteId === expediente.id,
  );

  const evaluadoresPorId = evaluadores.reduce<Record<string, string>>((acc, evaluador) => {
    acc[evaluador.id] = evaluador.nombre;
    return acc;
  }, {});

  const faltantes = Math.max(0, 2 - asignacionesActuales.length);
  const canSubmit = faltantes > 0;

  const submit = async () => {
    if (!canSubmit) return;

    await asignacionMutation.mutateAsync({
      expedienteId,
      cantidad: faltantes,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asignacion de evaluadores</CardTitle>
          <p className="text-sm text-slate-500">
            Con el backend actual, la asignacion es automatica al crear evaluaciones.
          </p>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-600">
            Expediente: <strong>{expediente.codigo}</strong> - {expediente.titulo}
          </p>

          <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
            <p className="font-medium text-[#08204A]">Modo actual: Asignacion automatica</p>
            <p>
              El backend decide el evaluador al ejecutar <code>POST /evaluacion/</code>. Aun no
              existe endpoint para seleccionar evaluadores manualmente.
            </p>
          </div>

          <div className="mt-4 space-y-3 rounded-md border border-slate-200 p-4">
            <p className="text-sm text-slate-700">
              Evaluaciones asignadas: <strong>{asignacionesActuales.length}</strong> / 2
            </p>

            {asignacionesActuales.length > 0 ? (
              <div className="space-y-2">
                {asignacionesActuales.map((asignacion) => (
                  <div key={asignacion.id} className="rounded-md border border-slate-200 p-3 text-sm">
                    <p>
                      <strong>Evaluacion #{asignacion.id}</strong>
                    </p>
                    <p>
                      Evaluador:{" "}
                      {evaluadoresPorId[asignacion.evaluadorId] ?? `Usuario #${asignacion.evaluadorId}`}
                    </p>
                    <p>Estado: {asignacion.estado}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Aun no hay evaluadores asignados para este expediente.
              </p>
            )}

            {!canSubmit ? (
              <p className="text-sm text-emerald-700">
                El expediente ya tiene el maximo de 2 evaluadores.
              </p>
            ) : (
              <p className="text-sm text-amber-700">
                Se asignaran automaticamente {faltantes} evaluador(es) para completar 2.
              </p>
            )}
          </div>

          <Button className="mt-4" disabled={!canSubmit || asignacionMutation.isPending} onClick={submit}>
            {asignacionMutation.isPending ? "Asignando..." : "Asignar automaticamente"}
          </Button>

          {asignacionMutation.isError ? (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertTitle>Error de validacion</AlertTitle>
              <AlertDescription>{asignacionMutation.error.message}</AlertDescription>
            </Alert>
          ) : null}

          {asignacionMutation.isSuccess ? (
            <Alert className="mt-4 border-green-200 bg-green-50">
              <AlertTitle>Asignacion exitosa</AlertTitle>
              <AlertDescription>{asignacionMutation.data.message}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
