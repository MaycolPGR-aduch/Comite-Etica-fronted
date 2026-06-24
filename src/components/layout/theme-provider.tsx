"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "ce-theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const persist = (theme: Theme) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignorar entornos sin acceso a localStorage.
  }
};

/**
 * Proveedor de tema. Solo guarda la preferencia (light/dark) y la persiste; la
 * aplicación de la clase `.dark` la realiza el área autenticada (DashboardLayout)
 * para que las pantallas públicas y de login permanezcan siempre claras.
 */
export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>("light");

  // Se resuelve la preferencia tras el montaje (no en el render) para leer
  // localStorage/sistema solo en el cliente y evitar desajustes de hidratación.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial: Theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(initial);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    persist(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next = current === "dark" ? "light" : "dark";
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de ThemeProvider");
  }
  return context;
}
