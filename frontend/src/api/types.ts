export type MedioPago =
  | "EFECTIVO"
  | "TRANSFERENCIA"
  | "DEBITO"
  | "CREDITO"
  | "FAST_CRED"
  | "FINAN_YA";

export const MEDIOS_PAGO: { value: MedioPago; label: string }[] = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "DEBITO", label: "Débito" },
  { value: "CREDITO", label: "Crédito" },
  { value: "FAST_CRED", label: "Fast Cred" },
  { value: "FINAN_YA", label: "Finan Ya" },
];

export type TipoMovimiento = "ENTRADA" | "VENTA" | "AJUSTE";

export interface Proveedor {
  id: number;
  nombre: string;
}

export interface VarianteProducto {
  id: number;
  producto: number;
  color: string;
  talle: string;
  stock_actual: number;
}

/** Precios calculados por el backend. El frontend sólo los muestra. */
export interface PreciosProducto {
  precio_tarjeta?: number;
  precio_debito?: number;
  precio_efectivo?: number;
  precio_transferencia?: number;
  precio_fast_cred?: number;
  precio_finan_ya?: number;
}

export interface Producto extends PreciosProducto {
  id: number;
  proveedor: number;
  proveedor_nombre?: string;
  codigo: string;
  prenda: string;
  modelo: string;
  descripcion: string;
  costo: number;
  costo_extra: number;
  activo: boolean;
  variantes?: VarianteProducto[];
}

/** Fila plana producto + variante, usada en la tabla de Productos / Stock. */
export interface FilaStock {
  variante_id: number;
  producto_id: number;
  codigo: string;
  prenda: string;
  modelo: string;
  proveedor_nombre: string;
  proveedor_id: number;
  color: string;
  talle: string;
  stock_actual: number;
  activo: boolean;
}

export interface MovimientoStock {
  id: number;
  variante_producto: number;
  fecha: string;
  tipo_movimiento: TipoMovimiento;
  cantidad: number;
  observacion: string;
  /** Descripción legible provista por el backend, si existe. */
  producto_descripcion?: string;
  codigo?: string;
  color?: string;
  talle?: string;
}

export interface DetalleVenta {
  id: number;
  venta: number;
  variante_producto: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  codigo?: string;
  prenda?: string;
  modelo?: string;
  color?: string;
  talle?: string;
}

export interface Venta {
  id: number;
  fecha: string;
  medio_pago: MedioPago;
  total: number;
  detalles?: DetalleVenta[];
  nombre_transferencia?: string;
  apellido_transferencia?: string;
  telefono_transferencia?: string;
  transferencia_verificada?: boolean;
}

export interface ResumenDashboard {
  ventas_hoy: number;
  total_hoy: number | string;
  ventas_mes: number;
  total_mes: number | string;
  stock_bajo: number;
  sin_stock: number;
}

export interface NuevaVentaPayload {
  medio_pago: MedioPago;
  items: { variante_id: number; cantidad: number }[];
  nombre_transferencia?: string;
  apellido_transferencia?: string;
  telefono_transferencia?: string;
  transferencia_verificada?: boolean;
}

export interface IngresoMercaderiaPayload {
  codigo: string;
  prenda: string;
  modelo: string;
  descripcion: string;
  color: string;
  talle: string;
  cantidad: number;
  costo: number;
  costo_extra: number;
  proveedor_id: number;
}

/** Paginación estándar de DRF. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ConfiguracionPrecios {
  id: number;
  multiplicador_tarjeta: string;
  descuento_debito: string;
  descuento_efectivo: string;
  recargo_finan_ya: string;
  actualizado: string;
}