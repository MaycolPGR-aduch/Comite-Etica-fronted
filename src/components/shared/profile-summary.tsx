"use client";

import { useMyProfile } from "@/hooks";
import { roleLabel } from "@/lib/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const formatBoolean = (value: boolean | undefined) => (value ? "Sí" : "No");

export function ProfileSummary() {
  const { data: profile, isLoading, error } = useMyProfile();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mi perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mi perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            No se pudo cargar tu perfil desde el backend.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nombre</dt>
            <dd className="text-sm text-foreground">{profile.nombre}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Correo</dt>
            <dd className="text-sm text-foreground">{profile.correo}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rol</dt>
            <dd className="text-sm text-foreground">{roleLabel[profile.role]}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Especialidad</dt>
            <dd className="text-sm text-foreground">{profile.especialidad ?? "No aplica"}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Carga de trabajo</dt>
            <dd className="text-sm text-foreground">
              {profile.cargaTrabajo !== undefined ? profile.cargaTrabajo : "No aplica"}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conflicto de interés</dt>
            <dd className="text-sm text-foreground">{formatBoolean(profile.conflictoInteres)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
