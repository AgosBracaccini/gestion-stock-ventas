import { ENDPOINTS, USE_MOCKS } from "../config";
import { apiRequest, toList } from "../http";
import type {
  NuevaVentaPayload,
  ResumenDashboard,
  Venta,
} from "../types";
import { mockVentas } from "../../mocks/design-data";

export const ventasService = {
  async list(): Promise<Venta[]> {
    if (USE_MOCKS) return mockVentas;
    const data = await apiRequest<unknown>(ENDPOINTS.ventas);
    return toList<Venta>(data);
  },
  
  async resumen(): Promise<ResumenDashboard> {
    return apiRequest<ResumenDashboard>(
      ENDPOINTS.ventasResumen
    );
  },

  async detail(id: number): Promise<Venta> {
    if (USE_MOCKS) {
      const venta = mockVentas.find((v) => v.id === id);
      if (!venta) throw new Error("Venta no encontrada");
      return venta;
    }
    return apiRequest<Venta>(`${ENDPOINTS.ventas}${id}/`);
  },

  /** Confirma la venta. El backend valida stock y descuenta transaccionalmente. */
  async create(payload: NuevaVentaPayload): Promise<Venta> {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return {
        id: Math.floor(Math.random() * 9000) + 1000,
        fecha: new Date().toISOString(),
        medio_pago: payload.medio_pago,
        total: 0,
      };
    }
    return apiRequest<Venta>(ENDPOINTS.ventas, { method: "POST", body: payload });
  },
};
