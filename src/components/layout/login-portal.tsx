"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "@/components/layout/auth-shell";
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
  password: z.string().min(1, "Ingrese su contraseña"),
});

type FormData = z.infer<typeof schema>;

export interface LoginRoleOption {
  value: Role;
  label: string;
}

/**
 * Modo de rol del portal:
 * - "fixed": el portal usa siempre un rol (ej. investigador). El backend sigue
 *   siendo quien define el rol real y la validación rechaza credenciales que no
 *   correspondan al portal.
 * - "select": el usuario elige entre un conjunto acotado de roles (ej. personal
 *   administrativo).
 */
export type LoginRoleMode =
  | { kind: "fixed"; role: Role }
  | { kind: "select"; options: LoginRoleOption[]; defaultRole: Role };

export interface LoginPortalProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  roleMode: LoginRoleMode;
  /** Muestra el bloque de registro de usuario (solo investigadores). */
  showRegister?: boolean;
  /** Enlace que cruza al otro portal. */
  crossPortal: { href: string; label: string };
}

export function LoginPortal({
  eyebrow = "Comite de Etica",
  title,
  subtitle,
  roleMode,
  showRegister = false,
  crossPortal,
}: LoginPortalProps) {
  const router = useRouter();
  const loginMutation = useLogin();
  const initialRole = roleMode.kind === "fixed" ? roleMode.role : roleMode.defaultRole;
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      correo: "",
      role: initialRole,
      password: "",
    },
  });

  const headerLinks = [
    crossPortal,
    { href: "/guia", label: "Guía de envío y requisitos" },
    { href: "/acerca-comite-etica", label: "Acerca del Comité de Ética" },
  ];

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
    <AuthShell
      header={
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-3 sm:flex-row">
          <Link href="/" className="shrink-0" aria-label="Universidad de Ciencias y Humanidades">
            <Image
              src="/logo-uch-principal-1000.webp"
              alt="Universidad de Ciencias y Humanidades"
              width={180}
              height={54}
              priority
              className="h-9 w-auto"
            />
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-1 sm:justify-end sm:gap-2">
            {headerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-[#08204A] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#EAF5FF] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      }
    >
      <Card className="w-full max-w-md min-h-[520px] border-blue-100/70 bg-white/92 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-2 pt-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
          <CardTitle className="text-3xl font-bold text-[#08204A]">{title}</CardTitle>
          <p className="text-sm font-medium text-slate-600">{subtitle}</p>
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

            {roleMode.kind === "select" ? (
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
                    {roleMode.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="password">
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-md"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.formState.errors.password ? (
                <p className="text-xs font-medium text-red-600">{form.formState.errors.password.message}</p>
              ) : null}
            </div>

            {errorMessage ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-600">{errorMessage}</p>
                {showRegister ? (
                  <p className="text-xs text-slate-600">
                    Si aún no tienes cuenta, puedes{" "}
                    <Link className="font-semibold text-primary hover:underline" href="/crear-usuario">
                      registrarte aquí
                    </Link>
                    .
                  </p>
                ) : null}
              </div>
            ) : null}

            <Button className="mt-2 w-full font-semibold" type="submit" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Ingresando..." : "Ingresar"}
            </Button>

            <div className="flex w-full flex-wrap justify-center gap-3 pt-2">
              {showRegister ? (
                <Button asChild className="min-w-40 font-semibold" size="sm" variant="secondary">
                  <Link href="/crear-usuario">Crear usuario</Link>
                </Button>
              ) : null}
              <Button asChild className="min-w-40 font-semibold" size="sm" variant="secondary">
                <Link href="/recuperar-contrasena">Recuperar contraseña</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
