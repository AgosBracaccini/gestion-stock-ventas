import {
  useEffect,
  useState,
} from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";

import {
  configuracionService,
} from "../api/services/configuracion.service";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function ConfiguracionPreciosPage() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    multiplicador_tarjeta: "",
    descuento_debito: "",
    descuento_efectivo: "",
    recargo_finan_ya: "",
  });

  const {
    data: configuracion,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["configuracion-precios"],
    queryFn: () =>
      configuracionService.obtener(),
  });

  useEffect(() => {
    if (!configuracion) return;

    setForm({
      multiplicador_tarjeta:
        configuracion.multiplicador_tarjeta,
      descuento_debito:
        configuracion.descuento_debito,
      descuento_efectivo:
        configuracion.descuento_efectivo,
      recargo_finan_ya:
        configuracion.recargo_finan_ya,
    });
  }, [configuracion]);

  const guardar = useMutation({
    mutationFn: () => {
      if (!configuracion) {
        throw new Error(
          "No se encontró la configuración.",
        );
      }

      return configuracionService.actualizar(
        configuracion.id,
        form,
      );
    },

    onSuccess: () => {
      toast.success(
        "Configuración actualizada",
        {
          description:
            "Los nuevos porcentajes se aplicarán a los precios actuales.",
        },
      );

      void queryClient.invalidateQueries({
        queryKey: ["configuracion-precios"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["stock-rows"],
      });
    },
  });

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">
        Cargando configuración...
      </p>
    );
  }

  return (
    <>
      <PageHeader
        title="Configuración de precios"
        description="Modificá las reglas generales utilizadas para calcular los precios según medio de pago."
      />

      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>
              Reglas de precios
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <ErrorMessage
              error={error ?? guardar.error}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>
                  Multiplicador tarjeta
                </Label>

                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={
                    form.multiplicador_tarjeta
                  }
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      multiplicador_tarjeta:
                        event.target.value,
                    }))
                  }
                />

                <p className="text-xs text-muted-foreground">
                  Ejemplo: 2,50 significa costo × 2,5.
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Descuento débito (%)
                </Label>

                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    form.descuento_debito
                  }
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      descuento_debito:
                        event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Descuento efectivo / transferencia (%)
                </Label>

                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    form.descuento_efectivo
                  }
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      descuento_efectivo:
                        event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Recargo Finan Ya (%)
                </Label>

                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    form.recargo_finan_ya
                  }
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      recargo_finan_ya:
                        event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="text-sm font-medium">
                Reglas relacionadas
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Transferencia utiliza el mismo precio que efectivo.
                Fast Cred utiliza actualmente el precio efectivo.
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={
                guardar.isPending ||
                !configuracion
              }
              onClick={() => guardar.mutate()}
            >
              <Save className="size-4" />

              {guardar.isPending
                ? "Guardando..."
                : "Guardar configuración"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}