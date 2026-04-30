"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { useExpedienteDetalle, useRegistrarRevisionAdministrativa } from "@/hooks";
import { DocumentChecklist, EmptyState, StatusBadge } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function RevisionAdministrativaPage() {
  const params = useParams<{ id: string }>();
  const expedienteId = String(params.id);
  const { data, isLoading } = useExpedienteDetalle(expedienteId);
  const revisionMutation = useRegistrarRevisionAdministrativa();
  const [observaciones, setObservaciones] = useState("");

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando revision...</p>;
  }

  if (!data) {
    return <EmptyState title="Expediente no encontrado" description="No hay datos para esta revision." />;
  }

  const handleAction = async (admitir: boolean) => {
    await revisionMutation.mutateAsync({
      expedienteId,
      observaciones,
      admitir,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{data.expediente.titulo}</CardTitle>
            <p className="text-sm text-slate-500">{data.expediente.codigo}</p>
          </div>
          <StatusBadge status={data.expediente.estado} />
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <DocumentChecklist documents={data.expediente.documentos} />

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
              <Alert className="border-green-200 bg-green-50">
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
