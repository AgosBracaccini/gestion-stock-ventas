import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { movimientosService } from "../api/services/movimientos.service";
import type { TipoMovimiento } from "../api/types";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
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
import { formatCount, formatDate } from "../lib/format";

const TODOS = "__todos__";
const POR_PAGINA = 25;

const estilos: Record<TipoMovimiento, string> = {
  ENTRADA: "border-success/50 bg-success/30 text-success-foreground",
  VENTA: "border-primary/50 bg-primary/25 text-foreground",
  AJUSTE: "border-warning/70 bg-warning/45 text-warning-foreground",
};

const etiquetas: Record<TipoMovimiento, string> = {
  ENTRADA: "Entrada",
  VENTA: "Venta",
  AJUSTE: "Ajuste",
};

// La cantidad se guarda siempre positiva: el signo depende del tipo.
function CantidadMovimiento({
  tipo,
  cantidad,
}: {
  tipo: TipoMovimiento;
  cantidad: number;
}) {
  if (tipo === "ENTRADA") {
    return <span className="font-semibold text-success-foreground">+{cantidad}</span>;
  }
  if (tipo === "VENTA") {
    return <span className="font-semibold text-destructive">−{cantidad}</span>;
  }
  return <span className="font-semibold">{cantidad}</span>;
}

export function MovimientosPage() {
  const [tipo, setTipo] = useState(TODOS);
  const [search, setSearch] = useState("");
  const [pagina, setPagina] = useState(1);

  const { data: movimientos, isLoading, error } = useQuery({
    queryKey: ["movimientos"],
    queryFn: () => movimientosService.list(),
  });

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...(movimientos ?? [])]
      .filter((movimiento) => {
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
      })
      .sort((a, b) => {
        const diferencia = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        return diferencia !== 0 ? diferencia : b.id - a.id;
      });
  }, [movimientos, tipo, search]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtrados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  return (
    <>
      <PageHeader
        title="Movimientos de stock"
        description="Entradas de mercadería, ventas y ajustes de stock."
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagina(1);
                }}
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Tipo</Label>
            <Select
              value={tipo}
              onValueChange={(value) => {
                setTipo(value);
                setPagina(1);
              }}
            >
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

        {!isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">
            <strong className="text-foreground">{formatCount(filtrados.length)}</strong>{" "}
            movimientos
          </p>
        ) : null}

        <div className="mt-3 overflow-x-auto">
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
                : visibles.map((movimiento) => (
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
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            estilos[movimiento.tipo_movimiento]
                          }`}
                        >
                          {etiquetas[movimiento.tipo_movimiento]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <CantidadMovimiento
                          tipo={movimiento.tipo_movimiento}
                          cantidad={movimiento.cantidad}
                        />
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

        {filtrados.length > POR_PAGINA ? (
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

        <p className="mt-4 text-xs text-muted-foreground">
          El stock cargado o corregido desde Excel y las ventas importadas no generan movimientos.
        </p>
      </div>
    </>
  );
}