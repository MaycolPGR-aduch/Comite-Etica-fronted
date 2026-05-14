"use client";

import { Bell } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  useCrearNotificacion,
  useMarcarNotificacionLeida,
  useMarcarTodasNotificacionesLeidas,
  useMyProfile,
  useNotificaciones,
  useNotificacionesSinLeer,
} from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

type Filter = "all" | "unread";

export function NotificationsPanel() {
  const [filter, setFilter] = useState<Filter>("all");
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [expedienteId, setExpedienteId] = useState("");

  const { data: profile } = useMyProfile();
  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useNotificaciones(filter);
  const { data: unreadCount } = useNotificacionesSinLeer();
  const createMutation = useCrearNotificacion();
  const markMutation = useMarcarNotificacionLeida();
  const markAllMutation = useMarcarTodasNotificacionesLeidas();

  const orderedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    if (!titulo.trim() || !mensaje.trim()) return;

    await createMutation.mutateAsync({
      titulo: titulo.trim(),
      mensaje: mensaje.trim(),
      usuarioId: profile.id,
      expedienteId: expedienteId.trim() || undefined,
    });

    setTitulo("");
    setMensaje("");
    setExpedienteId("");
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative" aria-label="Abrir notificaciones">
          <Bell className="h-4 w-4" />
          {unreadCount && unreadCount.sinLeer > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#0B57B7] px-1 text-[10px] font-semibold text-white">
              {unreadCount.sinLeer > 99 ? "99+" : unreadCount.sinLeer}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Notificaciones</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex rounded-md border border-slate-200 p-1">
              <button
                type="button"
                className={`rounded px-3 py-1 text-xs ${
                  filter === "all" ? "bg-slate-100 font-medium text-slate-900" : "text-slate-600"
                }`}
                onClick={() => setFilter("all")}
              >
                Todas
              </button>
              <button
                type="button"
                className={`rounded px-3 py-1 text-xs ${
                  filter === "unread"
                    ? "bg-slate-100 font-medium text-slate-900"
                    : "text-slate-600"
                }`}
                onClick={() => setFilter("unread")}
              >
                No leídas
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending || (unreadCount?.sinLeer ?? 0) === 0}
            >
              Marcar todas
            </Button>
          </div>

          <div className="max-h-72 space-y-2 overflow-auto rounded-md border border-slate-200 p-3">
            {isLoading ? (
              <p className="text-sm text-slate-500">Cargando notificaciones...</p>
            ) : null}

            {isError ? (
              <div className="space-y-2">
                <p className="text-sm text-red-600">
                  {error instanceof Error ? error.message : "No se pudieron cargar las notificaciones."}
                </p>
                <Button size="sm" variant="outline" onClick={() => refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : null}

            {!isLoading && !isError && orderedNotifications.length === 0 ? (
              <p className="text-sm text-slate-500">No hay notificaciones para este filtro.</p>
            ) : null}

            {!isLoading && !isError
              ? orderedNotifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (!item.leida && !markMutation.isPending) {
                        markMutation.mutate({ id: item.id, leida: true });
                      }
                    }}
                    className={`w-full rounded-md border p-3 text-left text-sm transition ${
                      item.leida
                        ? "border-slate-200 bg-white text-slate-600"
                        : "border-blue-200 bg-blue-50 text-[#08204A]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">{item.titulo}</p>
                      <span className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1 text-xs">{item.mensaje}</p>
                    {item.expedienteId ? (
                      <p className="mt-1 text-[11px] text-slate-500">Expediente #{item.expedienteId}</p>
                    ) : null}
                  </button>
                ))
              : null}
          </div>

          <form onSubmit={handleCreate} className="space-y-2 rounded-md border border-slate-200 p-3">
            <p className="text-sm font-medium text-[#08204A]">Crear notificación</p>
            <Input
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Título"
              maxLength={120}
              aria-label="Título de notificación"
            />
            <Textarea
              value={mensaje}
              onChange={(event) => setMensaje(event.target.value)}
              placeholder="Mensaje"
              rows={3}
              maxLength={500}
              aria-label="Mensaje de notificación"
            />
            <Input
              value={expedienteId}
              onChange={(event) => setExpedienteId(event.target.value)}
              placeholder="ID de expediente (opcional)"
              aria-label="ID de expediente opcional"
            />
            <Button
              type="submit"
              size="sm"
              disabled={
                createMutation.isPending || !profile || !titulo.trim() || !mensaje.trim()
              }
            >
              {createMutation.isPending ? "Creando..." : "Crear"}
            </Button>
            {createMutation.isError ? (
              <p className="text-xs text-red-600">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "No se pudo crear la notificación."}
              </p>
            ) : null}
            {createMutation.isSuccess ? (
              <p className="text-xs text-emerald-700">Notificación creada correctamente.</p>
            ) : null}
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
