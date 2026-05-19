import { CheckCircle2, CircleAlert, Download, ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Documento } from "@/types";

interface DocumentChecklistProps {
  documents: Documento[];
  enableFileActions?: boolean;
}

export function DocumentChecklist({ documents, enableFileActions = true }: DocumentChecklistProps) {
  const hasValidUrl = (url?: string) => Boolean(url && /^https?:\/\//i.test(url));

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
                hasValidUrl(document.url) ? (
                  <div className="flex items-center gap-2 text-xs">
                    <a
                      className="inline-flex items-center gap-1 rounded border border-blue-200 px-2 py-1 text-blue-700 hover:bg-blue-50"
                      href={document.url}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Previsualizar
                    </a>
                    <a
                      className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                      download
                      href={document.url}
                      rel="noreferrer noopener"
                      target="_blank"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Descargar
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Archivo no disponible para vista/descarga.</p>
                )
              ) : null}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
