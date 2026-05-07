"use client";

import { useMyProfile } from "@/hooks";
import { roleLabel } from "@/lib/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <p className="text-sm text-slate-500">Cargando perfil...</p>
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
          <p className="text-sm text-red-600">
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
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre</dt>
            <dd className="text-sm text-slate-900">{profile.nombre}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Correo</dt>
            <dd className="text-sm text-slate-900">{profile.correo}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Rol</dt>
            <dd className="text-sm text-slate-900">{roleLabel[profile.role]}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Especialidad</dt>
            <dd className="text-sm text-slate-900">{profile.especialidad ?? "No aplica"}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Carga de trabajo</dt>
            <dd className="text-sm text-slate-900">
              {profile.cargaTrabajo !== undefined ? profile.cargaTrabajo : "No aplica"}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Conflicto de interés</dt>
            <dd className="text-sm text-slate-900">{formatBoolean(profile.conflictoInteres)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
