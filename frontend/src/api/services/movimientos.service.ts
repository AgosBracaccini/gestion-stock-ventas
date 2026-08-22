import { ENDPOINTS } from "../config";
import { apiRequest, toList } from "../http";
import type { MovimientoStock } from "../types";

export const movimientosService = {
  async list(params?: {
    tipo_movimiento?: string;
    search?: string;
  }): Promise<MovimientoStock[]> {
    const data = await apiRequest<unknown>(
      ENDPOINTS.movimientos,
      {
        query: {
          tipo_movimiento:
            params?.tipo_movimiento ?? undefined,
          search: params?.search ?? undefined,
        },
      },
    );

    return toList<MovimientoStock>(data);
  },
};