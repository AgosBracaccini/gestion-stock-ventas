import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { cajasService } from "../api/services/cajas.service";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export function CajasPage() {
  const navigate = useNavigate();

  const { data: cajas, isLoading, error } = useQuery({
    queryKey: ["cajas"],
    queryFn: () => cajasService.listar(),
  });

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
        <ErrorMessage error={error} />

        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">N°</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Ítems</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : (cajas ?? []).map((caja) => (
                    <TableRow key={caja.id}>
                      <TableCell className="text-muted-foreground">{caja.numero}</TableCell>
                      <TableCell className="font-medium">
                        {caja.nombre || <span className="text-muted-foreground">Sin nombre</span>}
                      </TableCell>
                      <TableCell>{caja.items.length}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(caja.creado).toLocaleDateString("es-AR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/cajas/${caja.id}`)}
                        >
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              {!isLoading && (cajas ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No hay cajas creadas todavía.
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