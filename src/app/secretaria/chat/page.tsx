"use client";

import { useMemo, useState } from "react";
import { MessageSquarePlus, Search } from "lucide-react";

import {
  useChatConversaciones,
  useChatHilo,
  useChatSolicitantes,
  useEnviarMensajeSecretaria,
} from "@/hooks";
import { ChatThread, ErrorState, PageHeader, PageSkeleton } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const ROL_LABELS: Record<string, string> = {
  estudiante_pregrado: "Estudiante de pregrado",
  estudiante_postgrado: "Estudiante de postgrado",
  investigador: "Investigador",
};

export default function ChatSecretariaPage() {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const conversacionesQuery = useChatConversaciones();
  const hiloQuery = useChatHilo(seleccionado);
  const solicitantesQuery = useChatSolicitantes(dialogAbierto);
  const enviarMutation = useEnviarMensajeSecretaria();

  const conversaciones = conversacionesQuery.data ?? [];
  const activa = conversaciones.find((c) => c.solicitanteId === seleccionado) ?? null;

  // Datos del solicitante seleccionado: de la bandeja o (si es chat nuevo) de la lista.
  const solicitanteActivo = useMemo(() => {
    if (activa) return activa;
    const item = (solicitantesQuery.data ?? []).find((s) => s.id === seleccionado);
    if (!item) return null;
    return {
      solicitanteId: item.id,
      nombre: item.nombre,
      rol: item.rol,
      email: item.email,
      codigoEstudiante: item.codigoEstudiante,
    };
  }, [activa, solicitantesQuery.data, seleccionado]);

  const solicitantesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    const lista = solicitantesQuery.data ?? [];
    if (!q) return lista;
    return lista.filter(
      (s) =>
        s.nombre.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.codigoEstudiante ?? "").toLowerCase().includes(q),
    );
  }, [solicitantesQuery.data, busqueda]);

  if (conversacionesQuery.isLoading) {
    return <PageSkeleton blocks={2} />;
  }

  if (conversacionesQuery.error) {
    return (
      <ErrorState
        title="Chat no disponible"
        description="No se pudo cargar la bandeja de conversaciones."
        onRetry={() => conversacionesQuery.refetch()}
      />
    );
  }

  const handleEnviar = async (texto: string) => {
    if (!seleccionado) return;
    try {
      await enviarMutation.mutateAsync({ solicitanteId: seleccionado, texto });
    } catch (sendError) {
      const message =
        sendError instanceof Error ? sendError.message : "No se pudo enviar el mensaje.";
      toast.error("Error al enviar", message);
      throw sendError;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chat con solicitantes"
        description="Conversaciones directas con estudiantes e investigadores. Los mensajes nuevos aparecen automáticamente."
      />

      <Card className="h-[calc(100vh-14rem)] min-h-[480px] overflow-hidden">
        <CardContent className="grid h-full grid-cols-1 gap-0 p-0 md:grid-cols-[320px_1fr]">
          {/* Panel izquierdo: bandeja */}
          <div className="flex min-h-0 flex-col border-r border-border">
            <div className="border-b border-border p-3">
              <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="w-full">
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    Nueva conversación
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Iniciar conversación</DialogTitle>
                  </DialogHeader>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={busqueda}
                      onChange={(event) => setBusqueda(event.target.value)}
                      placeholder="Buscar por nombre, código o correo"
                      className="pl-8"
                    />
                  </div>
                  <div className="max-h-72 space-y-1 overflow-y-auto">
                    {solicitantesQuery.isLoading ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">Cargando…</p>
                    ) : solicitantesFiltrados.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">Sin resultados.</p>
                    ) : (
                      solicitantesFiltrados.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSeleccionado(s.id);
                            setDialogAbierto(false);
                            setBusqueda("");
                          }}
                          className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          <p className="font-medium">{s.nombre}</p>
                          <p className="text-xs text-muted-foreground">
                            {ROL_LABELS[s.rol] ?? s.rol}
                            {s.codigoEstudiante ? ` · Código ${s.codigoEstudiante}` : ""} · {s.email}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              {conversaciones.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  Sin conversaciones todavía. Inicia una con &quot;Nueva conversación&quot;.
                </p>
              ) : (
                conversaciones.map((conv) => (
                  <button
                    key={conv.solicitanteId}
                    type="button"
                    onClick={() => setSeleccionado(conv.solicitanteId)}
                    className={cn(
                      "w-full border-b border-border px-3 py-2.5 text-left hover:bg-muted/60",
                      seleccionado === conv.solicitanteId && "bg-muted",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{conv.nombre}</p>
                      {conv.noLeidos > 0 ? (
                        <Badge className="shrink-0">{conv.noLeidos}</Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {conv.codigoEstudiante ? `Código ${conv.codigoEstudiante}` : ROL_LABELS[conv.rol] ?? conv.rol}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{conv.ultimoMensaje}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Panel derecho: hilo activo */}
          <div className="flex min-h-0 flex-col">
            {!seleccionado ? (
              <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
                Selecciona una conversación o inicia una nueva.
              </div>
            ) : (
              <>
                {solicitanteActivo ? (
                  <div className="border-b border-border px-4 py-3">
                    <p className="text-sm font-semibold">{solicitanteActivo.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {ROL_LABELS[solicitanteActivo.rol] ?? solicitanteActivo.rol}
                      {solicitanteActivo.codigoEstudiante
                        ? ` · Código ${solicitanteActivo.codigoEstudiante}`
                        : ""}
                      {" · "}
                      {solicitanteActivo.email}
                    </p>
                  </div>
                ) : null}
                <div className="min-h-0 flex-1">
                  <ChatThread
                    mensajes={hiloQuery.data ?? []}
                    perspectiva="secretaria"
                    nombreOtroLado={solicitanteActivo?.nombre ?? "Solicitante"}
                    onEnviar={handleEnviar}
                    enviando={enviarMutation.isPending}
                    vacioTexto="Aún no hay mensajes. Escribe el primero."
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
