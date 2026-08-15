from rest_framework.routers import DefaultRouter

from .views import (
    ProveedorViewSet,
    ProductoViewSet,
    VarianteProductoViewSet,
    MovimientoStockViewSet,
)


router = DefaultRouter()

router.register(
    "proveedores",
    ProveedorViewSet,
    basename="proveedor",
)

router.register(
    "productos",
    ProductoViewSet,
    basename="producto",
)

router.register(
    "variantes",
    VarianteProductoViewSet,
    basename="variante",
)

router.register(
    "movimientos-stock",
    MovimientoStockViewSet,
    basename="movimiento-stock",
)

urlpatterns = router.urls