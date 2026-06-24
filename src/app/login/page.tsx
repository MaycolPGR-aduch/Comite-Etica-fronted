"use client";

import { LoginPortal } from "@/components/layout";

// Portal de acceso para investigadores. El backend define el rol real; este
// portal fija el rol "investigador" y la validación rechaza credenciales que
// no correspondan. Cuando el backend divida el rol en estudiante de pregrado,
// estudiante de posgrado e investigador, este portal deberá aceptar ese
// conjunto de sub-roles (hoy el backend aún no los expone).
export default function LoginPage() {
  return (
    <LoginPortal
      title="Acceso a investigadores"
      subtitle="Inicio de sesión para investigadores del Comité de Ética."
      roleMode={{ kind: "fixed", role: "investigador" }}
      showRegister
      crossPortal={{ href: "/login/staff", label: "Acceso para personal del Comité" }}
    />
  );
}
