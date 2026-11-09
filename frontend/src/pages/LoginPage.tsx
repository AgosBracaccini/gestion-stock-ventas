import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { ApiError } from "../api/http";
import { ErrorMessage } from "../components/common/ErrorMessage";
import { useAuth } from "../auth/AuthProvider";
import { useTienda } from "../tienda/TiendaProvider";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

/** Traduce los errores del login a mensajes claros para quien usa el sistema. */
function mensajeDeLogin(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) {
      return "No se pudo conectar con el servidor. Verificá que la computadora del local esté encendida y que estés conectado a la misma red WiFi.";
    }
    if (error.status === 400 || error.status === 401) {
      return "Usuario o contraseña incorrectos.";
    }
    if (error.status === 429) {
      return "Demasiados intentos. Esperá un minuto antes de volver a intentar.";
    }
    if (error.status >= 500) {
      return "El servidor tuvo un problema. Intentá de nuevo en unos minutos.";
    }
    return "No se pudo iniciar sesión. Intentá de nuevo.";
  }

  return "No se pudo conectar con el servidor. Verificá que la computadora del local esté encendida y que estés conectado a la misma red WiFi.";
}

export function LoginPage() {
  const { login, isAuthenticated, ready } = useAuth();
  const { nombre } = useTienda();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) navigate("/dashboard", { replace: true });
  }, [ready, isAuthenticated, navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(new Error(mensajeDeLogin(err)));
      setPassword("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-brand-gradient flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-4xl text-foreground">{nombre}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestión de ventas, productos e inventario
          </p>
        </div>

        <form onSubmit={handleSubmit} className="surface-panel space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input
              id="username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input
                id="password"
                type={verPassword ? "text" : "password"}
                autoComplete="current-password"
                className="pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setVerPassword((v) => !v)}
                aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={verPassword}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
              >
                {verPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <ErrorMessage error={error} />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Ingresando…" : "Iniciar sesión"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Acceso solo para personal autorizado.
        </p>
      </div>
    </main>
  );
}