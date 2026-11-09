from django.conf import settings
from django.contrib import admin
from django.http import HttpResponse, HttpResponseNotFound
from django.urls import include, path, re_path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import TokenRefreshView

from .auth_views import LoginView


def frontend(request, ruta=""):
    """Entrega la aplicación compilada (frontend/dist) para cualquier ruta que
    no sea de la API. React se encarga de mostrar la pantalla que corresponda."""
    index = settings.FRONTEND_DIST / "index.html"
    if not index.is_file():
        return HttpResponseNotFound(
            "El frontend no está compilado. Ejecutar 'npm run build' en la carpeta frontend."
        )
    return HttpResponse(index.read_text(encoding="utf-8"), content_type="text/html")


urlpatterns = [
    path("admin/", admin.site.urls),
    path(
    "api/token/",
    LoginView.as_view(),
    name="token_obtain_pair",
    ),
    path(
    "api/token/refresh/",
    TokenRefreshView.as_view(),
    name="token_refresh",
    ),
    
    path(
        "api/",
        include("inventario.urls")
    ),

    path(
        "api/",
        include("ventas.urls")
    ),

    path(
        "api/schema/",
        SpectacularAPIView.as_view(),
        name="schema",
    ),

    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(
            url_name="schema"
        ),
        name="swagger-ui",
    ),

    # Debe ir al final: cualquier otra dirección la resuelve el frontend.
    re_path(r"^(?!api/|admin/|static/).*$", frontend),
]