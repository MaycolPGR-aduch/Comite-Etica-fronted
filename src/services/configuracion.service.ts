import { configuracionMock } from "@/mocks";
import type { ConfiguracionCatalogos } from "@/types";

import { clone, wait } from "./service-utils";

export const configuracionService = {
  async getCatalogos(): Promise<ConfiguracionCatalogos> {
    await wait();
    return clone(configuracionMock);
  },
};
