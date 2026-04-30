import { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative z-0 flex min-h-screen flex-col overflow-hidden">
      <div
        className="absolute inset-0 z-0 scale-105 bg-cover bg-center blur-[1.5px]"
        style={{ backgroundImage: "url('/universidad-fondo.png')" }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#08204A]/35 via-[#08204A]/20 to-[#08204A]/45" />

      <main className="relative z-20 flex flex-1 items-center justify-center px-4 py-10">{children}</main>

      <footer className="relative z-20 border-t border-white/20 bg-[#08204A]/85 px-4 py-4 text-center text-xs font-medium text-blue-100">
        Universidad de Ciencias y Humanidades · Sistema del Comite de Etica · 2026
      </footer>
    </div>
  );
}
