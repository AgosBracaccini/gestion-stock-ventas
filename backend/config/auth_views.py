from rest_framework.exceptions import Throttled
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView


class LoginView(TokenObtainPairView):
    """
    Inicio de sesión con límite de intentos por dirección IP, para dificultar
    que alguien pruebe contraseñas una tras otra (ver DEFAULT_THROTTLE_RATES
    en settings.py).
    """

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def throttled(self, request, wait):
        raise Throttled(
            wait=wait,
            detail="Demasiados intentos de inicio de sesión. Esperá unos segundos y probá de nuevo.",
        )