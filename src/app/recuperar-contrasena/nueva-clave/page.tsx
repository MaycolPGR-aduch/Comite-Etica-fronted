"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z.string().min(8, "Minimo 8 caracteres"),
    confirmarPassword: z.string().min(8, "Confirme su contraseña"),
  })
  .refine((values) => values.password === values.confirmarPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmarPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function NuevaClavePage() {
  const router = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmarPassword: "" },
  });

  const onSubmit = form.handleSubmit(() => {
    router.push("/recuperar-contrasena/completado");
  });

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-blue-100/70 bg-white/93 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0B57B7]">Actualizacion</p>
          <CardTitle className="text-3xl font-bold text-[#08204A]">Nueva contraseña</CardTitle>
          <p className="text-sm font-medium text-slate-600">
            Define una nueva clave para completar la recuperacion (mock).
          </p>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="password">
                Nueva contraseña
              </Label>
              <Input id="password" type="password" {...form.register("password")} />
              {form.formState.errors.password ? (
                <p className="text-xs font-medium text-red-600">{form.formState.errors.password.message}</p>
              ) : null}
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

            <Button className="w-full font-semibold" type="submit">
              Guardar nueva contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
