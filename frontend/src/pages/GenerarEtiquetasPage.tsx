import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Printer, Trash2 } from "lucide-react";

import { configuracionEtiquetaService } from "../api/services/configuracion.service";
import { productosService } from "../api/services/productos.service";
import type { ConfiguracionEtiqueta, Producto, VarianteProducto } from "../api/types";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  bordeEtiqueta,
  bordeRecuadro,
  fontFamilyDe,
  radioEtiqueta,
  radioRecuadro,
} from "../lib/etiqueta-estilos";
import { formatMoney } from "../lib/format";
import { useTienda } from "../tienda/TiendaProvider";

interface ItemCola {
  key: string;
  producto: Producto;
  variante: VarianteProducto;
  cantidad: number;
}

const JUSTIFY_POR_COLUMNA = ["start", "center", "end"] as const;
const ALIGN_POR_FILA = ["start", "center", "end"] as const;

const POSICION_INDICE: Record<string, { fila: 0 | 1 | 2; columna: 0 | 1 | 2 }> = {
  arriba_izquierda: { fila: 0, columna: 0 },
  arriba_centro: { fila: 0, columna: 1 },
  arriba_derecha: { fila: 0, columna: 2 },
  centro_izquierda: { fila: 1, columna: 0 },
  centro: { fila: 1, columna: 1 },
  centro_derecha: { fila: 1, columna: 2 },
  abajo_izquierda: { fila: 2, columna: 0 },
  abajo_centro: { fila: 2, columna: 1 },
  abajo_derecha: { fila: 2, columna: 2 },
};

const POSICION_POR_DEFECTO = { fila: 0 as const, columna: 1 as const };

const A4_ANCHO_CM = 21;
const A4_ALTO_CM = 29.7;
const MARGEN_HOJA_CM = 1;
const ESPACIO_ENTRE_CM = 0.2;

