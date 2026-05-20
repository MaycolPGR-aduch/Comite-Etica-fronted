"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, Download, ExternalLink } from "lucide-react";

import { useDescargarDocumentoExpediente } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Documento } from "@/types";

interface DocumentChecklistProps {
  expedienteId?: string;
  documents: Documento[];
  enableFileActions?: boolean;
}

export function DocumentChecklist({
  expedienteId,
  documents,
  enableFileActions = true,
}: DocumentChecklistProps) {
  const downloadMutation = useDescargarDocumentoExpediente();
  const [pendingDocumentId, setPendingDocumentId] = useState<string | null>(null);
  const [errorByDocumentId, setErrorByDocumentId] = useState<Record<string, string>>({});

  const canUseDownloadEndpoint = (documentId: string) =>
    Boolean(expedienteId && /^\d+$/.test(expedienteId) && /^\d+$/.test(documentId));

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist documental</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.map((document) => (
          <div
            key={document.id}
            className="flex items-center justify-between rounded-md border border-slate-200 p-3"
          >
            <div>
              <p className="font-medium text-slate-800">{document.nombre}</p>
              <p className="text-xs text-slate-500">{document.tipo}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {document.cargado ? (
                <span className="inline-flex items-center gap-1 text-sm text-green-700">
                  <CheckCircle2 className="h-4 w-4" /> Cargado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-sm text-amber-700">
                  <CircleAlert className="h-4 w-4" /> Pendiente
                </span>
              )}

              {document.cargado && enableFileActions ? (
                canUseDownloadEndpoint(document.id) ? (
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded border border-blue-200 px-2 py-1 text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={pendingDocumentId === document.id}
                        onClick={() => handleAction("preview", document)}
                      >
                      <ExternalLink className="h-3.5 w-3.5" />
                        {pendingDocumentId === document.id ? "Abriendo..." : "Previsualizar"}
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={pendingDocumentId === document.id}
                        onClick={() => handleAction("download", document)}
                      >
                      <Download className="h-3.5 w-3.5" />
                        {pendingDocumentId === document.id ? "Descargando..." : "Descargar"}
                      </button>
                    </div>
                    {errorByDocumentId[document.id] ? (
                      <p className="text-xs text-red-600">{errorByDocumentId[document.id]}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Documento sin identificador válido para descarga.</p>
                )
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
