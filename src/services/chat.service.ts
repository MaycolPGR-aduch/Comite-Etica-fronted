import axios from "axios";

import { api } from "@/lib/api";
import type {
  ChatNoLeidosDto,
  ConversacionResumenDto,
  MensajeChatCreateRequestDto,
  MensajeChatResponseDto,
  SolicitanteChatItemDto,
} from "@/types";

/** Mensaje del chat mapeado a dominio. */
export interface MensajeChat {
  id: string;
  solicitanteId: string;
  autorId: string;
  texto: string;
  leido: boolean;
  esDeSecretaria: boolean;
  createdAt: string;
}

/** Conversación de la bandeja de secretaría. */
export interface ConversacionChat {
  solicitanteId: string;
  nombre: string;
  rol: string;
  email: string;
  codigoEstudiante: string | null;
  ultimoMensaje: string;
  ultimaFecha: string;
  noLeidos: number;
}

/** Solicitante elegible para iniciar una conversación. */
export interface SolicitanteChat {
  id: string;
  nombre: string;
  rol: string;
  email: string;
  codigoEstudiante: string | null;
}

const toMensaje = (dto: MensajeChatResponseDto): MensajeChat => ({
  id: String(dto.id),
  solicitanteId: String(dto.solicitante_id),
  autorId: String(dto.autor_id),
  texto: dto.texto,
  leido: dto.leido,
  esDeSecretaria: dto.es_de_secretaria,
  createdAt: dto.created_at,
});

const toConversacion = (dto: ConversacionResumenDto): ConversacionChat => ({
  solicitanteId: String(dto.solicitante_id),
  nombre: dto.nombre,
  rol: dto.rol,
  email: dto.email,
  codigoEstudiante: dto.codigo_estudiante ?? null,
  ultimoMensaje: dto.ultimo_mensaje,
  ultimaFecha: dto.ultima_fecha,
  noLeidos: dto.no_leidos,
});

const toSolicitante = (dto: SolicitanteChatItemDto): SolicitanteChat => ({
  id: String(dto.id),
  nombre: dto.nombre,
  rol: dto.rol,
  email: dto.email,
  codigoEstudiante: dto.codigo_estudiante ?? null,
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
  return "No se pudo completar la operación del chat.";
};

export const chatService = {
  // ---------- Lado solicitante ----------
  async getMiHilo(): Promise<MensajeChat[]> {
    try {
      const response = await api.get<MensajeChatResponseDto[]>("/chat/mios");
      return response.data.map(toMensaje);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async enviarComoSolicitante(texto: string): Promise<MensajeChat> {
    const payload: MensajeChatCreateRequestDto = { texto };
    try {
      const response = await api.post<MensajeChatResponseDto>("/chat/mios", payload);
      return toMensaje(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getMisNoLeidos(): Promise<number> {
    try {
      const response = await api.get<ChatNoLeidosDto>("/chat/mios/no-leidos");
      return response.data.no_leidos;
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  // ---------- Lado secretaría ----------
  async getConversaciones(): Promise<ConversacionChat[]> {
    try {
      const response = await api.get<ConversacionResumenDto[]>("/chat/conversaciones");
      return response.data.map(toConversacion);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getSolicitantes(): Promise<SolicitanteChat[]> {
    try {
      const response = await api.get<SolicitanteChatItemDto[]>("/chat/solicitantes");
      return response.data.map(toSolicitante);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getHiloDeSolicitante(solicitanteId: string): Promise<MensajeChat[]> {
    const parsed = Number(solicitanteId);
    if (!Number.isFinite(parsed)) {
      throw new Error("El identificador del solicitante no es válido.");
    }
    try {
      const response = await api.get<MensajeChatResponseDto[]>(`/chat/${parsed}`);
      return response.data.map(toMensaje);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async enviarComoSecretaria(solicitanteId: string, texto: string): Promise<MensajeChat> {
    const parsed = Number(solicitanteId);
    if (!Number.isFinite(parsed)) {
      throw new Error("El identificador del solicitante no es válido.");
    }
    const payload: MensajeChatCreateRequestDto = { texto };
    try {
      const response = await api.post<MensajeChatResponseDto>(`/chat/${parsed}`, payload);
      return toMensaje(response.data);
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },

  async getTotalNoLeidos(): Promise<number> {
    try {
      const response = await api.get<ChatNoLeidosDto>("/chat/no-leidos");
      return response.data.no_leidos;
    } catch (error) {
      throw new Error(resolveErrorMessage(error));
    }
  },
};
