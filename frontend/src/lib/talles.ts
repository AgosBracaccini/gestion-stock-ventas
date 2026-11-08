const ORDEN_LETRAS = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

/** Talles numéricos primero (38, 40…), después los de letras (S, M, L…) en su orden natural. */
function claveTalle(talle: string): [number, number] {
  const t = talle.trim().toUpperCase();
  const indice = ORDEN_LETRAS.indexOf(t);
  if (indice >= 0) return [1, indice];

  const numero = parseFloat(t.replace(/^T/, ""));
  if (!Number.isNaN(numero)) return [0, numero];

  return [2, 0];
}

/** Ordena variantes por color y, dentro de cada color, por talle. */
export function ordenarVariantes<T extends { color: string; talle: string }>(variantes: T[]): T[] {
  return [...variantes].sort((a, b) => {
    const porColor = a.color.localeCompare(b.color, "es");
    if (porColor !== 0) return porColor;

    const [grupoA, valorA] = claveTalle(a.talle);
    const [grupoB, valorB] = claveTalle(b.talle);
    return grupoA - grupoB || valorA - valorB || a.talle.localeCompare(b.talle, "es");
  });
}