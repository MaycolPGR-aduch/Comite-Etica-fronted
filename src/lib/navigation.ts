import type { Role } from "@/types";

export interface NavItem {
  href: string;
  label: string;
}

export const roleLabel: Record<Role, string> = {
  investigador: "Investigador",
  secretaria: "Secretaria tecnica",
  coordinador: "Coordinador",
  evaluador: "Evaluador",
  administrador: "Administrador",
};

export const roleNavigation: Record<Role, NavItem[]> = {
  investigador: [
    { href: "/investigador/dashboard", label: "Dashboard" },
    { href: "/investigador/expedientes/nuevo", label: "Nuevo expediente" },
    { href: "/investigador/expedientes", label: "Mis expedientes" },
  ],
  secretaria: [
    { href: "/secretaria/bandeja", label: "Bandeja" },
    { href: "/secretaria/revision/exp-003", label: "Revision administrativa" },
  ],
  coordinador: [
    { href: "/coordinador/dashboard", label: "Dashboard" },
    { href: "/coordinador/asignacion/exp-004", label: "Asignacion" },
    { href: "/coordinador/consolidacion/exp-007", label: "Consolidacion" },
  ],
  evaluador: [
    { href: "/evaluador/bandeja", label: "Bandeja" },
    { href: "/evaluador/evaluacion/exp-001", label: "Evaluacion etica" },
  ],
  administrador: [{ href: "/admin/configuracion", label: "Configuracion" }],
};

export const resolveRoleFromPath = (pathname: string): Role => {
  if (pathname.startsWith("/secretaria")) return "secretaria";
  if (pathname.startsWith("/coordinador")) return "coordinador";
  if (pathname.startsWith("/evaluador")) return "evaluador";
  if (pathname.startsWith("/admin")) return "administrador";
  return "investigador";
};
