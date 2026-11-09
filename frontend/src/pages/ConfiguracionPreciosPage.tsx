import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { configuracionService } from "../api/services/configuracion.service";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { formatMoney } from "../lib/format";

interface Reglas {
  multiplicador_tarjeta: string;
  descuento_debito: string;
  descuento_efectivo: string;
  recargo_finan_ya: string;
}

const VACIAS: Reglas = {
  multiplicador_tarjeta: "",
  descuento_debito: "",
  descuento_efectivo: "",
  recargo_finan_ya: "",
};

const CLAVES = Object.keys(VACIAS) as (keyof Reglas)[];

// Misma fórmula que usa el servidor para calcular los precios.
function calcularPrecios(costo: number, reglas: Reglas) {
  const tarjeta = costo * Number(reglas.multiplicador_tarjeta);
  const efectivo = tarjeta * (1 - Number(reglas.descuento_efectivo) / 100);
  return {
    credito: tarjeta,
    debito: tarjeta * (1 - Number(reglas.descuento_debito) / 100),
    efectivo,
    finanYa: efectivo * (1 + Number(reglas.recargo_finan_ya) / 100),
  };
}

function Campo({
  id,
  etiqueta,
  ayuda,
  valor,
  onCambio,
  min,
  max,
}: {
  id: string;
  etiqueta: string;
  ayuda: string;
  valor: string;
  onCambio: (valor: string) => void;
  min: string;
  max?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{etiqueta}</Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        step="0.01"
        value={valor}
        onChange={(event) => onCambio(event.target.value)}
      />
      <p className="text-xs text-muted-foreground">{ayuda}</p>
    </div>
  );
}

