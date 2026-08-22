import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { AppSidebar } from "./components/layout/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Toaster } from "./components/ui/sonner";
import { ConfiguracionPreciosPage } from "./pages/ConfiguracionPreciosPage";
import { DashboardPage } from "./pages/DashboardPage";
import { IngresoMercaderiaPage } from "./pages/IngresoMercaderiaPage";
import { LoginPage } from "./pages/LoginPage";
import { MovimientosPage } from "./pages/MovimientosPage";
import { NuevaVentaPage } from "./pages/NuevaVentaPage";
import { ProductosPage } from "./pages/ProductosPage";
import { ProveedoresPage } from "./pages/ProveedoresPage";
import { VentasPage } from "./pages/VentasPage";

const queryClient = new QueryClient();

function RutaProtegida() {
  const { isAuthenticated, ready } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function LayoutAutenticado() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur">
            <SidebarTrigger />

            <span className="font-display text-lg text-foreground md:hidden">Indumentaria</span>
          </header>

          <main className="flex-1 px-4 py-8 md:px-8">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />

            <Route element={<RutaProtegida />}>
              <Route element={<LayoutAutenticado />}>
                <Route path="/dashboard" element={<DashboardPage />} />

                <Route path="/nueva-venta" element={<NuevaVentaPage />} />

                <Route path="/productos" element={<ProductosPage />} />

                <Route path="/ingreso-mercaderia" element={<IngresoMercaderiaPage />} />

                <Route path="/ventas" element={<VentasPage />} />

                <Route path="/movimientos" element={<MovimientosPage />} />

                <Route path="/proveedores" element={<ProveedoresPage />} />
                
                <Route path="/configuracion-precios" element={<ConfiguracionPreciosPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