export function GenerarEtiquetasPage() {
  const { nombre: nombreTienda } = useTienda();

  const { data: config } = useQuery({
    queryKey: ["configuracion-etiqueta"],
    queryFn: () => configuracionEtiquetaService.obtener(),
  });

  const [codigo, setCodigo] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<unknown>(null);
  const [producto, setProducto] = useState<Producto | null>(null);
  const [varianteId, setVarianteId] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [cola, setCola] = useState<ItemCola[]>([]);

  async function buscarProducto(event: React.FormEvent) {
    event.preventDefault();
    if (!codigo.trim()) return;

    setBuscando(true);
    setErrorBusqueda(null);
    setProducto(null);
    setVarianteId("");

    try {
      const encontrado = await productosService.findByCodigo(codigo);

      if (!encontrado) {
        setErrorBusqueda(new Error(`No se encontró un producto con el código "${codigo.trim()}".`));
        return;
      }

      setProducto(encontrado);

      const primera = (encontrado.variantes ?? [])[0];
      if (primera) setVarianteId(String(primera.id));
    } catch (error) {
      setErrorBusqueda(error);
    } finally {
      setBuscando(false);
    }
  }

  const varianteSeleccionada =
    (producto?.variantes ?? []).find((v) => String(v.id) === varianteId) ?? null;

  function agregarACola() {
    if (!producto || !varianteSeleccionada || cantidad < 1) return;

    const key = `${producto.id}-${varianteSeleccionada.id}`;
    const yaExiste = cola.find((item) => item.key === key);

    if (yaExiste) {
      setCola(cola.map((item) => (item.key === key ? { ...item, cantidad: item.cantidad + cantidad } : item)));
    } else {
      setCola([...cola, { key, producto, variante: varianteSeleccionada, cantidad }]);
    }

    setCantidad(1);
  }

  function quitarDeCola(key: string) {
    setCola(cola.filter((item) => item.key !== key));
  }

  const totalEtiquetas = cola.reduce((acc, item) => acc + item.cantidad, 0);

  const ancho = config ? Number(config.ancho_cm) : 5;
  const alto = config?.forma === "circular" ? ancho : config ? Number(config.alto_cm) : 3;
  const anchoUtil = A4_ANCHO_CM - MARGEN_HOJA_CM * 2;
  const altoUtil = A4_ALTO_CM - MARGEN_HOJA_CM * 2;
  const columnas = ancho > 0 ? Math.floor((anchoUtil + ESPACIO_ENTRE_CM) / (ancho + ESPACIO_ENTRE_CM)) : 1;
  const filas = alto > 0 ? Math.floor((altoUtil + ESPACIO_ENTRE_CM) / (alto + ESPACIO_ENTRE_CM)) : 1;
  const capacidadPorHoja = Math.max(columnas * filas, 1);
  const hojasNecesarias = Math.ceil(totalEtiquetas / capacidadPorHoja) || 0;

  // Expande la cola a una lista plana: una entrada por cada etiqueta física a imprimir.
  const etiquetasPlanas = useMemo(() => {
    const lista: { producto: Producto; variante: VarianteProducto }[] = [];
    for (const item of cola) {
      for (let i = 0; i < item.cantidad; i++) {
        lista.push({ producto: item.producto, variante: item.variante });
      }
    }
    return lista;
  }, [cola]);

  const paginas = useMemo(() => {
    const resultado: (typeof etiquetasPlanas)[] = [];
    for (let i = 0; i < etiquetasPlanas.length; i += capacidadPorHoja) {
      resultado.push(etiquetasPlanas.slice(i, i + capacidadPorHoja));
    }
    return resultado;
  }, [etiquetasPlanas, capacidadPorHoja]);

  return (
    <>
      <PageHeader
        title="Generar etiquetas"
        description="Cargá código, talle y cantidad de cada producto, agregalos a la lista, y generá la hoja para imprimir."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6 print:hidden">
          <Card>
            <CardHeader>
              <CardTitle>Agregar etiqueta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ErrorMessage error={errorBusqueda} />

              <form onSubmit={buscarProducto} className="flex gap-2">
                <Input
                  placeholder="Código del producto"
                  value={codigo}
                  onChange={(event) => setCodigo(event.target.value)}
                />
                <Button type="submit" disabled={buscando}>
                  {buscando ? "Buscando..." : "Buscar"}
                </Button>
              </form>

              {producto ? (
                <>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium">
                      {producto.codigo} · {producto.prenda} {producto.modelo}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatMoney(producto.precio_efectivo)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Variante (color / talle)</Label>
                    <Select value={varianteId} onValueChange={setVarianteId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(producto.variantes ?? []).map((v) => (
                          <SelectItem key={v.id} value={String(v.id)}>
                            {v.color} · {v.talle} (stock: {v.stock_actual})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="cantidad-etiquetas">Cantidad de etiquetas</Label>
                      <Input
                        id="cantidad-etiquetas"
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={(event) => setCantidad(Math.max(1, Number(event.target.value) || 1))}
                      />
                    </div>
                    <Button onClick={agregarACola} disabled={!varianteSeleccionada}>
                      <Plus className="size-4" />
                      Agregar
                    </Button>
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista a imprimir ({totalEtiquetas})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cola.length === 0 ? (
                <p className="text-sm text-muted-foreground">Todavía no agregaste ninguna etiqueta.</p>
              ) : (
                <div className="space-y-2">
                  {cola.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                    >
                      <div className="text-sm">
                        <p className="font-medium">
                          {item.producto.codigo} · {item.variante.color} · {item.variante.talle}
                        </p>
                        <p className="text-xs text-muted-foreground">Cantidad: {item.cantidad}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => quitarDeCola(item.key)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                {totalEtiquetas} etiquetas · {hojasNecesarias} hoja{hojasNecesarias === 1 ? "" : "s"} A4
              </p>

              <Button className="w-full" size="lg" disabled={cola.length === 0} onClick={() => window.print()}>
                <Printer className="size-4" />
                Imprimir hoja de etiquetas
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Vista previa (primera hoja)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            {config && paginas[0] ? (
              <div
                className="grid gap-2 bg-white p-2"
                style={{ gridTemplateColumns: `repeat(${columnas}, ${ancho * 24}px)` }}
              >
                {paginas[0].map((et, i) => (
                  <EtiquetaImpresa
                    key={i}
                    producto={et.producto}
                    variante={et.variante}
                    config={config}
                    nombreTienda={nombreTienda}
                    escala={24}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Agregá etiquetas a la lista para ver la vista previa.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contenido real de impresión: oculto en pantalla, visible solo en @media print (ver styles.css) */}
      <div className="hoja-impresion hidden print:block">
        {config &&
          paginas.map((pagina, indice) => (
            <div
              key={indice}
              className="pagina-etiquetas grid gap-[0.2cm]"
              style={{
                width: `${A4_ANCHO_CM}cm`,
                minHeight: `${A4_ALTO_CM}cm`,
                padding: `${MARGEN_HOJA_CM}cm`,
                gridTemplateColumns: `repeat(${columnas}, ${ancho}cm)`,
                pageBreakAfter: indice < paginas.length - 1 ? "always" : "auto",
              }}
            >
              {pagina.map((et, i) => (
                <EtiquetaImpresa
                  key={i}
                  producto={et.producto}
                  variante={et.variante}
                  config={config}
                  nombreTienda={nombreTienda}
                  escalaCm
                />
              ))}
            </div>
          ))}
      </div>
    </>
  );
}

function EtiquetaImpresa({
  producto,
  variante,
  config,
  nombreTienda,
  escala,
  escalaCm,
}: {
  producto: Producto;
  variante: VarianteProducto;
  config: ConfiguracionEtiqueta;
  nombreTienda: string;
  escala?: number;
  escalaCm?: boolean;
}) {
  const posicion = POSICION_INDICE[config.posicion_nombre] ?? POSICION_POR_DEFECTO;
  const ancho = Number(config.ancho_cm);
  const alto = config.forma === "circular" ? ancho : Number(config.alto_cm);

  const dimensiones = escalaCm
    ? { width: `${ancho}cm`, height: `${alto}cm` }
    : { width: `${ancho * (escala ?? 24)}px`, height: `${alto * (escala ?? 24)}px` };

  return (
    <div
      className="flex flex-col justify-between overflow-hidden p-2"
      style={{
        ...dimensiones,
        backgroundColor: config.color_fondo,
        fontFamily: fontFamilyDe(config.fuente),
        borderRadius: radioEtiqueta(config.forma, config.estilo),
        border: bordeEtiqueta(config.estilo, config.color_texto),
        breakInside: "avoid",
      }}
    >
      <div
        className="flex flex-1"
        style={{
          alignItems: ALIGN_POR_FILA[posicion.fila],
          justifyContent: JUSTIFY_POR_COLUMNA[posicion.columna],
        }}
      >
        <span
          className="font-semibold"
          style={{ color: config.color_texto_tienda, fontSize: `${config.tamano_texto_tienda}pt` }}
        >
          {nombreTienda}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center gap-1">
        {[producto.codigo, variante.talle].map((valor, i) => (
          <span
            key={i}
            className="px-2 py-1 text-center font-medium leading-none"
            style={{
              backgroundColor: config.estilo === "relleno_solido" ? config.color_rectangulos : "transparent",
              color: config.color_texto,
              fontSize: `${config.tamano_texto_codigo}pt`,
              borderRadius: radioRecuadro(config.estilo),
              border: bordeRecuadro(config.estilo, config.color_texto),
            }}
          >
            {valor}
          </span>
        ))}
      </div>

      <div
        className="text-center font-semibold"
        style={{ color: config.color_texto, fontSize: `${config.tamano_texto_codigo}pt` }}
      >
        {formatMoney(producto.precio_efectivo)}
      </div>
    </div>
  );
}