import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  PackagePlus,
  PackageX,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { PageHeader } from "../components/layout/PageHeader";
import { productosService } from "../api/services/productos.service";
import { ventasService } from "../api/services/ventas.service";
import { formatMoney } from "../lib/format";
import { nivelStock } from "../components/common/StockBadge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";

const accesos = [
  { to: "/nueva-venta", label: "Nueva venta", icon: ShoppingBag },
  { to: "/ingreso-mercaderia", label: "Ingresar mercadería", icon: PackagePlus },
  { to: "/productos", label: "Productos", icon: Boxes },
  { to: "/productos", label: "Stock", icon: AlertTriangle },
] as const;

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string;
  hint: string;
  icon: typeof TrendingUp;
  loading?: boolean;
}) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <span className="grid size-9 place-items-center rounded-full bg-accent text-accent-foreground">
          <Icon className="size-4" />
        </span>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <p className="font-display text-3xl text-foreground">{value}</p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { data: filas, isLoading } = useQuery({
    queryKey: ["stock-rows"],
    queryFn: () => productosService.stockRows(),
  });

  const { data: resumen, isLoading: cargandoResumen } = useQuery({
    queryKey: ["dashboard-resumen"],
    queryFn: () => ventasService.resumen(),
  });

  const stockBajo = (filas ?? []).filter((f) => nivelStock(f.stock_actual) === "bajo").length;
  const sinStock = (filas ?? []).filter((f) => nivelStock(f.stock_actual) === "sin-stock").length;

  return (
    <>
      <PageHeader title="Dashboard" description="Resumen de la operación diaria de la tienda." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Ventas de hoy"
          value={formatMoney(Number(resumen?.total_hoy ?? 0))}
          hint={`${resumen?.ventas_hoy ?? 0} operaciones`}
          icon={ShoppingBag}
          loading={cargandoResumen}
        />

        <StatCard
          title="Ventas del mes"
          value={formatMoney(Number(resumen?.total_mes ?? 0))}
          hint={`${resumen?.ventas_mes ?? 0} operaciones`}
          icon={TrendingUp}
          loading={cargandoResumen}
        />
        <StatCard
          title="Stock bajo"
          value={String(stockBajo)}
          hint="Variantes con 3 unidades o menos"
          icon={AlertTriangle}
          loading={isLoading}
        />
        <StatCard
          title="Sin stock"
          value={String(sinStock)}
          hint="Variantes en cero"
          icon={PackageX}
          loading={isLoading}
        />
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Accesos rápidos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {accesos.map((acceso) => (
            <Button
              key={acceso.label}
              asChild
              variant="outline"
              className="h-auto justify-between border-border/70 bg-card px-4 py-4 hover:bg-accent"
            >
              <Link to={acceso.to}>
                <span className="flex items-center gap-3">
                  <acceso.icon className="size-4 text-muted-foreground" />
                  {acceso.label}
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            </Button>
          ))}
        </div>
      </section>
    </>
  );
}
