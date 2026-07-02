"use client";

import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";

import type { MensajeChat } from "@/services/chat.service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatThreadProps {
  mensajes: MensajeChat[];
  /** Cómo se ve el hilo: el lado "propio" va a la derecha. */
  perspectiva: "solicitante" | "secretaria";
  /** Nombre a mostrar sobre las burbujas del otro lado. */
  nombreOtroLado: string;
  onEnviar: (texto: string) => Promise<unknown>;
  enviando?: boolean;
  /** Mensaje del estado vacío. */
  vacioTexto?: string;
}

const formatFecha = (iso: string) => {
  const fecha = new Date(iso);
  const hoy = new Date();
  const esHoy = fecha.toDateString() === hoy.toDateString();
  const hora = fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  return esHoy ? hora : `${fecha.toLocaleDateString("es-PE")} ${hora}`;
};

export function ChatThread({
  mensajes,
  perspectiva,
  nombreOtroLado,
  onEnviar,
  enviando = false,
  vacioTexto = "No hay mensajes todavía.",
}: ChatThreadProps) {
  const [texto, setTexto] = useState("");
  const finRef = useRef<HTMLDivElement>(null);
  const ultimoIdRef = useRef<string | null>(null);

  // Auto-scroll solo cuando llega un mensaje nuevo (no en cada refetch del polling).
  useEffect(() => {
    const ultimoId = mensajes.length ? mensajes[mensajes.length - 1].id : null;
    if (ultimoId && ultimoId !== ultimoIdRef.current) {
      ultimoIdRef.current = ultimoId;
      finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [mensajes]);

  const esMio = (mensaje: MensajeChat) =>
    perspectiva === "secretaria" ? mensaje.esDeSecretaria : !mensaje.esDeSecretaria;

  const handleEnviar = async () => {
    const limpio = texto.trim();
    if (!limpio || enviando) return;
    // El texto solo se limpia si el envío tuvo éxito (no se pierde ante un error).
    await onEnviar(limpio);
    setTexto("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {mensajes.length === 0 ? (
          <p className="pt-8 text-center text-sm text-muted-foreground">{vacioTexto}</p>
        ) : (
          mensajes.map((mensaje) => {
            const mio = esMio(mensaje);
            return (
              <div key={mensaje.id} className={cn("flex", mio ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm",
                    mio ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  {!mio ? (
                    <p className="mb-0.5 text-xs font-semibold opacity-80">{nombreOtroLado}</p>
                  ) : null}
                  <p className="whitespace-pre-wrap break-words">{mensaje.texto}</p>
                  <p className={cn("mt-1 text-[10px]", mio ? "text-primary-foreground/70" : "text-muted-foreground")}>
                    {formatFecha(mensaje.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={finRef} />
      </div>

      <div className="flex items-end gap-2 border-t border-border p-3">
        <Textarea
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleEnviar();
            }
          }}
          placeholder="Escribe un mensaje… (Enter para enviar)"
          maxLength={2000}
          rows={2}
          className="min-h-0 flex-1 resize-none"
        />
        <Button
          type="button"
          onClick={() => void handleEnviar()}
          disabled={enviando || !texto.trim()}
          aria-label="Enviar mensaje"
        >
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
