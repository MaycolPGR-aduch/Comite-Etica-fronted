"use client";

import { Info } from "lucide-react";

import { EXPEDIENTE_STATUSES } from "@/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const statusDescriptions: Record<(typeof EXPEDIENTE_STATUSES)[number], string> = {
  Borrador: "El expediente fue creado pero aún no se envía al Comité.",
  Enviado: "El expediente fue remitido y espera revisión administrativa.",
  "En revisión administrativa": "Secretaría Técnica está validando la documentación.",
  "Observado por admisibilidad": "Faltan requisitos o documentos; requiere subsanación.",
  Subsanado: "El investigador respondió las observaciones administrativas.",
  Admitido: "La documentación fue validada y el expediente puede ser asignado.",
  Asignado: "Un evaluador fue asignado para revisar el expediente.",
  "En evaluación": "El evaluador está revisando el expediente.",
  "Evaluaciones completas": "La evaluación fue registrada y está lista para el resultado.",
  "En deliberación": "El Comité está definiendo el resultado final.",
  Observado: "El expediente tiene observaciones de la evaluación ética.",
  Aprobado: "El proyecto fue aprobado sin observaciones.",
  "Aprobado con observaciones": "El proyecto fue aprobado, con observaciones a subsanar.",
  Desaprobado: "El proyecto no cumplió los requisitos éticos exigidos.",
  Cerrado: "El expediente concluyó su ciclo y quedó archivado.",
};

export function StatusLegend() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Info className="mr-2 h-4 w-4" />
          Leyenda de estados
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leyenda de estados del expediente</DialogTitle>
          <DialogDescription>
            Significado de cada estado dentro del flujo de evaluación ética.
          </DialogDescription>
        </DialogHeader>
        <ul className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {EXPEDIENTE_STATUSES.map((status) => (
            <li key={status} className="flex items-start gap-3">
              <StatusBadge status={status} />
              <p className="text-sm text-muted-foreground">{statusDescriptions[status]}</p>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
