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
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});

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

  const onSubmit = async () => {
    const payload = Object.entries(respuestas)
      .filter(([, respuesta]) => respuesta.trim().length > 0)
      .map(([observacionId, respuesta]) => ({ observacionId, respuesta }));

    await reenviarMutation.mutateAsync({ expedienteId, respuestas: payload });
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
            data.observaciones.map((observation) => (
              <div key={observation.id} className="space-y-2 rounded-md border border-amber-200 p-4">
                <p className="text-sm font-medium text-[#08204A]">{observation.seccion}</p>
                <p className="text-sm text-slate-700">{observation.comentario}</p>
                <Textarea
                  placeholder="Responder observacion..."
                  value={respuestas[observation.id] ?? ""}
                  onChange={(event) =>
                    setRespuestas((current) => ({
                      ...current,
                      [observation.id]: event.target.value,
                    }))
                  }
                />
              </div>
            ))
          )}

          <div className="rounded-md border border-dashed border-blue-300 p-4 text-sm text-slate-600">
            Carga de nueva version documental (mock):
            <ul className="mt-2 list-disc pl-6">
              <li>Protocolo_v2.pdf</li>
              <li>Consentimiento_v2.pdf</li>
            </ul>
          </div>

          <Button onClick={onSubmit} disabled={!hasObservaciones || reenviarMutation.isPending}>
            {reenviarMutation.isPending ? "Reenviando..." : "Reenviar expediente"}
          </Button>

          {reenviarMutation.isSuccess ? (
            <Alert className="border-green-200 bg-green-50">
              <AlertTitle>Subsanacion enviada</AlertTitle>
              <AlertDescription>
                Se registró el reenvío para nueva revisión del expediente.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
