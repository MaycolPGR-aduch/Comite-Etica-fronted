"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import {
  useActualizarDictamen,
  useConsolidacion,
  useFirmarDictamen,
  useGenerarDictamen,
} from "@/hooks";
import { EmptyState } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function ConsolidacionDictamenPage() {
  const params = useParams<{ id: string }>();
  const expedienteId = String(params.id);
  const { data, isLoading, error } = useConsolidacion(expedienteId);
  const generarMutation = useGenerarDictamen();
  const actualizarMutation = useActualizarDictamen();
  const firmarMutation = useFirmarDictamen();
  const [draft, setDraft] = useState<{
    decision: "Aprobado" | "Desaprobado" | "Observado";
    resumen: string;
  } | null>(null);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando consolidacion...</p>;
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Consolidacion no disponible"
        description="No hay dos evaluaciones completas para este expediente."
      />
    );
  }

  const decision = draft?.decision ?? data.dictamen?.decisionFinal ?? "Aprobado";
  const resumen = draft?.resumen ?? data.dictamen?.resumen ?? "";

  const generarDictamen = async () => {
    await generarMutation.mutateAsync({
      expedienteId,
      decisionFinal: decision,
      resumen,
    });
  };

  const actualizarDictamen = async () => {
    if (!data?.dictamen?.id) return;

    await actualizarMutation.mutateAsync({
      dictamenId: data.dictamen.id,
      expedienteId,
      contenido: resumen,
    });
  };

  const firmarDictamen = async () => {
    if (!data?.dictamen?.id) return;

    await firmarMutation.mutateAsync({
      dictamenId: data.dictamen.id,
      expedienteId,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Consolidacion y dictamen final</CardTitle>
          <p className="text-sm text-slate-500">
            Expediente: {data.expediente.codigo} - {data.expediente.titulo}
          </p>
          {data.dictamen ? (
            <p className="text-sm text-slate-600">
              Dictamen actual: {data.dictamen.numero ?? "Sin número"} · Tipo:{" "}
              {data.dictamen.tipo ?? data.dictamen.decisionFinal} ·{" "}
              {data.dictamen.firmado ? "Firmado" : "Pendiente de firma"}
            </p>
          ) : null}
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Comparativa de evaluadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-slate-200 p-3">
              <p className="font-medium">Evaluador 1</p>
              <p className="text-sm text-slate-600">Riesgo: {data.evaluacion1.riesgo}</p>
              <p className="text-sm text-slate-600">Recomendacion: {data.evaluacion1.recomendacion}</p>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <p className="font-medium">Evaluador 2</p>
              <p className="text-sm text-slate-600">Riesgo: {data.evaluacion2.riesgo}</p>
              <p className="text-sm text-slate-600">Recomendacion: {data.evaluacion2.recomendacion}</p>
            </div>

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
            <div className="grid gap-2 md:grid-cols-3">
              {(["Aprobado", "Observado", "Desaprobado"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setDraft({ decision: option, resumen })}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    decision === option
                      ? "border-blue-400 bg-blue-50 text-[#08204A]"
                      : "border-slate-200 text-slate-600"
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

            {!data.dictamen ? (
              <Button
                onClick={generarDictamen}
                disabled={generarMutation.isPending || resumen.length < 20}
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
              <Alert className="border-green-200 bg-green-50">
                <AlertTitle>Dictamen generado</AlertTitle>
                <AlertDescription>
                  Resultado comunicado: {generarMutation.data.decisionFinal}. Número:{" "}
                  {generarMutation.data.numero ?? "pendiente"}.
                </AlertDescription>
              </Alert>
            ) : null}

            {actualizarMutation.isSuccess ? (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTitle>Dictamen actualizado</AlertTitle>
                <AlertDescription>Se guardaron los cambios del dictamen.</AlertDescription>
              </Alert>
            ) : null}

            {firmarMutation.isSuccess ? (
              <Alert className="border-green-200 bg-green-50">
                <AlertTitle>Dictamen firmado</AlertTitle>
                <AlertDescription>
                  {firmarMutation.data.message}
                  {firmarMutation.data.numero ? ` (${firmarMutation.data.numero})` : ""}
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
