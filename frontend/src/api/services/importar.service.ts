import { apiRequest } from "../http";
import { API_URL, ENDPOINTS } from "../config";
import { getAccessToken } from "../tokens";

export interface FilaConError {
  fila: number;
  mensaje: string;
  datos: Record<string, unknown> | null;
}

export interface ResultadoImportacion {
  creados: number;
  actualizados: number;
  errores: FilaConError[];
}

async function subirArchivo(path: string, archivo: File): Promise<ResultadoImportacion> {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken() ?? ""}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detalle =
      data && typeof data === "object" && "detail" in data ? String((data as { detail: unknown }).detail) : null;
    throw new Error(detalle ?? "No se pudo importar el archivo.");
  }

  return data as ResultadoImportacion;
}

export const importarService = {
  precios: (archivo: File) => subirArchivo(ENDPOINTS.importarPrecios, archivo),
  stock: (archivo: File) => subirArchivo(ENDPOINTS.importarStock, archivo),

  corregirPrecio: (datos: Record<string, unknown>) =>
    apiRequest<{ creado: boolean }>(ENDPOINTS.corregirPrecio, { method: "POST", body: datos }),

  corregirStock: (datos: Record<string, unknown>) =>
    apiRequest<{ creado: boolean }>(ENDPOINTS.corregirStock, { method: "POST", body: datos }),
};