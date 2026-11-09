import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PackagePlus, RefreshCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { productosService } from "../api/services/productos.service";
import { proveedoresService } from "../api/services/proveedores.service";
import type { Producto } from "../api/types";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { ordenarVariantes } from "../lib/talles";

const empty = {
  codigo: "",
  prenda: "",
  modelo: "",
  descripcion: "",
  color: "",
  talle: "",
  cantidad: "1",
  costo: "",
  costo_extra: "0",
  proveedor: "",
};

export function IngresoMercaderiaPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ ...empty });
  const [productoExistente, setProductoExistente] = useState<Producto | null>(null);
  const [verificando, setVerificando] = useState(false);
  const codigoRef = useRef<HTMLInputElement>(null);

  const { data: proveedores } = useQuery({
    queryKey: ["proveedores"],
    queryFn: () => proveedoresService.list(),
  });

  const setField = (key: keyof typeof empty, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Verifica contra la API si el código ya existe para distinguir alta de reposición.
  useEffect(() => {
    const codigo = form.codigo.trim();
    if (!codigo) {
      setProductoExistente(null);
      return;
    }
    let cancelled = false;
    setVerificando(true);
    const timer = setTimeout(async () => {
      try {
        const producto = await productosService.findByCodigo(codigo);
        if (!cancelled) setProductoExistente(producto);
      } catch {
        if (!cancelled) setProductoExistente(null);
      } finally {
        if (!cancelled) setVerificando(false);
      }
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [form.codigo]);

  useEffect(() => {
    if (!productoExistente) return;
    setForm((prev) => ({
      ...prev,
      prenda: productoExistente.prenda,
      modelo: productoExistente.modelo,
      descripcion: productoExistente.descripcion,
      costo: String(productoExistente.costo),
      costo_extra: String(productoExistente.costo_extra),
      proveedor: String(productoExistente.proveedor),
    }));
  }, [productoExistente]);

  const varianteExistente =
    productoExistente?.variantes?.find(
      (v) =>
        v.color.toLowerCase() === form.color.trim().toLowerCase() &&
        v.talle.toLowerCase() === form.talle.trim().toLowerCase(),
    ) ?? null;

  const modo: "producto-nuevo" | "variante-nueva" | "reposicion" = !productoExistente
    ? "producto-nuevo"
    : varianteExistente
      ? "reposicion"
      : "variante-nueva";

  const ingresar = useMutation({
    mutationFn: () =>
      productosService.ingresarMercaderia({
        codigo: form.codigo.trim(),
        prenda: form.prenda.trim(),
        modelo: form.modelo.trim(),
        descripcion: form.descripcion.trim(),
        color: form.color.trim(),
        talle: form.talle.trim(),
        cantidad: Number(form.cantidad) || 0,
        costo: Number(form.costo) || 0,
        costo_extra: Number(form.costo_extra) || 0,
        proveedor_id: Number(form.proveedor),
      }),
    onSuccess: () => {
      toast.success(
        modo === "reposicion" ? "Reposición de stock registrada" : "Mercadería ingresada",
        {
          description: `${Number(form.cantidad)} u. de ${form.codigo.trim()} · ${form.color.trim()} · ${form.talle.trim()}`,
        },
      );
      setForm({ ...empty });
      setProductoExistente(null);
      codigoRef.current?.focus();
      void queryClient.invalidateQueries({ queryKey: ["stock-rows"] });
      void queryClient.invalidateQueries({ queryKey: ["movimientos"] });
    },
  });

  const puedeEnviar =
    !!form.codigo.trim() &&
    !!form.color.trim() &&
    !!form.talle.trim() &&
    !!form.proveedor &&
    Number(form.cantidad) > 0 &&
    (!!productoExistente || Number(form.costo) > 0);

  const avisos = {
    "producto-nuevo": {
      titulo: "Producto nuevo",
      texto: "El código no existe: se dará de alta el producto junto con su primera variante.",
      icon: PackagePlus,
      className: "border-info/30 bg-info/10 text-info-foreground",
    },
    "variante-nueva": {
      titulo: "Producto existente · variante nueva",
      texto: "El producto ya existe. Se agregará una nueva combinación de color y talle.",
      icon: PackagePlus,
      className: "border-primary/40 bg-primary/15 text-foreground",
    },
    reposicion: {
      titulo: "Reposición de stock",
      texto:
        "El producto y la variante ya existen: esta operación SOLO suma stock, no edita el producto.",
      icon: RefreshCcw,
      className: "border-success/30 bg-success/12 text-success-foreground",
    },
  }[modo];

  const aviso = form.codigo.trim()
    ? avisos
    : {
        titulo: "Ingresá un código",
        texto:
          "Escribí el código del producto: el sistema detecta solo si es nuevo o si solo hay que sumar stock.",
        icon: PackagePlus,
        className: "border-border bg-muted text-foreground",
      };

  return (
    <>
      <PageHeader
        title="Ingreso de mercadería"
        description="Cargá mercadería nueva o sumá stock a un producto que ya existe."
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();
          ingresar.mutate();
        }}
        className="grid gap-6 lg:grid-cols-[1.4fr_1fr]"
      >
        <Card className="border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Datos del ingreso</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                ref={codigoRef}
                value={form.codigo}
                onChange={(e) => setField("codigo", e.target.value)}
                placeholder="BL-100"
                required
              />
              {verificando ? (
                <p className="text-xs text-muted-foreground">Verificando código…</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="prenda">Prenda</Label>
              <Input
                id="prenda"
                value={form.prenda}
                onChange={(e) => setField("prenda", e.target.value)}
                disabled={!!productoExistente}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={form.modelo}
                onChange={(e) => setField("modelo", e.target.value)}
                disabled={!!productoExistente}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                rows={2}
                value={form.descripcion}
                onChange={(e) => setField("descripcion", e.target.value)}
                disabled={!!productoExistente}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={form.color}
                onChange={(e) => setField("color", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="talle">Talle</Label>
              <Input
                id="talle"
                value={form.talle}
                onChange={(e) => setField("talle", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min={1}
                value={form.cantidad}
                onChange={(e) => setField("cantidad", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proveedor">Proveedor</Label>
              <Select
                value={form.proveedor}
                onValueChange={(value) => setField("proveedor", value)}
                disabled={!!productoExistente}
              >
                <SelectTrigger id="proveedor">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {(proveedores ?? []).map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="costo">Costo</Label>
              <Input
                id="costo"
                type="number"
                min={0}
                step="0.01"
                value={form.costo}
                onChange={(e) => setField("costo", e.target.value)}
                disabled={!!productoExistente}
                required={!productoExistente}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costo_extra">Costo extra</Label>
              <Input
                id="costo_extra"
                type="number"
                min={0}
                step="0.01"
                value={form.costo_extra}
                onChange={(e) => setField("costo_extra", e.target.value)}
                disabled={!!productoExistente}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className={`rounded-xl border px-4 py-4 ${aviso.className}`}>
            <div className="flex items-center gap-2">
              <aviso.icon className="size-4" />
              <p className="text-sm font-semibold">{aviso.titulo}</p>
            </div>
            <p className="mt-2 text-sm">{aviso.texto}</p>
            {varianteExistente ? (
              <p className="mt-2 text-xs">
                Stock actual de {varianteExistente.color} · {varianteExistente.talle}:{" "}
                <strong>{varianteExistente.stock_actual}</strong> u.
              </p>
            ) : null}
            {productoExistente && (productoExistente.variantes ?? []).length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-medium">Variantes que ya tiene (tocá una para reponer):</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {ordenarVariantes(productoExistente.variantes ?? []).map((v) => (
                    <button
                      type="button"
                      key={`${v.color}-${v.talle}`}
                      onClick={() => {
                        setField("color", v.color);
                        setField("talle", v.talle);
                      }}
                      className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium hover:bg-accent"
                    >
                      {v.color} · {v.talle} ({v.stock_actual})
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <Card className="border-border/70 shadow-none">
            <CardContent className="space-y-4 pt-6">
              <ErrorMessage error={ingresar.error} />
              <Button type="submit" className="w-full" size="lg" disabled={!puedeEnviar || ingresar.isPending}>
                {ingresar.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Guardando…
                  </>
                ) : modo === "reposicion" ? (
                  "Reponer stock"
                ) : (
                  "Registrar ingreso"
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Si el código ya existe, solo se suma stock. Si no existe, se crea el producto con su
                primera variante.
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  );
}
