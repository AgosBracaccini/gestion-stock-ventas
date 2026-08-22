/**
 * DATOS SIMULADOS SOLO PARA DISEÑO.
 *
 * No forman parte de la lógica de negocio ni de los servicios de API.
 * Se usan únicamente cuando VITE_USE_MOCKS !== "false", para poder maquetar
 * las pantallas sin backend. Al conectar Django REST, poner
 * VITE_USE_MOCKS=false y este archivo deja de utilizarse.
 */
import type {
  FilaStock,
  MovimientoStock,
  Producto,
  Proveedor,
  Venta,
} from "../api/types";

export const mockProveedores: Proveedor[] = [
  { id: 1, nombre: "Textil Rosario" },
  { id: 2, nombre: "Distribuidora Nube" },
  { id: 3, nombre: "Moda Sur" },
];

export const mockProductos: Producto[] = [
  {
    id: 1,
    proveedor: 1,
    proveedor_nombre: "Textil Rosario",
    codigo: "BL-100",
    prenda: "Blusa",
    modelo: "Camelia",
    descripcion: "Blusa de gasa manga larga",
    costo: 8000,
    costo_extra: 500,
    activo: true,
    precio_tarjeta: 20500,
    precio_debito: 17425,
    precio_efectivo: 16400,
    precio_transferencia: 16400,
    precio_fast_cred: 16400,
    precio_finan_ya: 17220,
    variantes: [
      { id: 11, producto: 1, color: "Rosa", talle: "S", stock_actual: 6 },
      { id: 12, producto: 1, color: "Rosa", talle: "M", stock_actual: 2 },
      { id: 13, producto: 1, color: "Blanco", talle: "L", stock_actual: 0 },
    ],
  },
  {
    id: 2,
    proveedor: 2,
    proveedor_nombre: "Distribuidora Nube",
    codigo: "JE-220",
    prenda: "Jean",
    modelo: "Recto Alba",
    descripcion: "Jean tiro alto rígido",
    costo: 14000,
    costo_extra: 1000,
    activo: true,
    precio_tarjeta: 36000,
    precio_debito: 30600,
    precio_efectivo: 28800,
    precio_transferencia: 28800,
    precio_fast_cred: 28800,
    precio_finan_ya: 30240,
    variantes: [
      { id: 21, producto: 2, color: "Azul", talle: "38", stock_actual: 9 },
      { id: 22, producto: 2, color: "Azul", talle: "40", stock_actual: 3 },
      { id: 23, producto: 2, color: "Negro", talle: "42", stock_actual: 1 },
    ],
  },
  {
    id: 3,
    proveedor: 3,
    proveedor_nombre: "Moda Sur",
    codigo: "VE-310",
    prenda: "Vestido",
    modelo: "Lino Bruma",
    descripcion: "Vestido midi de lino",
    costo: 17000,
    costo_extra: 0,
    activo: false,
    precio_tarjeta: 42500,
    precio_debito: 36125,
    precio_efectivo: 34000,
    precio_transferencia: 34000,
    precio_fast_cred: 34000,
    precio_finan_ya: 35700,
    variantes: [
      { id: 31, producto: 3, color: "Beige", talle: "M", stock_actual: 4 },
      { id: 32, producto: 3, color: "Negro", talle: "S", stock_actual: 0 },
    ],
  },
];

export const mockFilasStock: FilaStock[] = mockProductos.flatMap((producto) =>
  (producto.variantes ?? []).map((variante) => ({
    variante_id: variante.id,
    producto_id: producto.id,
    codigo: producto.codigo,
    prenda: producto.prenda,
    modelo: producto.modelo,
    proveedor_nombre: producto.proveedor_nombre ?? "—",
    proveedor_id: producto.proveedor,
    color: variante.color,
    talle: variante.talle,
    stock_actual: variante.stock_actual,
    activo: producto.activo,
  })),
);

export const mockVentas: Venta[] = [
  {
    id: 1042,
    fecha: "2026-08-18T15:10:00Z",
    medio_pago: "EFECTIVO",
    total: 45200,
    detalles: [
      {
        id: 1,
        venta: 1042,
        variante_producto: 11,
        cantidad: 1,
        precio_unitario: 16400,
        subtotal: 16400,
        codigo: "BL-100",
        prenda: "Blusa",
        modelo: "Camelia",
        color: "Rosa",
        talle: "S",
      },
      {
        id: 2,
        venta: 1042,
        variante_producto: 21,
        cantidad: 1,
        precio_unitario: 28800,
        subtotal: 28800,
        codigo: "JE-220",
        prenda: "Jean",
        modelo: "Recto Alba",
        color: "Azul",
        talle: "38",
      },
    ],
  },
  {
    id: 1041,
    fecha: "2026-08-17T18:42:00Z",
    medio_pago: "DEBITO",
    total: 30600,
    detalles: [
      {
        id: 3,
        venta: 1041,
        variante_producto: 22,
        cantidad: 1,
        precio_unitario: 30600,
        subtotal: 30600,
        codigo: "JE-220",
        prenda: "Jean",
        modelo: "Recto Alba",
        color: "Azul",
        talle: "40",
      },
    ],
  },
];

export const mockMovimientos: MovimientoStock[] = [
  {
    id: 501,
    variante_producto: 11,
    fecha: "2026-08-18T15:10:00Z",
    tipo_movimiento: "VENTA",
    cantidad: 1,
    observacion: "Venta #1042",
    codigo: "BL-100",
    producto_descripcion: "Blusa Camelia",
    color: "Rosa",
    talle: "S",
  },
  {
    id: 500,
    variante_producto: 21,
    fecha: "2026-08-16T11:00:00Z",
    tipo_movimiento: "ENTRADA",
    cantidad: 12,
    observacion: "Ingreso de mercadería",
    codigo: "JE-220",
    producto_descripcion: "Jean Recto Alba",
    color: "Azul",
    talle: "38",
  },
  {
    id: 499,
    variante_producto: 13,
    fecha: "2026-08-14T09:30:00Z",
    tipo_movimiento: "AJUSTE",
    cantidad: -1,
    observacion: "Prenda con falla",
    codigo: "BL-100",
    producto_descripcion: "Blusa Camelia",
    color: "Blanco",
    talle: "L",
  },
];
