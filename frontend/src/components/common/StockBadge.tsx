import { STOCK_BAJO_UMBRAL } from "../../api/config";
import { cn } from "../../lib/utils";

export type NivelStock = "sin-stock" | "bajo" | "normal";

export function nivelStock(stock: number): NivelStock {
  if (stock <= 0) return "sin-stock";
  if (stock <= STOCK_BAJO_UMBRAL) return "bajo";
  return "normal";
}

const styles: Record<NivelStock, string> = {
  "sin-stock": "bg-destructive/20 text-destructive border-destructive/50",
  bajo: "bg-warning/45 text-warning-foreground border-warning/70",
  normal: "bg-success/30 text-success-foreground border-success/50",
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        styles[nivel],
      )}
    >
      <span className="font-semibold">{stock}</span>
      {showLabel ? <span className="opacity-80">· {labels[nivel]}</span> : null}
    </span>
  );
}
