import { ENDPOINTS } from "../config";
import { apiRequest, toList } from "../http";
import type {
  NuevaVentaPayload,
  ResumenDashboard,
  Venta,
} from "../types";

export const ventasService = {
  async list(): Promise<Venta[]> {
    const data = await apiRequest<unknown>(
      ENDPOINTS.ventas,
    );

    return toList<Venta>(data);
  },

  async resumen(): Promise<ResumenDashboard> {
    return apiRequest<ResumenDashboard>(
      ENDPOINTS.ventasResumen,
    );
  },

  async detail(id: number): Promise<Venta> {
    return apiRequest<Venta>(
      `${ENDPOINTS.ventas}${id}/`,
    );
  },

  /** Confirma la venta. El backend valida stock y descuenta transaccionalmente. */
  async create(
    payload: NuevaVentaPayload,
  ): Promise<Venta> {
    return apiRequest<Venta>(
      ENDPOINTS.ventas,
      {
        method: "POST",
        body: payload,
      },
    );
  },
};