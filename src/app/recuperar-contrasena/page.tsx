"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  correo: z.string().email("Ingrese un correo valido"),
});

type FormData = z.infer<typeof schema>;

export default function RecuperarContrasenaPage() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { correo: "" },
  });

  const onSubmit = form.handleSubmit(() => {
    router.push("/recuperar-contrasena/verificacion");
  });

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-blue-100/70 bg-white/93 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Seguridad</p>
          <CardTitle className="text-3xl font-bold text-[#08204A]">Recuperar contraseña</CardTitle>
          <p className="text-sm font-medium text-slate-600">
            Ingresa tu correo institucional para continuar el proceso.
          </p>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="correo">
                Correo institucional
              </Label>
              <Input id="correo" type="email" placeholder="usuario@demo.edu" {...form.register("correo")} />
              {form.formState.errors.correo ? (
                <p className="text-xs font-medium text-red-600">{form.formState.errors.correo.message}</p>
              ) : null}
            </div>

            <Button className="w-full font-semibold" type="submit">
              Enviar codigo
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
