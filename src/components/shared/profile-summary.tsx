"use client";

import type { ComponentType, ReactNode } from "react";
import { AlertTriangle, Gauge, Mail, ShieldCheck, Stethoscope, UserRound } from "lucide-react";

import { useMyProfile } from "@/hooks";
import { roleLabel } from "@/lib/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "U";

interface InfoRowProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}

function InfoRow({ icon: Icon, label, children }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <div className="text-sm font-medium text-foreground break-words">{children}</div>
      </div>
    </div>
  );
}

export function ProfileSummary() {
  const { data: profile, isLoading, error } = useMyProfile();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-4 bg-gradient-to-r from-[#08204A] to-[#0B57B7] px-6 py-8">
            <Skeleton className="h-16 w-16 rounded-full bg-white/20" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 bg-white/20" />
              <Skeleton className="h-4 w-32 bg-white/20" />
            </div>
          </div>
        </Card>
        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mi perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">No se pudo cargar tu perfil desde el backend.</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  const showEvaluacion =
    profile.role === "evaluador" ||
    profile.especialidad != null ||
    profile.cargaTrabajo != null;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-blue-100">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-[#08204A] to-[#0B57B7] px-6 py-8 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 text-2xl font-bold text-white backdrop-blur-sm">
            {getInitials(profile.nombre)}
          </div>
          <div className="min-w-0 space-y-2">
            <h2 className="truncate text-2xl font-bold text-white">{profile.nombre}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/30 bg-white/15 text-white">{roleLabel[profile.role]}</Badge>
              <Badge
                className={
                  profile.activo
                    ? "border-emerald-300/40 bg-emerald-400/20 text-emerald-50"
                    : "border-white/30 bg-white/10 text-blue-50"
                }
              >
                {profile.activo ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="flex items-center gap-2 text-sm text-blue-100">
              <Mail className="h-4 w-4" />
              <span className="truncate">{profile.correo}</span>
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Información de la cuenta</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <InfoRow icon={UserRound} label="Nombre">
            {profile.nombre}
          </InfoRow>
          <InfoRow icon={Mail} label="Correo">
            {profile.correo}
          </InfoRow>
          <InfoRow icon={ShieldCheck} label="Rol">
            {roleLabel[profile.role]}
          </InfoRow>
        </CardContent>
      </Card>

      {showEvaluacion ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Datos de evaluación</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoRow icon={Stethoscope} label="Especialidad">
              {profile.especialidad ?? "No registrada"}
            </InfoRow>
            <InfoRow icon={Gauge} label="Carga de trabajo">
              {profile.cargaTrabajo ?? "Sin asignar"}
            </InfoRow>
            <InfoRow icon={AlertTriangle} label="Conflicto de interés">
              <Badge variant={profile.conflictoInteres ? "destructive" : "outline"}>
                {profile.conflictoInteres ? "Sí" : "No"}
              </Badge>
            </InfoRow>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
