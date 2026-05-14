"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import {
  useIAInconsistencias,
  useIAObservacionesSugeridas,
  useIAPreanalisis,
  useIARiesgos,
  useContextoEvaluacion,
  useDeclararConflictoEvaluacion,
  useGuardarEvaluacion,
} from "@/hooks";
import type { Recommendation, RiskLevel } from "@/types";
import { EmptyState } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
const sections = ["Metodologia", "Riesgo", "Consentimiento", "Proteccion de datos"];

export default function EvaluacionEticaPage() {
  const params = useParams<{ id: string }>();
  const evaluacionId = String(params.id);
  const { data, isLoading, error } = useContextoEvaluacion(evaluacionId);
  const mutation = useGuardarEvaluacion();
  const conflictoMutation = useDeclararConflictoEvaluacion();
  const expedienteId = data?.expediente.id ?? "";
  const preanalisisQuery = useIAPreanalisis(expedienteId);
  const inconsistenciasQuery = useIAInconsistencias(expedienteId);
  const riesgosQuery = useIARiesgos(expedienteId);
  const observacionesIAQuery = useIAObservacionesSugeridas(expedienteId);

  const [draftRiesgo, setDraftRiesgo] = useState<RiskLevel | null>(null);
  const [draftRecomendacion, setDraftRecomendacion] = useState<Recommendation | null>(null);
  const [observaciones, setObservaciones] = useState<Record<string, string>>({});

  const defaultObservaciones = useMemo(() => {
    if (!data) return {};

    return data.evaluacionActual.secciones.reduce<Record<string, string>>((acc, item) => {
      acc[item.seccion] = item.observacion;
      return acc;
    }, {});
  }, [data]);

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando contexto de evaluacion...</p>;
  }

  if (!data) {
    return (
      <EmptyState
        title="Contexto no disponible"
        description="No se encontro informacion para evaluar el expediente."
      />
    );
  }

  const riesgo = draftRiesgo ?? data.evaluacionActual.riesgo;
  const recomendacion = draftRecomendacion ?? data.evaluacionActual.recomendacion;

  const submit = async (enviar: boolean) => {
    await mutation.mutateAsync({
      evaluacionId,
      riesgo,
      recomendacion,
      secciones: sections.map((section) => ({
        seccion: section,
        observacion: observaciones[section] ?? defaultObservaciones[section] ?? "",
      })),
      enviar,
    });
  };

  const declararConflicto = async () => {
    await conflictoMutation.mutateAsync(evaluacionId);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen del expediente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Codigo:</strong> {data.expediente.codigo}
            </p>
            <p>
              <strong>Evaluacion:</strong> #{data.evaluacion.id}
            </p>
            <p>
              <strong>Titulo:</strong> {data.expediente.titulo}
            </p>
            <p>
              <strong>Facultad:</strong> {data.expediente.facultad}
            </p>
            <p>
              <strong>Tipo:</strong> {data.expediente.tipoTramite}
            </p>
            <div className="rounded-md border border-dashed border-blue-300 bg-blue-50 p-3 text-sm text-slate-600">
              Visor mock de documento: protocolo principal disponible para lectura.
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#6941C6]/30 bg-[#F3EDFF]">
          <CardHeader>
            <CardTitle className="text-[#6941C6]">Apoyo IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#4A3A88]">
            {preanalisisQuery.isLoading ||
            inconsistenciasQuery.isLoading ||
            riesgosQuery.isLoading ||
            observacionesIAQuery.isLoading ? (
              <p>Cargando sugerencias IA...</p>
            ) : null}

            {preanalisisQuery.isError ||
            inconsistenciasQuery.isError ||
            riesgosQuery.isError ||
            observacionesIAQuery.isError ? (
              <p className="text-red-700">
                {(preanalisisQuery.error as Error | undefined)?.message ||
                  (inconsistenciasQuery.error as Error | undefined)?.message ||
                  (riesgosQuery.error as Error | undefined)?.message ||
                  (observacionesIAQuery.error as Error | undefined)?.message ||
                  "No se pudo recuperar el apoyo IA."}
              </p>
            ) : null}

            {!preanalisisQuery.isLoading &&
            !inconsistenciasQuery.isLoading &&
            !riesgosQuery.isLoading &&
            !observacionesIAQuery.isLoading &&
            !preanalisisQuery.isError &&
            !inconsistenciasQuery.isError &&
            !riesgosQuery.isError &&
            !observacionesIAQuery.isError ? (
              <div className="space-y-2">
                <p>
                  <strong>Resumen IA:</strong> {preanalisisQuery.data?.resumenIA}
                </p>
                <p>
                  <strong>Nivel de riesgo sugerido:</strong> {riesgosQuery.data?.nivelRiesgo}
                </p>

                {preanalisisQuery.data?.recomendaciones?.length ? (
                  <div>
                    <p className="font-medium">Recomendaciones:</p>
                    <ul className="list-disc space-y-1 pl-5">
                      {preanalisisQuery.data.recomendaciones.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {inconsistenciasQuery.data?.inconsistencias?.length ? (
                  <div>
                    <p className="font-medium">Inconsistencias detectadas:</p>
                    <ul className="list-disc space-y-1 pl-5">
                      {inconsistenciasQuery.data.inconsistencias.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>Sin inconsistencias detectadas por IA.</p>
                )}

                {observacionesIAQuery.data?.observacionesSugeridas?.length ? (
                  <div>
                    <p className="font-medium">Observaciones sugeridas:</p>
                    <ul className="list-disc space-y-1 pl-5">
                      {observacionesIAQuery.data.observacionesSugeridas.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>Sin observaciones sugeridas por IA.</p>
                )}

                {preanalisisQuery.data?.isPlaceholder ||
                inconsistenciasQuery.data?.isPlaceholder ||
                riesgosQuery.data?.isPlaceholder ||
                observacionesIAQuery.data?.isPlaceholder ? (
                  <p className="font-medium">Resultado preliminar: puede requerir revisión manual.</p>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulario de evaluacion etica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.map((section) => (
            <div key={section} className="space-y-2">
              <p className="text-sm font-medium text-[#08204A]">{section}</p>
              <Textarea
                rows={3}
                value={observaciones[section] ?? defaultObservaciones[section] ?? ""}
                onChange={(event) =>
                  setObservaciones((current) => ({
                    ...current,
                    [section]: event.target.value,
                  }))
                }
                placeholder={`Observaciones para ${section}`}
              />
            </div>
          ))}

          <div className="space-y-2">
            <p className="text-sm font-medium">Nivel de riesgo</p>
            <div className="flex gap-2">
              {(["Bajo", "Medio", "Alto"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`rounded-md border px-3 py-2 text-sm ${
                    riesgo === option ? "border-blue-400 bg-blue-50" : "border-slate-200"
                  }`}
                  onClick={() => setDraftRiesgo(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Recomendacion preliminar</p>
            <div className="grid gap-2">
              {(
                [
                  "Aprobar",
                  "Aprobar con observaciones",
                  "Solicitar subsanación",
                  "Desaprobar",
                ] as const
              ).map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`rounded-md border px-3 py-2 text-left text-sm ${
                    recomendacion === option ? "border-blue-400 bg-blue-50" : "border-slate-200"
                  }`}
                  onClick={() => setDraftRecomendacion(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={declararConflicto}
              disabled={conflictoMutation.isPending || mutation.isPending}
              variant="destructive"
            >
              Declarar conflicto
            </Button>
            <Button onClick={() => submit(false)} disabled={mutation.isPending} variant="outline">
              Guardar avance
            </Button>
            <Button onClick={() => submit(true)} disabled={mutation.isPending}>
              Enviar evaluacion
            </Button>
          </div>

          {error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error ? error.message : "No se pudo cargar la evaluacion."}
              </AlertDescription>
            </Alert>
          ) : null}

          {conflictoMutation.isSuccess ? (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTitle>Conflicto registrado</AlertTitle>
              <AlertDescription>{conflictoMutation.data.message}</AlertDescription>
            </Alert>
          ) : null}

          {mutation.isSuccess ? (
            <Alert className="border-green-200 bg-green-50">
              <AlertTitle>Operacion exitosa</AlertTitle>
              <AlertDescription>{mutation.data.message}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
