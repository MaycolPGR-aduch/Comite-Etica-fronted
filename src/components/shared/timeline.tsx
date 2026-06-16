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
        <ol className="relative border-s border-border pl-6">
          {events.map((event) => (
            <li key={event.id} className="mb-6 last:mb-0">
              <span className="absolute -start-1.5 mt-1.5 size-3 rounded-full bg-primary ring-4 ring-primary/10" />
              <h4 className="font-medium text-foreground">{event.titulo}</h4>
              <p className="text-sm text-muted-foreground">{event.descripcion}</p>
              <p className="text-xs text-muted-foreground/80">
                {new Date(event.fecha).toLocaleString()} - {event.actor}
              </p>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
