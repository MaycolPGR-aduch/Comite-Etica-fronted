"use client";

import { useEffect, useState } from "react";

import { useConfiguracionCatalogos, useFechaLimite, useSetFechaLimite } from "@/hooks";
import { CountdownDeadline, PageHeader, PageSkeleton } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

const isoToLocalInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function ConfiguracionPage() {
  const { data, isLoading } = useConfiguracionCatalogos();
  const { data: fechaLimite } = useFechaLimite();
  const setFechaLimiteMutation = useSetFechaLimite();
  const [fechaInput, setFechaInput] = useState("");

  useEffect(() => {
    setFechaInput(fechaLimite ? isoToLocalInput(fechaLimite) : "");
  }, [fechaLimite]);

  const guardarFecha = async () => {
    try {
      const iso = fechaInput ? new Date(fechaInput).toISOString() : null;
      await setFechaLimiteMutation.mutateAsync(iso);
      toast.success(
        "Fecha límite actualizada",
        iso ? "Se guardó la nueva fecha de cierre." : "Se quitó la fecha límite.",
      );
    } catch {
      toast.error("No se pudo guardar la fecha límite");
    }
  };

  if (isLoading) {
    return <PageSkeleton blocks={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración institucional"
        description="Catálogos base que rigen el flujo de expedientes del Comité de Ética."
      />

      <Card>
        <CardHeader>
          <CardTitle>Fecha límite de envío de proyectos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Define hasta cuándo los estudiantes e investigadores pueden enviar proyectos. Pasada la
            fecha, el sistema bloquea los envíos.
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="fecha-limite">Fecha y hora de cierre</Label>
              <Input
                id="fecha-limite"
                type="datetime-local"
                value={fechaInput}
                onChange={(event) => setFechaInput(event.target.value)}
                className="w-64"
              />
            </div>
            <Button onClick={guardarFecha} disabled={setFechaLimiteMutation.isPending}>
              {setFechaLimiteMutation.isPending ? "Guardando…" : "Guardar"}
            </Button>
            {fechaInput ? (
              <Button
                variant="outline"
                onClick={() => setFechaInput("")}
                disabled={setFechaLimiteMutation.isPending}
              >
                Quitar fecha
              </Button>
            ) : null}
          </div>
          {fechaLimite ? (
            <CountdownDeadline fechaLimite={fechaLimite} variant="compact" />
          ) : (
            <p className="text-sm text-muted-foreground">No hay fecha límite configurada.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Tipos de tramite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data?.tiposTramite.map((item) => (
            <div key={item} className="rounded-md border p-2">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentos requeridos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data?.documentosRequeridos.map((item) => (
            <div key={item} className="rounded-md border p-2">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estados del expediente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data?.estados.map((item) => (
            <div key={item} className="rounded-md border p-2">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plantillas de notificacion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {data?.plantillasNotificacion.map((item) => (
            <div key={item} className="rounded-md border p-2">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
