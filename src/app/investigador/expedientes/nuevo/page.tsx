"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  useCrearExpedienteDinamico,
  useEnviarExpediente,
  useExpedienteCatalogos,
  useFechaLimite,
  useRegistrarDocumentoExpediente,
} from "@/hooks";
import {
  DOCUMENT_FORMATS,
  DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS,
  DOCUMENT_UPLOAD_MAX_SIZE_BYTES,
  expedientesService,
  plantillaUrl,
} from "@/services/expedientes.service";
import { CountdownDeadline, PageHeader, useConfirm } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";

const MODALIDAD_LABEL: Record<string, string> = {
  pregrado: "Estudiante de pregrado",
  postgrado: "Estudiante de postgrado",
  interno: "Proyecto interno (investigador)",
};

const STEPS = ["Datos e integrantes", "Documentos", "Revisar y enviar"];

interface AutorForm {
  apellidos_nombres: string;
  codigo_estudiante: string;
  correo: string;
  telefono: string;
}

interface FormData {
  titulo: string;
  programa: string;
  ciclo: string;
  nivel: string;
  autores: AutorForm[];
}

const emptyAutor: AutorForm = {
  apellidos_nombres: "",
  codigo_estudiante: "",
  correo: "",
  telefono: "",
};

const parseFaltantes = (error: unknown): string[] | null => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (detail && typeof detail === "object" && Array.isArray((detail as { faltantes?: unknown }).faltantes)) {
      return (detail as { faltantes: string[] }).faltantes;
    }
    if (typeof detail === "string") return [detail];
  }
  if (error instanceof Error) return [error.message];
  return null;
};

