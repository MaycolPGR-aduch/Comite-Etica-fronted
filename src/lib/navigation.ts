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
    { href: "/secretaria/bandeja", label: "Revision administrativa" },
  ],
  coordinador: [
    { href: "/coordinador/dashboard", label: "Dashboard" },
    { href: "/coordinador/dashboard", label: "Asignacion" },
    { href: "/coordinador/dashboard", label: "Consolidacion" },
    { href: "/coordinador/reportes", label: "Reportes" },
  ],
  evaluador: [
    { href: "/evaluador/bandeja", label: "Bandeja" },
    { href: "/evaluador/bandeja", label: "Evaluacion etica" },
  ],
  administrador: [
    { href: "/admin/usuarios", label: "Usuarios" },
    { href: "/admin/configuracion", label: "Configuracion" },
    { href: "/admin/reportes", label: "Reportes" },
  ],
};

export const roleProfilePath: Record<Role, string> = {
  investigador: "/investigador/perfil",
  secretaria: "/secretaria/perfil",
  coordinador: "/coordinador/perfil",
  evaluador: "/evaluador/perfil",
  administrador: "/admin/perfil",
};

export const resolveRoleFromPath = (pathname: string): Role => {
  if (pathname.startsWith("/secretaria")) return "secretaria";
  if (pathname.startsWith("/coordinador")) return "coordinador";
  if (pathname.startsWith("/evaluador")) return "evaluador";
  if (pathname.startsWith("/admin")) return "administrador";
  return "investigador";
};
