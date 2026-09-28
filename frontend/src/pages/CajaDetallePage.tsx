import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Printer, Trash2 } from "lucide-react";

import { cajasService } from "../api/services/cajas.service";
import { productosService } from "../api/services/productos.service";
import type { CajaItemInput, Producto, VarianteProducto } from "../api/types";
import { CodigoQR } from "../components/common/CodigoQR";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

interface ItemCola {
  key: string;
  producto: Producto;
  variante: VarianteProducto;
  cantidad: number;
}

export function CajaDetallePage() {
  const { id } = useParams();

  if (!id) {
    return <CajaNuevaVista />;
  }

  return <CajaVistaDetalle id={Number(id)} />;
}

function CajaNuevaVista() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<unknown>(null);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [varianteId, setVarianteId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [cola, setCola] = useState<ItemCola[]>([]);
  const [errorCantidad, setErrorCantidad] = useState<string | null>(null);

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

      const primera = (encontrado.variantes ?? [])[0];
      if (primera) setVarianteId(String(primera.id));
    } catch (error) {
      setErrorBusqueda(error);
    } finally {
      setBuscando(false);
    }
  }

  const varianteSeleccionada =
    (producto?.variantes ?? []).find((v) => String(v.id) === varianteId) ?? null;

  const keyActual = producto && varianteSeleccionada ? `${producto.id}-${varianteSeleccionada.id}` : null;
  const cantidadEnCola = keyActual ? (cola.find((item) => item.key === keyActual)?.cantidad ?? 0) : 0;
  const stockDisponible = varianteSeleccionada ? varianteSeleccionada.stock_actual - cantidadEnCola : 0;

  function agregarACola() {
    if (!producto || !varianteSeleccionada || !keyActual || cantidad < 1) return;

    if (cantidad > stockDisponible) {
      setErrorCantidad(`Solo quedan ${stockDisponible} unidades disponibles de esta variante.`);
      return;
    }

    setErrorCantidad(null);

    const yaExiste = cola.find((item) => item.key === keyActual);

    if (yaExiste) {
      setCola(
        cola.map((item) => (item.key === keyActual ? { ...item, cantidad: item.cantidad + cantidad } : item)),
      );
    } else {
      setCola([...cola, { key: keyActual, producto, variante: varianteSeleccionada, cantidad }]);
    }

    setCantidad(1);
  }

  function quitarDeCola(key: string) {
    setCola(cola.filter((item) => item.key !== key));
  }

  const guardar = useMutation({
    mutationFn: () => {
      const items: CajaItemInput[] = cola.map((item) => ({
        variante_id: item.variante.id,
        cantidad: item.cantidad,
      }));
      return cajasService.crear({ nombre: nombre.trim(), items });
    },
    onSuccess: (caja) => {
      navigate(`/cajas/${caja.id}`);
    },
  });

  return (
    <>
      <PageHeader
        title="Nueva caja"
        description="Cargá el contenido de la caja. Al guardar se genera el número y el QR."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la caja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Label htmlFor="nombre-caja">Nombre (opcional)</Label>
              <Input
                id="nombre-caja"
                placeholder="Ej: Invierno 2026, Depósito fondo..."
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agregar producto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ErrorMessage error={errorBusqueda} />

              <form onSubmit={buscarProducto} className="flex gap-2">
                <Input
                  placeholder="Código del producto"
                  value={codigo}
                  onChange={(event) => setCodigo(event.target.value)}
                />
                <Button type="submit" disabled={buscando}>
                  {buscando ? "Buscando..." : "Buscar"}
                </Button>
              </form>

              {producto ? (
                <>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium">
                      {producto.codigo} · {producto.prenda} {producto.modelo}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Variante (color / talle)</Label>
                    <Select value={varianteId} onValueChange={setVarianteId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(producto.variantes ?? []).map((v) => (
                          <SelectItem key={v.id} value={String(v.id)}>
                            {v.color} · {v.talle} (stock: {v.stock_actual})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="cantidad-caja">
                        Cantidad {varianteSeleccionada ? `(disponible: ${stockDisponible})` : ""}
                      </Label>
                      <Input
                        id="cantidad-caja"
                        type="number"
                        min="1"
                        value={cantidad === 0 ? "" : cantidad}
                        onChange={(event) => {
                          const valor = event.target.value;
                          setCantidad(valor === "" ? 0 : Math.max(0, Number(valor)));
                        }}
                      />
                    </div>
                    <Button onClick={agregarACola} disabled={!varianteSeleccionada || cantidad < 1}>
                      <Plus className="size-4" />
                      Agregar
                    </Button>
                  </div>

                  {errorCantidad ? <ErrorMessage error={new Error(errorCantidad)} /> : null}
                </>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contenido de la caja ({cola.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cola.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no agregaste ningún producto.</p>
            ) : (
              <div className="space-y-2">
                {cola.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <div className="text-sm">
                      <p className="font-medium">
                        {item.producto.codigo} · {item.variante.color} · {item.variante.talle}
                      </p>
                      <p className="text-xs text-muted-foreground">Cantidad: {item.cantidad}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => quitarDeCola(item.key)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <ErrorMessage error={guardar.error} />

            <Button
              className="w-full"
              size="lg"
              disabled={cola.length === 0 || guardar.isPending}
              onClick={() => guardar.mutate()}
            >
              {guardar.isPending ? "Guardando..." : "Guardar caja"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function CajaVistaDetalle({ id }: { id: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: caja, isLoading, error } = useQuery({
    queryKey: ["caja", id],
    queryFn: () => cajasService.obtener(id),
  });

  const eliminar = useMutation({
    mutationFn: () => cajasService.eliminar(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cajas"] });
      navigate("/cajas");
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando...</p>;
  }

  if (error || !caja) {
    return <ErrorMessage error={error ?? new Error("No se encontró la caja.")} />;
  }

  const urlPublica = `${window.location.origin}/cajas/publica/${caja.codigo_publico}`;

  return (
    <>
      <PageHeader
        title={caja.nombre ? `Caja #${caja.numero} · ${caja.nombre}` : `Caja #${caja.numero}`}
        description="Contenido de la caja. Escaneá el QR para verlo sin abrirla."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" />
              Imprimir
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (window.confirm("¿Eliminar esta caja? Esta acción no se puede deshacer.")) {
                  eliminar.mutate();
                }
              }}
              disabled={eliminar.isPending}
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </div>
        }
      />

      <ErrorMessage error={eliminar.error} />

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>QR de la caja</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <CodigoQR valor={urlPublica} tamano={200} />
            <p className="text-center text-xs break-all text-muted-foreground">{urlPublica}</p>
          </CardContent>
        </Card>

        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Contenido ({caja.items.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {caja.items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Esta caja no tiene productos cargados.</p>
            ) : (
              caja.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <div className="text-sm">
                    <p className="font-medium">
                      {item.variante.producto_codigo} · {item.variante.prenda} {item.variante.modelo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.variante.color} · {item.variante.talle}
                    </p>
                  </div>
                  <span className="text-sm font-medium">x{item.cantidad}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hoja para pegar en la caja física */}
      <div className="hoja-impresion hidden print:flex print:flex-col print:items-center print:justify-center print:gap-4 print:p-8">
        <CodigoQR valor={urlPublica} tamano={280} />
        <p className="text-lg font-semibold">
          {caja.nombre ? `Caja #${caja.numero} — ${caja.nombre}` : `Caja #${caja.numero}`}
        </p>
      </div>
    </>
  );
}