export default function NuevoExpedientePage() {
  const { data: catalogos, isLoading } = useExpedienteCatalogos();
  const { data: fechaLimite } = useFechaLimite();
  const crearMutation = useCrearExpedienteDinamico();
  const registrarDocMutation = useRegistrarDocumentoExpediente();
  const enviarMutation = useEnviarExpediente();
  const confirm = useConfirm();

  const [step, setStep] = useState(1);
  const [enviado, setEnviado] = useState(false);
  const [expediente, setExpediente] = useState<{ id: string; codigo: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [faltantes, setFaltantes] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [registeredDocs, setRegisteredDocs] = useState<Record<string, boolean>>({});
  // Guía/plantilla que se está previsualizando en el modal (PDF o imagen).
  const [guia, setGuia] = useState<{ url: string; title: string } | null>(null);

  const modalidad = catalogos?.modalidad ?? null;
  const esEstudiante = modalidad === "pregrado" || modalidad === "postgrado";
  const esInterno = modalidad === "interno";

  // El Comité diferencia: estudiantes suman "autores"; investigadores, "coautores".
  const autorTermCap = esInterno ? "Coautor" : "Autor";
  const autoresSeccionLabel = esInterno ? "Coautores del proyecto" : "Autores del proyecto";
  const autorPrincipalLabel = esInterno ? "Investigador principal" : "Autor principal";
  const agregarAutorLabel = esInterno ? "+ Agregar coautor" : "+ Agregar autor";
  const autoresPluralLabel = esInterno ? "Coautores" : "Autores";

  const requiredDocs = useMemo(
    () => (modalidad ? catalogos?.documentos_requeridos[modalidad] ?? [] : []),
    [catalogos, modalidad],
  );

  const form = useForm<FormData>({
    defaultValues: { titulo: "", programa: "", ciclo: "", nivel: "", autores: [emptyAutor] },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "autores" });

  const docsComplete = requiredDocs.every((doc) => Boolean(selectedFiles[doc.tipo]));
  const isWorking =
    crearMutation.isPending || registrarDocMutation.isPending || enviarMutation.isPending;

  // Envíos cerrados si ya pasó la fecha límite (se evalúa en cliente).
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => {
    setAhora(Date.now());
  }, []);
  const cerrado =
    Boolean(fechaLimite) && ahora !== null && new Date(fechaLimite as string).getTime() < ahora;

  // ---- Paso 1 -> 2: validar datos e integrantes ----
  const handleContinuarDatos = () => {
    setError(null);
    const v = form.getValues();

    if (v.titulo.trim().length < 10) return setError("El título debe tener al menos 10 caracteres.");
    if (!v.programa) return setError("Selecciona el programa de estudios.");
    if (modalidad === "pregrado" && !v.ciclo) return setError("Selecciona el ciclo.");
    if (modalidad === "postgrado" && !v.nivel) return setError("Selecciona el nivel de posgrado.");

    for (const [i, a] of v.autores.entries()) {
      if (!a.apellidos_nombres.trim()) return setError(`${autorTermCap} ${i + 1}: falta apellidos y nombres.`);
      if (!a.correo.trim()) return setError(`${autorTermCap} ${i + 1}: falta correo.`);
      if (!a.telefono.trim()) return setError(`${autorTermCap} ${i + 1}: falta teléfono.`);
      if (esEstudiante && !a.codigo_estudiante.trim())
        return setError(`${autorTermCap} ${i + 1}: falta código de estudiante.`);
    }

    setStep(2);
  };

  // ---- Paso 2 -> 3: validar documentos seleccionados ----
  const handleContinuarDocumentos = () => {
    setError(null);
    if (!docsComplete) return setError("Adjunta todos los documentos requeridos.");
    setStep(3);
  };

  // ---- Paso 3: crear expediente, subir documentos y enviar ----
  const handleEnviar = async () => {
    setError(null);
    setFaltantes([]);

    if (cerrado) {
      setError("Los envíos están cerrados: la fecha límite ya venció.");
      return;
    }

    const ok = await confirm({
      title: "Enviar al Comité de Ética",
      description: "Se remitirá el proyecto y dejará de ser editable. ¿Deseas enviarlo?",
      confirmLabel: "Enviar",
    });
    if (!ok) return;

    try {
      let exp = expediente;
      if (!exp) {
        const v = form.getValues();
        exp = await crearMutation.mutateAsync({
          titulo: v.titulo.trim(),
          programaEstudios: v.programa,
          ciclo: modalidad === "pregrado" ? v.ciclo : undefined,
          nivelPosgrado: modalidad === "postgrado" ? v.nivel : undefined,
          autores: v.autores.map((a) => ({
            apellidos_nombres: a.apellidos_nombres.trim(),
            codigo_estudiante: esInterno ? undefined : a.codigo_estudiante.trim(),
            correo: a.correo.trim(),
            telefono: a.telefono.trim(),
          })),
        });
        setExpediente(exp);
      }

      for (const doc of requiredDocs.filter((d) => !registeredDocs[d.tipo])) {
        const file = selectedFiles[doc.tipo];
        if (!file) throw new Error(`Falta el archivo: ${doc.label}.`);
        await registrarDocMutation.mutateAsync({
          expedienteId: exp.id,
          file,
          tipoDocumento: doc.tipo,
          esObligatorio: true,
        });
        setRegisteredDocs((cur) => ({ ...cur, [doc.tipo]: true }));
      }

      const result = await enviarMutation.mutateAsync(exp.id);
      // El código formal (N-AÑO) se asigna al enviar; lo reflejamos en la confirmación.
      setExpediente((prev) => (prev ? { ...prev, codigo: result.codigo ?? prev.codigo } : prev));
      setEnviado(true);
      toast.success("Proyecto enviado", "Tu proyecto fue remitido al Comité de Ética.");
    } catch (e) {
      const fs = parseFaltantes(e);
      if (fs && fs.length > 1) {
        setFaltantes(fs);
        setError("El proyecto está incompleto. Revisa lo que falta.");
      } else {
        setError(fs?.[0] ?? "No se pudo enviar el proyecto.");
      }
      toast.error("No se pudo enviar", "Revisa los datos y vuelve a intentar.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Nuevo proyecto" description="Cargando formulario..." />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!modalidad) {
    return (
      <div className="space-y-4">
        <PageHeader title="Nuevo proyecto" description="Envío de proyectos al Comité de Ética." />
        <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
          <AlertTitle>No disponible para tu rol</AlertTitle>
          <AlertDescription>
            Solo los estudiantes de pregrado, postgrado e investigadores pueden enviar proyectos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo proyecto"
        description={`Modalidad detectada por tu rol: ${MODALIDAD_LABEL[modalidad]}.`}
      />

      <CountdownDeadline fechaLimite={fechaLimite ?? null} variant="compact" />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 grid grid-cols-3 gap-2 text-xs font-medium">
            {STEPS.map((label, index) => {
              const current = index + 1;
              const active = step >= current;
              return (
                <div
                  key={label}
                  className={`rounded-md px-3 py-2 text-center ${
                    active ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {current}. {label}
                </div>
              );
            })}
          </div>

          {error ? (
            <Alert className="mb-4 border-destructive/30 bg-destructive/5 text-destructive">
              <AlertTitle>Atención</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {faltantes.length > 0 ? (
            <Alert className="mb-4 border-amber-300 bg-amber-50 text-amber-900">
              <AlertTitle>Falta completar:</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5">
                  {faltantes.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : null}

          {/* ---------- PASO 1: Datos e integrantes ---------- */}
          {step === 1 ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="titulo">Título del proyecto</Label>
                  <Input id="titulo" {...form.register("titulo")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="programa">Programa de estudios</Label>
                  <select
                    id="programa"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register("programa")}
                  >
                    <option value="">Seleccione…</option>
                    {catalogos?.programas_estudios.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {modalidad === "pregrado" ? (
                  <div className="space-y-2">
                    <Label htmlFor="ciclo">Ciclo</Label>
                    <select
                      id="ciclo"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...form.register("ciclo")}
                    >
                      <option value="">Seleccione…</option>
                      {catalogos?.ciclos.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {modalidad === "postgrado" ? (
                  <div className="space-y-2">
                    <Label htmlFor="nivel">Nivel de posgrado</Label>
                    <select
                      id="nivel"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      {...form.register("nivel")}
                    >
                      <option value="">Seleccione…</option>
                      {catalogos?.niveles_posgrado.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">{autoresSeccionLabel}</Label>
                  <Button type="button" variant="secondary" size="sm" onClick={() => append(emptyAutor)}>
                    {agregarAutorLabel}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  El primer integrante es el responsable / autor principal.
                </p>

                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-3 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {index === 0 ? autorPrincipalLabel : `${autorTermCap} ${index + 1}`}
                      </span>
                      {index > 0 ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                          Quitar
                        </Button>
                      ) : null}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1 md:col-span-2">
                        <Label>Apellidos y nombres</Label>
                        <Input
                          placeholder="Ramos Castro José Carlos"
                          {...form.register(`autores.${index}.apellidos_nombres` as const)}
                        />
                      </div>
                      {esEstudiante ? (
                        <div className="space-y-1">
                          <Label>Código de estudiante</Label>
                          <Input {...form.register(`autores.${index}.codigo_estudiante` as const)} />
                        </div>
                      ) : null}
                      <div className="space-y-1">
                        <Label>Correo electrónico</Label>
                        <Input type="email" {...form.register(`autores.${index}.correo` as const)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Teléfono</Label>
                        <Input {...form.register(`autores.${index}.telefono` as const)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="button" onClick={handleContinuarDatos}>
                Continuar a documentos
              </Button>
            </div>
          ) : null}

          {/* ---------- PASO 2: Documentos ---------- */}
          {step === 2 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Adjunta los {requiredDocs.length} documentos requeridos para {MODALIDAD_LABEL[modalidad]}.
              </p>

              {catalogos?.guia_nombres ? (
                <Alert className="border-blue-200 bg-blue-50 text-blue-900">
                  <AlertTitle>📂 Nombre de los archivos (importante)</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <p>{catalogos.guia_nombres.texto}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setGuia({
                          url: plantillaUrl(catalogos.guia_nombres.key, "ver"),
                          title: "Estructura del nombre de los archivos",
                        })
                      }
                    >
                      Ver guía
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null}

              {requiredDocs.map((doc) => {
                const formato = DOCUMENT_FORMATS[doc.tipo];
                const formatoLabel = formato?.label ?? "PDF / Word";
                const acceptValue = (formato?.extensions ?? DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS).join(",");

                return (
                  <div key={doc.tipo} className="space-y-2 rounded-md border p-3">
                    <p className="text-sm font-medium">{doc.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Formato: {formatoLabel} · Máx{" "}
                      {Math.floor(DOCUMENT_UPLOAD_MAX_SIZE_BYTES / (1024 * 1024))} MB
                    </p>

                    {doc.indicaciones.length > 0 ? (
                      <details className="text-xs text-muted-foreground">
                        <summary className="cursor-pointer font-medium text-primary">
                          Ver indicaciones
                        </summary>
                        <ul className="mt-1 list-disc space-y-0.5 pl-5">
                          {doc.indicaciones.map((ind) => (
                            <li key={ind}>{ind}</li>
                          ))}
                        </ul>
                      </details>
                    ) : null}

                    {doc.plantilla ? (
                      doc.plantilla.accion === "descargar" ? (
                        <a
                          href={plantillaUrl(doc.plantilla.key, "descargar")}
                          className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          ⬇ {doc.plantilla.label}
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-primary hover:underline"
                          onClick={() =>
                            setGuia({
                              url: plantillaUrl(doc.plantilla!.key, "ver"),
                              title: doc.plantilla!.label,
                            })
                          }
                        >
                          👁 {doc.plantilla.label}
                        </button>
                      )
                    ) : null}

                    <Input
                      accept={acceptValue}
                      type="file"
                      onChange={(event) => {
                        const file = event.target.files?.[0] ?? null;
                        if (file) {
                          const validationError = expedientesService.validateDocumento(
                            file,
                            formato
                              ? { extensions: formato.extensions, mimeTypes: formato.mimeTypes }
                              : undefined,
                          );
                          if (validationError) {
                            setError(`${doc.label}: ${validationError}`);
                            event.currentTarget.value = "";
                            setSelectedFiles((cur) => ({ ...cur, [doc.tipo]: null }));
                            return;
                          }
                        }
                        setError(null);
                        setSelectedFiles((cur) => ({ ...cur, [doc.tipo]: file }));
                        setRegisteredDocs((cur) => ({ ...cur, [doc.tipo]: false }));
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      {selectedFiles[doc.tipo]
                        ? `Archivo: ${selectedFiles[doc.tipo]?.name}`
                        : "Sin archivo seleccionado"}
                    </p>
                  </div>
                );
              })}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Anterior
                </Button>
                <Button type="button" onClick={handleContinuarDocumentos} disabled={!docsComplete}>
                  Continuar a revisión
                </Button>
              </div>
            </div>
          ) : null}

          {/* ---------- PASO 3: Revisar y enviar ---------- */}
          {step === 3 ? (
            <div className="space-y-4">
              <div className="space-y-2 rounded-md border p-4 text-sm">
                <p>
                  <strong>Modalidad:</strong> {MODALIDAD_LABEL[modalidad]}
                </p>
                <p>
                  <strong>Título:</strong> {form.getValues("titulo")}
                </p>
                <p>
                  <strong>Programa:</strong> {form.getValues("programa")}
                  {modalidad === "pregrado" ? ` · Ciclo ${form.getValues("ciclo")}` : ""}
                  {modalidad === "postgrado" ? ` · ${form.getValues("nivel")}` : ""}
                </p>
                <p>
                  <strong>{autoresPluralLabel}:</strong> {form.getValues("autores").length}
                </p>
                <p>
                  <strong>Documentos adjuntos:</strong> {requiredDocs.length}/{requiredDocs.length}
                </p>
              </div>

              {enviado ? (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                  <AlertTitle>¡Proyecto enviado! ✅</AlertTitle>
                  <AlertDescription>
                    Tu proyecto (código <strong>{expediente?.codigo}</strong>) fue remitido al Comité de Ética.
                    Puedes seguir su estado en <strong>Mis proyectos</strong>.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={isWorking}>
                    Anterior
                  </Button>
                  <Button type="button" onClick={handleEnviar} disabled={isWorking || cerrado}>
                    {isWorking ? "Enviando…" : cerrado ? "Envíos cerrados" : "Enviar al Comité"}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={Boolean(guia)} onOpenChange={(open) => (open ? undefined : setGuia(null))}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="truncate pr-6">{guia?.title ?? "Guía"}</DialogTitle>
          </DialogHeader>
          {guia ? (
            <iframe src={guia.url} title={guia.title} className="h-[75vh] w-full rounded-md border" />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
