import type { EstiloEtiqueta, FormaEtiqueta, FuenteEtiqueta } from "../api/types";

/**
 * Este módulo centraliza cómo se ve una etiqueta (forma + estilo + fuente),
 * para que tanto la vista previa del diseñador como la hoja de impresión
 * real (generador por lote) rendericen exactamente lo mismo.
 */

export const FUENTES: { clave: FuenteEtiqueta; label: string; cssFontFamily: string }[] = [
  { clave: "georgia", label: "Georgia", cssFontFamily: "Georgia, 'Times New Roman', serif" },
  { clave: "times", label: "Times New Roman", cssFontFamily: "'Times New Roman', Times, serif" },
  { clave: "arial", label: "Arial", cssFontFamily: "Arial, Helvetica, sans-serif" },
  { clave: "verdana", label: "Verdana", cssFontFamily: "Verdana, Geneva, sans-serif" },
  { clave: "courier", label: "Courier New", cssFontFamily: "'Courier New', Courier, monospace" },
  { clave: "trebuchet", label: "Trebuchet MS", cssFontFamily: "'Trebuchet MS', sans-serif" },
];

export function fontFamilyDe(fuente: FuenteEtiqueta): string {
  return FUENTES.find((f) => f.clave === fuente)?.cssFontFamily ?? FUENTES[2].cssFontFamily;
}

export const ESTILOS: { clave: EstiloEtiqueta; label: string }[] = [
  { clave: "simple", label: "Simple" },
  { clave: "con_borde", label: "Con borde" },
  { clave: "bordes_suaves", label: "Bordes suaves" },
  { clave: "relleno_solido", label: "Relleno sólido" },
  { clave: "marco_doble", label: "Marco doble" },
];

/** Border-radius de la etiqueta exterior, según forma + estilo. */
export function radioEtiqueta(forma: FormaEtiqueta, estilo: EstiloEtiqueta): string {
  if (forma === "circular") return "9999px";
  if (estilo === "bordes_suaves") return "18px";
  if (forma === "cuadrada") return "6px";
  return "8px";
}

/** Borde CSS de la etiqueta exterior, según estilo. */
export function bordeEtiqueta(estilo: EstiloEtiqueta, colorTexto: string): string {
  switch (estilo) {
    case "con_borde":
      return `1.5px solid ${colorTexto}`;
    case "marco_doble":
      return `3px double ${colorTexto}`;
    case "bordes_suaves":
      return `1px solid ${colorTexto}33`;
    default:
      return "1px solid rgba(0,0,0,0.12)";
  }
}

/** Border-radius de los recuadros internos (código/talle), según estilo. */
export function radioRecuadro(estilo: EstiloEtiqueta): string {
  return estilo === "bordes_suaves" ? "10px" : "4px";
}

/** Borde de los recuadros internos, según estilo. */
export function bordeRecuadro(estilo: EstiloEtiqueta, colorTexto: string): string {
  if (estilo === "relleno_solido" || estilo === "simple") return "none";
  return `1px solid ${colorTexto}55`;
}