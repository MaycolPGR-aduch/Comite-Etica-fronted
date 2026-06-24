"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import {
  useCrearBorrador,
  useEnviarExpediente,
  useRegistrarDocumentoExpediente,
} from "@/hooks";
import {
  DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS,
  DOCUMENT_UPLOAD_ACCEPTED_MIME_TYPES,
  DOCUMENT_UPLOAD_MAX_SIZE_BYTES,
  expedientesService,
} from "@/services/expedientes.service";
import { getRequiredDocumentsByTipoTramite } from "@/lib/document-requirements";
import type { Expediente } from "@/types";
import { DocumentChecklist, PageHeader, useConfirm } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

const TIPO_TRAMITE_OPTIONS = [
  { value: "protocolo_estudiante", label: "Proyecto para estudiante" },
  { value: "protocolo_tesista", label: "Proyecto para tesista/profesor" },
] as const;

const FACULTAD_OPTIONS = [
  "Facultad de Medicina",
  "Facultad de Enfermeria",
  "Facultad de Odontologia",
  "Facultad de Farmacia y Bioquimica",
  "Facultad de Psicologia",
  "Facultad de Ciencias de la Salud",
  "Facultad de Ingenieria",
  "Facultad de Derecho",
  "Facultad de Educacion",
  "Facultad de Ciencias Empresariales",
];

const schema = z.object({
  titulo: z.string().min(10, "El titulo debe tener al menos 10 caracteres"),
  tipoTramite: z.string().min(3, "Ingrese tipo de tramite"),
  facultad: z.string().min(2, "Ingrese la facultad"),
  // Prioridad se oculta en la UI pero se mantiene con un valor por defecto y
  // se sigue enviando al backend hasta que el campo sea eliminado del contrato
  // (alineación de requerimientos).
  prioridad: z.enum(["Alta", "Media", "Baja"]),
});

type FormData = z.infer<typeof schema>;

