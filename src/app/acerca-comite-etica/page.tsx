import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Clock, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const objetivos = [
  "Promover la integridad científica y las buenas prácticas de investigación.",
  "Garantizar la confiabilidad ética de los proyectos de investigación desarrollados en la UCH.",
  "Proteger los derechos, la seguridad y el bienestar de las personas involucradas en investigaciones.",
  "Fortalecer la responsabilidad ética en la comunidad universitaria.",
  "Asegurar el cumplimiento de los principios éticos y la normativa vigente en investigación.",
];

const funcionesPrincipales = [
  {
    titulo: "Orientación ética",
    descripcion:
      "Brinda orientación ética a estudiantes, docentes e investigadores de la comunidad universitaria.",
  },
  {
    titulo: "Buenas prácticas de investigación",
    descripcion:
      "Promueve la integridad, la transparencia y las buenas prácticas en la investigación universitaria.",
  },
  {
    titulo: "Evaluación y supervisión",
    descripcion:
      "Evalúa y supervisa los proyectos de investigación, verificando el cumplimiento de los principios éticos y la normativa vigente.",
  },
];

const etapas = [
  "Registro del expediente por el investigador",
  "Validación administrativa por Secretaría Técnica",
  "Asignación de evaluador por Coordinación",
  "Evaluación ética y emisión del resultado",
  "Comunicación del dictamen final",
];

const contacto = [
  { icon: MapPin, label: "Tercer piso del Pabellón A · Campus UCH" },
  { icon: Clock, label: "Lunes a viernes: 8:00 a. m. – 5:00 p. m." },
  { icon: Phone, label: "500 3100 · Anexo 1273  ·  +51 913 596 223" },
  { icon: Mail, label: "comite_etica@uch.edu.pe" },
];

const faqs = [
  {
    pregunta: "¿Necesito una cuenta para revisar esta información pública?",
    respuesta:
      "No. Esta sección está disponible sin autenticación para orientar a investigadores y usuarios sobre el funcionamiento general del Comité y del sistema.",
  },
  {
    pregunta: "¿Cómo envío mi proyecto al Comité de Ética?",
    respuesta:
      "El envío se realiza a través de este sistema. Ingrese con su cuenta de investigador y registre su expediente en “Nuevo expediente”. Revise antes la Guía de envío y requisitos.",
  },
  {
    pregunta: "¿Qué pasa si mi expediente tiene observaciones?",
    respuesta:
      "El sistema habilita una etapa de subsanación donde podrá responder las observaciones y adjuntar nuevas versiones documentales antes de la reevaluación.",
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
          <div className="flex items-center gap-2">
            <Button asChild className="font-semibold" size="sm" variant="outline">
              <Link href="/guia">Guía de envío</Link>
            </Button>
            <Button asChild className="font-semibold" size="sm">
              <Link href="/login">Ir a inicio de sesión</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 lg:px-8 lg:py-12">
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader className="space-y-3">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Acerca del Comité</p>
              <CardTitle className="text-3xl font-bold leading-tight text-[#08204A]">
                Comité de Ética de la Universidad de Ciencias y Humanidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-[15px] leading-7 text-slate-700">
              <p>
                El Comité de Ética es el órgano responsable de evaluar y supervisar los proyectos de
                investigación desarrollados en la Universidad de Ciencias y Humanidades (UCH), asegurando
                el cumplimiento de los principios éticos, la normativa vigente y el respeto a la dignidad
                humana.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="font-semibold" variant="secondary">
                  <Link href="/login">Acceder al sistema</Link>
                </Button>
                <Button asChild className="font-semibold" variant="outline">
                  <Link href="/guia">Guía de envío y requisitos</Link>
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

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#08204A]">Misión</CardTitle>
            </CardHeader>
            <CardContent className="text-[15px] leading-7 text-slate-700">
              Acompañar a nuestros estudiantes reforzando permanentemente su motivación y desempeño
              académico, así como la orientación hacia la investigación y el desarrollo de su
              autoconocimiento para un adecuado desenvolvimiento profesional.
            </CardContent>
          </Card>
          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#08204A]">Visión</CardTitle>
            </CardHeader>
            <CardContent className="text-[15px] leading-7 text-slate-700">
              Contar con profesionales egresados preparados para enfrentar los retos que su carrera y la
              sociedad le exigen, favoreciendo de esta manera al avance de nuestro país y la humanidad.
            </CardContent>
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
              <CardTitle className="text-2xl font-bold text-[#08204A]">Objetivos del Comité</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-[15px] leading-7 text-slate-700">
                {objetivos.map((objetivo) => (
                  <li key={objetivo} className="flex items-start gap-2">
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <span>{objetivo}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#08204A]">Flujo del sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-[15px] leading-7 text-slate-700">
                {etapas.map((etapa) => (
                  <li key={etapa} className="flex items-start gap-2">
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    <span>{etapa}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#08204A]">Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[15px] leading-7 text-slate-700">
              {contacto.map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  <span>{item.label}</span>
                </div>
              ))}
              <p className="pt-2 text-sm text-muted-foreground">
                Respaldo normativo: Resolución de Rectorado N.º 014-2025-R-UCH, emitida el 25 de febrero
                de 2025, con vigencia del 01 de marzo de 2024 al 31 de diciembre de 2026.
              </p>
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
