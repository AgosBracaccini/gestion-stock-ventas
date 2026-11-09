// Si VITE_API_URL no está definida:
// - En la versión compilada (producción), el backend es el mismo servidor que
//   entregó la app, por lo que se usa su misma dirección.
// - En desarrollo (npm run dev), se busca en el mismo equipo, puerto 8000.
// Así funciona igual entrando por localhost que por la IP de la red.
const rawBase =
  (import.meta.env["VITE_API_URL"] as string | undefined) ??
  (import.meta.env.PROD
    ? window.location.origin
    : `${window.location.protocol}//${window.location.hostname}:8000`);

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
  importarVentas: "/api/importar/ventas/",
  corregirPrecio: "/api/importar/precios/fila/",
  corregirStock: "/api/importar/stock/fila/",
} as const;

export const STOCK_BAJO_UMBRAL = 3;
