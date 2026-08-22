import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { productosService } from "../api/services/productos.service";
import { ventasService } from "../api/services/ventas.service";
import { MEDIOS_PAGO } from "../api/types";
import type { MedioPago, Producto, VarianteProducto } from "../api/types";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { StockBadge } from "../components/common/StockBadge";
import { PageHeader } from "../components/layout/PageHeader";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { formatMoney } from "../lib/format";
import { precioPorMedioPago } from "../lib/precios";

interface ItemVenta {
  variante: VarianteProducto;
  producto: Producto;
  cantidad: number;
}

export function NuevaVentaPage() {
  const queryClient = useQueryClient();
  const [codigo, setCodigo] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<unknown>(null);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [varianteId, setVarianteId] = useState<string>("");
  const [cantidad, setCantidad] = useState(1);
  const [items, setItems] = useState<ItemVenta[]>([]);
  const [medioPago, setMedioPago] = useState<MedioPago>("EFECTIVO");

  const variantes = producto?.variantes ?? [];
  const varianteSeleccionada = variantes.find((v) => String(v.id) === varianteId) ?? null;
  const yaAgregada = (id: number) => items.some((item) => item.variante.id === id);

  const totalVenta = items.reduce(
    (acc, item) => acc + (precioPorMedioPago(item.producto, medioPago) ?? 0) * item.cantidad,
    0,
  );

  async function buscarProducto(event: React.FormEvent) {
    event.preventDefault();
    if (!codigo.trim()) return;
    setBuscando(true);
    setErrorBusqueda(null);
    setProducto(null);
    setVarianteId("");
    try {
      const encontrado = await productosService.findByCodigo(codigo);
      if (!encontrado) {
        setErrorBusqueda(new Error(`No se encontró un producto con el código "${codigo.trim()}".`));
        return;
      }
      setProducto(encontrado);
      const primeraDisponible = (encontrado.variantes ?? []).find(
        (v) => v.stock_actual > 0 && !yaAgregada(v.id),
      );
      if (primeraDisponible) setVarianteId(String(primeraDisponible.id));
    } catch (error) {
      setErrorBusqueda(error);
    } finally {
      setBuscando(false);
    }
  }

  function agregarItem() {
    if (!producto || !varianteSeleccionada) return;
    setItems((prev) => [...prev, { producto, variante: varianteSeleccionada, cantidad }]);
    setCantidad(1);
    setVarianteId("");
    setCodigo("");
    setProducto(null);
  }

  const confirmar = useMutation({
    mutationFn: () =>
      ventasService.create({
        medio_pago: medioPago,
        items: items.map((item) => ({ variante_id: item.variante.id, cantidad: item.cantidad })),
      }),
    onSuccess: (venta) => {
      toast.success(`Venta confirmada${venta?.id ? ` (#${venta.id})` : ""}`, {
        description: "El backend descontó el stock y registró el movimiento.",
      });
      setItems([]);
      setProducto(null);
      setCodigo("");
      setVarianteId("");
      setCantidad(1);
      void queryClient.invalidateQueries({ queryKey: ["stock-rows"] });
      void queryClient.invalidateQueries({ queryKey: ["ventas"] });
      void queryClient.invalidateQueries({ queryKey: ["movimientos"] });
    },
  });

  const stockInsuficiente =
    !!varianteSeleccionada && cantidad > varianteSeleccionada.stock_actual;
  const productoInactivo = !!producto && !producto.activo;

  return (
    <>
      <PageHeader
        title="Nueva venta"
        description="Código → variante → cantidad → agregar → medio de pago → confirmar."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">1. Buscar producto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={buscarProducto} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoFocus
                  placeholder="Código del producto (ej. BL-100)"
                  className="pl-9"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary" disabled={buscando}>
                {buscando ? <Loader2 className="size-4 animate-spin" /> : "Buscar"}
              </Button>
            </form>

            <ErrorMessage error={errorBusqueda} />

            {producto ? (
              <div className="space-y-4 rounded-xl border border-border bg-muted/40 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">
                      {producto.prenda} · {producto.modelo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {producto.codigo} — {producto.descripcion}
                    </p>
                  </div>
                  <Badge variant={producto.activo ? "secondary" : "outline"}>
                    {producto.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                {productoInactivo ? (
                  <p className="text-sm text-destructive">
                    Este producto está inactivo y no puede venderse.
                  </p>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>2. Variante (color / talle)</Label>
                      <div className="flex flex-wrap gap-2">
                        {variantes.map((variante) => {
                          const deshabilitada = variante.stock_actual <= 0 || yaAgregada(variante.id);
                          const activa = String(variante.id) === varianteId;
                          return (
                            <button
                              key={variante.id}
                              type="button"
                              disabled={deshabilitada}
                              onClick={() => setVarianteId(String(variante.id))}
                              className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                                activa
                                  ? "border-primary bg-primary/25 text-foreground"
                                  : "border-border bg-card hover:bg-accent"
                              } disabled:cursor-not-allowed disabled:opacity-45`}
                            >
                              <span className="block font-medium">
                                {variante.color} · {variante.talle}
                              </span>
                              <span className="mt-1 block">
                                <StockBadge stock={variante.stock_actual} showLabel={false} />
                                {yaAgregada(variante.id) ? (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ya en la venta
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-end gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="cantidad">3. Cantidad</Label>
                        <Input
                          id="cantidad"
                          type="number"
                          min={1}
                          className="w-24"
                          value={cantidad}
                          onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={agregarItem}
                        disabled={!varianteSeleccionada || stockInsuficiente}
                      >
                        <Plus className="size-4" /> Agregar a la venta
                      </Button>
                    </div>

                    {stockInsuficiente ? (
                      <p className="text-sm text-destructive">
                        La cantidad supera el stock disponible ({varianteSeleccionada?.stock_actual}).
                      </p>
                    ) : null}

                    <div className="grid gap-1 border-t border-border pt-3 text-xs text-muted-foreground sm:grid-cols-2">
                      {MEDIOS_PAGO.map((medio) => (
                        <span key={medio.value}>
                          {medio.label}:{" "}
                          <span className="font-medium text-foreground">
                            {formatMoney(precioPorMedioPago(producto, medio.value))}
                          </span>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Venta actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                Todavía no agregaste artículos.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => {
                  const precio = precioPorMedioPago(item.producto, medioPago);
                  return (
                    <li key={item.variante.id} className="flex items-start justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.producto.prenda} {item.producto.modelo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.producto.codigo} · {item.variante.color} · {item.variante.talle} ·{" "}
                          {item.cantidad} u. × {formatMoney(precio)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatMoney((precio ?? 0) * item.cantidad)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setItems((prev) => prev.filter((i) => i.variante.id !== item.variante.id))
                          }
                        >
                          <Trash2 className="size-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="space-y-2">
              <Label>Medio de pago</Label>
              <Select value={medioPago} onValueChange={(value) => setMedioPago(value as MedioPago)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEDIOS_PAGO.map((medio) => (
                    <SelectItem key={medio.value} value={medio.value}>
                      {medio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-accent px-4 py-3">
              <span className="text-sm text-accent-foreground">Total</span>
              <span className="font-display text-2xl text-foreground">{formatMoney(totalVenta)}</span>
            </div>

            <ErrorMessage error={confirmar.error} />

            <Button
              className="w-full"
              size="lg"
              disabled={items.length === 0 || confirmar.isPending}
              onClick={() => confirmar.mutate()}
            >
              {confirmar.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Confirmando…
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" /> Confirmar venta
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              El descuento de stock y el movimiento de venta los realiza el backend.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
