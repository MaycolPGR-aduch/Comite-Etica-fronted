import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const funcionesPrincipales = [
  {
    titulo: "Registro y trazabilidad de expedientes",
    descripcion:
      "Centraliza la documentación de protocolos éticos y mantiene historial de acciones, observaciones y decisiones en un flujo auditable.",
  },
  {
    titulo: "Revisión administrativa y evaluación ética",
    descripcion:
      "Ordena la admisibilidad documental, la asignación de evaluadores y la revisión técnica en etapas claras para reducir reprocesos.",
  },
  {
    titulo: "Subsanación, consolidación y dictamen",
    descripcion:
      "Permite responder observaciones, comparar evaluaciones y emitir dictámenes con mayor consistencia y transparencia institucional.",
  },
];

const etapas = [
  "Registro del expediente por el investigador",
  "Validación administrativa por Secretaría Técnica",
  "Asignación de evaluadores por Coordinación",
  "Evaluación ética y emisión de recomendaciones",
  "Consolidación y comunicación de dictamen final",
];

const faqs = [
  {
    pregunta: "¿Necesito una cuenta para revisar esta información pública?",
    respuesta:
      "No. Esta sección está disponible sin autenticación para orientar a investigadores y usuarios sobre el funcionamiento general del sistema.",
  },
  {
    pregunta: "¿Puedo enviar protocolos desde esta sección informativa?",
    respuesta:
      "No directamente. Para registrar expedientes debe ingresar por la pantalla de acceso con su rol correspondiente.",
  },
  {
    pregunta: "¿Qué pasa si mi expediente tiene observaciones?",
    respuesta:
      "El sistema habilita una etapa de subsanación donde podrá responder observaciones y adjuntar nuevas versiones documentales antes de la reevaluación.",
  },
  {
    pregunta: "¿La evaluación se basa en criterios estandarizados?",
    respuesta:
      "Sí. El flujo está diseñado para registrar la rúbrica oficial de criterios, recomendaciones y consolidación final con evidencia trazable.",
  },
  {
    pregunta: "¿Puedo descargar el dictamen final?",
    respuesta:
      "Sí. Una vez emitido, el dictamen se publica en el expediente para consulta y descarga por los usuarios autorizados.",
  },
];

export default function AcercaComiteEticaPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033]">
      <header className="border-b border-blue-100 bg-white/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Comité de Ética</p>
            <h1 className="text-lg font-bold text-[#08204A]">Portal informativo</h1>
          </div>
          <Button asChild className="font-semibold" size="sm">
            <Link href="/login">Ir a inicio de sesión</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 lg:px-8 lg:py-12">
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="space-y-3">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Acerca del sistema</p>
              <CardTitle className="text-3xl font-bold leading-tight text-[#08204A]">
                Gestión y evaluación de protocolos del Comité de Ética
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-[15px] leading-7 text-slate-700">
              <p>
                Este sistema web organiza el ciclo completo de evaluación ética universitaria para fortalecer la transparencia,
                la trazabilidad y la calidad de las decisiones institucionales.
              </p>
              <p>
                Integra en un solo entorno a investigadores, Secretaría Técnica, Coordinación, evaluadores y administración,
                reduciendo tiempos de respuesta y mejorando el control del proceso.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="font-semibold" variant="secondary">
                  <Link href="/login">Acceder al sistema</Link>
                </Button>
                <Button asChild className="font-semibold" variant="outline">
                  <Link href="/recuperar-contrasena">Recuperar contraseña</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-blue-100 shadow-sm">
            <div className="relative h-80 w-full">
              <Image
                src="/universidad-fondo.png"
                alt="Campus de la Universidad de Ciencias y Humanidades"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08204A]/55 via-[#08204A]/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-md border border-white/25 bg-white/15 p-3 text-sm font-medium text-white backdrop-blur-sm">
                Universidad de Ciencias y Humanidades
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {funcionesPrincipales.map((funcion) => (
            <Card key={funcion.titulo} className="border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-[#08204A]">{funcion.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-slate-700">{funcion.descripcion}</CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#08204A]">Objetivo general del sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-[15px] leading-7 text-slate-700">
              <p>
                Proporcionar una plataforma institucional para gestionar de forma eficiente, ordenada y verificable el
                proceso de revisión de protocolos de investigación, garantizando cumplimiento ético y soporte para la toma
                de decisiones del Comité.
              </p>
              <p className="font-semibold text-[#08204A]">Flujo resumido</p>
              <ul className="space-y-2">
                {etapas.map((etapa) => (
                  <li key={etapa} className="flex items-start gap-2">
                    <ChevronRight className="mt-0.5 h-4 w-4 text-primary" />
                    <span>{etapa}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#08204A]">Preguntas frecuentes (FAQ)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.pregunta} className="rounded-md border border-blue-100 bg-white p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-[#08204A]">{faq.pregunta}</summary>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{faq.respuesta}</p>
                </details>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
