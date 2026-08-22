import { useNavigate } from "react-router-dom";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { authService } from "../api/services/auth.service";
import { setSessionExpiredHandler } from "../api/http";
import { clearSession, getStoredSession, saveSession } from "../api/tokens";

interface AuthContextValue {
  username: string | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getStoredSession();
    setIsAuthenticated(!!session);
    setUsername(session?.username ?? null);
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setIsAuthenticated(false);
    setUsername(null);
    navigate("/", { replace: true });
  }, [navigate]);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setIsAuthenticated(false);
      setUsername(null);
      navigate("/", { replace: true });
    });
    return () => setSessionExpiredHandler(null);
  }, [navigate]);

  const login = useCallback(async (user: string, password: string) => {
    const tokens = await authService.login(user, password);
    saveSession({ ...tokens, username: user });
    setUsername(user);
    setIsAuthenticated(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ username, isAuthenticated, ready, login, logout }),
    [username, isAuthenticated, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
}
