import { API_URL, ENDPOINTS } from "./config";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveAccessToken,
} from "./tokens";

/** Error normalizado de la API. Nunca oculta el mensaje del backend. */
export class ApiError extends Error {
  status: number;
  data: unknown;
  fieldErrors: Record<string, string[]>;

  constructor(status: number, message: string, data: unknown, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.fieldErrors = fieldErrors;
  }
}

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler | null = null;

/** El AuthProvider registra acá la redirección al login. */
export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  onSessionExpired = handler;
}

function extractMessage(data: unknown, status: number): { message: string; fieldErrors: Record<string, string[]> } {
  const fieldErrors: Record<string, string[]> = {};

  if (typeof data === "string" && data.trim()) return { message: data, fieldErrors };

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const primary = obj["detail"] ?? obj["error"] ?? obj["message"];
    const messages: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const list = Array.isArray(value) ? value.map(String) : [String(value)];
      if (key !== "detail" && key !== "error" && key !== "message") fieldErrors[key] = list;
      messages.push(...list);
    }

    if (typeof primary === "string" && primary.trim()) return { message: primary, fieldErrors };
    if (messages.length) return { message: messages.join(" "), fieldErrors };
  }

  const fallback: Record<number, string> = {
    400: "La solicitud no es válida.",
    401: "Tu sesión expiró. Iniciá sesión nuevamente.",
    403: "No tenés permisos para realizar esta acción.",
    404: "No se encontró el recurso solicitado.",
    500: "Error interno del servidor.",
  };
  return { message: fallback[status] ?? `Error de comunicación con el servidor (${status}).`, fieldErrors };
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await fetch(`${API_URL}${ENDPOINTS.tokenRefresh}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });
        if (!response.ok) return null;
        const data = (await response.json()) as { access?: string };
        if (!data.access) return null;
        saveAccessToken(data.access);
        return data.access;
      } catch {
        return null;
      } finally {
        setTimeout(() => {
          refreshPromise = null;
        }, 0);
      }
    })();
  }

  return refreshPromise;
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Endpoints públicos (login / refresh) no adjuntan el access token. */
  skipAuth?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/** Cliente HTTP único: baseURL, JWT, refresh automático y errores normalizados. */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, skipAuth = false, signal } = options;

  const send = async (token: string | null) => {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const init: RequestInit = { method, headers };
    if (body !== undefined) init.body = JSON.stringify(body);
    if (signal) init.signal = signal;

    return fetch(buildUrl(path, query), init);
  };

  let response: Response;
  try {
    response = await send(skipAuth ? null : getAccessToken());
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    throw new ApiError(0, "No se pudo conectar con el servidor. Verificá que la API esté disponible.", null);
  }

  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await send(newToken);
    } else {
      clearSession();
      onSessionExpired?.();
      throw new ApiError(401, "Tu sesión expiró. Iniciá sesión nuevamente.", null);
    }
  }

  const data = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      onSessionExpired?.();
    }
    const { message, fieldErrors } = extractMessage(data, response.status);
    throw new ApiError(response.status, message, data, fieldErrors);
  }

  return data as T;
}

/** Normaliza respuestas paginadas o listas simples de DRF. */
export function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}
