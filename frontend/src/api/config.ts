

const rawBase = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "http://127.0.0.1:8000";

export const API_URL = rawBase.replace(/\/+$/, "");

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
  configuracionPrecios: "/api/configuracion-precios/",
  configuracionTienda: "/api/configuracion-tienda/",
  configuracionEtiqueta: "/api/configuracion-etiqueta/",
  cajas: "/api/cajas/",
  importarPrecios: "/api/importar/precios/",
  importarStock: "/api/importar/stock/",
  corregirPrecio: "/api/importar/precios/fila/",
  corregirStock: "/api/importar/stock/fila/",
} as const;

export const STOCK_BAJO_UMBRAL = 3;
