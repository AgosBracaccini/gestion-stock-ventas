import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { configuracionTiendaService } from "../api/services/configuracion.service";
import type { ColorTienda, IntensidadColor } from "../api/types";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { INTENSIDADES, PALETA_TIENDA, aplicarColorTienda } from "../lib/paleta-tienda";
import { cn } from "../lib/utils";

export function ConfiguracionTiendaPage() {
  const queryClient = useQueryClient();

  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState<ColorTienda>("rosa");
  const [intensidad, setIntensidad] = useState<IntensidadColor>("medio");

  const {
    data: configuracion,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["configuracion-tienda"],
    queryFn: () => configuracionTiendaService.obtener(),
  });

  useEffect(() => {
    if (!configuracion) return;
    setNombre(configuracion.nombre);
    setColor(configuracion.color);
    setIntensidad(configuracion.intensidad);
  }, [configuracion]);

  // Al salir de la pantalla sin guardar, se restaura el color guardado
  // (la vista previa pinta toda la app y no debe quedarse puesta).
  const guardadaRef = useRef(configuracion);
  useEffect(() => {
    guardadaRef.current = configuracion;
  }, [configuracion]);

  useEffect(() => {
    return () => {
      const guardada = guardadaRef.current;
      if (guardada) aplicarColorTienda(guardada.color, guardada.intensidad);
    };
  }, []);

  const hayCambios =
    !!configuracion &&
    (nombre.trim() !== configuracion.nombre ||
      color !== configuracion.color ||
      intensidad !== configuracion.intensidad);

  function seleccionarColor(clave: ColorTienda) {
    setColor(clave);
    aplicarColorTienda(clave, intensidad);
  }

  function seleccionarIntensidad(clave: IntensidadColor) {
    setIntensidad(clave);
    aplicarColorTienda(color, clave);
  }

  function previsualizarColor(clave: ColorTienda) {
    aplicarColorTienda(clave, intensidad);
  }

  function terminarPrevisualizacion() {
    // Al sacar el mouse, vuelve a la combinación actualmente seleccionada
    // (no necesariamente guardada todavía).
    aplicarColorTienda(color, intensidad);
  }

  function descartarCambios() {
    if (!configuracion) return;
    setNombre(configuracion.nombre);
    setColor(configuracion.color);
    setIntensidad(configuracion.intensidad);
    aplicarColorTienda(configuracion.color, configuracion.intensidad);
  }

  const guardar = useMutation({
    mutationFn: () => {
      if (!configuracion) {
        throw new Error("No se encontró la configuración.");
      }

      return configuracionTiendaService.actualizar(configuracion.id, {
        nombre: nombre.trim(),
        color,
        intensidad,
      });
    },

    onSuccess: () => {
      toast.success("Configuración actualizada", {
        description: "El nombre, color e intensidad se aplicaron en toda la aplicación.",
      });

      void queryClient.invalidateQueries({ queryKey: ["configuracion-tienda"] });
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando configuración...</p>;
  }

  return (
    <>
      <PageHeader
        title="Configuración de tienda"
        description="Personalizá el nombre, el color y la intensidad con la que se ve la plataforma."
      />

      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Identidad de la tienda</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <ErrorMessage error={error ?? guardar.error} />

            <div className="space-y-2">
              <Label htmlFor="nombre-tienda">Nombre de la tienda</Label>
              <Input
                id="nombre-tienda"
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Este nombre aparece en el login, el menú lateral y el encabezado de la aplicación.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Color principal</Label>

              <div className="flex flex-wrap gap-3" onMouseLeave={terminarPrevisualizacion}>
                {(Object.entries(PALETA_TIENDA) as [ColorTienda, (typeof PALETA_TIENDA)[ColorTienda]][]).map(
                  ([clave, paleta]) => {
                    const seleccionado = clave === color;

                    return (
                      <button
                        key={clave}
                        type="button"
                        aria-pressed={seleccionado}
                        onClick={() => seleccionarColor(clave)}
                        onMouseEnter={() => previsualizarColor(clave)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors",
                          seleccionado ? "border-foreground/60 bg-muted/60" : "border-border hover:bg-muted/30",
                        )}
                      >
                        <span
                          className="flex size-9 items-center justify-center rounded-full shadow-sm"
                          style={{ backgroundColor: paleta.swatch }}
                        >
                          {seleccionado ? <Check className="size-4 text-white" /> : null}
                        </span>
                        <span className="text-xs text-muted-foreground">{paleta.label}</span>
                      </button>
                    );
                  },
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Tocá un color para verlo en toda la app. Se guarda recién cuando tocás Guardar.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Intensidad del color</Label>

              <div className="grid grid-cols-3 gap-2">
                {INTENSIDADES.map((opcion) => {
                  const seleccionado = opcion.clave === intensidad;

                  return (
                    <button
                      key={opcion.clave}
                      type="button"
                      aria-pressed={seleccionado}
                      onClick={() => seleccionarIntensidad(opcion.clave)}
                      onMouseEnter={() => aplicarColorTienda(color, opcion.clave)}
                      onMouseLeave={terminarPrevisualizacion}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-sm transition-colors",
                        seleccionado
                          ? "border-foreground/60 bg-muted/60 font-medium text-foreground"
                          : "border-border text-muted-foreground hover:bg-muted/30",
                      )}
                    >
                      {opcion.label}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                Qué tan marcado se ve el color en fondos, franjas y botones.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                size="lg"
                disabled={guardar.isPending || !configuracion || !nombre.trim() || !hayCambios}
                onClick={() => guardar.mutate()}
              >
                <Save className="size-4" />
                {guardar.isPending ? "Guardando..." : hayCambios ? "Guardar configuración" : "Sin cambios"}
              </Button>

              {hayCambios ? (
                <Button size="lg" variant="outline" disabled={guardar.isPending} onClick={descartarCambios}>
                  <RotateCcw className="size-4" />
                  Descartar cambios
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}