"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import {
  useActualizarDictamen,
  useConsolidacion,
  useFirmarDictamen,
  useGenerarDictamen,
} from "@/hooks";
import { EmptyState, PageHeader, PageSkeleton, useConfirm } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

export default function ConsolidacionDictamenPage() {
  const params = useParams<{ id: string }>();
  const expedienteId = String(params.id);
  const { data, isLoading, error } = useConsolidacion(expedienteId);
  const generarMutation = useGenerarDictamen();
  const actualizarMutation = useActualizarDictamen();
  const firmarMutation = useFirmarDictamen();
  const confirm = useConfirm();
  const [actionError, setActionError] = useState<string | null>(null);
  const [draft, setDraft] = useState<{
    decision: "Aprobado" | "Observado";
    resumen: string;
  } | null>(null);

  const resolveActionError = (error: unknown) =>
    error instanceof Error ? error.message : "No se pudo completar la operación.";

  if (isLoading) {
    return <PageSkeleton blocks={2} />;
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Consolidacion no disponible"
        description="No se pudo cargar la consolidación del expediente."
      />
    );
  }

  const decision = draft?.decision ?? data.dictamen?.decisionFinal ?? "Aprobado";
  const resumen = draft?.resumen ?? data.dictamen?.resumen ?? "";
  const requiereDosEvaluaciones = !data.puedeGenerarDictamen;

  const generarDictamen = async () => {
    const confirmed = await confirm({
      title: "Generar y comunicar dictamen",
      description: `Se generará el dictamen con la decisión "${decision}" y se comunicará el resultado del expediente. ¿Deseas continuar?`,
      confirmLabel: "Generar dictamen",
    });
    if (!confirmed) return;

    setActionError(null);
    try {
      const result = await generarMutation.mutateAsync({
        expedienteId,
        decisionFinal: decision,
        resumen,
      });
      toast.success("Dictamen generado", `Resultado comunicado: ${result.decisionFinal}.`);
    } catch (error) {
      const message = resolveActionError(error);
      setActionError(message);
      toast.error("No se pudo generar el dictamen", message);
    }
  };

  const actualizarDictamen = async () => {
    if (!data?.dictamen?.id) return;
    setActionError(null);
    try {
      await actualizarMutation.mutateAsync({
        dictamenId: data.dictamen.id,
        expedienteId,
        contenido: resumen,
      });
      toast.success("Dictamen actualizado", "Se guardaron los cambios del dictamen.");
    } catch (error) {
      const message = resolveActionError(error);
      setActionError(message);
      toast.error("No se pudo actualizar el dictamen", message);
    }
  };

  const firmarDictamen = async () => {
    if (!data?.dictamen?.id) return;

    const confirmed = await confirm({
      title: "Firmar dictamen",
      description:
        "La firma del dictamen es una acción definitiva e irreversible. Una vez firmado, no podrá modificarse. ¿Deseas firmar?",
      confirmLabel: "Firmar dictamen",
    });
    if (!confirmed) return;

    setActionError(null);
    try {
      const result = await firmarMutation.mutateAsync({
        dictamenId: data.dictamen.id,
        expedienteId,
      });
      toast.success(
        "Dictamen firmado",
        `${result.message}${result.numero ? ` (${result.numero})` : ""}`,
      );
    } catch (error) {
      const message = resolveActionError(error);
      setActionError(message);
      toast.error("No se pudo firmar el dictamen", message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consolidación y dictamen final"
        description={`Expediente ${data.expediente.codigo} · ${data.expediente.titulo}`}
      />

      {data.dictamen ? (
        <p className="-mt-2 text-sm text-muted-foreground">
          Dictamen actual: {data.dictamen.numero ?? "Sin número"} · Tipo:{" "}
          {data.dictamen.tipo ?? data.dictamen.decisionFinal} ·{" "}
          {data.dictamen.firmado ? "Firmado" : "Pendiente de firma"}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comparativa de evaluadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.evaluaciones.length === 0 ? (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTitle>Sin evaluaciones registradas</AlertTitle>
                <AlertDescription>
                  Aún no hay evaluaciones para este expediente.
                </AlertDescription>
              </Alert>
            ) : null}

            {data.evaluaciones.map((evaluacion, index) => (
              <div key={evaluacion.id} className="rounded-md border border-border p-3">
                <p className="font-medium">Evaluador {index + 1}</p>
                <p className="text-sm text-muted-foreground">
                  Recomendacion: {evaluacion.recomendacion}
                </p>
                <p className="text-sm text-muted-foreground">
                  Estado:{" "}
                  {evaluacion.conflictoInteres
                    ? "Conflicto de interés"
                    : evaluacion.completa
                      ? "Enviada"
                      : "Evaluación pendiente"}
                </p>

                <details className="mt-3 rounded-md border border-border bg-muted/40 p-2">
                  <summary className="cursor-pointer select-none text-sm font-medium text-foreground">
                    Ver evaluación
                  </summary>
                  <div className="mt-2 space-y-2 text-sm text-muted-foreground">
                    {evaluacion.secciones.length === 0 ? (
                      <p>Sin respuestas registradas en el formulario ético.</p>
                    ) : (
                      evaluacion.secciones.map((seccion) => (
                        <div key={`${evaluacion.id}-${seccion.seccion}`}>
                          <p className="font-medium">{seccion.seccion}</p>
                          <p>{seccion.observacion || "Sin observación."}</p>
                        </div>
                      ))
                    )}
                  </div>
                </details>
              </div>
            ))}

            <div className="rounded-md border border-green-200 bg-green-50 p-3">
              <p className="font-medium text-green-800">Coincidencias</p>
              <ul className="list-disc pl-5 text-sm text-green-700">
                {data.coincidencias.length === 0 ? <li>Sin coincidencias relevantes</li> : null}
                {data.coincidencias.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="font-medium text-amber-800">Discrepancias</p>
              <ul className="list-disc pl-5 text-sm text-amber-700">
                {data.discrepancias.length === 0 ? <li>Sin discrepancias</li> : null}
                {data.discrepancias.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision final y comunicacion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-2">
              {(["Aprobado", "Observado"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDraft({ decision: option, resumen })}
                  className={`rounded-md border px-3 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                    decision === option
                      ? "border-primary bg-secondary font-medium text-secondary-foreground"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <Textarea
              rows={6}
              placeholder="Resumen del dictamen final..."
              value={resumen}
              onChange={(event) =>
                setDraft({
                  decision,
                  resumen: event.target.value,
                })
              }
            />

            {requiereDosEvaluaciones ? (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTitle>Consolidación incompleta</AlertTitle>
                <AlertDescription>
                  {data.mensajeValidacion ??
                    "Se requieren 2 evaluaciones enviadas para consolidar el dictamen."}
                </AlertDescription>
              </Alert>
            ) : null}

            {!data.dictamen ? (
              <Button
                onClick={generarDictamen}
                disabled={generarMutation.isPending || resumen.length < 20 || requiereDosEvaluaciones}
              >
                {generarMutation.isPending ? "Generando..." : "Generar dictamen"}
              </Button>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={actualizarDictamen}
                  disabled={actualizarMutation.isPending || resumen.length < 20}
                  variant="outline"
                >
                  {actualizarMutation.isPending ? "Actualizando..." : "Actualizar dictamen"}
                </Button>
                <Button
                  onClick={firmarDictamen}
                  disabled={Boolean(data.dictamen.firmado) || firmarMutation.isPending}
                >
                  {firmarMutation.isPending
                    ? "Firmando..."
                    : data.dictamen.firmado
                      ? "Dictamen firmado"
                      : "Firmar dictamen"}
                </Button>
              </div>
            )}

            {generarMutation.isSuccess ? (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                <AlertTitle>Dictamen generado</AlertTitle>
                <AlertDescription>
                  Resultado comunicado: {generarMutation.data.decisionFinal}. Número:{" "}
                  {generarMutation.data.numero ?? "pendiente"}.
                </AlertDescription>
              </Alert>
            ) : null}

            {actualizarMutation.isSuccess ? (
              <Alert className="border-primary/30 bg-secondary text-secondary-foreground">
                <AlertTitle>Dictamen actualizado</AlertTitle>
                <AlertDescription>Se guardaron los cambios del dictamen.</AlertDescription>
              </Alert>
            ) : null}

            {firmarMutation.isSuccess ? (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                <AlertTitle>Dictamen firmado</AlertTitle>
                <AlertDescription>
                  {firmarMutation.data.message}
                  {firmarMutation.data.numero ? ` (${firmarMutation.data.numero})` : ""}
                </AlertDescription>
              </Alert>
            ) : null}

            {actionError ? (
              <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
                <AlertTitle>Error al procesar dictamen</AlertTitle>
                <AlertDescription>{actionError}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
