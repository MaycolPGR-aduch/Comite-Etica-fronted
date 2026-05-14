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
    { href: "/secretaria/bandeja", label: "Revision administrativa" },
    { href: "/secretaria/perfil", label: "Mi perfil" },
  ],
  coordinador: [
    { href: "/coordinador/dashboard", label: "Dashboard" },
    { href: "/coordinador/dashboard", label: "Asignacion" },
    { href: "/coordinador/dashboard", label: "Consolidacion" },
    { href: "/coordinador/reportes", label: "Reportes" },
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
    { href: "/admin/reportes", label: "Reportes" },
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
