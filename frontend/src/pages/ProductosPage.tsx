import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { productosService } from "../api/services/productos.service";
import { proveedoresService } from "../api/services/proveedores.service";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { StockBadge } from "../components/common/StockBadge";
import { PageHeader } from "../components/layout/PageHeader";
import { Badge } from "../components/ui/badge";
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

const TODOS = "__todos__";

export function ProductosPage() {
  const [search, setSearch] = useState("");
  const [proveedor, setProveedor] = useState(TODOS);
  const [estado, setEstado] = useState(TODOS);
  const [color, setColor] = useState(TODOS);
  const [talle, setTalle] = useState(TODOS);

  const { data: filas, isLoading, error } = useQuery({
    queryKey: ["stock-rows"],
    queryFn: () => productosService.stockRows(),
  });
  const { data: proveedores } = useQuery({
    queryKey: ["proveedores"],
    queryFn: () => proveedoresService.list(),
  });

  const colores = useMemo(
    () => Array.from(new Set((filas ?? []).map((f) => f.color))).sort(),
    [filas],
  );
  const talles = useMemo(
    () => Array.from(new Set((filas ?? []).map((f) => f.talle))).sort(),
    [filas],
  );

  const filtradas = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (filas ?? []).filter((fila) => {
      const coincide =
        !term ||
        [fila.codigo, fila.prenda, fila.modelo, fila.color, fila.talle].some((campo) =>
          campo.toLowerCase().includes(term),
        );
      const okProveedor = proveedor === TODOS || String(fila.proveedor_id) === proveedor;
      const okEstado =
        estado === TODOS || (estado === "activo" ? fila.activo : !fila.activo);
      const okColor = color === TODOS || fila.color === color;
      const okTalle = talle === TODOS || fila.talle === talle;
      return coincide && okProveedor && okEstado && okColor && okTalle;
    });
  }, [filas, search, proveedor, estado, color, talle]);

  return (
    <>
      <PageHeader
        title="Productos / Stock"
        description="Buscá por código, prenda, modelo, color o talle y controlá el stock de cada variante."
      />

      <div className="surface-panel p-4">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="md:col-span-2">
            <Label className="mb-1.5 block text-xs text-muted-foreground">Buscar</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Código, prenda, modelo, color, talle"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Proveedor</Label>
            <Select value={proveedor} onValueChange={setProveedor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                {(proveedores ?? []).map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">Estado</Label>
            <Select value={estado} onValueChange={setEstado}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos</SelectItem>
                  {colores.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Talle</Label>
              <Select value={talle} onValueChange={setTalle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TODOS}>Todos</SelectItem>
                  {talles.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <ErrorMessage error={error} />
        </div>

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Prenda</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Talle</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : filtradas.map((fila) => (
                    <TableRow key={fila.variante_id}>
                      <TableCell className="font-medium">{fila.codigo}</TableCell>
                      <TableCell>{fila.prenda}</TableCell>
                      <TableCell>{fila.modelo}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {fila.proveedor_nombre}
                      </TableCell>
                      <TableCell>{fila.color}</TableCell>
                      <TableCell>{fila.talle}</TableCell>
                      <TableCell>
                        <StockBadge stock={fila.stock_actual} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={fila.activo ? "secondary" : "outline"}>
                          {fila.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              {!isLoading && filtradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No hay resultados para los filtros aplicados.
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
