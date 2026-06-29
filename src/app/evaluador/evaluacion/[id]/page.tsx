"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Download, ExternalLink } from "lucide-react";

import {
  useDescargarDocumentoExpediente,
  useIAInconsistencias,
  useIAObservacionesSugeridas,
  useIAPreanalisis,
  useContextoEvaluacion,
  useDeclararConflictoEvaluacion,
  useGuardarRubrica,
  useRubrica,
} from "@/hooks";
import type {
  CriterioEvaluado,
  Documento,
  ExpedienteStatus,
  ResultadoEvaluacion,
} from "@/types";
import { EmptyState, PageHeader, PageSkeleton, StatusBadge, useConfirm } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

// Umbrales locales (réplica del backend) para el preview en vivo del dictamen.
const deriveResultado = (total: number): ResultadoEvaluacion => {
  if (total >= 17) return "aprobado";
  if (total >= 13) return "aprobado_observaciones";
  return "no_aprobado";
};

const resultadoLabel: Record<ResultadoEvaluacion, ExpedienteStatus> = {
  aprobado: "Aprobado",
  aprobado_observaciones: "Aprobado con observaciones",
  no_aprobado: "No aprobado",
};

interface CriterioValue {
  puntaje: number;
  observacion: string;
}

export default function EvaluacionEticaPage() {
  const params = useParams<{ id: string }>();
  const evaluacionId = String(params.id);
  const { data, isLoading, error } = useContextoEvaluacion(evaluacionId);
  const rubricaQuery = useRubrica();
  const mutation = useGuardarRubrica();
  const conflictoMutation = useDeclararConflictoEvaluacion();
  const confirm = useConfirm();
  const expedienteId = data?.expediente.id ?? "";
  const preanalisisQuery = useIAPreanalisis(expedienteId);
  const inconsistenciasQuery = useIAInconsistencias(expedienteId);
  const observacionesIAQuery = useIAObservacionesSugeridas(expedienteId);
  const documentoMutation = useDescargarDocumentoExpediente();
  const normalize = (value?: string) => value?.trim().toLowerCase() ?? "";

  const [criterioValues, setCriterioValues] = useState<Record<string, CriterioValue>>({});
  const [observacionesGenerales, setObservacionesGenerales] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [documentoError, setDocumentoError] = useState<string | null>(null);

  // Precarga: inicializa puntajes/observaciones con lo ya guardado (si existe).
  useEffect(() => {
    if (initialized) return;
    if (!rubricaQuery.data || !data) return;

    const existing = new Map<string, CriterioEvaluado>(
      data.evaluacion.criterios.map((item) => [item.key, item]),
    );

    const initial: Record<string, CriterioValue> = {};
    for (const criterio of rubricaQuery.data.criterios) {
      const previo = existing.get(criterio.key);
      initial[criterio.key] = {
        puntaje: previo?.puntaje ?? 0,
        observacion: previo?.observacion ?? "",
      };
    }

    setCriterioValues(initial);
    setObservacionesGenerales(data.evaluacion.observaciones ?? "");
    setInitialized(true);
  }, [initialized, rubricaQuery.data, data]);

  const puntajeTotalMax = rubricaQuery.data?.puntajeTotalMax ?? 20;

  const total = useMemo(
    () =>
      Object.values(criterioValues).reduce((acc, item) => acc + (item?.puntaje ?? 0), 0),
    [criterioValues],
  );

  const resultadoPrevisto = deriveResultado(total);

  const documentoPrincipal = useMemo<Documento | null>(() => {
    if (!data?.expediente.documentos?.length) return null;

    const documentos = data.expediente.documentos;
    const byTipo = documentos.find((doc) => normalize(doc.tipo).includes("protocolo"));
    if (byTipo) return byTipo;

    const byName = documentos.find(
      (doc) =>
        normalize(doc.nombre).includes("protocolo") ||
        normalize(doc.nombre).includes("investigacion"),
    );
    if (byName) return byName;

    return documentos[0] ?? null;
  }, [data]);

  if (isLoading) {
    return <PageSkeleton blocks={2} />;
  }

  if (!data) {
    return (
      <EmptyState
        title="Contexto no disponible"
        description="No se encontro informacion para evaluar el expediente."
      />
    );
  }

  const setPuntaje = (key: string, value: number) =>
    setCriterioValues((current) => ({
      ...current,
      [key]: { puntaje: value, observacion: current[key]?.observacion ?? "" },
    }));

  const setObservacion = (key: string, value: string) =>
    setCriterioValues((current) => ({
      ...current,
      [key]: { puntaje: current[key]?.puntaje ?? 0, observacion: value },
    }));

  const submit = async (enviar: boolean) => {
    if (!rubricaQuery.data) {
      toast.error("Rúbrica no disponible", "No se pudo cargar la rúbrica oficial.");
      return;
    }

    if (enviar) {
      const confirmed = await confirm({
        title: "Enviar evaluación",
        description:
          "Una vez enviada, la evaluación quedará registrada como definitiva y no podrás editarla. ¿Deseas enviarla?",
        confirmLabel: "Enviar evaluación",
      });
      if (!confirmed) return;
    }

    const criterios: CriterioEvaluado[] = rubricaQuery.data.criterios.map((criterio) => ({
      key: criterio.key,
      puntaje: criterioValues[criterio.key]?.puntaje ?? 0,
      observacion: criterioValues[criterio.key]?.observacion ?? "",
    }));

    try {
      const result = await mutation.mutateAsync({
        evaluacionId,
        criterios,
        observaciones: observacionesGenerales,
        enviar,
      });

      const detalle = result.puntajeTotal !== null
        ? `Total: ${result.puntajeTotal} / ${puntajeTotalMax}`
        : undefined;

      toast.success(enviar ? "Evaluación enviada" : "Avance guardado", detalle);
    } catch (err) {
      toast.error(
        enviar ? "No se pudo enviar la evaluación" : "No se pudo guardar el avance",
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  const declararConflicto = async () => {
    const confirmed = await confirm({
      title: "Declarar conflicto de interés",
      description:
        "Al declarar conflicto de interés serás apartado de esta evaluación. Esta acción no puede deshacerse. ¿Deseas continuar?",
      confirmLabel: "Declarar conflicto",
      variant: "destructive",
    });
    if (!confirmed) return;

    try {
      const result = await conflictoMutation.mutateAsync(evaluacionId);
      toast.success("Conflicto de interés registrado", result.message);
    } catch (err) {
      toast.error(
        "No se pudo declarar el conflicto",
        err instanceof Error ? err.message : undefined,
      );
    }
  };

  const descargarDocumentoPrincipal = async (mode: "preview" | "download") => {
    if (!documentoPrincipal) return;

    setDocumentoError(null);
    try {
      const result = await documentoMutation.mutateAsync({
        expedienteId: data.expediente.id,
        documentoId: documentoPrincipal.id,
        preferredFileName: documentoPrincipal.nombre,
        mode,
      });

      const blobUrl = URL.createObjectURL(result.blob);

      if (mode === "preview") {
        const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");
        if (!opened) {
          const anchor = document.createElement("a");
          anchor.href = blobUrl;
          anchor.download = result.fileName;
          document.body.append(anchor);
          anchor.click();
          anchor.remove();
        }
      } else {
        const anchor = document.createElement("a");
        anchor.href = blobUrl;
        anchor.download = result.fileName;
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
      }

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      if (documentoPrincipal.url) {
        if (mode === "preview") {
          window.open(documentoPrincipal.url, "_blank", "noopener,noreferrer");
        } else {
          const anchor = document.createElement("a");
          anchor.href = documentoPrincipal.url;
          anchor.download = documentoPrincipal.nombre;
          anchor.rel = "noreferrer noopener";
          document.body.append(anchor);
          anchor.click();
          anchor.remove();
        }

        setDocumentoError(
          "Se usó la ruta directa del archivo porque el endpoint de descarga devolvió error.",
        );
        return;
      }

      setDocumentoError(
        err instanceof Error ? err.message : "No se pudo obtener el documento principal.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Evaluación ética"
        description={`Expediente ${data.expediente.codigo} · ${data.expediente.titulo}`}
      />
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Investigador del expediente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <strong>Nombre:</strong>{" "}
                {data.investigador?.nombre || data.expediente.investigadorPrincipal}
              </p>
              <p>
                <strong>Correo:</strong> {data.investigador?.correo ?? "No disponible"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documento principal para revisión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {documentoPrincipal ? (
                <>
                  <p>
                    <strong>Archivo:</strong> {documentoPrincipal.nombre}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {documentoPrincipal.tipo}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={() => descargarDocumentoPrincipal("preview")}
                      disabled={documentoMutation.isPending}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Previsualizar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => descargarDocumentoPrincipal("download")}
                      disabled={documentoMutation.isPending}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">
                  No hay documentos disponibles para este expediente en este momento.
                </p>
              )}

              {documentoError ? <p className="text-destructive">{documentoError}</p> : null}
            </CardContent>
          </Card>

          <Card className="border-[#6941C6]/30 bg-[#F3EDFF]">
            <CardHeader>
              <CardTitle className="text-[#6941C6]">Apoyo IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#4A3A88]">
              {preanalisisQuery.isLoading ||
              inconsistenciasQuery.isLoading ||
              observacionesIAQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ) : null}

              {preanalisisQuery.isError ||
              inconsistenciasQuery.isError ||
              observacionesIAQuery.isError ? (
                <p className="text-destructive">
                  {(preanalisisQuery.error as Error | undefined)?.message ||
                    (inconsistenciasQuery.error as Error | undefined)?.message ||
                    (observacionesIAQuery.error as Error | undefined)?.message ||
                    "No se pudo recuperar el apoyo IA."}
                </p>
              ) : null}

              {!preanalisisQuery.isLoading &&
              !inconsistenciasQuery.isLoading &&
              !observacionesIAQuery.isLoading &&
              !preanalisisQuery.isError &&
              !inconsistenciasQuery.isError &&
              !observacionesIAQuery.isError ? (
                <div className="space-y-2">
                  <p>
                    <strong>Resumen IA:</strong> {preanalisisQuery.data?.resumenIA}
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
            <CardTitle>Rúbrica de evaluación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {rubricaQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : rubricaQuery.isError ? (
              <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {rubricaQuery.error instanceof Error
                    ? rubricaQuery.error.message
                    : "No se pudo cargar la rúbrica oficial."}
                </AlertDescription>
              </Alert>
            ) : rubricaQuery.data ? (
              <>
                {rubricaQuery.data.criterios.map((criterio, index) => {
                  const value = criterioValues[criterio.key] ?? { puntaje: 0, observacion: "" };
                  const opciones = Array.from(
                    { length: criterio.puntajeMax + 1 },
                    (_, i) => i,
                  );

                  return (
                    <div
                      key={criterio.key}
                      className="space-y-3 rounded-md border border-border p-4"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {index + 1}. {criterio.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground">{criterio.descripcion}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Label
                          htmlFor={`puntaje-${criterio.key}`}
                          className="text-sm text-muted-foreground"
                        >
                          Puntaje
                        </Label>
                        <Select
                          value={String(value.puntaje)}
                          onValueChange={(next) => setPuntaje(criterio.key, Number(next))}
                        >
                          <SelectTrigger id={`puntaje-${criterio.key}`} className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {opciones.map((opcion) => (
                              <SelectItem key={opcion} value={String(opcion)}>
                                {opcion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">
                          / {criterio.puntajeMax}
                        </span>
                      </div>

                      <Textarea
                        rows={2}
                        value={value.observacion}
                        onChange={(event) => setObservacion(criterio.key, event.target.value)}
                        placeholder={`Observación para ${criterio.nombre} (opcional)`}
                      />
                    </div>
                  );
                })}

                <div className="space-y-2">
                  <Label htmlFor="observaciones-generales" className="text-sm font-medium">
                    Observaciones generales
                  </Label>
                  <Textarea
                    id="observaciones-generales"
                    rows={3}
                    value={observacionesGenerales}
                    onChange={(event) => setObservacionesGenerales(event.target.value)}
                    placeholder="Comentarios generales de la evaluación (opcional)"
                  />
                </div>

                <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 p-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {total} / {puntajeTotalMax}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="mb-1 text-sm text-muted-foreground">Resultado previsto</p>
                    <StatusBadge status={resultadoLabel[resultadoPrevisto]} />
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
                  <Button
                    onClick={() => submit(false)}
                    disabled={mutation.isPending}
                    variant="outline"
                  >
                    Guardar avance
                  </Button>
                  <Button onClick={() => submit(true)} disabled={mutation.isPending}>
                    Enviar evaluación
                  </Button>
                </div>
              </>
            ) : null}

            {error ? (
              <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error instanceof Error ? error.message : "No se pudo cargar la evaluacion."}
                </AlertDescription>
              </Alert>
            ) : null}

            {conflictoMutation.isSuccess ? (
              <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                <AlertTitle>Conflicto registrado</AlertTitle>
                <AlertDescription>{conflictoMutation.data.message}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
