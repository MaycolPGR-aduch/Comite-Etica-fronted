"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "@/components/layout";
import { useRegister } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Solo el rol Investigador puede registrarse desde el sistema (alineación de
// requerimientos). El registro de personal administrativo lo gestiona el
// Administrador desde el panel de usuarios.
const schema = z
  .object({
    nombres: z.string().min(3, "Ingrese nombres validos"),
    apellidos: z.string().min(3, "Ingrese apellidos validos"),
    correo: z.string().email("Correo invalido"),
    password: z.string().min(8, "Minimo 8 caracteres"),
    confirmarPassword: z.string().min(8, "Confirme su contraseña"),
  })
  .refine((data) => data.password === data.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function CrearUsuarioPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombres: "",
      apellidos: "",
      correo: "",
      password: "",
      confirmarPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);

    try {
      await registerMutation.mutateAsync({
        nombres: values.nombres,
        apellidos: values.apellidos,
        correo: values.correo,
        rol: "investigador",
        password: values.password,
      });

      router.push("/crear-usuario/exito");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo registrar el usuario. Intente nuevamente.";
      setErrorMessage(message);
    }
  });

  return (
    <AuthShell>
      <Card className="w-full max-w-lg border-blue-100/70 bg-white/93 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-2 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Registro</p>
          <CardTitle className="text-3xl font-bold text-[#08204A]">Crear cuenta de investigador</CardTitle>
          <p className="text-sm font-medium text-slate-600">
            El registro está disponible para investigadores. El personal del Comité accede con cuentas
            provistas por la institución.
          </p>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="nombres">
                  Nombres
                </Label>
                <Input id="nombres" {...form.register("nombres")} />
                {form.formState.errors.nombres ? (
                  <p className="text-xs font-medium text-red-600">{form.formState.errors.nombres.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="apellidos">
                  Apellidos
                </Label>
                <Input id="apellidos" {...form.register("apellidos")} />
                {form.formState.errors.apellidos ? (
                  <p className="text-xs font-medium text-red-600">{form.formState.errors.apellidos.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="correo">
                Correo institucional
              </Label>
              <Input id="correo" type="email" {...form.register("correo")} />
              {form.formState.errors.correo ? (
                <p className="text-xs font-medium text-red-600">{form.formState.errors.correo.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="password">
                  Contraseña
                </Label>
                <Input id="password" type="password" {...form.register("password")} />
              </div>

              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="confirmarPassword">
                  Confirmar contraseña
                </Label>
                <Input id="confirmarPassword" type="password" {...form.register("confirmarPassword")} />
                {form.formState.errors.confirmarPassword ? (
                  <p className="text-xs font-medium text-red-600">
                    {form.formState.errors.confirmarPassword.message}
                  </p>
                ) : null}
              </div>
            </div>

            {errorMessage ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}

            <Button className="w-full font-semibold" type="submit" disabled={registerMutation.isPending}>
              {registerMutation.isPending ? "Creando..." : "Crear cuenta"}
            </Button>

            <div className="text-center text-sm font-medium">
              <Link className="text-primary hover:text-[#4C93EB] hover:underline" href="/login">
                Volver a inicio de sesion
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
