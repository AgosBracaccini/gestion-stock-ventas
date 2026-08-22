import { ENDPOINTS, USE_MOCKS } from "../config";
import { apiRequest, toList } from "../http";
import type { MovimientoStock } from "../types";
import { mockMovimientos } from "../../mocks/design-data";

export const movimientosService = {
  async list(params?: { tipo_movimiento?: string; search?: string }): Promise<MovimientoStock[]> {
    if (USE_MOCKS) return mockMovimientos;
    const data = await apiRequest<unknown>(ENDPOINTS.movimientos, {
      query: {
        tipo_movimiento: params?.tipo_movimiento ?? undefined,
        search: params?.search ?? undefined,
      },
    });
    return toList<MovimientoStock>(data);
  },
};
