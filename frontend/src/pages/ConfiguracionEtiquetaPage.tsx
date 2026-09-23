import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { configuracionEtiquetaService } from "../api/services/configuracion.service";
import type { EstiloEtiqueta, FormaEtiqueta, FuenteEtiqueta, PosicionNombreEtiqueta } from "../api/types";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import {
  ESTILOS,
  FUENTES,
  bordeEtiqueta,
  bordeRecuadro,
  fontFamilyDe,
  radioEtiqueta,
  radioRecuadro,
} from "../lib/etiqueta-estilos";
import { useTienda } from "../tienda/TiendaProvider";
import { cn } from "../lib/utils";

const A4_ANCHO_CM = 21;
const A4_ALTO_CM = 29.7;
const MARGEN_HOJA_CM = 1;
const ESPACIO_ENTRE_CM = 0.2;

const POSICIONES: { clave: PosicionNombreEtiqueta; fila: 0 | 1 | 2; columna: 0 | 1 | 2 }[] = [
  { clave: "arriba_izquierda", fila: 0, columna: 0 },
  { clave: "arriba_centro", fila: 0, columna: 1 },
  { clave: "arriba_derecha", fila: 0, columna: 2 },
  { clave: "centro_izquierda", fila: 1, columna: 0 },
  { clave: "centro", fila: 1, columna: 1 },
  { clave: "centro_derecha", fila: 1, columna: 2 },
  { clave: "abajo_izquierda", fila: 2, columna: 0 },
  { clave: "abajo_centro", fila: 2, columna: 1 },
  { clave: "abajo_derecha", fila: 2, columna: 2 },
];

const POSICION_POR_DEFECTO = { clave: "arriba_centro" as PosicionNombreEtiqueta, fila: 0 as const, columna: 1 as const };

const JUSTIFY_POR_COLUMNA = ["start", "center", "end"] as const;
const ALIGN_POR_FILA = ["start", "center", "end"] as const;

