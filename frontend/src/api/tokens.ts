/** Persistencia de la sesión JWT en el navegador. */

const ACCESS_KEY = "indumentaria.access";
const REFRESH_KEY = "indumentaria.refresh";
const USER_KEY = "indumentaria.username";

const canUseStorage = () => typeof window !== "undefined" && !!window.localStorage;

export interface StoredSession {
  access: string;
  refresh: string;
  username: string | null;
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function getStoredSession(): StoredSession | null {
  const access = getAccessToken();
  const refresh = getRefreshToken();
  if (!access || !refresh) return null;
  return { access, refresh, username: window.localStorage.getItem(USER_KEY) };
}

export function saveSession(session: {
  access: string;
  refresh: string;
  username?: string | null;
}) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ACCESS_KEY, session.access);
  window.localStorage.setItem(REFRESH_KEY, session.refresh);
  if (session.username) window.localStorage.setItem(USER_KEY, session.username);
}

export function saveAccessToken(access: string) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(ACCESS_KEY, access);
}

export function clearSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
}
