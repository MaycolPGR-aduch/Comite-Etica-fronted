import { CheckCircle2, CircleAlert } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Documento } from "@/types";

interface DocumentChecklistProps {
  documents: Documento[];
}

export function DocumentChecklist({ documents }: DocumentChecklistProps) {
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
            {document.cargado ? (
              <span className="inline-flex items-center gap-1 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" /> Cargado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm text-amber-700">
                <CircleAlert className="h-4 w-4" /> Pendiente
              </span>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
