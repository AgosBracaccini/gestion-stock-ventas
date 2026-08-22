import { Info } from "lucide-react";

import { USE_MOCKS } from "../../api/config";

/**
 * Aviso visible cuando la pantalla está mostrando datos simulados de diseño.
 * Desaparece automáticamente con VITE_USE_MOCKS=false.
 */
export function MockDataNotice({ children }: { children?: string }) {
  if (!USE_MOCKS) return null;
  return (
    <div className="mb-6 flex items-start gap-2 rounded-xl border border-info/30 bg-info/10 px-4 py-3 text-sm text-info-foreground">
      <Info className="mt-0.5 size-4 shrink-0" />
      <span>
        {children ??
          "Datos simulados de diseño (placeholder). Configurá VITE_API_URL y VITE_USE_MOCKS=false para consumir la API de Django."}
      </span>
    </div>
  );
}
