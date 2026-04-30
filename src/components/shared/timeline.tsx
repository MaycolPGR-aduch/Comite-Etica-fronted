import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HistorialEvento } from "@/types";

interface TimelineProps {
  events: HistorialEvento[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative border-s border-blue-200 pl-6">
          {events.map((event) => (
            <li key={event.id} className="mb-6">
              <span className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-blue-500" />
              <h4 className="font-medium text-[#172033]">{event.titulo}</h4>
              <p className="text-sm text-slate-600">{event.descripcion}</p>
              <p className="text-xs text-slate-500">
                {new Date(event.fecha).toLocaleString()} - {event.actor}
              </p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
