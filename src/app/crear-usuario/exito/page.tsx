import Link from "next/link";

import { AuthShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CrearUsuarioExitoPage() {
  return (
    <AuthShell>
      <Card className="w-full max-w-md border-blue-100/70 bg-white/93 text-center shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">Registro completado</p>
          <CardTitle className="text-3xl font-bold text-[#08204A]">Usuario creado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-medium text-slate-600">
            El usuario fue registrado correctamente en el backend.
          </p>
          <Button asChild className="w-full font-semibold">
            <Link href="/login">Ir a inicio de sesion</Link>
          </Button>
          <Button asChild className="w-full font-semibold" variant="outline">
            <Link href="/crear-usuario">Registrar otro usuario</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
