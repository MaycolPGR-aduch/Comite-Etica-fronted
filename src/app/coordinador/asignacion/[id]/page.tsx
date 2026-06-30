"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  useAsignarEvaluadores,
  useContextoAsignacion,
  useEvaluaciones,
  useEvaluadoresDisponibles,
} from "@/hooks";
import { EmptyState, PageHeader, PageSkeleton, useConfirm } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

export default function AsignacionEvaluadoresPage() {
  const params = useParams<{ id: string }>();
  const expedienteId = String(params.id);
  const [selectedEvaluadorIds, setSelectedEvaluadorIds] = useState<string[]>([]);

  const { data: expediente, isLoading: loadingExpediente } = useContextoAsignacion(expedienteId);
  const { data: evaluadores = [], isLoading: loadingEvaluadores } = useEvaluadoresDisponibles();
  const { data: evaluaciones = [], isLoading: loadingEvaluaciones } = useEvaluaciones();
  const asignacionMutation = useAsignarEvaluadores();
  const confirm = useConfirm();

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

  const faltantes = Math.max(0, 1 - asignacionesActuales.length);
  const evaluadoresDisponiblesParaAsignar = useMemo(
    () => evaluadores.filter((item) => !evaluadoresYaAsignados.has(item.id)),
    [evaluadores, evaluadoresYaAsignados],
  );
  const canSelect = faltantes > 0 && evaluadoresDisponiblesParaAsignar.length > 0;
  const canSubmit = canSelect && selectedEvaluadorIds.length === faltantes;

  const submit = async () => {
    if (!canSubmit) return;

    const confirmed = await confirm({
      title: "Asignar evaluadores",
      description: `Se asignarán ${selectedEvaluadorIds.length} evaluador(es) a este expediente. ¿Deseas continuar?`,
      confirmLabel: "Asignar",
    });
    if (!confirmed) return;

    try {
      const result = await asignacionMutation.mutateAsync({
        expedienteId,
        evaluadorIds: selectedEvaluadorIds,
      });
      setSelectedEvaluadorIds([]);
      toast.success("Evaluadores asignados", result.message);
    } catch (error) {
      toast.error(
        "No se pudo asignar evaluadores",
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  if (loadingExpediente || loadingEvaluadores || loadingEvaluaciones) {
    return <PageSkeleton blocks={2} />;
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
      <PageHeader
        title="Asignación de evaluadores"
        description="Seleccione evaluadores para la asignación manual del expediente."
      />
      <Card>
        <CardContent className="pt-6">
          <p className="mb-4 text-sm text-muted-foreground">
            Expediente: <strong className="text-foreground">{expediente.codigo}</strong> - {expediente.titulo}
          </p>

          <div className="space-y-3 rounded-md border border-border p-4">
            <p className="text-sm text-foreground">
              Evaluaciones asignadas: <strong>{asignacionesActuales.length}</strong> / 1
            </p>

            {asignacionesActuales.length > 0 ? (
              <div className="space-y-2">
                {asignacionesActuales.map((asignacion) => (
                  <div key={asignacion.id} className="rounded-md border border-border p-3 text-sm">
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
              <p className="text-sm text-muted-foreground">
                Aun no hay evaluadores asignados para este expediente.
              </p>
            )}

            {faltantes <= 0 ? (
              <p className="text-sm text-emerald-600">El expediente ya tiene su evaluador asignado.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-amber-600">
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
                          className="flex items-center gap-3 rounded-md border border-border p-3 text-sm transition-colors hover:bg-muted/40"
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
                          <span className="text-muted-foreground">({evaluador.correo})</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-destructive">No hay evaluadores disponibles para asignar.</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Seleccionados: {selectedEvaluadorIds.length} / {faltantes}
                </p>
              </div>
            )}
          </div>

          <Button className="mt-4" disabled={!canSubmit || asignacionMutation.isPending} onClick={submit}>
            {asignacionMutation.isPending ? "Asignando..." : "Asignar seleccionados"}
          </Button>

          {asignacionMutation.isError ? (
            <Alert className="mt-4 border-destructive/30 bg-destructive/5 text-destructive">
              <AlertTitle>Error de validacion</AlertTitle>
              <AlertDescription>{asignacionMutation.error.message}</AlertDescription>
            </Alert>
          ) : null}

          {asignacionMutation.isSuccess ? (
            <Alert className="mt-4 border-emerald-200 bg-emerald-50 text-emerald-900">
              <AlertTitle>Asignacion exitosa</AlertTitle>
              <AlertDescription>{asignacionMutation.data.message}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
