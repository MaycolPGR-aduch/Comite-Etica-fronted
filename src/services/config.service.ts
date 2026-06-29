import { api } from "@/lib/api";

export interface FechaLimiteResponse {
  fecha_limite: string | null;
}

export const configService = {
  async getFechaLimite(): Promise<string | null> {
    const response = await api.get<FechaLimiteResponse>("/config/fecha-limite");
    return response.data.fecha_limite;
  },

  async setFechaLimite(fechaLimite: string | null): Promise<string | null> {
    const response = await api.put<FechaLimiteResponse>("/config/fecha-limite", {
      fecha_limite: fechaLimite,
    });
    return response.data.fecha_limite;
  },
};
