"use client";

import { LoginPortal } from "@/components/layout";

// Portal de acceso para el personal del Comité (roles administrativos). No
// permite auto-registro. El rol elegido se valida contra el rol real que
// devuelve el backend.
export default function StaffLoginPage() {
  return (
    <LoginPortal
      eyebrow="Comite de Etica · Personal"
      title="Acceso del personal"
      subtitle="Inicio de sesión para el personal del Comité de Ética."
      roleMode={{
        kind: "select",
        defaultRole: "secretaria",
        options: [
          { value: "secretaria", label: "Secretaria tecnica" },
          { value: "coordinador", label: "Coordinador" },
          { value: "evaluador", label: "Evaluador" },
          { value: "administrador", label: "Administrador" },
        ],
      }}
      crossPortal={{ href: "/login", label: "Acceso para investigadores" }}
    />
  );
}
