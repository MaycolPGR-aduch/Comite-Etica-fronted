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
    { href: "/investigador/perfil", label: "Mi perfil" },
  ],
  secretaria: [
    { href: "/secretaria/bandeja", label: "Bandeja" },
    { href: "/secretaria/revision/exp-003", label: "Revision administrativa" },
    { href: "/secretaria/perfil", label: "Mi perfil" },
  ],
  coordinador: [
    { href: "/coordinador/dashboard", label: "Dashboard" },
    { href: "/coordinador/asignacion/exp-004", label: "Asignacion" },
    { href: "/coordinador/consolidacion/exp-007", label: "Consolidacion" },
    { href: "/coordinador/perfil", label: "Mi perfil" },
  ],
  evaluador: [
    { href: "/evaluador/bandeja", label: "Bandeja" },
    { href: "/evaluador/bandeja", label: "Evaluacion etica" },
    { href: "/evaluador/perfil", label: "Mi perfil" },
  ],
  administrador: [
    { href: "/admin/usuarios", label: "Usuarios" },
    { href: "/admin/configuracion", label: "Configuracion" },
    { href: "/admin/perfil", label: "Mi perfil" },
  ],
};

export const resolveRoleFromPath = (pathname: string): Role => {
  if (pathname.startsWith("/secretaria")) return "secretaria";
  if (pathname.startsWith("/coordinador")) return "coordinador";
  if (pathname.startsWith("/evaluador")) return "evaluador";
  if (pathname.startsWith("/admin")) return "administrador";
  return "investigador";
};
