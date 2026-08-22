import { STOCK_BAJO_UMBRAL } from "../../api/config";
import { cn } from "../../lib/utils";

export type NivelStock = "sin-stock" | "bajo" | "normal";

export function nivelStock(stock: number): NivelStock {
  if (stock <= 0) return "sin-stock";
  if (stock <= STOCK_BAJO_UMBRAL) return "bajo";
  return "normal";
}

const styles: Record<NivelStock, string> = {
  "sin-stock": "bg-destructive/10 text-destructive border-destructive/20",
  bajo: "bg-warning/15 text-warning-foreground border-warning/30",
  normal: "bg-success/12 text-success-foreground border-success/25",
};

const labels: Record<NivelStock, string> = {
  "sin-stock": "Sin stock",
  bajo: "Stock bajo",
  normal: "Disponible",
};

export function StockBadge({ stock, showLabel = true }: { stock: number; showLabel?: boolean }) {
  const nivel = nivelStock(stock);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[nivel],
      )}
    >
      <span className="font-semibold">{stock}</span>
      {showLabel ? <span className="opacity-80">· {labels[nivel]}</span> : null}
    </span>
  );
}
