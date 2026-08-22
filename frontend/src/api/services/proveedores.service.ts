import { ENDPOINTS, USE_MOCKS } from "../config";
import { apiRequest, toList } from "../http";
import type { Proveedor } from "../types";
import { mockProveedores } from "../../mocks/design-data";

let mockState: Proveedor[] = [...mockProveedores];

export const proveedoresService = {
  async list(search?: string): Promise<Proveedor[]> {
    if (USE_MOCKS) {
      const term = (search ?? "").trim().toLowerCase();
      return term ? mockState.filter((p) => p.nombre.toLowerCase().includes(term)) : mockState;
    }
    const data = await apiRequest<unknown>(ENDPOINTS.proveedores, {
      query: { search: search ?? undefined },
    });
    return toList<Proveedor>(data);
  },

  async create(nombre: string): Promise<Proveedor> {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      const nuevo = { id: Math.max(0, ...mockState.map((p) => p.id)) + 1, nombre };
      mockState = [...mockState, nuevo];
      return nuevo;
    }
    return apiRequest<Proveedor>(ENDPOINTS.proveedores, { method: "POST", body: { nombre } });
  },

  async update(id: number, nombre: string): Promise<Proveedor> {
    if (USE_MOCKS) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      mockState = mockState.map((p) => (p.id === id ? { ...p, nombre } : p));
      return { id, nombre };
    }
    return apiRequest<Proveedor>(`${ENDPOINTS.proveedores}${id}/`, {
      method: "PATCH",
      body: { nombre },
    });
  },
};
