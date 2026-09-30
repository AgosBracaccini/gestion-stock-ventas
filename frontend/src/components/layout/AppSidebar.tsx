import { NavLink } from "react-router-dom";
import {
  ArrowLeftRight,
  Boxes,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  Receipt,
  ShoppingBag,
  Truck,
  Package,
  FileSpreadsheet,
  Settings,
  Palette,
  Tag,
  Printer,
} from "lucide-react";

import { useAuth } from "../../auth/AuthProvider";
import { useTienda } from "../../tienda/TiendaProvider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/nueva-venta", label: "Nueva venta", icon: ShoppingBag },
  { to: "/productos", label: "Productos / Stock", icon: Boxes },
  { to: "/ingreso-mercaderia", label: "Ingreso de mercadería", icon: PackagePlus },
  { to: "/ventas", label: "Ventas", icon: Receipt },
  { to: "/movimientos", label: "Movimientos", icon: ArrowLeftRight },
  { to: "/proveedores", label: "Proveedores", icon: Truck },
  { to: "/cajas", label: "Cajas", icon: Package },
  { to: "/importar-excel", label: "Importar Excel", icon: FileSpreadsheet },
  {
    label: "Configuración de precios",
    to: "/configuracion-precios",
    icon: Settings,
  },
  {
    label: "Configuración de tienda",
    to: "/configuracion-tienda",
    icon: Palette,
  },
  {
    label: "Diseño de etiqueta",
    to: "/configuracion-etiqueta",
    icon: Tag,
  },
  {
    label: "Generar etiquetas",
    to: "/generar-etiquetas",
    icon: Printer,
  },
] as const;

export function AppSidebar() {
  const { logout, username } = useAuth();
  const { nombre } = useTienda();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <span className="font-display text-2xl text-sidebar-foreground">{nombre}</span>
        <span className="text-xs text-sidebar-foreground/70">Gestión de ventas y stock</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 ${isActive ? "font-medium text-sidebar-accent-foreground" : ""}`
                      }
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-2 px-3 py-4">
        {username ? <p className="px-1 text-xs text-sidebar-foreground/70">Sesión: {username}</p> : null}
        <SidebarMenuButton onClick={logout} className="text-sidebar-foreground/80">
          <LogOut className="size-4" />
          <span>Cerrar sesión</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}