"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import {
  useDescargarArchivoDictamen,
  useExpedienteDetalle,
  useIAResumen,
  useRegistrarDocumentoExpediente,
} from "@/hooks";
import { getRequiredDocumentsByTipoTramite } from "@/lib/document-requirements";
import { DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS, expedientesService } from "@/services/expedientes.service";
import { DocumentChecklist, ErrorState, PageHeader, PageSkeleton, StatusBadge, Timeline } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import type { Documento } from "@/types";

export default function DetalleExpedientePage() {
  const params = useParams<{ id: string }>();
  const expedienteId = String(params.id);
  const { data, isLoading, error, refetch } = useExpedienteDetalle(expedienteId);
  const iaResumenQuery = useIAResumen(expedienteId);
  const descargarDictamenMutation = useDescargarArchivoDictamen();
  const registrarDocumentoMutation = useRegistrarDocumentoExpediente();
  const [dictamenError, setDictamenError] = useState<string | null>(null);

  if (isLoading) {
    return <PageSkeleton blocks={3} />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Proyecto no disponible"
        description="No se encontro informacion para el proyecto seleccionado."
        onRetry={() => refetch()}
      />
    );
  }

  const { expediente, timeline, observaciones, dictamen } = data;
  const allowResumeUpload = expediente.estado === "Borrador";
  const documentsForChecklist = (() => {
    if (!allowResumeUpload) {
      return expediente.documentos;
    }

    const requiredDocs = getRequiredDocumentsByTipoTramite(expediente.tipoTramite);
    const uploadedByTipo = new Map(
      expediente.documentos
        .filter((doc) => doc.cargado)
        .map((doc) => [doc.tipo.trim().toLowerCase(), doc] as const),
    );

    const mappedRequired = requiredDocs.map((requiredDoc) => {
      const uploaded = uploadedByTipo.get(requiredDoc.tipoDocumento);
      if (uploaded) {
        return {
          ...uploaded,
          requerido: true,
        };
      }

      return {
        id: `pending-${requiredDoc.key}`,
        nombre: requiredDoc.label,
        tipo: requiredDoc.tipoDocumento,
        requerido: true,
        cargado: false,
      };
    });

    const requiredTipos = new Set(
      requiredDocs.map((requiredDoc) => requiredDoc.tipoDocumento.toLowerCase()),
    );
    const extraUploaded = expediente.documentos.filter(
      (doc) => doc.cargado && !requiredTipos.has(doc.tipo.trim().toLowerCase()),
    );

    return [...mappedRequired, ...extraUploaded];
  })();

  const resolveTipoDocumento = (document: Documento) => {
    const normalizedName = document.nombre.trim().toLowerCase();
    if (normalizedName.includes("protocolo")) return "protocolo";
    if (normalizedName.includes("consentimiento")) return "consentimiento";
    if (normalizedName.includes("carta")) return "carta";
    if (normalizedName.includes("instrument")) return "instrumentos";
    if (normalizedName.includes("boleta")) return "boleta_pago";

    const normalizedType = document.tipo.trim().toLowerCase();
    if (normalizedType && normalizedType !== "requerido" && normalizedType !== "archivo") {
      return normalizedType;
    }

    return "documento";
  };

  const handleResumeUpload = async (document: Documento, file: File) => {
    await registrarDocumentoMutation.mutateAsync({
      expedienteId: expediente.id,
      file,
      tipoDocumento: resolveTipoDocumento(document),
      esObligatorio: document.requerido,
    });
    await refetch();
    toast.success("Documento cargado", `${document.nombre} se registró correctamente.`);
  };

  const descargarDictamen = async () => {
    if (!dictamen?.id) return;

    setDictamenError(null);
    try {
      const result = await descargarDictamenMutation.mutateAsync({
        dictamenId: dictamen.id,
        preferredFileName: `${dictamen.numero ?? `dictamen-${expediente.codigo}`}.pdf`,
      });

      const blobUrl = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = result.fileName;
      anchor.rel = "noreferrer noopener";
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (downloadError) {
      const message =
        downloadError instanceof Error
          ? downloadError.message
          : "No se pudo descargar el archivo del dictamen.";
      setDictamenError(message);
      toast.error("No se pudo descargar el dictamen", message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalle del proyecto"
        description="Seguimiento documental, observaciones, dictamen y actividad del proyecto."
      />
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{expediente.titulo}</CardTitle>
            <p className="text-sm text-muted-foreground">{expediente.codigo}</p>
          </div>
          <StatusBadge status={expediente.estado} />
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <p>
            <strong>Investigador:</strong> {expediente.investigadorPrincipal}
          </p>
          <p>
            <strong>Tipo de tramite:</strong> {expediente.tipoTramite}
          </p>
          <p>
            <strong>Facultad:</strong> {expediente.facultad}
          </p>
          <p>
            <strong>Fecha registro:</strong> {new Date(expediente.fechaRegistro).toLocaleDateString()}
          </p>
          {expediente.fechaLimite ? (
            <p>
              <strong>Fecha limite:</strong> {new Date(expediente.fechaLimite).toLocaleDateString()}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {allowResumeUpload ? (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTitle>Proyecto en borrador</AlertTitle>
              <AlertDescription>
                Puede retomar la carga de documentos pendientes y, cuando estén completos, continuar con el envío.
              </AlertDescription>
            </Alert>
          ) : null}
          <DocumentChecklist
            expedienteId={expediente.id}
            documents={documentsForChecklist}
            enablePendingUpload={allowResumeUpload}
            acceptedUploadExtensions={DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS}
            validateUploadFile={expedientesService.validateDocumento}
            onUploadPendingDocument={handleResumeUpload}
          />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dictamen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {dictamen ? (
                <>
                  <p>
                    <strong>Número:</strong> {dictamen.numero ?? "Sin número"}
                  </p>
                  <p>
                    <strong>Resultado:</strong> {dictamen.decisionFinal}
                  </p>
                  <p>
                    <strong>Estado:</strong> {dictamen.firmado ? "Firmado" : "Pendiente de firma"}
                  </p>
                  <p>
                    <strong>Fecha de emisión:</strong>{" "}
                    {new Date(dictamen.fechaEmision ?? dictamen.fecha).toLocaleDateString()}
                  </p>
                  {dictamen.fechaFirma ? (
                    <p>
                      <strong>Fecha de firma:</strong>{" "}
                      {new Date(dictamen.fechaFirma).toLocaleDateString()}
                    </p>
                  ) : null}
                  <div className="space-y-1">
                    <p className="font-semibold">Resumen final</p>
                    <p className="whitespace-pre-line text-muted-foreground">
                      {dictamen.resumen || "Sin resumen disponible."}
                    </p>
                  </div>
                  {dictamen.firmado && dictamen.decisionFinal === "Aprobado" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={descargarDictamen}
                      disabled={descargarDictamenMutation.isPending}
                    >
                      {descargarDictamenMutation.isPending
                        ? "Descargando dictamen..."
                        : "Descargar dictamen firmado"}
                    </Button>
                  ) : (
                    <p className="text-muted-foreground">El archivo firmado aún no está disponible.</p>
                  )}
                  {dictamenError ? <p className="text-destructive">{dictamenError}</p> : null}
                </>
              ) : (
                <p className="text-muted-foreground">Dictamen aún no disponible.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {observaciones.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay observaciones activas.</p>
              ) : (
                observaciones.map((observation) => (
                  <div key={observation.id} className="rounded-md border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-medium">{observation.seccion}</p>
                    <p className="text-sm text-foreground/80">{observation.comentario}</p>
                  </div>
                ))
              )}

              <Link
                className="inline-block text-sm text-primary hover:underline"
                href={`/investigador/expedientes/${expediente.id}/subsanacion`}
              >
                Ir a subsanacion
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen IA del proyecto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {iaResumenQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ) : null}
          {iaResumenQuery.isError ? (
            <p className="text-destructive">
              {iaResumenQuery.error instanceof Error
                ? iaResumenQuery.error.message
                : "No se pudo obtener el resumen IA."}
            </p>
          ) : null}
          {iaResumenQuery.data ? (
            <>
              <p>
                <strong>Resumen:</strong> {iaResumenQuery.data.resumen}
              </p>
              <p>
                <strong>Documentos detectados:</strong> {iaResumenQuery.data.documentosCount}
              </p>
              {iaResumenQuery.data.isPlaceholder ? (
                <p className="text-amber-700">
                  Resultado preliminar: el backend indica integración IA parcial.
                </p>
              ) : null}
            </>
          ) : null}
        </CardContent>
      </Card>

      <Timeline events={timeline} />
    </div>
  );
}
