"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, Download, Eye } from "lucide-react";

import { useDescargarDocumentoExpediente } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Documento } from "@/types";

interface PreviewState {
  url: string;
  mimeType: string;
  fileName: string;
  previewable: boolean;
}

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
  const [preview, setPreview] = useState<PreviewState | null>(null);

  const closePreview = () => {
    setPreview((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  };

  const canUseDownloadEndpoint = (documentId: string) =>
    Boolean(expedienteId && /^\d+$/.test(expedienteId) && /^\d+$/.test(documentId));
  const canUploadPendingDocument = enablePendingUpload && Boolean(onUploadPendingDocument);

  // Descarga: fuerza la bajada del archivo con su nombre.
  const triggerDownload = (blobUrl: string, fileName: string) => {
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = fileName;
    anchor.rel = "noreferrer noopener";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleAction = async (mode: "preview" | "download", document: Documento) => {
    if (!expedienteId || !canUseDownloadEndpoint(document.id)) {
      setErrorByDocumentId((current) => ({
        ...current,
        [document.id]: "No hay identificador válido para abrir este documento.",
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
        // Solo PDF e imágenes se pueden ver embebidos; el resto se ofrece para descargar.
        const previewable =
          result.mimeType === "application/pdf" || result.mimeType.startsWith("image/");
        setPreview({ url: blobUrl, mimeType: result.mimeType, fileName: result.fileName, previewable });
      } else {
        triggerDownload(blobUrl, result.fileName);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      }
    } catch (error) {
      setErrorByDocumentId((current) => ({
        ...current,
        [document.id]:
          error instanceof Error
            ? error.message
            : "No se pudo abrir el documento en este momento.",
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
    <>
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
                        <Eye />
                        {pendingDocumentId === document.id ? "Cargando..." : "Previsualizar"}
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

    <Dialog open={Boolean(preview)} onOpenChange={(open) => (open ? undefined : closePreview())}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-6">{preview?.fileName ?? "Documento"}</DialogTitle>
        </DialogHeader>
        {preview?.previewable ? (
          preview.mimeType.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.url}
              alt={preview.fileName}
              className="max-h-[75vh] w-full rounded-md border object-contain"
            />
          ) : (
            <iframe
              src={preview.url}
              title={preview.fileName}
              className="h-[75vh] w-full rounded-md border"
            />
          )
        ) : (
          <div className="space-y-4 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              Este tipo de archivo (Word, Excel, etc.) no se puede previsualizar en el navegador.
              Puedes descargarlo para abrirlo.
            </p>
            <Button
              type="button"
              onClick={() => {
                if (preview) triggerDownload(preview.url, preview.fileName);
              }}
            >
              <Download /> Descargar archivo
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
