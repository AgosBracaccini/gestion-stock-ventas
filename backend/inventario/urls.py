from rest_framework.routers import DefaultRouter

from django.urls import path

from .views import (
    ProveedorViewSet,
    ProductoViewSet,
    VarianteProductoViewSet,
    MovimientoStockViewSet,
    ConfiguracionPreciosViewSet,
    ConfiguracionTiendaViewSet,
    ConfiguracionEtiquetaViewSet,
    CajaViewSet,
    importar_precios,
    importar_stock,
    corregir_precio,
    corregir_stock,
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

router.register(
    "cajas",
    CajaViewSet,
    basename="caja",
)

urlpatterns = router.urls + [
    path("importar/precios/", importar_precios, name="importar-precios"),
    path("importar/stock/", importar_stock, name="importar-stock"),
    path("importar/precios/fila/", corregir_precio, name="corregir-precio"),
    path("importar/stock/fila/", corregir_stock, name="corregir-stock"),
]