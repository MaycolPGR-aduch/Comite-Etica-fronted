"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { useExpedienteDetalle, useReenviarSubsanacion } from "@/hooks";
import { EmptyState, PageHeader, PageSkeleton, useConfirm } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

export default function SubsanacionPage() {
  const params = useParams<{ id: string }>();
  const expedienteId = String(params.id);
  const { data, isLoading } = useExpedienteDetalle(expedienteId);
  const reenviarMutation = useReenviarSubsanacion();
  const confirm = useConfirm();
  const [observacionesConsolidadas, setObservacionesConsolidadas] = useState("");

  if (isLoading) {
    return <PageSkeleton blocks={2} />;
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
    const confirmed = await confirm({
      title: "Reenviar expediente",
      description:
        "El expediente subsanado se reenviará al Comité de Ética para una nueva revisión. ¿Deseas continuar?",
      confirmLabel: "Reenviar",
    });
    if (!confirmed) return;

    try {
      const result = await reenviarMutation.mutateAsync({
        expedienteId,
        observaciones: observacionesConsolidadas,
      });
      toast.success("Subsanación enviada", result.message);
    } catch (error) {
      toast.error(
        "No se pudo reenviar el expediente",
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subsanación de observaciones"
        description="Responde a las observaciones del Comité y reenvía el expediente para una nueva revisión."
      />
      <Card>
        <CardContent className="space-y-4 pt-6">
          {!hasObservaciones ? (
            <Alert>
              <AlertTitle>Sin observaciones pendientes</AlertTitle>
              <AlertDescription>El expediente no requiere subsanacion actualmente.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {data.observaciones.map((observation) => (
                <div key={observation.id} className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-foreground">{observation.seccion}</p>
                  <p className="text-sm text-foreground/80">{observation.comentario}</p>
                </div>
              ))}

              <div className="space-y-2 rounded-md border border-primary/30 bg-secondary p-4">
                <p className="text-sm font-medium text-secondary-foreground">
                  Respuesta consolidada de subsanación
                </p>
                <Textarea
                  placeholder="Escriba aquí su respuesta consolidada para todas las observaciones..."
                  rows={8}
                  value={observacionesConsolidadas}
                  onChange={(event) => setObservacionesConsolidadas(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Redacte una sola respuesta consolidada que atienda todas las observaciones.
                </p>
              </div>
            </div>
          )}

          <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            Carga de nueva version documental (mock):
            <ul className="mt-2 list-disc pl-6">
              <li>Proyecto_v2.pdf</li>
              <li>Consentimiento_v2.pdf</li>
            </ul>
          </div>

          <Button onClick={onSubmit} disabled={!canSubmit}>
            {reenviarMutation.isPending ? "Reenviando..." : "Reenviar expediente"}
          </Button>

          {reenviarMutation.isSuccess ? (
            <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
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
