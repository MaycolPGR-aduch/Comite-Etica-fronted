"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  useCrearBorrador,
  useEnviarExpediente,
  useRegistrarDocumentoExpediente,
} from "@/hooks";
import type { Expediente } from "@/types";
import { DocumentChecklist } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  titulo: z.string().min(10, "El titulo debe tener al menos 10 caracteres"),
  tipoTramite: z.string().min(3, "Ingrese tipo de tramite"),
  facultad: z.string().min(2, "Ingrese la facultad"),
  resumen: z.string().min(40, "El resumen debe tener al menos 40 caracteres"),
});

type FormData = z.infer<typeof schema>;

const requiredDocs = [
  "Protocolo de investigacion",
  "Consentimiento informado",
  "Carta de presentacion",
  "Instrumentos de recoleccion",
];

export default function NuevoExpedientePage() {
  const [step, setStep] = useState(1);
  const [wizardError, setWizardError] = useState<string | null>(null);
  const [expedienteCreado, setExpedienteCreado] = useState<Expediente | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({
    "Protocolo de investigacion": true,
    "Consentimiento informado": true,
    "Carta de presentacion": false,
    "Instrumentos de recoleccion": false,
  });
  const [registeredDocs, setRegisteredDocs] = useState<Record<string, boolean>>({});

  const createDraftMutation = useCrearBorrador();
  const registrarDocumentoMutation = useRegistrarDocumentoExpediente();
  const enviarExpedienteMutation = useEnviarExpediente();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      titulo: "",
      tipoTramite: "Nuevo protocolo",
      facultad: "",
      resumen: "",
    },
  });

  const docsComplete = requiredDocs.every((doc) => uploadedDocs[doc]);
  const docsRegistered = requiredDocs.every((doc) => registeredDocs[doc]);

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
        setWizardError("No se encontró el expediente borrador para registrar documentos.");
        return;
      }

      try {
        const pendingDocs = requiredDocs.filter((doc) => !registeredDocs[doc]);

        for (const docName of pendingDocs) {
          await registrarDocumentoMutation.mutateAsync({
            expedienteId: expedienteCreado.id,
            nombreArchivo: `${docName}.pdf`,
            tipoDocumento: "PDF",
            esObligatorio: true,
          });
        }

        setRegisteredDocs(
          requiredDocs.reduce<Record<string, boolean>>((acc, doc) => {
            acc[doc] = true;
            return acc;
          }, {}),
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron registrar los metadatos de documentos.";
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

    try {
      await enviarExpedienteMutation.mutateAsync(expedienteCreado.id);
      setStep(4);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo enviar el expediente.";
      setWizardError(message);
    }
  });

  const isWorking =
    createDraftMutation.isPending ||
    registrarDocumentoMutation.isPending ||
    enviarExpedienteMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo expediente</CardTitle>
          <p className="text-sm text-slate-500">
            Flujo alineado con backend: crear borrador, registrar metadatos de documentos y enviar.
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid grid-cols-4 gap-2 text-xs font-medium">
            {["Datos", "Documentos", "Revision", "Envio"].map((label, index) => {
              const current = index + 1;
              const active = step >= current;
              return (
                <div
                  key={label}
                  className={`rounded-md px-3 py-2 text-center ${
                    active ? "bg-blue-100 text-[#08204A]" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {current}. {label}
                </div>
              );
            })}
          </div>

          {wizardError ? (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTitle>Error en el flujo</AlertTitle>
              <AlertDescription>{wizardError}</AlertDescription>
            </Alert>
          ) : null}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="titulo">Titulo del protocolo</Label>
                  <Input id="titulo" {...form.register("titulo")} />
                  {form.formState.errors.titulo ? (
                    <p className="text-xs text-red-600">{form.formState.errors.titulo.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoTramite">Tipo de tramite (UI)</Label>
                  <Input id="tipoTramite" {...form.register("tipoTramite")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facultad">Facultad (UI)</Label>
                  <Input id="facultad" {...form.register("facultad")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="resumen">Resumen (UI)</Label>
                  <Textarea id="resumen" rows={5} {...form.register("resumen")} />
                  {form.formState.errors.resumen ? (
                    <p className="text-xs text-red-600">{form.formState.errors.resumen.message}</p>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500 md:col-span-2">
                  Nota: backend RF-06 actualmente recibe solo <code>titulo_protocolo</code> en creación.
                </p>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTitle>Registro de metadatos documentales</AlertTitle>
                  <AlertDescription>
                    Se registrarán en backend los metadatos de cada documento requerido.
                  </AlertDescription>
                </Alert>

                <div className="grid gap-2">
                  {requiredDocs.map((doc) => (
                    <label key={doc} className="flex items-center gap-3 rounded-md border p-3">
                      <input
                        checked={uploadedDocs[doc] ?? false}
                        onChange={(event) =>
                          setUploadedDocs((current) => ({
                            ...current,
                            [doc]: event.target.checked,
                          }))
                        }
                        type="checkbox"
                      />
                      <span className="text-sm">{doc}</span>
                    </label>
                  ))}
                </div>

                {!docsComplete ? (
                  <p className="text-sm text-amber-700">
                    Complete el checklist para registrar los documentos.
                  </p>
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
                      <strong>Titulo:</strong> {form.getValues("titulo")}
                    </p>
                    <p>
                      <strong>Estado actual:</strong> {expedienteCreado?.estado}
                    </p>
                  </CardContent>
                </Card>

                <DocumentChecklist
                  documents={requiredDocs.map((doc, index) => ({
                    id: `${doc}-${index}`,
                    nombre: doc,
                    tipo: "Metadato registrado",
                    requerido: true,
                    cargado: registeredDocs[doc] ?? false,
                  }))}
                />
              </div>
            ) : null}

            {step === 4 ? (
              <Alert className="border-green-200 bg-green-50">
                <AlertTitle>Expediente enviado</AlertTitle>
                <AlertDescription>
                  El expediente fue creado en borrador, se registraron documentos y quedó enviado para revisión.
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
