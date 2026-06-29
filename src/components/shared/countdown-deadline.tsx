"use client";

import { useEffect, useState } from "react";

interface CountdownDeadlineProps {
  fechaLimite: string | null;
  variant?: "full" | "compact";
}

const formatFecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });

const calcularRestante = (target: number, now: number) => {
  const ms = Math.max(0, target - now);
  const totalSeg = Math.floor(ms / 1000);
  return {
    dias: Math.floor(totalSeg / 86400),
    horas: Math.floor((totalSeg % 86400) / 3600),
    min: Math.floor((totalSeg % 3600) / 60),
    seg: totalSeg % 60,
    vencido: ms <= 0,
  };
};

export function CountdownDeadline({ fechaLimite, variant = "full" }: CountdownDeadlineProps) {
  // `now` se llena recién en el cliente para evitar desajustes de hidratación.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!fechaLimite) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [fechaLimite]);

  if (!fechaLimite || now === null) return null;

  const target = new Date(fechaLimite).getTime();
  const { dias, horas, min, seg, vencido } = calcularRestante(target, now);
  const fechaTxt = formatFecha(fechaLimite);

  if (variant === "compact") {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        {vencido ? (
          <span className="font-semibold text-destructive">
            ⏰ Envíos cerrados — la fecha límite venció el {fechaTxt}.
          </span>
        ) : (
          <span>
            ⏰ Cierre de envíos: <strong>{fechaTxt}</strong> · faltan {dias}d {horas}h {min}m {seg}s
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-center text-amber-900">
      <p className="text-sm font-bold tracking-wide">❗ IMPORTANTE ❗</p>
      <p className="mt-1 text-lg font-semibold">Fecha límite de envío: {fechaTxt}</p>

      {vencido ? (
        <p className="mt-3 text-base font-semibold text-destructive">
          Los envíos están cerrados.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {[
            { label: "Días", value: dias },
            { label: "Horas", value: horas },
            { label: "Minutos", value: min },
            { label: "Segundos", value: seg },
          ].map((item) => (
            <div
              key={item.label}
              className="flex w-20 flex-col items-center rounded-md border border-amber-300 bg-white px-2 py-2"
            >
              <span className="text-3xl font-bold tabular-nums text-[#08204A]">{item.value}</span>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
