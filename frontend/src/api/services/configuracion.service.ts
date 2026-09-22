import { ENDPOINTS } from "../config";
import { apiRequest } from "../http";
import type { ConfiguracionPrecios, ConfiguracionTienda } from "../types";

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

export const configuracionTiendaService = {
  async obtener(): Promise<ConfiguracionTienda> {
    return apiRequest<ConfiguracionTienda>(ENDPOINTS.configuracionTienda);
  },
  async actualizar(id: number, cambios: Partial<ConfiguracionTienda>): Promise<ConfiguracionTienda> {
    return apiRequest<ConfiguracionTienda>(`${ENDPOINTS.configuracionTienda}${id}/`, {
      method: "PATCH",
      body: cambios,
    });
  },
};