export function ConfiguracionPreciosPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<Reglas>(VACIAS);
  const [costoEjemplo, setCostoEjemplo] = useState("10000");

  const {
    data: configuracion,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["configuracion-precios"],
    queryFn: () => configuracionService.obtener(),
  });

  const guardadas: Reglas = useMemo(
    () =>
      configuracion
        ? {
            multiplicador_tarjeta: String(configuracion.multiplicador_tarjeta),
            descuento_debito: String(configuracion.descuento_debito),
            descuento_efectivo: String(configuracion.descuento_efectivo),
            recargo_finan_ya: String(configuracion.recargo_finan_ya),
          }
        : VACIAS,
    [configuracion],
  );

  useEffect(() => {
    if (configuracion) setForm(guardadas);
  }, [configuracion, guardadas]);

  const hayCambios = CLAVES.some(
    (clave) => form[clave] === "" || Number(form[clave]) !== Number(guardadas[clave]),
  );

  const valida =
    CLAVES.every((clave) => form[clave] !== "" && !Number.isNaN(Number(form[clave]))) &&
    Number(form.multiplicador_tarjeta) > 0 &&
    Number(form.descuento_debito) >= 0 &&
    Number(form.descuento_debito) <= 100 &&
    Number(form.descuento_efectivo) >= 0 &&
    Number(form.descuento_efectivo) <= 100 &&
    Number(form.recargo_finan_ya) >= 0;

  const costo = Number(costoEjemplo) > 0 ? Number(costoEjemplo) : 0;
  const hoy = calcularPrecios(costo, guardadas);
  const nuevos = calcularPrecios(costo, form);

  const filasSimulacion: { etiqueta: string; hoy: number; nuevo: number }[] = [
    { etiqueta: "Crédito (tarjeta)", hoy: hoy.credito, nuevo: nuevos.credito },
    { etiqueta: "Débito", hoy: hoy.debito, nuevo: nuevos.debito },
    {
      etiqueta: "Efectivo / Transferencia / Fast Cred",
      hoy: hoy.efectivo,
      nuevo: nuevos.efectivo,
    },
    { etiqueta: "Finan Ya", hoy: hoy.finanYa, nuevo: nuevos.finanYa },
  ];

  const guardar = useMutation({
    mutationFn: () => {
      if (!configuracion) {
        throw new Error("No se encontró la configuración.");
      }

      return configuracionService.actualizar(configuracion.id, form);
    },

    onSuccess: () => {
      toast.success("Configuración actualizada", {
        description: "Los nuevos porcentajes ya se aplican a los precios de todos los productos.",
      });

      void queryClient.invalidateQueries({ queryKey: ["configuracion-precios"] });
      void queryClient.invalidateQueries({ queryKey: ["stock-rows"] });
    },
  });

  function pedirGuardado() {
    const ok = window.confirm(
      "Estos valores cambian el precio de TODOS los productos desde ahora. Las ventas ya registradas no se modifican. ¿Guardar los cambios?",
    );
    if (ok) guardar.mutate();
  }

  const cambiar = (clave: keyof Reglas) => (valor: string) =>
    setForm((prev) => ({ ...prev, [clave]: valor }));

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando configuración...</p>;
  }

  return (
    <>
      <PageHeader
        title="Configuración de precios"
        description="Modificá las reglas generales utilizadas para calcular los precios según medio de pago."
      />

      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Reglas de precios</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <ErrorMessage error={error ?? guardar.error} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                id="multiplicador"
                etiqueta="Multiplicador tarjeta"
                ayuda="Precio de tarjeta = costo × este número (por ejemplo, 2,50 es costo × 2,5), más el costo extra."
                valor={form.multiplicador_tarjeta}
                onCambio={cambiar("multiplicador_tarjeta")}
                min="0.01"
              />

              <Campo
                id="descuento-debito"
                etiqueta="Descuento débito (%)"
                ayuda="Se resta del precio de tarjeta."
                valor={form.descuento_debito}
                onCambio={cambiar("descuento_debito")}
                min="0"
                max="100"
              />

              <Campo
                id="descuento-efectivo"
                etiqueta="Descuento efectivo / transferencia (%)"
                ayuda="Se resta del precio de tarjeta."
                valor={form.descuento_efectivo}
                onCambio={cambiar("descuento_efectivo")}
                min="0"
                max="100"
              />

              <Campo
                id="recargo-finan-ya"
                etiqueta="Recargo Finan Ya (%)"
                ayuda="Se suma al precio de efectivo."
                valor={form.recargo_finan_ya}
                onCambio={cambiar("recargo_finan_ya")}
                min="0"
              />
            </div>

            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-sm font-medium">Reglas relacionadas</p>

              <p className="mt-2 text-sm text-muted-foreground">
                Transferencia utiliza el mismo precio que efectivo. Fast Cred utiliza actualmente el
                precio efectivo. Crédito utiliza el precio de tarjeta.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                size="lg"
                disabled={guardar.isPending || !configuracion || !hayCambios || !valida}
                onClick={pedirGuardado}
              >
                <Save className="size-4" />
                {guardar.isPending
                  ? "Guardando..."
                  : hayCambios
                    ? "Guardar cambios"
                    : "Sin cambios"}
              </Button>

              {hayCambios ? (
                <Button
                  size="lg"
                  variant="outline"
                  disabled={guardar.isPending}
                  onClick={() => setForm(guardadas)}
                >
                  <RotateCcw className="size-4" />
                  Descartar cambios
                </Button>
              ) : null}
            </div>

            {hayCambios && !valida ? (
              <p className="text-sm font-medium text-destructive">
                Revisá los valores: ninguno puede estar vacío, el multiplicador tiene que ser mayor
                a cero y los descuentos tienen que estar entre 0 y 100.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Simulación con un producto de ejemplo</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="max-w-xs space-y-2">
              <Label htmlFor="costo-ejemplo">Costo del producto</Label>
              <Input
                id="costo-ejemplo"
                type="number"
                min="0"
                step="100"
                value={costoEjemplo}
                onChange={(event) => setCostoEjemplo(event.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">Medio de pago</th>
                    <th className="py-2 pr-4 text-right font-medium">Precio hoy</th>
                    <th className="py-2 text-right font-medium">Con estos valores</th>
                  </tr>
                </thead>
                <tbody>
                  {filasSimulacion.map((fila) => {
                    const cambia = Math.round(fila.hoy) !== Math.round(fila.nuevo);
                    return (
                      <tr key={fila.etiqueta} className="border-b border-border/60 last:border-0">
                        <td className="py-2 pr-4">{fila.etiqueta}</td>
                        <td className="py-2 pr-4 text-right text-muted-foreground">
                          {formatMoney(fila.hoy)}
                        </td>
                        <td
                          className={`py-2 text-right ${
                            cambia ? "font-semibold text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {formatMoney(fila.nuevo)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground">
              Los cambios se aplican a los precios de todos los productos desde que guardás. Las
              ventas ya registradas conservan el precio al que se vendieron.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}