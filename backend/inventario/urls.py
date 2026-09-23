from rest_framework.routers import DefaultRouter

from .views import (
    ProveedorViewSet,
    ProductoViewSet,
    VarianteProductoViewSet,
    MovimientoStockViewSet,
    ConfiguracionPreciosViewSet,
    ConfiguracionTiendaViewSet,
    ConfiguracionEtiquetaViewSet,
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

router.register(
    "configuracion-precios",
    ConfiguracionPreciosViewSet,
    basename="configuracion-precios",
)

router.register(
    "configuracion-tienda",
    ConfiguracionTiendaViewSet,
    basename="configuracion-tienda",
)

router.register(
    "configuracion-etiqueta",
    ConfiguracionEtiquetaViewSet,
    basename="configuracion-etiqueta",
)

urlpatterns = router.urls