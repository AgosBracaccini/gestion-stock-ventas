import { createContext, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { configuracionTiendaService } from "../api/services/configuracion.service";
import { aplicarColorTienda } from "../lib/paleta-tienda";

const NOMBRE_POR_DEFECTO = "Mi Tienda";

interface TiendaContextValue {
  nombre: string;
  isLoading: boolean;
}

const TiendaContext = createContext<TiendaContextValue>({
  nombre: NOMBRE_POR_DEFECTO,
  isLoading: false,
});

/**
 * Carga ConfiguracionTienda apenas arranca la app (el endpoint de lectura
 * es público, como el cartel de un local) y expone el nombre/color a
 * cualquier pantalla, login incluido.
 */
export function TiendaProvider({ children }: { children: ReactNode }) {
  const { data: configuracion, isLoading } = useQuery({
    queryKey: ["configuracion-tienda"],
    queryFn: () => configuracionTiendaService.obtener(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (configuracion) {
      aplicarColorTienda(configuracion.color, configuracion.intensidad);
    }
  }, [configuracion]);

  const value = useMemo<TiendaContextValue>(
    () => ({
      nombre: configuracion?.nombre ?? NOMBRE_POR_DEFECTO,
      isLoading,
    }),
    [configuracion, isLoading],
  );

  return <TiendaContext.Provider value={value}>{children}</TiendaContext.Provider>;
}

export function useTienda() {
  return useContext(TiendaContext);
}

/** Refresca la config de tienda en cualquier componente (tras guardar cambios). */
export function useInvalidarTienda() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["configuracion-tienda"] });
}