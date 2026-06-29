import type { Role } from "@/types";

export interface NavItem {
  href: string;
  label: string;
}

export const roleLabel: Record<Role, string> = {
  investigador: "Investigador",
  estudiante_pregrado: "Estudiante de pregrado",
  estudiante_postgrado: "Estudiante de postgrado",
  secretaria: "Secretaria tecnica",
  coordinador: "Coordinador",
  evaluador: "Evaluador",
  administrador: "Administrador",
};

// Los 3 roles auto-registrables comparten la misma navegación funcional.
const solicitanteNav: NavItem[] = [
  { href: "/investigador/dashboard", label: "Dashboard" },
  { href: "/investigador/expedientes/nuevo", label: "Nuevo proyecto" },
  { href: "/investigador/cambio-titulo", label: "Cambiar título" },
  { href: "/investigador/expedientes", label: "Mis proyectos" },
];

export const roleNavigation: Record<Role, NavItem[]> = {
  investigador: solicitanteNav,
  estudiante_pregrado: solicitanteNav,
  estudiante_postgrado: solicitanteNav,
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
  estudiante_pregrado: "/investigador/perfil",
  estudiante_postgrado: "/investigador/perfil",
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
