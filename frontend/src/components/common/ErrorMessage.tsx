import { AlertCircle } from "lucide-react";

import { ApiError } from "../../api/http";

export function messageFromError(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado.";
}

/** Muestra siempre el mensaje del backend, sin ocultarlo. */
export function ErrorMessage({ error }: { error: unknown }) {
  if (!error) return null;
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{messageFromError(error)}</span>
    </div>
  );
}
