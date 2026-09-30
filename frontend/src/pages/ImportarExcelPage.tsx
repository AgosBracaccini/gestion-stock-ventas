import { useState } from "react";
import { UploadCloud, Check } from "lucide-react";

import { importarService, type FilaConError, type ResultadoImportacion } from "../api/services/importar.service";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface Campo {
  clave: string;
  etiqueta: string;
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
  titulo,
  descripcion,
  campos,
  onImportar,
  onCorregir,
}: {
  titulo: string;
  descripcion: string;
  campos: Campo[];
  onImportar: (archivo: File) => Promise<ResultadoImportacion>;
  onCorregir: (datos: Record<string, unknown>) => Promise<{ creado: boolean }>;
}) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resueltas, setResueltas] = useState(0);

  async function importar() {
    if (!archivo) return;

    setCargando(true);
    setError(null);
    setResultado(null);
    setResueltas(0);

    try {
      const respuesta = await onImportar(archivo);
      setResultado(respuesta);
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
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{descripcion}</p>

        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(event) => setArchivo(event.target.files?.[0] ?? null)}
          className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
        />

        <Button onClick={importar} disabled={!archivo || cargando}>
          <UploadCloud className="size-4" />
          {cargando ? "Importando..." : "Importar"}
        </Button>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {resultado ? (
          <div className="space-y-3">
            <p className="text-sm">
              <span className="font-medium">{resultado.creados}</span> creados ·{" "}
              <span className="font-medium">{resultado.actualizados}</span> actualizados
              {resueltas > 0 ? (
                <>
                  {" "}
                  · <span className="font-medium">{resueltas}</span> corregidas a mano
                </>
              ) : null}
            </p>

            {resultado.errores.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">
                  {resultado.errores.length} fila{resultado.errores.length === 1 ? "" : "s"} con problemas —
                  completá lo que falte y guardá cada una:
                </p>
                {resultado.errores.map((fila) => (
                  <FilaCorregible
                    key={fila.fila}
                    fila={fila}
                    campos={campos}
                    onCorregir={onCorregir}
                    onResuelta={() => marcarResuelta(fila.fila)}
                  />
                ))}
              </div>
            ) : null}
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
        description="Cargá el catálogo y el stock existentes desde los excels que ya usás, sin tener que tipearlo todo a mano."
      />

      <div className="space-y-6">
        <BloqueImportacion
          titulo="1. Importar precios y proveedores"
          descripcion='Excel "precio para modificar": crea o actualiza productos (código, descripción, costo, proveedor). Hacelo primero, antes de importar el stock.'
          campos={CAMPOS_PRECIO}
          onImportar={importarService.precios}
          onCorregir={importarService.corregirPrecio}
        />

        <BloqueImportacion
          titulo="2. Importar stock"
          descripcion='Excel de stock (hoja "stock"): crea o actualiza las variantes (color, talle, cantidad). Si el código no existe todavía, al corregir esa fila podés completar prenda/costo/proveedor y se crea el producto nuevo ahí mismo.'
          campos={CAMPOS_STOCK}
          onImportar={importarService.stock}
          onCorregir={importarService.corregirStock}
        />
      </div>
    </>
  );
}