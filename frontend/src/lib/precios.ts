import type { MedioPago, Producto } from "../api/types";

/**
 * Selecciona el precio que el BACKEND ya calculó para cada medio de pago.
 * No recalcula nada: si la API no lo envía, devuelve null y la UI muestra "—".
 */
export function precioPorMedioPago(producto: Producto, medio: MedioPago): number | null {
  const mapa: Record<MedioPago, number | undefined> = {
    CREDITO: producto.precio_tarjeta,
    DEBITO: producto.precio_debito,
    EFECTIVO: producto.precio_efectivo,
    TRANSFERENCIA: producto.precio_transferencia ?? producto.precio_efectivo,
    FAST_CRED: producto.precio_fast_cred ?? producto.precio_efectivo,
    FINAN_YA: producto.precio_finan_ya,
  };
  const valor = mapa[medio];
  return valor === undefined || valor === null ? null : Number(valor);
}
