import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
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
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

import { formatDate, formatMoney } from "../lib/format";

const labelMedio = (value: string) =>
  MEDIOS_PAGO.find(
    (medio) => medio.value === value,
  )?.label ?? value;

export function VentasPage() {
  const queryClient = useQueryClient();

  const [
    seleccionada,
    setSeleccionada,
  ] = useState<Venta | null>(null);

  const {
    data: ventas,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ventas"],
    queryFn: () => ventasService.list(),
  });

  const verificarTransferencia =
    useMutation({
      mutationFn: (id: number) =>
        ventasService.verificarTransferencia(
          id,
        ),

      onSuccess: (ventaActualizada) => {
        toast.success(
          "Transferencia verificada",
          {
            description:
              "La venta quedó marcada como verificada.",
          },
        );

        // Actualizamos también el detalle abierto.
        setSeleccionada(
          ventaActualizada,
        );

        void queryClient.invalidateQueries({
          queryKey: ["ventas"],
        });
      },
    });

  return (
    <>
      <PageHeader
        title="Historial de ventas"
        description="Ventas registradas y su detalle."
      />

      <div className="surface-panel p-4">
        <ErrorMessage error={error} />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N.º</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>
                  Medio de pago
                </TableHead>
                <TableHead>
                  Estado
                </TableHead>
                <TableHead className="text-right">
                  Total
                </TableHead>
                <TableHead className="text-right">
                  Detalle
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading
                ? Array.from({
                    length: 4,
                  }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell
                        colSpan={6}
                      >
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : (ventas ?? []).map(
                    (venta) => (
                      <TableRow
                        key={venta.id}
                      >
                        <TableCell className="font-medium">
                          #{venta.id}
                        </TableCell>

                        <TableCell>
                          {formatDate(
                            venta.fecha,
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge variant="secondary">
                            {labelMedio(
                              venta.medio_pago,
                            )}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {venta.medio_pago ===
                          "TRANSFERENCIA" ? (
                            venta.transferencia_verificada ? (
                              <Badge>
                                Verificada
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                Pendiente
                              </Badge>
                            )
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          {formatMoney(
                            venta.total,
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSeleccionada(
                                venta,
                              )
                            }
                          >
                            Ver
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )}

              {!isLoading &&
              (ventas ?? []).length ===
                0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Todavía no hay ventas
                    registradas.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
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
              Venta #{seleccionada?.id} ·{" "}
              {formatDate(
                seleccionada?.fecha,
              )}
            </DialogTitle>
          </DialogHeader>

          {/* DETALLE DE PRODUCTOS */}
          {seleccionada?.detalles?.length ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      Producto
                    </TableHead>
                    <TableHead>
                      Color
                    </TableHead>
                    <TableHead>
                      Talle
                    </TableHead>
                    <TableHead className="text-right">
                      Cant.
                    </TableHead>
                    <TableHead className="text-right">
                      P. unitario
                    </TableHead>
                    <TableHead className="text-right">
                      Subtotal
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {seleccionada.detalles.map(
                    (detalle) => (
                      <TableRow
                        key={detalle.id}
                      >
                        <TableCell>
                          {detalle.codigo ??
                            "—"}{" "}
                          {detalle.prenda ??
                            ""}{" "}
                          {detalle.modelo ??
                            ""}
                        </TableCell>

                        <TableCell>
                          {detalle.color ??
                            "—"}
                        </TableCell>

                        <TableCell>
                          {detalle.talle ??
                            "—"}
                        </TableCell>

                        <TableCell className="text-right">
                          {
                            detalle.cantidad
                          }
                        </TableCell>

                        <TableCell className="text-right">
                          {formatMoney(
                            detalle.precio_unitario,
                          )}
                        </TableCell>

                        <TableCell className="text-right font-medium">
                          {formatMoney(
                            detalle.subtotal,
                          )}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="py-6 text-sm text-muted-foreground">
              Esta venta no incluye detalles
              en la respuesta de la API.
            </p>
          )}

          {/* DATOS DE TRANSFERENCIA */}
          {seleccionada?.medio_pago ===
          "TRANSFERENCIA" ? (
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">
                    Datos de transferencia
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Información registrada
                    para verificar el pago
                    posteriormente.
                  </p>
                </div>

                {seleccionada.transferencia_verificada ? (
                  <Badge>
                    Verificada
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    Pendiente de verificar
                  </Badge>
                )}
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Nombre
                  </p>

                  <p className="font-medium">
                    {seleccionada.nombre_transferencia ||
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Apellido
                  </p>

                  <p className="font-medium">
                    {seleccionada.apellido_transferencia ||
                      "—"}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">
                    Teléfono
                  </p>

                  <p className="font-medium">
                    {seleccionada.telefono_transferencia ||
                      "—"}
                  </p>
                </div>
              </div>

              {!seleccionada.transferencia_verificada ? (
                <Button
                  className="mt-4 w-full"
                  disabled={
                    verificarTransferencia.isPending
                  }
                  onClick={() =>
                    verificarTransferencia.mutate(
                      seleccionada.id,
                    )
                  }
                >
                  {verificarTransferencia.isPending
                    ? "Verificando..."
                    : "Marcar transferencia como verificada"}
                </Button>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Esta transferencia ya fue
                  verificada.
                </p>
              )}

              <ErrorMessage
                error={
                  verificarTransferencia.error
                }
              />
            </div>
          ) : null}

          {/* RESUMEN */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm">
            <span className="text-muted-foreground">
              Medio de pago:{" "}
              {labelMedio(
                seleccionada?.medio_pago ??
                  "",
              )}
            </span>

            <span className="font-display text-xl">
              {formatMoney(
                seleccionada?.total,
              )}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}