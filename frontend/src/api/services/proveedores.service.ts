import { ENDPOINTS } from "../config";
import { apiRequest, toList } from "../http";
import type { Proveedor } from "../types";

export const proveedoresService = {
  async list(search?: string): Promise<Proveedor[]> {
    const data = await apiRequest<unknown>(
      ENDPOINTS.proveedores,
      {
        query: { search: search ?? undefined },
      },
    );

    return toList<Proveedor>(data);
  },

  async create(nombre: string): Promise<Proveedor> {
    return apiRequest<Proveedor>(
      ENDPOINTS.proveedores,
      {
        method: "POST",
        body: { nombre },
      },
    );
  },

  async update(
    id: number,
    nombre: string,
  ): Promise<Proveedor> {
    return apiRequest<Proveedor>(
      `${ENDPOINTS.proveedores}${id}/`,
      {
        method: "PATCH",
        body: { nombre },
      },
    );
  },
};