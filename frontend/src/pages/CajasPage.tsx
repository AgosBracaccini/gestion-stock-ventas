import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { cajasService } from "../api/services/cajas.service";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { formatCount } from "../lib/format";

export function CajasPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: cajas, isLoading, error } = useQuery({
    queryKey: ["cajas"],
    queryFn: () => cajasService.listar(),
  });

  const filtradas = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cajas ?? [];

    return (cajas ?? []).filter((caja) => {
      const contenido = caja.items.flatMap((item) => [
        item.variante.producto_codigo,
        item.variante.prenda,
        item.variante.modelo,
        item.variante.color,
        item.variante.talle,
      ]);
      const texto = [String(caja.numero), caja.nombre, ...contenido]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return texto.includes(term);
    });
  }, [cajas, search]);

  return (
    <>
      <PageHeader
        title="Cajas"
        description="Cajas del depósito con su contenido. Cada una tiene un QR para ver qué hay adentro sin abrirla."
        actions={
          <Button onClick={() => navigate("/cajas/nueva")}>
            <Plus className="size-4" /> Nueva caja
          </Button>
        }
      />

      <div className="surface-panel p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por número, nombre o contenido"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <ErrorMessage error={error} />
        </div>

        {!isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">
            <strong className="text-foreground">{formatCount(filtradas.length)}</strong>{" "}
            {filtradas.length === 1 ? "caja" : "cajas"}
          </p>
        ) : null}

        <div className="mt-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">N°</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Productos</TableHead>
                <TableHead className="text-right">Unidades</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : filtradas.map((caja) => (
                    <TableRow key={caja.id}>
                      <TableCell className="text-muted-foreground">{caja.numero}</TableCell>
                      <TableCell className="font-medium">
                        {caja.nombre || <span className="text-muted-foreground">Sin nombre</span>}
                      </TableCell>
                      <TableCell className="text-right">{caja.items.length}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCount(caja.items.reduce((total, item) => total + item.cantidad, 0))}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(caja.creado).toLocaleDateString("es-AR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/cajas/${caja.id}`)}
                        >
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              {!isLoading && filtradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    {(cajas ?? []).length === 0
                      ? "No hay cajas creadas todavía."
                      : "Ninguna caja coincide con la búsqueda."}
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