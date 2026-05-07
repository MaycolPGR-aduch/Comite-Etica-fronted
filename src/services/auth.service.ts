import axios from "axios";

import { api } from "@/lib/api";
import type {
  LoginPayload,
  LoginResult,
  RegisterPayload,
  Role,
  TokenResponse,
  UserResponseDto,
  Usuario,
} from "@/types";

import { clearAuthSession, getAuthToken, getAuthUser, persistAuthSession } from "./auth-session";

const redirectByRole: Record<Role, string> = {
  investigador: "/investigador/dashboard",
  secretaria: "/secretaria/bandeja",
  coordinador: "/coordinador/dashboard",
  evaluador: "/evaluador/bandeja",
  administrador: "/admin/configuracion",
};

const roleSet = new Set<Role>([
  "investigador",
  "secretaria",
  "coordinador",
  "evaluador",
  "administrador",
]);

const isRole = (value: string): value is Role => roleSet.has(value as Role);

const toDomainUser = (dto: UserResponseDto): Usuario => {
  const role = dto.rol.toLowerCase();
  if (!isRole(role)) {
    throw new Error(`Rol no soportado por el frontend: ${dto.rol}`);
  }

  return {
    id: String(dto.id),
    nombre: `${dto.nombre} ${dto.apellido}`.trim(),
    correo: dto.email,
    role,
    activo: dto.activo ?? true,
    especialidad: dto.especialidad ?? undefined,
    cargaTrabajo: dto.carga_trabajo ?? undefined,
    conflictoInteres: dto.conflicto_interes ?? false,
  };
};

const toRegisterRequest = (payload: RegisterPayload) => ({
  nombres: payload.nombres,
  apellidos: payload.apellidos,
  correo: payload.correo,
  rol: payload.rol,
  password: payload.password,
  especialidad: payload.especialidad,
  carga_trabajo: payload.carga_trabajo,
  conflicto_interes: payload.conflicto_interes,
});

const resolveErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      if (error.response?.status === 401) {
        return "No existe una cuenta válida para ese correo en el rol seleccionado, o la contraseña es incorrecta.";
      }
      return detail;
    }

    if (error.response?.status === 401) {
      return "No existe una cuenta válida para ese correo en el rol seleccionado, o la contraseña es incorrecta.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo completar la autenticacion.";
};

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResult> {
    try {
      const body = new URLSearchParams({
        username: payload.correo,
        password: payload.password,
      });

      const tokenResponse = await api.post<TokenResponse>("/auth/login", body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const token = tokenResponse.data.access_token;

      const profileResponse = await api.get<UserResponseDto>("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const usuario = toDomainUser(profileResponse.data);

      if (usuario.role !== payload.role) {
        clearAuthSession();
        throw new Error(
          `El usuario pertenece al rol "${usuario.role}" y no al rol seleccionado "${payload.role}".`,
        );
      }

      persistAuthSession(token, usuario);

      return {
        usuario,
        redirectTo: redirectByRole[usuario.role],
      };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async register(payload: RegisterPayload): Promise<Usuario> {
    try {
      const response = await api.post<UserResponseDto>("/auth/register", toRegisterRequest(payload));
      return toDomainUser(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getMyProfile(): Promise<Usuario> {
    try {
      const response = await api.get<UserResponseDto>("/users/me");
      const usuario = toDomainUser(response.data);
      const token = getAuthToken();

      if (token) {
        persistAuthSession(token, usuario);
      }

      return usuario;
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  logout() {
    clearAuthSession();
  },

  getSessionUser() {
    return getAuthUser();
  },
};
