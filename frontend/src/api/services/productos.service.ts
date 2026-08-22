
import { ENDPOINTS } from "../config";
import { apiRequest, toList } from "../http";
import type {
  FilaStock,
  IngresoMercaderiaPayload,
  Producto,
  VarianteProducto,
} from "../types";

/** Aplana producto + variantes en filas para la tabla de stock. */
export function flattenProductos(productos: Producto[]): FilaStock[] {
  return productos.flatMap((producto) =>
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
}

export const productosService = {
  async list(search?: string): Promise<Producto[]> {
    const data = await apiRequest<unknown>(ENDPOINTS.productos, {
      query: { search: search ?? undefined },
    });

    return toList<Producto>(data);
  },

  /** Busca un producto por código exacto. */
  async findByCodigo(codigo: string): Promise<Producto | null> {
    const data = await apiRequest<unknown>(ENDPOINTS.productos, {
      query: {
        codigo: codigo.trim(),
        search: codigo.trim(),
      },
    });

    const productos = toList<Producto>(data);

    return (
      productos.find(
        (p) =>
          p.codigo.toLowerCase() === codigo.trim().toLowerCase(),
      ) ??
      productos[0] ??
      null
    );
  },

  async stockRows(): Promise<FilaStock[]> {
    const productos = await productosService.list();
    return flattenProductos(productos);
  },

  async variantes(
    productoId: number,
  ): Promise<VarianteProducto[]> {
    const data = await apiRequest<unknown>(
      ENDPOINTS.variantes,
      {
        query: { producto: productoId },
      },
    );

    return toList<VarianteProducto>(data);
  },

  async ingresarMercaderia(
    payload: IngresoMercaderiaPayload,
  ) {
    return apiRequest<unknown>(
      ENDPOINTS.ingresoMercaderia,
      {
        method: "POST",
        body: payload,
      },
    );
  },
};