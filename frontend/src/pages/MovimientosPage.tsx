import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { movimientosService } from "../api/services/movimientos.service";
import type { TipoMovimiento } from "../api/types";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
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
import { formatDate } from "../lib/format";

const TODOS = "__todos__";

const estilos: Record<TipoMovimiento, string> = {
  ENTRADA: "border-success/30 bg-success/12 text-success-foreground",
  VENTA: "border-primary/40 bg-primary/18 text-foreground",
  AJUSTE: "border-warning/35 bg-warning/15 text-warning-foreground",
};

export function MovimientosPage() {
  const [tipo, setTipo] = useState(TODOS);
  const [search, setSearch] = useState("");

  const { data: movimientos, isLoading, error } = useQuery({
    queryKey: ["movimientos"],
    queryFn: () => movimientosService.list(),
  });

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (movimientos ?? []).filter((movimiento) => {
      const okTipo = tipo === TODOS || movimiento.tipo_movimiento === tipo;
      const texto = [
        movimiento.codigo,
        movimiento.producto_descripcion,
        movimiento.color,
        movimiento.talle,
        movimiento.observacion,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return okTipo && (!term || texto.includes(term));
    });
  }, [movimientos, tipo, search]);

  return (
    <>
      <PageHeader
        title="Movimientos de stock"
        description="Entradas, ventas y ajustes registrados por el backend."
      />

      <div className="surface-panel p-4">
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Producto, código, color, talle u observación"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Tipo</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                <SelectItem value="ENTRADA">Entrada</SelectItem>
                <SelectItem value="VENTA">Venta</SelectItem>
                <SelectItem value="AJUSTE">Ajuste</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <ErrorMessage error={error} />
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Producto / variante</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead>Observación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : filtrados.map((movimiento) => (
                    <TableRow key={movimiento.id}>
                      <TableCell>{formatDate(movimiento.fecha)}</TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {movimiento.producto_descripcion ??
                            `Variante #${movimiento.variante_producto}`}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {[movimiento.codigo, movimiento.color, movimiento.talle]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            estilos[movimiento.tipo_movimiento]
                          }`}
                        >
                          {movimiento.tipo_movimiento}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {movimiento.cantidad > 0 ? `+${movimiento.cantidad}` : movimiento.cantidad}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {movimiento.observacion || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
              {!isLoading && filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No hay movimientos para mostrar.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
