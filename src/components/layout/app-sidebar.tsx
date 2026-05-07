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
    <aside className="hidden w-64 shrink-0 border-r border-blue-100 bg-white p-4 lg:block">
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
              className={`block rounded-md px-3 py-2 text-sm transition ${
                isActive
                  ? "bg-blue-100 font-medium text-[#08204A]"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-blue-100 pt-4 text-sm text-slate-500">
        <Link
          className="text-[#0B57B7] hover:underline"
          href="/login"
          onClick={() => clearAuthSession()}
        >
          Cambiar rol
        </Link>
      </div>
    </aside>
  );
}
