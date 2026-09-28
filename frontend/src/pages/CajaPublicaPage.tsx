import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { PackageOpen } from "lucide-react";

import { cajasService } from "../api/services/cajas.service";
import { useTienda } from "../tienda/TiendaProvider";

export function CajaPublicaPage() {
  const { codigo } = useParams();
  const { nombre: nombreTienda } = useTienda();

  const {
    data: caja,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["caja-publica", codigo],
    queryFn: () => cajasService.obtenerPublica(codigo ?? ""),
    enabled: !!codigo,
  });

    return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(160deg, color-mix(in oklch, var(--primary) 45%, var(--background)) 0%, color-mix(in oklch, var(--primary) 20%, var(--background)) 100%)",
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4" style={{ backgroundColor: "var(--primary)" }}>
          <PackageOpen className="size-5 text-white" />
          <span className="text-sm font-medium text-white">{nombreTienda}</span>
        </div>

        <div className="p-6">
          {isLoading ? <p className="text-sm text-muted-foreground">Cargando...</p> : null}

          {error || (!isLoading && !caja) ? (
            <p className="text-sm text-destructive">
              No se encontró esta caja. Puede que el código sea inválido.
            </p>
          ) : null}

          {caja ? (
            <>
              <h1 className="text-xl font-semibold text-foreground">
                {caja.nombre ? `Caja #${caja.numero} — ${caja.nombre}` : `Caja #${caja.numero}`}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {caja.items.length} producto{caja.items.length === 1 ? "" : "s"} en esta caja
              </p>

              <div className="mt-4 space-y-2">
                {caja.items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Esta caja no tiene productos cargados.</p>
                ) : (
                  caja.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                    >
                      <div className="text-sm">
                        <p className="font-medium text-foreground">
                          {item.variante.producto_codigo} · {item.variante.prenda} {item.variante.modelo}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.variante.color} · {item.variante.talle}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-foreground">x{item.cantidad}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
