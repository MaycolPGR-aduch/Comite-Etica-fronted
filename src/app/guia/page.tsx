import Link from "next/link";

import {
  DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS,
  DOCUMENT_UPLOAD_MAX_SIZE_BYTES,
} from "@/services/expedientes.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MAX_SIZE_MB = Math.floor(DOCUMENT_UPLOAD_MAX_SIZE_BYTES / (1024 * 1024));

// Plantillas y documentos oficiales del Comité de Ética de la UCH.
const plantillas = [
  {
    label: "Solicitud de Evaluación por Comité de Ética",
    descripcion: "Dirigida al Presidente del Comité, completada y firmada (PDF).",
    href:
      "https://docs.google.com/document/d/1KyxHvJhT2Xaju3MxHjMLaH9QhoSnW2Wn/edit?usp=sharing&ouid=110886888260713930953&rtpof=true&sd=true",
  },
  {
    label: "Carta de aprobación del docente o asesor",
    descripcion: "Declara que el proyecto es apto para evaluación ética, firmada (PDF).",
    href:
      "https://docs.google.com/document/d/1AMR9W-s2OJSwkHqxOVaEz1gOLOIwX0XQ/edit?usp=sharing&ouid=110886888260713930953&rtpof=true&sd=true",
  },
  {
    label: "Proceso del pago mediante el ERP",
    descripcion: "Instructivo para generar la boleta de pago del trámite.",
    href: "https://drive.google.com/file/d/1g2UUEA2scvenOzWBPbli3UmZNoAfqo0o/view?usp=sharing",
  },
  {
    label: "Estructura del nombre de archivos",
    descripcion: "Nomenclatura obligatoria; los archivos que no la cumplan no serán evaluados.",
    href: "https://drive.google.com/file/d/1qPmUNu7zh7kTX9G-b4cz5oPkl8V90Ey9/view?usp=sharing",
  },
];

const cargasAcademicas = [
  "Nutrición y Dietética",
  "Medicina Humana",
  "Psicología",
  "Farmacia y Bioquímica",
  "Enfermería",
];

const requisitos = [
  "Contar con una cuenta de investigador registrada en el sistema.",
  "Que el proyecto cumpla con la estructura establecida por la UCH.",
  "Completar el pago del trámite a través del ERP institucional.",
  "Remitir el expediente completo con toda la documentación obligatoria.",
  "Nombrar los archivos según la estructura establecida por el Comité.",
  "Enviar la documentación dentro de la fecha límite.",
];

const documentosPorTipo = [
  {
    tipo: "Estudiante de Pregrado",
    documentos: [
      "Boleta de pago del trámite",
      "Carta de aprobación del docente o asesor",
      "Solicitud de evaluación al Comité de Ética",
      "Proyecto de investigación en PDF",
      "Proyecto de investigación en Word",
    ],
  },
  {
    tipo: "Estudiante de Postgrado",
    documentos: [
      "Boleta de pago del trámite",
      "Carta de aprobación del docente o asesor",
      "Solicitud de evaluación al Comité de Ética",
      "Proyecto de investigación en PDF",
      "Proyecto de investigación en Word",
    ],
  },
  {
    tipo: "Investigador",
    documentos: ["Proyecto de investigación en PDF", "Proyecto de investigación en Word"],
  },
];

const pasos = [
  {
    titulo: "1. Pago del trámite",
    descripcion:
      "Realice el pago del concepto “Evaluación de proyecto de tesis por Comité de Ética” a través del ERP institucional.",
  },
  {
    titulo: "2. Envío de documentos",
    descripcion:
      "Registre el expediente en el sistema y cargue el proyecto en Word y PDF, la solicitud firmada, la carta de aprobación y la boleta de pago, respetando la nomenclatura de archivos.",
  },
  {
    titulo: "3. Revisión ética",
    descripcion:
      "El Comité evalúa el proyecto verificando el cumplimiento de los principios éticos, la normativa vigente y la protección de los derechos de los participantes.",
  },
  {
    titulo: "4. Comunicación de resultados",
    descripcion:
      "Se notifica el resultado de la evaluación al investigador a través del sistema.",
  },
];

const pasosSubida = [
  "Ingrese a “Nuevo expediente” y complete los datos del proyecto.",
  "Avance a la etapa de documentos: verá el checklist según su tipo de solicitante.",
  "Seleccione el archivo de cada documento requerido y confirme la carga.",
  "Revise el resumen del envío y confirme para remitir el expediente al Comité.",
];

