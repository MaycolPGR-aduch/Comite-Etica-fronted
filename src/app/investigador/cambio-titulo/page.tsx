"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  useCrearCambioTitulo,
  useEnviarExpediente,
  useExpedienteCatalogos,
  useProyectosElegiblesCambioTitulo,
  useRegistrarDocumentoExpediente,
} from "@/hooks";
import {
  DOCUMENT_FORMATS,
  DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS,
  DOCUMENT_UPLOAD_MAX_SIZE_BYTES,
  expedientesService,
  plantillaUrl,
} from "@/services/expedientes.service";
import { PageHeader, useConfirm } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";

const STEPS = ["Datos e integrantes", "Documento", "Revisar y enviar"];

interface AutorForm {
  apellidos_nombres: string;
  codigo_estudiante: string;
  correo: string;
}

interface FormData {
  proyectoOrigenId: string;
  programa: string;
  ciclo: string;
  tituloNuevo: string;
  autores: AutorForm[];
}

const emptyAutor: AutorForm = { apellidos_nombres: "", codigo_estudiante: "", correo: "" };

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

export default function CambioTituloPage() {
  const { data: catalogos, isLoading } = useExpedienteCatalogos();
  const { data: proyectosElegibles, isLoading: loadingProyectos } = useProyectosElegiblesCambioTitulo();
  const crearMutation = useCrearCambioTitulo();
  const registrarDocMutation = useRegistrarDocumentoExpediente();
  const enviarMutation = useEnviarExpediente();
  const confirm = useConfirm();

  const [step, setStep] = useState(1);
  const [enviado, setEnviado] = useState(false);
  const [expediente, setExpediente] = useState<{ id: string; codigo: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [faltantes, setFaltantes] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const modalidad = catalogos?.modalidad ?? null;
  const documento = catalogos?.cambio_titulo.documento ?? null;
  const ciclos = useMemo(() => catalogos?.cambio_titulo.ciclos ?? [], [catalogos]);

  const form = useForm<FormData>({
    defaultValues: {
      proyectoOrigenId: "",
      programa: "",
      ciclo: "",
      tituloNuevo: "",
      autores: [emptyAutor],
    },
  });

  const proyectoOrigenId = form.watch("proyectoOrigenId");
  const proyectoSeleccionado = useMemo(
    () => proyectosElegibles?.find((p) => p.id === proyectoOrigenId) ?? null,
    [proyectosElegibles, proyectoOrigenId],
  );
  const tituloAnterior = proyectoSeleccionado?.titulo ?? "";
  // El N° de acta se deriva del código del proyecto (ej. "1-2026" -> "1").
  const numeroActa = proyectoSeleccionado?.codigo?.split("-")[0] ?? "";
  const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: "autores" });

  // Al seleccionar un proyecto, autollenar sus datos para que el estudiante solo modifique lo necesario.
  useEffect(() => {
    if (!proyectoSeleccionado) return;
    form.setValue("programa", proyectoSeleccionado.programaEstudios ?? "");
    form.setValue("ciclo", proyectoSeleccionado.ciclo ?? "");
    form.setValue("tituloNuevo", proyectoSeleccionado.titulo); // pre-cargado con el título actual para editar
    replace(
      proyectoSeleccionado.autores.length > 0
        ? proyectoSeleccionado.autores.map((a) => ({
            apellidos_nombres: a.apellidos_nombres,
            codigo_estudiante: a.codigo_estudiante ?? "",
            correo: a.correo ?? "",
          }))
        : [emptyAutor],
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoOrigenId]);

  const isWorking =
    crearMutation.isPending || registrarDocMutation.isPending || enviarMutation.isPending;

  const handleContinuarDatos = () => {
    setError(null);
    const v = form.getValues();
    if (!v.proyectoOrigenId) return setError("Selecciona el proyecto aprobado que deseas modificar.");
    if (!v.programa) return setError("Selecciona el programa de estudios.");
    if (!v.ciclo) return setError("Selecciona el ciclo.");
    if (v.tituloNuevo.trim().length < 5) return setError("Ingresa el nuevo título.");
    for (const [i, a] of v.autores.entries()) {
      if (!a.apellidos_nombres.trim()) return setError(`Integrante ${i + 1}: falta apellidos y nombres.`);
      if (!a.codigo_estudiante.trim()) return setError(`Integrante ${i + 1}: falta código de estudiante.`);
      if (!a.correo.trim()) return setError(`Integrante ${i + 1}: falta correo.`);
    }
    setStep(2);
  };

  const handleContinuarDocumento = () => {
    setError(null);
    if (!file) return setError("Adjunta la solicitud de cambio de título (PDF).");
    setStep(3);
  };

  const handleEnviar = async () => {
    setError(null);
    setFaltantes([]);

    const ok = await confirm({
      title: "Enviar solicitud de cambio de título",
      description: "Se remitirá al Comité de Ética y dejará de ser editable. ¿Deseas enviarla?",
      confirmLabel: "Enviar",
    });
    if (!ok) return;

    try {
      let exp = expediente;
      if (!exp) {
        const v = form.getValues();
        exp = await crearMutation.mutateAsync({
          proyectoOrigenId: v.proyectoOrigenId,
          programaEstudios: v.programa,
          ciclo: v.ciclo,
          tituloNuevo: v.tituloNuevo.trim(),
          autores: v.autores.map((a) => ({
            apellidos_nombres: a.apellidos_nombres.trim(),
            codigo_estudiante: a.codigo_estudiante.trim(),
            correo: a.correo.trim(),
          })),
        });
        setExpediente(exp);
      }

      if (documento && file) {
        await registrarDocMutation.mutateAsync({
          expedienteId: exp.id,
          file,
          tipoDocumento: documento.tipo,
          esObligatorio: true,
        });
      }

      const result = await enviarMutation.mutateAsync(exp.id);
      setExpediente((prev) => (prev ? { ...prev, codigo: result.codigo ?? prev.codigo } : prev));
      setEnviado(true);
      toast.success("Solicitud enviada", "Tu cambio de título fue remitido al Comité de Ética.");
    } catch (e) {
      const fs = parseFaltantes(e);
      if (fs && fs.length > 1) {
        setFaltantes(fs);
        setError("La solicitud está incompleta. Revisa lo que falta.");
      } else {
        setError(fs?.[0] ?? "No se pudo enviar la solicitud.");
      }
      toast.error("No se pudo enviar", "Revisa los datos y vuelve a intentar.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Cambiar título" description="Cargando formulario..." />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!modalidad) {
    return (
      <div className="space-y-4">
        <PageHeader title="Cambiar título" description="Solicitud de cambio de título." />
        <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
          <AlertTitle>No disponible para tu rol</AlertTitle>
          <AlertDescription>
            Solo los estudiantes e investigadores pueden solicitar un cambio de título.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const formato = documento ? DOCUMENT_FORMATS[documento.tipo] : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cambiar título"
        description="Solicitud de cambio de título del proyecto de investigación."
      />

      <Alert className="border-blue-200 bg-blue-50 text-blue-900">
        <AlertDescription>
          El cumplimiento de los requisitos es obligatorio. Las solicitudes que no adjunten el documento
          o presenten información incompleta no serán consideradas en la evaluación.
        </AlertDescription>
      </Alert>

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

          {/* ---------- PASO 1 ---------- */}
          {step === 1 ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="proyectoOrigen">Proyecto aprobado a modificar</Label>
                {loadingProyectos ? (
                  <Skeleton className="h-10 w-full" />
                ) : proyectosElegibles && proyectosElegibles.length > 0 ? (
                  <select
                    id="proyectoOrigen"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register("proyectoOrigenId")}
                  >
                    <option value="">Seleccione su proyecto…</option>
                    {proyectosElegibles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.codigo ? `${p.codigo} · ` : ""}{p.titulo}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Alert className="border-amber-300 bg-amber-50 text-amber-900">
                    <AlertDescription>
                      No tienes proyectos aprobados. Solo puedes solicitar un cambio de título
                      sobre un proyecto ya aprobado (con o sin observaciones).
                    </AlertDescription>
                  </Alert>
                )}
                {proyectoSeleccionado ? (
                  <div className="space-y-1 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                    <p>
                      <strong>Código:</strong> {proyectoSeleccionado.codigo ?? "—"}
                      {numeroActa ? (
                        <>
                          {" · "}
                          <strong>N° de acta:</strong> {numeroActa}
                        </>
                      ) : null}
                    </p>
                    <p>
                      <strong>Título actual:</strong> {tituloAnterior}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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
                <div className="space-y-2">
                  <Label htmlFor="ciclo">Ciclo</Label>
                  <select
                    id="ciclo"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register("ciclo")}
                  >
                    <option value="">Seleccione…</option>
                    {ciclos.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tituloNuevo">Nuevo título</Label>
                <Textarea
                  id="tituloNuevo"
                  rows={2}
                  placeholder="El nuevo título que deseas asignar a tu proyecto."
                  {...form.register("tituloNuevo")}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Integrantes del proyecto</Label>
                  <Button type="button" variant="secondary" size="sm" onClick={() => append(emptyAutor)}>
                    + Agregar integrante
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="space-y-3 rounded-md border p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {index === 0 ? "Responsable (principal)" : `Integrante ${index + 1}`}
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
                      <div className="space-y-1">
                        <Label>Código de estudiante</Label>
                        <Input {...form.register(`autores.${index}.codigo_estudiante` as const)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Correo electrónico</Label>
                        <Input type="email" {...form.register(`autores.${index}.correo` as const)} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button type="button" onClick={handleContinuarDatos}>
                Continuar a documento
              </Button>
            </div>
          ) : null}

          {/* ---------- PASO 2 ---------- */}
          {step === 2 && documento ? (
            <div className="space-y-4">
              <div className="space-y-2 rounded-md border p-3">
                <p className="text-sm font-medium">{documento.label}</p>
                <p className="text-xs text-muted-foreground">
                  Formato: {formato?.label ?? "PDF"} · Máx{" "}
                  {Math.floor(DOCUMENT_UPLOAD_MAX_SIZE_BYTES / (1024 * 1024))} MB
                </p>

                {documento.indicaciones.length > 0 ? (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer font-medium text-primary">Ver indicaciones</summary>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5">
                      {documento.indicaciones.map((ind) => (
                        <li key={ind}>{ind}</li>
                      ))}
                    </ul>
                  </details>
                ) : null}

                {documento.plantilla ? (
                  <a
                    href={plantillaUrl(documento.plantilla.key, "descargar")}
                    className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    ⬇ {documento.plantilla.label}
                  </a>
                ) : null}

                <Input
                  accept={(formato?.extensions ?? DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS).join(",")}
                  type="file"
                  onChange={(event) => {
                    const selected = event.target.files?.[0] ?? null;
                    if (selected) {
                      const validationError = expedientesService.validateDocumento(
                        selected,
                        formato ? { extensions: formato.extensions, mimeTypes: formato.mimeTypes } : undefined,
                      );
                      if (validationError) {
                        setError(`${documento.label}: ${validationError}`);
                        event.currentTarget.value = "";
                        setFile(null);
                        return;
                      }
                    }
                    setError(null);
                    setFile(selected);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {file ? `Archivo: ${file.name}` : "Sin archivo seleccionado"}
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Anterior
                </Button>
                <Button type="button" onClick={handleContinuarDocumento} disabled={!file}>
                  Continuar a revisión
                </Button>
              </div>
            </div>
          ) : null}

          {/* ---------- PASO 3 ---------- */}
          {step === 3 ? (
            <div className="space-y-4">
              <div className="space-y-2 rounded-md border p-4 text-sm">
                <p>
                  <strong>Proyecto:</strong> {proyectoSeleccionado?.codigo ?? "—"}
                  {numeroActa ? ` · N° de acta: ${numeroActa}` : ""}
                </p>
                <p>
                  <strong>Programa:</strong> {form.getValues("programa")} · Ciclo {form.getValues("ciclo")}
                </p>
                <p>
                  <strong>Título anterior:</strong> {tituloAnterior}
                </p>
                <p>
                  <strong>Nuevo título:</strong> {form.getValues("tituloNuevo")}
                </p>
                <p>
                  <strong>Integrantes:</strong> {form.getValues("autores").length}
                </p>
              </div>

              {enviado ? (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                  <AlertTitle>¡Solicitud enviada! ✅</AlertTitle>
                  <AlertDescription>
                    Tu cambio de título (código <strong>{expediente?.codigo}</strong>) fue remitido al
                    Comité de Ética. Puedes seguir su estado en <strong>Mis proyectos</strong>.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={isWorking}>
                    Anterior
                  </Button>
                  <Button type="button" onClick={handleEnviar} disabled={isWorking}>
                    {isWorking ? "Enviando…" : "Enviar al Comité"}
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
