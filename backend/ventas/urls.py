from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import VentaViewSet
from .views_importacion import importar_ventas


router = DefaultRouter()

router.register(
    "ventas",
    VentaViewSet,
    basename="venta",
)

urlpatterns = router.urls + [
    path("importar/ventas/", importar_ventas, name="importar-ventas"),
]