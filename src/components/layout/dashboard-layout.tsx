"use client";

import { PropsWithChildren, useEffect } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useTheme } from "@/components/layout/theme-provider";

export function DashboardLayout({ children }: PropsWithChildren) {
  const { theme } = useTheme();

  // El modo oscuro aplica solo al área autenticada: se activa la clase `.dark`
  // en <html> mientras este layout está montado y se retira al salir, de modo
  // que el login y las páginas públicas permanecen siempre claras. Aplicarla en
  // <html> también cubre los portales de Radix (sheets, diálogos, toasts).
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    return () => root.classList.remove("dark");
  }, [theme]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
