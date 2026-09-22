import type { ColorTienda, IntensidadColor } from "../api/types";

/**
 * Paleta de colores para personalizar la tienda.
 *
 * Cada color se define por su "hue" (matiz, 0-360 en oklch). La
 * intensidad (suave/medio/fuerte) es un multiplicador que se aplica
 * sobre el chroma (saturación) base de ese color, así que ambos ejes
 * -color e intensidad- son independientes entre sí.
 *
 * Todas las superficies (fondo, sidebar, header, bordes) se calculan a
 * partir del mismo hue con distintos "pesos" de chroma, guardando
 * siempre la misma relación entre ellas: el header queda un escalón más
 * saturado que el sidebar, que a su vez es más saturado que el fondo
 * general — así se nota una jerarquía visual prolija sea cual sea el
 * color o la intensidad elegida.
 */
interface DefinicionColor {
  label: string;
  hue: number;
  chromaBase: number;
}

const DEFINICIONES: Record<ColorTienda, DefinicionColor> = {
  rosa: { label: "Rosa", hue: 5, chromaBase: 0.11 },
  celeste: { label: "Celeste", hue: 250, chromaBase: 0.1 },
  verde: { label: "Verde", hue: 160, chromaBase: 0.12 },
  violeta: { label: "Violeta", hue: 300, chromaBase: 0.14 },
  mostaza: { label: "Mostaza", hue: 80, chromaBase: 0.13 },
  gris: { label: "Gris", hue: 300, chromaBase: 0.015 },
};

const MULTIPLICADOR_INTENSIDAD: Record<IntensidadColor, number> = {
  suave: 0.55,
  medio: 1,
  fuerte: 1.5,
};

export const INTENSIDADES: { clave: IntensidadColor; label: string }[] = [
  { clave: "suave", label: "Suave" },
  { clave: "medio", label: "Medio" },
  { clave: "fuerte", label: "Fuerte" },
];

export interface PaletaColor {
  label: string;
  swatch: string;
}

// Pesos relativos de cada superficie respecto al chroma del color
// (de más sutil a más marcado). El header siempre pesa más que el
// sidebar, que a su vez pesa más que el fondo general.
const PESO_FONDO = 0.05;
const PESO_SIDEBAR = 0.16;
const PESO_HEADER = 0.26;
const PESO_ACENTO = 0.34;
const PESO_BORDE = 0.22;

function oklch(l: number, c: number, h: number) {
  return `oklch(${l} ${Math.max(c, 0)} ${h})`;
}

/** Vista previa del color (para el swatch del selector), sin depender de intensidad. */
export const PALETA_TIENDA: Record<ColorTienda, PaletaColor> = Object.fromEntries(
  (Object.entries(DEFINICIONES) as [ColorTienda, DefinicionColor][]).map(([clave, def]) => [
    clave,
    { label: def.label, swatch: oklch(0.78, def.chromaBase, def.hue) },
  ]),
) as Record<ColorTienda, PaletaColor>;

function construirVariables(color: ColorTienda, intensidad: IntensidadColor): Record<string, string> {
  const definicion = DEFINICIONES[color] ?? DEFINICIONES.rosa;
  const chroma = definicion.chromaBase * (MULTIPLICADOR_INTENSIDAD[intensidad] ?? 1);
  const hue = definicion.hue;

  return {
    // Botones, focus ring
    "--primary": oklch(0.8, chroma, hue),
    "--primary-foreground": oklch(0.26, chroma * 0.45, hue),
    "--ring": oklch(0.76, chroma, hue),
    "--sidebar-primary": oklch(0.8, chroma, hue),
    "--sidebar-primary-foreground": oklch(0.26, chroma * 0.45, hue),
    "--sidebar-ring": oklch(0.76, chroma, hue),

    // Fondo general de la app: el más sutil de todos
    "--background": oklch(0.99, chroma * PESO_FONDO, hue),

    // Menú lateral: fondo sólido y saturado (mismo color que los
    // botones), con texto claro para mantener buen contraste.
    "--sidebar": oklch(0.56, chroma * 1.1, hue),
    "--sidebar-foreground": oklch(0.97, chroma * 0.08, hue),
    "--sidebar-accent": oklch(0.64, chroma * 1.05, hue),
    "--sidebar-accent-foreground": oklch(0.98, chroma * 0.05, hue),
    "--sidebar-border": oklch(0.46, chroma * 0.9, hue),

    // Franja superior (header): siempre un escalón más fuerte que el sidebar
    "--header": oklch(0.95, chroma * PESO_HEADER, hue),

    // Tarjetas, bordes
    "--secondary": oklch(0.95, chroma * PESO_SIDEBAR, hue),
    "--secondary-foreground": oklch(0.36, chroma * 0.4, hue),
    "--accent": oklch(0.91, chroma * PESO_ACENTO, hue),
    "--accent-foreground": oklch(0.32, chroma * 0.5, hue),
    "--border": oklch(0.88, chroma * PESO_BORDE, hue),
    "--input": oklch(0.88, chroma * PESO_BORDE, hue),
  };
}

/** Aplica color + intensidad como variables CSS en tiempo de ejecución. */
export function aplicarColorTienda(color: ColorTienda, intensidad: IntensidadColor = "medio") {
  const vars = construirVariables(color, intensidad);
  const root = document.documentElement;
  for (const [variable, valor] of Object.entries(vars)) {
    root.style.setProperty(variable, valor);
  }
}