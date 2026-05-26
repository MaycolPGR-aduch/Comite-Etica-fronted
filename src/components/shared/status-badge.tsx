import { Badge } from "@/components/ui/badge";
import type { ExpedienteStatus } from "@/types";

const statusClasses: Record<ExpedienteStatus, string> = {
  Borrador: "bg-slate-100 text-slate-700",
  Enviado: "bg-blue-100 text-blue-800",
  "En revisión administrativa": "bg-indigo-100 text-indigo-800",
  "Observado por admisibilidad": "bg-amber-100 text-amber-800",
  Subsanado: "bg-cyan-100 text-cyan-800",
  Admitido: "bg-emerald-100 text-emerald-800",
  Asignado: "bg-violet-100 text-violet-800",
  "En evaluación": "bg-sky-100 text-sky-800",
  "Evaluaciones completas": "bg-teal-100 text-teal-800",
  "En deliberación": "bg-orange-100 text-orange-800",
  Observado: "bg-yellow-100 text-yellow-800",
  Aprobado: "bg-green-100 text-green-800",
  Cerrado: "bg-zinc-200 text-zinc-700",
};

interface StatusBadgeProps {
  status: ExpedienteStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={`font-medium ${statusClasses[status]}`} variant="outline">
      {status}
    </Badge>
  );
}
