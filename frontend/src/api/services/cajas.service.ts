import { ENDPOINTS } from "../config";
import { apiRequest, toList } from "../http";
import type { Caja, CajaInput } from "../types";

export const cajasService = {
  async listar(): Promise<Caja[]> {
    const data = await apiRequest<unknown>(ENDPOINTS.cajas);
    return toList<Caja>(data);
  },

  async obtener(id: number): Promise<Caja> {
    return apiRequest<Caja>(`${ENDPOINTS.cajas}${id}/`);
  },

  async crear(datos: CajaInput): Promise<Caja> {
    return apiRequest<Caja>(ENDPOINTS.cajas, {
      method: "POST",
      body: datos,
    });
  },

  async actualizar(id: number, datos: CajaInput): Promise<Caja> {
    return apiRequest<Caja>(`${ENDPOINTS.cajas}${id}/`, {
      method: "PUT",
      body: datos,
    });
  },

  async eliminar(id: number): Promise<void> {
    await apiRequest<unknown>(`${ENDPOINTS.cajas}${id}/`, {
      method: "DELETE",
    });
  },

  async obtenerPublica(codigoPublico: string): Promise<Caja> {
    return apiRequest<Caja>(`${ENDPOINTS.cajas}publica/${codigoPublico}/`);
  },
};