"use client";

import { useConfiguracionCatalogos } from "@/hooks";
import { PageHeader, PageSkeleton } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfiguracionPage() {
  const { data, isLoading } = useConfiguracionCatalogos();

  if (isLoading) {
    return <PageSkeleton blocks={4} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuración institucional"
        description="Catálogos base que rigen el flujo de expedientes del Comité de Ética."
      />
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
