"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { useExpedienteDetalle, useReenviarSubsanacion } from "@/hooks";
import { EmptyState } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function SubsanacionPage() {
  const params = useParams<{ id: string }>();
  const expedienteId = String(params.id);
  const { data, isLoading } = useExpedienteDetalle(expedienteId);
  const reenviarMutation = useReenviarSubsanacion();
  const [observacionesConsolidadas, setObservacionesConsolidadas] = useState("");

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando observaciones...</p>;
  }

  if (!data) {
    return (
      <EmptyState
        title="Sin datos"
        description="No se encontro informacion para subsanar este expediente."
      />
    );
  }

  const hasObservaciones = data.observaciones.length > 0;
  const canSubmit =
    hasObservaciones &&
    observacionesConsolidadas.trim().length > 0 &&
    !reenviarMutation.isPending;

  const onSubmit = async () => {
    await reenviarMutation.mutateAsync({
      expedienteId,
      observaciones: observacionesConsolidadas,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subsanacion de observaciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasObservaciones ? (
            <Alert>
              <AlertTitle>Sin observaciones pendientes</AlertTitle>
              <AlertDescription>El expediente no requiere subsanacion actualmente.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {data.observaciones.map((observation) => (
                <div key={observation.id} className="space-y-2 rounded-md border border-amber-200 p-4">
                  <p className="text-sm font-medium text-[#08204A]">{observation.seccion}</p>
                  <p className="text-sm text-slate-700">{observation.comentario}</p>
                </div>
              ))}

              <div className="space-y-2 rounded-md border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-[#08204A]">
                  Respuesta consolidada de subsanación
                </p>
                <Textarea
                  placeholder="Escriba aquí su respuesta consolidada para todas las observaciones..."
                  rows={8}
                  value={observacionesConsolidadas}
                  onChange={(event) => setObservacionesConsolidadas(event.target.value)}
                />
                <p className="text-xs text-slate-600">
                  El endpoint backend recibe un solo campo de texto (`observaciones`) con la
                  respuesta consolidada.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-md border border-dashed border-blue-300 p-4 text-sm text-slate-600">
            Carga de nueva version documental (mock):
            <ul className="mt-2 list-disc pl-6">
              <li>Protocolo_v2.pdf</li>
              <li>Consentimiento_v2.pdf</li>
            </ul>
          </div>

          <Button onClick={onSubmit} disabled={!canSubmit}>
            {reenviarMutation.isPending ? "Reenviando..." : "Reenviar expediente"}
          </Button>

          {reenviarMutation.isSuccess ? (
            <Alert className="border-green-200 bg-green-50">
              <AlertTitle>Subsanacion enviada</AlertTitle>
              <AlertDescription>
                {reenviarMutation.data.message}
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
