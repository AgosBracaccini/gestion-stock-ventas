import { useQueryClient } from "@tanstack/react-query";
import { Check, FileSpreadsheet, TriangleAlert, UploadCloud } from "lucide-react";
import { useState, type ReactNode } from "react";

import { importarService, type FilaConError, type ResultadoImportacion } from "../api/services/importar.service";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { formatCount } from "../lib/format";

const TAMANO_MAXIMO = 5 * 1024 * 1024; // 5 MB, igual que en el servidor

interface Campo {
  clave: string;
  etiqueta: string;
}

function formatearTamano(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function Pastilla({ tono, children }: { tono: "exito" | "neutro" | "aviso"; children: ReactNode }) {
  const estilos = {
    exito: "border-success/50 bg-success/30 text-success-foreground",
    neutro: "border-border bg-muted text-foreground",
    aviso: "border-warning/70 bg-warning/45 text-warning-foreground",
  }[tono];

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${estilos}`}>
      {children}
    </span>
  );
}

function FilaCorregible({
  fila,
  campos,
  onCorregir,
  onResuelta,
}: {
  fila: FilaConError;
  campos: Campo[];
  onCorregir: (datos: Record<string, unknown>) => Promise<{ creado: boolean }>;
  onResuelta: () => void;
}) {
  const [valores, setValores] = useState<Record<string, string>>(() => {
    const inicial: Record<string, string> = {};
    for (const campo of campos) {
      const valor = fila.datos?.[campo.clave];
      inicial[campo.clave] = valor === null || valor === undefined ? "" : String(valor);
    }
    return inicial;
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setGuardando(true);
    setError(null);
    try {
      await onCorregir(valores);
      onResuelta();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar esta fila.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
      <p className="text-sm">
        <span className="font-medium">Fila {fila.fila}:</span> {fila.mensaje}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {campos.map((campo) => (
          <div key={campo.clave} className="space-y-1">
            <Label htmlFor={`${fila.fila}-${campo.clave}`}>{campo.etiqueta}</Label>
            <Input
              id={`${fila.fila}-${campo.clave}`}
              value={valores[campo.clave] ?? ""}
              onChange={(event) => setValores({ ...valores, [campo.clave]: event.target.value })}
            />
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button size="sm" onClick={guardar} disabled={guardando}>
        <Check className="size-4" />
        {guardando ? "Guardando..." : "Guardar esta fila"}
      </Button>
    </div>
  );
}

function BloqueImportacion({
  numero,
  titulo,
  descripcion,
  columnas,
  advertencia,
  confirmar,
  nota,
  campos,
  onImportar,
  onCorregir,
}: {
  numero: number;
  titulo: string;
  descripcion: string;
  columnas: string;
  advertencia?: string;
  confirmar?: string;
  nota?: string;
  campos: Campo[];
  onImportar: (archivo: File) => Promise<ResultadoImportacion>;
  onCorregir?: (datos: Record<string, unknown>) => Promise<{ creado: boolean }>;
}) {
  const queryClient = useQueryClient();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resueltas, setResueltas] = useState(0);

  function elegirArchivo(elegido: File | null) {
    setResultado(null);
    setError(null);

    if (!elegido) {
      setArchivo(null);
      return;
    }
    if (!elegido.name.toLowerCase().endsWith(".xlsx")) {
      setArchivo(null);
      setError("El archivo debe ser un Excel en formato .xlsx.");
      return;
    }
    if (elegido.size > TAMANO_MAXIMO) {
      setArchivo(null);
      setError("El archivo es demasiado grande (máximo 5 MB).");
      return;
    }
    setArchivo(elegido);
  }

  async function importar() {
    if (!archivo) return;
    if (confirmar && !window.confirm(confirmar)) return;

    setCargando(true);
    setError(null);
    setResultado(null);
    setResueltas(0);

    try {
      const respuesta = await onImportar(archivo);
      setResultado(respuesta);
      // Las demás pantallas (productos, ventas, dashboard...) deben mostrar lo recién importado.
      void queryClient.invalidateQueries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo importar el archivo.");
    } finally {
      setCargando(false);
    }
  }

  function marcarResuelta(fila: number) {
    if (!resultado) return;
    setResultado({
      ...resultado,
      errores: resultado.errores.filter((e) => e.fila !== fila),
    });
    setResueltas((valor) => valor + 1);
    void queryClient.invalidateQueries();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {numero}
          </span>
          {titulo}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{descripcion}</p>

        <p className="flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-foreground">
          <FileSpreadsheet className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span>
            <span className="font-semibold">Columnas del Excel:</span> {columnas}
          </span>
        </p>

        {advertencia ? (
          <p className="flex items-start gap-2 rounded-lg border border-warning/70 bg-warning/30 px-3 py-2 text-sm font-medium text-warning-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            {advertencia}
          </p>
        ) : null}

        <div className="space-y-2">
          <input
            type="file"
            accept=".xlsx"
            disabled={cargando}
            onChange={(event) => elegirArchivo(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          {archivo ? (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{archivo.name}</span> ·{" "}
              {formatearTamano(archivo.size)}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Formato .xlsx, hasta 5 MB.</p>
          )}
        </div>

        <Button onClick={importar} disabled={!archivo || cargando}>
          <UploadCloud className="size-4" />
          {cargando ? "Importando..." : "Importar"}
        </Button>

        {cargando && nota ? <p className="text-xs text-muted-foreground">{nota}</p> : null}

        {error ? (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}

        {resultado ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Pastilla tono="exito">{formatCount(resultado.creados)} creados</Pastilla>
              <Pastilla tono="neutro">{formatCount(resultado.actualizados)} actualizados</Pastilla>
              {resultado.omitidas ? (
                <Pastilla tono="neutro">{formatCount(resultado.omitidas)} ya existían (omitidas)</Pastilla>
              ) : null}
              {resueltas > 0 ? (
                <Pastilla tono="exito">{formatCount(resueltas)} corregidas a mano</Pastilla>
              ) : null}
              {resultado.errores.length > 0 ? (
                <Pastilla tono="aviso">
                  {formatCount(resultado.errores.length)} con problemas
                </Pastilla>
              ) : null}
            </div>

            {resultado.errores.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">
                  {resultado.errores.length} fila{resultado.errores.length === 1 ? "" : "s"} con problemas —{" "}
                  {onCorregir
                    ? "completá lo que falte y guardá cada una:"
                    : "corregí el Excel y volvé a importarlo (lo ya cargado se omite):"}
                </p>
                {resultado.errores.map((fila) =>
                  onCorregir ? (
                    <FilaCorregible
                      key={fila.fila}
                      fila={fila}
                      campos={campos}
                      onCorregir={onCorregir}
                      onResuelta={() => marcarResuelta(fila.fila)}
                    />
                  ) : (
                    <p
                      key={fila.fila}
                      className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm"
                    >
                      <span className="font-medium">Fila {fila.fila}:</span> {fila.mensaje}
                    </p>
                  ),
                )}
              </div>
            ) : (
              <p className="text-sm font-medium text-success-foreground">
                Importación completa, sin problemas.
              </p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

const CAMPOS_PRECIO: Campo[] = [
  { clave: "codigo", etiqueta: "Código" },
  { clave: "descripcion", etiqueta: "Descripción" },
  { clave: "costo", etiqueta: "Costo" },
  { clave: "costo_extra", etiqueta: "Costo extra" },
  { clave: "proveedor", etiqueta: "Proveedor" },
];

const CAMPOS_STOCK: Campo[] = [
  { clave: "codigo", etiqueta: "Código" },
  { clave: "color", etiqueta: "Color" },
  { clave: "talle", etiqueta: "Talle" },
  { clave: "cantidad", etiqueta: "Cantidad" },
  { clave: "prenda", etiqueta: "Prenda (solo si es producto nuevo)" },
  { clave: "modelo", etiqueta: "Modelo (solo si es producto nuevo)" },
  { clave: "costo", etiqueta: "Costo (solo si es producto nuevo)" },
  { clave: "proveedor", etiqueta: "Proveedor (solo si es producto nuevo)" },
];

export function ImportarExcelPage() {
  return (
    <>
      <PageHeader
        title="Importar desde Excel"
        description="Cargá el catálogo, el stock y las ventas que ya tenés en Excel, en este orden: 1, 2 y 3."
      />

      <div className="space-y-6">
        <BloqueImportacion
          numero={1}
          titulo="Importar precios y proveedores"
          descripcion='Excel "precio para modificar": crea los productos nuevos (código, descripción, costo, proveedor). Hacelo primero, antes de importar el stock.'
          columnas="CODIGO, DESCRIPCION, COSTO, PROVEEDOR (opcional: COSTOS EXTRAS)"
          advertencia="Si un código ya existe, se actualizan su costo y su proveedor con los del Excel."
          campos={CAMPOS_PRECIO}
          onImportar={importarService.precios}
          onCorregir={importarService.corregirPrecio}
        />

        <BloqueImportacion
          numero={2}
          titulo="Importar stock"
          descripcion='Excel de stock (hoja "stock"): crea o actualiza las variantes (color, talle, cantidad). Si el código no existe todavía, al corregir esa fila podés completar prenda/costo/proveedor y se crea el producto nuevo ahí mismo.'
          columnas="CODIGO, COLOR, TALLE, CANTIDAD"
          advertencia="Reemplaza la cantidad actual de cada variante por la del Excel (no la suma) y no genera movimientos. Usalo para la carga inicial o para corregir el stock con un conteo."
          confirmar="Esto REEMPLAZA el stock actual de cada variante del Excel por la cantidad que figura en el archivo. No se puede deshacer. ¿Continuar?"
          campos={CAMPOS_STOCK}
          onImportar={importarService.stock}
          onCorregir={importarService.corregirStock}
        />

        <BloqueImportacion
          numero={3}
          titulo="Importar ventas anteriores"
          descripcion='Excel de ventas (hoja "VENTAS"): una fila por prenda vendida. Carga el historial sin tocar el stock actual. Hacelo después de importar precios y stock. Si volvés a importar el mismo archivo, las ventas ya cargadas se omiten.'
          columnas="VENTA, FECHA, MEDIO DE PAGO, CODIGO, COLOR, TALLE, CANTIDAD, PRECIO UNITARIO (si es transferencia: NOMBRE, APELLIDO, TELEFONO)"
          nota="Con muchas ventas puede tardar un minuto. No cierres esta pantalla."
          campos={[]}
          onImportar={importarService.ventas}
        />
      </div>
    </>
  );
}