"use client";

import { useChatMiHilo, useEnviarMensajeSolicitante } from "@/hooks";
import { ChatThread, ErrorState, PageHeader, PageSkeleton } from "@/components/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";

export default function ConsultasPage() {
  const { data: mensajes, isLoading, error, refetch } = useChatMiHilo();
  const enviarMutation = useEnviarMensajeSolicitante();

  if (isLoading) {
    return <PageSkeleton blocks={2} />;
  }

  if (error || !mensajes) {
    return (
      <ErrorState
        title="Chat no disponible"
        description="No se pudo cargar la conversación con secretaría."
        onRetry={() => refetch()}
      />
    );
  }

  const handleEnviar = async (texto: string) => {
    try {
      await enviarMutation.mutateAsync(texto);
    } catch (sendError) {
      const message =
        sendError instanceof Error ? sendError.message : "No se pudo enviar el mensaje.";
      toast.error("Error al enviar", message);
      throw sendError; // el input conserva el texto
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consultas a secretaría"
        description="Escríbele directamente a la Secretaría del Comité por cualquier duda sobre tus proyectos o el proceso."
      />
      <Card className="flex h-[calc(100vh-16rem)] min-h-[420px] flex-col">
        <CardHeader className="border-b border-border py-4">
          <CardTitle className="text-base">Secretaría del Comité</CardTitle>
          <CardDescription>Responden en horario de oficina. Los mensajes nuevos aparecen automáticamente.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 p-0">
          <ChatThread
            mensajes={mensajes}
            perspectiva="solicitante"
            nombreOtroLado="Secretaría del Comité"
            onEnviar={handleEnviar}
            enviando={enviarMutation.isPending}
            vacioTexto="Escríbenos tu consulta: ¿dudas sobre documentos, plazos o el estado de tu proyecto?"
          />
        </CardContent>
      </Card>
    </div>
  );
}
