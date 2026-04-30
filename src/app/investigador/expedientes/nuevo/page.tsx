"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCrearBorrador } from "@/hooks";
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
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({
    "Protocolo de investigacion": true,
    "Consentimiento informado": true,
    "Carta de presentacion": false,
    "Instrumentos de recoleccion": false,
  });

  const createDraftMutation = useCrearBorrador();

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

  const nextStep = async () => {
    if (step === 1) {
      const valid = await form.trigger();
      if (!valid) return;
    }

    if (step === 2 && !docsComplete) {
      return;
    }

    setStep((current) => Math.min(4, current + 1));
  };

  const prevStep = () => setStep((current) => Math.max(1, current - 1));

  const handleSubmit = form.handleSubmit(async (values) => {
    await createDraftMutation.mutateAsync(values);
    setStep(4);
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo expediente</CardTitle>
          <p className="text-sm text-slate-500">Wizard: Datos generales, Carga documental, Revision y Envio.</p>
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
                  <Label htmlFor="tipoTramite">Tipo de tramite</Label>
                  <Input id="tipoTramite" {...form.register("tipoTramite")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facultad">Facultad</Label>
                  <Input id="facultad" {...form.register("facultad")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="resumen">Resumen</Label>
                  <Textarea id="resumen" rows={5} {...form.register("resumen")} />
                  {form.formState.errors.resumen ? (
                    <p className="text-xs text-red-600">{form.formState.errors.resumen.message}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTitle>Validacion visual documental</AlertTitle>
                  <AlertDescription>
                    Debe marcar todos los documentos requeridos para continuar.
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
                  <p className="text-sm text-amber-700">Complete el checklist para avanzar.</p>
                ) : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Resumen del envio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <strong>Titulo:</strong> {form.getValues("titulo")}
                    </p>
                    <p>
                      <strong>Tipo:</strong> {form.getValues("tipoTramite")}
                    </p>
                    <p>
                      <strong>Facultad:</strong> {form.getValues("facultad")}
                    </p>
                    <p>
                      <strong>Resumen:</strong> {form.getValues("resumen")}
                    </p>
                  </CardContent>
                </Card>

                <DocumentChecklist
                  documents={requiredDocs.map((doc, index) => ({
                    id: `${doc}-${index}`,
                    nombre: doc,
                    tipo: "Requerido",
                    requerido: true,
                    cargado: uploadedDocs[doc] ?? false,
                  }))}
                />
              </div>
            ) : null}

            {step === 4 ? (
              <Alert className="border-green-200 bg-green-50">
                <AlertTitle>Expediente enviado</AlertTitle>
                <AlertDescription>
                  El expediente fue registrado en modo mock y quedo listo para revision administrativa.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex flex-wrap gap-3">
              {step > 1 && step < 4 ? (
                <Button onClick={prevStep} type="button" variant="outline">
                  Anterior
                </Button>
              ) : null}

              {step < 3 ? (
                <Button onClick={nextStep} type="button">
                  Siguiente
                </Button>
              ) : null}

              {step === 3 ? (
                <Button type="submit" disabled={createDraftMutation.isPending}>
                  {createDraftMutation.isPending ? "Enviando..." : "Enviar expediente"}
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
