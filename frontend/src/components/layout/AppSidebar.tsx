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
} from "lucide-react";

import { useAuth } from "../../auth/AuthProvider";
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
] as const;

export function AppSidebar() {
  const { logout, username } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <span className="font-display text-2xl text-sidebar-foreground">Indumentaria</span>
        <span className="text-xs text-muted-foreground">Gestión de ventas y stock</span>
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
                        `flex items-center gap-3 ${isActive ? "font-medium text-foreground" : ""}`
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
        {username ? <p className="px-1 text-xs text-muted-foreground">Sesión: {username}</p> : null}
        <SidebarMenuButton onClick={logout} className="text-muted-foreground">
          <LogOut className="size-4" />
          <span>Cerrar sesión</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
