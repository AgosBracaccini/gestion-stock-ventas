import { ENDPOINTS } from "../config";
import { apiRequest } from "../http";
import type { ConfiguracionPrecios } from "../types";

export const configuracionService = {
  async obtener(): Promise<ConfiguracionPrecios> {
    return apiRequest<ConfiguracionPrecios>(
      ENDPOINTS.configuracionPrecios,
    );
  },

  async actualizar(
    id: number,
    cambios: Partial<ConfiguracionPrecios>,
  ): Promise<ConfiguracionPrecios> {
    return apiRequest<ConfiguracionPrecios>(
      `${ENDPOINTS.configuracionPrecios}${id}/`,
      {
        method: "PATCH",
        body: cambios,
      },
    );
  },
};