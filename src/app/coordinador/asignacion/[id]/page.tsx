"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import {
  useAsignarEvaluadores,
  useContextoAsignacion,
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
  const asignacionMutation = useAsignarEvaluadores();

  const [selected, setSelected] = useState<string[]>([]);

  if (loadingExpediente || loadingEvaluadores) {
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

  const toggleSelection = (id: string) => {
    setSelected((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= 2) {
        return current;
      }

      return [...current, id];
    });
  };

  const canSubmit = selected.length === 2;

  const submit = async () => {
    if (!canSubmit) return;

    await asignacionMutation.mutateAsync({
      expedienteId,
      evaluadorIds: [selected[0], selected[1]],
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asignacion de evaluadores</CardTitle>
          <p className="text-sm text-slate-500">
            Seleccione manualmente exactamente dos evaluadores sin conflicto de interes.
          </p>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-600">
            Expediente: <strong>{expediente.codigo}</strong> - {expediente.titulo}
          </p>

          <div className="space-y-3">
            {evaluadores.map((evaluador) => {
              const active = selected.includes(evaluador.id);
              return (
                <button
                  key={evaluador.id}
                  type="button"
                  className={`w-full rounded-md border p-4 text-left transition ${
                    active ? "border-blue-400 bg-blue-50" : "border-slate-200"
                  }`}
                  onClick={() => toggleSelection(evaluador.id)}
                >
                  <p className="font-medium text-[#08204A]">{evaluador.nombre}</p>
                  <p className="text-sm text-slate-600">Especialidad: {evaluador.especialidad}</p>
                  <p className="text-sm text-slate-600">Carga actual: {evaluador.cargaTrabajo ?? 0} expedientes</p>
                  <p
                    className={`text-sm ${
                      evaluador.conflictoInteres ? "text-red-600" : "text-green-700"
                    }`}
                  >
                    {evaluador.conflictoInteres ? "Con conflicto de interes" : "Sin conflicto de interes"}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
            <p>Seleccionados: {selected.length} / 2</p>
            {!canSubmit ? <p className="text-amber-700">Debe seleccionar exactamente 2.</p> : null}
          </div>

          <Button className="mt-4" disabled={!canSubmit || asignacionMutation.isPending} onClick={submit}>
            Confirmar asignacion
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