export default function NuevoExpedientePage() {
  const [step, setStep] = useState(1);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [expedienteCreado, setExpedienteCreado] = useState<Expediente | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [registeredDocs, setRegisteredDocs] = useState<Record<string, boolean>>({});
  const [fileErrors, setFileErrors] = useState<Record<string, string | null>>({});

  const createDraftMutation = useCrearBorrador();
  const registrarDocumentoMutation = useRegistrarDocumentoExpediente();
  const enviarExpedienteMutation = useEnviarExpediente();
  const confirm = useConfirm();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      titulo: "",
      tipoTramite: "protocolo_estudiante",
      facultad: FACULTAD_OPTIONS[0],
      prioridad: "Media",
    },
  });

  const tipoTramiteSeleccionado = useWatch({
    control: form.control,
    name: "tipoTramite",
  });
  const requiredDocs = useMemo(() => {
    return getRequiredDocumentsByTipoTramite(tipoTramiteSeleccionado);
  }, [tipoTramiteSeleccionado]);

  const docsComplete = requiredDocs.every((doc) => Boolean(selectedFiles[doc.key]));
  const docsRegistered = requiredDocs.every((doc) => registeredDocs[doc.key]);
  const tramiteLocked = expedienteCreado !== null;

  const nextStep = async () => {
    setWizardError(null);

    if (step === 1) {
      const valid = await form.trigger();
      if (!valid) return;

      if (!expedienteCreado) {
        try {
          const values = form.getValues();
          const draft = await createDraftMutation.mutateAsync(values);
          setExpedienteCreado(draft);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "No se pudo crear el expediente en backend.";
          setWizardError(message);
          return;
        }
      }
    }

    if (step === 2) {
      if (!docsComplete) {
        setWizardError("Complete todo el checklist de documentos para continuar.");
        return;
      }

      if (!expedienteCreado) {
        setWizardError("No se encontró el expediente (borrador) para registrar documentos.");
        return;
      }

      try {
        const pendingDocs = requiredDocs.filter((doc) => !registeredDocs[doc.key]);

        for (const doc of pendingDocs) {
          const file = selectedFiles[doc.key];
          if (!file) {
            throw new Error(`Debe seleccionar archivo para: ${doc.label}.`);
          }

          await registrarDocumentoMutation.mutateAsync({
            expedienteId: expedienteCreado.id,
            file,
            tipoDocumento: doc.tipoDocumento,
            esObligatorio: true,
          });
        }

        setRegisteredDocs((current) =>
          pendingDocs.reduce<Record<string, boolean>>(
            (acc, doc) => ({ ...acc, [doc.key]: true }),
            { ...current },
          ),
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los documentos.";
        setWizardError(message);
        return;
      }
    }

    setStep((current) => Math.min(4, current + 1));
  };

  const prevStep = () => setStep((current) => Math.max(1, current - 1));

  const handleSubmit = form.handleSubmit(async () => {
    setWizardError(null);

    if (!expedienteCreado) {
      setWizardError("No hay expediente creado para enviar.");
      return;
    }

    if (!docsRegistered) {
      setWizardError("Debes registrar todos los documentos antes del envío.");
      return;
    }

    const confirmed = await confirm({
      title: "Enviar expediente",
      description:
        "El expediente se remitirá al Comité de Ética y dejará de ser un borrador editable. ¿Deseas enviarlo?",
      confirmLabel: "Enviar expediente",
    });
    if (!confirmed) return;

    try {
      await enviarExpedienteMutation.mutateAsync(expedienteCreado.id);
      setStep(4);
      toast.success("Expediente enviado", "El expediente fue remitido al Comité de Ética.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo enviar el expediente.";
      setWizardError(message);
      toast.error("No se pudo enviar el expediente", message);
    }
  });

  const isWorking =
    createDraftMutation.isPending ||
    registrarDocumentoMutation.isPending ||
    enviarExpedienteMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo expediente"
        description="Crea el expediente como borrador, carga los documentos requeridos y envíalo al Comité."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/guia">Guía de envío y requisitos</Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 grid grid-cols-4 gap-2 text-xs font-medium">
            {["Datos", "Documentos", "Revision", "Envio"].map((label, index) => {
              const current = index + 1;
              const active = step >= current;
              return (
                <div
                  key={label}
                  className={`rounded-md px-3 py-2 text-center transition-colors ${
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {current}. {label}
                </div>
              );
            })}
          </div>

          {wizardError ? (
            <Alert className="mb-4 border-destructive/30 bg-destructive/5 text-destructive">
              <AlertTitle>Error en el flujo</AlertTitle>
              <AlertDescription>{wizardError}</AlertDescription>
            </Alert>
          ) : null}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="titulo">Título del Proyecto</Label>
                  <Input id="titulo" {...form.register("titulo")} />
                  {form.formState.errors.titulo ? (
                    <p className="text-xs text-destructive">{form.formState.errors.titulo.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoTramite">Tipo de tramite</Label>
                  <select
                    id="tipoTramite"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={tramiteLocked}
                    {...form.register("tipoTramite")}
                  >
                    {TIPO_TRAMITE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {tramiteLocked ? (
                    <p className="text-xs text-muted-foreground">
                      Tipo de tramite bloqueado para mantener consistencia tras crear el borrador.
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facultad">Facultad</Label>
                  <select
                    id="facultad"
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...form.register("facultad")}
                  >
                    {FACULTAD_OPTIONS.map((facultad) => (
                      <option key={facultad} value={facultad}>
                        {facultad}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTitle>Carga de documentos</AlertTitle>
                  <AlertDescription>
                    Seleccione un archivo por documento requerido para registrarlo en backend.
                  </AlertDescription>
                </Alert>
                <Alert className="border-primary/30 bg-secondary text-secondary-foreground">
                  <AlertTitle>Formatos y restricciones admitidas</AlertTitle>
                  <AlertDescription>
                    Formatos permitidos: {DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS.join(", ")}.
                    <br />
                    Tipos MIME permitidos: {DOCUMENT_UPLOAD_ACCEPTED_MIME_TYPES.join(", ")}.
                    <br />
                    Tamaño máximo por archivo: {Math.floor(DOCUMENT_UPLOAD_MAX_SIZE_BYTES / (1024 * 1024))} MB.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-2">
                  {requiredDocs.map((doc) => (
                    <div key={doc.key} className="space-y-2 rounded-md border p-3">
                      <p className="text-sm font-medium">{doc.label}</p>
                      <Input
                        accept={DOCUMENT_UPLOAD_ACCEPTED_EXTENSIONS.join(",")}
                        type="file"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          if (file) {
                            const error = expedientesService.validateDocumento(file);
                            if (error) {
                              setFileErrors((current) => ({ ...current, [doc.key]: error }));
                              setSelectedFiles((current) => ({ ...current, [doc.key]: null }));
                              setRegisteredDocs((current) => ({ ...current, [doc.key]: false }));
                              setWizardError(`${doc.label}: ${error}`);
                              event.currentTarget.value = "";
                              return;
                            }
                          }

                          setFileErrors((current) => ({ ...current, [doc.key]: null }));
                          setSelectedFiles((current) => ({
                            ...current,
                            [doc.key]: file,
                          }));
                          setRegisteredDocs((current) => ({ ...current, [doc.key]: false }));
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        {selectedFiles[doc.key]
                          ? `Archivo: ${selectedFiles[doc.key]?.name}`
                          : "Sin archivo seleccionado"}
                      </p>
                      {fileErrors[doc.key] ? (
                        <p className="text-xs text-destructive">{fileErrors[doc.key]}</p>
                      ) : null}
                    </div>
                  ))}
                </div>

                {!docsComplete ? (
                  <p className="text-sm text-amber-700">Debe seleccionar todos los archivos requeridos.</p>
                ) : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resumen del envío</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <strong>ID expediente:</strong> {expedienteCreado?.id}
                    </p>
                    <p>
                      <strong>Código:</strong> {expedienteCreado?.codigo}
                    </p>
                    <p>
                      <strong>Título del proyecto:</strong> {form.getValues("titulo")}
                    </p>
                    <p>
                      <strong>Tipo de tramite:</strong>{" "}
                      {TIPO_TRAMITE_OPTIONS.find(
                        (item) => item.value === form.getValues("tipoTramite"),
                      )?.label ?? form.getValues("tipoTramite")}
                    </p>
                    <p>
                      <strong>Facultad:</strong> {form.getValues("facultad")}
                    </p>
                    <p>
                      <strong>Estado actual:</strong> {expedienteCreado?.estado}
                    </p>
                  </CardContent>
                </Card>

                <DocumentChecklist
                  enableFileActions={false}
                  documents={requiredDocs.map((doc, index) => ({
                    id: `${doc.key}-${index}`,
                    nombre: doc.label,
                    tipo: "Archivo",
                    requerido: true,
                    cargado: registeredDocs[doc.key] ?? false,
                  }))}
                />
              </div>
            ) : null}

            {step === 4 ? (
              <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                <AlertTitle>Expediente enviado</AlertTitle>
                <AlertDescription>
                  El expediente fue creado, se cargaron documentos y quedó enviado para revisión.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {step > 1 && step < 4 ? (
                <Button onClick={prevStep} type="button" variant="outline" disabled={isWorking}>
                  Anterior
                </Button>
              ) : null}

              {step < 3 ? (
                <Button onClick={nextStep} type="button" disabled={isWorking}>
                  {step === 1
                    ? createDraftMutation.isPending
                      ? "Creando borrador..."
                      : "Siguiente"
                    : registrarDocumentoMutation.isPending
                      ? "Registrando documentos..."
                      : "Siguiente"}
                </Button>
              ) : null}

              {step === 3 ? (
                <Button type="submit" disabled={isWorking || !docsRegistered}>
                  {enviarExpedienteMutation.isPending ? "Enviando..." : "Enviar expediente"}
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
