"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "@/components/layout";
import { useLogin } from "@/hooks";
import type { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  correo: z.string().email("Ingrese un correo valido"),
  role: z.custom<Role>(),
});

type FormData = z.infer<typeof schema>;

const roleOptions: Array<{ value: Role; label: string }> = [
  { value: "investigador", label: "Investigador" },
  { value: "secretaria", label: "Secretaria tecnica" },
  { value: "coordinador", label: "Coordinador" },
  { value: "evaluador", label: "Evaluador" },
  { value: "administrador", label: "Administrador" },
];

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const [selectedRole, setSelectedRole] = useState<Role>("investigador");

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      correo: "investigador@demo.edu",
      role: "investigador",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await loginMutation.mutateAsync(values);
    router.push(result.redirectTo);
  });

  return (
    <AuthShell>
        <Card className="w-full max-w-md min-h-[520px] border-blue-100/70 bg-white/92 shadow-xl backdrop-blur-sm">
          <CardHeader className="space-y-2 pt-8 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0B57B7]">
              Comite de Etica
            </p>
            <CardTitle className="text-3xl font-bold text-[#08204A]">Acceso al sistema</CardTitle>
            <p className="text-sm font-medium text-slate-600">
              Inicio de sesion mock para pruebas de roles y flujos.
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
                <Label className="font-semibold">Rol</Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => {
                    const role = value as Role;
                    setSelectedRole(role);
                    form.setValue("role", role, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="mt-2 w-full font-semibold" type="submit" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Ingresando..." : "Ingresar"}
              </Button>

              <div className="flex flex-col items-center gap-2 pt-2">
                <div className="flex w-full justify-center gap-3">
                  <Button asChild className="min-w-40 font-semibold" size="sm" variant="secondary">
                    <Link href="/crear-usuario">Crear usuario</Link>
                  </Button>
                  <Button asChild className="min-w-40 font-semibold" size="sm" variant="secondary">
                    <Link href="/recuperar-contrasena">Recuperar contraseña</Link>
                  </Button>
                </div>
                <Link
                  className="text-sm font-semibold text-[#0B57B7] hover:text-[#4C93EB] hover:underline"
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
