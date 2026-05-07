import type { Role, Usuario } from "@/types";

const AUTH_TOKEN_KEY = "ce_auth_token";
const AUTH_USER_KEY = "ce_auth_user";
const AUTH_ROLE_KEY = "ce_auth_role";

const isBrowser = () => typeof window !== "undefined";

const setCookie = (name: string, value: string, maxAgeSeconds = 60 * 60 * 8) => {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
};

const clearCookie = (name: string) => {
  if (!isBrowser()) return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
};

export const persistAuthSession = (token: string, usuario: Usuario) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(usuario));
  setCookie(AUTH_TOKEN_KEY, token);
  setCookie(AUTH_ROLE_KEY, usuario.role);
};

export const getAuthToken = (): string | null => {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getAuthUser = (): Usuario | null => {
  if (!isBrowser()) return null;

  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
};

export const getAuthRole = (): Role | null => getAuthUser()?.role ?? null;

export const clearAuthSession = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  clearCookie(AUTH_TOKEN_KEY);
  clearCookie(AUTH_ROLE_KEY);
};
