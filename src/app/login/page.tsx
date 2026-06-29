"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "@/components/layout";
import { useLogin } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  correo: z.string().email("Ingrese un correo valido"),
  password: z.string().min(1, "Ingrese su contraseña"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      correo: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setErrorMessage(null);
    try {
      const result = await loginMutation.mutateAsync(values);
      const next =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("next")
          : null;
      const redirectTo = next && next.startsWith("/") ? next : result.redirectTo;
      router.push(redirectTo);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar sesion. Intente nuevamente.";
      setErrorMessage(message);
    }
  });

  return (
    <AuthShell>
        <Card className="w-full max-w-md min-h-[520px] border-blue-100/70 bg-white/92 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-2 pt-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              Comite de Etica
            </p>
            <CardTitle className="text-3xl font-bold text-[#08204A]">Acceso al sistema</CardTitle>
            <p className="text-sm font-medium text-slate-600">
              Inicio de sesion del Comité de Ética.
            </p>
          </CardHeader>

          <CardContent className="pt-4">
            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="correo">
                  Correo institucional
                </Label>
                <Input id="correo" placeholder="usuario@demo.edu" {...form.register("correo")} />
                {form.formState.errors.correo ? (
                  <p className="text-xs font-medium text-red-600">{form.formState.errors.correo.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="password">
                  Contraseña
                </Label>
                <Input id="password" type="password" {...form.register("password")} />
                {form.formState.errors.password ? (
                  <p className="text-xs font-medium text-red-600">{form.formState.errors.password.message}</p>
                ) : null}
              </div>

              {errorMessage ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-600">{errorMessage}</p>
                  <p className="text-xs text-slate-600">
                    Si aún no tienes cuenta, puedes{" "}
                    <Link className="font-semibold text-primary hover:underline" href="/crear-usuario">
                      registrarte aquí
                    </Link>
                    .
                  </p>
                </div>
              ) : null}

              <Button className="mt-2 w-full font-semibold" type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Ingresando..." : "Ingresar"}
              </Button>

              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="flex w-full justify-center gap-3">
                  <Button asChild className="min-w-40 font-semibold" size="sm" variant="secondary">
                    <Link href="/crear-usuario">Registrarse</Link>
                  </Button>
                  <Button asChild className="min-w-40 font-semibold" size="sm" variant="secondary">
                    <Link href="/recuperar-contrasena">Recuperar contraseña</Link>
                  </Button>
                </div>
                <Link
                  className="text-sm font-semibold text-primary hover:text-[#4C93EB] hover:underline"
                  href="/acerca-comite-etica"
                >
                  Acerca del Comité de Ética
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
    </AuthShell>
  );
}
