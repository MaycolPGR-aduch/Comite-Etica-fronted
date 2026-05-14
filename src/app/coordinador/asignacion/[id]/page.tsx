"use client";

import { useMemo, useState } from "react";
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
  const [selectedEvaluadorIds, setSelectedEvaluadorIds] = useState<string[]>([]);

  const { data: expediente, isLoading: loadingExpediente } = useContextoAsignacion(expedienteId);
  const { data: evaluadores = [], isLoading: loadingEvaluadores } = useEvaluadoresDisponibles();
  const { data: evaluaciones = [], isLoading: loadingEvaluaciones } = useEvaluaciones();
  const asignacionMutation = useAsignarEvaluadores();

  const expedienteActualId = expediente?.id ?? "";

  const asignacionesActuales = useMemo(
    () => evaluaciones.filter((item) => item.expedienteId === expedienteActualId),
    [evaluaciones, expedienteActualId],
  );
  const evaluadoresYaAsignados = useMemo(
    () => new Set(asignacionesActuales.map((item) => item.evaluadorId)),
    [asignacionesActuales],
  );

  const evaluadoresPorId = evaluadores.reduce<Record<string, string>>((acc, evaluador) => {
    acc[evaluador.id] = evaluador.nombre;
    return acc;
  }, {});

  const faltantes = Math.max(0, 2 - asignacionesActuales.length);
  const evaluadoresDisponiblesParaAsignar = useMemo(
    () => evaluadores.filter((item) => !evaluadoresYaAsignados.has(item.id)),
    [evaluadores, evaluadoresYaAsignados],
  );
  const canSelect = faltantes > 0 && evaluadoresDisponiblesParaAsignar.length > 0;
  const canSubmit = canSelect && selectedEvaluadorIds.length === faltantes;

  const submit = async () => {
    if (!canSubmit) return;

    await asignacionMutation.mutateAsync({
      expedienteId,
      evaluadorIds: selectedEvaluadorIds,
    });
  };

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asignacion de evaluadores</CardTitle>
          <p className="text-sm text-slate-500">
            Seleccione evaluadores para asignación manual del expediente.
          </p>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-600">
            Expediente: <strong>{expediente.codigo}</strong> - {expediente.titulo}
          </p>

          <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700">
            <p className="font-medium text-[#08204A]">Modo actual: Asignacion manual</p>
            <p>
              El frontend utiliza <code>POST /evaluacion/expediente/{"{id}"}/asignar</code> para
              asignar evaluadores por <code>evaluador_id</code>.
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

            {faltantes <= 0 ? (
              <p className="text-sm text-emerald-700">El expediente ya tiene el maximo de 2 evaluadores.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-amber-700">
                  Seleccione {faltantes} evaluador(es) para completar la asignación.
                </p>
                {canSelect ? (
                  <div className="grid gap-2">
                    {evaluadoresDisponiblesParaAsignar.map((evaluador) => {
                      const checked = selectedEvaluadorIds.includes(evaluador.id);
                      const selectionFull = selectedEvaluadorIds.length >= faltantes;
                      const disabled = !checked && selectionFull;

                      return (
                        <label
                          key={evaluador.id}
                          className="flex items-center gap-3 rounded-md border border-slate-200 p-3 text-sm"
                        >
                          <input
                            checked={checked}
                            disabled={disabled}
                            type="checkbox"
                            onChange={(event) => {
                              setSelectedEvaluadorIds((current) => {
                                if (event.target.checked) {
                                  if (current.includes(evaluador.id)) {
                                    return current;
                                  }
                                  return [...current, evaluador.id];
                                }

                                return current.filter((id) => id !== evaluador.id);
                              });
                            }}
                          />
                          <span>{evaluador.nombre}</span>
                          <span className="text-slate-500">({evaluador.correo})</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-red-600">No hay evaluadores disponibles para asignar.</p>
                )}
                <p className="text-xs text-slate-500">
                  Seleccionados: {selectedEvaluadorIds.length} / {faltantes}
                </p>
              </div>
            )}
          </div>

          <Button className="mt-4" disabled={!canSubmit || asignacionMutation.isPending} onClick={submit}>
            {asignacionMutation.isPending ? "Asignando..." : "Asignar seleccionados"}
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