export function ConfiguracionEtiquetaPage() {
  const queryClient = useQueryClient();
  const { nombre: nombreTienda } = useTienda();

  const [forma, setForma] = useState<FormaEtiqueta>("rectangular");
  const [anchoCm, setAnchoCm] = useState("5.0");
  const [altoCm, setAltoCm] = useState("3.0");
  const [colorFondo, setColorFondo] = useState("#ffffff");
  const [colorFondo2, setColorFondo2] = useState("#ffffff");
  const [subtitulo, setSubtitulo] = useState("");
  const [colorTexto, setColorTexto] = useState("#1a1a1a");
  const [colorTextoTienda, setColorTextoTienda] = useState("#1a1a1a");
  const [colorRectangulos, setColorRectangulos] = useState("#f2f2f2");
  const [estilo, setEstilo] = useState<EstiloEtiqueta>("simple");
  const [fuente, setFuente] = useState<FuenteEtiqueta>("arial");
  const [tamanoTienda, setTamanoTienda] = useState("10");
  const [tamanoCodigo, setTamanoCodigo] = useState("14");
  const [posicionNombre, setPosicionNombre] = useState<PosicionNombreEtiqueta>("arriba_centro");

  const {
    data: configuracion,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["configuracion-etiqueta"],
    queryFn: () => configuracionEtiquetaService.obtener(),
  });

  useEffect(() => {
    if (!configuracion) return;
    setForma(configuracion.forma);
    setAnchoCm(configuracion.ancho_cm);
    setAltoCm(configuracion.forma === "circular" ? configuracion.ancho_cm : configuracion.alto_cm);
    setColorFondo(configuracion.color_fondo);
    setColorFondo2(configuracion.color_fondo_2);
    setSubtitulo(configuracion.subtitulo);
    setColorTexto(configuracion.color_texto);
    setColorTextoTienda(configuracion.color_texto_tienda);
    setColorRectangulos(configuracion.color_rectangulos);
    setEstilo(configuracion.estilo);
    setFuente(configuracion.fuente);
    setTamanoTienda(String(configuracion.tamano_texto_tienda));
    setTamanoCodigo(String(configuracion.tamano_texto_codigo));
    setPosicionNombre(configuracion.posicion_nombre);
  }, [configuracion]);

  const guardar = useMutation({
    mutationFn: () => {
      if (!configuracion) {
        throw new Error("No se encontró la configuración.");
      }

      return configuracionEtiquetaService.actualizar(configuracion.id, {
        forma,
        ancho_cm: anchoCm,
        alto_cm: forma === "circular" ? anchoCm : altoCm,
        color_fondo: colorFondo,
        color_fondo_2: colorFondo2,
        subtitulo,
        color_texto: colorTexto,
        color_texto_tienda: colorTextoTienda,
        color_rectangulos: colorRectangulos,
        estilo,
        fuente,
        tamano_texto_tienda: Number(tamanoTienda) || 10,
        tamano_texto_codigo: Number(tamanoCodigo) || 14,
        posicion_nombre: posicionNombre,
      });
    },

    onSuccess: () => {
      toast.success("Diseño de etiqueta guardado");
      void queryClient.invalidateQueries({ queryKey: ["configuracion-etiqueta"] });
    },
  });

  const ancho = Number(anchoCm) || 0;
  const alto = forma === "circular" ? ancho : Number(altoCm) || 0;

  const anchoUtil = A4_ANCHO_CM - MARGEN_HOJA_CM * 2;
  const altoUtil = A4_ALTO_CM - MARGEN_HOJA_CM * 2;
  const columnas = ancho > 0 ? Math.floor((anchoUtil + ESPACIO_ENTRE_CM) / (ancho + ESPACIO_ENTRE_CM)) : 0;
  const filas = alto > 0 ? Math.floor((altoUtil + ESPACIO_ENTRE_CM) / (alto + ESPACIO_ENTRE_CM)) : 0;
  const capacidadPorHoja = columnas * filas;

  const posicionActual = POSICIONES.find((p) => p.clave === posicionNombre) ?? POSICION_POR_DEFECTO;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando configuración...</p>;
  }

  const escala = 32;

  return (
    <>
      <PageHeader
        title="Diseño de etiqueta"
        description="Definí forma, tamaño, estilo, colores y tipografía de la etiqueta."
      />

      <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Opciones</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <ErrorMessage error={error ?? guardar.error} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Forma</Label>
                <Select value={forma} onValueChange={(value) => setForma(value as FormaEtiqueta)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rectangular">Rectangular</SelectItem>
                    <SelectItem value="cuadrada">Cuadrada</SelectItem>
                    <SelectItem value="circular">Circular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Estilo</Label>
                <Select value={estilo} onValueChange={(value) => setEstilo(value as EstiloEtiqueta)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTILOS.map((e) => (
                      <SelectItem key={e.clave} value={e.clave}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ancho-etiqueta">
                  {forma === "circular" ? "Diámetro (cm)" : "Ancho (cm)"}
                </Label>
                <Input
                  id="ancho-etiqueta"
                  type="number"
                  min="1"
                  step="0.5"
                  value={anchoCm}
                  onChange={(event) => setAnchoCm(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alto-etiqueta">Alto (cm)</Label>
                <Input
                  id="alto-etiqueta"
                  type="number"
                  min="1"
                  step="0.5"
                  value={forma === "circular" ? anchoCm : altoCm}
                  onChange={(event) => setAltoCm(event.target.value)}
                  disabled={forma === "circular"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipografía</Label>
              <Select value={fuente} onValueChange={(value) => setFuente(value as FuenteEtiqueta)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FUENTES.map((f) => (
                    <SelectItem key={f.clave} value={f.clave} style={{ fontFamily: f.cssFontFamily }}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tamano-tienda">Tamaño letra nombre (pt)</Label>
                <Input
                  id="tamano-tienda"
                  type="number"
                  min="6"
                  max="72"
                  value={tamanoTienda}
                  onChange={(event) => setTamanoTienda(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tamano-codigo">Tamaño letra código/talle (pt)</Label>
                <Input
                  id="tamano-codigo"
                  type="number"
                  min="6"
                  max="72"
                  value={tamanoCodigo}
                  onChange={(event) => setTamanoCodigo(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitulo-etiqueta">Subtítulo (opcional)</Label>
              <Input
                id="subtitulo-etiqueta"
                placeholder="Ej: INDUMENTARIA"
                value={subtitulo}
                onChange={(event) => setSubtitulo(event.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Aparece debajo del nombre de la tienda, en letra más chica. Dejalo vacío si no lo querés.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color-fondo">Fondo de la etiqueta</Label>
                <Input
                  id="color-fondo"
                  type="color"
                  value={colorFondo}
                  onChange={(event) => setColorFondo(event.target.value)}
                  className="h-10 w-full cursor-pointer p-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color-fondo-2">Fondo (2º color, degradé)</Label>
                <Input
                  id="color-fondo-2"
                  type="color"
                  value={colorFondo2}
                  onChange={(event) => setColorFondo2(event.target.value)}
                  className="h-10 w-full cursor-pointer p-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color-rectangulos">Fondo de los recuadros</Label>
                <Input
                  id="color-rectangulos"
                  type="color"
                  value={colorRectangulos}
                  onChange={(event) => setColorRectangulos(event.target.value)}
                  className="h-10 w-full cursor-pointer p-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color-texto-tienda">Letra del nombre de tienda</Label>
                <Input
                  id="color-texto-tienda"
                  type="color"
                  value={colorTextoTienda}
                  onChange={(event) => setColorTextoTienda(event.target.value)}
                  className="h-10 w-full cursor-pointer p-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color-texto">Letra del código/talle</Label>
                <Input
                  id="color-texto"
                  type="color"
                  value={colorTexto}
                  onChange={(event) => setColorTexto(event.target.value)}
                  className="h-10 w-full cursor-pointer p-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Posición del nombre de la tienda</Label>
              <div className="grid w-40 grid-cols-3 gap-1 rounded-lg border border-border p-1">
                {POSICIONES.map((p) => (
                  <button
                    key={p.clave}
                    type="button"
                    onClick={() => setPosicionNombre(p.clave)}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded",
                      p.clave === posicionNombre ? "bg-primary" : "bg-muted hover:bg-muted/70",
                    )}
                    aria-label={p.clave.replaceAll("_", " ")}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        p.clave === posicionNombre ? "bg-primary-foreground" : "bg-muted-foreground/40",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Con este tamaño entran aproximadamente <strong>{capacidadPorHoja}</strong> etiquetas por hoja A4
              ({columnas} columnas × {filas} filas).
            </p>

            <Button
              className="w-full"
              size="lg"
              disabled={guardar.isPending || !configuracion}
              onClick={() => guardar.mutate()}
            >
              <Save className="size-4" />
              {guardar.isPending ? "Guardando..." : "Guardar diseño"}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Vista previa</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-10">
            <div
              className="flex flex-col justify-between overflow-hidden p-2"
              style={{
                width: `${ancho * escala}px`,
                height: `${alto * escala}px`,
                background: `linear-gradient(135deg, ${colorFondo}, ${colorFondo2})`,
                fontFamily: fontFamilyDe(fuente),
                borderRadius: radioEtiqueta(forma, estilo),
                border: bordeEtiqueta(estilo, colorTexto),
              }}
            >
              <div
                className="flex flex-1 flex-col"
                style={{
                  alignItems: ALIGN_POR_FILA[posicionActual.fila],
                  justifyContent: JUSTIFY_POR_COLUMNA[posicionActual.columna],
                }}
              >
                <span
                  className="font-semibold"
                  style={{ color: colorTextoTienda, fontSize: `${tamanoTienda}pt` }}
                >
                  {nombreTienda}
                </span>
                {subtitulo ? (
                  <span
                    className="tracking-wide"
                    style={{ color: colorTextoTienda, fontSize: `${Number(tamanoTienda) * 0.6}pt` }}
                  >
                    {subtitulo}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-col items-center justify-center gap-1.5">
                {[
                  { etiqueta: "Código", valor: "8081" },
                  { etiqueta: "Talle", valor: "M" },
                ].map((campo) => (
                  <div key={campo.etiqueta} className="flex flex-col items-center gap-0.5">
                    <span
                      className="uppercase leading-none opacity-70"
                      style={{ color: colorTexto, fontSize: `${Number(tamanoCodigo) * 0.55}pt` }}
                    >
                      {campo.etiqueta}
                    </span>
                    <span
                      className="px-2 py-1 text-center font-medium leading-none"
                      style={{
                        backgroundColor: estilo === "relleno_solido" ? colorRectangulos : "transparent",
                        color: colorTexto,
                        fontSize: `${tamanoCodigo}pt`,
                        borderRadius: radioRecuadro(estilo),
                        border: bordeRecuadro(estilo, colorTexto),
                      }}
                    >
                      {campo.valor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}