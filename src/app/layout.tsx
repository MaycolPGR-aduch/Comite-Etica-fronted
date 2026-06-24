import type { Metadata } from "next";

import { AppProviders } from "@/components/layout";

import "./globals.css";

export const metadata: Metadata = {
  title: "Comite de Etica - Gestion de Proyectos",
  description:
    "Sistema web para la gestion y evaluacion de proyectos del Comite de Etica universitario.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