const faqs = [
  {
    pregunta: "¿Qué formatos de archivo se aceptan?",
    respuesta: `Se aceptan archivos ${DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS.join(", ")}, con un tamaño máximo de ${MAX_SIZE_MB} MB por archivo.`,
  },
  {
    pregunta: "¿Por qué mis archivos deben tener una nomenclatura específica?",
    respuesta:
      "El Comité define una estructura de nombre de archivos para identificar correctamente cada documento. Los archivos que no cumplan la nomenclatura no serán considerados en la evaluación.",
  },
  {
    pregunta: "¿Quién puede registrarse en el sistema?",
    respuesta:
      "El registro está habilitado para investigadores. El personal del Comité accede con cuentas provistas por la institución.",
  },
  {
    pregunta: "¿Qué pasa si mi expediente tiene observaciones?",
    respuesta:
      "El sistema habilita una etapa de subsanación donde podrá responder las observaciones y adjuntar nuevas versiones documentales antes de la reevaluación.",
  },
];

export default function GuiaPage() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033]">
      <header className="border-b border-blue-100 bg-white/95">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Comité de Ética</p>
            <h1 className="text-lg font-bold text-[#08204A]">Guía de envío de expedientes</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild className="font-semibold" size="sm" variant="outline">
              <Link href="/acerca-comite-etica">Acerca del Comité</Link>
            </Button>
            <Button asChild className="font-semibold" size="sm">
              <Link href="/login">Ir a inicio de sesión</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 lg:px-8 lg:py-12">
        <section className="space-y-2">
          <h2 className="text-3xl font-bold leading-tight text-[#08204A]">
            Cómo enviar tu proyecto al Comité de Ética
          </h2>
          <p className="text-[15px] leading-7 text-slate-700">
            Antes de registrar tu expediente revisa los requisitos, la documentación obligatoria y el
            procedimiento de carga. El envío se realiza por este sistema.
          </p>
        </section>

        <Tabs defaultValue="requisitos" className="w-full">
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="requisitos">Requisitos</TabsTrigger>
            <TabsTrigger value="documentos">Documentación</TabsTrigger>
            <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
            <TabsTrigger value="subida">Cómo subir</TabsTrigger>
            <TabsTrigger value="flujo">Proceso</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="requisitos">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#08204A]">Requisitos para enviar un expediente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc space-y-2 pl-5 text-[15px] leading-7 text-slate-700">
                  {requisitos.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="rounded-lg border border-border p-4">
                  <p className="mb-2 font-semibold text-[#08204A]">
                    Cargas académicas que pasan por evaluación ética
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cargasAcademicas.map((carga) => (
                      <span
                        key={carga}
                        className="rounded-full border border-primary/30 bg-[#EAF5FF] px-3 py-1 text-sm text-[#08204A]"
                      >
                        {carga}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentos">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#08204A]">Documentación obligatoria por tipo</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                {documentosPorTipo.map((grupo) => (
                  <div key={grupo.tipo} className="rounded-lg border border-border p-4">
                    <p className="mb-2 font-semibold text-[#08204A]">{grupo.tipo}</p>
                    <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                      {grupo.documentos.map((doc) => (
                        <li key={doc}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plantillas">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#08204A]">Plantillas y documentos oficiales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {plantillas.map((plantilla) => (
                  <a
                    key={plantilla.href}
                    href={plantilla.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg border border-border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-[#EAF5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <p className="font-semibold text-[#08204A]">{plantilla.label}</p>
                    <p className="text-sm leading-6 text-slate-700">{plantilla.descripcion}</p>
                  </a>
                ))}
                <p className="text-sm text-muted-foreground">
                  Estos documentos se preparan previamente y luego se cargan en el sistema al registrar el
                  expediente.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subida">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#08204A]">Cómo subir los documentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[15px] leading-7 text-slate-700">
                <ol className="list-decimal space-y-2 pl-5">
                  {pasosSubida.map((paso) => (
                    <li key={paso}>{paso}</li>
                  ))}
                </ol>
                <div className="rounded-lg border border-primary/30 bg-[#EAF5FF] p-4 text-sm">
                  <p className="font-semibold text-[#08204A]">Formatos y restricciones</p>
                  <p>Formatos permitidos: {DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS.join(", ")}.</p>
                  <p>Tamaño máximo por archivo: {MAX_SIZE_MB} MB.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flujo">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#08204A]">Proceso de evaluación</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {pasos.map((paso) => (
                  <div key={paso.titulo} className="rounded-lg border border-border p-4">
                    <p className="mb-1 font-semibold text-[#08204A]">{paso.titulo}</p>
                    <p className="text-sm leading-6 text-slate-700">{paso.descripcion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq">
            <Card className="border-blue-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-[#08204A]">Preguntas frecuentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.pregunta} className="space-y-1">
                    <p className="font-semibold text-[#08204A]">{faq.pregunta}</p>
                    <p className="text-[15px] leading-7 text-slate-700">{faq.respuesta}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
