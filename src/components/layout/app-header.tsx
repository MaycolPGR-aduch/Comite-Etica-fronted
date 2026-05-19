"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
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
  expedientes: "Expedientes",
  nuevo: "Nuevo expediente",
  bandeja: "Bandeja",
  revision: "Revision administrativa",
  asignacion: "Asignacion de evaluadores",
  evaluacion: "Evaluacion etica",
  consolidacion: "Consolidacion y dictamen",
  reportes: "Reportes",
  usuarios: "Usuarios",
  configuracion: "Configuracion",
  subsanacion: "Subsanacion",
  perfil: "Mi perfil",
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
    <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 backdrop-blur">
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
              <nav className="mt-6 space-y-2">
                {roleNavigation[role].map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">{roleLabel[role]}</p>
            <h1 className="text-lg font-semibold text-[#08204A]">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NotificationsPanel />
          <Link
            aria-label="Ver perfil"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50"
            href={roleProfilePath[role]}
            title="Mi perfil"
          >
            <svg
              aria-hidden="true"
              fill="none"
              height="18"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="18"
            >
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="8" r="4" />
            </svg>
          </Link>
          <Link
            className="text-sm text-[#0B57B7] hover:underline"
            href="/login"
            onClick={() => clearAuthSession()}
          >
            Cerrar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}
