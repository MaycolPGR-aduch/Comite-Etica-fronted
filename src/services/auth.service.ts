import { redirectByRole, usuariosMock } from "@/mocks";
import type { LoginPayload, LoginResult } from "@/types";

import { clone, wait } from "./service-utils";

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResult> {
    await wait();

    const user = usuariosMock.find(
      (candidate) =>
        candidate.role === payload.role &&
        candidate.correo.toLowerCase() === payload.correo.toLowerCase(),
    );

    const selected = user ??
      usuariosMock.find((candidate) => candidate.role === payload.role);

    if (!selected) {
      throw new Error("Rol no disponible en entorno mock.");
    }

    return {
      usuario: clone(selected),
      redirectTo: redirectByRole[selected.role],
    };
  },
};
