import axios from "axios";

import { api } from "@/lib/api";
import type {
  Notificacion,
  NotificacionCreatePayload,
  NotificacionCreateRequestDto,
  NotificacionMessageResponseDto,
  NotificacionResponseDto,
  NotificacionSinLeer,
  NotificacionSinLeerResponseDto,
  NotificacionUpdateRequestDto,
} from "@/types";

const toDomainNotification = (dto: NotificacionResponseDto): Notificacion => ({
  id: String(dto.id),
  titulo: dto.titulo,
  mensaje: dto.mensaje,
  expedienteId: dto.expediente_id ? String(dto.expediente_id) : undefined,
  usuarioId: String(dto.usuario_id),
  leida: dto.leida,
  createdAt: dto.created_at,
});

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

  return "No se pudo completar la operación de notificaciones.";
};

export const notificationsService = {
  async list(skip = 0, limit = 30): Promise<Notificacion[]> {
    try {
      const response = await api.get<NotificacionResponseDto[]>("/notificaciones/", {
        params: { skip, limit },
      });
      return response.data.map(toDomainNotification);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getUnreadCount(): Promise<NotificacionSinLeer> {
    try {
      const response = await api.get<NotificacionSinLeerResponseDto>("/notificaciones/sin-leer");
      return { sinLeer: response.data.sin_leer };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getById(id: string): Promise<Notificacion> {
    const notificationId = Number(id);
    if (!Number.isFinite(notificationId)) {
      throw new Error("El identificador de la notificación no es válido.");
    }

    try {
      const response = await api.get<NotificacionResponseDto>(`/notificaciones/${notificationId}`);
      return toDomainNotification(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async create(payload: NotificacionCreatePayload): Promise<Notificacion> {
    const userId = Number(payload.usuarioId);
    if (!Number.isFinite(userId)) {
      throw new Error("El identificador de usuario no es válido.");
    }

    const requestBody: NotificacionCreateRequestDto = {
      titulo: payload.titulo.trim(),
      mensaje: payload.mensaje.trim(),
      usuario_id: userId,
      expediente_id: payload.expedienteId ? Number(payload.expedienteId) : null,
    };

    try {
      const response = await api.post<NotificacionResponseDto>("/notificaciones/", requestBody);
      return toDomainNotification(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async updateReadStatus(id: string, leida: boolean): Promise<Notificacion> {
    const notificationId = Number(id);
    if (!Number.isFinite(notificationId)) {
      throw new Error("El identificador de la notificación no es válido.");
    }

    const requestBody: NotificacionUpdateRequestDto = { leida };

    try {
      const response = await api.put<NotificacionResponseDto>(
        `/notificaciones/${notificationId}`,
        requestBody,
      );
      return toDomainNotification(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async markAllAsRead(): Promise<{ message: string }> {
    try {
      const response = await api.post<NotificacionMessageResponseDto>(
        "/notificaciones/marcar-todas-leidas",
      );
      return { message: response.data.message };
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },
};
