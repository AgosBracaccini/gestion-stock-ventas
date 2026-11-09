import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ventasService } from "../api/services/ventas.service";
import { MEDIOS_PAGO } from "../api/types";
import type { Venta } from "../api/types";

import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { formatCount, formatDate, formatMoney } from "../lib/format";

const TODOS = "todos";
const POR_PAGINA = 25;

const labelMedio = (value: string) =>
  MEDIOS_PAGO.find((medio) => medio.value === value)?.label ?? value;

// Día en hora local (yyyy-mm-dd), para comparar con los filtros de fecha.
const fechaLocal = (iso: string) => {
  const d = new Date(iso);
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
};

function EstadoTransferencia({ verificada }: { verificada: boolean }) {
  return (
    <span
      className={
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold " +
        (verificada
          ? "border-success/50 bg-success/30 text-success-foreground"
          : "border-warning/70 bg-warning/45 text-warning-foreground")
      }
    >
      {verificada ? "Verificada" : "Pendiente"}
    </span>
  );
}

export function VentasPage() {
  const queryClient = useQueryClient();

  const [seleccionada, setSeleccionada] = useState<Venta | null>(null);

  const [medio, setMedio] = useState(TODOS);
  const [estadoTransf, setEstadoTransf] = useState(TODOS);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [pagina, setPagina] = useState(1);

  const {
    data: ventas,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ventas"],
    queryFn: () => ventasService.list(),
  });

  const verificarTransferencia = useMutation({
    mutationFn: (id: number) => ventasService.verificarTransferencia(id),

    onSuccess: (ventaActualizada) => {
      toast.success("Transferencia verificada", {
        description: "La venta quedó marcada como verificada.",
      });

      // Actualizamos también el detalle abierto.
      setSeleccionada(ventaActualizada);

      void queryClient.invalidateQueries({ queryKey: ["ventas"] });
    },
  });

  const filtradas = useMemo(() => {
    return [...(ventas ?? [])]
      .filter((venta) => {
        const dia = fechaLocal(venta.fecha);
        const esTransf = venta.medio_pago === "TRANSFERENCIA";

        if (medio !== TODOS && venta.medio_pago !== medio) return false;
        if (
          estadoTransf === "pendientes" &&
          !(esTransf && !venta.transferencia_verificada)
        )
          return false;
        if (
          estadoTransf === "verificadas" &&
          !(esTransf && venta.transferencia_verificada)
        )
          return false;
        if (desde && dia < desde) return false;
        if (hasta && dia > hasta) return false;
        return true;
      })
      .sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
      );
  }, [ventas, medio, estadoTransf, desde, hasta]);

  const totalFiltrado = filtradas.reduce(
    (acc, venta) => acc + Number(venta.total),
    0,
  );
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  const hayFiltros =
    medio !== TODOS || estadoTransf !== TODOS || desde !== "" || hasta !== "";

  const limpiarFiltros = () => {
    setMedio(TODOS);
    setEstadoTransf(TODOS);
    setDesde("");
    setHasta("");
    setPagina(1);
  };

  return (
    <>
      <PageHeader
        title="Historial de ventas"
        description="Ventas registradas y su detalle."
      />

      <div className="surface-panel p-4">
        <ErrorMessage error={error} />

        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Medio de pago
            </Label>
            <Select
              value={medio}
              onValueChange={(value) => {
                setMedio(value);
                setPagina(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                {MEDIOS_PAGO.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Transferencias
            </Label>
            <Select
              value={estadoTransf}
              onValueChange={(value) => {
                setEstadoTransf(value);
                setPagina(1);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todas las ventas</SelectItem>
                <SelectItem value="pendientes">Pendientes de verificar</SelectItem>
                <SelectItem value="verificadas">Verificadas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Desde
            </Label>
            <Input
              type="date"
              value={desde}
              onChange={(e) => {
                setDesde(e.target.value);
                setPagina(1);
              }}
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Hasta
            </Label>
            <Input
              type="date"
              value={hasta}
              onChange={(e) => {
                setHasta(e.target.value);
                setPagina(1);
              }}
            />
          </div>
        </div>

        {!isLoading ? (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="text-muted-foreground">
              {filtradas.length === 0 && (ventas ?? []).length > 0 ? (
                "Ninguna venta coincide con los filtros."
              ) : (
                <>
                  <strong className="text-foreground">
                    {formatCount(filtradas.length)}
                  </strong>{" "}
                  ventas · Total{" "}
                  <strong className="text-foreground">
                    {formatMoney(totalFiltrado)}
                  </strong>
                </>
              )}
            </p>
            {hayFiltros ? (
              <Button variant="ghost" size="sm" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            ) : null}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N.º</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Medio de pago</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Detalle</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : visibles.map((venta) => {
                    const esTransf = venta.medio_pago === "TRANSFERENCIA";
                    const pendiente =
                      esTransf && !venta.transferencia_verificada;

                    return (
                      <TableRow
                        key={venta.id}
                        className={
                          pendiente
                            ? "bg-warning/10 hover:bg-warning/15"
                            : undefined
                        }
                      >
                        <TableCell className="font-medium">
                          #{venta.id}
                        </TableCell>

                        <TableCell>{formatDate(venta.fecha)}</TableCell>

                        <TableCell>
                          <Badge variant="secondary">
                            {labelMedio(venta.medio_pago)}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {esTransf ? (
                            <EstadoTransferencia
                              verificada={!!venta.transferencia_verificada}
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          {formatMoney(venta.total)}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSeleccionada(venta)}
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}

              {!isLoading && (ventas ?? []).length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Todavía no hay ventas registradas.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        {filtradas.length > POR_PAGINA ? (
          <div className="mt-4 flex items-center justify-between gap-2 text-sm">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaActual <= 1}
              onClick={() => setPagina(paginaActual - 1)}
            >
              Anterior
            </Button>
            <span className="text-muted-foreground">
              Página {paginaActual} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={paginaActual >= totalPaginas}
              onClick={() => setPagina(paginaActual + 1)}
            >
              Siguiente
            </Button>
          </div>
        ) : null}
      </div>

      <Dialog
        open={!!seleccionada}
        onOpenChange={(open) => {
          if (!open) {
            setSeleccionada(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Venta #{seleccionada?.id} · {formatDate(seleccionada?.fecha)}
            </DialogTitle>
          </DialogHeader>

          {/* DETALLE DE PRODUCTOS */}
          {seleccionada?.detalles?.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Talle</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">P. unitario</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {seleccionada.detalles.map((detalle) => (
                    <TableRow key={detalle.id}>
                      <TableCell>
                        {detalle.codigo ?? "—"} {detalle.prenda ?? ""}{" "}
                        {detalle.modelo ?? ""}
                      </TableCell>

                      <TableCell>{detalle.color ?? "—"}</TableCell>

                      <TableCell>{detalle.talle ?? "—"}</TableCell>

                      <TableCell className="text-right">
                        {detalle.cantidad}
                      </TableCell>

                      <TableCell className="text-right">
                        {formatMoney(detalle.precio_unitario)}
                      </TableCell>

                      <TableCell className="text-right font-medium">
                        {formatMoney(detalle.subtotal)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-6 text-sm text-muted-foreground">
              Esta venta no tiene productos cargados.
            </p>
          )}

          {/* DATOS DE TRANSFERENCIA */}
          {seleccionada?.medio_pago === "TRANSFERENCIA" ? (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">
                    Datos de transferencia
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Información registrada para verificar el pago
                    posteriormente.
                  </p>
                </div>

                <EstadoTransferencia
                  verificada={!!seleccionada.transferencia_verificada}
                />
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Nombre</p>
                  <p className="font-medium">
                    {seleccionada.nombre_transferencia || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Apellido</p>
                  <p className="font-medium">
                    {seleccionada.apellido_transferencia || "—"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="font-medium">
                    {seleccionada.telefono_transferencia || "—"}
                  </p>
                </div>
              </div>

              {!seleccionada.transferencia_verificada ? (
                <Button
                  className="mt-4 w-full"
                  disabled={verificarTransferencia.isPending}
                  onClick={() => verificarTransferencia.mutate(seleccionada.id)}
                >
                  {verificarTransferencia.isPending
                    ? "Verificando..."
                    : "Marcar transferencia como verificada"}
                </Button>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Esta transferencia ya fue verificada.
                </p>
              )}

              <ErrorMessage error={verificarTransferencia.error} />
            </div>
          ) : null}

          {/* RESUMEN */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">
              Medio de pago: {labelMedio(seleccionada?.medio_pago ?? "")}
            </span>

            <span className="font-display text-xl">
              {formatMoney(seleccionada?.total)}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}