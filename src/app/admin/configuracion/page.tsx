"use client";

import { useConfiguracionCatalogos } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfiguracionPage() {
  const { data, isLoading } = useConfiguracionCatalogos();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando configuracion...</p>;
  }

  return (
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
  );
}
