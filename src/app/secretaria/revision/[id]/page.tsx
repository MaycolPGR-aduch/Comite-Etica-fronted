"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { useExpedienteDetalle, useRegistrarRevisionAdministrativa } from "@/hooks";
import {
  DocumentChecklist,
  EmptyState,
  PageHeader,
  PageSkeleton,
  StatusBadge,
  useConfirm,
} from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

export default function RevisionAdministrativaPage() {
  const params = useParams<{ id: string }>();
  const expedienteId = String(params.id);
  const { data, isLoading } = useExpedienteDetalle(expedienteId);
  const revisionMutation = useRegistrarRevisionAdministrativa();
  const confirm = useConfirm();
  const [observaciones, setObservaciones] = useState("");

  if (isLoading) {
    return <PageSkeleton blocks={2} />;
  }

  if (!data) {
    return <EmptyState title="Expediente no encontrado" description="No hay datos para esta revision." />;
  }

  const handleAction = async (admitir: boolean) => {
    const confirmed = await confirm({
      title: admitir ? "Admitir expediente" : "Devolver para subsanación",
      description: admitir
        ? "El expediente quedará admitido y pasará a la siguiente etapa del flujo. ¿Deseas continuar?"
        : "El expediente será devuelto al investigador para subsanar las observaciones. ¿Deseas continuar?",
      confirmLabel: admitir ? "Admitir" : "Devolver",
      variant: admitir ? "default" : "destructive",
    });
    if (!confirmed) return;

    try {
      const result = await revisionMutation.mutateAsync({
        expedienteId,
        observaciones,
        admitir,
      });
      toast.success(
        admitir ? "Expediente admitido" : "Expediente devuelto para subsanación",
        result.mensaje,
      );
    } catch (error) {
      toast.error(
        "No se pudo registrar la revisión",
        error instanceof Error ? error.message : undefined,
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Revisión administrativa"
        description="Verifica la documentación y admite o devuelve el expediente para subsanación."
      />
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{data.expediente.titulo}</CardTitle>
            <p className="text-sm text-muted-foreground">{data.expediente.codigo}</p>
          </div>
          <StatusBadge status={data.expediente.estado} />
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentChecklist expedienteId={data.expediente.id} documents={data.expediente.documentos} />

        <Card>
          <CardHeader>
            <CardTitle>Observaciones administrativas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Registrar observaciones de admisibilidad..."
              rows={8}
              value={observaciones}
              onChange={(event) => setObservaciones(event.target.value)}
            />

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => handleAction(true)} disabled={revisionMutation.isPending}>
                Admitir expediente
              </Button>
              <Button
                onClick={() => handleAction(false)}
                disabled={revisionMutation.isPending}
                variant="outline"
              >
                Devolver para subsanar
              </Button>
            </div>

            {revisionMutation.isSuccess ? (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                <AlertTitle>Revision registrada</AlertTitle>
                <AlertDescription>{revisionMutation.data.mensaje}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
