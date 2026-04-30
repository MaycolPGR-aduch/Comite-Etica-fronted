"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

import { useContextoEvaluacion, useGuardarEvaluacion } from "@/hooks";
import type { Recommendation, RiskLevel } from "@/types";
import { EmptyState } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const DEMO_EVALUADOR_ID = "u4";

const sections = ["Metodologia", "Riesgo", "Consentimiento", "Proteccion de datos"];

export default function EvaluacionEticaPage() {
  const params = useParams<{ id: string }>();
  const expedienteId = String(params.id);
  const { data, isLoading } = useContextoEvaluacion(expedienteId);
  const mutation = useGuardarEvaluacion();

  const [riesgo, setRiesgo] = useState<RiskLevel>("Medio");
  const [recomendacion, setRecomendacion] = useState<Recommendation>("Aprobar con observaciones");
  const [observaciones, setObservaciones] = useState<Record<string, string>>({});

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

  const submit = async (enviar: boolean) => {
    await mutation.mutateAsync({
      expedienteId,
      evaluadorId: DEMO_EVALUADOR_ID,
      riesgo,
      recomendacion,
      secciones: sections.map((section) => ({
        seccion: section,
        observacion: observaciones[section] ?? "",
      })),
      enviar,
    });
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
            <CardTitle className="text-[#6941C6]">Apoyo IA (mock)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[#4A3A88]">
            <p>- Posible inconsistencia entre tamano muestral y objetivo secundario.</p>
            <p>- Reforzar redaccion del consentimiento para menores de edad.</p>
            <p className="font-medium">Estas sugerencias no son vinculantes.</p>
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
                value={observaciones[section] ?? ""}
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
                  onClick={() => setRiesgo(option)}
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
                  onClick={() => setRecomendacion(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => submit(false)} disabled={mutation.isPending} variant="outline">
              Guardar avance
            </Button>
            <Button onClick={() => submit(true)} disabled={mutation.isPending}>
              Enviar evaluacion
            </Button>
          </div>

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
