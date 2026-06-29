import axios from "axios";

import { api } from "@/lib/api";
import type { CreateUserPayload, Role, UserResponseDto, Usuario } from "@/types";

export interface UserUpdatePayload {
  nombre?: string;
  apellido?: string;
  rol?: Role;
  activo?: boolean;
}

const roleSet = new Set<Role>([
  "investigador",
  "estudiante_pregrado",
  "estudiante_postgrado",
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

const resolveErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No se pudo completar la operacion de usuarios.";
};

export const usersService = {
  async create(payload: CreateUserPayload): Promise<Usuario> {
    try {
      const response = await api.post<UserResponseDto>("/users/", payload);
      return toDomainUser(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async list(): Promise<Usuario[]> {
    try {
      const response = await api.get<UserResponseDto[]>("/users/", {
        params: { skip: 0, limit: 100 },
      });

      return response.data.map(toDomainUser);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getById(id: string): Promise<Usuario> {
    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      throw new Error("El identificador del usuario no es valido.");
    }

    try {
      const response = await api.get<UserResponseDto>(`/users/${userId}`);
      return toDomainUser(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async update(id: string, payload: UserUpdatePayload): Promise<Usuario> {
    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      throw new Error("El identificador del usuario no es valido.");
    }

    try {
      const response = await api.put<UserResponseDto>(`/users/${userId}`, payload);
      return toDomainUser(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async deactivate(id: string): Promise<void> {
    const userId = Number(id);
    if (!Number.isFinite(userId)) {
      throw new Error("El identificador del usuario no es valido.");
    }

    try {
      await api.delete(`/users/${userId}`);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },
};
