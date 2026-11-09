import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { proveedoresService } from "../api/services/proveedores.service";
import type { Proveedor } from "../api/types";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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

export function ProveedoresPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Proveedor | null>(null);
  const [nombre, setNombre] = useState("");

  const { data: proveedores, isLoading, error } = useQuery({
    queryKey: ["proveedores"],
    queryFn: () => proveedoresService.list(),
  });

  const guardar = useMutation({
    mutationFn: () =>
      editando
        ? proveedoresService.update(editando.id, nombre.trim())
        : proveedoresService.create(nombre.trim()),
    onSuccess: () => {
      toast.success(editando ? "Proveedor actualizado" : "Proveedor creado");
      setDialogOpen(false);
      setEditando(null);
      setNombre("");
      void queryClient.invalidateQueries({ queryKey: ["proveedores"] });
      // Los productos muestran el nombre del proveedor: se refrescan también.
      void queryClient.invalidateQueries({ queryKey: ["stock-rows"] });
    },
  });

  const filtrados = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...(proveedores ?? [])]
      .filter((p) => p.nombre.toLowerCase().includes(term))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" }));
  }, [proveedores, search]);

  function abrirNuevo() {
    guardar.reset();
    setEditando(null);
    setNombre("");
    setDialogOpen(true);
  }

  function abrirEdicion(proveedor: Proveedor) {
    guardar.reset();
    setEditando(proveedor);
    setNombre(proveedor.nombre);
    setDialogOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Proveedores"
        description="Quiénes te proveen la mercadería."
        actions={
          <Button onClick={abrirNuevo}>
            <Plus className="size-4" /> Nuevo proveedor
          </Button>
        }
      />

      <div className="surface-panel p-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar proveedor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-4">
          <ErrorMessage error={error} />
        </div>

        {!isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">
            <strong className="text-foreground">{formatCount(filtrados.length)}</strong>{" "}
            proveedores
          </p>
        ) : null}

        <div className="mt-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Productos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={3}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : filtrados.map((proveedor) => (
                    <TableRow key={proveedor.id}>
                      <TableCell className="font-medium">{proveedor.nombre}</TableCell>
                      <TableCell className="text-right">
                        {proveedor.cantidad_productos ? (
                          <span className="font-medium">
                            {formatCount(proveedor.cantidad_productos)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sin productos</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => abrirEdicion(proveedor)}>
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              {!isLoading && filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                    No hay proveedores para mostrar.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (nombre.trim() && !guardar.isPending) guardar.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoFocus
              />
            </div>
            <ErrorMessage error={guardar.error} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!nombre.trim() || guardar.isPending}>
                {guardar.isPending ? <Loader2 className="size-4 animate-spin" /> : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}