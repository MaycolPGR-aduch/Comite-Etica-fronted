"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { roleLabel, roleNavigation, resolveRoleFromPath } from "@/lib/navigation";
import { clearAuthSession } from "@/services/auth-session";

export function AppSidebar() {
  const pathname = usePathname();
  const role = resolveRoleFromPath(pathname);
  const navItems = roleNavigation[role];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card p-4 lg:block">
      <div className="mb-6 rounded-lg bg-[#08204A] p-4 text-white">
        <p className="text-sm opacity-85">Comite de Etica</p>
        <p className="font-semibold">{roleLabel[role]}</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-2 rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "border-primary bg-secondary font-medium text-secondary-foreground"
                  : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-border pt-4 text-sm">
        <Link
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 font-medium text-primary transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          href="/login"
          onClick={() => clearAuthSession()}
        >
          Cerrar sesión
        </Link>
      </div>
    </aside>
  );
}
