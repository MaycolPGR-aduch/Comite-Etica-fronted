"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, Download, ExternalLink } from "lucide-react";

import { useDescargarDocumentoExpediente } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Documento } from "@/types";

interface DocumentChecklistProps {
  expedienteId?: string;
  documents: Documento[];
  enableFileActions?: boolean;
  enablePendingUpload?: boolean;
  acceptedUploadExtensions?: readonly string[];
  validateUploadFile?: (file: File) => string | null;
  onUploadPendingDocument?: (document: Documento, file: File) => Promise<void>;
}

export function DocumentChecklist({
  expedienteId,
  documents,
  enableFileActions = true,
  enablePendingUpload = false,
  acceptedUploadExtensions,
  validateUploadFile,
  onUploadPendingDocument,
}: DocumentChecklistProps) {
  const downloadMutation = useDescargarDocumentoExpediente();
  const [pendingDocumentId, setPendingDocumentId] = useState<string | null>(null);
  const [errorByDocumentId, setErrorByDocumentId] = useState<Record<string, string>>({});
  const [selectedFilesByDocumentId, setSelectedFilesByDocumentId] = useState<Record<string, File | null>>({});
  const [pendingUploadDocumentId, setPendingUploadDocumentId] = useState<string | null>(null);

  const canUseDownloadEndpoint = (documentId: string) =>
    Boolean(expedienteId && /^\d+$/.test(expedienteId) && /^\d+$/.test(documentId));
  const canUploadPendingDocument = enablePendingUpload && Boolean(onUploadPendingDocument);

  const triggerDownload = (blobUrl: string, fileName: string) => {
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = fileName;
    anchor.rel = "noreferrer noopener";
    anchor.target = "_blank";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleAction = async (mode: "preview" | "download", document: Documento) => {
    if (!expedienteId || !canUseDownloadEndpoint(document.id)) {
      setErrorByDocumentId((current) => ({
        ...current,
        [document.id]: "No hay identificador válido para descargar este documento.",
      }));
      return;
    }

    setErrorByDocumentId((current) => {
      const next = { ...current };
      delete next[document.id];
      return next;
    });
    setPendingDocumentId(document.id);

    try {
      const result = await downloadMutation.mutateAsync({
        expedienteId,
        documentoId: document.id,
        preferredFileName: document.nombre,
        mode,
      });

      const blobUrl = URL.createObjectURL(result.blob);

      if (mode === "preview") {
        const opened = window.open(blobUrl, "_blank", "noopener,noreferrer");
        if (!opened) {
          triggerDownload(blobUrl, result.fileName);
        }
      } else {
        triggerDownload(blobUrl, result.fileName);
      }

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (error) {
      setErrorByDocumentId((current) => ({
        ...current,
        [document.id]:
          error instanceof Error
            ? error.message
            : "No se pudo descargar el documento en este momento.",
      }));
    } finally {
      setPendingDocumentId(null);
    }
  };

  const handleFileChange = (document: Documento, file: File | null) => {
    setErrorByDocumentId((current) => {
      const next = { ...current };
      delete next[document.id];
      return next;
    });

    if (!file) {
      setSelectedFilesByDocumentId((current) => ({ ...current, [document.id]: null }));
      return;
    }

    const validationError = validateUploadFile?.(file);
    if (validationError) {
      setSelectedFilesByDocumentId((current) => ({ ...current, [document.id]: null }));
      setErrorByDocumentId((current) => ({
        ...current,
        [document.id]: validationError,
      }));
      return;
    }

    setSelectedFilesByDocumentId((current) => ({ ...current, [document.id]: file }));
  };

  const handlePendingUpload = async (document: Documento) => {
    if (!onUploadPendingDocument) return;

    const selectedFile = selectedFilesByDocumentId[document.id];
    if (!selectedFile) {
      setErrorByDocumentId((current) => ({
        ...current,
        [document.id]: "Seleccione un archivo antes de cargarlo.",
      }));
      return;
    }

    setErrorByDocumentId((current) => {
      const next = { ...current };
      delete next[document.id];
      return next;
    });
    setPendingUploadDocumentId(document.id);

    try {
      await onUploadPendingDocument(document, selectedFile);
      setSelectedFilesByDocumentId((current) => ({ ...current, [document.id]: null }));
    } catch (error) {
      setErrorByDocumentId((current) => ({
        ...current,
        [document.id]:
          error instanceof Error
            ? error.message
            : "No se pudo cargar el documento en este momento.",
      }));
    } finally {
      setPendingUploadDocumentId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist documental</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.map((document) => (
          <div
            key={document.id}
            className="flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-muted/40"
          >
            <div>
              <p className="font-medium text-foreground">{document.nombre}</p>
              <p className="text-xs text-muted-foreground">{document.tipo}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {document.cargado ? (
                <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Cargado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-amber-600">
                  <CircleAlert className="h-4 w-4" /> Pendiente
                </span>
              )}

              {document.cargado && enableFileActions ? (
                canUseDownloadEndpoint(document.id) ? (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={pendingDocumentId === document.id}
                        onClick={() => handleAction("preview", document)}
                      >
                        <ExternalLink />
                        {pendingDocumentId === document.id ? "Abriendo..." : "Previsualizar"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={pendingDocumentId === document.id}
                        onClick={() => handleAction("download", document)}
                      >
                        <Download />
                        {pendingDocumentId === document.id ? "Descargando..." : "Descargar"}
                      </Button>
                    </div>
                    {errorByDocumentId[document.id] ? (
                      <p className="text-xs text-destructive">{errorByDocumentId[document.id]}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Documento sin identificador válido para descarga.</p>
                )
              ) : null}

              {!document.cargado && canUploadPendingDocument ? (
                <div className="flex w-full max-w-xs flex-col items-end gap-2 text-xs">
                  <Input
                    accept={acceptedUploadExtensions?.join(",")}
                    type="file"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      handleFileChange(document, file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={pendingUploadDocumentId === document.id}
                    onClick={() => handlePendingUpload(document)}
                  >
                    {pendingUploadDocumentId === document.id ? "Cargando..." : "Cargar documento"}
                  </Button>
                  {selectedFilesByDocumentId[document.id] ? (
                    <p className="text-muted-foreground">{selectedFilesByDocumentId[document.id]?.name}</p>
                  ) : null}
                  {errorByDocumentId[document.id] ? (
                    <p className="text-destructive">{errorByDocumentId[document.id]}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
