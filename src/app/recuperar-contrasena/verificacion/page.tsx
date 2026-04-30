"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerificacionRecuperacionPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-blue-100/70 bg-white/93 shadow-xl backdrop-blur-sm">
        <CardHeader className="space-y-2 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0B57B7]">Verificacion</p>
          <CardTitle className="text-3xl font-bold text-[#08204A]">Ingresa el codigo</CardTitle>
          <p className="text-sm font-medium text-slate-600">
            Te enviamos un codigo de 6 digitos al correo registrado (mock).
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-semibold" htmlFor="codigo">
              Codigo de verificacion
            </Label>
            <Input
              id="codigo"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <Button
            className="w-full font-semibold"
            onClick={() => router.push("/recuperar-contrasena/nueva-clave")}
            disabled={code.trim().length < 6}
            type="button"
          >
            Verificar codigo
          </Button>

          <div className="flex items-center justify-between text-sm font-medium">
            <Link className="text-[#0B57B7] hover:text-[#4C93EB] hover:underline" href="/recuperar-contrasena">
              Cambiar correo
            </Link>
            <button className="text-[#0B57B7] hover:text-[#4C93EB] hover:underline" type="button">
              Reenviar codigo
            </button>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
