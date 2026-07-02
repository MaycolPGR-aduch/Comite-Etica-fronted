"use client";

import Link from "next/link";
import { LogOut, Menu, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";

import { roleLabel, roleNavigation, roleProfilePath, resolveRoleFromPath } from "@/lib/navigation";
import { clearAuthSession } from "@/services/auth-session";
import { NotificationsPanel } from "@/components/layout/notifications-panel";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const titleBySegment: Record<string, string> = {
  dashboard: "Dashboard",
  expedientes: "Mis proyectos",
  nuevo: "Nuevo proyecto",
  "cambio-titulo": "Cambiar título",
  bandeja: "Bandeja",
  revision: "Revision administrativa",
  asignacion: "Asignacion de evaluadores",
  evaluacion: "Evaluacion etica",
  reportes: "Reportes",
  usuarios: "Usuarios",
  configuracion: "Configuracion",
  subsanacion: "Subsanacion",
  perfil: "Mi perfil",
  consultas: "Consultas",
  chat: "Chat",
};

const resolveTitle = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "dashboard";
  const previous = segments[segments.length - 2] ?? "dashboard";

  if (titleBySegment[last]) {
    return titleBySegment[last];
  }

  if (titleBySegment[previous]) {
    return titleBySegment[previous];
  }

  return "Gestion de protocolos";
};

export function AppHeader() {
  const pathname = usePathname();
  const role = resolveRoleFromPath(pathname);
  const title = resolveTitle(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="lg:hidden" size="icon" variant="outline">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 space-y-1">
                {roleNavigation[role].map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{roleLabel[role]}</p>
            <h1 className="font-heading text-lg font-semibold text-foreground">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationsPanel />
          <Link
            aria-label="Ver perfil"
            className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            href={roleProfilePath[role]}
            title="Mi perfil"
          >
            <UserRound aria-hidden="true" className="size-[18px]" />
          </Link>
          <Link
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            href="/login"
            onClick={() => clearAuthSession()}
          >
            <LogOut aria-hidden="true" className="size-4" />
            Cerrar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}
