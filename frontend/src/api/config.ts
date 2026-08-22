

const rawBase = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://127.0.0.1:8000";

export const API_URL = rawBase.replace(/\/+$/, "");

/**
 * Mientras el backend no esté accesible desde el navegador, se pueden usar
 * datos simulados SOLO para diseñar las pantallas. Están aislados en src/mocks
 * y no forman parte de los servicios de API.
 */
export const USE_MOCKS =
  ((import.meta.env["VITE_USE_MOCKS"] as string | undefined) ?? "true") !== "false";

/**
 * Endpoints.
 * Los de autenticación y ventas fueron definidos explícitamente.
 * El resto sigue la convención de DRF y está centralizado acá para poder
 * ajustarlo a un solo lugar cuando se confirme el Swagger del backend.
 */
export const ENDPOINTS = {
  token: "/api/token/",
  tokenRefresh: "/api/token/refresh/",
  ventas: "/api/ventas/",
  ventasResumen: "/api/ventas/resumen/",
  productos: "/api/productos/",
  variantes: "/api/variantes/",
  ingresoMercaderia: "/api/variantes/ingresar-mercaderia/",
  movimientos: "/api/movimientos-stock/",
  proveedores: "/api/proveedores/",
} as const;

export const STOCK_BAJO_UMBRAL = 3;
